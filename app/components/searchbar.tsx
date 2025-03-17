import {View, Text, TextInput} from 'react-native';
import {useState} from 'react';

export default function SearchBar() {
    const [searchText, setSearchText] = useState('');

    return (
        <View>
            <Text>Search</Text>
            <TextInput 
                placeholder = "Search" 
                value = {searchText}
                onChangeText = {setSearchText}
            />
        </View>
    );
}