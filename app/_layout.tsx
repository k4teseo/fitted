import { Stack } from "expo-router";
import { UploadProvider } from "./context/uploadContext"; // Import the UploadProvider
import { CollectionProvider } from "./context/collectionContext";

export default function RootLayout() {
  return (
    <UploadProvider>
      <CollectionProvider>
        <Stack screenOptions={{ headerShown: false,
          // Page transition settings:
          animation: 'fade',        
          animationDuration: 200,   
          gestureEnabled: true,       // Keep swipe gestures
          gestureDirection: 'horizontal', 
        }} />
      </CollectionProvider>
    </UploadProvider>
  );
}
