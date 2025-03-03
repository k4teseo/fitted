import {
  CameraType,
  CameraView,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import cameraStyles from "./cameraStyles";
import { RetakeIcon } from "./Icons";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  
  const router = useRouter(); 

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={cameraStyles.container}>
        <Text style={{ textAlign: "center" }}>
          Allow "Fitted" to access your camera?
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const renderTopBar = () => {
    return (
      <View style={cameraStyles.headerContainer}>
        <Pressable onPress={() => router.push("/feedPage")}>
          <MaterialIcons name="close" size={28} color="#F5EEE3" />
        </Pressable>
      </View>
    );
  };

  const renderPicture = () => {
    console.log("URI", uri);

    return (
      <>
        <View style={{ width: "140%" }}>
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: "100%", aspectRatio: 1 }}
          />
        </View>
        <View style={cameraStyles.shutterContainer}>
          <Pressable onPress={() => setUri(null)}>
            <MaterialIcons name={"cached"} size={32} color="white" />
          </Pressable>
          {/* Right Button: Check with Beige Circle */}
        <Pressable
          onPress={() => {
            // Navigate to the upload page after confirmation
            router.push(`/upload?imageUri=${encodeURIComponent(uri!)}`);
          }}
          style={{
            backgroundColor: "#F5EEE3",
            width: 40,
            height: 40,
            borderRadius: 27.5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="check" size={28} color="#0F1112" />
        </Pressable>
        </View>
        {uploadStatus && (
          <View>
            <Text>{uploadStatus}</Text>
          </View>
        )}
      </>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={cameraStyles.camera}
        ref={ref}
        facing={facing}
        flash={flash}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={cameraStyles.shutterContainer}>
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
                  cameraStyles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
              <View style={cameraStyles.shutterBtnInner} />
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
    <View style={cameraStyles.container}>
      {renderTopBar()}
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
  
}
