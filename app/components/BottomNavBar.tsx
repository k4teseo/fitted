import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { FeedPageIcon } from "@/assets/images/FeedPageIcon";
import { PlusIcon } from "@/assets/images/PlusIcon";
import { StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function BottomNavBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("home");
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
        onPress={() => { 
          setActiveTab("home");
          router.push("/pages/feedPage");
        }}
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

      {/* PROFILE TAB - commented out */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
          setActiveTab("profile");
          router.push('/pages/ProfilePage');
          }}
        >
          {activeTab === "profile" ? (
            <View style={styles.beigeCircle}>
              <Ionicons
              name="person-circle-outline"
              size={width * 0.09}
              color="#3A3A3A"
            />
            </View>
          ) : (
            <Ionicons
            name="person-circle-outline"
            size={width * 0.09}
          />
          )}
        </TouchableOpacity>
    </View>
  );
}
