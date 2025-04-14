import React from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface OnboardingInputProps {
  placeholder?: string;
  value: string;
  handleChange: (text: string) => void;
  style?: TextStyle | ViewStyle;
  title: string;
  isPassword?: boolean;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  keyboardType?: "default" | "email-address";
  isValid?: boolean;
  errorMessage?: string;
}

const OnboardingInput: React.FC<OnboardingInputProps> = ({
  placeholder,
  value,
  handleChange,
  style,
  title,
  isPassword = false,
  showPassword,
  togglePasswordVisibility,
  keyboardType = "default",
  isValid = true,
  errorMessage,
}) => {
  const styles = StyleSheet.create({
    inputContainer: {
      marginBottom: 24,
      width: "100%",
    },
    inputBorder: {
      borderWidth: 1,
      borderColor: isValid ? "#626A73" : "#FF6B6B",
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 54, // Ensures enough space for text
      backgroundColor: "#1E2225",
      flexDirection: "row",
      alignItems: "center", // Centers text and password icon
    },
    input: {
      color: "#FFFFFF",
      fontSize: 16,
      lineHeight: 22, // Prevents text from being cut off
      height: "100%", // Ensures full use of input space
      flex: 1, // Allows text input to expand properly
      paddingVertical: 0, // Removes extra padding that might clip text
    },
    inputLabel: {
      position: "absolute",
      top: -10,
      left: 12,
      backgroundColor: "#0F1112",
      paddingHorizontal: 5,
      fontSize: 12,
      color: isValid ? "#7F8D9A" : "#FF6B6B",
      fontWeight: "400",
    },
    passwordToggle: {
      padding: 10, // Ensures clickable area for eye icon
    },
    errorText: {
      color: "#FF6B6B",
      fontSize: 12,
      marginTop: 5,
    },
  });  

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputBorder}>
        <Text style={styles.inputLabel}>{title}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#383C40"
          value={value}
          onChangeText={handleChange}
          autoCapitalize="none"
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          selectionColor="#4DA6FD"
        />
        {isPassword && togglePasswordVisibility && (
          <TouchableOpacity style={styles.passwordToggle} onPress={togglePasswordVisibility}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#84919D"
            />
          </TouchableOpacity>
        )}
      </View>
      {!isValid && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

export default OnboardingInput;
