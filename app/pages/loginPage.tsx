import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { FittedLogo } from "@/assets/images/FittedLogo";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [inputType, setInputType] = useState<"email" | "phone">("email");

  const authenticateUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data.user;
  };
  

  const handleGoogleSignIn = () => {
    console.log("Google sign in pressed");
  };

  const handleAppleSignIn = () => {
    console.log("Apple sign in pressed");
  };

  const handleLogin = async () => {
    // Validate that both fields are filled
    if (email.length === 0 || password.length === 0) {
      setError("Please fill in all fields");
      setEmailError(email.length === 0);
      setPasswordError(password.length === 0);
      return;
    }

    setLoading(true);
    setError("");
    setEmailError(false);
    setPasswordError(false);

    try {
      const isAuthenticated = await authenticateUser(email, password);
      
      if (isAuthenticated) {
        router.replace("./feedPage"); // Navigate to home on success
      } else {
        setError("Invalid email or password");
        setEmailError(true);
        setPasswordError(true);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBack = () => {
    router.back();
  };

  // Handle changes to the email/phone input field
  const handleInputChange = (text: string) => {
    setEmail(text);
    setEmailError(false);
    setError("");
    
    // Detect whether user is entering email or phone number
    if (/[\d\+\-\(\)]/.test(text)) {
      setInputType("phone");
    } else if (text.includes("@")) {
      setInputType("email");
    }
  };

  return (
    <View style={styles.background}>
      {/* Back button at top left */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="navigate-before" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Logo at top */}
        <View style={styles.logoContainer}>
          <FittedLogo width={238} height={74} />
        </View>

        {/* Header text */}
        <Text style={styles.subheader}>Login to your account</Text>
        <Text style={styles.description}>
          Welcome back! Please enter your details.
        </Text>

        {/* Email or phone number Input */}
        <View style={styles.inputContainer}>
          <View style={[
            styles.inputBorder,
            emailError && styles.inputError
          ]}>
            <Text style={[
              styles.inputLabel,
              emailError && styles.inputLabelError
            ]}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email or phone"
              placeholderTextColor="#383C40"
              keyboardType={inputType === "email" ? "email-address" : "phone-pad"}
              value={email}
              onChangeText={handleInputChange}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={[
            styles.inputBorder,
            passwordError && styles.inputError
          ]}>
            <Text style={[
              styles.inputLabel,
              passwordError && styles.inputLabelError
            ]}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#383C40"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(false);
                  setError("");
                }}
              />
              {/* Show/hide password toggle */}
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
          {/* Error message display */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            email.length > 0 && password.length > 0 && styles.nextButtonActive,
            loading && styles.disabledButton
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#F5EEE3" />
          ) : (
            <Text style={styles.nextButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        >
          <MaterialIcons name="apple" size={25} color="black" />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

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

        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Link href="./signupPage" style={styles.footerLink}>
            Sign up
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
  inputError: {
    borderColor: '#FF3B30',
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
  inputLabelError: {
    color: '#FF3B30',
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingTop: 4,
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
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
  disabledButton: {
    opacity: 0.7,
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

export default LoginPage;