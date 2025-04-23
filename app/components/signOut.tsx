import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type SignOutButtonProps = {
  iconSize?: number;
  iconColor?: string;
  buttonPadding?: number;
  buttonStyle?: object;
  iconStyle?: object;
};

export default function SignOutButton({
  iconSize = 28,
  iconColor = '#747E89',
  buttonPadding = 0,
  buttonStyle = {},
  iconStyle = {}
}: SignOutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              router.replace('/pages/welcomePage');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity 
      onPress={handleLogout}
      style={[styles.button, { padding: buttonPadding }, buttonStyle]}
    >
      <Ionicons 
        name="log-out-outline" 
        size={iconSize} 
        color={iconColor} 
        style={[styles, iconStyle]} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 4
  },
});