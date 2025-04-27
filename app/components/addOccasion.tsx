import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
} from "react-native";
import { getOrCreateUserId } from "@/lib/auth";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useUploadContext } from "../context/uploadContext"; // Import context

export default function AddOccasion() {
  const router = useRouter();
  const { selectedOccasions, setSelectedOccasions } = useUploadContext(); // Get context values
  const [searchTerm, setSearchTerm] = useState("");
  const [globalOccasions, setGlobalOccasions] = useState<string[]>([]);

  // Keep track of user-added local occasions
  const [userOccasions, setUserOccasions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  // For animating the "Add" icon
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Fetch global tags from the "tags" table (for tag_type "occasion")
  useEffect(() => {
    const fetchGlobalOccasions = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .eq("tag_type", "occasion");

      if (error) {
        console.error("Error fetching global occasions:", error);
      } else {
        setGlobalOccasions(data.map((item) => item.name)); // Extracting names
      }

      setLoading(false);
    };

    fetchGlobalOccasions();
  }, []);

  // Fetch user-specific custom tags from the "user_tags" table
  useEffect(() => {
    const fetchUserOccasions = async () => {
      try {
        const userId = await getOrCreateUserId();
        const { data, error } = await supabase
          .from("user_tags")
          .select("name")
          .eq("user_id", userId)
          .eq("tag_type", "occasion");

        if (error) {
          console.error("Error fetching user occasions:", error);
        } else if (data) {
          setUserOccasions(data.map((item) => item.name));
        }
      } catch (err) {
        console.error("Error fetching user occasions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOccasions();
  }, []);

  // Merge supabase occasions + userAddedOccasions
  const combinedOccasions = [...globalOccasions, ...userOccasions];

  // Filter occasions based on search input
  const filteredOccasions = combinedOccasions.filter((occasion) =>
    occasion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if typed term is brand new (i.e. not already in combinedOccasions)
  const isNewOccasion =
    searchTerm.length > 0 &&
    !combinedOccasions.some(
      (occ) => occ.toLowerCase() === searchTerm.toLowerCase()
    );

  // Helper: reorder so that:
  // 1. Selected tags come first.
  // 2. Among not selected tags, custom (user-added) tags come before global tags.
  function reorderOccasions(
    occasions: string[],
    selected: string[],
    userTags: string[]
  ) {
    return occasions.slice().sort((a, b) => {
      const aSelected = selected.includes(a);
      const bSelected = selected.includes(b);
      // Selected tags always come first
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      // Both are either selected or not selected
      if (!aSelected && !bSelected) {
        const aIsCustom = userTags.includes(a);
        const bIsCustom = userTags.includes(b);
        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
      }
      return 0;
    });
  }

  // Final list to display: reorder the filtered occasions
  const finalOccasions = reorderOccasions(
    filteredOccasions,
    selectedOccasions,
    userOccasions
  );

  // Select/unselect an occasion
  const handleSelectOccasion = (occasion: string) => {
    setSelectedOccasions((prev) => {
      if (prev.includes(occasion)) {
        return prev.filter((item) => item !== occasion);
      } else {
        return [...prev, occasion];
      }
    });
  };

  // Animate the "Add" icon on press
  const animateAddIcon = () => {
    // Scale down slightly, then back up
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Add a new custom occasion
  const handleAddOccasion = async () => {
    try {
      animateAddIcon(); // run the scale animation

      const userId = await getOrCreateUserId();

      // Insert the new custom tag into the user_tags table in Supabase
      const { error } = await supabase
        .from("user_tags")
        .insert({ user_id: userId, name: searchTerm, tag_type: "occasion" })
        .single();

      if (error) {
        console.log("Error adding custom occasion:", error);
        return;
      }

      // If successful, update your local state and select the new tag
      setUserOccasions((prev) => [...prev, searchTerm]);
      setSelectedOccasions((prev) => [...prev, searchTerm]);
      setSearchTerm("");
    } catch (err) {
      console.log("Error in handleAddOccasion:", err);
    }
  };

  // Delete a user-added custom occasion (filtering by tag_type "occasion")
  const handleDeleteOccasion = async (
    occasion: string,
    e: GestureResponderEvent
  ) => {
    e.stopPropagation();
    try {
      const userId = await getOrCreateUserId();
      const { error } = await supabase
        .from("user_tags")
        .delete()
        .eq("user_id", userId)
        .eq("name", occasion)
        .eq("tag_type", "occasion");

      if (error) {
        console.log("Error deleting custom occasion:", error);
        return;
      }
      setUserOccasions((prev) => prev.filter((item) => item !== occasion));
      setSelectedOccasions((prev) => prev.filter((item) => item !== occasion));
    } catch (err) {
      console.log("Error in handleDeleteOccasion:", err);
    }
  };

  // Render each occasion as a pressable item
  const renderOccasionItem = ({ item }: { item: string }) => {
    const isSelected = selectedOccasions.includes(item); // Check if the item is selected
    const isUserTag = userOccasions.includes(item); // show "X" only for user-added

    return (
      <Pressable
        style={[styles.occasionPill, isSelected && styles.selectedOccasion]}
        onPress={() => handleSelectOccasion(item)}
      >
        <Text
          style={[
            styles.occasionText,
            isSelected && styles.selectedOccasionText,
          ]}
        >
          {item}
        </Text>

        {/* Show "X" only for user tags */}
        {isUserTag && (
          <Pressable
            style={styles.xCircle}
            onPress={(e) => handleDeleteOccasion(item, e)}
          >
            <MaterialIcons name="close" size={14} color="#9AA8B6" />
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="navigate-before" size={30} color="#F5EEE3" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Add Occasion</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color="#383C40"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your Outfit's Occasion..."
          placeholderTextColor="#383C40"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <Pressable onPress={() => setSearchTerm("")}>
            <MaterialIcons
              name="close"
              size={20}
              color="#383C40"
              style={styles.clearIcon}
            />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />
      ) : (
        <>
          {isNewOccasion && (
            <Pressable style={styles.addRow} onPress={handleAddOccasion}>
              {/* Animated "Add" Icon */}
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <MaterialIcons
                  name="add"
                  size={20}
                  color="#F5EEE3"
                  style={{ marginRight: 8 }}
                />
              </Animated.View>
              <Text style={styles.addRowText}>Add “{searchTerm}”</Text>
            </Pressable>
          )}

          <FlatList
            data={finalOccasions}
            keyExtractor={(item) => item}
            renderItem={renderOccasionItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 80, // for iOS notch
    paddingBottom: 30,
    backgroundColor: "#15181B",
    width: "100%",
  },
  backButton: {
    padding: 0,
    marginRight: 0,
  },
  topTitle: {
    color: "#F5EEE3",
    fontSize: 22,
    fontWeight: "400",
    textAlign: "center",
    flex: 1,
  },
  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7F8A95",
    marginHorizontal: 50,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: "#383C40",
    fontSize: 14,
    height: 40,
  },
  clearIcon: {
    marginLeft: 6,
  },
  /* "Add" row for new custom tag */
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 50,
    marginBottom: 10,
    backgroundColor: "#262A2F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addRowText: {
    color: "#F5EEE3",
    fontSize: 14,
  },
  // Occasion List
  listContent: {
    paddingHorizontal: 50,
    paddingBottom: 40,
    paddingVertical: 5,
  },
  /* Container for each row: the main tag button + optional "X" */
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  occasionPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#262A2F",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  occasionText: {
    color: "#9AA8B6",
    fontSize: 14,
  },
  selectedOccasion: {
    backgroundColor: "#A5C6E8", // Highlight selected occasion
  },
  selectedOccasionText: {
    color: "#262A2F", // Change text color for selected occasion
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
  deleteButton: {
    padding: 8,
  },
  selectedContainer: {
    padding: 20,
    backgroundColor: "#15181B",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#B4CFEA",
  },
  selectedTitle: {
    color: "#F5EEE3",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedOccasions: {
    color: "#B4CFEA",
    fontSize: 14,
  },
  // Small circle or area for the X
  xCircle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
