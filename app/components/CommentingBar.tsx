import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";

const defaultPfp =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

type CommentingBarProps = {
  commentCount: number;
  onCommentPress: () => void;
  onCommentPosted: () => void; 
  currentUserPfp?: string;
  replyingTo?: string | null;
  onCancelReply?: () => void;
  postId: string; 
};

const CommentingBar: React.FC<CommentingBarProps> = ({
  commentCount,
  onCommentPress,
  onCommentPosted,
  currentUserPfp,
  replyingTo,
  onCancelReply,
  postId,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleCollectionsPress = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !session?.user?.id) {
      console.error("Auth session error:", sessionError);
      return;
    }
  
    const userId = session.user.id;
  
    // If the post is already saved, remove it from the collection
    if (isSaved) {
      const { error: removeError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("image_id", postId)
        .eq("user_id", userId);
  
      if (removeError) {
        console.error("Failed to remove post from collection:", removeError);
        return;
      }
  
      // Update the UI to reflect the change (post is no longer saved)
      setIsSaved(false);
    } else {
      // If the post is not saved, navigate to the SaveToCollection page
      router.push({
        pathname: "../components/SaveToCollection",
        params: { postId },
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkIfSaved = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
        if (sessionError || !session?.user?.id) {
          console.error("Auth session error:", sessionError);
          return;
        }
  
        const userId = session.user.id;
  
        const { data, error } = await supabase
          .from("saved_posts")
          .select("*")
          .eq("image_id", postId)
          .eq("user_id", userId)
          .maybeSingle();
  
        if (error) {
          console.error("Failed to check if post is saved:", error);
          return;
        }
  
        setIsSaved(!!data); // Set saved status based on whether the data exists
      };
  
      checkIfSaved(); // Check if saved whenever we come back
    }, [postId]) // Re-run when postId changes
  );

  const handleSend = async () => {
    if (!commentText.trim()) return;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      console.error("Auth session error:", sessionError);
      return;
    }

    const userId = session.user.id;

    const commentPayload = {
      image_id: postId,
      user_id: userId,
      text: commentText,
      parent_id: replyingTo || null,
    };

    console.log("Sending comment payload to Supabase:", commentPayload);
    console.log("auth.uid()", userId);
    console.log("comment payload user_id", userId);

    const { data, error: insertError } = await supabase
      .from("comments")
      .insert(commentPayload)
      .select(); // Get inserted rows back

    if (insertError) {
      console.error("Failed to insert comment into Supabase:", insertError);
      return;
    }

    console.log("Comment inserted successfully:", data);

    setCommentText("");
    onCommentPosted();
    if (onCancelReply) onCancelReply();
  };

  if (replyingTo) {
    return (
      <View style={styles.replyContainer}>
        <Pressable onPress={onCancelReply} style={styles.cancelButton}>
          <MaterialIcons name="close" size={20} color="#6D757E" />
        </Pressable>
        <TextInput
          style={styles.replyInput}
          placeholder="Write your reply..."
          placeholderTextColor="#6D757E"
          value={commentText}
          onChangeText={setCommentText}
          onSubmitEditing={handleSend}
          autoFocus
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="arrow-up-circle" size={30} color="#60A5FA" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentUserPfp || defaultPfp }}
        style={styles.profileImage}
      />
      <TextInput
        style={styles.input}
        placeholder="Hype your friend up..."
        placeholderTextColor="#6D757E"
        value={commentText}
        onChangeText={setCommentText}
      />
      {commentText ? (
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="arrow-up-circle" size={30} color="#60A5FA" />
        </TouchableOpacity>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCommentPress}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#6D757E"
            />
          </TouchableOpacity>
          <Text style={styles.count}>{commentCount}</Text>
          <TouchableOpacity onPress={handleCollectionsPress}>
            <FontAwesome
              name={isSaved ? "star" : "star-o"}
              size={20}
              color={isSaved ? "#FFD700" : "#6D757E"}
              style={styles.star}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#212529",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    minHeight: 70,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#2D3338",
    borderRadius: 27,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: "#7F8A95",
    marginRight: 10,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    color: "#6D757E",
    marginLeft: 3,
    marginRight: 15,
    fontSize: 12,
  },
  star: {
    marginLeft: 0,
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#212529",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#2D3338",
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#2D3338",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: "#7F8A95",
    marginHorizontal: 10,
    fontSize: 12,
  },
  cancelButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
});

export default CommentingBar;