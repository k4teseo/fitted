import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { 
    View, Text, TextInput, StyleSheet, Image, ScrollView, Platform, 
    TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from "@expo/vector-icons";
import Tagging from './tagging';

export default function UploadPage() {
    const params = useLocalSearchParams() as { 
        imageUri?: string;
        selectedBrands?: string;
        selectedOccasions?: string;
    };
    const router = useRouter();

    const imageUri = params.imageUri;

    const [name, setName] = useState('');
    const [postTitle, setPostTitle] = useState('');

    // Tag arrays
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        params.selectedBrands ? JSON.parse(params.selectedBrands as string) : []
      );
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
        params.selectedOccasions ? JSON.parse(params.selectedOccasions as string) : []
    );

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
            <View />
          </View>
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
            No image found
          </Text>
        </View>
      );
    }

      /**
     * Handle final "Post" action:
     * 1) Upload the image to Supabase Storage (if needed).
     * 2) Insert a row into the `images` table with:
     *    - image_path
     *    - caption (postTitle)
     *    - username (name)
     *    - tags: combined array of selectedBrands + selectedOccasions
     */
    const handlePost = async () => {
        if (!imageUri || !name) return;
    
        try {
          // 1) Convert the image URI into a blob/arrayBuffer for upload
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const fileName = `public/${Date.now()}.jpg`;
    
          // 2) Upload the image to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: false });
    
            if (uploadError) {
                console.error("Error uploading image:", uploadError);
                return;
            }

          // Combine brand + occasion tags into one array
            const allTags = [...selectedBrands, ...selectedOccasions];
    
          // 3) Insert a record into `images` table, including the tags array
            const { error: insertError } = await supabase
                .from("images")
                .insert([{
                    image_path: fileName,
                    caption: postTitle,
                    username: name,
                    selectedbrands: selectedBrands,      // e.g. ['Nike', 'Adidas']
                    selectedoccasions: selectedOccasions,   // e.g. ['Coffee Date', 'Beach Day']     
                }]);
    
            if (insertError) {
                console.error("Error saving image with tags:", insertError);
            } else {
                console.log("Post uploaded successfully with tags:", postTitle, allTags);
                router.replace("/feedPage");
            }
        } catch (error) {
            console.error("Error during upload:", error);
        }
    };    

    const handleTagsSelected = (occasions: string[], brands: string[]) => {
        setSelectedOccasions(occasions);
        setSelectedBrands(brands);
    };
    
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjusts for different platforms
            >
                {/* Top Bar */}
                <View style={styles.topBar}>
                  <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
                  </TouchableOpacity>

                  {/* Post Button on Right */}
                  <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollViewContainer} 
                    keyboardShouldPersistTaps="handled"
                >
                {/* Centered container for Title, Image, Name Input */}
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

                {/* Tagging UI below */}
                <Tagging 
                  selectedBrands={selectedBrands} 
                  selectedOccasions={selectedOccasions} 
                  onTagsSelected={handleTagsSelected}
                  />
              </ScrollView>
            </KeyboardAvoidingView>
           </TouchableWithoutFeedback>
        );
    }

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#15181B', 
        width: '100%',
        height: '100%'
      },
      topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 30,    // Adjust for device notch
        paddingBottom: 5,
        backgroundColor: "transparent",
      },
      backButton: {
        padding: 4,
        borderRadius: 8,
      },
      scrollViewContainer: {
        flexGrow: 1, 
        paddingTop: 20,
        paddingBottom: 50,
        paddingVertical: 30, // Prevents cut-off at top/bottom
        width: '100%',
      },
      // NEW container that specifically centers the image & name input
      contentContainer: {
        alignItems: "center",  // Center horizontally
        marginBottom: 20,      // Some spacing at bottom
      },
      postTitleInput: {
        width: '80%',
        padding: 10,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#F5EEE3',
      },
      
      image: {
        width: 210,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#9AA8B6', // Matches card background color in feedStyles
      },
      nameInput: {
        padding: 5,
        marginBottom: 12,
        fontSize: 12,
        width: '80%', // Ensures consistent width
        backgroundColor: 'transparent', 
        color: `#F5EEE3`,
      },
      captionInput: {
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#595F66', // Same as userInfo background in feedStyles
        borderRadius: 8,
        fontSize: 16,
        width: '80%',
        height: 150, 
        textAlignVertical: 'top',  
        backgroundColor: '#2D3338', // Same as feedHeader background in feedStyles
        color: `#F5EEE3`,
      },
      postButton: {
        backgroundColor: '#4DA6FD', // Blue background (same as bottomNav in feedStyles)
        paddingVertical: 6,
        borderRadius: 8,
        paddingHorizontal: 14,
        marginTop: 0,
      },
      postButtonText: {
        color: '#F5EEE3', // White text (same as captions in feedStyles)
        fontSize: 18,
        fontWeight: "600",
      },
});