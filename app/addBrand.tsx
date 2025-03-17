import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useUploadContext } from "./uploadContext"; 

export default function AddBrand() {
  const router = useRouter();
  const { selectedBrands, setSelectedBrands } = useUploadContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase.from("tags").select("name").eq("tag_type", "brand");
      if (error) {
        console.error("Error fetching brands:", error);
      } else {
        setBrands(data.map((item) => item.name));
      }
      setLoading(false);
    };

    fetchBrands();
  }, []);

  const handleSelectBrand = (brand: string) => {
    setSelectedBrands((prevSelected) => 
      prevSelected.includes(brand) ? prevSelected.filter((item) => item !== brand) : [...prevSelected, brand]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </Pressable>
        <Text style={styles.topTitle}>Add Brand</Text>
      </View>

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

      {loading ? (
        <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />
      ) : (
        <FlatList
          data={brands.filter((brand) => brand.toLowerCase().includes(searchTerm.toLowerCase()))}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.brandItem, selectedBrands.includes(item) && styles.selectedBrand]}
              onPress={() => handleSelectBrand(item)}
            >
              <Text style={[styles.brandText, selectedBrands.includes(item) && styles.selectedBrandText]}>
                {item}
              </Text>
            </Pressable>
          )}
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: "#15181B",
    width: "100%",  // Ensure full width
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 10,
  },
  topTitle: {
    flex: 1, // Take up full space
    color: "#F5EEE3",
    fontSize: 22,
    fontWeight: "400",
    textAlign: "center",  // Center the text
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
});