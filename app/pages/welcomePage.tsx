import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    ImageBackground, 
    TouchableOpacity, 
    StyleSheet, 
    Animated,
    Dimensions
} from "react-native";
import { FittedLogo } from "../Icons"; // Import the FittedLogo from Icons.tsx
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons

const images = [
  "https://s3-alpha-sig.figma.com/img/4796/a1aa/d8067b3b9d6f627cb1b398b62868f431?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=cjlmPGL1VUkcS7CscrL0oipGP1-juAKYMsbYRBEUUtwtnK5m3AAUus5jZFTOKSZvpkkwmUq6YjnKPjDs05lZ8xJbq3weeuPZgkYXck-vj~mioAp99e92OLa2gUnR3pR13FE33aL2u1gWdvmB2a61Nyh8-zj5A3~rqWyROWVPxIveDNb0jKkY84vEOe5mLo7NKx2CdHDAV~WzQA358fP3ta~b1~-fR~BbrAJySZQU~oPuFykK4apRg3fKNIIsPIRzE2xoGWL32wmTgvQuf1G87msDvJ2waROVgobd4~tQE~P5yejajPDIhpp-bZxJ6DkXGjbuae9YwvbJ2Eb0viI6KA__",
  "https://s3-alpha-sig.figma.com/img/19be/9e80/d980258ece1a381752e82f381ef0799f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=JANT1bDR8RhDofG4S~5vSyGzFx2HwEPQ8M97beYgZTSzVgTeLFCh1rjv0HzznWyAlcTaHyyEa6oPi1EbyBaYr7qn3Zc4AJ7AWt1yZ4Ev9ObGrxOcQ66mjpSP2l28MDJPQGv2yDAYHlfZVbBpY4-LxbcMvbuQp0gmDQ6ra-BhHf5Bqkk-FWq8rWwayIN6JeWrwrWK7NHef-A6m~W2GpXJnUUxvVPuicg6LU104ArUea6gLXpzbl~fGd7mgdCo5hq4U53L4JfXkcRC7QAgEJPD9Xh6AGTngkftoJFIb0CCyv9K1tfISI2RQYBjYwmXQ5uBeRWe90eZc9v1OHvYmt7fVA__",
  "https://s3-alpha-sig.figma.com/img/a8b5/a104/c8a90b8e0f894198a94d121dbdefb6ca?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=T3DhQgxfeWhqpZiuYYhPUc6bXWAhxGHQ5~mlrVIslvNnpIUE1IhnLBlDl16Ml4Ul5sc6MsqFAnG9bH6x~iOed98p1cG4JPfOAwxLU8VhQYc4MGRgeBj5a3cNLfOpfXdtKYE4sSm78wRDjKBEBk-rDHJuytjpaRvTZrxdg~l5svTcjf9UcxPoyrz3hxCDQ-PC3Zi6tcE~imwiH3UXURIkmgB5mv2of6vZW2IEFV~SoNxhKkVMKGasYiMhlxf1phKXYPJqgJU8W1xEsZdvCEIppwxOvQP3DQIkztgHum9OsQL-bJzEyaxZ8r1QNsXmM3-SYc-t-iY9Q6Aw0P8Z2dFg2g__"
];

const { width, height } = Dimensions.get("window"); // Get screen dimensions

const WelcomePage = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];

  // Image auto-change every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fade animation when switching screens
  const handleTransition = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowLoginOptions(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Handle back arrow press to return to "Get Started"
  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowLoginOptions(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow Positioned at Top Left */}
      {showLoginOptions && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
      )}

      <ImageBackground 
        source={{ uri: images[imageIndex] }} 
        style={[styles.background, { width, height }]} // Ensure it covers the full screen size
        resizeMode="cover" // Makes sure the image covers the full screen without distorting
      >
        <View style={styles.overlay} />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo */}
          <FittedLogo width={316} height={99} />
          
          {!showLoginOptions ? (
            <>
              <Text style={styles.subtitle}>Keep It Casual, Share the Style.</Text>
              <TouchableOpacity style={styles.button} onPress={handleTransition}>
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <SignUpButton />
              <LoginButton />
            </>
          )}
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

// Separate SignUpButton and LoginButton components
const SignUpButton = () => (
  <TouchableOpacity style={styles.signUpButton}>
    <Text style={styles.buttonText}>Sign Up</Text>
  </TouchableOpacity>
);

const LoginButton = () => (
  <TouchableOpacity style={styles.loginButton}>
    <Text style={styles.buttonText}>Log In</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0,0,0,0.3)" 
  },
  content: { 
    position: "absolute", 
    bottom: 112, 
    left: 37, 
    right: 37, 
    alignItems: "center", // Center the content horizontally
    justifyContent: "center", // Align items vertically in the center
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: { 
    fontSize: 48, 
    fontWeight: "bold", 
    color: "#D1E1FF" 
  },
  subtitle: { 
    color: "#F5EEE3", 
    fontSize: 18, 
    fontWeight: 600,
    textAlign: "left",
    marginTop: 20,
    marginVertical: 10,
    width: "93%",
  },
  button: { 
    backgroundColor: "#4DA6FD", 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 35, 
    width: 300, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "#F5EEE3", 
    fontSize: 18, 
    fontWeight: 600,
  },
  signUpButton: {
    backgroundColor: "#4DA6FD", 
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    width: 300,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#A0C9F1",
    padding: 12,
    borderRadius: 8,
    marginTop: 28,
    width: 300,
    alignItems: "center",
  },
});

export default WelcomePage;
