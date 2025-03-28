import { View, StyleSheet, useWindowDimensions } from "react-native";
import { FittedLogo } from "@/assets/images/FittedLogo";

export default function FeedHeader() {
  const { width, height } = useWindowDimensions();

  const styles = StyleSheet.create({
    feedHeader: {
      backgroundColor: "#2D3338",
      width: "100%",
      height: height * 0.12,
      paddingVertical: height * 0.02,
      paddingLeft: width * 0.06, // Add some left padding so the logo isn't flush against the screen edge
      alignItems: "flex-start", // Align logo to the left
      justifyContent: "flex-end", // Vertically center the logo

      position: "absolute",
      zIndex: 10,
    },
  });

  return (
    <View style={styles.feedHeader}>
      <FittedLogo width={114} height={39.9} />
    </View>
  );
}
