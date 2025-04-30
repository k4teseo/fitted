import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '../hook/useCurrentUser';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for back arrow

type Collection = {
  id: string;
  name: string;
};

const SaveToCollectionPage = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams(); // <-- Grab postId from URL
  const userId = useCurrentUser();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching collections:', error);
        Alert.alert('Error', 'Could not load collections.');
      } else {
        setCollections(data || []);
      }
      setLoading(false);
    };

    fetchCollections();
  }, [userId]);

  const handleSaveToCollection = async (collectionId: string) => {
    if (!userId || !postId) return;

    const { error } = await supabase
      .from('saved_posts')
      .insert([
        {
          user_id: userId,
          collection_id: collectionId,
          image_id: postId,
          saved_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error saving post to collection:', error);
      Alert.alert('Save Failed', 'Could not save to collection.');
    } else {
      Alert.alert('Saved', 'Post added to collection!');
      router.back(); // Go back after saving
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color="#4DA6FD" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#F5EEE3" />
        </TouchableOpacity>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Select a Collection</Text>
      </View>

      {collections.map((collection) => (
        <TouchableOpacity
          key={collection.id}
          style={styles.collectionItem}
          onPress={() => handleSaveToCollection(collection.id)}
        >
          <Text style={styles.collectionName}>{collection.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SaveToCollectionPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15181B',
    padding: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#15181B',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 20,
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5EEE3',
    textAlign: 'center',
    flex: 1,
  },
  collectionItem: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  collectionName: {
    color: '#F5EEE3',
    fontSize: 16,
  },
});