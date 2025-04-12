// components/SearchBar.tsx
import { View, TextInput, StyleSheet, useWindowDimensions, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
};

export default function SearchBar({
  placeholder = 'Search for keywords, users, brands...',
  value,
  onChangeText,
  onSubmit,
  autoFocus = false,
}: SearchBarProps) {
  const { width } = useWindowDimensions();

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit();
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#15181B',
      borderRadius: 30,
      marginHorizontal: width * 0.04,
      marginTop: 15,
      paddingHorizontal: 15,
      height: 41,
    },
    input: {
      flex: 1,
      color: '#7F8D9A',
      fontSize: 13,
      marginLeft: 10,
    },
    icon: {
      marginLeft: 0,
    },
  });

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="search" 
        size={25} 
        color="#B4CFEA" 
        style={styles.icon} 
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#7F8D9A"
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
    </View>
  );
}