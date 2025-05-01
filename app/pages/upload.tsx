import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
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
import { User } from "@supabase/supabase-js";
import { MaterialIcons } from "@expo/vector-icons";
import Tagging from "./tagging";
import { useUploadContext } from "../context/uploadContext";
import { analyzeOutfit } from "../components/openaiVision";
import LoadingScreen from "../components/loading";

export default function UploadPage() {
  // Read the imageUri from route parameters
  const params = useLocalSearchParams() as { imageUri?: string };
  const router = useRouter();
  const imageUri = params.imageUri;
  const [caption, setCaption] = useState("");
  const {
    selectedBrands,
    selectedOccasions,
    setSelectedBrands,
    setSelectedOccasions,
    brandTags,
    setBrandTags,
  } = useUploadContext(); // Use Context
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUsername(profile.username);
        }
      }
    };

    fetchUser();
  }, []);

  const MAX_NEWLINES = 3;

  const handleCaptionChange = (text: string) => {
    const newlineCount = (text.match(/\n/g) || []).length;
    if (newlineCount <= MAX_NEWLINES) {
      setCaption(text);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="navigate-before" size={24} color="#F5EEE3" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          No image found
        </Text>
      </View>
    );
  }

  const handlePost = async () => {
    if (!imageUri || !username || !user) return;

    if (!caption.trim()) {
      alert("Please enter a title for your post.");
      return;
    }

    setLoading(true);

    try {
      console.log(imageUri);
      const response = await fetch(imageUri);
      console.log(response.status);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `public/${Date.now()}.jpg`;
      console.log(imageUri);
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

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);
      const publicImageUrl = publicUrlData?.publicUrl;

      if (!publicImageUrl) {
        console.error("Failed to retrieve public image URL.");
        return;
      }
      console.log(publicImageUrl);
      
      const metadata = await analyzeOutfit(publicImageUrl).catch(() => [])

      console.log("Extracted metadata:", metadata);

      // Insert image record
      const { data: imageData, error: insertError } = await supabase
        .from("images")
        .insert([
          {
            image_path: fileName,
            caption: caption,
            username: username,
            user_id: user.id,
            selectedbrands: selectedBrands,
            selectedoccasions: selectedOccasions,
            metadata: Array.isArray(metadata) ? metadata : [],
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error saving image with tags:", insertError);
        return;
      }

      // 💡 Save brand tag positions
      if (Array.isArray(brandTags) && brandTags.length > 0) {
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

      console.log(
        "Post uploaded successfully with metadata and brand tags:",
        caption
      );
      resetAllTags(); // Clear all tags before navigating away
      router.replace("./feedPage");
    } catch (error) {
      console.error("Error during upload:", error);
    }

    setLoading(false);
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
            <MaterialIcons name="navigate-before" size={30} color="#F5EEE3" />
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
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TextInput
              style={styles.captionInput}
              placeholder="Add caption..."
              placeholderTextColor="#7E8487"
              value={caption}
              onChangeText={handleCaptionChange}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.separator} />
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
    paddingTop: 70,
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
  postButtonText: { color: "#262A2F", fontSize: 16, fontWeight: "600" },
  scrollViewContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 50,
    paddingVertical: 30,
    width: "100%",
  },
  contentContainer: { alignItems: "center", marginBottom: 20 },
  captionInput: {
    width: "88%",
    height: 40,
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
    textAlignVertical: "top",
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
  separator: {
    width: "82%",
    height: 0.5,
    backgroundColor: "#626A73",
    alignSelf: "center",
    marginBottom: -10,
    opacity: 0.3,
  },
});
