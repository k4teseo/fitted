import { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/searchbar";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "../hook/useCurrentUser";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SearchResult = {
  id: string;
  username: string;
  caption: string;
  image_path: string;
  selectedoccasions: string[];
};

type UserResult = {
  id: string;
  username: string;
  avatar: string;
  status: string | null;
};

export default function SearchResultsPage() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [activeTab, setActiveTab] = useState<"Posts" | "Users">("Posts");
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultPfp =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

  const currentUserId = useCurrentUser();

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      const lowerQuery = searchQuery.toLowerCase().trim();
      console.log("Searching for:", lowerQuery);

      const jsonArray = JSON.stringify([lowerQuery]);
      const pgArray = `{${lowerQuery}}`;

      try {
        const { data, error } = await supabase
          .from("images")
          .select("*")
          .or(
            `selectedbrands_lower.cs.${jsonArray},selectedoccasions_lower.cs.${jsonArray},metadata.cs.${pgArray}`
          );

        if (error) {
          console.error("Supabase error:", error);
        } else {
          setSearchResults(data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = (text?: string) => {
    const searchTerm = text || searchQuery.trim();
    if (searchTerm) {
      setSearchQuery(searchTerm);
    }
    Keyboard.dismiss();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setUserResults([]);
        return;
      }
      try {
        const { data: users, error } = await supabase
          .from("profiles")
          .select("id, username, pfp")
          .ilike("username", `%${searchQuery}%`);

        if (error) {
          console.error("Error fetching users:", error);
          return;
        }
        if (error) {
          console.error("Error fetching users:", error);
          return;
        }

      if (!users || !currentUserId) return;

      const filteredUsers = users.filter((user) => user.id !== currentUserId);
      const userIds = filteredUsers.map((user) => user.id);

      if (userIds?.length === 0) {
        setUserResults([]);
        return;
      }
      const { data: friendship, error: friendshipError } = await supabase
        .from("friends")
        .select("user_id_1, user_id_2, status")
        .or(
          userIds
            .map(
              (id) =>
                `and(user_id_1.eq.${id},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${id})`
            )
            .join(",")
        );
      if (friendshipError) {
        console.error("Error fetching friendship:", friendshipError);
      }
      const mappedUsers = filteredUsers?.map((user) => {
        const relation = friendship?.find(
          (friend: any) =>
            (friend.user_id_1 === user.id &&
              friend.user_id_2 === currentUserId) ||
            (friend.user_id_1 === currentUserId && friend.user_id_2 === user.id)
        );
        const status = relation
          ? relation.status === "accepted"
            ? "Friends"
            : relation.status === "pending"
            ? "Pending"
            : "none"
          : "none";
        return {
          id: user.id,
          username: user.username,
          avatar: user.pfp || defaultPfp,
          status,
        };
      });
      setUserResults(mappedUsers);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
    }
  };

  const debounceTimer = setTimeout(fetchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUserId]);

  const handleBackPress = async () => {
    await AsyncStorage.setItem("shouldClearSearch", "true");
    setSearchQuery("");
    router.back();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handlePostPress = (postId: string) => {
    router.push({
      pathname: "./PostPage",
      params: { id: postId },
    });
  };

  const handleAddFriend = async (userId: string) => {
    
    // Get current user ID
    const { data: user } = await supabase.auth.getUser();
    const currentUserId = user.user?.id;

    // Check if a friend request already exists
    const { data: existingRequest, error: existingRequestError } =
      await supabase
        .from("friends")
        .select("id, status")
        .or(
          `and(user_id_1.eq.${userId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${userId})`
        );

    if (existingRequestError) {
      console.error(
        "Error checking existing friend request:",
        existingRequestError
      );
      return;
    }
    if (existingRequest && existingRequest.length > 0) {
      const requestStatus = existingRequest[0];
      if (requestStatus.status === "rejected") {
        await supabase.from("friends").delete().eq("id", requestStatus.id);
      } else {
        console.log("Friend request already exists:", requestStatus);
        return;
      }
    }
    // Send a new friend request
    const { data, error: checkError } = await supabase.from("friends").insert([
      {
        user_id_1: userId,
        user_id_2: currentUserId, // Replace with actual current user ID
        status: "pending",
      },
    ]);
    if (checkError) {
      console.error("Error checking existing friend request:", checkError);
    } else {
      console.log("Friend request sent:", data);
      setUserResults((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: "Pending" } : user
        )
      );
    }
  };

  const handleCancelFriendRequest = async (userId: string) => {
    // Get current user ID
    const { data: user } = await supabase.auth.getUser();
    const currentUserId = user.user?.id;
    // Delete the friend request
    const { data, error } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id_1.eq.${userId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${userId})`
      );
    if (error) {
      console.error("Error deleting friend request:", error);
    } else {
      console.log("Friend request deleted:", data);
      setUserResults((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: "none" } : user
        )
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#15181B",
    },
    feedHeader: {
      backgroundColor: "#2D3338",
      width: "100%",
      height: height * 0.14,
      paddingVertical: height * 0.02,
      paddingLeft: width * 0.06,
      paddingRight: width * 0.04,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      position: "absolute",
      zIndex: 10,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    backButton: {
      marginTop: 15,
    },
    searchWrapper: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: height * 0.14,
      paddingHorizontal: 10,
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 20,
      borderBottomColor: "#2D3338",
      paddingHorizontal: 10,
    },
    tab: {
      paddingBottom: 10,
      marginHorizontal: 25, // Equal horizontal margin for both tabs
      alignItems: "center",
    },
    activeTab: {
      borderBottomWidth: 3,
      borderBottomColor: "#60A5FA",
      width: "100%",
      position: "absolute",
      bottom: -1, // Align with the border
    },
    tabText: {
      fontSize: 14,
      color: "#F5EEE3",
    },
    activeTabText: {
      color: "#60A5FA", // Blue color when active
    },
    tabWrapper: {
      position: "relative",
    },
    gridItem: {
      flex: 1,
      backgroundColor: "#2D3338",
      borderRadius: 13,
      margin: 8,
      overflow: "hidden",
    },
    postUserRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    avatarSmall: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 8,
    },
    imagePlaceholder: {
      height: 200,
      width: 174,
      backgroundColor: "#444",
    },
    gridContent: {
      padding: 10,
    },
    // Post username style (smaller)
    postusername: {
      color: "#B9C7D5",
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 5,
    },
    // User tab username style (larger)
    userUsername: {
      color: "#9DACBB",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 10,
    },
    caption: {
      color: "#F5EEE3",
      fontSize: 14,
      marginTop: 2,
      marginLeft: 5,
    },
    tag: {
      marginTop: 8,
      backgroundColor: "#98A7B7",
      alignSelf: "flex-start",
      color: "#262A2F",
      fontSize: 9,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 3,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 8,
      paddingHorizontal: 6,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 30,
      backgroundColor: "#60A5FA",
    },
    addText: {
      color: "#141618",
      fontSize: 11,
      fontWeight: "600",
    },
    removeIcon: {
      marginLeft: 8,
    },
    // add: {
    //   backgroundColor: "#60A5FA",
    // },
    friends: {
      borderWidth: 1,
      borderColor: "#F5EEE3",
    },
    friendsText: {
      borderColor: "#F5EEE3",
    },
    pending: {
      backgroundColor: "#3A3F45",
    },
    pendingText: {
      color: "#F5EEE3",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 100,
    },
    emptyText: {
      color: "#7F8D9A",
      fontSize: 16,
    },
  });

  const renderPostItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handlePostPress(item.id)}
    >
      <Image
        source={{
          uri: `https://fmwseavpzhcsksgagmnn.supabase.co/storage/v1/object/public/images/${item.image_path}`,
        }}
        style={styles.imagePlaceholder}
        resizeMode="cover"
      />
      <View style={styles.gridContent}>
        <View style={styles.postUserRow}>
          <Image
            source={{
              uri:
                userResults.find((u) => u.username === item.username)?.avatar ||
                defaultPfp,
            }}
            style={styles.avatarSmall}
          />
          <Text style={styles.postusername}>{item.username}</Text>
        </View>
        <Text style={styles.caption} numberOfLines={1}>
          {item.caption}
        </Text>
        {item.selectedoccasions?.length > 0 && (
          <Text style={styles.tag}>{item.selectedoccasions[0]}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }: { item: UserResult }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.userUsername}>{item.username}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          disabled={item.status === "Friends"}
          style={[
            styles.addButton,
            item.status === "Friends" && styles.friends,
            item.status === "Pending" && styles.pending,
          ]}
          onPress={() => {
            if (item.status === "Pending") {
              handleCancelFriendRequest(item.id);
            } else {
              handleAddFriend(item.id);
            }
          }}
        >
          <Text
            style={[
              styles.addText,
              item.status === "Friends" && styles.friendsText,
              item.status === "Pending" && styles.pendingText,
            ]}
          >
            {item.status === "Friends"
              ? "Friends"
              : item.status === "Pending"
              ? "Pending"
              : "Add Friend"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeIcon}>
          <MaterialIcons name="close" size={20} color="#747E89" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {loading ? "Searching..." : "No results found"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.feedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={handleSubmit}
              onClear={handleClearSearch}
            />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          {["Posts", "Users"].map((tab) => (
            <View key={tab} style={styles.tabWrapper}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab(tab as "Posts" | "Users")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
              {activeTab === tab && <View style={styles.activeTab} />}
            </View>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>Searching...</Text>
          </View>
        ) : (
          <>
            {activeTab === "Posts" &&
              (searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderPostItem}
                />
              ) : (
                renderEmptyState()
              ))}

            {activeTab === "Users" &&
              (userResults.length > 0 ? (
                <FlatList
                  data={userResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderUserItem}
                />
              ) : (
                renderEmptyState()
              ))}
          </>
        )}
      </View>
    </View>
  );
}