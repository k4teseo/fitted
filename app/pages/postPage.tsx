// app/postPage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import SaveToCollection from "../components/SaveToCollection";

// Adjust this type as needed for your own table schema
type PostData = {
  id: string;
  username: string;
  caption: string;
  postImage: string;
  selectedbrands: string[];
  selectedoccasions: string[];
  selectedbrands_lower: string[];
  selectedoccasions_lower: string[];
  metadata: string[];
};

type BrandTag = {
  id: string; // or number, depending on your DB
  brand_name: string;
  x_position: number;
  y_position: number;
};

const dummyCollections = [
  { id: 'EverydayWear', name: 'Everyday Wear' },
  { id: 'winter', name: 'Winter' },
  { id: 'birthday', name: 'Birthday' },
  { id: 'dresses', name: 'Dresses' },
];

export default function PostPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Main post data
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  // For brand tags that were added during upload
  const [brandTags, setBrandTags] = useState<BrandTag[]>([]);
  const [showTags, setShowTags] = useState(false);

  // We need the layout of the Image container to position tags properly
  const [photoLayout, setPhotoLayout] = useState({ width: 0, height: 0 });

  //Saving
  const [isSaved, setIsSaved] = useState(false);
  const [showCollections, setShowCollections] = useState(false);

  // 1) Fetch the main post from "images"
  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("images")
      .select(
        "id, username, caption, image_path, selectedbrands, selectedoccasions, metadata"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const postData: PostData = {
        id: data.id,
        username: data.username,
        caption: data.caption,
        postImage:
          supabase.storage.from("images").getPublicUrl(data.image_path)?.data
            ?.publicUrl || "",
        selectedbrands: data.selectedbrands ?? [],
        selectedoccasions: data.selectedoccasions ?? [],
        selectedbrands_lower: data.selectedbrands?.map((brand: string) => brand.toLowerCase()) ?? [], 
        selectedoccasions_lower: data.selectedoccasions?.map((occasion: string) => occasion.toLowerCase()) ?? [],
        metadata: data.metadata ?? [],
      };
      setPost(postData);
    }
    setLoading(false);
  };

  // 2) Fetch brand tags from "image_brand_tags"
  const fetchBrandTags = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("image_brand_tags")
      .select("*")
      .eq("image_id", id);

    if (error) {
      console.error("Error fetching brand tags:", error);
    } else if (data) {
      setBrandTags(data as BrandTag[]);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchBrandTags();
  }, [id]);

  // Basic loading / error checks
  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>No post ID provided.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#B4CFEA" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>Post not found.</Text>
      </View>
    );
  }

  // Combine arrays for tag “pills” (if you still want them at the bottom, separate from brandTags)
  const combinedTags = [...post.selectedbrands, ...post.selectedoccasions];

  // Toggle showing brand tags on the photo
  const toggleTags = () => {
    setShowTags((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with username and back arrow */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </Pressable>
        <Text style={styles.username}>{post.username}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Image Container with brand tags overlay */}
        <View
          style={styles.imageContainer}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPhotoLayout({ width, height });
          }}
        >
          <Image
            source={{ uri: post.postImage }}
            style={styles.postImage}
            resizeMode="cover"
          />

          {/* Tag icon in bottom-right corner */}
          <Pressable style={styles.tagIconContainer} onPress={toggleTags}>
            <MaterialIcons name="tag" size={24} color="#F5EEE3" />
          </Pressable>

          {/* Conditionally render brand tags */}
          {showTags &&
            brandTags.map((tag) => {
              // Multiply x_position/y_position by container width/height to place the pill
              const leftPos = tag.x_position * photoLayout.width;
              const topPos = tag.y_position * photoLayout.height;
              return (
                <View
                  key={tag.id}
                  style={[styles.brandTagPill, { left: leftPos, top: topPos }]}
                >
                  <Text style={styles.brandTagText}>{tag.brand_name}</Text>
                </View>
              );
            })}
        </View>

        {/* Post Title (User’s caption) */}
        <Text style={styles.postTitle}>{post.caption}</Text>

        {/* Tag “pills” at the bottom (for brand + occasions from your arrays) */}
        {combinedTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {combinedTags.map((tag, index) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Save to Collection Button */}
        <View style={styles.saveRow}>
        <TouchableOpacity
          onPress={() => {
            if (!isSaved) setShowCollections(true); // only open Save panel if not already saved
            setIsSaved(!isSaved); // toggle star state
          }}
        >
          <Text style={{ fontSize: 22, color: isSaved ? '#FFD700' : '#FFFFFF' }}>
            {isSaved ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Save to Collection Bottom Sheet */}
      {showCollections && (
        <SaveToCollection
          collections={dummyCollections} // Replace with your actual collections
          onSave={(collectionId) => {
            console.log("Saved to collection:", collectionId);
            setShowCollections(false);
          }}
          onClose={() => setShowCollections(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: "#2D3338",
  },
  backButton: {
    marginRight: 20,
  },
  username: {
    color: "#7F8A95",
    fontSize: 24,
    fontWeight: "500",
  },
  scrollContainer: {
    padding: 20,
  },
  // Container that wraps the image + the brand tags overlay + the tag icon
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 500, // or any fixed aspect ratio
    marginBottom: 20,
    backgroundColor: "#333",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  // The button in the bottom-right corner for toggling tags
  tagIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },
  // A small “pill” for brand tags on the photo
  brandTagPill: {
    position: "absolute",
    backgroundColor: "#202325",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  brandTagText: {
    color: "#9AA8B6",
    fontSize: 12,
  },
  postTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#A5C6E8",
    marginBottom: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tagPill: {
    backgroundColor: "#262A2F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 12,
  },
  tagText: {
    color: "#6D757E",
    fontSize: 14,
  },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  
  starButton: {
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 8,
  },
});