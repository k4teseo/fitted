import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StyleSheet,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '../hook/useCurrentUser'; 


const friendRequestsPage = ({ onClose }: { onClose: () => void }) => {
  const { width, height } = useWindowDimensions();
  const [slideAnim] = useState(new Animated.Value(width));
  const [request, setRequest] = useState<any[]>([]);

  const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
  const currentUserId = useCurrentUser();

  useEffect(() => {
    const fetchFriendRequests = async () => {
      //get current user id

      if (!currentUserId) return; // Ensure currentUserId is available before querying

      const {data, error} = await supabase 
      .from('friends')
      .select('id, user_id_2, sender_profile:profiles!user_id_2(pfp, username)')
      .eq('user_id_1', currentUserId)
      .eq('status', 'pending')

    if (error) {
      console.error('Error fetching friend requests:', error);
    } else {
      setRequest(data);
    }
  };
    fetchFriendRequests();
  }, [currentUserId]);

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    const {error} = await supabase
    .from('friends')
    .update({status: accept ? 'accepted' : 'rejected'})
    .eq('id', requestId);
    if (error) {
      console.error('Error updating friend request:', error);
    } else {
      setRequest((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
    }
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeRequests = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1D1E23',
      zIndex: 100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: height * 0.07,
      paddingHorizontal: width * 0.05,
      paddingBottom: height * 0.02,
      borderBottomWidth: 1,
      borderBottomColor: '#2E2E2E',
    },
    backButton: {
      marginRight: width * 0.05,
    },
    title: {
      color: 'white',
      fontSize: width * 0.05,
      fontWeight: 'bold',
    },
    content: {
      padding: width * 0.05,
    },
    requestItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: height * 0.02,
      borderBottomWidth: 1,
      borderBottomColor: '#2E2E2E',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userImage: {
      width: width * 0.12,
      height: width * 0.12,
      borderRadius: width * 0.06,
      marginRight: width * 0.04,
    },
    userName: {
      color: 'white',
      fontSize: width * 0.04,
    },
    actionButtons: {
      flexDirection: 'row',
    },
    rejectButton: {
      backgroundColor: '#transparent',  
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
      borderRadius: 5,
      marginRight: width * 0.02,
      borderWidth: 1,
      borderColor: "#626A73",
    },
    acceptButton: {
      backgroundColor: '#4DA6FD',  
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: width * 0.035,
    },
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={closeRequests} style={styles.backButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Friend Requests</Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={request}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <View style={styles.userInfo}>
                <Image source={{ uri: item.sender_profile?.pfp || defaultPfp }} style={styles.userImage} />
                <Text style={styles.userName}>{item.sender_profile?.username}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.rejectButton}  
                  onPress={() => handleFriendRequest(item.id, false)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}  
                  onPress={() => handleFriendRequest(item.id, true)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </Animated.View>
  );
};

export default friendRequestsPage;
