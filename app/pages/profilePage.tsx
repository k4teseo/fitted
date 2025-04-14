import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, useWindowDimensions} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons} from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
    const { width, height } = useWindowDimensions();

    const styles = StyleSheet.create({
        container: { 
            flex: 1, 
            backgroundColor: "#1D1E23" },
        header: {
            height: height * 0.17, 
            justifyContent: "center",
            paddingHorizontal: width * 0.05,
            alignItems: "center",
        },
        settingsIcon: { 
            position: "absolute", 
            top: height * 0.07, 
            right: width * 0.05 
        },
      
        // Profile Section
        profileSection: {
            alignItems: "center",
            marginTop: -height * 0.05,
        },
        profileImage: {
            width: width * 0.25,
            height: width * 0.25,
            borderRadius: (width * 0.25) / 2,
            backgroundColor: "gray",
        },
        uploadIcon: {
            position: "absolute",
            bottom: height * 0.005,
            right: width * 0.35,
            backgroundColor: "black",
            borderRadius: 30,
            padding: width * 0.025,
        },
        username: { 
            color: "white", 
            fontSize: 20, 
            textAlign: "center", 
            marginTop: height * 0.02 
        },
      
        // Stats Section
        statsContainer: {
            flexDirection: "row",
            justifyContent: "center",
            marginTop: height * 0.015,
            gap: width * 0.1,
        },
        statItem: {
            alignItems: "center",
            marginHorizontal: 20,
        },
        statNumber: { 
            color: "white", 
            fontSize: 18, 
            fontWeight: "bold" },
        statLabel: { 
            color: "gray", 
            fontSize: 14 },
      
        // My Outfits Button
        body: {
            flex: 1,
            backgroundColor: "#eee",
            alignItems: "center",
            paddingTop: height * 0.02,
            borderTopLeftRadius: width * 0.08, // Adds smooth curve at the top
            borderTopRightRadius: width * 0.08,
        },
        outfitsButton: {
            backgroundColor: "lightgray",
            paddingVertical: height * 0.02,
            paddingHorizontal: width * 0.1,
            borderRadius: 10,
        },
    });

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
    const [outfitsCount, setOutfitsCount] = useState(0); // We'll count user posts later

    useEffect(() => {
        const getUserData = async () => {
            try {
                // Log session fetch
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                  console.error("Error fetching session:", error.message);
                } else {
                  console.log("Session fetched:", session);
                }
        
                const id = session?.user?.id ?? null;
                setUserId(id);
                if (id) {
                    console.log("User ID found:", id);
        
                    // Fetch profile data
                    const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("username, pfp")
                    .eq("id", id)
                    .single();
                    
                    if (profileError) {
                        console.error("Error fetching profile:", profileError.message);
                    } else {
                        console.log("Profile fetched:", profile);
                        setUsername(profile.username || "Unknown");
                        setProfileImageUrl(profile.pfp || defaultPfp);
                        console.log("Updated Profile Image URL:", profileImageUrl);
                    }
                } else {
                    console.log("No user ID found. User might not be logged in.");
                }
            } catch (err: any) {  // Using 'any' here temporarily
                console.error("Error:", err.message);
            }
        };
    
        getUserData();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.settingsIcon}>
                    <Ionicons name="settings" size={24} color="white" />
                </TouchableOpacity>
            </View>
            {/* Profile Section */} 
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.profileImage}
                />
                <TouchableOpacity style={styles.uploadIcon}>
                    <Ionicons name="camera" size={16} color="white" />  
                </TouchableOpacity>
            </View>
            {/* Username and Stats */}
            <Text style={styles.username}>{username}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>0</Text>
                    <Text style={styles.statLabel}>Friends</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>0</Text>
                    <Text style={styles.statLabel}>Outfits</Text>
                </View>
            </View>
            {/* Body Section */}
            <View style={styles.body}>
                <TouchableOpacity style={styles.outfitsButton}>
                    <Text>My Outfits</Text>
                </TouchableOpacity>
            </View>
            <BottomNavBar />
        </View>
    );
}