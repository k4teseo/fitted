import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { FittedLogo } from "@/assets/images/FittedLogo";
import { useRouter } from "expo-router";
import OnboardingButton from "../components/OnboardingButton";
import images from "@/assets/images/OnboardingImages";

export default function WelcomePage() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    background: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    content: {
      position: "absolute",
      bottom: height * 0.18,
      justifyContent: "center",
      alignItems: "flex-start",
      width: "80%",
    },

    subtitle: {
      color: "#F5EEE3",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "left",
      marginTop: "6%",
      marginVertical: "3%",
      width: "93%",
    },
    signUpButton: {
      backgroundColor: "#4DA6FD",
    },
    loginButton: {
      backgroundColor: "#A0C9F1",
    },
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: images[imageIndex] }}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <FittedLogo width={285} height={99} />

          <Text style={styles.subtitle}>Keep It Casual, Share the Style.</Text>

          <OnboardingButton
            title="Sign Up"
            onPress={() => router.push("/pages/signupPage")}
            style={styles.signUpButton}
          />
          <OnboardingButton
            title="Log In"
            onPress={() => router.push("/pages/loginPage")}
            style={styles.loginButton}
          />
        </Animated.View>
      </ImageBackground>
    </View>
  );
}
