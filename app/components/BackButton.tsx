import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const BackButton = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const handleBack = (): void => {
    router.back();
  };

  const styles = StyleSheet.create({
    backButton: {
      position: "absolute",
      top: height * 0.07,
      left: width * 0.07,
      zIndex: 1,
    },
  });

  return (
    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
      <MaterialIcons name="navigate-before" size={30} color="white" />
    </TouchableOpacity>
  );
};

export default BackButton;
