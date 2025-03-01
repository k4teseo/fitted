import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import CameraButton from "../components/CameraButton";
import PhotoPreviewSection from "@/components/PhotoPreview";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!cameraPermission || !mediaLibraryPermission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (
    !cameraPermission.granted ||
    mediaLibraryPermission.status !== "granted"
  ) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Grant "Fitted" permission to access your camera?
        </Text>
        <Button
          onPress={() => {
            requestCameraPermission();
            requestMediaLibraryPermission();
          }}
          title="Grant Permission"
        />
      </View>
    );
  }

  // function to change camera facing direction
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // function to turn flash on or off
  function toggleFlash() {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }

  //function to take photo
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };

      // Wait for the photo to be taken
      const currentPhoto = await cameraRef.current.takePictureAsync(options);

      // Log the captured photo to check the result
      console.log("Captured Photo: ", currentPhoto);

      setPhoto(currentPhoto); // Update state with the captured photo
    }
  };

  // function to retake photo
  const handleRetakePhoto = () => setPhoto(null);

  if (photo) {
    // Log if photo is set before rendering the preview
    console.log("Rendering PhotoPreview with photo:", photo);
    return (
      <PhotoPreviewSection
        photo={photo}
        handleRetakePhoto={handleRetakePhoto}
      />
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} flash={flash}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity>
            <CameraButton
              icon="flip-camera-ios"
              size={35}
              color="#fff"
              style={styles.button}
              onPress={toggleCameraFacing}
            />
            <CameraButton
              icon="camera"
              size={35}
              color="#fff"
              style={styles.button}
              onPress={handleTakePhoto}
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    height: 150,
    position: "absolute",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
  },

  button: {
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
