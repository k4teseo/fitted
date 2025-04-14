import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

interface ProfilePictureSelectorProps {
  onImageSelect: (uri: string) => void;
  imageUri?: string | null;
}

const ProfilePictureSelector: React.FC<ProfilePictureSelectorProps> = ({
  onImageSelect,
  imageUri,
}) => {
  const selectProfilePicture = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    // Pick an image
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], 
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      onImageSelect(pickerResult.assets[0].uri); 
    }
  };

  return (
    <TouchableOpacity style={styles.uploadCircle} onPress={selectProfilePicture}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.uploadImage} />
      ) : (
        <MaterialIcons name="add-a-photo" size={32} color="#4DA6FD" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  uploadCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4DA6FD",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default ProfilePictureSelector