import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FittedLogo } from "@/assets/images/FittedLogo";
import { useRouter } from "expo-router";
import OnboardingButton from "./OnboardingButton";
import { MaterialIcons } from "@expo/vector-icons";

export default function AccountCreated() {
  const router = useRouter();

  const handleNext = () => {
    router.replace("./onboardingProfileSetup");
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
    nextButton: {
      backgroundColor: "#6D757E",
    },
    logoContainer: {
      alignItems: "flex-start",
      marginTop: 32,
      marginLeft: -10,
      marginBottom: 56,
    },
  });

  return (
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

      <OnboardingButton
        style={styles.nextButton}
        onPress={handleNext}
        title="Next"
      />
    </View>
  );
}
