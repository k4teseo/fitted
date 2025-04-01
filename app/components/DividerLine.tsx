import React from "react";
import { View, StyleSheet, useWindowDimensions, Text } from "react-native";

export default function DividerLine() {
  const { width, height } = useWindowDimensions();
  const styles = StyleSheet.create({
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: height * 0.03,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#B9CADB",
    },
    dividerText: {
      color: "#B9CADB",
      marginHorizontal: width * 0.02,
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>Or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}
