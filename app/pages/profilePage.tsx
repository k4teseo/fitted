import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, useWindowDimensions, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import { supabase } from "@/lib/supabase";
import FriendRequestPage from './friendRequestPage';
import SignOutButton from '../components/signOut';
import { useCurrentUser } from '../hook/useCurrentUser'; // Import the custom hook

// Mock data for outfits - replace with actual data fetching logic
const mockOutfits = [
    { id: '1', uri: `https://s3-alpha-sig.figma.com/img/fd56/c8cc/a6f9319a89631f8e4ba0478a9d744aea?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EFIubt0Dx5uLe4LBcYaYRp~3nJV5a0RzX8~z--kwcAEU-QHUVVZ5P1AYKrg7L44l4YAOvby--FWw~4DIQVQw0bj7Dy-hEK5GyKVYSeynj2rAHIvO6MDQXOYWTCyJl302fCrvVDYD7Pw-WabIrU6j3gPlBlqMmx8wuJ7I6VYuYl4ok0Dt96OqCrJxa0lX3on4eK48I8L~~IO03u1kq3D9SMEBZL4dBjgKUu4PZQuuw1U-2SUccttECjUdOV7EERx2ljA-w093nXo6eNymaC9cA9v9Bo6zK5y08Pp3TOt7LsX4BjQmOmixC~5E1DMdADFPeLN5NeQT5JOYsqPpjWQBog__` },
    { id: '2', uri: `https://s3-alpha-sig.figma.com/img/cce9/8d98/eb3254417926bdb53635ab4554de8d68?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=TQ~1FmbCrqF3smPsMrXrkJn4yZvcZZfYCd-bg8HY3FJGiwPxWsADBM6E3cMzTzXB4eIbjT9I4Qly-h4SQlJR6Dr3x5jcgTi3HjzruHuKSPkAL12317LnCMbErufi3TDMFhE3UKpEKp4QTHVWWPSGT804BLTbV3~rJH23dHJwW~zoeLVeGatTmxvLBjxGnjpcwl6qNlEY0FhlY50f6TX0x9h76xrkE8TIR~w09kYK-ejNS8RKMwBoYXjnofMQoROzrK-j6rJ3gCHmAyEHEL8Ma3FSMFlthlyDZR4LCjPE-S9O8s-uD3vcVp6nE3ONovC1VPVwWLiFGvirX0wdUo01pA__` },
    { id: '3', uri: `https://s3-alpha-sig.figma.com/img/2138/26b4/b3821b24e9cf500836d67169265c5007?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Jb47ZQbMYYS74i2l-1MmrhJe2nfONp3y~nYRthuSR~31dzD04DjwBcROr~uPVcgywsodOZjl6pLv1B-LfTZFqjo4UCt~5MYJN-~TR9uho3HyV2NuvOLY550FibtXRsdVOGEH4IYDD03jB84Y~XcFw53WcDHneBWgeZchWKpuxxpAs0ppJoXIPbboXZJBuhHV46YhD3yw2cm9s6fN-e2MspeYl7ahb0gCyUKJA6m-Up9Fl7-d9qn9mYg4iSoiuGe0Ip2qT4rYC7m7~Q1~SV4Ll6SKhXLFVnCNHRD65Mr5RsEcvXpHmPLVJ0u4KeY5V-WjMnRlQrYadcJAJp2cVN3k9w__` },
    { id: '4', uri: `https://s3-alpha-sig.figma.com/img/58ad/aff6/6669c48a303c2747a1bd1e284ca771f6?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=NSXDXPcmVU1sAjS5e4G-PtDCEV9ZYrtf7kxAZPWmdAEFUp5R5BQwcpLMZGks4c1Br6AkyHs~AYj8V2f13okY3aQ8mFpOVacQZrMmKsy5EP6F12NwgJJSUrm-SsCxhNKBVnZyG9svkHnd8IQKqueWNqGJ9XT-Riaxs59I5V0icXlJW-5ukRuU-F36F4BjaREPUriArd5fwNR~HC1wLjSeAWvgX0nL2MbWaLSfhYD22LE8FNFDpU0MCe~UuVWRxL1YSxuLve006vShEvWPllLdaxSKDN7UXA2e0Dki4J2DfudChnpkvabx8XI~f3~dGh5ELJsap4D8gjTJd1vi5VTmVw__` },
    { id: '5', uri: `https://s3-alpha-sig.figma.com/img/7643/d79e/6cc6a3a2e31372592e6337dbe38107ca?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DuCD1J-laoQbpoQrtOyRQfNchfZp4QxvAaVuB4ZgRKPL~oY4D7Yx~nlQ4hAJyznLE0zEmGum~BLUCzLur65cjnVhv7Pw1WLYsAJunSXT15LonuXu7E81XQBcivpUU7QV4A64vIwe03n6itquyJanOMfS6OO0qaX2~9AVWULGginy7ULCqtmGz4aRTtWO1sVkL5j4pujknrCb1XJleylA0xD3~1gZPpEZ~f-c~0DZG9NMyA9C6WgGBfL-TxiJi~N3fEMr2GijKC2fIdaN3pCLBqgl8LsaYPCxfDWQ7iWo9BCiK7QMXJbEOFVpzqGCKN3k9p2UdzkRo7zrPfel9TdFGQ__` },
    { id: '6', uri: `https://s3-alpha-sig.figma.com/img/20f6/fa5d/29bc8190de8553ab19ae1777f485b772?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=AY2qLB8~S3yOZ4zyZGTzjYPJ~Zv4lH-5PcYh08C4T~YiQxGNU6YhBuvLkZAMyZcDXn8K~yWa7d5jdvsMWFzS91UI51wX7tdT18wDPet3uzECTlNF~UxrS6Oy81bHBChTZs~YLYf5tJ67LS~O~VsH-SLTXdO07KlyVEZFrxc~jtfMwsLJp-RTaYlJ7PhXTvXeZAz8W9Ckpb94de9EVJi~prT6UEcgOscixTP~FZ4R07WKObTB29ADSV4HNHs8QmyqTbjPCNGRjJxZxI1aPf5oEiuZ3zR85ylRvnTnex4DkuZkGlxVzDrlvXK~4HqXDiDerkAi~3yX83zL8jSwzdLq3Q__` },
    { id: '7', uri: `https://s3-alpha-sig.figma.com/img/0cae/a707/71963fc82ad6ab83b9cce85111339cae?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=rWlBnOXErcl3n06OUPdCTAJRLyg0iQAleCo80O1fwdCfWQ~bn4VVzt1iWHb2nLv0C6n~mg1z1iGfBUroBj7Dg4UixCa48ffTs7ClDAKPvVtfGlPgbbpUJFFnCy5VFEgqsFxn7ttAmeR59g0NDO3FXwayuQ6JHjd4KH69elmOlI-LwPWbzOKz-2nzxu-GSExebvpkxaWqsPtOouCbghjhdTGaejMtRrDGsgv2HjPe8uyC~Y9dYLCeH7AUdPgB1aKDzthDklzec8uxo4NPUczHl8blTRtC14dFJA6QF8tvKTep9hmhJClDHhLEI8Sy9JMJe~gAQi8j6zm9-Z7yx2AiQQ__` },
    { id: '8', uri: `https://s3-alpha-sig.figma.com/img/3bd6/09c6/66e45e8ce3e828e99179a0a47dc07147?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=ZIM~Z~fV1B3zRjcqWJdp~W-97ek96PBxqj5srCqK2E81ZbHzBBH1t46kOzck7uQuU-MzWfjrGJ5X6L0bhcbkQqEbSVO~t4uFYoh2QnvQT1QNdUajbjwEbbnvpEwBt9gq4wVOIptQ2RjHC~kSoGe2ScKLIM2GseLWqmUP9Qb4v9ZhwmyUQOnqQ-vn8azTcinY-nisUXRN~OKTij0H2khmVo3mblZvpWZgJU5-D5-oFp-aUrQhJ47zw3BYvAZkWmYu0sE5Gw9T-pa8mLd8US5-44ei9Jk~h7iwndzTCdIkn6ymWuecEh4Yqg0FlYcs8BOoFrBPsQ17fchB3NmGBt3EBQ__` },
    { id: '9', uri: 'https://s3-alpha-sig.figma.com/img/f48b/4bb9/db0c588da0c73626502866ac137d9f70?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=AyhqGNL4b3tC5yubxnE8QiPPtFxLqlsNEY6Wn-zEeQYZ1KD-BGQ0NdopA7kImMjdIX0dWDLvnWj0XawImr2kdxkmjFKxk42zVMo~xA9mMcg9qdbKs7xkN1yiPbB1aMfUnIWBztB0XfL25CUGgvkCa2-h7JUjjPjNXIf6f2FrrzXvfj8MXfuihv-0LBnw7djfOomHiwLkVRBvkaFxqApO22c0AiTIVViM4~mI~Erzo33C3ZMl2lldSmKwu7Hkadcii4Be9cN4Gc~FBK1JgJedposzWSIEAuG151AAJheFi6o-m1vSFbBay~~gjjZgnvgaA9KluLf9sfZK3QO7N1W2kw__' },
  ];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("profile");
    const { width, height } = useWindowDimensions();
    const [showSettings, setShowSettings] = useState(false);
    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [friendCount, setFriendCount] = useState(0);
    const [outfits, setOutfits] = useState(mockOutfits); // Using mock data for now

    const currentUserId = useCurrentUser(); // Use the custom hook to get the current user ID

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
    const [outfitsCount, setOutfitsCount] = useState(0);

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

     // This is where we would fetch actual outfits data
     // For now we're using mock data
     useEffect(() => {
        setOutfitsCount(outfits.length);
    }, []);

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
            width: width * 0.4,
            marginBottom: 20,
            marginLeft: 10,
            marginTop: 10,
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
    });

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

    // Get the most recent outfit
    const mostRecentOutfit = outfits.length > 0 ? outfits[outfits.length - 1] : null;

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
                <View style={styles.outfitCardContainer}>
                    {mostRecentOutfit ? (
                    <>
                        <Pressable onPress={navigateToMyOutfits}>
                        <View style={styles.outfitCard}>
                            <Image 
                            source={{ uri: mostRecentOutfit.uri }} 
                            style={styles.outfitImage}
                            resizeMode="cover"
                            />
                        </View>
                        </Pressable>
                        <View style={styles.outfitLabelContainer}>
                        <Text style={styles.outfitLabel}>My Outfits</Text>
                        <Text style={styles.outfitCount}>{outfitsCount}</Text>
                        </View>
                    </>
                    ) : (
                    <Text style={{ color: '#919CA9' }}>No outfits yet</Text>
                    )}
                </View>
            </View>

            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
    );
}
