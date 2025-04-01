import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { FittedLogo } from "@/assets/images/FittedLogo";
import OnboardingButton from "../components/OnboardingButton";
import OnboardingInput from "../components/OnboardingInput";
import BackButton from "../components/BackButton";
import DividerLine from "../components/DividerLine";
import ThirdPartyAuthButton from "../components/ThirdPartyAuthButton";
import OnboardingText from "../components/OnboardingText";

const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string): void => {
    setEmail(text);
    setIsEmailValid(validateEmail(text) || text.length === 0);
  };

  const handleGoogleSignIn = (): void => {
    console.log("Google sign in pressed");
  };

  const handleAppleSignIn = (): void => {
    console.log("Apple sign in pressed");
  };

  const handleNext = (): void => {
    const isValid = validateEmail(email);
    setIsEmailValid(isValid);
    if (isValid && email.length > 0) {
      console.log("Next pressed with email:", email);
      router.push({
        pathname: "./passwordPage",
        params: { email },
      });
    }
  };

  return (
    <View style={styles.background}>
      <BackButton />

      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FittedLogo width={238} height={74} />
        </View>

        <OnboardingText
          title="Enter your Email Address"
          description="Sign up and get started with your email address."
        />

        <OnboardingInput
          title="Email Address"
          placeholder="example@gmail.com"
          value={email}
          handleChange={handleEmailChange}
          keyboardType="email-address"
          isValid={isEmailValid}
          errorMessage="Please enter a valid email address."
        />

        <OnboardingButton
          title="Next"
          onPress={handleNext}
          style={[
            styles.nextButton,
            email.length > 0 && styles.nextButtonActive,
          ]}
        />

        <DividerLine />

        <ThirdPartyAuthButton
          onPress={handleAppleSignIn}
          title="Continue with Apple"
          icon="apple"
        />

        <ThirdPartyAuthButton
          onPress={handleGoogleSignIn}
          title="Continue with Google"
          icon="google"
        />

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
  logoContainer: {
    alignItems: "flex-start",
    marginTop: 32,
    marginLeft: -10,
    marginBottom: 56,
  },
  nextButton: {
    backgroundColor: "#6D757E",
    marginTop: 0,
    alignItems: "center",
    marginBottom: 16,
  },
  nextButtonActive: {
    backgroundColor: "#4DA6FD",
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
