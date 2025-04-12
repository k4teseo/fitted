import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../components/searchbar";
import { supabase } from "@/lib/supabase";

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
  isFollowing: boolean;
};

export default function SearchResultsPage() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [activeTab, setActiveTab] = useState<"Posts" | "Users">("Posts");
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const lowerQuery = searchQuery.toLowerCase().trim();
      console.log("Searching for:", lowerQuery);

      const jsonArray = JSON.stringify([lowerQuery]); // ["silver necklace"]
      const pgArray = `{${lowerQuery}}`;

      const { data, error } = await supabase
        .from("images")
        .select("*")
        .or(
          `selectedbrands_lower.cs.${jsonArray},selectedoccasions_lower.cs.${jsonArray},metadata.cs.${pgArray}`
        );

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setSearchResults(data);
        console.log("Search results:", data);
      }
    };

    if (searchQuery.trim() !== "") {
      fetchResults();
    }
  }, [searchQuery]);

  const handleSubmit = () => {
    const cleaned = searchQuery.trim();
    if (cleaned !== "") {
      setSearchQuery(cleaned); // force re-trigger if needed
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, pfp")
        .ilike("username", `%${searchQuery}%`);

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const mappedUsers = data.map((user: any) => ({
          id: user.id,
          username: user.username,
          avatar: `${user.pfp}`,
          isFollowing: false,
        }));
        setUserResults(mappedUsers);
      }
    };
    fetchUsers();
  }, [searchQuery]);

  const handlePostPress = (postId: string) => {
    router.push({
      pathname: "./PostPage",
      params: { id: postId },
    });
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
    },
    addText: {
      color: "#141618",
      fontSize: 11,
      fontWeight: "600"
    },
    removeIcon: {
      marginLeft: 8,
    },
    add: {
      backgroundColor: "#60A5FA",
    },
    friends: {
      borderWidth: 1,
      borderColor: "#F5EEE3",
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.feedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={handleSubmit}
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
                    activeTab === tab && styles.activeTabText
                  ]}
                >
                  {tab}
                </Text>
            </TouchableOpacity>
            {activeTab === tab && <View style={styles.activeTab} />}
            </View>
          ))}
        </View>

        {/* Posts View */}
        {activeTab === "Posts" && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
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
                        uri: userResults.find(
                          (u) => u.username === item.username
                        )?.avatar,
                      }}
                      style={styles.avatarSmall}
                    />
                    <Text style={styles.postusername}>{item.username}</Text>
                  </View>
                  <Text style={styles.caption}>{item.caption}
                  </Text>
                  {item.selectedoccasions?.length > 0 && (
                    <Text style={styles.tag}>{item.selectedoccasions[0]}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Users View */}
        {activeTab === "Users" && (
          <FlatList
            data={userResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <Text style={styles.userUsername}>{item.username}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      item.isFollowing ? styles.friends : styles.add,
                    ]}
                  >
                    <Text style={styles.addText}>
                      {item.isFollowing ? "Friends" : "Add Friend"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeIcon}>
                    <MaterialIcons name="close" size={20} color="#747E89" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
