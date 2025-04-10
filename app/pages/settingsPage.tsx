import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  useWindowDimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

const SettingsPage = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [slideAnim] = useState(new Animated.Value(width));

  React.useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              router.replace('/pages/welcomePage');
            }
          },
        },
      ]
    );
  };

  const closeSettings = () => {
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
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: height * 0.02,
      borderBottomWidth: 1,
      borderBottomColor: '#2E2E2E',
    },
    optionText: {
      color: 'white',
      fontSize: width * 0.04,
      marginLeft: width * 0.04,
    },
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={closeSettings} style={styles.backButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.option} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={width * 0.06} color="white" />
          <Text style={styles.optionText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SettingsPage;