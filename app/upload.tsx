import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function UploadPage() {
  const params = useLocalSearchParams() as { imageUri?: string };
  const imageUri = params.imageUri;

  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No image found</Text>
      </View>
    );
  }

  // Function to handle image upload
  const uploadImage = async () => {
    if (!imageUri || !name) return; // Ensure there's an image and a username

    try {
      // Fetch the image as a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const fileName = `public/${Date.now()}.jpg`;
      
      // Upload the image to Supabase Storage
      const { error } = await supabase.storage.from('images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
      if (error) {
        console.error('Error uploading image:', error);
      } else {
        // Save the image metadata along with the username and caption
        const { error: insertError } = await supabase
          .from('images')
          .insert([{ image_path: fileName, caption, username: name }]);

        if (insertError) {
          console.error('Error saving image metadata:', insertError);
        } else {
          console.log('Image uploaded successfully with name and caption:', name, caption);
          // Optionally navigate or reset state after successful upload
        }
      }
    } catch (error) {
      console.error('Error during upload:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Image</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter caption"
        value={caption}
        onChangeText={setCaption}
      />
      <Button title="Upload" onPress={uploadImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 400,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});
