import { Stack } from "expo-router";
import { UploadProvider } from "./uploadContext"; // Import the UploadProvider

export default function RootLayout() {
  return (
    <UploadProvider>
      <Stack />
    </UploadProvider>
  );
}