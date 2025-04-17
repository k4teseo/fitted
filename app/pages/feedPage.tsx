import React, { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import FeedHeader from "../components/FeedHeader";
import BottomNavBar from "../components/BottomNavBar";

type FeedItemData = {
  id: string;
  caption: string;
  username: string;
  postImage: string;
  selectedbrands: string[];
  selectedoccasions: string[];
  userPfp: string;
};

const defaultPfp =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

// A small component for each feed item
const FeedItem = ({
  item,
  userPfp,
}: {
  item: FeedItemData;
  userPfp: string;
}) => {
  const router = useRouter();
  const combinedTags = [
    ...(item.selectedbrands ?? []),
    ...(item.selectedoccasions ?? []),
  ];

  const maxTags = 3;
  const visibleTags = combinedTags.slice(0, maxTags);

  return (
    <TouchableOpacity
      style={feedStyles.card}
      onPress={() => {
        router.push(`./postPage?id=${item.id}`);
      }}
      activeOpacity={0.9}
    >
      {/* Image Container */}
      <View style={feedStyles.imageContainer}>
        <Image source={{ uri: item.postImage }} style={feedStyles.postImage} />
      </View>

      {/* Info at the Bottom of the Card */}
      <View style={feedStyles.userInfo}>
        <View style={feedStyles.profileRow}>
          <Image source={{ uri: userPfp }} style={feedStyles.profileImage} />
          <Text style={feedStyles.username}>{item.username}</Text>
        </View>

        <Text style={feedStyles.caption}>{item.caption}</Text>

        {visibleTags.length > 0 && (
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <FlatList
              data={visibleTags}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={(tag, index) => `${tag}-${index}`}
              renderItem={({ item: tag }) => (
                <View style={feedStyles.tagPill}>
                  <Text style={feedStyles.tagText}>{tag}</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">(
    "home"
  );
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPfp, setUserPfp] = useState<string>(defaultPfp);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("pfp")
          .eq("id", userId)
          .single();

        if (profile && profile.pfp) {
          setUserPfp(profile.pfp);
        }
      }
    };

    getUserAndProfile();
  }, []);

  const fetchImages = async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      setFeedData([]);
      setLoading(false);
      return;
    }

    const { data: friendData, error: friendError } = await supabase
      .from("friends")
      .select("user_id_1, user_id_2")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq("status", "accepted");

    if (friendError) {
      console.error("Error fetching friends:", friendError);
      setFeedData([]);
      setLoading(false);
      return;
    }

    const friendIds = friendData.map((f) =>
      f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
    );
    const visibleUserIds = [...new Set([...friendIds, userId])];

    const { data, error } = await supabase
      .from("images")
      .select(
        `id, caption, username, user_id, image_path, selectedbrands, selectedoccasions, created_at, profiles(pfp)`
      )
      .in("user_id", visibleUserIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching images:", error);
    } else {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const formattedData = data
        .map((row: any) => ({
          id: row.id,
          caption: row.caption,
          username: row.username,
          postImage:
            supabase.storage.from("images").getPublicUrl(row.image_path)?.data
              ?.publicUrl || "",
          selectedbrands: row.selectedbrands ?? [],
          selectedoccasions: row.selectedoccasions ?? [],
          createdAt: new Date(row.created_at),
          userPfp: row.profiles?.pfp || defaultPfp,
        }))
        .filter((post) => post.createdAt > twentyFourHoursAgo);
      setFeedData(formattedData);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      setActiveTab("home");
      fetchImages();
    }, [])
  );

  return (
    <SafeAreaView style={feedStyles.container}>
      <FeedHeader />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#ccc"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FeedItem item={item} userPfp={item.userPfp} />
          )}
          contentContainerStyle={feedStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const feedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  listContent: {
    padding: 80,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#9AA8B6",
    borderRadius: 24,
    marginBottom: 30,
    overflow: "hidden",
    alignSelf: "center",
    width: 345,
  },
  imageContainer: {
    width: "100%",
    height: 400,
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  userInfo: {
    backgroundColor: "#595F66",
    padding: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "gray",
  },
  username: {
    fontFamily: "Raleway",
    fontWeight: "600",
    fontSize: 15,
    color: "#9AA8B6",
  },
  caption: {
    fontFamily: "Raleway",
    fontWeight: "700",
    fontSize: 17,
    color: "#F5EEE3",
    marginBottom: 2,
  },
  tagPill: {
    backgroundColor: "#A5C6E8",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    marginBottom: 6,
  },
  tagText: {
    color: "#262A2F",
    fontWeight: "500",
    fontSize: 10,
  },
});
