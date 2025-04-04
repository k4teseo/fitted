import {
  CameraType,
  CameraView,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlipType, manipulateAsync } from "expo-image-manipulator";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");

  const router = useRouter();

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Allow "Fitted" to access your camera?
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();

    let finalUri: string = photo?.uri ?? "";

    if (facing === "front") {
      try {
        const flippedPhoto = await manipulateAsync(photo?.uri!, [
          {
            flip: FlipType.Horizontal,
          },
        ]);
        finalUri = flippedPhoto.uri;
      } catch (error) {
        console.error("Error flipping image:", error);
      }
    }
    setUri(finalUri);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const renderPicture = () => {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.imagePreview} />
        </View>

        <View style={styles.shutterContainer}>
          {/* Left Icon: Retake */}
          <Pressable onPress={() => setUri(null)} style={styles.iconButton}>
            <MaterialIcons name="cached" size={50} color="#F5EEE3" />
          </Pressable>

          {/* Right Icon: Check with Beige Circle */}
          <Pressable
            onPress={() =>
              router.push(`./upload?imageUri=${encodeURIComponent(uri!)}`)
            }
            style={styles.checkButton}
          >
            <MaterialIcons name="check" size={32} color="#0F1112" />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        facing={facing}
        flash={flash}
        responsiveOrientationWhenOrientationLocked
      >
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <MaterialIcons name="close" size={32} color="white" />
        </Pressable>
        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleFlash}>
            <MaterialIcons
              name={flash === "off" ? "flash-off" : "flash-on"}
              size={32}
              color="white"
            />
          </Pressable>
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      opacity: pressed ? 0.5 : 1,
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <MaterialIcons name="flip-camera-ios" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15181B",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    // Optionally reduce or remove horizontal padding
    paddingHorizontal: 0,
  },
  shutterBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#A6C7E8",
    flexShrink: 0, // Prevents unwanted resizing
  },
  // Inner circle of the shutter button
  shutterBtnInner: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#A6C7E8",
  },
  imageContainer: {
    width: "90%",
    aspectRatio: 3 / 4, // Adjust ratio as needed
    borderRadius: 30,
    marginBottom: 40,
    overflow: "hidden", // This is REQUIRED for borderRadius to work
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  iconButton: {
    // For the retake icon
    padding: 0,
  },
  checkButton: {
    // Beige circle behind check icon
    backgroundColor: "#F5EEE3",
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 55, // Adjust based on status bar height
    left: 20,
    zIndex: 10, // Ensure it appears on top
    backgroundColor: "rgba(0,0,0,0.5)", // Slight transparency for better visibility
    borderRadius: 10,
    padding: 4,
  },
});
