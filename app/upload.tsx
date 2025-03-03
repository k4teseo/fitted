import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { 
    View, Text, TextInput, StyleSheet, Image, ScrollView, Platform, 
    TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, TouchableOpacity 
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjusts for different platforms
            >
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
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.captionInput}
                        placeholder="Enter caption"
                        value={caption}
                        multiline={true}
                        scrollEnabled={true}
                        onChangeText={setCaption}
                    />

                    <TouchableOpacity style={styles.button} onPress={uploadImage}>
                        <Text style={styles.buttonText}>Upload</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff',
        width: '100%',
        marginBottom: 20,
    },
    scrollViewContainer: {
        flexGrow: 1, 
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
        paddingVertical: 30, // Prevents cut-off at top/bottom
        width: '100%',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    image: {
        width: '60%',
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    input: {
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 16,
        width: '80%', // Ensures consistent width
    },
    captionInput: {
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 16,
        width: '80%',
        height: 150, 
        textAlignVertical: 'top',  
        backgroundColor: '#fff', 
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '80%',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});