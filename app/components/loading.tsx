import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4DA6FD" />
            <Text style={styles.loadingText}>Uploading and analyzing outfit...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#15181B",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#F5EEE3",
    },
});