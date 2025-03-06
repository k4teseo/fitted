// app/addBrand.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

// Example brand data
const ALL_BRANDS = [
  "Abercrombie",
  "Adidas",
  "Aritzia",
  "Balenciaga",
  "Converse",
  "Everlane",
  "FearOfGod",
  "Graduation",
  "Gucci",
  "H&M",
  "Lululemon",
  "Nike",
  "Uniqlo",
];

export default function AddBrand() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter brand list based on search term
  const filteredBrands = ALL_BRANDS.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render each brand as a pressable item
  const renderBrandItem = ({ item }: { item: string }) => {
    return (
      <Pressable style={styles.brandItem} onPress={() => console.log(item)}>
        <Text style={styles.brandText}>{item}</Text>
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
                <Text style={styles.topTitle}>Add Brand</Text>
            </View>

            {/* Right: Optionally empty if no icon */}
            <View style={{ width: 24 }} />
        </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#383C40" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your Outfit's Brands"
          placeholderTextColor="#383C40"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Brand List */}
      <FlatList
        data={filteredBrands}
        keyExtractor={(item) => item}
        renderItem={renderBrandItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 40,
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
  // Brand List
  listContent: {
    paddingHorizontal: 50,
    paddingBottom: 40,
    paddingVertical: 5,
  },
  brandItem: {
    backgroundColor: "#262A2F",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  brandText: {
    color: "#B4CFEA",
    fontSize: 14,
  },
});
