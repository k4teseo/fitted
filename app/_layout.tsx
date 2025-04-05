import { Stack } from "expo-router";
import { UploadProvider } from "./context/uploadContext"; // Import the UploadProvider

export default function RootLayout() {
  return (
    <UploadProvider>
      <Stack screenOptions={{ headerShown: false,
      // Page transition settings:
      animation: 'fade',        
      animationDuration: 200,   
      gestureEnabled: true,       // Keep swipe gestures
      gestureDirection: 'horizontal', 
      }} 
    />
    </UploadProvider>
  );
}
