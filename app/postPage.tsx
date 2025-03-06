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
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

type PostData = {
  id: string;
  username: string;
  caption: string;
  postImage: string;
  tags?: string[]; // or more complex structure if you store multiple tags
};

export default function PostPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the post from supabase by ID
  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);

    // Example: If your table is named "images" and you store tags in "tags" column
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
    } else if (data) {
      // Convert your supabase data to PostData
      const postData: PostData = {
        id: data.id,
        username: data.username,
        caption: data.caption,
        postImage:
          supabase.storage
            .from("images")
            .getPublicUrl(data.image_path)?.data?.publicUrl || "",
        tags: data.tags || [], // if you have a tags array in your table
      };
      setPost(postData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

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
        <Text style={{ color: "#fff" }}>Loading post...</Text>
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

  // Renders a single tag "pill"
  const renderTag = ({ item }: { item: string }) => {
    return (
      <View style={styles.tagPill}>
        <Text style={styles.tagText}>{item}</Text>
      </View>
    );
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
        {/* Post Image */}
        <Image source={{ uri: post.postImage }} style={styles.postImage} />

        {/* Post Title (User’s caption) */}
        <Text style={styles.postTitle}>{post.caption}</Text>

        {/* Tags (if any) */}
        {post.tags && post.tags.length > 0 && (
          <FlatList
            data={post.tags}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
            keyExtractor={(item) => item}
            renderItem={renderTag}
          />
        )}
      </ScrollView>
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
    paddingTop: 30, // for iOS notch
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
  postImage: {
    width: "100%",
    height: 502,
    marginBottom: 20,
    resizeMode: "cover",
    backgroundColor: "#9AA8B6",
    borderRadius: 0,
  },  
  postTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#A5C6E8",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
  },
  tagPill: {
    backgroundColor: "#262A2F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: "#B4CFEA",
    fontSize: 14,
  },
});
