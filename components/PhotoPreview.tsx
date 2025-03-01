import { Fontisto } from "@expo/vector-icons";
import { CameraCapturedPicture } from "expo-camera";
import React from "react";
import {
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
  View,
} from "react-native";

const PhotoPreview = ({
  photo,
  handleRetakePhoto,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
}) => {
  // Log photo to ensure it’s being passed correctly
  console.log("Received Photo for Preview: ", photo);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        {/* Display photo if available */}
        {photo && (
          <Image
            style={styles.previewConatiner}
            source={{ uri: "data:image/jpg;base64," + photo.base64 }}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
          <Fontisto name="trash" size={36} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    borderRadius: 15,
    padding: 1,
    width: "95%",
    backgroundColor: "darkgray",
    justifyContent: "center",
    alignItems: "center",
  },
  previewConatiner: {
    width: "95%",
    height: "85%",
    borderRadius: 15,
  },
  buttonContainer: {
    marginTop: "4%",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "gray",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PhotoPreview;
