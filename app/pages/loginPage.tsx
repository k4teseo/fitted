import { View, Text, TextInput, Button} from 'react-native';
import { useState } from 'react';
import feedStyles from "../feedStyles";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('Username:', username);
        //Add authentication logic here
    };

    return (
        <View>
            <Text>Log in to your account</Text>

            <Text>Username</Text>
            <TextInput placeholder="Enter your username" value={username} onChangeText={setUsername}/>

            <Text>Password</Text>
            <TextInput placeholder="Enter your password" value={password} onChangeText={setPassword}/>

            <Button title="LOGIN" onPress={handleLogin} />
            <Text>Forgot Password?</Text>
 
        </View>
    );
}