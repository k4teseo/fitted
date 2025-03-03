import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { 
    View, Text, TextInput, StyleSheet, Image, ScrollView, Platform, 
    TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, TouchableOpacity, Pressable
} from 'react-native';
import { supabase } from '@/lib/supabase';

export default function UploadPage() {
    const params = useLocalSearchParams() as { imageUri?: string };
    const imageUri = params.imageUri;

    const [name, setName] = useState('');
    const [caption, setCaption] = useState('');

    const router = useRouter();

    if (!imageUri) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>No image found</Text>
            </View>
        );
    }

    const uploadImage = async () => {
        if (!imageUri || !name) return;

        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const fileName = `public/${Date.now()}.jpg`;

            const { error } = await supabase.storage.from('images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

            if (error) {
                console.error('Error uploading image:', error);
            } else {
                const { error: insertError } = await supabase
                    .from('images')
                    .insert([{ image_path: fileName, caption, username: name }]);

                if (insertError) {
                    console.error('Error saving image metadata:', insertError);
                } else {
                    console.log('Image uploaded successfully:', name, caption);
                    router.replace("/feedPage");
                }
            }
        } catch (error) {
            console.error('Error during upload:', error);
        }
    };

    return (
        <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjusts for different platforms
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => {
                            router.back();
                        }}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <ScrollView 
                        contentContainerStyle={styles.scrollViewContainer} 
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.title}>Upload Image</Text>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={name}
                            placeholderTextColor="#F5EEE3"
                            onChangeText={setName}
                        />

                        <TextInput
                            style={styles.captionInput}
                            placeholder="Enter caption"
                            value={caption}
                            placeholderTextColor="#F5EEE3"
                            multiline={true}
                            scrollEnabled={true}
                            onChangeText={setCaption}
                        />

                        <TouchableOpacity style={styles.button} onPress={uploadImage}>
                            <Text style={styles.buttonText}>Upload</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>                
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#15181B', // Dark background (same as feedStyles container)
        width: '100%',
      },
      scrollViewContainer: {
        flexGrow: 1, 
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
        paddingVertical: 30, // Prevents cut-off at top/bottom
        width: '100%',
        height: '100%',
      },
      title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#F5EEE3', // White text (same as captions in feedStyles)
      },
      image: {
        width: '60%',
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#9AA8B6', // Matches card background color in feedStyles
      },
      input: {
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#595F66', // Same as userInfo background in feedStyles
        borderRadius: 8,
        fontSize: 16,
        width: '80%', // Ensures consistent width
        backgroundColor: '#2D3338', // Same as feedHeader background in feedStyles
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
      button: {
        backgroundColor: '#4A6FA5', // Blue background (same as bottomNav in feedStyles)
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '80%',
        marginTop: 20,
      },
      buttonText: {
        color: '#F5EEE3', // White text (same as captions in feedStyles)
        fontSize: 18,
        fontWeight: 'bold',
      },
      backButton: {
        position: 'absolute',
        top: 20, // Adjust for notch safety
        left: 5,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 30,
        color: '#F5EEE3', // Same as other text colors
        fontWeight: 'bold',
    },
});