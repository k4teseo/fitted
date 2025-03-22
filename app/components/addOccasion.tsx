import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
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
          .eq("user_id", userId);

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

  const handleSelectOccasion = (occasion: string) => {
    setSelectedOccasions((prevSelected) => {
      if (prevSelected.includes(occasion)) {
        // Remove from selected if already selected
        return prevSelected.filter((item) => item !== occasion);
      } else {
        // Add to selected if not already selected
        return [...prevSelected, occasion];
      }
    });
  };

  // If user taps "Add + <searchTerm>", we add it locally and also mark it selected
  const handleAddOccasion = async () => {
    try {
      const userId = await getOrCreateUserId();
  
      // Insert the new custom tag into the user_tags table in Supabase
      const { error } = await supabase
        .from("user_tags")
        .insert({ user_id: userId, name: searchTerm })
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
  

  // Render each occasion as a pressable item
  const renderOccasionItem = ({ item }: { item: string }) => {
    const isSelected = selectedOccasions.includes(item); // Check if the item is selected

    return (
      <Pressable
        style={[styles.occasionItem, isSelected && styles.selectedOccasion]} // Apply style if selected
        onPress={() => handleSelectOccasion(item)}
      >
        <Text style={[styles.occasionText, isSelected && styles.selectedOccasionText]}>
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Add Occasion</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#383C40" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your Outfit's Occasion..."
          placeholderTextColor="#383C40"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <Pressable onPress={() => setSearchTerm("")}>
            <MaterialIcons name="close" size={20} color="#383C40" style={styles.clearIcon} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />
      ) : (
        <>
          {isNewOccasion && (
            <Pressable style={styles.addRow} onPress={handleAddOccasion}>
              <MaterialIcons name="add" size={20} color="#F5EEE3" style={{ marginRight: 8 }} />
              <Text style={styles.addRowText}>Add “{searchTerm}”</Text>
            </Pressable>
          )}

          <FlatList
            data={filteredOccasions}
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
    paddingHorizontal: 20,
    paddingTop: 40, // for iOS notch
    paddingBottom: 30,
    backgroundColor: "#15181B",
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
  // "Add new" row
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 50,
    marginBottom: 16,
    backgroundColor: "#262A2F",
    borderRadius: 8,
    padding: 10,
  },
  addRowText: {
    marginLeft: 8,
    color: "#B4CFEA",
    fontSize: 14,
  },
  // Occasion List
  listContent: {
    paddingHorizontal: 50,
    paddingBottom: 40,
    paddingVertical: 5,
  },
  occasionItem: {
    backgroundColor: "#262A2F",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  occasionText: {
    color: "#B4CFEA",
    fontSize: 14,
  },
  selectedOccasion: {
    backgroundColor: "#7F8A95", // Highlight selected occasion
  },
  selectedOccasionText: {
    color: "#15181B", // Change text color for selected occasion
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
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
});