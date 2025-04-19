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
  useWindowDimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import TimeStamp from "../components/TimeStamp";
import CommentingBar from "../components/CommentingBar";
import Comments from "../components/comments";

const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

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

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandTags, setBrandTags] = useState<BrandTag[]>([]);
  const [showTags, setShowTags] = useState(false);
  const [photoLayout, setPhotoLayout] = useState({ width: 0, height: 0 });
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [currentUserPfp, setCurrentUserPfp] = useState(defaultPfp);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const mockComments: Comment[] = [
    {
      id: "1",
      username: "coffeexclothes",
      text: "This outfit is EVERYTHING 🔥 serving looks as always",
      pfp: defaultPfp,
      createdAt: "2d",
      parentId: null,
    },
    {
      id: "2",
      username: "outfit_user123",
      text: "Thank you bro",
      pfp: defaultPfp,
      createdAt: "2d",
      parentId: "1",
    },
    {
      id: "3",
      username: "vintage.viv",
      text: "Where did you buy your jacket",
      pfp: defaultPfp,
      createdAt: "2hr",
      parentId: null,
    },
    {
      id: "4",
      username: "outfit_user123",
      text: "Uniqlo",
      pfp: defaultPfp,
      createdAt: "20min",
      parentId: "3",
    },
    {
      id: "5",
      username: "cutsypup",
      text: "streetwear royalty right here",
      pfp: defaultPfp,
      createdAt: "2d",
      parentId: null,
    },
    {
      id: "6",
      username: "outfit_user123",
      text: "Thank you!",
      pfp: defaultPfp,
      createdAt: "2d",
      parentId: "5",
    },
  ];

  useEffect(() => {
    setComments(mockComments);
    setCommentCount(mockComments.length);
  }, []);
    
  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);

    const { data: postData , error: postError } = await supabase
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
          supabase.storage.from("images").getPublicUrl(postData.image_path)?.data
            ?.publicUrl || "",
        selectedbrands: postData.selectedbrands ?? [],
        selectedoccasions: postData.selectedoccasions ?? [],
        selectedbrands_lower: postData.selectedbrands?.map((brand: string) => brand.toLowerCase()) ?? [], 
        selectedoccasions_lower: postData.selectedoccasions?.map((occasion: string) => occasion.toLowerCase()) ?? [],
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

  useEffect(() => {
    fetchPost();
    fetchBrandTags();
  }, [id]);

  useEffect(() => {
    const fetchCurrentUserPfp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

  const handleSendComment = (text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      username: "current_user",
      text,
      pfp: currentUserPfp,
      createdAt: "Just now",
      parentId: replyingTo || null,
    };
    setComments([...comments, newComment]);
    setCommentCount(commentCount + 1);
    setReplyingTo(null);
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
    <SafeAreaView style={styles.container} >
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

          <Pressable style={styles.tagIconContainer} onPress={toggleTags}>
            <MaterialIcons name="tag" size={24} color="#F5EEE3" />
          </Pressable>

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

        <Text style={styles.postTitle}>{post.caption}</Text>

        {combinedTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {combinedTags.map((tag, index) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {post.created_at && (
          <View style={styles.timestampContainer}>
            <TimeStamp createdAt={post.created_at} />
          </View>
        )}
      </ScrollView>

      <CommentingBar
        commentCount={commentCount}
        onCommentPress={toggleComments}
        onSendComment={handleSendComment}
        currentUserPfp={currentUserPfp}
        replyingTo={null}
        onCancelReply={() => setReplyingTo(null)}
      />
      
      <Comments
        showComments={showComments}
        setShowComments={setShowComments}
        comments={comments}
        commentCount={commentCount}
        currentUserPfp={currentUserPfp}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        handleSendComment={handleSendComment}
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
    flexDirection: 'row',
    alignItems: "flex-end",
    position: "absolute",
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tagIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
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
});