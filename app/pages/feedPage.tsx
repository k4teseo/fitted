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
} from "react-native";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import FeedHeader from "../components/FeedHeader";
import BottomNavBar from "../components/BottomNavBar";

// Type for the feed item (optional)
type FeedItemData = {
  id: string;
  caption: string;
  username: string;
  postImage: string;
  selectedbrands: string[];
  selectedoccasions: string[];
};

// A small component for each feed item
const FeedItem = ({ item }: { item: FeedItemData }) => {
  const router = useRouter();
  const combinedTags = [
    ...(item.selectedbrands ?? []),
    ...(item.selectedoccasions ?? []),
  ];

  // Limit to a maximum of 3 tags
  const maxTags = 3;
  const visibleTags = combinedTags.slice(0, maxTags);

  return (
    <TouchableOpacity
      style={feedStyles.card}
      onPress={() => {
        router.push(`./postPage?id=${item.id}`);
      }}
      activeOpacity={0.9} // Reduce interference with scroll
    >
      {/* Image Container */}
      <View style={feedStyles.imageContainer}>
        <Image source={{ uri: item.postImage }} style={feedStyles.postImage} />
      </View>

      {/* Info at the Bottom of the Card */}
      <View style={feedStyles.userInfo}>
        {/* Username */}
        <Text style={feedStyles.username}>{item.username}</Text>

        {/* Caption */}
        <Text style={feedStyles.caption}>{item.caption}</Text>
        
        {/* Ensure Tag Pills are Scrollable */}
        {visibleTags.length > 0 && (
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <FlatList
              data={visibleTags}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true} // Ensure it scrolls inside another scrollable view
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }} // Ensure it takes full width
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

// The main feed page component
export default function FeedPage() {
  // Track the active tab: 'home' or 'add'
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">(
    "home"
  );
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const id = session?.user?.id ?? null;
      setUserId(id);
    };
  
    getUser();
  }, []);

  // Fetch images from Supabase
  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("images")
      .select(
        "id, caption, username, image_path, selectedbrands, selectedoccasions, created_at"
      )
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
    }, []) // Dependency array is empty, so it runs when screen is focused
  );

  return (
    <SafeAreaView style={feedStyles.container}>
      {/* Top Bar with the Fitted Logo on the Left */}
      <FeedHeader />

      {/* Feed List */}
      {loading ? (
        <Text style={feedStyles.loadingText}>Loading feed...</Text>
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedItem item={item} />}
          contentContainerStyle={feedStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
}

const feedStyles = StyleSheet.create({
  // Screen Container
  container: {
    flex: 1,
    backgroundColor: "#15181B", // Dark background
  },

  // List
  listContent: {
    padding: 80,
    paddingBottom: 80, // Ensure feed items aren't hidden behind bottom nav
  },

  // Card
  card: {
    backgroundColor: "#9AA8B6",
    borderRadius: 24,
    marginBottom: 30,
    overflow: "hidden", // Ensures the image corners match card corners
    alignSelf: "center",
    width: 345, // Fixed width
  },

  // Image Container (with fixed height)
  imageContainer: {
    width: "100%",
    height: 400, // The "frame" for the image
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Fills the container, cropping if needed
  },

  // User Info
  userInfo: {
    backgroundColor: "#595F66",
    padding: 16,
  },
  caption: {
    fontFamily: "Raleway", // Use Raleway font
    fontWeight: "700", // Bold
    fontSize: 17,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: "#F5EEE3",
    marginBottom: 2,
  },
  username: {
    fontFamily: "Raleway", // Use Raleway font
    fontWeight: "600", // Bold
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: "#9AA8B6",
    marginTop: 4,
    marginBottom: 4,
  },

  tagContainer: {
    flexDirection: "row",
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

  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});
