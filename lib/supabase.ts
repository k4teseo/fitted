import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.databaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.databaseKey;

console.log("🚀 Supabase Debug - Expo Config:", Constants.expoConfig);
console.log("🔑 Supabase URL:", Constants.expoConfig?.extra?.databaseUrl);
console.log("🔐 Supabase Key:", Constants.expoConfig?.extra?.databaseKey ? "Loaded ✅" : "❌ MISSING");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})