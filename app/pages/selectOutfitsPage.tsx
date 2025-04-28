import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useCollectionContext } from '../context/collectionContext';
import { useCurrentUser } from '../hook/useCurrentUser';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface Outfit {
  id: string;
  image_path: string;
  signed_url: string;
}

interface SavedPost {
  image_id: string;
  images: { id: string; image_path: string }[];
}

const SelectOutfitsPage = () => {
  const router = useRouter();
  const [selectableOutfits, setSelectableOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true); // Loading spinner state
  const currentUserId = useCurrentUser();
  const { selectedOutfits, setSelectedOutfits } = useCollectionContext();

  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserOutfits = async (uid: string) => {
      const { data: uploadedOutfitsRaw, error: uploadedError } = await supabase
        .from('images')
        .select('id, image_path')
        .eq('user_id', uid);

      const { data: savedPostsRaw, error: savedError } = await supabase
        .from('saved_posts')
        .select('image_id, images!inner(id, image_path)')
        .eq('images.user_id', uid);

      if (uploadedError || savedError) {
        console.error('Error fetching outfits:', uploadedError || savedError);
        return;
      }

      const uploadedOutfits: { id: string; image_path: string }[] = uploadedOutfitsRaw || [];
      const savedOutfits: { id: string; image_path: string }[] = [];

      (savedPostsRaw || []).forEach((post: SavedPost) => {
        if (post.images && post.images.length > 0) {
          const firstImage = post.images[0];
          savedOutfits.push({ id: firstImage.id, image_path: firstImage.image_path });
        }
      });

      const allOutfits = [...uploadedOutfits, ...savedOutfits];
      const uniqueOutfitMap = new Map<string, { id: string; image_path: string }>();

      for (const outfit of allOutfits) {
        if (outfit?.id && outfit?.image_path) {
          uniqueOutfitMap.set(outfit.id, outfit);
        }
      }

      const uniqueOutfits = Array.from(uniqueOutfitMap.values());

      const { data: signedUrlsData, error: signedUrlError } = await supabase.storage
        .from('images')
        .createSignedUrls(uniqueOutfits.map((o) => o.image_path), 60 * 60);

      if (signedUrlError) {
        console.error('Error generating signed URLs:', signedUrlError);
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
        signed_url: urlMap[o.image_path] || '',
      }));

      setSelectableOutfits(outfitsWithSignedUrls);
      setLoading(false); // Finished loading the data, now hide the loading spinner
    };

    fetchUserOutfits(currentUserId);
  }, [currentUserId]);

  const handleSelectOutfit = (outfitId: string) => {
    setSelectedOutfits((prev) =>
      prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Select Outfits for Collection</Text>

      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4DA6FD" />
        </View>
      ) : (
        <FlatList
          data={selectableOutfits}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ paddingTop: 16 }}
          columnWrapperStyle={styles.columnWrapper}  // Add columnWrapperStyle here
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectOutfit(item.id)} style={styles.outfitItem}>
              <Image
                source={{ uri: item.signed_url }}
                style={[styles.image, selectedOutfits.includes(item.id) && styles.selected]}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Show loading spinner overlay if still loading */}
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
  
  // Label styling (now consistent with other page)
  label: {
    color: "#F5EEE3",
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    fontSize: 22,
  },

  // Back button and text styling (now consistent with other page)
  backButton: {
    marginTop: 50,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#4DA6FD",
    fontSize: 32, // Bigger arrow for better visibility
  },

  columnWrapper: {
    gap: 8, // Adjust the gap between columns
  },

  outfitItem: {
    flex: 1,
    aspectRatio: 1, // Keep images square
    maxWidth: '32%', // 3 images per row
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  image: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 10 
  },
  selected: {
    borderColor: '#4DA6FD',
    borderWidth: 2,
  },

  // Loading container styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#15181B",
  },
  absoluteLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#15181B",
  },
});

export default SelectOutfitsPage;