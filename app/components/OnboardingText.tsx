import React from "react";
import { Text, StyleSheet } from "react-native";

interface OnboardingText {
  title: string;
  description: string;
}

const OnboardingText: React.FC<OnboardingText> = ({ title, description }) => (
  <>
    <Text style={styles.subheader}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </>
);

const styles = StyleSheet.create({
  subheader: {
    fontSize: 25,
    fontWeight: "400",
    color: "#B9CADB",
    marginBottom: "4%",
    textAlign: "left",
  },
  description: {
    fontSize: 14,
    color: "#84919D",
    fontWeight: "400",
    marginBottom: "10%",
    textAlign: "left",
  },
});

export default OnboardingText;
