import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import Tagging from './tagging';
import { useUploadContext } from "../context/uploadContext";  
import { analyzeOutfit } from "../components/openaiVision";
import LoadingScreen from "../components/loading";

export default function UploadPage() {
  // Read the imageUri from route parameters
  const params = useLocalSearchParams() as { imageUri?: string };
  const router = useRouter();
  const imageUri = params.imageUri;
  const [name, setName] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const { selectedBrands, selectedOccasions, setSelectedBrands, setSelectedOccasions } = useUploadContext(); // Use Context
  
  const [loading, setLoading] = useState(false);

  if (loading) return <LoadingScreen />;

  if (!imageUri) {
      return (
        <View style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
            No image found
          </Text>
        </View>
      );
  }

  const handlePost = async () => {
      if (!imageUri || !name) return;

      setLoading(true);

      try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const arrayBuffer = await new Response(blob).arrayBuffer();
          const fileName = `public/${Date.now()}.jpg`;

          const { error: uploadError } = await supabase.storage
              .from("images")
              .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: false });

          if (uploadError) {
              console.error("Error uploading image:", uploadError);
              return;
          }

          const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);
          const publicImageUrl = publicUrlData?.publicUrl;

          if (!publicImageUrl) {
            console.error("Failed to retrieve public image URL.");
            return;
          }

          const metadata = await analyzeOutfit(publicImageUrl).catch(() => []);
          console.log("Extracted metadata:", metadata);

          const { error: insertError } = await supabase
              .from("images")
              .insert([{
                  image_path: fileName,
                  caption: postTitle,
                  username: name,
                  selectedbrands: selectedBrands,      
                  selectedoccasions: selectedOccasions,     
                  metadata: Array.isArray(metadata) ? metadata : [],
              }]);

          if (insertError) {
              console.error("Error saving image with tags:", insertError);
          } else {

              setSelectedBrands([]);
              setSelectedOccasions([]);

              console.log("Post uploaded successfully with tags:", postTitle);
              router.replace("./feedPage");
          }
      } catch (error) {
          console.error("Error during upload:", error);
      }
      setLoading(false);
  };

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          No image found
        </Text>
      </View>
    );
  }

  const handlePost = async () => {
    if (!imageUri || !name) return;
    try {
      // Fetch the image blob from the provided URI
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `public/${Date.now()}.jpg`;

      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return;
      }

      // Insert image metadata into the "images" table
      const { data: imageData, error: insertError } = await supabase
        .from("images")
        .insert([
          {
            image_path: fileName,
            caption: postTitle,
            username: name,
            selectedbrands: selectedBrands,
            selectedoccasions: selectedOccasions,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error saving image with tags:", insertError);
        return;
      }

      // Save each brand tag from the context to the "image_brand_tags" table
      if (brandTags.length > 0) {
        for (const tag of brandTags) {
          const { error: tagError } = await supabase
            .from("image_brand_tags")
            .insert({
              image_id: imageData.id,
              brand_name: tag.brand,
              x_position: tag.x,
              y_position: tag.y,
            });

          if (tagError) {
            console.error("Error saving brand tag:", tagError);
          }
        }
      }

      console.log("Post uploaded successfully with tags:", postTitle);
      router.replace("/pages/feedPage");
    } catch (error) {
      console.error("Error during upload:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.postTitleInput}
              placeholder="Write Post Title..."
              placeholderTextColor="#7E8487"
              value={postTitle}
              onChangeText={setPostTitle}
            />
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TextInput
              style={styles.nameInput}
              placeholder="Input your name here..."
              placeholderTextColor="#7E8487"
              value={name}
              onChangeText={setName}
            />
          </View>
          {/* Tagging component to manage occasions and brands */}
          <Tagging imageUri={imageUri} />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
    width: "100%",
    height: "100%",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: "transparent",
  },
  backButton: { padding: 4, borderRadius: 8 },
  postButton: {
    backgroundColor: "#4DA6FD",
    paddingVertical: 6,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  postButtonText: { color: "#F5EEE3", fontSize: 18, fontWeight: "600" },
  scrollViewContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 50,
    paddingVertical: 30,
    width: "100%",
  },
  contentContainer: { alignItems: "center", marginBottom: 20 },
  postTitleInput: {
    width: "80%",
    padding: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#F5EEE3",
  },
  image: {
    width: 210,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#9AA8B6",
  },
  nameInput: {
    padding: 5,
    marginBottom: 12,
    fontSize: 12,
    width: "80%",
    backgroundColor: "transparent",
    color: "#F5EEE3",
  },
});
