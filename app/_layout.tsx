import { Stack } from "expo-router";
import { UploadProvider } from "./context/uploadContext"; // Import the UploadProvider

export default function RootLayout() {
  return (
    <UploadProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </UploadProvider>
  );
}
