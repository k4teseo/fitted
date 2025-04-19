// components/FeedItem.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import TimeStamp from "./TimeStamp";
import EmojiReactions from "./EmojiReactions";

type FeedItemData = {
  id: string;
  caption: string;
  username: string;
  postImage: string;
  selectedbrands: string[];
  selectedoccasions: string[];
  userPfp: string;
  createdAt: Date;
  reaction?: string | null;
};

type FeedItemProps = {
  item: FeedItemData;
  userPfp: string;
  onReaction?: (postId: string, emoji: string) => void;
};

const FeedItem = ({ item, userPfp, onReaction }: FeedItemProps) => {
  const router = useRouter();
  const visibleTags = (item.selectedoccasions ?? []).slice(0, 2);

  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(item.id, emoji);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push(`./postPage?id=${item.id}`);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.postImage }} style={styles.postImage} />
        
        {/* Emoji Reactions Component */}
        <View style={styles.reactionsContainer}>
          <EmojiReactions 
            onReaction={handleReaction} 
            initialReaction={item.reaction || null}
          />
        </View>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.profileRow}>
          <Image source={{ uri: userPfp }} style={styles.profileImage} />
          <Text style={styles.username}>{item.username}</Text>
        </View>

        <Text style={styles.caption}>{item.caption}</Text>

        <View style={styles.tagsRow}>
          {visibleTags.length > 0 && (
            <View style={{ flexDirection: 'row' }}>
              {visibleTags.map((tag, index) => (
                <View key={index} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {item.createdAt && (
            <TimeStamp createdAt={item.createdAt.toISOString()} style={styles.timestamp} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  listContent: {
    padding: 90,
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
    position: 'relative',  // This is crucial for absolute positioning children
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 10,  // Ensure it appears above the image
  },
  userInfo: {
    backgroundColor: "#202325",
    padding: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 20,
    height: 20,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "gray",
  },
  username: {
    fontFamily: "Raleway",
    fontWeight: "600",
    fontSize: 12,
    color: "#919CA9",
  },
  caption: {
    fontFamily: "Raleway",
    fontWeight: "600",
    fontSize: 16,
    color: "#F5EEE3",
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: "#9BABBC",
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
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  timestamp: {
    color: '#6D757E',
    fontSize: 10,
  },
});

export default FeedItem;