import { AntDesign } from '@expo/vector-icons';
import { useRouter } from "expo-router"; // Add this to handle navigation
import { deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { auth, db } from "../../firebase.Config";

const { width, height } = Dimensions.get('window');

export default function DeleteAccount() {
  const [step, setStep] = useState('confirm'); // 'confirm', 'email', 'loading', 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const tickScale = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    if (step === 'success') {
      Animated.spring(tickScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  const handleYes = () => setStep('email');

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
  
    setStep('loading');
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
  
      setStep('success');
    } catch (error) {
      console.error("Deletion failed:", error.message);
      alert("Authentication failed. Please check your email and password.");
      setStep('email');
    }
  };
  
  const handleNo = () => {
    router.replace('/setting'); // or your actual route to settings screen
  };

  const handleBack = () => {
    router.back();
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <AntDesign name="arrowleft" size={width * 0.06} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Delete Account</Text>
      </View>

      {step === 'confirm' && (
        <View style={styles.centerBox}>
          <Text style={styles.confirmText}>Are you sure you want to delete your account?</Text>
          <TouchableOpacity style={styles.yesButton} onPress={handleYes}>
            <Text style={styles.yesText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.noButton} onPress={handleNo}>
            <Text style={styles.noText}>No</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'email' && (
        <View style={styles.centerBox}>
          <Text style={styles.confirmText}>Enter your email and password to confirm deletion</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.yesButton} onPress={handleEmailSubmit}>
            <Text style={styles.yesText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'loading' && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#7BAF66" />
          <Text style={[styles.confirmText, { marginTop: height * 0.03 }]}>
            This may take a few seconds...
          </Text>
        </View>
      )}

      {step === 'success' && (
        <View style={styles.centerBox}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: tickScale }] }]}>
            <AntDesign name="checkcircle" size={width * 0.18} color="#4CAF50" />
          </Animated.View>
          <Text style={styles.successText}>Your account has been deleted</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF0',
    paddingHorizontal: width * 0.05,
    justifyContent: 'flex-start',
  },
  header: {
    backgroundColor: '#4C7339',
    paddingVertical: height * 0.045,
    alignItems: 'center',
    borderBottomLeftRadius: width * 0.05,
    borderBottomRightRadius: width * 0.05,
    position: 'relative',
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  backButton: {
    position: 'absolute',
    left: width * 0.05,
    top: height * 0.05,
  },
  headerText: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#fff',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  confirmText: {
    fontSize: width * 0.045,
    marginBottom: height * 0.04,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '600',
  },
  yesButton: {
    backgroundColor: '#4C7339',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.03,
    marginBottom: height * 0.02,
    borderWidth: 2, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  yesText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  noButton: {
    backgroundColor: '#E5F1D6',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.03,
    borderWidth: 2, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  noText: {
    color: '#2C3E50',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    padding: height * 0.017,
    borderRadius: width * 0.025,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: height * 0.03,
    fontSize: width * 0.042,
    borderWidth: 0.5, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  iconContainer: {
    marginBottom: height * 0.03,
  },
  successText: {
    fontSize: width * 0.045,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'center',
  },
});
