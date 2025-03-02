// app/FeedPage.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import feedStyles from "./feedStyles";
import { FittedLogo, FeedPageIcon, PlusIcon } from "./Icons"; // Icons
import { supabase } from "@/lib/supabase"; // Import Supabase client

// Type for the feed item (optional)
type FeedItemData = {
  id: string;
  caption: string;
  username: string;
  postImage: string;
};

// A small component for each feed item
const FeedItem = ({ item }: { item: FeedItemData }) => {
  return (
    <View style={feedStyles.card}>
      {/* Image Container */}
      <View style={feedStyles.imageContainer}>
        <Image source={{ uri: item.postImage }} style={feedStyles.postImage} />
      </View>

      {/* User Info Bar at the Bottom of the Card */}
      <View style={feedStyles.userInfo}>
        <Text style={feedStyles.caption}>{item.caption}</Text>
        <Text style={feedStyles.username}>{item.username}</Text>
      </View>
    </View>
  );
};

// The main feed page component
export default function FeedPage() {
  // Track the active tab: 'home' or 'add'
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "add">("home");
  const router = useRouter();

   // Fetch images from Supabase
   useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("images")
        .select("id, caption, username, image_path");

      if (error) {
        console.error("Error fetching images:", error);
      } else {
        const formattedData = data.map((item) => ({
          id: item.id,
          caption: item.caption,
          username: item.username,
          postImage: `${supabase.storage.from("images").getPublicUrl(item.image_path).data.publicUrl}`,
        }));

        setFeedData(formattedData);
      }
      setLoading(false);
    };

    fetchImages();
  }, []);

  return (
    <SafeAreaView style={feedStyles.container}>
      {/* Top Bar with the Fitted Logo on the Left */}
      <View style={feedStyles.feedHeader}>
        <FittedLogo width={120} height={42} />
      </View>

      {/* Feed List */}
      {loading ? (
        <Text style={feedStyles.loadingText}>Loading feed...</Text>
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedItem item={item} />}
          contentContainerStyle={feedStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Bottom Navigation Bar */}
      <View style={feedStyles.bottomNav}>
        {/* HOME TAB */}
        <TouchableOpacity
          style={feedStyles.navItem}
          onPress={() => setActiveTab("home")}
        >
          {activeTab === "home" ? (
            <View style={feedStyles.beigeCircle}>
              <FeedPageIcon />
            </View>
          ) : (
            <FeedPageIcon />
          )}
        </TouchableOpacity>

        {/* ADD TAB */}
        <TouchableOpacity
          style={feedStyles.navItem}
          onPress={() => {
            setActiveTab("add");
            router.push("/camera");
          }}
        >
          {activeTab === "add" ? (
            <View style={feedStyles.beigeCircle}>
              <PlusIcon />
            </View>
          ) : (
            <PlusIcon />
          )}
        </TouchableOpacity>

        {/* PROFILE TAB - commented out
        <TouchableOpacity
          style={feedStyles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Text
            style={[
              feedStyles.navItemText,
              activeTab === 'profile' && { color: '#F3EDE2' },
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        */}
      </View>
    </SafeAreaView>
  );
}
