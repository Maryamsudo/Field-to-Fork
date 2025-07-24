import { useRouter } from "expo-router"; // Import the useRouter hook
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
  const GetStarted = () => {
  const router = useRouter();// Initialize the router
  const { width, height } = Dimensions.get("window"); // Get screen dimensions
  const { t } = useTranslation(); // ⬅️ Access translations
    return (            // Main UI structure block 
    <View style={[styles.container, { paddingVertical: height * 0.05 }]}> 
    <Image
        source={require("../assets/images/field-to-fork.png")} // Ensure the image has no background
        style={[
          styles.image,
          {
            width: width * 0.9, // Image width is 80% of the screen width
            height: height * 0.4 // Image height is 40% of the screen height
          },
        ]}
        resizeMode="contain" //no stretching from left or right 
      />
      <Text style={[styles.title, { fontSize: width * 0.1 }]}>{t('Field To Fork')}
      </Text>
      <Text style={[styles.description, { fontSize: width * 0.045 }]}>
       {t(' Sow, Grow, and Serve')}
      </Text>
      {/* Three Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, { width: width * 0.02, height: width * 0.02 }]} />
        <View style={[styles.dot, { width: width * 0.02, height: width * 0.02 }]} />
        <View style={[styles.dot, { width: width * 0.02, height: width * 0.02 }]} />
      </View>
     
      {/* ✅ Fixed TouchableOpacity */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: width * 0.7, // Button width is 70% of the screen width
            height: width * 0.14, // Button height is proportional to its width
            borderRadius: width * 0.07, // Button border-radius matches half the height for round corners
          },
        ]}
        onPress={() => router.push("/nextpage")} // Navigate to the next page
      >
        {/* ✅ Wrapped text inside Text component */}
        <Text style={[styles.buttonText, { fontSize: width * 0.05 }]}>{t('GET STARTED')}</Text>
      </TouchableOpacity>
    </View>
 );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFF0", // Background color
  },
  image: {
    marginBottom: Dimensions.get("window").height * 0.05, // Dynamic margin based on screen height
  },
  title: {
    fontWeight: "bold",
    color: "#000", // Black color for title
    marginBottom: Dimensions.get("window").height * 0.02, // Dynamic spacing
    textAlign: "center",
  },
  description: {
    color: "#294B25", // Green color for description
    textAlign: "center",
    marginBottom: Dimensions.get("window").height * 0.03, // Dynamic spacing
  },
  dotsContainer: {
    flexDirection: "row", // Align dots horizontally
    justifyContent: "center",
    marginBottom: Dimensions.get("window").height * 0.03, // Space below dots
  },
  dot: {
    backgroundColor: "#294B25", // Same green color as the description
    borderRadius: 50, // Fully round dot
    marginHorizontal: Dimensions.get("window").width * 0.01, // Space between dots
  },
  button: {
    backgroundColor: "#4C7339", // Button background color
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default GetStarted;
