import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Switch, Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUploadContext } from "./uploadContext"; 
import { supabase } from "@/lib/supabase"; 

export default function Tagging() {
  const { selectedBrands, setSelectedBrands, selectedOccasions, setSelectedOccasions } = useUploadContext();
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [openAIEnabled, setOpenAIEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      const { data: brandsData, error: brandsError } = await supabase
        .from("tags")
        .select("name")
        .eq("tag_type", "brand");

      const { data: occasionsData, error: occasionsError } = await supabase
        .from("tags")
        .select("name")
        .eq("tag_type", "occasion");

      if (brandsError || occasionsError) {
        console.error("Error fetching tags:", brandsError || occasionsError);
      } else {
        setAvailableBrands(brandsData.map((item) => item.name));
        setAvailableOccasions(occasionsData.map((item) => item.name));
      }
    };

    fetchTags();
  }, []);

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((item) => item !== occasion) : [...prev, occasion]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    );
  };

  const renderTag = (tag: string, selected: boolean, onPress: () => void) => (
    <Pressable onPress={onPress} style={[styles.tagButton, selected && styles.tagButtonSelected]}>
      <Text style={[styles.tagText, selected && styles.tagTextSelected]} numberOfLines={1} ellipsizeMode="tail">
        {tag}
      </Text>
    </Pressable>
  );

  // Sort brands and occasions to have selected tags first
  const sortedBrands = availableBrands.sort((a, b) => {
    const isASelected = selectedBrands.includes(a);
    const isBSelected = selectedBrands.includes(b);
    return (isBSelected ? 1 : 0) - (isASelected ? 1 : 0); // Selected ones come first
  });

  const sortedOccasions = availableOccasions.sort((a, b) => {
    const isASelected = selectedOccasions.includes(a);
    const isBSelected = selectedOccasions.includes(b);
    return (isBSelected ? 1 : 0) - (isASelected ? 1 : 0); // Selected ones come first
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Add Occasion<Text style={styles.asterisk}>*</Text></Text>
        <Pressable style={styles.chevronButton} onPress={() => router.push("/addOccasion")}>
          <MaterialIcons name="chevron-right" size={24} color="#F5EEE3" />
        </Pressable>
      </View>

      <FlatList
        data={sortedOccasions}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderTag(item, selectedOccasions.includes(item), () => toggleOccasion(item))}
      />

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Add Brand</Text>
        <Pressable style={styles.chevronButton} onPress={() => router.push("/addBrand")}>
          <MaterialIcons name="chevron-right" size={24} color="#F5EEE3" />
        </Pressable>
      </View>

      <FlatList
        data={sortedBrands}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderTag(item, selectedBrands.includes(item), () => toggleBrand(item))}
      />

      <View style={[styles.headerRow, { marginBottom: 0 }]}>
        <Text style={styles.sectionTitle}>Add Tags from OpenAI</Text>
        <Switch trackColor={{ false: "#767577", true: "#4DA6FD" }} thumbColor={openAIEnabled ? "#F5EEE3" : "#f4f3f4"} onValueChange={setOpenAIEnabled} value={openAIEnabled} />
      </View>
      <Text style={styles.aiSubtitle}>AI feature that will analyze your post and create tags</Text>
      <Pressable onPress={() => Linking.openURL("https://example.com")}>
        <Text style={styles.learnMore}>Learn more</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 35,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F5EEE3",
  },
  asterisk: {
    color: "#FF5F5F",
  },
  chevronButton: {
    padding: 0,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  tagButton: {
    backgroundColor: "#262A2F",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
    maxWidth: 180,
    flexShrink: 1,
    width: "auto",
  },
  tagButtonSelected: {
    backgroundColor: "#A5C6E8",
    borderColor: "#F5EEE3",
  },
  tagText: {
    color: "#9AA8B6",
    fontSize: 12,
  },
  tagTextSelected: {
    color: "#0F1112",
    fontWeight: "500",
  },
  aiSubtitle: {
    color: "#6D757E",
    fontSize: 10,
    marginBottom: 4,
  },
  learnMore: {
    color: "#90BBE5",
    fontSize: 8,
    marginBottom: 12,
  },
});