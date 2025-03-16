// app/tagging.tsx
import React, { useEffect, useState } from "react";
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

/** Example data */
const OCCASIONS = ["Everyday Wear", "Coffee Date", "Job Interview"];
const BRANDS = ["Abercrombie & Fitch", "Lululemon", "Uniqlo"];

type TaggingProps = {
  selectedBrands: string[];
  selectedOccasions: string[];
  onTagsSelected?: (occasions: string[], brands: string[]) => void;
};

export default function Tagging({ selectedBrands = [], selectedOccasions = [], onTagsSelected }: TaggingProps) {
  const [localSelectedOccasions, setLocalSelectedOccasions] = useState<string[]>(selectedOccasions);
  const [localSelectedBrands, setLocalSelectedBrands] = useState<string[]>(selectedBrands);
  const [openAIEnabled, setOpenAIEnabled] = useState(false);

  const router = useRouter();

  // Toggle an occasion tag on/off
  const toggleOccasion = (occasion: string) => {
    setLocalSelectedOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((item) => item !== occasion)
        : [...prev, occasion]
    );
  };

  // Toggle a brand tag on/off
  const toggleBrand = (brand: string) => {
    setLocalSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    );
  };

  // Whenever selections change, call onTagsSelected
  useEffect(() => {
    if (onTagsSelected) {
      onTagsSelected(localSelectedOccasions, localSelectedBrands);
    }
  }, [localSelectedOccasions, localSelectedBrands]);

  // Renders a single tag "pill"
  const renderTag = (tag: string, selected: boolean, onPress: () => void) => {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.tagButton,
          selected && styles.tagButtonSelected,
        ]}
      >
        <Text
          style={[styles.tagText, selected && styles.tagTextSelected]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {tag}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Row: "Add Occasion" + Chevron */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          Add Occasion<Text style={styles.asterisk}>*</Text>
        </Text>
        <Pressable
          style={styles.chevronButton}
          onPress={() => router.push("/addOccasion")}
        >
          <MaterialIcons name="chevron-right" size={24} color="#F5EEE3" />
        </Pressable>
      </View>

      {/* Horizontal list of occasions */}
      <FlatList
        data={OCCASIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          renderTag(item, localSelectedOccasions.includes(item), () =>
            toggleOccasion(item)
          )
        }
      />

      {/* Row: "Add Brand" + Chevron */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Add Brand</Text>
        <Pressable
          style={styles.chevronButton}
          onPress={() => router.push("/addBrand")}
        >
          <MaterialIcons name="chevron-right" size={24} color="#F5EEE3" />
        </Pressable>
      </View>

      {/* Horizontal list of brands */}
      <FlatList
        data={BRANDS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          renderTag(item, localSelectedBrands.includes(item), () =>
            toggleBrand(item)
          )
        }
      />

      {/* Add tags from OpenAI section */}
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
  // "Add Tags from OpenAI" section
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
