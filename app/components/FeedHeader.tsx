import { View, StyleSheet, useWindowDimensions, TouchableOpacity } from "react-native";
import { FittedLogo } from "@/assets/images/FittedLogo";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FeedHeader() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const styles = StyleSheet.create({
    feedHeader: {
      backgroundColor: "#2D3338",
      width: "100%",
      height: height * 0.14,
      paddingVertical: height * 0.02,
      paddingLeft: width * 0.06, // Add some left padding so the logo isn't flush against the screen edge
      paddingRight: width * 0.04,
      flexDirection: 'row',
      alignItems: "flex-end", 
      justifyContent: "space-between", // Space between logo and search icon
      position: "absolute",
      zIndex: 10,
    },
    searchButton: {
      padding: 8,
      marginBottom: -15, // Adjust to align with logo vertically
    },
    searchCircle: {
      width: width * 0.1,  // Responsive circle size
      height: width * 0.1,
      borderRadius: width * 0.05,  // Half of width/height to make it circular
      backgroundColor: '#15181B',  // Dark gray circle
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.feedHeader}>
      <FittedLogo width={114} height={39.9} />
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => router.push('/pages/searchPage')}
      >
        <View style={styles.searchCircle}>
        <MaterialIcons name="search" size={30} color="#B4CFEA" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
