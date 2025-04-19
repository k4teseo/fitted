import React, { useState } from "react";
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

const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

type CommentingBarProps = {
  commentCount: number;
  onCommentPress: () => void;
  onSendComment: (text: string) => void;
  currentUserPfp?: string;
  replyingTo?: string | null;
  onCancelReply?: () => void;
};

const CommentingBar: React.FC<CommentingBarProps> = ({
  commentCount,
  onCommentPress,
  onSendComment,
  currentUserPfp,
  replyingTo,
  onCancelReply,
}) => {
  const [commentText, setCommentText] = useState("");

  const handleSend = () => {
    if (commentText.trim()) {
      onSendComment(commentText);
      setCommentText("");
    }
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
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6D757E" />
          </TouchableOpacity>
          <Text style={styles.count}>{commentCount}</Text>
          <FontAwesome name="star-o" size={20} color="#6D757E" style={styles.star} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#212529',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
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
    backgroundColor: '#2D3338',
    borderRadius: 27,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#7F8A95',
    marginRight: 10,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    color: '#6D757E',
    marginLeft: 3,
    marginRight: 15,
    fontSize: 12,
  },
  star: {
    marginLeft: 0,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#212529',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D3338',
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#2D3338',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#7F8A95',
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