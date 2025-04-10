import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  AppState,
  TextInput
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import OnboardingInput from "../components/OnboardingInput";
import OnboardingButton from "../components/OnboardingButton";
import { FittedLogo } from "@/assets/images/FittedLogo";
import AccountCreated from "../components/AccountCreated";


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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const handleAppStateChange = async (state: string) => {
      if (state === "active") {
        await supabase.auth.startAutoRefresh();
      } else {
        await supabase.auth.stopAutoRefresh();
      }
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    return () => appStateSubscription.remove();
  }, []);

  const handleNext = () => {
    router.push({
      pathname: "/pages/onboardingProfileSetup/[userId]",
      params: { userId },
    });
  }

  async function signUpWithEmail() {
    setLoading(true);
    console.log("Signing up with:", email);
  
    const { data, error } = await supabase.auth.signUp({
      email: email as string,
      password: password,
    });
  
    if (error || !data?.user) {
      console.error("Error details:", error);
      Alert.alert("Error", error?.message || "User creation failed");
      setLoading(false);
      return;  // Early exit on error
    }
  
    const userId = data.user.id;
    setUserId(userId);
    console.log("Created user with ID:", userId);
    console.log("Inserting into profiles with email:", email); 
    
    const { error: insertError } = await supabase
      .from("profiles")
      .upsert([
        {
          id: userId, 
          email: email,
          name: "Default Name", // Or you can leave it blank or use a dynamic value
        },
      ]);
  
    if (insertError) {
      console.log("Insert error:", insertError);
      Alert.alert("Database Error", insertError.message);
      setLoading(false);
      return;  // Early exit on insert error
    }
  
    // Success, continue with the navigation
    setLoading(false);
    setShowConfetti(true);
    setShowSuccessPage(true);
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

  if (showSuccessPage) {
    return <AccountCreated showConfetti={showConfetti} onNext={handleNext} />;
  }

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

        <View style={styles.inputContainer}>
          <View style={styles.inputBorder}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#383C40"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={togglePasswordVisibility}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color="#84919D" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
            {passwordValid.specialChar ? "✓ " : "• "}One special character (e.g., !@#$)
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
          onPress={() => {
            if (!loading && passwordValid.length && passwordValid.number && passwordValid.specialChar) {
              signUpWithEmail();  // No need to check the result
            }
          }}
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
  inputContainer: {
    marginBottom: 24,
    position: "relative",
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: "#626A73",
    borderRadius: 4,
    padding: 16,
    paddingTop: 20,
  },
  inputLabel: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#0F1112",
    paddingHorizontal: 5,
    fontSize: 12,
    color: "#7F8D9A",
    fontWeight: "400",
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordInput: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
    paddingTop: 4,
  },
  eyeIcon: {
    marginLeft: 10,
  },
});

export default PasswordPage;