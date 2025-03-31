import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { FittedLogo } from "@/assets/images/FittedLogo";
import { supabase } from "@/lib/supabase";
import OnboardingButton from "../components/OnboardingButton";
import OnboardingInput from "../components/OnboardingInput";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const PasswordPage = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    number: false,
    specialChar: false,
  });
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
    router.push("./onboardingProfileSetup");
  }

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordValid({
      length: text.length >= 8,
      number: /\d/.test(text),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(text),
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.background}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="navigate-before" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FittedLogo width={238} height={74} />
        </View>

        <Text style={styles.subheader}>Create a Password</Text>
        <Text style={styles.description}>
          Please create a secure password to complete your account setup.
        </Text>

        <OnboardingInput
          title="Password"
          placeholder="Enter your password"
          value={password}
          handleChange={handlePasswordChange}
          isPassword={true}
          showPassword={showPassword}
          togglePasswordVisibility={togglePasswordVisibility}
        />

        <View style={styles.validationContainer}>
          <Text
            style={[
              styles.validationText,
              passwordValid.length && styles.validationSuccess,
            ]}
          >
            {passwordValid.length ? "✓ " : "• "}Minimum 8 characters
          </Text>
          <Text
            style={[
              styles.validationText,
              passwordValid.number && styles.validationSuccess,
            ]}
          >
            {passwordValid.number ? "✓ " : "• "}One number
          </Text>
          <Text
            style={[
              styles.validationText,
              passwordValid.specialChar && styles.validationSuccess,
            ]}
          >
            {passwordValid.specialChar ? "✓ " : "• "}One special character
            (e.g., !@#$)
          </Text>
        </View>

        <OnboardingButton
          title="Create Account"
          style={[
            styles.nextButton,
            passwordValid.length &&
            passwordValid.number &&
            passwordValid.specialChar
              ? styles.nextButtonActive
              : null,
          ]}
          onPress={signUpWithEmail}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#0F1112",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 100,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "flex-start",
    marginTop: 32,
    marginLeft: -10,
    marginBottom: 56,
  },
  subheader: {
    fontSize: 25,
    fontWeight: "400",
    color: "#B9CADB",
    marginBottom: 8,
    textAlign: "left",
  },
  description: {
    fontSize: 12,
    color: "#84919D",
    fontWeight: "400",
    marginBottom: 32,
    textAlign: "left",
  },
  validationContainer: {
    marginBottom: 32,
  },
  validationText: {
    color: "#84919D",
    fontSize: 12,
    marginBottom: 8,
  },
  validationSuccess: {
    color: "#47BD78",
  },
  nextButton: {
    backgroundColor: "#6D757E",
  },
  nextButtonActive: {
    backgroundColor: "#4DA6FD",
  },
});

export default PasswordPage;
