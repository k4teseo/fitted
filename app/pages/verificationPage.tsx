import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { FittedLogo } from "@/assets/images/FittedLogo";

const VerificationPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isError, setIsError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputs = useRef<TextInput[]>(Array(6).fill(null));
  const phoneNumber = params.phoneNumber as string || "(123) 456-7890";

  useEffect(() => {
    if (!isVerified) {
      inputs.current[0]?.focus();
    }
  }, [isVerified]);

  const handleVerify = () => {
    const code = digits.join("");
    console.log("Verification code submitted:", code);
    
    // Mock verification - replace with your actual verification logic
    if (code === "123456") { // Example correct code
      setIsVerified(true);
    } else {
      setIsError(true);
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    console.log("Resending verification code");
    setIsError(false);
    setDigits(Array(6).fill(""));
    inputs.current[0]?.focus();
  };

  const handleBack = () => {
    router.back();
  };

  const handleBackToSignup = () => {
    router.replace("./signupPage");
  };

  const handleContinue = () => {
    router.replace("./feedPage");
  };

  const handleChangeText = (text: string, index: number) => {
    setIsError(false);
    const numericText = text.replace(/[^0-9]/g, "");
    const newDigits = [...digits];
    
    const firstEmptyIndex = newDigits.findIndex(d => d === "");
    const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : index;
    
    newDigits[targetIndex] = numericText;
    setDigits(newDigits);

    if (numericText && targetIndex < 5) {
      const nextEmptyIndex = newDigits.findIndex((d, i) => i > targetIndex && d === "");
      if (nextEmptyIndex !== -1) {
        inputs.current[nextEmptyIndex]?.focus();
      }
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }: { nativeEvent: { key: string } }, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const lastFilledIndex = [...digits].reverse().findIndex(d => d !== "");
      const prevIndex = lastFilledIndex !== -1 ? 5 - lastFilledIndex : index - 1;
      
      const newDigits = [...digits];
      newDigits[prevIndex] = "";
      setDigits(newDigits);
      
      inputs.current[prevIndex]?.focus();
    }
  };

  if (isVerified) {
    return (
      <View style={styles.background}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToSignup}>
          <MaterialIcons name="navigate-before" size={30} color="white" />
        </TouchableOpacity>

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
              Your phone number +1 {phoneNumber} has been successfully verified.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to App</Text>
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

        <Text style={styles.subheader}>Enter the 6-digit code</Text>
        <Text style={styles.description}>
          A verification code has been sent via text to +1 {phoneNumber}
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Enter your verification code</Text>
          <View style={styles.codeInputContainer}>
            {Array(6).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={ref => inputs.current[index] = ref as TextInput}
                style={[
                  styles.codeInput,
                  digits[index] && styles.codeInputFilled,
                  isError && styles.codeInputError
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digits[index]}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectionColor="#4DA6FD"
              />
            ))}
          </View>
          {isError && (
            <Text style={styles.errorText}>Invalid verification code. Please try again.</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton, 
            digits.every(d => d) && styles.nextButtonActive,
            isError && styles.nextButtonError
          ]} 
          onPress={handleVerify}
          disabled={!digits.every(d => d)}
        >
          <Text style={styles.nextButtonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>Not seeing code? Try Again</Text>
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
  codeContainer: {
    marginBottom: 24,
    position: "relative",
  },
  codeLabel: {
    color: "#7F8D9A",
    fontSize: 12,
    marginBottom: 16,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 60,
    borderWidth: 1,
    borderColor: "#626A73",
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: 24,
    textAlign: "center",
  },
  codeInputFilled: {
    borderColor: "#4DA6FD",
  },
  codeInputError: {
    borderColor: '#FF3B30',
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
  nextButtonError: {
    backgroundColor: "#FF3B30",
  },
  nextButtonText: {
    color: "#F5EEE3",
    fontSize: 16,
    fontWeight: "600",
  },
  resendText: {
    color: "#4DA6FD",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
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
  continueButton: {
    backgroundColor: "#4DA6FD",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 40,
  },
  continueButtonText: {
    color: "#F5EEE3",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VerificationPage;