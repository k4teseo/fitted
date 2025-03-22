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
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getOrCreateUserId } from "@/lib/auth";
import { useUploadContext } from "../context/uploadContext";

export default function AddBrand() {
  const router = useRouter();
  // Retrieve tap coordinates and imageUri from route parameters
  const { x, y, imageUri } = useLocalSearchParams<{ x: string; y: string; imageUri: string }>();
  const { selectedBrands, setSelectedBrands } = useUploadContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [globalBrands, setGlobalBrands] = useState<string[]>([]);
  const [userBrands, setUserBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // For animating the "Add" icon
  const scaleValue = useRef(new Animated.Value(1)).current;

  // 1) Fetch global brands from "tags" (tag_type = "brand")
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

  // 2) Fetch user-specific custom brands from "user_tags" with tag_type "brand"
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

  // Merge global and user brands
  const combinedBrands = [...globalBrands, ...userBrands];

  // Filter brands based on searchTerm
  const filteredBrands = combinedBrands.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if the typed term is new
  const isNewBrand =
    searchTerm.length > 0 &&
    !combinedBrands.some(
      (brand) => brand.toLowerCase() === searchTerm.toLowerCase()
    );

  // Helper: reorder brands so that:
  // 1. Selected brands come first.
  // 2. Among unselected, user-added appear above global.
  function reorderBrands(
    brands: string[],
    selected: string[],
    userCreated: string[]
  ) {
    return brands.slice().sort((a, b) => {
      const aSelected = selected.includes(a);
      const bSelected = selected.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      if (!aSelected && !bSelected) {
        const aIsCustom = userCreated.includes(a);
        const bIsCustom = userCreated.includes(b);
        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
      }
      return 0;
    });
  }

  // Final reordered list
  const finalBrands = reorderBrands(filteredBrands, selectedBrands, userBrands);

  // Animate the "Add" icon on press
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

  // When a brand is selected, update the context and navigate back to TagBrandsOnPhoto
  const handleSelectBrand = (brand: string) => {
    setSelectedBrands((prevSelected) => {
      if (!prevSelected.includes(brand)) {
        return [...prevSelected, brand];
      }
      return prevSelected;
    });

    router.push({
      pathname: "/components/tagBrandsOnPhoto",
      params: {
        brandName: encodeURIComponent(brand),
        x: x, // x coordinate from route params
        y: y, // y coordinate from route params
        imageUri, // current imageUri
      },
    });
  };

  // Add a new custom brand then navigate back to TagBrandsOnPhoto
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

      // Update local states and context
      setUserBrands((prev) => [...prev, searchTerm]);
      setSelectedBrands((prev) => {
        if (!prev.includes(searchTerm)) {
          return [...prev, searchTerm];
        }
        return prev;
      });
      const brandToAdd = searchTerm;
      setSearchTerm("");

      router.push({
        pathname: "/components/tagBrandsOnPhoto",
        params: {
          brandName: encodeURIComponent(brandToAdd),
          x: x,
          y: y,
          imageUri,
        },
      });
    } catch (err) {
      console.log("Error in handleAddBrand:", err);
    }
  };

  // Delete a user-added brand
  const handleDeleteBrand = async (brand: string, e: GestureResponderEvent) => {
    e.stopPropagation();
    try {
      const userId = await getOrCreateUserId();
      const { error } = await supabase
        .from("user_tags")
        .delete()
        .eq("user_id", userId)
        .eq("name", brand)
        .eq("tag_type", "brand");

      if (error) {
        console.log("Error deleting custom brand:", error);
        return;
      }

      setUserBrands((prev) => prev.filter((item) => item !== brand));
      setSelectedBrands((prev) => prev.filter((item) => item !== brand));
    } catch (err) {
      console.log("Error in handleDeleteBrand:", err);
    }
  };

  // Render each brand as a "pill" with an optional "X" for user-added brands
  const renderBrandItem = ({ item }: { item: string }) => {
    const isSelected = selectedBrands.includes(item);
    const isUserBrand = userBrands.includes(item);

    return (
      <Pressable
        style={[styles.brandPill, isSelected && styles.selectedBrand]}
        onPress={() => handleSelectBrand(item)}
      >
        <Text style={[styles.brandText, isSelected && styles.selectedBrandText]}>
          {item}
        </Text>
        {isUserBrand && (
          <Pressable
            style={styles.xCircle}
            onPress={(e) => handleDeleteBrand(item, e)}
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
          {isNewBrand && (
            <Pressable style={styles.addRow} onPress={handleAddBrand}>
              <Animated.View style={{ transform: [{ scale: scaleValue }], marginRight: 8 }}>
                <MaterialIcons name="add" size={20} color="#F5EEE3" />
              </Animated.View>
              <Text style={styles.addRowText}>Add “{searchTerm}”</Text>
            </Pressable>
          )}

          <FlatList
            data={finalBrands}
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
  listContent: {
    paddingHorizontal: 50,
    paddingBottom: 40,
    paddingVertical: 5,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#262A2F",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  brandText: {
    color: "#B4CFEA",
    fontSize: 14,
    flexShrink: 1,
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
  xCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
