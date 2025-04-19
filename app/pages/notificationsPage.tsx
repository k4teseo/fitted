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
  Pressable,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '../hook/useCurrentUser';
import { useRouter } from 'expo-router';
import TimeStamp from '../components/TimeStamp';

type UserProfile = {
  username: string;
  pfp: string;
};

type FriendRequestFromDB = {
  id: string;
  created_at: string;
  user_id_2: string;
  sender_profile: UserProfile;
  status: 'pending' | 'accepted' | 'rejected';
};

type FriendRequest = FriendRequestFromDB & {
  read: boolean;
  text?: string;
  time?: string;
};

type Comment = {
  id: string;
  user: UserProfile;
  text: string;
  postImage: string;
  postId: string;
  read: boolean;
  created_at: string;
  time?: string;
};

const NotificationsPage = ({ onClose }: { onClose: () => void }) => {
  const { width, height } = useWindowDimensions();
  const [slideAnim] = useState(new Animated.Value(width));
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'Friends' | 'Comments'>('Friends');
  const router = useRouter();

  const defaultPfp = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
  const currentUserId = useCurrentUser();

  // Mock comment notifications data
  const mockComments: Comment[] = [
    {
      id: '1',
      user: {
        username: 'sofia.cat',
        pfp: defaultPfp,
      },
      text: 'I love your outfit! It really suits you',
      time: '2d',
      postImage: 'https://s3-alpha-sig.figma.com/img/fd56/c8cc/a6f9319a89631f8e4ba0478a9d744aea?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EFIubt0Dx5uLe4LBcYaYRp~3nJV5a0RzX8~z--kwcAEU-QHUVVZ5P1AYKrg7L44l4YAOvby--FWw~4DIQVQw0bj7Dy-hEK5GyKVYSeynj2rAHIvO6MDQXOYWTCyJl302fCrvVDYD7Pw-WabIrU6j3gPlBlqMmx8wuJ7I6VYuYl4ok0Dt96OqCrJxa0lX3on4eK48I8L~~IO03u1kq3D9SMEBZL4dBjgKUu4PZQuuw1U-2SUccttECjUdOV7EERx2ljA-w093nXo6eNymaC9cA9v9Bo6zK5y08Pp3TOt7LsX4BjQmOmixC~5E1DMdADFPeLN5NeQT5JOYsqPpjWQBog__',
      read: false,
      postId: '123',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '2',
      user: {
        username: 'urban_ghost',
        pfp: defaultPfp,
      },
      text: 'Such a cool jacket',
      time: '2d',
      postImage: 'https://s3-alpha-sig.figma.com/img/fd56/c8cc/a6f9319a89631f8e4ba0478a9d744aea?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EFIubt0Dx5uLe4LBcYaYRp~3nJV5a0RzX8~z--kwcAEU-QHUVVZ5P1AYKrg7L44l4YAOvby--FWw~4DIQVQw0bj7Dy-hEK5GyKVYSeynj2rAHIvO6MDQXOYWTCyJl302fCrvVDYD7Pw-WabIrU6j3gPlBlqMmx8wuJ7I6VYuYl4ok0Dt96OqCrJxa0lX3on4eK48I8L~~IO03u1kq3D9SMEBZL4dBjgKUu4PZQuuw1U-2SUccttECjUdOV7EERx2ljA-w093nXo6eNymaC9cA9v9Bo6zK5y08Pp3TOt7LsX4BjQmOmixC~5E1DMdADFPeLN5NeQT5JOYsqPpjWQBog__',
      read: true,
      postId: '456',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUserId) return;

      const { data: requests, error } = await supabase 
        .from('friends')
        .select('id, created_at, user_id_2, sender_profile:profiles!user_id_2(pfp, username), status')
        .eq('user_id_1', currentUserId)
        .or('status.eq.pending,status.eq.accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching friend requests:', error);
        return;
      }

      const formattedRequests: FriendRequest[] = (requests || []).map(request => {
        const senderProfile = Array.isArray(request.sender_profile) 
          ? request.sender_profile[0] || {}
          : request.sender_profile || {};
      
        return {
          ...request,
          sender_profile: {
            username: senderProfile.username || 'Unknown',
            pfp: senderProfile.pfp || defaultPfp
          },
          read: false,
          text: '',
        };
      });

      setFriendRequests(formattedRequests);
    };

    fetchNotifications();
  }, [currentUserId]);

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', requestId);
    
    if (!error) {
      if (accept) {
        setFriendRequests(prev => 
          prev.map(request => 
            request.id === requestId 
              ? { ...request, status: 'accepted' } 
              : request
          )
        );
      } else {
        setFriendRequests(prev => prev.filter(request => request.id !== requestId));
      }
    } else {
      console.error('Error updating friend request:', error);
    }
  };

  const handleNotificationPress = (item: Comment) => {
    if (activeTab === 'Comments') {
      router.push(`./postPage?id=${item.postId}`);
    }
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const closePage = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={[
      styles.notificationItem, 
      item.status === 'accepted' ? styles.acceptedRequest : styles.pendingRequest
    ]}>
      <Image source={{ uri: item.sender_profile?.pfp || defaultPfp }} style={styles.userImage} />
      <View style={styles.notificationContent}>
        <Text style={styles.usernameText}>{item.sender_profile?.username}</Text>
        <Text style={styles.notificationText}>
          {"wants to be your friend "}
          <TimeStamp createdAt={item.created_at} />
        </Text>
        {item.text && (
          <Text style={styles.commentPreview}>"{item.text}"</Text>
        )}
      </View>
      {item.status === 'accepted' ? (
        <TouchableOpacity style={styles.friendsButton}>
          <Text style={styles.friendsButtonText}>Friends</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={() => handleFriendRequest(item.id, false)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleFriendRequest(item.id, true)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <Pressable 
      onPress={() => handleNotificationPress(item)}
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
    >
      <Image source={{ uri: item.user.pfp || defaultPfp }} style={styles.userImage} />
      <View style={styles.notificationContent}>
        <Text style={styles.usernameText}>{item.user.username}</Text>
        <Text style={styles.notificationText}>
          {"commented on your post "}
          <TimeStamp createdAt={item.created_at} />
        </Text>
        <Text style={styles.commentPreview}>"{item.text}"</Text>
      </View>
      <Image 
        source={{ uri: item.postImage }} 
        style={styles.postPreview} 
        resizeMode="cover"
      />
    </Pressable>
  );

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#15181B',
      zIndex: 100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: height * 0.08,
      paddingHorizontal: width * 0.05,
      paddingBottom: height * 0.01,
    },
    backButton: {
      marginRight: width * 0.04,
    },
    title: {
      color: '#7F8A95',
      fontSize: width * 0.06,
      fontWeight: '400',
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: '#2D3338',
      borderRadius: 23,
      marginHorizontal: width * 0.10,
      marginVertical: 20,
      padding: 4,
      marginBottom: 25,
    },
    tab: {
      flex: 1,
      paddingVertical: 7,
      alignItems: 'center',
      borderRadius: 23,
      marginHorizontal: width * 0.01,
    },
    activeTab: {
      backgroundColor: '#B4CFEA',
    },
    tabText: {
      color: '#919CA9',
      fontSize: 13,
      fontWeight: '600',
    },
    activeTabText: {
      color: '#141618',
    },
    content: {
      paddingHorizontal: width * 0.05,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
    },
    pendingRequest: {
      backgroundColor: '#1E2328',
    },
    acceptedRequest: {
      backgroundColor: 'transparent',
    },
    unreadNotification: {
      backgroundColor: '#1E2328',
    },
    userImage: {
      width: 26,
      height: 26,
      borderRadius: 22,
      marginRight: 15,
      marginTop: -12,
    },
    postPreview: {
      width: 50,
      height: 60,
      borderRadius: 5,
      marginLeft: 10,
    },
    notificationContent: {
      flex: 1,
    },
    usernameText: {
      color: '#9AA8B6',
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 3,
    },
    notificationText: {
      color: '#858E9A',
      fontSize: 11,
    },
    commentPreview: {
      color: '#595F66',
      fontSize: 11,
      marginTop: 10,
      fontStyle: 'italic',
    },
    actionButtons: {
      flexDirection: 'row',
      marginLeft: 10,
    },
    acceptButton: {
      backgroundColor: '#60A5FA',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 30,
      marginLeft: 8,
    },
    acceptButtonText: {
      color: '#141618',
      fontSize: 11,
      fontWeight: '600',
    },
    declineButton: {
      backgroundColor: 'transparent',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: '#747E89',
    },
    declineButtonText: {
      color: '#747E89',
      fontSize: 11,
      fontWeight: '600',
    },
    friendsButton: {
      backgroundColor: '#transparent',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 30,
      marginLeft: 10,
      borderWidth: 1,
      borderColor: '#60A5FA',
    },
    friendsButtonText: {
      color: '#60A5FA',
      fontSize: 11,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: height * 0.3,
    },
    emptyText: {
      color: '#9AA8B6',
      fontSize: 16,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        marginRight: 8,
    },
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={closePage} style={styles.backButton}>
          <MaterialIcons name="navigate-before" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Friends' && styles.activeTab]}
          onPress={() => setActiveTab('Friends')}
        >
          <View style={styles.tabContent}>
            <Ionicons 
              name="person-add-outline" 
              size={15} 
              color={activeTab === 'Friends' ? '#141618' : '#919CA9'} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'Friends' && styles.activeTabText]}>
              Friends
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Comments' && styles.activeTab]}
          onPress={() => setActiveTab('Comments')}
        >
          <View style={styles.tabContent}>
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={15} 
              color={activeTab === 'Comments' ? '#141618' : '#919CA9'} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'Comments' && styles.activeTabText]}>
              Comments
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'Friends' ? (
          friendRequests.length > 0 ? (
            <FlatList
              data={friendRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderFriendRequestItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No friend requests</Text>
            </View>
          )
        ) : (
          mockComments.length > 0 ? (
            <FlatList
              data={mockComments}
              keyExtractor={(item) => item.id}
              renderItem={renderCommentItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No comments yet</Text>
            </View>
          )
        )}
      </View>
    </Animated.View>
  );
};

export default NotificationsPage;