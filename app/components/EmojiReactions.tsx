// components/EmojiReactions.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const EMOJIS = ["🔥", "🤩", "💖", "👏", "👑"];

type EmojiReactionsProps = {
  onReaction: (emoji: string) => void;
  initialReaction?: string | null;
};

const EmojiReactions = ({
  onReaction,
  initialReaction = null,
}: EmojiReactionsProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(
    initialReaction
  );
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const handleReaction = (emoji: string) => {
    const newReaction = emoji === selectedEmoji ? null : emoji;
    setSelectedEmoji(newReaction);
    onReaction(newReaction || "");
    toggleExpanded();
  };

  const emojiRowStyle = {
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0], // Moves up from bottom
        }),
      },
    ],
  };

  useEffect(() => {
    setSelectedEmoji(initialReaction);
  }, [initialReaction]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.emojiRow, emojiRowStyle]}>
        {EMOJIS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => handleReaction(emoji)}
            style={styles.emojiButton}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <TouchableOpacity onPress={toggleExpanded} style={styles.mainButton}>
        {selectedEmoji ? (
          <Text style={styles.emoji}>{selectedEmoji}</Text>
        ) : (
          <MaterialIcons name="add-reaction" size={24} color="#6D757E" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 10,
    right: 10,
    alignItems: "flex-end",
  },
  mainButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2F3439",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  emojiRow: {
    position: "absolute",
    bottom: 50,
    right: -3,
    flexDirection: "column",
    backgroundColor: "#2F3439",
    borderRadius: 20,
    padding: 8,
    gap: 8,
    zIndex: 1,
  },
  emojiButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 24,
  },
});

export default EmojiReactions;
