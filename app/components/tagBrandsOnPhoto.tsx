import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

type BrandTag = {
  id: string;
  brand: string;
  x: number; // Relative horizontal coordinate (0..1)
  y: number; // Relative vertical coordinate (0..1)
};

export default function TagBrandsOnPhoto() {
  // Read imageUri (and optionally imageId) from route params.
  const { imageUri, imageId, brandName, x, y } = useLocalSearchParams<{
    imageUri?: string;
    imageId?: string;
    brandName?: string;
    x?: string;
    y?: string;
  }>();
  const router = useRouter();

  // photoUrl is initialized from imageUri.
  const [photoUrl, setPhotoUrl] = useState<string | null>(imageUri || null);
  const [photoLayout, setPhotoLayout] = useState({ width: 0, height: 0 });
  const [brandTags, setBrandTags] = useState<BrandTag[]>([]);
  const [loading, setLoading] = useState(false);

  // Set photoUrl on mount if imageUri is provided.
  useEffect(() => {
    if (imageUri) {
      setPhotoUrl(imageUri);
    }
  }, [imageUri]);

  // If brandName, x, and y are provided, add a new brand tag.
  useEffect(() => {
    if (brandName && x && y) {
      const newTag: BrandTag = {
        id: Date.now().toString(),
        brand: brandName,
        x: parseFloat(x),
        y: parseFloat(y),
      };
      setBrandTags((prev) => [...prev, newTag]);
      // Optionally, clear the parameters (if your router supports it)
      // router.setParams({ brandName: undefined, x: undefined, y: undefined });
    }
  }, [brandName, x, y]);

  // When the user taps on the photo, calculate relative coordinates and navigate to AddBrand.
  const handlePhotoPress = (evt: GestureResponderEvent) => {
    if (!photoLayout.width || !photoLayout.height) return;
    const { locationX, locationY } = evt.nativeEvent;
    const xRel = locationX / photoLayout.width;
    const yRel = locationY / photoLayout.height;

    // Navigate to the AddBrand screen with the tap coordinates and current imageUri.
    router.push({
      pathname: "/components/addBrand",
      params: {
        x: xRel.toString(),
        y: yRel.toString(),
        imageUri, // Pass the current imageUri
      },
    });
  };

  // Remove a tag from local state.
  const handleRemoveTag = (tagId: string) => {
    setBrandTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  const handleDone = async () => {
    if (!imageId) {
      console.log("No imageId provided; returning to upload page.");
      router.replace({
        pathname: "/pages/upload",
        params: { 
          imageUri,
          brandTags: JSON.stringify(brandTags) // Pass the brand tags as a JSON string
        },
      });
      return;
    }
    setLoading(true);
    for (const tag of brandTags) {
      const { error } = await supabase.from("image_brand_tags").insert({
        image_id: imageId,
        brand_name: tag.brand,
        x_position: tag.x,
        y_position: tag.y,
      });
      if (error) {
        console.error("Error inserting brand tag:", error);
      }
    }
    setLoading(false);
    router.replace({
      pathname: "/pages/upload",
      params: { 
        imageUri,
        brandTags: JSON.stringify(brandTags) // Pass the brand tags as a JSON string
      },
    });
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />}
      <View
        style={styles.imageContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setPhotoLayout({ width, height });
        }}
      >
        <Pressable onPress={handlePhotoPress} style={styles.pressable}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={styles.missingText}>No photo found.</Text>
          )}
          {brandTags.map((tag) => (
            <View
              key={tag.id}
              style={[
                styles.tagPill,
                {
                  left: tag.x * photoLayout.width,
                  top: tag.y * photoLayout.height,
                },
              ]}
            >
              <Text style={styles.tagText}>{tag.brand}</Text>
            </View>
          ))}
        </Pressable>
      </View>

      {/* A list of brand tags below the photo */}
      <View style={styles.tagsListContainer}>
        <Text style={styles.tagsListHeader}>Tags</Text>
        {brandTags.length === 0 ? (
          <Text style={{ color: "#aaa", marginTop: 5 }}>No tags yet. Tap the photo to add!</Text>
        ) : (
          <FlatList
            data={brandTags}
            keyExtractor={(tag) => tag.id}
            renderItem={({ item }) => (
              <View style={styles.tagsListItem}>
                <Text style={styles.tagsListItemText}>{item.brand}</Text>
                <Pressable style={styles.tagsListItemRemove} onPress={() => handleRemoveTag(item.id)}>
                  <MaterialIcons name="close" size={16} color="#F5EEE3" />
                </Pressable>
              </View>
            )}
          />
        )}
      </View>

      <Pressable style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15181B" },
  loader: { marginTop: 10 },
  imageContainer: { flex: 1, position: "relative" },
  pressable: { flex: 1 },
  image: { width: "100%", height: "100%" },
  missingText: { color: "#fff", textAlign: "center", marginTop: 20 },
  tagPill: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 6,
  },
  tagText: { color: "#fff", fontSize: 12 },
  tagsListContainer: {
    backgroundColor: "#1C1F22",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tagsListHeader: { color: "#F5EEE3", fontSize: 16, marginBottom: 6, fontWeight: "600" },
  tagsListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#262A2F",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  tagsListItemText: { color: "#F5EEE3", fontSize: 14 },
  tagsListItemRemove: { padding: 4 },
  doneButton: { backgroundColor: "#4DA6FD", padding: 12, alignItems: "center" },
  doneText: { color: "#fff", fontSize: 16 },
});
