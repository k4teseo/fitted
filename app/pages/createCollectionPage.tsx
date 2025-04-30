import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCollectionContext } from '../context/collectionContext';
import { useCurrentUser } from '../hook/useCurrentUser';
import { supabase } from '@/lib/supabase';

const CreateCollectionPage = () => {
  const router = useRouter();
  const currentUserId = useCurrentUser();
  const {
    collectionName,
    setCollectionName,
    previewImage,
    setPreviewImage,
    selectedOutfits,
    setSelectedOutfits,
  } = useCollectionContext();

  const [outfitImages, setOutfitImages] = useState<string[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);


  useEffect(() => {
    if (previewImage) {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(previewImage);
      setPreviewImageUrl(data.publicUrl);
    }
  }, [previewImage]);

  useEffect(() => {
    const fetchOutfitImages = async () => {
      if (selectedOutfits.length === 0) return;

      const { data: outfitData, error } = await supabase
        .from('images')
        .select('image_path')
        .in('id', selectedOutfits);

      if (error) {
        console.error('Error fetching outfit images:', error);
        return;
      }

      const imageUrls = outfitData?.map((outfit: { image_path: string }) => {
        const { publicUrl } = supabase.storage
          .from('images')
          .getPublicUrl(outfit.image_path).data;
        return publicUrl;
      });

      setOutfitImages(imageUrls || []);
    };

    fetchOutfitImages();
  }, [selectedOutfits]);

  useEffect(() => {
    // Reset context state when navigating away or when the component unmounts
    return () => {
      setCollectionName('');        // Reset collection name
      setPreviewImage('');         // Reset preview image
      setSelectedOutfits([]);        // Reset selected outfits
    };
  }, []); // Empty dependency array ensures this effect runs only on unmount

  const handleCreateCollection = async () => {
    if (!collectionName || !previewImage || selectedOutfits.length === 0) {
      Alert.alert(
        'Missing Info',
        "Please make sure you've set a name, selected a preview image, and chosen at least one outfit."
      );
      return;
    }

    // Insert new collection
    const { data: newCollection, error: collectionError } = await supabase
      .from('collections')
      .insert([
        {
          user_id: currentUserId,
          name: collectionName,
          previewImage: previewImage,
          created_at: new Date().toISOString(),
          outfit_count: selectedOutfits.length,
        },
      ])
      .select()
      .single();

    if (collectionError || !newCollection) {
      console.error('Collection creation failed:', collectionError);
      Alert.alert('Upload Failed', 'There was an issue creating the collection.');
      return;
    }

    // Insert saved outfits
    const savedPostEntries = selectedOutfits.map((imageId) => ({
      user_id: currentUserId,
      collection_id: newCollection.id,
      image_id: imageId,
      saved_at: new Date().toISOString(),
    }));

    const { error: savedPostError } = await supabase
      .from('saved_posts')
      .insert(savedPostEntries);

    if (savedPostError) {
      console.error('Saving outfits failed:', savedPostError);
      Alert.alert(
        'Partial Upload',
        'Collection was created, but some outfits may not have been saved.'
      );
    } else {
      // RPC to halve the outfit count
      const { data, error: rpcError } = await supabase.rpc('halve_outfit_count', {
        collection_id: newCollection.id,
      });

      if (rpcError) {
        console.error('Error halving outfit count:', rpcError);
        Alert.alert('Error', 'There was an issue halving the outfit count.');
      } else {
        Alert.alert('Success', 'Collection Created!');
      }
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Finalize Your Collection</Text>

      <View style={styles.previewContainer}>
        <Text style={styles.label}>Preview Image:</Text>
        {previewImageUrl ? (
          <TouchableOpacity onPress={() => router.push('./selectPreviewImagePage')}>
            <Image source={{ uri: previewImageUrl }} style={styles.previewImage} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.previewImagePlaceholder}
            onPress={() => router.push('./selectPreviewImagePage')}
          >
            <Text style={styles.uploadText}>Upload Image</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.textInput, styles.collectionNameInput]}
          placeholder="Collection Name"
          placeholderTextColor="#888"
          value={collectionName}
          onChangeText={setCollectionName}
        />
      </View>

      <View style={styles.outfitContainer}>
        <Text style={styles.label}>Outfits Selected: {selectedOutfits.length}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.selectedOutfitsContainer}>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => router.push('./selectOutfitsPage')}
            >
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>

            {outfitImages.map((imageUrl, index) => (
              <TouchableOpacity key={index} style={styles.outfitCardContainer}>
                <Image source={{ uri: imageUrl }} style={styles.outfitImage} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateCollection}>
        <Text style={styles.createButtonText}>Create Collection</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateCollectionPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15181B',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5EEE3',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    marginTop: -20,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#4DA6FD',
    fontSize: 32, // Bigger arrow for better visibility
  },
  label: {
    color: '#F5EEE3',
    marginBottom: 8,
  },
  previewContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    color: '#F5EEE3',
    fontWeight: 'bold',
  },
  textInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    marginTop: 12,
    color: '#F5EEE3',
    backgroundColor: '#15181B', 
  },
  collectionNameInput: {
    paddingLeft: 10, // Align to top-left
    textAlignVertical: 'top', // Make sure the text aligns vertically
  },
  outfitContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  selectedOutfitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    paddingLeft: 0,
    gap: 12,
  },
  outfitCardContainer: {
    width: 100,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  outfitImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  plusButton: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  plusIcon: {
    color: '#F5EEE3',
    fontSize: 40,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4DA6FD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});