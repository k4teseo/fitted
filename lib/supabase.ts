import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.databaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.databaseKey;

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