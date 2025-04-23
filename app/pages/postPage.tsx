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
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import SaveToCollection from "../components/SaveToCollection";
import TimeStamp from "../components/TimeStamp";
import CommentingBar from "../components/CommentingBar";
import Comments from "../components/comments";
import EmojiReactions from "../components/EmojiReactions";

const defaultPfp =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

type Reaction = {
  id: string;
  userId: string;
  emoji: string;
  userPfp: string;
  username: string;
};

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
  created_at: string;
  userPfp?: string;
};

type BrandTag = {
  id: string;
  brand_name: string;
  x_position: number;
  y_position: number;
};

const dummyCollections = [
  { id: "EverydayWear", name: "Everyday Wear" },
  { id: "winter", name: "Winter" },
  { id: "birthday", name: "Birthday" },
  { id: "dresses", name: "Dresses" },
];

type Comment = {
  id: string;
  username: string;
  text: string;
  pfp: string;
  createdAt: string;
  replies?: Comment[];
  parentId?: string | null;
};

export default function PostPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const [session, setSession] = useState<any>(null);
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandTags, setBrandTags] = useState<BrandTag[]>([]);
  const [showTags, setShowTags] = useState(false);
  const [photoLayout, setPhotoLayout] = useState({ width: 0, height: 0 });

  //Saving
  const [isSaved, setIsSaved] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [currentUserPfp, setCurrentUserPfp] = useState(defaultPfp);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    fetchPost();
    fetchBrandTags();
    fetchReactions();
    fetchComments();
  }, [id]);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();
  }, []);

  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);

    const { data: postData, error: postError } = await supabase
      .from("images")
      .select(
        "id, username, caption, image_path, selectedbrands, selectedoccasions, metadata, created_at, user_id"
      )
      .eq("id", id)
      .single();

    if (postError) {
      console.error("Error fetching post:", postError);
      setLoading(false);
      return;
    }

    if (postData) {
      let pfpUrl = defaultPfp;
      if (postData.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("pfp")
          .eq("id", postData.user_id)
          .single();

        if (!profileError && profileData?.pfp) {
          pfpUrl = profileData.pfp;
        }
      }

      const formattedPost: PostData = {
        id: postData.id,
        username: postData.username,
        caption: postData.caption,
        postImage:
          supabase.storage.from("images").getPublicUrl(postData.image_path)
            ?.data?.publicUrl || "",
        selectedbrands: postData.selectedbrands ?? [],
        selectedoccasions: postData.selectedoccasions ?? [],
        selectedbrands_lower:
          postData.selectedbrands?.map((brand: string) =>
            brand.toLowerCase()
          ) ?? [],
        selectedoccasions_lower:
          postData.selectedoccasions?.map((occasion: string) =>
            occasion.toLowerCase()
          ) ?? [],
        metadata: postData.metadata ?? [],
        created_at: postData.created_at,
        userPfp: pfpUrl,
      };
      setPost(formattedPost);
    }
    setLoading(false);
  };

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

  const fetchReactions = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("reactions")
      .select(
        `
        id,
        user_id,
        reaction,
        profiles (
          username,
          pfp
        )
      `
      )
      .eq("image_id", id);

    if (error) {
      console.error("Error fetching reactions:", error);
      return;
    }

    console.log("Fetched reactions:", data); // You should now see ALL users

    const formatted = data.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      emoji: r.reaction,
      username: r.profiles?.username || "Unknown",
      userPfp: r.profiles?.pfp || defaultPfp,
    }));

    setReactions(formatted);
  };

  useEffect(() => {
    fetchPost();
    fetchBrandTags();
    fetchReactions();
  }, [id]);

  useEffect(() => {
    const fetchCurrentUserPfp = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("pfp")
          .eq("id", session.user.id)
          .single();
        if (profile?.pfp) {
          setCurrentUserPfp(profile.pfp);
        }
      }
    };
    fetchCurrentUserPfp();
  }, []);

  const fetchComments = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("comments")
      .select("id, text, created_at, parent_id, profiles(username, pfp)")
      .eq("image_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    const formatted = data.map((c: any) => ({
      id: c.id,
      text: c.text,
      createdAt: new Date(c.created_at).toLocaleString(),
      parentId: c.parent_id,
      username: c.profiles?.username || "Unknown",
      pfp: c.profiles?.pfp || defaultPfp,
    }));

    setComments(formatted);
    setCommentCount(formatted.length);
  };

  const handleReaction = async (emoji: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const userId = session.user.id;

    const existingReaction = reactions.find((r) => r.userId === userId);

    if (existingReaction?.emoji === emoji) {
      // remove reaction
      await supabase.from("reactions").delete().match({
        image_id: id,
        user_id: userId,
      });
    } else {
      // upsert new reaction or update existing one
      const { error: upsertError } = await supabase.from("reactions").upsert(
        {
          image_id: id,
          user_id: userId,
          reaction: emoji,
        },
        {
          onConflict: "image_id,user_id",
        }
      );

      if (upsertError) {
        console.error("Error updating reaction:", upsertError);
      }
    }

    await fetchReactions(); // refresh the reactions list
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const toggleTags = () => {
    setShowTags((prev) => !prev);
  };

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

  const combinedTags = [...post.selectedbrands, ...post.selectedoccasions];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="navigate-before" size={30} color="#F5EEE3" />
          </Pressable>
          <Image
            source={{ uri: post.userPfp || defaultPfp }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{post.username}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardDismissMode="on-drag"
      >
        {/* Image Container with Reactions */}
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

          {/* Reaction Indicators (Left Side) */}
          {reactions.length > 0 && (
            <View style={styles.reactionIndicators}>
              {reactions.slice(0, 3).map((reaction, index) => (
                <View
                  key={reaction.id}
                  style={[
                    styles.reactionIndicator,
                    { zIndex: reactions.length - index },
                  ]}
                >
                  <Image
                    source={{ uri: reaction.userPfp }}
                    style={styles.reactionPfp}
                  />
                  <View style={styles.emojiBadge}>
                    <Text style={styles.emojiText}>{reaction.emoji}</Text>
                  </View>
                </View>
              ))}
              {reactions.length > 3 && (
                <View style={styles.moreReactions}>
                  <Text style={styles.moreReactionsText}>
                    +{reactions.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Emoji Reactions Button (Right Side) */}
          <View style={styles.reactionsContainer}>
            <EmojiReactions
              onReaction={handleReaction}
              initialReaction={
                reactions.find((r) => r.userId === session?.user?.id)?.emoji ||
                null
              }
            />
          </View>

          {/* Tag Button */}
          <Pressable style={styles.tagIconContainer} onPress={toggleTags}>
            <MaterialIcons name="tag" size={24} color="#F5EEE3" />
          </Pressable>

          {/* Brand Tags Overlay */}
          {showTags &&
            brandTags.map((tag) => {
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

        {/* Post Content */}
        <Text style={styles.postTitle}>{post.caption}</Text>

        {/* Tags */}
        {combinedTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {combinedTags.map((tag, index) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Timestamp */}
        {post.created_at && (
          <View style={styles.timestampContainer}>
            <TimeStamp createdAt={post.created_at} />
          </View>
        )}
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

      {/* Commenting Bar */}
      <CommentingBar
        commentCount={commentCount}
        onCommentPress={toggleComments}
        onCommentPosted={fetchComments} // <- this is key
        currentUserPfp={currentUserPfp}
        replyingTo={null}
        onCancelReply={() => setReplyingTo(null)}
        postId={post.id} // <- must pass this so CommentingBar can insert
      />

      {/* Comments Modal */}
      <Comments
        showComments={showComments}
        setShowComments={setShowComments}
        comments={comments}
        commentCount={commentCount}
        currentUserPfp={currentUserPfp}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        onCommentPosted={fetchComments}
        postId={post.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  topBar: {
    backgroundColor: "#2D3338",
    width: "100%",
    height: 123,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    position: "absolute",
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginBottom: 0,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
    marginLeft: 10,
  },
  username: {
    color: "#7F8A95",
    fontSize: 24,
    fontWeight: "500",
    marginLeft: 8,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 80,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 500,
    marginBottom: 20,
    backgroundColor: "#333",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  reactionIndicators: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "column-reverse",
    alignItems: "flex-start",
    gap: 2,
  },
  reactionIndicator: {
    marginBottom: 3,
  },
  reactionPfp: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#15181B",
  },
  emojiBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#15181B",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D3338",
  },
  emojiText: {
    fontSize: 12,
  },
  moreReactions: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  moreReactionsText: {
    color: "white",
    fontSize: 12,
  },
  reactionsContainer: {
    position: "absolute",
    bottom: 45,
    right: 0,
    zIndex: 10,
  },
  tagIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 9,
  },
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
    fontSize: 18,
    fontWeight: "600",
    color: "#F5EEE3",
    marginBottom: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tagPill: {
    backgroundColor: "#98A7B7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 12,
  },
  tagText: {
    color: "#141618",
    fontSize: 10,
  },
  timestampContainer: {
    marginTop: -10,
    marginBottom: 10,
  },
  saveRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  starButton: {
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 8,
  },
});
