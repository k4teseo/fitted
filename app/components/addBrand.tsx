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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getOrCreateUserId } from "@/lib/auth";

export default function AddBrand() {
  const router = useRouter();
  // Read the x, y, and imageUri parameters passed from TagBrandsOnPhoto
  const { x, y, imageUri } = useLocalSearchParams<{ x?: string; y?: string; imageUri?: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [globalBrands, setGlobalBrands] = useState<string[]>([]);
  const [userBrands, setUserBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // For animating the "Add" icon
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Fetch global brands from the "tags" table (where tag_type is "brand")
  useEffect(() => {
    const fetchGlobalBrands = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .eq("tag_type", "brand");

      if (error) {
        console.error("Error fetching global brands:", error);
      } else if (data) {
        setGlobalBrands(data.map((item) => item.name));
      }
      setLoading(false);
    };
    fetchGlobalBrands();
  }, []);

  // Fetch user-specific custom brands from the "user_tags" table (tag_type = "brand")
  useEffect(() => {
    const fetchUserBrands = async () => {
      try {
        const userId = await getOrCreateUserId();
        const { data, error } = await supabase
          .from("user_tags")
          .select("name")
          .eq("user_id", userId)
          .eq("tag_type", "brand");

        if (error) {
          console.error("Error fetching user brands:", error);
        } else if (data) {
          setUserBrands(data.map((item) => item.name));
        }
      } catch (err) {
        console.error("Error fetching user brands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserBrands();
  }, []);

  // Combine global and user brands
  const combinedBrands = [...globalBrands, ...userBrands];
  // Filter brands based on searchTerm
  const filteredBrands = combinedBrands.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Check if the typed term is new (not found in the list)
  const isNewBrand =
    searchTerm.length > 0 &&
    !combinedBrands.some(
      (brand) => brand.toLowerCase() === searchTerm.toLowerCase()
    );

  // Animate the "Add" icon for new custom brand
  const animateAddIcon = () => {
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

  // If user types a new brand and presses "Add", insert it into user_tags and then return it
  const handleAddBrand = async () => {
    try {
      animateAddIcon();
      const userId = await getOrCreateUserId();
      const { error } = await supabase
        .from("user_tags")
        .insert({ user_id: userId, name: searchTerm, tag_type: "brand" })
        .single();

      if (error) {
        console.log("Error adding custom brand:", error);
        return;
      }

      // Add new brand to local userBrands list (optional, for UI display)
      setUserBrands((prev) => [...prev, searchTerm]);

      // Now return the new brand to TagBrandsOnPhoto
      handlePickBrand(searchTerm);
    } catch (err) {
      console.log("Error in handleAddBrand:", err);
    }
  };

  // When a brand is picked (from the list or after adding), return to TagBrandsOnPhoto.
  const handlePickBrand = (brand: string) => {
    // Use router.replace to navigate back to TagBrandsOnPhoto with query parameters.
    // Ensure that TagBrandsOnPhoto is available at the specified route (adjust path if needed)
    router.replace(
      `/components/tagBrandsOnPhoto?brandName=${encodeURIComponent(brand)}&x=${x}&y=${y}&imageUri=${encodeURIComponent(imageUri || "")}`
    );
  };

  // Render each brand as a "pill" (button)
  const renderBrandItem = ({ item }: { item: string }) => {
    return (
      <Pressable style={styles.brandPill} onPress={() => handlePickBrand(item)}>
        <Text style={styles.brandText}>{item}</Text>
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
        <Text style={styles.topTitle}>Add Brand</Text>
        <View style={{ width: 24 }} />
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
          {/* If the typed brand is new, show an "Add" row */}
          {isNewBrand && (
            <Pressable style={styles.addRow} onPress={handleAddBrand}>
              <Animated.View style={{ transform: [{ scale: scaleValue }], marginRight: 8 }}>
                <MaterialIcons name="add" size={20} color="#F5EEE3" />
              </Animated.View>
              <Text style={styles.addRowText}>Add “{searchTerm}”</Text>
            </Pressable>
          )}

          <FlatList
            data={filteredBrands}
            keyExtractor={(item) => item}
            renderItem={renderBrandItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15181B" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: "#15181B",
    width: "100%",
  },
  backButton: { padding: 0, marginRight: 0 },
  topTitle: { color: "#F5EEE3", fontSize: 22, fontWeight: "400", textAlign: "center", flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7F8A95",
    marginHorizontal: 50,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, color: "#383C40", fontSize: 14, height: 40 },
  clearIcon: { marginLeft: 6 },
  loader: { marginTop: 20 },
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
  addRowText: { color: "#F5EEE3", fontSize: 14 },
  listContent: { paddingHorizontal: 50, paddingBottom: 40, paddingVertical: 5 },
  brandPill: {
    backgroundColor: "#262A2F",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  brandText: { color: "#B4CFEA", fontSize: 14 },
});
