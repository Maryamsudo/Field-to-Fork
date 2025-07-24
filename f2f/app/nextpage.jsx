import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from 'expo-checkbox';
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase.Config";
import { useTranslation } from "react-i18next";
const NextPage = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const { t } = useTranslation(); // ⬅️ Access translations
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[errorMessage,setErrorMessage]=useState(null);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [userType, setUserType] = useState(null); // Store userType in state
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);

// Google Auth Hook
//const [request, response, promptAsync] = Google.useAuthRequest({
  //: GOOGLE_WEB_CLIENT_ID,
 // iosClientId: GOOGLE_IOS_CLIENT_ID,
 //// androidClientId: GOOGLE_ANDROID_CLIENT_ID,
 // redirectUri: makeRedirectUri({ useProxy: true }),
 // scopes: ["profile", "email"],
//});
 
 


  // Handle Google Sign-In Response
 /* useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          alert("Google Sign-In Successful!");s
          router.push("/home");
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    //}
  //}, [response]); */

  // Handle Email/Password Login
  const handleLogin = async () => {
    setErrorMessage(null);
  
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
        return;
      }
  
    // 🔥 Fetch userType from Firestore
    const firestore = getFirestore();
    const userDocRef = doc(firestore, "users", user.uid); // Adjust path as per your Firebase structure
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const usertype = userData?.userType; // Make sure the field is named 'userType' in your Firestore

      if (usertype) {
        await AsyncStorage.setItem("usertype", usertype); // Save userType in AsyncStorage
        console.log("Usertype fetched and saved:", usertype);
        setUserType(usertype); // Update userType in state
      } else {
        console.warn("Usertype not found in user document.");
        await AsyncStorage.removeItem("userType"); // Optional fallback if no userType
      }
    } else {
      console.warn("No user document found.");
      await AsyncStorage.removeItem("userType"); // Optional fallback
    }

      
  
      alert("Login successful! Redirecting...");
      router.push("/homepage");
  
    } catch (error) {
      console.error("Firebase Auth Error:", error);
  
      if (error.code === "auth/user-not-found") {
        setErrorMessage("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password. Try again.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format.");
      } else {
        setErrorMessage(error.message);
      }
    }
  };
  
  

  // Handle input change and clear errors
  const handleInputChange = (setter) => (value) => {
    setter(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };
  return(
  <View style={styles.container}>
          {/* Back Arrow to navigate back to Get Started Page */}
          <TouchableOpacity onPress={() => router.push("/getstarted")} style={styles.backButton}>
  <View style={styles.backButtonCircle}>
    <Ionicons name="arrow-back" size={24} color="#2D4223" />
  </View>
</TouchableOpacity>
      {/* Profile Image */}
      <Image
        source={require("../assets/images/profile.png")} // image
        style={[
          styles.image,
          { width: width * 0.5, height: width * 0.5 }, // Dynamic sizing
        ]}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={[styles.title, { fontSize: width * 0.08 }]}>{t('Get Started Now')}</Text>
      <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>
        {t('Create an account or log in to explore our app')}
      </Text>

      {/* Toggle: Log In / Sign Up */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={[styles.toggleButton, { backgroundColor: "#4C7339", borderColor: "#2D4223", borderWidth: 1.5 }]}>
          <Text style={[styles.toggleText, { color: "white" }]}>{t('Log In')}</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: "#B6D1A8", borderColor: "#2D4223", borderWidth: 1.5 },
          ]}
          onPress={() => router.push("/signup")} // Navigate to signup page
        >
          <Text style={[styles.toggleText, { color: "#466338" }]}>{t('Sign Up')}</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <TextInput
        style={[styles.input, { fontSize: width * 0.045 , borderColor: "#2D4223"}]}
        placeholder="Email"
        onChangeText={handleInputChange(setEmail)}
        placeholderTextColor="#999"
      />

      <View style={styles.passwordContainer}>
       <TextInput
      style={[styles.input, { fontSize: width * 0.045, borderColor: "#2D4223", flex: 1 }]}
       placeholder="Password"
       onChangeText={handleInputChange(setPassword)}
       placeholderTextColor="#999"
      secureTextEntry={!isPasswordVisible}
      />
  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIconContainer}>
    <Ionicons
      name={isPasswordVisible ? "eye-off" : "eye"}
      size={width * 0.06}
      color="#294B25"
    />
  </TouchableOpacity>
</View>
{/* Error message display */}
{errorMessage && (
  <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text>
)}

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsContainer}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isRemembered}
            onValueChange={setIsRemembered}
            tintColors={{ true: "#294B25", false: "#294B25" }}
          />
          <Text style={[styles.rememberMe, { fontSize: width * 0.04 }]}>{t('Remember me')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
          <Text style={[styles.forgotPassword, { fontSize: width * 0.04 }]}>
            {t('Forgot Password?')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Log In Button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={[
          styles.loginButton,
          {
            width: width * 0.8,
            height: height * 0.07,
            borderRadius: width * 0.04,
            borderColor: "#2D4223",
          },
        ]}
      >
        <Text style={[styles.loginText, { fontSize: width * 0.05 }]}>{t('Log In')}</Text>
      </TouchableOpacity>

      {/* Or With */}
      <Text style={[styles.orText, { fontSize: width * 0.045 }]}>{t('Or log in with')}</Text>

    
     
      {/* Google Sign-In Button */}
      <TouchableOpacity onPress={() => promptAsync()} style={styles.googleButton}>
        <Ionicons name="logo-google" size={24} color="white" />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0", // Light background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9EA878", // Light gray background for a rounded button effect
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // For Android shadow effect
    borderColor: "#4C7339",
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20, // Aligning to the left side
    zIndex: 1,
  },
  
  image: {
    marginBottom: 5,
  },
  title: {
    fontWeight: "bold",
    color: "#294B25", // Green title color
    textAlign: "center",
  },
  subtitle: {
    color: "black", // Gray subtitle color
    textAlign: "center",
    marginBottom: 20,
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
    backgroundColor: "#F0F0F0", // Light gray background
    marginHorizontal: 5,
    borderRadius: 10,
  },
  toggleText: {
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#000",
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberMe: {
    marginLeft: 5,
    color: "black",
  },
  forgotPassword: {
    color: "#294B25",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#4C7339", // Green button color
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 20,
    color: "black",
  },
  googleButton: { 
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: "#8DAB7F", // Updated background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2, // Adding stroke
    borderColor: "#2D4223", // Updated border color
       },
  googleButtonText: { 
    color: "white",
     marginLeft: 10,
      fontWeight: "bold" },
});


export default NextPage;
