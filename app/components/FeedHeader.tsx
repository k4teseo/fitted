import { View, StyleSheet } from "react-native";
import { FittedLogo } from "@/assets/images/FittedLogo";

export default function FeedHeader() {
  return (
    <View style={styles.feedHeader}>
      <FittedLogo width={120} height={42} />
    </View>
  );
}

const styles = StyleSheet.create({
  feedHeader: {
    backgroundColor: "#2D3338",
    width: "100%",
    height: 115,
    paddingVertical: 20,
    paddingLeft: 30, // Add some left padding so the logo isn't flush against the screen edge
    alignItems: "flex-start", // Align logo to the left
    justifyContent: "flex-end", // Vertically center the logo
    borderBottomWidth: 1,
    position: "absolute",
  },
});
