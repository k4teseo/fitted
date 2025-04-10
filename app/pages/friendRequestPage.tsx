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

const mockFriendRequests = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Sarah Williams', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '3', name: 'Michael Brown', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
];

const friendRequestsPage = ({ onClose }: { onClose: () => void }) => {
  const { width, height } = useWindowDimensions();
  const [slideAnim] = useState(new Animated.Value(width));

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

  const handleRequest = (id: string, accept: boolean) => {
    console.log(`${accept ? 'Accepted' : 'Rejected'} request ${id}`);
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
          data={mockFriendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <View style={styles.userInfo}>
                <Image source={{ uri: item.avatar }} style={styles.userImage} />
                <Text style={styles.userName}>{item.name}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.rejectButton}  
                  onPress={() => handleRequest(item.id, false)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}  
                  onPress={() => handleRequest(item.id, true)}
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
