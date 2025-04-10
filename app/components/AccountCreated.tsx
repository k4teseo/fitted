import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FittedLogo } from "@/assets/images/FittedLogo";
import ConfettiCannon from "react-native-confetti-cannon";
import OnboardingButton from "./OnboardingButton";

interface AccountCreatedProps {
  showConfetti: boolean;
  onNext: () => void;
}

const AccountCreated: React.FC<AccountCreatedProps> = ({ showConfetti, onNext }) => {
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

        <OnboardingButton
          style={styles.nextButton}
          onPress={onNext}
          title="Next"
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
    justifyContent: 'space-between',
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
    fontSize: 32,
    fontWeight: "700",
    color: "#B9CADB",
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 17,
    color: "#84919D",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: "#4DA6FD",
    marginBottom: 120,
  },
  logoContainer: {
    alignItems: "flex-start",
    marginTop: 32,
    marginLeft: -10,
    marginBottom: 56,
  },
});

export default AccountCreated;