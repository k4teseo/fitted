import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FeedPageIcon, PlusIcon } from "../Icons";
import { StyleSheet } from "react-native";

export default function BottomNavBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "add">("home");

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
          router.push("/pages/Camera");
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

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: "row",
    backgroundColor: "#A5C6E8",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 90, // Add horizontal padding
  },

  beigeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3EDE2", // beige color
    alignItems: "center",
    justifyContent: "center",
  },

  // "plus" icon
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    fontSize: 28,
    color: "#7A7A7A",
    fontWeight: "bold",
  },

  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});
