import { Link, router } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

// Sample feed data (replace with API data when available)
const feedData = [
  {
    id: "1",
    caption: "Loving this new hat and shades!",
    username: "mariahh23",
    postImage:
      "https://s3-alpha-sig.figma.com/img/893d/21ad/c5e36348b3d4ffcb9c72852898d658cc?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=sbhVDBoNREbYBK65Dxr43rQZtIk5hUExxuD8j8~uAns0mIakn-x7vpPNiAAGxqSYziI--gnXXCiRUj7cWjpokeIDzra5C3QvtETAxOTZgc1NxW1SdYD2-0o2Q~zo8x1zttACOM1z80BzbfrOzcLZZGbAEjt~B4DPTwgpCzE70m87DdrD6svf3gLLJ2nEDhSN3wv-TxlzSLjlEQ0LC0dfsuAiTIVEv6eIzlfg-cYLLcVtQKuGi7qy-4ClTk9nuzHxfhMOft4DEkOhBpqbd8qGeD7FUpRiuslji9btvFTQijElhVB5nQbXD7RFVK~zzJkMsJtCsCaLq~emKCGIXQ53kg__",
  },
  {
    id: "2",
    caption: "Enjoying a sunny day!",
    username: "john_doe",
    postImage:
      "https://s3-alpha-sig.figma.com/img/d9d0/03ad/2e70a698dff0e8a75ebdc898817e054a?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=s3uV2EYndE9X25np7FodoEG3E~5Axs4UsrKjKeVDMi5PUZQZSnUDs6vkoMcxLtyEoZg8pR6TNETjOYX-BmjNayIQ3RuVlPHUdrPuuCuoLYmTxsr7NKomFkKFAMAAhTJVogNxiHuWTmcldyt9bwvinY50ylmwyGcYQ3SuNLK7ci8VndzowD~NU~MRN2VmeK1KSJClF0l73VKc~2uHEarDFy2LldbxebpHdId8Mc0aCuh5yJtuwpMc-~4j6TpWg2u--FS1292I9HFNcEDh3ycIccwH5lXr0awY0iYcPFtQy6DuXBkAJjCS2iRvR41qrzNi0albbN70dVcRfqSdx5TDKg__",
  },
];

// Component for rendering each feed item
const FeedItem = ({ item }: { item: (typeof feedData)[0] }) => {
  return (
    <View style={styles.card}>
      {/* Main Post Image */}
      <Image source={{ uri: item.postImage }} style={styles.postImage} />

      {/* User Info Bar at the Bottom of the Card */}
      <View style={styles.userInfo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </View>
    </View>
  );
};

// Home page that displays the feed layout and bottom nav
export default function HomePage() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom App Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedHeaderTitle}>Fitted.</Text>
      </View>

      {/* Feed List */}
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemText}>Home</Text>
        </TouchableOpacity>
        <Pressable
          onPress={() => router.push("/camera")}
          style={styles.navItem}
        >
          <Text style={styles.navItemText}>Add Photo</Text>
        </Pressable>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navItemText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B", // Dark background
  },
  feedHeader: {
    backgroundColor: "#2D3338",
    width: "100%",
    height: 114,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  feedHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Ensure feed items aren't hidden behind bottom nav
  },
  card: {
    backgroundColor: "#9AA8B6",
    borderRadius: 32,
    marginBottom: 16,
    overflow: "hidden", // Ensures the image corners match card corners
  },
  postImage: {
    width: "100%",
    height: 479,
    resizeMode: "cover",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#595F66",
    padding: 12,
  },
  username: {
    fontSize: 13,
    color: "#CCCCCC",
    marginTop: 5,
  },
  caption: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#A5C6E8",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
  navItemText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
