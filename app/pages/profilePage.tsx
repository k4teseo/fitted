import { View, Text, TextInput} from 'react-native';

export default function ProfilePage() {
    return (
        <View>
            <Text>Profile</Text>
            <TextInput placeholder="Name" />
            <TextInput placeholder="Bio" />
        </View>
    );
}
