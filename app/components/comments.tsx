// components/Comments.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PostNavBar from "./postNavBar";

type Comment = {
  id: string;
  username: string;
  text: string;
  pfp: string;
  createdAt: string;
  replies?: Comment[];
  parentId?: string | null;
};

type CommentsProps = {
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  comments: Comment[];
  commentCount: number;
  currentUserPfp: string;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  onCommentPosted: () => void;
  postId: string;
};

export default function Comments({
  showComments,
  setShowComments,
  comments,
  commentCount,
  currentUserPfp,
  replyingTo,
  setReplyingTo,
  onCommentPosted,
  postId,
}: CommentsProps) {
  const getReplies = (commentId: string) => {
    return comments.filter((comment) => comment.parentId === commentId);
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id);
    return (
      <View
        key={comment.id}
        style={[styles.commentItem, isReply && styles.replyItem]}
      >
        <Image
          source={{ uri: comment.pfp }}
          style={[styles.commentItemPfp, isReply && styles.replyPfp]}
        />
        <View style={styles.commentContent}>
          <Text
            style={[styles.commentUsername, isReply && styles.replyUsername]}
          >
            {comment.username}
          </Text>
          <Text style={[styles.commentText, isReply && styles.replyText]}>
            {comment.text}
          </Text>
          <View style={styles.commentFooter}>
            <Text style={[styles.commentTime, isReply && styles.replyTime]}>
              {comment.createdAt}
            </Text>
            {!isReply && (
              <Pressable onPress={() => setReplyingTo(comment.id)}>
                <MaterialIcons
                  name="reply"
                  size={16}
                  color="#6D757E"
                  style={styles.replyIcon}
                />
              </Pressable>
            )}
          </View>

          {replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {replies.map((reply) => renderComment(reply, true))}
            </View>
          )}

          {replyingTo === comment.id && (
            <View style={styles.replyInputContainer}>
              <PostNavBar
                commentCount={0}
                onCommentPress={() => {}}
                onCommentPosted={onCommentPosted}
                currentUserPfp={currentUserPfp}
                replyingTo={comment.id}
                onCancelReply={() => setReplyingTo(null)}
                postId={postId}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const topLevelComments = comments.filter(
    (comment) => comment.parentId === null
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showComments}
      onRequestClose={() => setShowComments(false)}
    >
      <View style={styles.commentsModal}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments ({commentCount})</Text>
          <Pressable onPress={() => setShowComments(false)}>
            <MaterialIcons name="close" size={24} color="#F5EEE3" />
          </Pressable>
        </View>

        <ScrollView style={styles.commentsList}>
          {topLevelComments.map((comment) => renderComment(comment))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  commentsModal: {
    flex: 1,
    backgroundColor: "#212529",
    marginTop: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  commentsTitle: {
    color: "#F5EEE3",
    fontSize: 20,
    fontWeight: "bold",
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  commentItemPfp: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: "#7F8A95",
    fontWeight: "600",
    marginBottom: 2,
  },
  commentText: {
    color: "#F5EEE3",
    marginBottom: 2,
  },
  commentTime: {
    color: "#6D757E",
    fontSize: 12,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyIcon: {
    marginLeft: 10,
  },
  repliesContainer: {
    marginTop: 0,
    borderLeftWidth: 1,
    borderLeftColor: "#2D3338",
    paddingLeft: 10,
  },
  replyItem: {
    marginLeft: 20,
    marginTop: 8,
  },
  replyPfp: {
    width: 25,
    height: 25,
    borderRadius: 16,
  },
  replyUsername: {
    fontSize: 13,
  },
  replyText: {
    fontSize: 12,
  },
  replyTime: {
    fontSize: 10,
  },
  replyInputContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
});
