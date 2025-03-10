// app/addOccasion.tsx
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
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase"

export default function AddOccasion() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOccasions = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .eq("tag_type", "occasion");

      if (error) {
        console.error("Error fetching occasions:", error);
      } else {
        setOccasions(data.map((item) => item.name)); // Extracting names
      }

      setLoading(false);
    };

    fetchOccasions();
  }, []);

  // Filter occasions based on search input
  const filteredOccasions = occasions.filter((occasion) =>
    occasion.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Left: Back Arrow */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </Pressable>

        {/* Middle: Centered Title */}
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Add Occasion</Text>
        </View>

        {/* Right: Empty placeholder (for alignment) */}
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
      </View>

      {/* Occasion List */}
      {loading ? (
        <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />
      ) : (
      <FlatList
        data={filteredOccasions}
        keyExtractor={(item) => item}
        renderItem={renderOccasionItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
