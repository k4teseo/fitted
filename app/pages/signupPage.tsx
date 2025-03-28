import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { FittedLogo } from "@/assets/images/FittedLogo";

const SignUpPage = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleGoogleSignIn = () => {
    console.log("Google sign in pressed");
  };

  const handleAppleSignIn = () => {
    console.log("Apple sign in pressed");
  };

  const handleEmailSignUp = () => {
    console.log("Email sign up pressed");
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (phoneNumber.length > 0) {
      console.log("Next pressed with phone number:", phoneNumber);
      // Add your navigation or form submission logic here
    }
  };

  return (
    <View style={styles.background}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="navigate-before" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Fitted Logo - Left Aligned */}
        <View style={styles.logoContainer}>
          <FittedLogo width={238} height={74} />
        </View>

        {/* Left Aligned Text */}
        <Text style={styles.subheader}>Enter your Phone Number</Text>
        <Text style={styles.description}>
          Sign up and get started with your phone number.
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputBorder}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="(___) ___-____"
              placeholderTextColor="#383C40"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            phoneNumber.length > 0 && styles.nextButtonActive,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple Sign In Button */}
        <TouchableOpacity
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        >
          <MaterialIcons name="apple" size={25} color="black" />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.7}
        >
          <View style={styles.googleButtonState} />
          <View style={styles.googleContentWrapper}>
            <View style={styles.googleIcon}>
              <Svg width={20} height={20} viewBox="0 0 48 48">
                <Path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <Path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <Path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <Path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </Svg>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={handleEmailSignUp}
        >
          <Text style={styles.emailButtonText}>Use Email Instead</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Link href="./loginPage" style={styles.footerLink}>
            Log in
          </Link>
        </Text>
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
    top: 30,
    left: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "flex-start",
    marginTop: 32,
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
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingTop: 4,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#383C40",
  },
  dividerText: {
    color: "#7F8A95",
    marginHorizontal: 8,
    opacity: 0.7,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: "center",
  },
  appleButtonText: {
    color: "#383C40",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 16,
  },
  googleButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#747775",
    borderRadius: 8,
    padding: 13,
    justifyContent: "center",
    marginBottom: 15,
  },
  googleButtonState: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#303030",
    opacity: 0,
  },
  googleContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 15,
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: "#383C40",
    fontWeight: "500",
    fontSize: 14,
  },
  emailButton: {
    padding: 12,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#626A73",
    borderRadius: 8,
    marginTop: 5,
  },
  emailButtonText: {
    color: "#6D757E",
    fontSize: 14,
    fontWeight: "500",
  },
  footerText: {
    color: "#F5EEE3",
    textAlign: "center",
    fontSize: 13,
    marginTop: 35,
    opacity: 0.8,
  },
  footerLink: {
    color: "#4DA6FD",
    fontWeight: "700",
  },
});

export default SignUpPage;
