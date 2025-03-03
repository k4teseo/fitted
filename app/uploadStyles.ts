// app/uploadStyles.ts
import { StyleSheet } from "react-native";

const uploadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1112",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,    // Adjust for device notch
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  postButton: {
    backgroundColor: "#4DA6FD", 
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  postButtonText: {
    color: "#F5EEE3",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 16,
  },
  inputContainer: {
    paddingHorizontal: 30,
  },
  input: {
    backgroundColor: "#1A1C1E",
    color: "#FFFFFF",
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default uploadStyles;
