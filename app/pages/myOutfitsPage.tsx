import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, useWindowDimensions, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

  export default function MyOutfitsPage() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { userId } = useLocalSearchParams();
    const [outfits, setOutfits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutfits = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('images')
                    .select('id, image_path, created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching outfits:', error);
                    return;
                }

                const formattedOutfits = data.map(item => ({
                    id: item.id,
                    uri: supabase.storage.from('images').getPublicUrl(item.image_path).data.publicUrl
                }));

                setOutfits(formattedOutfits);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchOutfits();
        }
    }, [userId]);

    // Calculate item width for 3 columns with padding
    const itemWidth = (width - 32 - 16) / 3; // 32 = horizontal padding, 16 = gap

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#15181B',
            padding: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        backButton: {
            marginTop: 55,
            marginRight: 15,
            marginBottom: 20,
        },
        title: {
            color: '#7F8A95',
            fontSize: width * 0.06,
            fontWeight: '400',
            marginTop: 55,
            marginBottom: 20,
        },
        grid: {
            flex: 1,
        },
        columnWrapper: {
            justifyContent: 'flex-start',
            marginBottom: 8, // Reduced gap between rows
        },
        outfitItem: {
            width: itemWidth,
            aspectRatio: 0.8,
            borderRadius: 4,
            overflow: 'hidden',
            marginRight: 10,
            marginBottom: 3, // Gap between items
        },
        outfitImage: {
            width: '100%',
            height: '100%',
            backgroundColor: '#333',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            color: '#919CA9',
            textAlign: 'center',
            marginTop: 20,
        }
    });

    const navigateToPost = (postId: string) => {
        router.push({
            pathname: './postPage',
            params: { id: postId }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="navigate-before" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>My Outfits</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ccc" />
                </View>
            ) : outfits.length > 0 ? (
                <FlatList
                    data={outfits}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.outfitItem}
                            onPress={() => navigateToPost(item.id)}
                        >
                            <Image 
                                source={{ uri: item.uri }} 
                                style={styles.outfitImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.grid}
                />
            ) : (
                <Text style={styles.emptyText}>No outfits yet</Text>
            )}
        </View>
    );
}