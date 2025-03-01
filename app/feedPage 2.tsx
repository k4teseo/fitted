// app/FeedPage.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import feedStyles from './feedStyles';
import { FittedLogo, FeedPageIcon, PlusIcon } from './Icons'; // icons from Icons.tsx

// Sample feed data
const feedData = [
  {
    id: '1',
    caption: 'Loving this new hat and shades!',
    username: 'mariahh23',
    postImage:
      'https://s3-alpha-sig.figma.com/img/893d/21ad/c5e36348b3d4ffcb9c72852898d658cc?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=sbhVDBoNREbYBK65Dxr43rQZtIk5hUExxuD8j8~uAns0mIakn-x7vpPNiAAGxqSYziI--gnXXCiRUj7cWjpokeIDzra5C3QvtETAxOTZgc1NxW1SdYD2-0o2Q~zo8x1zttACOM1z80BzbfrOzcLZZGbAEjt~B4DPTwgpCzE70m87DdrD6svf3gLLJ2nEDhSN3wv-TxlzSLjlEQ0LC0dfsuAiTIVEv6eIzlfg-cYLLcVtQKuGi7qy-4ClTk9nuzHxfhMOft4DEkOhBpqbd8qGeD7FUpRiuslji9btvFTQijElhVB5nQbXD7RFVK~zzJkMsJtCsCaLq~emKCGIXQ53kg__', 
  },
  {
    id: '2',
    caption: 'Enjoying a sunny day!',
    username: 'john_doe',
    postImage:
    'https://s3-alpha-sig.figma.com/img/d9d0/03ad/2e70a698dff0e8a75ebdc898817e054a?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=s3uV2EYndE9X25np7FodoEG3E~5Axs4UsrKjKeVDMi5PUZQZSnUDs6vkoMcxLtyEoZg8pR6TNETjOYX-BmjNayIQ3RuVlPHUdrPuuCuoLYmTxsr7NKomFkKFAMAAhTJVogNxiHuWTmcldyt9bwvinY50ylmwyGcYQ3SuNLK7ci8VndzowD~NU~MRN2VmeK1KSJClF0l73VKc~2uHEarDFy2LldbxebpHdId8Mc0aCuh5yJtuwpMc-~4j6TpWg2u--FS1292I9HFNcEDh3ycIccwH5lXr0awY0iYcPFtQy6DuXBkAJjCS2iRvR41qrzNi0albbN70dVcRfqSdx5TDKg__', 
  },
];

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
  const [activeTab, setActiveTab] = useState<'home' | 'add'>('home');

  return (
    <SafeAreaView style={feedStyles.container}>
      {/* Top Bar with the Fitted Logo on the Left */}
      <View style={feedStyles.feedHeader}>
        <FittedLogo width={120} height={42} />
      </View>

      {/* Feed List */}
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItem item={item} />}
        contentContainerStyle={feedStyles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation Bar */}
      <View style={feedStyles.bottomNav}>
        {/* HOME TAB */}
        <TouchableOpacity
          style={feedStyles.navItem}
          onPress={() => setActiveTab('home')}
        >
          {activeTab === 'home' ? (
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
          onPress={() => setActiveTab('add')}
        >
          {activeTab === 'add' ? (
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
