// app/friendsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  FlatList, 
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from "@/lib/supabase";
import BottomNavBar from '../components/BottomNavBar';
import { useCurrentUser } from '../hook/useCurrentUser';

const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

export default function FriendsPage() {
    const { width, height } = useWindowDimensions();
    const currentUserId = useCurrentUser();
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchFriends = async () => {
            if (!currentUserId) return;
            
            setLoading(true);
            
            const { data: relationships, error } = await supabase
                .from('friends')
                .select('*')
                .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`)
                .eq('status', 'accepted');
                
            if (error) {
                console.error('Error fetching friend relationships:', error);
                return;
            }
            
            const friendIds = relationships.map(rel => 
                rel.user_id_1 === currentUserId ? rel.user_id_2 : rel.user_id_1
            );
            
            if (friendIds.length === 0) {
                setFriends([]);
                setLoading(false);
                return;
            }
            
            const { data: friendProfiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, name, pfp')
                .in('id', friendIds);
                
            if (profileError) {
                console.error('Error fetching friend profiles:', profileError);
            } else {
                setFriends(friendProfiles || []);
            }
            
            setLoading(false);
        };
        
        fetchFriends();
    }, [currentUserId]);

    const handleBack = () => {
        router.back();
    };

    const renderFriendItem = ({ item }: { item: any }) => (
        <View style={styles.friendItem}>
            <Image
                source={{ uri: item.pfp || defaultPfp }}
                style={styles.friendImage}
            />
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name || 'User'}</Text>
                <Text style={styles.friendUsername}>@{item.username}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <MaterialIcons name="navigate-before" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.header}>Friends</Text>
            </View>
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4DA6FD" />
                </View>
            ) : friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No friends yet</Text>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            
            <BottomNavBar activeTab="profile" setActiveTab={() => {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#15181B',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 70,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: '400',
        color: '#7F8A95',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2F33',
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        color: '#C7D1DB',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    friendUsername: {
        color: '#919CA9',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#919CA9',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#919CA9',
        fontSize: 16,
    },
});