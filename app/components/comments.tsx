import {View, Text, TextInput, Button} from 'react-native';
import {useState} from 'react';

export default function Comments() {
    const [comments, setComments] = useState('');
    const [input, setInput] = useState('');

    const addComment = () => {
        // Add the input to the comments array
    };

    return (
        <View>
            <Text>Comments</Text>
            <TextInput
                placeholder="Write your comment here..."
                value={input}
                onChangeText={setInput}
            />
            <Button title="Submit" onPress={addComment} />
        </View>
    );
}