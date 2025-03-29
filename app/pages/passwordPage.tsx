import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { FittedLogo } from "@/assets/images/FittedLogo";
import ConfettiCannon from 'react-native-confetti-cannon';

const PasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    number: false,
    specialChar: false
  });
  const [accountCreated, setAccountCreated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (accountCreated) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [accountCreated]);

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordValid({
      length: text.length >= 8,
      number: /\d/.test(text),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(text)
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = () => {
    if (passwordValid.length && passwordValid.number && passwordValid.specialChar) {
      setAccountCreated(true);
    }
  };

  const handleNext = () => {
    router.replace("./onboardingProfileSetup");
  };

  if (accountCreated) {
    return (
      <View style={styles.background}>
        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut={true}
            autoStart={true}
          />
        )}
        
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <FittedLogo width={238} height={74} />
          </View>

          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={100} color="#47BD78" />
            </View>
            <Text style={styles.successTitle}>Congratulations!</Text>
            <Text style={styles.successText}>
              Your Fitted account is all set! Ready to continue?
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.nextButton, styles.nextButtonActive]} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Enter your password"
                placeholderTextColor="#383C40"
                selectionColor="#4DA6FD"
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
          <Text style={[styles.validationText, passwordValid.length && styles.validationSuccess]}>
            {passwordValid.length ? "✓ " : "• "}Minimum 8 characters
          </Text>
          <Text style={[styles.validationText, passwordValid.number && styles.validationSuccess]}>
            {passwordValid.number ? "✓ " : "• "}One number
          </Text>
          <Text style={[styles.validationText, passwordValid.specialChar && styles.validationSuccess]}>
            {passwordValid.specialChar ? "✓ " : "• "}One special character (e.g., !@#$)
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            passwordValid.length && passwordValid.number && passwordValid.specialChar 
              ? styles.nextButtonActive 
              : null
          ]} 
          onPress={handleSubmit}
          disabled={!(passwordValid.length && passwordValid.number && passwordValid.specialChar)}
        >
          <Text style={styles.nextButtonText}>Create Account</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
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
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
    paddingLeft: 10,
  },
  eyeIcon: {
    marginRight: 10,
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
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  nextButtonActive: {
    backgroundColor: "#4DA6FD",
  },
  nextButtonText: {
    color: "#F5EEE3",
    fontSize: 16,
    fontWeight: "600",
  },
  // Success screen styles
  successContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "#B9CADB",
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    color: "#84919D",
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PasswordPage;