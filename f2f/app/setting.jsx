import { Feather, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"; // ✅ Import this
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase.Config";
import { SafeAreaView } from 'react-native-safe-area-context';
const AccountScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: "",
    phone: "",
    profileImage: null,
    userType: "", // ✅ Add this
  });
  

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched user data:", data);
          setUserData({
            username: data.username || "",
            phone: data.phone || "",
            profileImage: data.profileImage || null,
            userType: data.userType || "", // ✅ Add this
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // ✅ Re-fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const options = [
    { label: "My Profile", icon: <FontAwesome5 name="user" size={20} color="#016A34" />, path: "/account/myprofile" },
    { label: "My Order", icon: <Feather name="shopping-bag" size={20} color="#016A34" />, path: "/account/myorder" },
    { label: "Delivery Address", icon: <Ionicons name="location-outline" size={20} color="#016A34" />, path: "/account/address" },
    { label: "Privacy Policy", icon: <MaterialIcons name="privacy-tip" size={20} color="#016A34" />, path: "/account/policy" },
    { label: "Update Product", icon: <Feather name="edit-3" size={20} color="#016A34" />, path: "/account/myproduct" },
    { label: "Language", icon: <Feather name="globe" size={20} color="#016A34" />, path: "/account/language" },
    { label: "Delete Account", icon: <Feather name="trash-2" size={20} color="#016A34" />, path: "/account/delete" },
    { label: "Log Out", icon: <Ionicons name="log-out-outline" size={20} color="#016A34" />, path: "/logout" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#4C7339" }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={
              userData.profileImage
                ? { uri: userData.profileImage }
                : require("../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>Name: {userData.username}</Text>
          <Text style={styles.phone}>Phone: {userData.phone}</Text>
        </View>

        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => {
              if (item.label === "Log Out") {
                Alert.alert(
                  "Log Out",
                  "Are you sure you want to log out?",
                  [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: () => router.replace("/getstarted") },
                  ],
                  { cancelable: false }
                );
              } else if (item.label === "Update Product") {
                if (userData.userType?.toLowerCase() === "seller") {
                  router.push(item.path);
                } else {
                  Alert.alert("Access Denied", "Only sellers can access this screen.");
                }
                
              } else {
                router.push(item.path);
              }
            }}
            
          >
            <View style={styles.iconLabel}>
              {item.icon}
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#016A34" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

export default AccountScreen;

// Styles unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4C7339",
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flexGrow: 1,
    backgroundColor: "#FFFFF0",
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  phone: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F6DC",
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
});
