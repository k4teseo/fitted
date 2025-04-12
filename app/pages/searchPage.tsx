import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SearchBar from '../components/searchbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const router = useRouter();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const savedSearches = await AsyncStorage.getItem('recentSearches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error('Failed to load recent searches', error);
      }
    };

    loadRecentSearches();
  }, []);

  const deleteRecentSearch = async (index: number) => {
    // Create a new array without the item at the specified index
    const updatedSearches = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updatedSearches);

    try {
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Failed to save recent searches', error);
    }
  };

  const clearAllRecentSearches = async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Failed to clear recent searches', error);
    }
  };

  const handleSubmit = async () => {
    if (searchQuery.trim() !== '') {
      if (!recentSearches.some(s => s.toLowerCase() === searchQuery.toLowerCase())) {
        const updatedSearches = [searchQuery, ...recentSearches].slice(0, 10);
        setRecentSearches(updatedSearches);

        try {
          await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        } catch (error) {
          console.error('Failed to save recent searches', error);
        }
      }

      router.push({
        pathname: './searchResultsPage',
        params: { query: searchQuery },
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#15181B',
    },
    feedHeader: {
      backgroundColor: "#2D3338",
      width: "100%",
      height: height * 0.14,
      paddingVertical: height * 0.02,
      paddingLeft: width * 0.06,
      paddingRight: width * 0.04,
      flexDirection: 'row',
      alignItems: "flex-end",
      justifyContent: "space-between",
      position: "absolute",
      zIndex: 10,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    backButton: {
      marginTop: 15,
    },
    searchWrapper: {
      flex: 1,
    },
    sectionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 27,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionHeader: {
      color: '#F5EEE3',
      fontSize: 16,
      paddingVertical: 10
    },
    seeMore: {
      color: '#7F8A95',
      fontSize: 14,
    },
    clearAllButton: {
      color: '#85BBF0',
      fontSize: 12,
      marginLeft: 'auto',
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 30,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    searchIcon: {
      marginRight: 12,
    },
    itemText: {
      color: '#F5EEE3',
      fontSize: 14,
    },
    deleteButton: {
      padding: 5,
    },
    divider: {
      height: 1,
      backgroundColor: '#2D3338',
      marginHorizontal: 20,
    },
    contentContainer: {
      paddingTop: height * 0.14,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header Background */}
      <View style={styles.feedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
          
          <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSubmit}
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
            {(showAllRecent ? recentSearches : recentSearches.slice(0, 5)).map((item, i) => {
              const actualIndex = recentSearches.indexOf(item); // important for deletion
              return (
                <View key={i}>
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery(item);
                      router.push({
                        pathname: './searchResultsPage',
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
                        <MaterialIcons name="close" size={18} color="#7F8A95" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </View>
              );
            })}

            {recentSearches.length > 4 && (
              <TouchableOpacity
                style={{ alignSelf: 'center', marginVertical: 10 }}
                onPress={() => setShowAllRecent(!showAllRecent)}
              >
                <Text style={styles.seeMore}>
                  {showAllRecent ? 'See Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={[styles.itemText, { paddingHorizontal: 30, paddingVertical: 12 }]}>
            No recent searches
          </Text>
        )}
      </View>
    </View>
  );
}