// auth.ts (or auth.js)
import "react-native-get-random-values"; // <-- Needed for uuid in React Native/Expo
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

const USER_ID_KEY = "myAppUserId";

// Make sure this is a NAMED export, not a default export
export async function getOrCreateUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = uuidv4();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error("Error retrieving user ID:", error);
    // fallback if there's an error
    return uuidv4();
  }
}
