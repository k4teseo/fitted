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
import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";


export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");

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
    setUri(photo?.uri);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const uploadImage = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  
    const { data, error } = await supabase.storage
      .from("images")
      .upload(`uploads/${Date.now()}.jpg`, Buffer.from(base64, "base64"), {
        contentType: "image/jpeg",
      });
  
    if (error) {
      console.error("Upload error:", error);
      return;
    }
  
    console.log("Upload successful:", data);
  };

  const renderPicture = () => {
    return (
      <>
        <View style={{ width: "140%" }}>
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: "100%", aspectRatio: 1 }}
          />
        </View>
        <View style={styles.shutterContainer}>
          <Pressable onPress={() => setUri(null)}>
            <MaterialIcons name={"cached"} size={32} color="black" />
          </Pressable>
          <Pressable onPress={() => uploadImage(uri!)}>
            <MaterialIcons name={"check-circle"} size={32} color="black" />
          </Pressable>
        </View>
      </>
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
                      backgroundColor: "white",
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  fullScreen: {
    width: "100%",
  },
});
