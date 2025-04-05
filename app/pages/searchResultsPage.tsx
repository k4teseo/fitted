import { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import SearchBar from '../components/searchbar';

type SearchResult = {
  id: string;
  username: string;
  caption: string;
  tags: string[];
};

type UserResult = {
  id: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
};

export default function SearchResultsPage() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [activeTab, setActiveTab] = useState<'Posts' | 'Users'>('Posts');
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const handleSubmit = () => {
    if (searchQuery.trim() !== '') {
      router.push({
        pathname: './searchResultsPage',
        params: { query: searchQuery },
      });
    }
  };

  const searchResults: SearchResult[] = [
    {
      id: '1',
      username: 'cammysprinkles',
      caption: "Evening dress for Bestie's Party",
      tags: ['Everyday Wow'],
    },
    {
      id: '2',
      username: 'Irisha',
      caption: 'Vacay short dress near the beach',
      tags: ['Vacation'],
    },
    {
      id: '3',
      username: 'fonalioradress',
      caption: 'Visited the Beautiful Flower Garden',
      tags: ['Spring'],
    },
    {
      id: '4',
      username: 'vacayoutfits',
      caption: 'In Europe!',
      tags: ['Vacation'],
    },
  ];

  const userResults: UserResult[] = [
    { id: '1', username: 'dress.dreamer', avatar: 'https://s3-alpha-sig.figma.com/img/dcc9/d1d2/51da8a64460e7c5f2ad47253218968ce?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=W6j83WHyIghEuBFCNe-HQxS6K~dTcRC3hGIBA5hcLmJiZ2CjVrBCTV0kjH4R8qtKLsy64sOnzLAFWc4T93buhBrEzz~jzXH9DfRsMoODOgT~XuYSDJbfTsXyNf6C8G45Kd6SlHUEgY2t60P54fEqpZ3gV08PVq4tk~wbI8JajhbjIE2KzA9hMPsKtxH8yZRhYjKx5rQx3Hh9N46VEf8HRPs6o5D-HjDwmsPHDiKF67K4f4-1yv~~3G9oVQnIYVkjWUBcHKqVp9pUE9y7IIgGr7mi0wYjipNybnR30Dx3x7mQlgd6fZFg8ciZ6Ha70ZraUP0KeX7zsrI7meQWTXknZQ__', isFollowing: true },
    { id: '2', username: 'dress.and.daisy', avatar: 'https://s3-alpha-sig.figma.com/img/dcc9/d1d2/51da8a64460e7c5f2ad47253218968ce?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=W6j83WHyIghEuBFCNe-HQxS6K~dTcRC3hGIBA5hcLmJiZ2CjVrBCTV0kjH4R8qtKLsy64sOnzLAFWc4T93buhBrEzz~jzXH9DfRsMoODOgT~XuYSDJbfTsXyNf6C8G45Kd6SlHUEgY2t60P54fEqpZ3gV08PVq4tk~wbI8JajhbjIE2KzA9hMPsKtxH8yZRhYjKx5rQx3Hh9N46VEf8HRPs6o5D-HjDwmsPHDiKF67K4f4-1yv~~3G9oVQnIYVkjWUBcHKqVp9pUE9y7IIgGr7mi0wYjipNybnR30Dx3x7mQlgd6fZFg8ciZ6Ha70ZraUP0KeX7zsrI7meQWTXknZQ__', isFollowing: false },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#15181B',
    },
    feedHeader: {
      backgroundColor: '#2D3338',
      width: '100%',
      height: height * 0.14,
      paddingVertical: height * 0.02,
      paddingLeft: width * 0.06,
      paddingRight: width * 0.04,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      position: 'absolute',
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
    contentContainer: {
      paddingTop: height * 0.14,
      paddingHorizontal: 10,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#2D3338',
    },
    tab: {
      paddingBottom: 6,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#60A5FA',
    },
    tabText: {
      fontSize: 16,
      color: '#F5EEE3',
    },
    gridItem: {
      flex: 1,
      backgroundColor: '#2D3338',
      borderRadius: 16,
      margin: 8,
      overflow: 'hidden',
    },
    postUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
      avatarSmall: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
    },
    imagePlaceholder: {
      height: 180,
      backgroundColor: '#444',
    },
    gridContent: {
      padding: 10,
    },
    username: {
      color: '#F5EEE3',
      fontSize: 14,
      fontWeight: '600',
    },
    caption: {
      color: '#C8C8C8',
      fontSize: 12,
      marginTop: 4,
    },
    tag: {
      marginTop: 8,
      backgroundColor: '#4B5563',
      alignSelf: 'flex-start',
      color: '#F5EEE3',
      fontSize: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 8,
      paddingHorizontal: 6,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    followButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    followText: {
      color: '#F5EEE3',
    },
    removeIcon: {
      marginLeft: 8,
    },
    follow: {
      backgroundColor: '#60A5FA',
    },
    following: {
      borderWidth: 1,
      borderColor: '#F5EEE3',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.feedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#F5EEE3" />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} onSubmit={handleSubmit} />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          {['Posts', 'Users'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as 'Posts' | 'Users')}
            >
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts View */}
        {activeTab === 'Posts' && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <View style={styles.imagePlaceholder} />
                <View style={styles.gridContent}>
                <View style={styles.postUserRow}>
                    <Image
                        source={{ uri: userResults.find((u) => u.username === item.username)?.avatar }}
                        style={styles.avatarSmall}
                    />
                    <Text style={styles.username}>{item.username}</Text>
                    </View>
                  <Text style={styles.caption}>{item.caption}</Text>
                  {item.tags.length > 0 && <Text style={styles.tag}>{item.tags[0]}</Text>}
                </View>
              </View>
            )}
          />
        )}

        {/* Users View */}
        {activeTab === 'Users' && (
          <FlatList
            data={userResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <Text style={styles.username}>{item.username}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      item.isFollowing ? styles.following : styles.follow,
                    ]}
                  >
                    <Text style={styles.followText}>
                      {item.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeIcon}>
                    <MaterialIcons name="close" size={20} color="#F5EEE3" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
