import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCollectionContext } from "../context/collectionContext";
import { useCurrentUser } from "../hook/useCurrentUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

interface Outfit {
  id: string;
  image_path: string;
  signed_url: string;
}

interface SavedPost {
  image_id: string;
  images: { id: string; image_path: string }[];
}

const SelectPreviewImagePage = () => {
  const router = useRouter();
  const [selectableImages, setSelectableImages] = useState<Outfit[]>([]);
  const currentUserId = useCurrentUser();
  const { setPreviewImage } = useCollectionContext();
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);

  useEffect(() => {
    setLoadedImages(0);
  }, [selectableImages]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserOutfits = async (uid: string) => {
      const { data: uploadedOutfitsRaw, error: uploadedError } = await supabase
        .from("images")
        .select("id, image_path")
        .eq("user_id", uid);

      const { data: savedPostsRaw, error: savedError } = await supabase
        .from("saved_posts")
        .select("image_id, images!inner(id, image_path)")
        .eq("images.user_id", uid);

      if (uploadedError || savedError) {
        console.error("Error fetching outfits:", uploadedError || savedError);
        return;
      }

      const uploadedOutfits: { id: string; image_path: string }[] =
        uploadedOutfitsRaw || [];

      const savedOutfits: { id: string; image_path: string }[] = [];

      (savedPostsRaw || []).forEach((post: SavedPost) => {
        if (post.images && post.images.length > 0) {
          const firstImage = post.images[0]; // Or however you want to handle multiple images
          savedOutfits.push({
            id: firstImage.id,
            image_path: firstImage.image_path,
          });
        }
      });

      const allOutfits = [...uploadedOutfits, ...savedOutfits];

      const uniqueOutfitMap = new Map<
        string,
        { id: string; image_path: string }
      >();
      for (const outfit of allOutfits) {
        if (outfit?.id && outfit?.image_path) {
          uniqueOutfitMap.set(outfit.id, outfit);
        }
      }

      const uniqueOutfits = Array.from(uniqueOutfitMap.values());

      const { data: signedUrlsData, error: signedUrlError } =
        await supabase.storage.from("images").createSignedUrls(
          uniqueOutfits.map((o) => o.image_path),
          60 * 60
        );

      if (signedUrlError) {
        console.error("Error generating signed URLs:", signedUrlError);
        return;
      }

      const urlMap: Record<string, string> = {};
      (signedUrlsData || []).forEach(({ path, signedUrl }) => {
        if (path && signedUrl) {
          urlMap[path] = signedUrl;
        }
      });

      const outfitsWithSignedUrls: Outfit[] = uniqueOutfits.map((o) => ({
        id: o.id,
        image_path: o.image_path,
        signed_url: urlMap[o.image_path] || "",
      }));

      setSelectableImages(outfitsWithSignedUrls);
    };

    fetchUserOutfits(currentUserId);
  }, [currentUserId]);

  const handleSelectImage = (imagePath: string) => {
    setPreviewImage(imagePath);
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Select Preview Image</Text>

      {selectableImages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4DA6FD" />
        </View>
      ) : (
        <FlatList
          data={selectableImages}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectImage(item.image_path)}
              style={styles.outfitItem}
            >
              <Image
                source={{ uri: item.signed_url }}
                style={styles.image}
                onLoadEnd={() => {
                  setLoadedImages((prev) => {
                    const newLoaded = prev + 1;
                    if (newLoaded === selectableImages.length) {
                      setLoading(false);
                    }
                    return newLoaded;
                  });
                }}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Show loading spinner over FlatList if still loading */}
      {loading && (
        <View style={styles.absoluteLoading}>
          <ActivityIndicator size="large" color="#4DA6FD" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15181B", padding: 16 },
  label: {
    color: "#F5EEE3",
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    fontSize: 22,
  },

  backButton: {
    marginTop: 50,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#4DA6FD",
    fontSize: 32, // Bigger arrow
  },

  columnWrapper: {
    gap: 8,
  },
  grid: {
    paddingBottom: 16,
  },
  outfitItem: {
    flex: 1,
    aspectRatio: 1, // Make it square
    maxWidth: "32%", // About 3 per row
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#15181B",
  },
  absoluteLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#15181B",
  },
});

export default SelectPreviewImagePage;
