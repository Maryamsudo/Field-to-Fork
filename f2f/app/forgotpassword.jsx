import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase.Config";



const ForgotPassword = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  const handleSendCode = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
  
    setError(""); // Clear any previous errors
    setLoading(true);
  
    try {
      const user = auth.currentUser;
      await sendPasswordResetEmail(auth, email);
      
      Alert.alert("Success", "Password reset email sent. Check your inbox.");
      router.push("/success");
  
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#2D4223" />
        </View>
      </TouchableOpacity>

      {/* Profile Image */}
      <Image source={require("../assets/images/profile.png")} style={[styles.image, { width: width * 0.6, height: width * 0.7 }]}
        resizeMode="contain" />

      {/* Title & Subtitle */}
      <Text style={[styles.title, { fontSize: width * 0.07 }]}>Forgot Password</Text>
      <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>
        Enter your email to receive a verification code.
      </Text>

      {/* Email Input */}
      <TextInput
        style={[styles.input, { fontSize: width * 0.048 }]}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Send Code Button */}
      <TouchableOpacity
        style={[styles.button, { height: height * 0.06, borderRadius: width * 0.08 }]}
        onPress={handleSendCode}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Send ResetPassword Link </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
    alignItems: "center",
    padding: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9EA878",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    borderColor: "#4C7339",
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    zIndex: 1,
  },
  image: {
    marginBottom: 0.1,
  },
  title: {
    fontWeight: "bold",
    color: "#294B25",
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#2D4223",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4C7339",
    paddingVertical: 9,
    borderRadius: 10,
    width: "87%",
    borderWidth: 2,
    borderColor: "#2D4223",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ForgotPassword;
