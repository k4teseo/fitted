// app/cameraStyles.ts
import { StyleSheet } from "react-native";

const cameraStyles = StyleSheet.create({
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

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80, // Adjust height as needed
    backgroundColor: "#0F1112", // Same as your top bar color
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 30,
    zIndex: 10, // Ensure it sits on top of other elements
  },
  

  // Bottom bar that holds the shutter button (and optional icons)
  shutterContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 30,
    backgroundColor: "#0F1112",
  },

  // Outer ring of the shutter button
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "#A6C7E8",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  // Inner circle of the shutter button
  shutterBtnInner: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#A6C7E8",
  },

  // If you need a full-width style for images or previews
  fullScreen: {
    width: "100%",
  },
});

export default cameraStyles;
