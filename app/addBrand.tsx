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
import { supabase } from "@/lib/supabase";

export default function AddBrand() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .eq("tag_type", "brand");

      if (error) {
        console.error("Error fetching brands:", error);
      } else {
        setBrands(data.map((item) => item.name)); // Extracting names
      }

      setLoading(false);
    };

    fetchBrands();
  }, []);

  // Filter brands based on search input
  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle brand selection
  const handleSelectBrand = (brand: string) => {
    setSelectedBrands((prevSelected) => {
      if (prevSelected.includes(brand)) {
        return prevSelected.filter((item) => item !== brand);
      } else {
        return [...prevSelected, brand];
      }
    });
  };

  // Render each brand as a pressable item
  const renderBrandItem = ({ item }: { item: string }) => {
    const isSelected = selectedBrands.includes(item);

    return (
      <Pressable
        style={[styles.brandItem, isSelected && styles.selectedBrand]}
        onPress={() => handleSelectBrand(item)}
      >
        <Text style={[styles.brandText, isSelected && styles.selectedBrandText]}>
          {item}
        </Text>
      </Pressable>
    );
  };

  const handleConfirmSelection = () => {
    router.push({
      pathname: "/upload",
      params: { selectedBrands: JSON.stringify(selectedBrands) },
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Add Brand</Text>
        </View>

        <View style={{ width: 24 }} />

        <Pressable style={styles.confirmButton} onPress={handleConfirmSelection}>
          <Text style={styles.confirmText}>Confirm</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#383C40" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your Outfit's Brand..."
          placeholderTextColor="#383C40"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Brand List */}
      {loading ? (
        <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBrands}
          keyExtractor={(item) => item}
          renderItem={renderBrandItem}
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
  selectedBrand: {
    backgroundColor: "#7F8A95",
  },
  selectedBrandText: {
    color: "#15181B",
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: "#7F8A95",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    color: "#15181B",
    fontWeight: "bold",
    fontSize: 16,
  },
});