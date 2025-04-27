import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import SearchBar from "../components/searchbar";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "../hook/useCurrentUser";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const currentUserId = useCurrentUser();

  const router = useRouter();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const loadRecentSearches = async () => {
      if (!currentUserId) return;

      try {
        // First try to get the user's searches
        const { data, error } = await supabase
          .from('user_searches')
          .select('searches')
          .eq('user_id', currentUserId);
    
        if (error) throw error;
        
        if (data && data.length > 0) {
          // User has existing searches
          setRecentSearches(data[0].searches || []);
        } else {
          // No record exists yet - create one
          const { error: insertError } = await supabase
            .from('user_searches')
          .insert([{ 
            user_id: currentUserId, 
            searches: [] 
          }]);
          
          if (insertError) throw insertError;
          
          setRecentSearches([]);
        }
      } catch (error) {
        console.error("Failed to load recent searches", error);
      }
    };

    loadRecentSearches();
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      const clearSearchIfNeeded = async () => {
        const shouldClear = await supabase
          .from('user_settings')
          .select('clear_search')
          .eq('user_id', currentUserId)
          .single();

        if (shouldClear.data?.clear_search) {
          setSearchQuery("");
          await supabase
            .from('user_settings')
            .update({ clear_search: false })
            .eq('user_id', currentUserId);
        }
      };
      
      if (currentUserId) {
        clearSearchIfNeeded();
      }
    }, [currentUserId])
  );

  const updateRecentSearches = async (searchTerm: string) => {
    if (!currentUserId) return [];
    
    try {
      // Remove existing term (case insensitive)
      const updatedSearches = recentSearches.filter(
        s => s.toLowerCase() !== searchTerm.toLowerCase()
      );
      
      // Add new term to beginning
      const newRecentSearches = [searchTerm, ...updatedSearches].slice(0, 10);
      
      // Update in database
      const { error } = await supabase
        .from('user_searches')
        .update({ searches: newRecentSearches })
        .eq('user_id', currentUserId);

      if (error) throw error;
      
      setRecentSearches(newRecentSearches);
      return newRecentSearches;
    } catch (error) {
      console.error("Failed to update recent searches", error);
      return recentSearches;
    }
  };

  const deleteRecentSearch = async (index: number) => {
    if (!currentUserId) return;
    
    try {
      const updatedSearches = recentSearches.filter((_, i) => i !== index);
      
      const { error } = await supabase
        .from('user_searches')
        .update({ searches: updatedSearches })
        .eq('user_id', currentUserId);

      if (error) throw error;
      
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Failed to delete recent search", error);
    }
  };

  const clearAllRecentSearches = async () => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('user_searches')
        .update({ searches: [] })
        .eq('user_id', currentUserId);

      if (error) throw error;
      
      setRecentSearches([]);
    } catch (error) {
      console.error("Failed to clear recent searches", error);
    }
  };

  const handleSubmit = async (text?: string) => {
    const searchTerm = text || searchQuery.trim();
    if (searchTerm ) {
      await updateRecentSearches(searchTerm);
      setSearchQuery("");
      router.push({
        pathname: "./searchResultsPage",
        params: { query: searchTerm },
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleBackPress = () => {
    setSearchQuery("");
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#15181B",
    },
    feedHeader: {
      backgroundColor: "#2D3338",
      width: "100%",
      height: height * 0.14,
      paddingVertical: height * 0.02,
      paddingLeft: width * 0.06,
      paddingRight: width * 0.04,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      position: "absolute",
      zIndex: 10,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    backButton: {
      marginTop: 15,
    },
    searchWrapper: {
      flex: 1,
    },
    sectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 27,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionHeader: {
      color: "#F5EEE3",
      fontSize: 16,
      paddingVertical: 10,
    },
    seeMore: {
      color: "#7F8A95",
      fontSize: 14,
    },
    clearAllButton: {
      color: "#85BBF0",
      fontSize: 14,
      marginLeft: "auto",
    },
    listItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 30,
    },
    itemContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    searchIcon: {
      marginRight: 12,
    },
    itemText: {
      color: "#7F8D9A",
      fontSize: 14,
    },
    deleteButton: {
      padding: 5,
    },
    divider: {
      height: 1,
      backgroundColor: "#2D3338",
      marginHorizontal: 20,
    },
    contentContainer: {
      paddingTop: height * 0.14,
      flex: 1,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 40 
    },
    emptyStateText: {
      color: '#7F8D9A',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header Background */}
      <View style={styles.feedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={handleSubmit}
              onClear={handleClearSearch}
            />
          </View>
        </View>
      </View>

      {/* Page Content */}
      <View style={styles.contentContainer}>
        {/* Recent Searches Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Recent history</Text>
          {recentSearches.length > 0 && (
            <TouchableOpacity onPress={clearAllRecentSearches}>
              <Text style={styles.clearAllButton}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentSearches.length > 0 ? (
          <>
            {(showAllRecent ? recentSearches : recentSearches.slice(0, 5)).map(
              (item, i) => {
                const actualIndex = recentSearches.indexOf(item); // important for deletion
                return (
                  <View key={i}>
                    <TouchableOpacity
                      onPress={async () => {
                        const updatedSearches = await updateRecentSearches(item);
                        setSearchQuery(item);
                        router.push({
                          pathname: "./searchResultsPage",
                          params: { query: item },
                        });
                      }}
                    >
                      <View style={styles.listItem}>
                        <View style={styles.itemContent}>
                          <MaterialIcons
                            name="history"
                            size={33}
                            color="#90BBE5"
                            style={styles.searchIcon}
                          />
                          <Text style={styles.itemText}>{item}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteRecentSearch(actualIndex)}
                        >
                          <MaterialIcons
                            name="close"
                            size={18}
                            color="#7F8A95"
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                  </View>
                );
              }
            )}

            {recentSearches.length > 4 && (
              <TouchableOpacity
                style={{ alignSelf: "center", marginVertical: 10 }}
                onPress={() => setShowAllRecent(!showAllRecent)}
              >
                <Text style={styles.seeMore}>
                  {showAllRecent ? "See Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recent searches</Text>
          </View>
        )}
      </View>
    </View>
  );
}
