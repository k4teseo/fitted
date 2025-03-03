import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import uploadStyles from "./uploadStyles";
import { MaterialIcons } from "@expo/vector-icons";

export default function UploadPage() {
  const params = useLocalSearchParams() as { imageUri?: string };
  const imageUri = params.imageUri;

  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');

  const router = useRouter(); 

  if (!imageUri) {
    return (
      <View style={uploadStyles.container}>
        <View style={uploadStyles.topBar}>
          <TouchableOpacity 
            style={uploadStyles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
          <View />
        </View>
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          No image found
        </Text>
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
           // Navigate back and trigger a refresh
            router.replace("/feedPage");
        }
      }
    } catch (error) {
      console.error('Error during upload:', error);
    }
  };
  return (
    <View style={uploadStyles.container}>
      {/* Top Bar */}
      <View style={uploadStyles.topBar}>
        <TouchableOpacity 
          style={uploadStyles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
        </TouchableOpacity>

        {/* Post Button */}
        <TouchableOpacity style={uploadStyles.postButton} onPress={uploadImage}>
          <Text style={uploadStyles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={uploadStyles.imageContainer}>
        <Image source={{ uri: imageUri }} style={uploadStyles.image} />
      </View>

      {/* Inputs */}
      <View style={uploadStyles.inputContainer}>
        <TextInput
          style={uploadStyles.input}
          placeholder="Write caption..."
          placeholderTextColor="#7E8487"
          value={caption}
          onChangeText={setCaption}
        />
        <TextInput
          style={uploadStyles.input}
          placeholder="Write your name..."
          placeholderTextColor="#7E8487"
          value={name}
          onChangeText={setName}
        />
      </View>
    </View>
  );
}