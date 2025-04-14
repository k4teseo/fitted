import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Switch,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useUploadContext } from "../context/uploadContext";
import { supabase } from "@/lib/supabase";
import { getOrCreateUserId } from "@/lib/auth";

type TaggingProps = { imageUri: string };

export default function Tagging({ imageUri }: TaggingProps) {
  const { selectedBrands, selectedOccasions, setSelectedOccasions } =
    useUploadContext();
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [openAIEnabled, setOpenAIEnabled] = useState(false);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const fetchTags = async () => {
        const { data: globalOccasionsData, error: globalOccasionsError } =
          await supabase.from("tags").select("name").eq("tag_type", "occasion");

        const userId = await getOrCreateUserId();
        const { data: userOccasionsData, error: userOccasionsError } =
          await supabase
            .from("user_tags")
            .select("name")
            .eq("user_id", userId)
            .eq("tag_type", "occasion");

        if (globalOccasionsError || userOccasionsError) {
          console.error(
            "Error fetching occasions:",
            globalOccasionsError || userOccasionsError
          );
        } else {
          const globalOccs =
            globalOccasionsData?.map((item) => item.name) ?? [];
          const userOccs = userOccasionsData?.map((item) => item.name) ?? [];
          setAvailableOccasions([...globalOccs, ...userOccs]);
        }
      };

      fetchTags();
    }, [])
  );

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((item) => item !== occasion)
        : [...prev, occasion]
    );
  };

  const sortedOccasions = [...availableOccasions].sort((a, b) => {
    const isASelected = selectedOccasions.includes(a);
    const isBSelected = selectedOccasions.includes(b);
    return (isBSelected ? 1 : 0) - (isASelected ? 1 : 0);
  });

  const renderOccasionTag = (occasion: string) => {
    const isSelected = selectedOccasions.includes(occasion);
    return (
      <Pressable
        onPress={() => toggleOccasion(occasion)}
        style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
      >
        <Text
          style={[styles.tagText, isSelected && styles.tagTextSelected]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {occasion}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Occasions */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          Add Occasion<Text style={styles.asterisk}>*</Text>
        </Text>
        <Pressable
          style={styles.chevronButton}
          onPress={() => router.push("/components/addOccasion")}
        >
          <MaterialIcons name="chevron-right" size={24} color="#F5EEE3" />
        </Pressable>
      </View>
      <FlatList
        data={sortedOccasions}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderOccasionTag(item)}
      />

      {/* Add Brand Row */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.sectionTitle}>Add Brand</Text>
          <Text style={styles.brandCountText}>
            {selectedBrands.length} brands
          </Text>
        </View>
        <Pressable
          style={styles.chevronButton}
          onPress={() =>
            router.push({
              pathname: "../components/tagBrandsOnPhoto",
              params: { imageUri },
            })
          }
        >
          <MaterialIcons name="chevron-right" size={24} color="#F5EEE3" />
        </Pressable>
      </View>

      {/* AI Switch */}
      <View style={[styles.headerRow, { marginBottom: 0 }]}>
        <Text style={styles.sectionTitle}>Add Tags from OpenAI</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#4DA6FD" }}
          thumbColor={openAIEnabled ? "#F5EEE3" : "#f4f3f4"}
          onValueChange={setOpenAIEnabled}
          value={openAIEnabled}
        />
      </View>
      <Text style={styles.aiSubtitle}>
        AI feature that will analyze your post and create tags
      </Text>
      <Pressable onPress={() => Linking.openURL("https://example.com")}>
        <Text style={styles.learnMore}>Learn more</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 35 },
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
    marginRight: 8,
  },
  asterisk: { color: "#FF5F5F" },
  chevronButton: { padding: 0, marginBottom: 8 },
  tagsContainer: { flexDirection: "row", marginBottom: 30 },
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
  tagButtonSelected: { backgroundColor: "#A5C6E8", borderColor: "#F5EEE3" },
  tagText: { color: "#9AA8B6", fontSize: 12 },
  tagTextSelected: { color: "#0F1112", fontWeight: "500" },
  brandCountText: { fontSize: 12, color: "#999", marginLeft: 6 },
  aiSubtitle: { color: "#6D757E", fontSize: 10, marginBottom: 4 },
  learnMore: { color: "#90BBE5", fontSize: 8, marginBottom: 12 },
});
