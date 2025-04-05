import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useUploadContext, BrandTag } from "../context/uploadContext";

export default function TagBrandsOnPhoto() {
  const { imageUri, imageId, brandName, x, y } = useLocalSearchParams<{
    imageUri?: string;
    imageId?: string;
    brandName?: string;
    x?: string;
    y?: string;
  }>();
  const router = useRouter();
  const { brandTags, setBrandTags, selectedBrands, setSelectedBrands } =
    useUploadContext();

  const [photoLayout, setPhotoLayout] = React.useState({ width: 0, height: 0 });
  const [loading, setLoading] = React.useState(false);

  // Use a ref to track last processed tag params and avoid duplicates.
  const lastTagParams = useRef<{ brandName?: string; x?: string; y?: string }>(
    {}
  );

  useEffect(() => {
    router.setParams({ title: "Add Brands" });
  }, [router]);

  // When route params change, append a new tag if not already processed.
  useEffect(() => {
    if (brandName && x && y) {
      if (
        lastTagParams.current.brandName === brandName &&
        lastTagParams.current.x === x &&
        lastTagParams.current.y === y
      ) {
        return;
      }
      lastTagParams.current = { brandName, x, y };
      const newTag: BrandTag = {
        id: Date.now().toString(),
        brand: decodeURIComponent(brandName),
        x: parseFloat(x),
        y: parseFloat(y),
      };
      setBrandTags((prev) => [...prev, newTag]);
    }
  }, [brandName, x, y, setBrandTags]);

  // On photo tap, navigate to AddBrand with calculated relative coordinates.
  const handlePhotoPress = (evt: GestureResponderEvent) => {
    if (!photoLayout.width || !photoLayout.height) return;
    const { locationX, locationY } = evt.nativeEvent;
    const xRel = locationX / photoLayout.width;
    const yRel = locationY / photoLayout.height;

    router.push({
      pathname: "/components/addBrand",
      params: {
        x: xRel.toString(),
        y: yRel.toString(),
        imageUri,
      },
    });
  };

  // Remove a tag and deselect the brand
  const handleRemoveTag = (tagId: string) => {
    const tagToRemove = brandTags.find((tag) => tag.id === tagId);
    if (tagToRemove) {
      setSelectedBrands((prev) =>
        prev.filter((brand) => brand !== tagToRemove.brand)
      );
    }
    setBrandTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  // On Done, upload tags if imageId exists (and do not clear tags here).
  const handleDone = async () => {
    if (!imageId) {
      router.replace({
        pathname: "/pages/upload",
        params: {
          imageUri,
          brandTags: JSON.stringify(brandTags),
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
        brandTags: JSON.stringify(brandTags),
      },
    });
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator size="large" color="#B4CFEA" style={styles.loader} />
      )}
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </Pressable>
        <Text style={styles.topTitle}>Add Brand</Text>
        <View style={{ width: 24 }} />
      </View>
      <View
        style={styles.imageContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setPhotoLayout({ width, height });
        }}
      >
        <Pressable onPress={handlePhotoPress} style={styles.pressable}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
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

      <View style={styles.tagsListContainer}>
        {/* Show header ONLY if tags exist */}
        {brandTags.length > 0 && (
          <Text style={styles.tagsListHeader}>Tags</Text>
        )}

        {/* Show hint text if no tags, otherwise show the list */}
        {brandTags.length === 0 ? (
          <Text style={styles.footerText}>Tap photo to add brands.
        </Text>
        ) : (
          <FlatList
            data={brandTags}
            keyExtractor={(tag) => tag.id}
            renderItem={({ item }) => (
              <View style={styles.tagsListItem}>
                <Text style={styles.tagsListItemText}>{item.brand}</Text>
                <Pressable
                  style={styles.tagsListItemRemove}
                  onPress={() => handleRemoveTag(item.id)}
                >
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
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
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
  loader: {
    marginTop: 10,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  pressable: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  missingText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  tagPill: {
    position: "absolute",
    backgroundColor: "#202325",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: {
    color: "#9AA8B6",
    fontSize: 10,
    fontWeight: 500,
  },
  tagsListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tagsListHeader: {
    color: "#F5EEE3",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "600",
    textAlign: "left",
  },
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
  tagsListItemText: { 
    color: "#F5EEE3", 
    fontSize: 14 
  },
  tagsListItemRemove: { 
    padding: 4 
  },
  doneButton: { 
    backgroundColor: "#4DA6FD", 
    padding: 17, 
    alignItems: "center" 
  },
  doneText: { 
    color: "#fff", 
    fontSize: 16 
  },
  footerText: { 
    color: "#7F8A95", 
    fontSize: 14, 
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20
  },
});
