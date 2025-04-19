// app/feedPage.tsx
import React, { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { supabase } from "@/lib/supabase";
import FeedHeader from "../components/FeedHeader";
import BottomNavBar from "../components/BottomNavBar";
import FeedItem from "../components/FeedItem";

type FeedItemData = {
  id: string;
  caption: string;
  username: string;
  postImage: string;
  selectedbrands: string[];
  selectedoccasions: string[];
  userPfp: string;
  createdAt: Date;
  reaction?: string | null;
};

const defaultPfp =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("home");
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPfp, setUserPfp] = useState<string>(defaultPfp);
  const [reactions, setReactions] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("pfp")
          .eq("id", userId)
          .single();

        if (profile && profile.pfp) {
          setUserPfp(profile.pfp);
        }
      }
    };

    getUserAndProfile();
  }, []);

  const handleReaction = async (postId: string, emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [postId]: emoji || null
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      if (emoji) {
        await supabase
          .from("post_reactions")
          .upsert({
            post_id: postId,
            user_id: session.user.id,
            reaction: emoji,
          });
      } else {
        await supabase
          .from("post_reactions")
          .delete()
          .match({ post_id: postId, user_id: session.user.id });
      }
    }
  };

  const loadReactions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data } = await supabase
        .from("post_reactions")
        .select("post_id, reaction")
        .eq("user_id", session.user.id);
      
      if (data) {
        const reactionsMap = data.reduce((acc, curr) => {
          acc[curr.post_id] = curr.reaction;
          return acc;
        }, {} as Record<string, string>);
        setReactions(reactionsMap);
      }
    }
  };

  const fetchImages = async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      setFeedData([]);
      setLoading(false);
      return;
    }

    const { data: friendData, error: friendError } = await supabase
      .from("friends")
      .select("user_id_1, user_id_2")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq("status", "accepted");

    if (friendError) {
      console.error("Error fetching friends:", friendError);
      setFeedData([]);
      setLoading(false);
      return;
    }

    const friendIds = friendData.map((f) =>
      f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
    );
    const visibleUserIds = [...new Set([...friendIds, userId])];

    const { data, error } = await supabase
      .from("images")
      .select(
        `id, caption, username, user_id, image_path, selectedbrands, selectedoccasions, created_at, profiles(pfp)`
      )
      .in("user_id", visibleUserIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching images:", error);
    } else {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const formattedData = data
        .map((row: any) => ({
          id: row.id,
          caption: row.caption,
          username: row.username,
          postImage:
            supabase.storage.from("images").getPublicUrl(row.image_path)?.data
              ?.publicUrl || "",
          selectedbrands: row.selectedbrands ?? [],
          selectedoccasions: row.selectedoccasions ?? [],
          createdAt: new Date(row.created_at),
          userPfp: row.profiles?.pfp || defaultPfp,
        }))
        .filter((post) => post.createdAt > twentyFourHoursAgo);
      setFeedData(formattedData);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      setActiveTab("home");
      fetchImages();
      loadReactions();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <FeedHeader />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#ccc"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FeedItem 
              item={{ ...item, reaction: reactions[item.id] || null }} 
              userPfp={item.userPfp}
              onReaction={handleReaction}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
  },
  listContent: {
    padding: 90,
    paddingBottom: 80,
  },
});