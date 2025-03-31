import React, { useState } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { FeedPageIcon } from "@/assets/images/FeedPageIcon";
import { PlusIcon } from "@/assets/images/PlusIcon";
import { StyleSheet } from "react-native";

export default function BottomNavBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "add">("home");
  const { width, height } = useWindowDimensions();

  const styles = StyleSheet.create({
    bottomNav: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: height * 0.09,
      flexDirection: "row",
      backgroundColor: "#A5C6E8",
      alignItems: "center",
      justifyContent: "space-evenly",
    },

    beigeCircle: {
      width: width * 0.13,
      height: width * 0.13,
      borderRadius: width * 0.13,
      backgroundColor: "#F3EDE2", // beige color
      alignItems: "center",
      justifyContent: "center",
    },

    navItem: {
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.bottomNav}>
      {/* HOME TAB */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActiveTab("home")}
      >
        {activeTab === "home" ? (
          <View style={styles.beigeCircle}>
            <FeedPageIcon />
          </View>
        ) : (
          <FeedPageIcon />
        )}
      </TouchableOpacity>

      {/* ADD TAB */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          setActiveTab("add");
          router.push("/pages/camera");
        }}
      >
        {activeTab === "add" ? (
          <View style={styles.beigeCircle}>
            <PlusIcon />
          </View>
        ) : (
          <PlusIcon />
        )}
      </TouchableOpacity>

      {/* PROFILE TAB - commented out
        <TouchableOpacity
          style={feedStyles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Text
            style={[
              feedStyles.navItemText,
              activeTab === 'profile' && { color: '#F3EDE2' },
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        */}
    </View>
  );
}
