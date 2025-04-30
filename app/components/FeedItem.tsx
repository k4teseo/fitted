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
  createdAt: string; // ✅ changed from Date to string
  reaction?: string | null;
};

type FeedItemProps = {
  item: FeedItemData;
  userPfp: string;
  onReaction?: (postId: string, emoji: string) => void;
};

// Calculate max width available for tags (card width - padding - timestamp width)
const CARD_WIDTH = 345;
const TIMESTAMP_WIDTH = 30; // Approximate width of timestamp
const TAG_PADDING = 16 * 2; // Horizontal padding of userInfo
const TAG_MARGIN = 12; // Margin between tags
const MAX_TAGS_WIDTH = CARD_WIDTH - TAG_PADDING - TIMESTAMP_WIDTH;

const FeedItem = ({ item, userPfp, onReaction }: FeedItemProps) => {
  const router = useRouter();

  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(item.id, emoji);
    }
  };

 // Function to calculate how many tags can fit
 const getVisibleTags = () => {
  const allTags = [
    ...(item.selectedoccasions?.map(tag => ({ type: 'occasion', text: tag })) || []),
    ...(item.selectedbrands?.map(tag => ({ type: 'brand', text: tag })) || [])
  ];

  let remainingWidth = MAX_TAGS_WIDTH;
    const visibleTags = [];
    
    for (const tag of allTags) {
      // Approximate tag width based on text length
      const tagWidth = tag.text.length * 7 + 24; // 7px per character + padding
      
      if (remainingWidth >= tagWidth) {
        visibleTags.push(tag);
        remainingWidth -= tagWidth + TAG_MARGIN;
      } else {
        break;
      }
    }

    return visibleTags;
  };

  const visibleTags = getVisibleTags();


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
          <View style={styles.tagsContainer}>
            {visibleTags.map((tag, index) => (
              <View 
                key={index} 
                style={[
                  styles.tagPill,
                  tag.type === 'occasion' ? styles.occasionPill : styles.brandPill
                ]}
              >
                <Text style={styles.tagText}>{tag.text}</Text>
              </View>
            ))}
          </View>
          {item.createdAt && (
            <TimeStamp createdAt={item.createdAt} style={styles.timestamp} />
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
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  reactionsContainer: {
    position: "absolute",
    bottom: 10,
    right: 2,
    zIndex: 10,
  },
  userInfo: {
    backgroundColor: "#2D3338",
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
    marginBottom: 3,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  tagPill: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    marginBottom: 4,
  },
  occasionPill: {
    backgroundColor: "#63B0FC",
  },
  brandPill: {
    backgroundColor: "#63B0FC", 
  },
  tagText: {
    color: "#262A2F",
    fontWeight: "500",
    fontSize: 10,
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  timestamp: {
    color: "#6D757E",
    fontSize: 10,
  },
});

export default FeedItem;
