import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Collection = {
    id: string;
    name: string;
};

const SaveToCollection = ({ collections = [], onSave, onClose }: { collections: Collection[], onSave: (id: string) => void; onClose: () => void }) => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const handleSave = () => {
    if (selectedCollection) {
      onSave(selectedCollection);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Save to Collection</Text>
      {collections.map((collection) => (
        <TouchableOpacity
          key={collection.id}
          style={[
            styles.collectionItem,
            selectedCollection === collection.id && styles.selected,
          ]}
          onPress={() => setSelectedCollection(collection.id)}
        >
          <Text style={styles.collectionName}>{collection.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SaveToCollection;

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#111',  // dark mode bottom sheet
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    title: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    collectionItem: {
      backgroundColor: '#222',
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
    },
    selected: {
      backgroundColor: '#333',
      borderWidth: 1,
      borderColor: '#4CAF50', // highlight green
    },
    collectionName: {
      color: 'white',
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: '#4CAF50',
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: '#555',
    },
  });