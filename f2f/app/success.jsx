import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Success = () => {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  return (
    <View style={styles.container}>
        {/* Back Button */}
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <View style={styles.backButtonCircle}>
                  <Ionicons name="arrow-back" size={width * 0.06} color="#2D4223" />
                </View>
              </TouchableOpacity>
      {/* Checkmark Icon */}
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={width * 0.2} color="#294B25" />
      </View>

      {/* Success Message */}
      <Text style={[styles.title, { fontSize: width * 0.07 }]}>Successful</Text>
      <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>
        Congratulations! Your password has been changed. Continue to login.
      </Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push("/nextpage")}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: "#9EA878",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#4C7339",
  },
  backButton: {
    position: "absolute",
    top: 87,
    left: 30,
    zIndex: 1,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DFF0D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4C7339",
  },
  title: {
    fontWeight: "bold",
    color: "#294B25",
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4C7339",
    width: "85%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D4223",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Success;
