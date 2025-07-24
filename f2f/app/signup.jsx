import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Dimensions, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Toast from 'react-native-toast-message';
import { auth, db } from "../firebase.Config";

const SignupPage = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const [username, setUsername] = useState(""); // Add this
  const [email,setEmail]=useState('');
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(""); // Default role
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSignup = async () => {
    let newErrors = {};
    if (!username) newErrors.username = "Username is required!";
    if (!email) newErrors.email = "Email is required!";
    if (!password) newErrors.password = "Password is required!";
    if (!userType) newErrors.userType = "User type is required!";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
  
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        Toast.show({ type: 'error', text1: "Email is already registered!" });
        return;
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await sendEmailVerification(user);
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        userType: userType,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });
  
      await AsyncStorage.setItem("userType", userType);
  
      Toast.show({
        type: "success",
        text1: "Registration successful!",
        text2: "A verification link has been sent to your email.",
      });
  
      // Don't route to homepage; ask user to verify email first
      Alert.alert(
        "Verify Your Email",
        "Please check your email and verify your account before logging in.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/nextpage"),
          }
        ]
      );
  
    } catch (error) {
      Toast.show({ type: "error", text1: error.message });
    }
  };
  


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/getstarted")} style={styles.backButton}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#2D4223" />
        </View>
      </TouchableOpacity>

      <Image
        source={require("../assets/images/profile.png")}
        style={[styles.image, { width: width * 0.4, height: width * 0.4 }]}
        resizeMode="contain"
      />

      <Text style={[styles.title, { fontSize: width * 0.07 }]}>Create Account</Text>
      <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>Create an account or log in to explore our app</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity style={[styles.toggleButton, styles.loginButton]} onPress={() => router.push("/nextpage")}>
          <Text style={[styles.toggleText, { color: "#466338" }]}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, styles.signupButton]}>
          <Text style={[styles.toggleText, { color: "white" }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <TextInput 
      style={styles.input}
     placeholder="Username" 
     placeholderTextColor="#999" 
     value={username} 
     onChangeText={setUsername} 
     /> 
    {errors.username && <Text style={styles.errorTooltip}>{errors.username}</Text>}

    <TextInput 
  style={styles.input} 
  placeholder="Email"
  value={email}
  onChangeText={(text) => setEmail(text.trim().toLowerCase())}
  keyboardType="email-address"
  autoCapitalize="none"
  placeholderTextColor="#999" 
/>
       {errors.email && <Text style={styles.errorTooltip}>{errors.email}</Text>}
    

      <View style={styles.passwordContainer}>

        <TextInput
          style={[styles.input, styles.passwordInput, { flex: 1 }]}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIconContainer}>
           <Ionicons
             name={isPasswordVisible ? "eye-off" : "eye"}
             size={width * 0.06}
             color="#294B25"
           />
         </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorTooltip}>{errors.password}</Text>}
      {/* User Type Dropdown (Below Password Field) */}
      <View style={styles.checkboxContainer}>
  <Text style={styles.checkboxLabel}>Select User Type:</Text>
  <View style={styles.checkboxRow}>
    <TouchableOpacity
      style={styles.checkboxOption}
      onPress={() => setUserType("Buyer")}
    >
      <Ionicons
        name={userType === "Buyer" ? "checkbox" : "square-outline"}
        size={24}
        color="#294B25"
      />
      <Text style={styles.checkboxText}>Buyer</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.checkboxOption}
      onPress={() => setUserType("Seller")}
    >
      <Ionicons
        name={userType === "Seller" ? "checkbox" : "square-outline"}
        size={24}
        color="#294B25"
      />
      <Text style={styles.checkboxText}>Seller</Text>
    </TouchableOpacity>
  </View>
  {errors.userType && <Text style={styles.errorTooltip}>{errors.userType}</Text>}
</View>


      
      
      <TouchableOpacity 
      onPress={handleSignup}
      style={[styles.registerButton, { width: width * 0.8, height: height * 0.07, marginTop: 10 }]}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>
      <Text style={{ color: "#294B25", marginTop: 10 }}>
  Check your email for registration confirmation.
</Text>
      
      {errorMessage && <Text style={styles.errorTooltip}>{errorMessage}</Text>} 
        {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
   
    </View>
        
    </TouchableWithoutFeedback>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    marginBottom: 13,
  },
  title: {
    fontWeight: "bold",
    color: "#294B25",
    textAlign: "center",
  },
  subtitle: {
    color: "black",
    textAlign: "center",
    marginBottom: 27,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2D4223",
  },
  loginButton: {
    backgroundColor: "#B6D1A8",
  },
  signupButton: {
    backgroundColor: "#4C7339",
  },
  toggleText: {
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#2D4223",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 16,
    color: "#000",
    fontSize: 16,
  },

  
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    position: "relative", // Allows positioning of the icon inside the input field
   
  },
  eyeIconContainer: {
    position: "absolute",
    right: 6, // Adjusts the position to the right of the input field
     top: 0,  // Aligns the top edge of the icon with the top edge of the container
    bottom: 12,  // Ensures the icon is vertically centered
    justifyContent: "center", // Centers the icon vertically
    alignItems: "center", // Centers the icon horizontally  
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  
  checkboxContainer: {
    width: "90%",
    marginBottom: 16,
  },
  checkboxLabel: {
    marginBottom: 6,
    color: "#000",
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#000",
  },
  registerButton: {
    backgroundColor: "#4C7339",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D4223",
    borderRadius: 10,
  },
  registerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorTooltip: {
    backgroundColor: "#FFD700",
    color: "#333",
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
    fontSize: 12,
    alignSelf: "flex-start",
    marginLeft: "5%",
  },
  successMessage: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default SignupPage;
