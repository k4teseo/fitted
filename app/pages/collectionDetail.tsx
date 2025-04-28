import React, { useEffect, useState } from "react";
import { 
    FlatList, 
    Text, 
    View, 
    Image,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


export default function CollectionDetail() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { collectionId, collectionName } = useLocalSearchParams();
    const [ posts, setPosts ] = useState<any[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from("saved_posts")
                .select("image_id, images(id, image_path)")
                .eq("collection_id", collectionId);

            if (error) {
                console.error("Error fetching posts:", error);
            } else {
                setPosts(data);
            }
        };

        fetchPosts();
    }
    , [collectionId]);

    const itemWidth = (width - 32 - 16) / 3; 

    const styles = StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        outfitImage: {
            width: '100%',
            height: '100%',
            backgroundColor: '#333',
        },
        container: {
            flex: 1,
            backgroundColor: '#15181B',
            padding: 16,
        },
        card: {
            backgroundColor: "#9AA8B6",
            borderRadius: 24,
            marginBottom: 30,
            overflow: "hidden",
            alignSelf: "center",
            width: 345,
    },
        imageContainer: {
            width: "100%",
            height: 400,
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
        outfitItem: {
            flex: 1,
            aspectRatio: 0.8,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
            maxWidth: (width - 32 - 16) / 3, // each image can only be 1/3 width
        },
        columnWrapper: {
            marginBottom: 8, // Reduced gap between rows
            gap: 8,
        },
        grid: {
            flex: 1,
        },
    
    //     postImage: {
    //         width: "100%",
    //         height: "100%",
    //         resizeMode: "cover",
    // },
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
                <Text style={styles.title}> {collectionName} </Text>
            </View>
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={styles.grid}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.outfitItem}
                                onPress={() => navigateToPost(item.image_id)}
                            >
                                    <Image 
                                        source={{ uri: supabase.storage.from('images').getPublicUrl(item.images.image_path).data.publicUrl }}
                                        style ={styles.outfitImage} 
                                        resizeMode="cover"
                                    />
                            </TouchableOpacity>
                        )}
                    />
                </View>
        //     </View>
        // </View>
    );
};

