import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: object;
}

const OnboardingButton: React.FC<ButtonProps> = ({ onPress, title, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4DA6FD",
    padding: "3.5%",
    borderRadius: 8,
    marginTop: "6%",
    width: "99%",
    alignItems: "center",
  },
  buttonText: {
    color: "#F5EEE3",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingButton;
