import { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SearchBar from '../components/searchbar';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'dresses', 'summer', 'hello kitty', 'spring', 'spring break', 'work attire', 'evening wear'
  ]);
  const [users, setUsers] = useState([
    'pixelnova', 'lavender.ghost', 'user', 'hello kitty', 'design_lover', 'fashion_icon'
  ]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const deleteRecentSearch = (index: number) => {
    // Create a new array without the item at the specified index
    const updatedSearches = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updatedSearches);
  };

  const deleteUser = (index: number) => {
    // Create a new array without the item at the specified index
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  const handleSubmit = () => {
    if (searchQuery.trim() !== '') {
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
      fontSize: 14,
    },
    seeMore: {
      color: '#7F8A95',
      fontSize: 14,
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 30,
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
          <TouchableOpacity onPress={() => setShowAllRecent(!showAllRecent)}>
            <Text style={styles.seeMore}>{showAllRecent ? 'See Less' : 'See More'}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={showAllRecent ? recentSearches : recentSearches.slice(0, 4)}
          renderItem={({ item, index }) => (
            <View>
              <View style={styles.listItem}>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteRecentSearch(index)}
                >
                  <MaterialIcons name="close" size={18} color="#7F8A95" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
            </View>
          )}
          keyExtractor={(item, index) => `recent-${index}`}
        />

        {/* Users Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Users</Text>
          <TouchableOpacity onPress={() => setShowAllUsers(!showAllUsers)}>
            <Text style={styles.seeMore}>{showAllUsers ? 'See Less' : 'See More'}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={showAllUsers ? users : users.slice(0, 4)}
          renderItem={({ item, index }) => (
            <View>
              <View style={styles.listItem}>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteUser(index)}
                >
                  <MaterialIcons name="close" size={18} color="#7F8A95" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
            </View>
          )}
          keyExtractor={(item, index) => `user-${index}`}
        />
      </View>
    </View>
  );
}