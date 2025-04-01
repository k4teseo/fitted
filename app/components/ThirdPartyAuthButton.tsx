import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import GoogleSVG from "@/assets/images/GoogleSVG";

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: object;
  icon?: "apple" | "google";
}

const ThirdPartyAuthButton: React.FC<ButtonProps> = ({
  onPress,
  title,
  icon,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      {icon === "apple" && (
        <MaterialIcons name="apple" size={27} color="black" />
      )}
      {icon === "google" && <GoogleSVG />}
      <Text style={[styles.buttonText]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ThirdPartyAuthButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF",
    padding: "3.5%",
    borderRadius: 8,
    marginTop: "6%",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#383C40",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: "3%",
  },
});
