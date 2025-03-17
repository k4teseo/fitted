import { View, Text, TextInput, Button} from 'react-native';

export default function ResetPage() {
    return (
        <View>
            <Text>Reset your password</Text>
            <Text>Enter the email address you used when you joined and we will
                send you instructions to reset your password.
            </Text>
            <TextInput placeholder="Enter your email" />

            <Button title="Request Password Reset"  />            
        </View>
    );
}