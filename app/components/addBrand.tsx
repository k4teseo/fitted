import React, { useState, useEffect, useContext, useRef } from "react";
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
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getOrCreateUserId } from "@/lib/auth";
import { useUploadContext } from "../context/uploadContext"; 

export default function AddBrand() {
  const router = useRouter();
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
      } else {
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

  // Merge global + user brands
  const combinedBrands = [...globalBrands, ...userBrands];

  // Filter based on searchTerm
  const filteredBrands = combinedBrands.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if the typed term is new
  const isNewBrand =
    searchTerm.length > 0 &&
    !combinedBrands.some(
      (brand) => brand.toLowerCase() === searchTerm.toLowerCase()
    );

  // Helper: reorder so that:
  // 1. Selected brands come first.
  // 2. Among not selected, user-added appear above global.
  function reorderBrands(
    brands: string[],
    selected: string[],
    userCreated: string[]
  ) {
    return brands.slice().sort((a, b) => {
      const aSelected = selected.includes(a);
      const bSelected = selected.includes(b);
      // Selected first
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      // If both are unselected (or both selected), place user brand first
      if (!aSelected && !bSelected) {
        const aIsCustom = userCreated.includes(a);
        const bIsCustom = userCreated.includes(b);
        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
      }
      return 0;
    });
  }

  // Reordered final list
  const finalBrands = reorderBrands(filteredBrands, selectedBrands, userBrands);

  // Toggle selection
  const handleSelectBrand = (brand: string) => {
    setSelectedBrands((prevSelected) => {
      if (prevSelected.includes(brand)) {
        return prevSelected.filter((item) => item !== brand);
      } else {
        return [...prevSelected, brand];
      }
    });
  };

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

  // 3) Add a new custom brand
  const handleAddBrand = async () => {
    try {
      animateAddIcon();
      const userId = await getOrCreateUserId();
      // If you have a "tag_type" column in user_tags, also pass { tag_type: "brand" }
      const { error } = await supabase
        .from("user_tags")
        .insert({ user_id: userId, name: searchTerm, tag_type: "brand" })
        .single();

      if (error) {
        console.log("Error adding custom brand:", error);
        return;
      }

      // Add to local userBrands + select it
      setUserBrands((prev) => [...prev, searchTerm]);
      setSelectedBrands((prev) => [...prev, searchTerm]);
      setSearchTerm("");
    } catch (err) {
      console.log("Error in handleAddBrand:", err);
    }
  };

  // 4) Delete a user-added brand (with tag_type "brand")
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

  // Render each brand as a "pill" with optional "X" if user-added
  const renderBrandItem = ({ item }: { item: string }) => {
    const isSelected = selectedBrands.includes(item);
    const isUserBrand = userBrands.includes(item);

    return (
      <Pressable
        style={[
          styles.brandPill,
          isSelected && styles.selectedBrand,
        ]}
        onPress={() => handleSelectBrand(item)}
      >
        <Text
          style={[
            styles.brandText,
            isSelected && styles.selectedBrandText,
          ]}
        >
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
        {/* Clear icon if user typed something */}
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
    paddingTop: 40, // for iOS notch
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
  /* "Add" row for new custom brand */
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
  // Brand List
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
    color: "#9AA8B6",
    fontSize: 14,
    flexShrink: 1,
  },
  selectedBrand: {
    backgroundColor: "#A5C6E8", // Highlight selected occasion
  },
  selectedBrandText: {
    color: "#262A2F", // Change text color for selected occasion
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
  selectedBrands: {
    color: "#B4CFEA",
    fontSize: 14,
  },
  // A small circle for the X
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