import { View, Text, TextInput, Button} from 'react-native';

export default function signupPage() {
    return (
        <View>
            <Text>Create an account</Text>
            <Text>Email or Phone Number</Text>
            <TextInput placeholder="Enter email or phone number" />
            <Text>Create Password</Text>
            <TextInput placeholder="Enter your password" />

            <TextInput placeholder="Confirm your password" />

            <Button title="SIGN UP"  />
        </View>
    );
}