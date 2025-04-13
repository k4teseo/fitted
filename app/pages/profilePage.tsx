import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import { supabase } from "@/lib/supabase";
import FriendRequestPage from './friendRequestPage';
import SignOutButton from '../components/signOut';
import { useCurrentUser } from '../hook/useCurrentUser'; // Import the custom hook

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("profile");
    const { width, height } = useWindowDimensions();
    const [showSettings, setShowSettings] = useState(false);
    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [friendCount, setFriendCount] = useState(0);

    const currentUserId = useCurrentUser(); // Use the custom hook to get the current user ID

    useEffect(() => {
        const fetchFriendCount = async () => {
            if (!currentUserId) return; // Ensure currentUserId is available before querying

            const {data, error} = await supabase
                .from('friends')
                .select('*', {count: 'exact'})
                .or(`user_id_1.eq.${currentUserId}, user_id_2.eq.${currentUserId}`)
                .eq('status', 'accepted');
            if (error) {
                console.error('Error fetching friend count:', error);
            } else {
                setFriendCount(data.length);
            }
        };
        fetchFriendCount();
    }, [currentUserId]);

    const styles = StyleSheet.create({
        container: { 
            flex: 1, 
            backgroundColor: "#15181B" 
        },
        header: {
            height: height * 0.17, 
            justifyContent: "center",
            paddingHorizontal: width * 0.05,
            alignItems: "center",
        },
        headerIconsContainer: {
            position: "absolute",
            top: height * 0.07,
            right: width * 0.05,
            flexDirection: "row",
            gap: width * 0.04,
        },
        iconButton: {
            padding: 6,
        },

        // Profile Section
        profileSection: {
            alignItems: "center",
            marginTop: -height * 0.05,
        },
        profileImage: {
            width: width * 0.28,
            height: width * 0.28,
            borderRadius: (width * 0.28) / 2,
            backgroundColor: "gray",
            borderWidth: 3,              
            borderColor: "#63B1FF", 
        },
        nameText: {
            color: "#C7D1DB", 
            fontSize: 20, 
            textAlign: "center", 
            marginTop: height * 0.012,
            fontWeight: 700
        },
        usernameText: {
            color: "#919CA9",
            fontSize: 12,
            textAlign: "center",
            fontWeight: 400,
            marginTop: 6
        },

        // Stats Section
        statsContainer: {
            flexDirection: "row",
            justifyContent: "center",
            marginTop: height * 0.015,
            gap: width * 0.1,
            marginBottom: height * 0.015,
        },
        statItem: {
            flexDirection: "row", // Changed to row to align horizontally
            alignItems: "center", // Center vertically
            marginHorizontal: 5,
        },
        statNumber: { 
            color: "#9AA8B6", 
            fontSize: 18, 
            fontWeight: 600, 
            marginRight: 8
        },
        statLabel: { 
            color: "#919CA9", 
            fontSize: 16,
            fontWeight: 400, 
        },

        // Edit Profile Button
        editProfileButton: {
            backgroundColor: "transparent",
            borderWidth: 0.5,
            borderColor: "#858E9A",
            paddingVertical: height * 0.008,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            width: width * 0.5, 
            alignSelf: 'center', 
            marginTop: height * 0.01,
            marginBottom: height * 0.03,
        },
        editProfileButtonText: {
            color: "#919CA9",
            fontSize: 14,
            fontWeight: "400",
        },

        // My Outfits Button
        body: {
            flex: 1,
            backgroundColor: "#212629",
            alignItems: "center",
            paddingTop: height * 0.02,
            borderTopLeftRadius: width * 0.09,
            borderTopRightRadius: width * 0.09,
        },
    });

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
    const [outfitsCount, setOutfitsCount] = useState(0);

    useEffect(() => {
        const getUserData = async () => {
            try {
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

                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("username, pfp, name")
                        .eq("id", id)
                        .single();

                    if (profileError) {
                        console.error("Error fetching profile:", profileError.message);
                    } else {
                        setName(profile.name || "User"); // Set the name from profile.name
                        setUsername(`@${profile.username}` || "@unknown");
                        setProfileImageUrl(profile.pfp || defaultPfp);
                    }
                } else {
                    console.log("No user ID found. User might not be logged in.");
                }
            } catch (err: any) {
                console.error("Error:", err.message);
            }
        };

        getUserData();
    }, []);

    const handleEditProfile = () => {
        // Add edit profile functionality here
        console.log("Edit profile button pressed");
        // router.push('/editProfile');
    };

    return (
        <View style={styles.container}>
            {showFriendRequests && (
                <FriendRequestPage onClose={() => setShowFriendRequests(false)} />
            )}
            <View style={styles.header}>
                <View style={styles.headerIconsContainer}>
                    <TouchableOpacity
                        onPress={() => setShowFriendRequests(true)}
                        style={styles.iconButton}
                    >
                        <Ionicons name="person-add" size={24} color="white" />
                    </TouchableOpacity>
                        <SignOutButton /> 
                </View>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.profileImage}
                />
            </View>

            {/* Username and Stats */}
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.usernameText}>{username}</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{friendCount}</Text>
                    <Text style={styles.statLabel}>Friends</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{outfitsCount}</Text>
                    <Text style={styles.statLabel}>Outfits</Text>
                </View>
            </View>
            
            {/* Edit Profile Button */}
            <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={handleEditProfile}
            >
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            {/* Body Section */}
            <View style={styles.body}>
            </View>

            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
}
