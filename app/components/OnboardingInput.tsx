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
    input: {
      color: "#FFFFFF",
      fontSize: 16,
      paddingTop: 4,
    },
    inputContainer: {
      marginBottom: 24,
      position: "relative",
    },
    inputBorder: {
      borderWidth: 1,
      borderColor: isValid ? "#626A73" : "#FF6B6B",
      borderRadius: 4,
      padding: 16,
    },
    inputLabel: {
      position: "absolute",
      top: -10,
      left: 10,
      backgroundColor: "#0F1112",
      paddingHorizontal: 5,
      fontSize: 12,
      color: isValid ? "#7F8D9A" : "#FF6B6B",
      fontWeight: "400",
    },
    passwordInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    errorText: {
      color: "#FF6B6B",
      fontSize: 12,
      marginTop: 5,
    },
    inputError: {
      borderColor: "#FF3B30",
    },
    inputLabelError: {
      color: "#FF3B30",
    },
  });

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputBorder}>
        <Text style={styles.inputLabel}>{title}</Text>
        <View style={isPassword ? styles.passwordInputWrapper : undefined}>
          <TextInput
            style={[styles.input, style as TextStyle]}
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
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#84919D"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!isValid && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

export default OnboardingInput;
