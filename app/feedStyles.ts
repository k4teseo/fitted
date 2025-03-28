// app/feedStyles.ts
import { StyleSheet } from 'react-native';

const feedStyles = StyleSheet.create({
  // Screen Container
  container: {
    flex: 1,
    backgroundColor: '#15181B', // Dark background
  },
  
  // List
  listContent: {
    padding: 80,
    paddingBottom: 80, // Ensure feed items aren't hidden behind bottom nav
  },

  // Card
  card: {
    backgroundColor: '#9AA8B6',
    borderRadius: 24,
    marginBottom: 30,
    overflow: 'hidden', // Ensures the image corners match card corners
    alignSelf: 'center',
    width: 345, // Fixed width
  },

  // Image Container (with fixed height)
  imageContainer: {
    width: '100%',
    height: 400, // The "frame" for the image
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Fills the container, cropping if needed
  },

  // User Info
  userInfo: {
    backgroundColor: '#595F66',
    padding: 16,
  },
  caption: {
    fontFamily: 'Raleway',    // Use Raleway font
    fontWeight: '700',        // Bold
    fontSize: 17,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: '#F5EEE3',
    marginBottom: 12,
  },
  username: {
    fontFamily: 'Raleway',    // Use Raleway font
    fontWeight: '600',        // Bold
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: '#9AA8B6',      
    marginTop: 4,
  },

  tagContainer: {
    flexDirection: 'row',
  },
  tagPill: {
    backgroundColor: '#A5C6E8', 
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    marginBottom: 6,
  },
  tagText: {
    color: '#262A2F',
    fontWeight: '500',
    fontSize: 10,
  },  


  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },

  

});

export default feedStyles;
