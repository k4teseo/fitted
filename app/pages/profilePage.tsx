import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, useWindowDimensions, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import { supabase } from "@/lib/supabase";
import FriendRequestPage from './friendRequestPage';
import SignOutButton from '../components/signOut';
import { useCurrentUser } from '../hook/useCurrentUser'; // Import the custom hook

const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("profile");
    const { width, height } = useWindowDimensions();
    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [friendCount, setFriendCount] = useState(0);
    const [outfitsCount, setOutfitsCount] = useState(0);
    const [recentOutfit, setRecentOutfit] = useState<any>(null);
    const [collections, setCollections] = useState<any[]>([]);

    const currentUserId = useCurrentUser(); // Use the custom hook to get the current user ID
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState(defaultPfp);

    const allCards = [
        { type: 'recent', data: recentOutfit },
        ...collections.map((c) => ({ type: 'collection', data: c }))
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUserId) return;

            // Fetch profile data
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("username, pfp, name")
                .eq("id", currentUserId)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError.message);
            } else {
                setName(profile.name || "User");
                setUsername(`@${profile.username}` || "@unknown");
                setProfileImageUrl(profile.pfp || defaultPfp);
            }

            // Fetch friend count
            const { data: friends, error: friendsError } = await supabase
                .from('friends')
                .select('*', { count: 'exact' })
                .or(`user_id_1.eq.${currentUserId}, user_id_2.eq.${currentUserId}`)
                .eq('status', 'accepted');

            if (friendsError) {
                console.error('Error fetching friend count:', friendsError);
            } else {
                setFriendCount(friends.length);
            }

            // Fetch outfits data
            const { data: outfits, error: outfitsError } = await supabase
                .from('images')
                .select('id, image_path, created_at')
                .eq('user_id', currentUserId)
                .order('created_at', { ascending: false });

            if (outfitsError) {
                console.error('Error fetching outfits:', outfitsError);
            } else {
                setOutfitsCount(outfits.length);
                if (outfits.length > 0) {
                    const mostRecent = outfits[0];
                    const publicUrl = supabase.storage.from('images').getPublicUrl(mostRecent.image_path).data.publicUrl;
                    setRecentOutfit({
                        id: mostRecent.id,
                        uri: publicUrl
                    });
                }
            }
            // Fetch collections data
            const { data: userCollections, error: collectionsError } = await supabase
                .from('collections')
                .select('*')
                .eq('user_id', currentUserId);

            if (collectionsError) {
                console.error('Error fetching collections:', collectionsError);
            } else {
                setCollections(userCollections);
            }
        };

        if (currentUserId) {
            fetchUserData();
            setUserId(currentUserId);
        }
    }, [currentUserId]);

    const router = useRouter();

    const handleEditProfile = () => {
        router.push({
            pathname: "./editProfilePage",
            params: { 
                userId,
                name,
                username: username.replace('@', ''),
                pfp: profileImageUrl
            }
        });
    };

    const navigateToMyOutfits = () => {
        router.push({
            pathname: "./myOutfitsPage",
            params: { userId }
        });
    };

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
            paddingHorizontal: width * 0.05, // Add horizontal padding
            paddingTop: height * 0.02,
            borderTopLeftRadius: width * 0.09,
            borderTopRightRadius: width * 0.09,
        },
        outfitCardContainer: {
            width: width * 0.45,
            marginRight: width * 0.025,
            marginBottom: 20,
        },        
        outfitCard: {
            width: width * 0.4,
            height: width * 0.6,
            borderRadius: 10,
            backgroundColor: '#333',
            overflow: 'hidden',
        },
        outfitImage: {
            width: '100%',
            height: '100%',
        },
        outfitLabelContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width * 0.4,
            marginTop: 8,
        },
        outfitLabel: {
            color: "#C7D1DB",
            fontSize: 16,
            fontWeight: '600',
        },
        outfitCount: {
            color: "#9AA8B6",
            fontSize: 16,
            fontWeight: '600',
        },
        gridContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },        
    });

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

            {/* Body Section with Outfits Preview */}
            <View style={styles.body}>
                <View style={styles.gridContainer}>
                    {allCards.map((item, index) => {
                    const isRecent = item.type === 'recent';
                    const cardData = item.data;
                    return (
                        <Pressable
                        key={isRecent ? 'recent' : cardData.id}
                        onPress={
                            isRecent
                            ? navigateToMyOutfits
                            : () =>
                                router.push({
                                    pathname: './collectionDetail',
                                    params: {
                                    collectionId: cardData.id,
                                    collectionName: cardData.name,
                                    },
                                })
                        }
                        >
                        <View style={styles.outfitCard}>
                            <Image
                            source={{
                                uri:
                                isRecent
                                    ? cardData.uri
                                    : cardData.previewImage ||
                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1024px-No-Image-Placeholder.svg.png',
                            }}
                            style={styles.outfitImage}
                            resizeMode="cover"
                            />
                        </View>
                        <View style={styles.outfitLabelContainer}>
                            <Text style={styles.outfitLabel}>
                            {isRecent ? 'All Outfits' : cardData.name}
                            </Text>
                            <Text style={styles.outfitCount}>
                            {isRecent ? outfitsCount : cardData.outfitCount}
                            </Text>
                        </View>
                        </Pressable>
                    );
                    })}
                </View>
            </View>
            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
}