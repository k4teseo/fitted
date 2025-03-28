import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const LoginPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.redirectText}>
        Don't have an account? <Text style={styles.link}>Sign up</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 12, backgroundColor: "#FFF", borderColor: "#DDD" },
  button: { backgroundColor: "#4DA6FD", padding: 12, borderRadius: 8, marginTop: 10, width: "80%", alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  redirectText: { marginTop: 15, color: "#666" },
  link: { color: "#4DA6FD", fontWeight: "bold" },
});

export default LoginPage;
