import React, { useEffect, useState } from "react";
import { 
    FlatList, 
    SafeAreaView, 
    Text, 
    View, 
    Image,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import FeedHeader from "../components/FeedHeader";

export default function CollectionDetail() {
    const router = useRouter();
    const { collectionId, collectionName } = useLocalSearchParams();
    const [ posts, setPosts ] = useState([
        {id: '1', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png', caption: 'Post 1'},
        {id: '2', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png', caption: 'Post 2'}
        ]);

    return (
        <SafeAreaView style={styles.container}>
        <FeedHeader/>
        <View style={{ flex: 1, backgroundColor: '#111' }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', margin: 16 }}>
                {collectionName}
            </Text>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: item.image }} style={styles.postImage} />
                        </View>
                        <Text style={{ color: 'white', padding: 8 }}>{item.caption}</Text>
                    </View>
                )}
            />
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
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
    postImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
});