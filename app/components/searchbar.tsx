// components/SearchBar.tsx
import {
  View,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Keyboard,
  TouchableOpacity, 
  FlatList,
  Pressable,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateUserId } from "@/lib/auth";

type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text?: string) => void;
  autoFocus?: boolean;
  onClear?: () => void;
};

export default function SearchBar({
  placeholder = "Search for keywords, users, brands...",
  value,
  onChangeText,
  onSubmit,
  autoFocus = false,
  onClear,
}: SearchBarProps) {
  const { width } = useWindowDimensions();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isHandlingPress, setIsHandlingPress] = useState(false);

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit();
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    onChangeText("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(null);
    onClear?.();
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const userId = await getOrCreateUserId();
        
        const { data: globalTags } = await supabase
          .from("tags")
          .select("name")
          .ilike("name", `%${value}%`)
          .limit(5);

        const { data: userTags } = await supabase
          .from("user_tags")
          .select("name")
          .eq("user_id", userId)
          .ilike("name", `%${value}%`)
          .limit(5);

        const combined = [
          ...(globalTags?.map(t => t.name) || []),
          ...(userTags?.map(t => t.name) || [])
        ];
        
        setSuggestions(Array.from(new Set(combined)).slice(0, 5));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionPress = async (suggestion: string) => {
    setIsHandlingPress(true);
    onChangeText(suggestion);
    setSelectedSuggestion(suggestion);

    // Close keyboard and suggestions
    setShowSuggestions(false);
    Keyboard.dismiss();
  
    // Trigger submit after UI updates
    requestAnimationFrame(() => {
      onSubmit(suggestion);
      setSelectedSuggestion(null);
      setIsHandlingPress(false);
    });
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#15181B",
      borderRadius: 30,
      marginHorizontal: width * 0.04,
      marginTop: 15,
      paddingHorizontal: 15,
      height: 41,
      zIndex: 1,
    },
    input: {
      flex: 1,
      color: "#7F8D9A",
      fontSize: 13,
      marginLeft: 10,
      marginRight: 10,
    },
    searchIcon: {
      marginLeft: 0,
    },
    closeIcon: {
      marginLeft: 10,
    },
    suggestionsContainer: {
      position: "absolute",
      top: 55,
      left: width * 0.05,
      right: width * 0.05,
      backgroundColor: "#262A2F",
      borderRadius: 10,
      padding: 10,
      zIndex: 100,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    suggestionItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#383C40",
    },
    suggestionText: {
      color: "#B4CFEA",
      fontSize: 13,
    },
  });

  return (
    <View style={{ position: "relative" }}>
      <View style={styles.container}>
        <MaterialIcons
          name="search"
          size={25}
          color="#B4CFEA"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#7F8D9A"
          value={selectedSuggestion || value}
          onChangeText={(text) => {
            onChangeText(text);
            setSelectedSuggestion(null);
            setShowSuggestions(text.length > 1);
          }}
          onFocus={() => setShowSuggestions(value.length > 1)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          autoFocus={autoFocus}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.closeIcon}>
            <MaterialIcons name="close" size={20} color="#7F8D9A" />
          </TouchableOpacity>
        )}
      </View>
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}