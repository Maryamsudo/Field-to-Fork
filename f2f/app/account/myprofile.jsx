import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore functions
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase.Config"; // Firebase imports
const { width, height } = Dimensions.get("window");

const MyProfile = () => {
  const router = useRouter();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("Buyer");
  const [image, setImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userTypeList, setUserTypeList] = useState(["Buyer", "Farmer", "Wholesaler"]);

  useEffect(() => {
    // Fetch user data from Firebase when component mounts
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserName(userData.username);
          setEmail(userData.email);
          setPhone(userData.phone);
          setUserType(userData.userType);
          setImage(userData.profileImage || null); // Use the profile image from Firebase if available
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // remove base64
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri); // only save URI
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      let imageUrl = image;
  
      if (image && image.startsWith("data:image")) {
        imageUrl = await uploadImageToCloudinary(image);
      }
  
      const userRef = doc(db, "users", auth.currentUser.uid);
  
      await setDoc(userRef, {
        username,
        email,
        phone,
        userType,
        profileImage: imageUrl || null,
      }, { merge: true });
  
      alert("Profile updated!");
      router.push("/setting");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };
  
  const uploadImageToCloudinary = async (uri) => {
    const cloudName = "maryamjaved";
    const uploadPreset = "my_unsigned_preset";
  
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg"
    });
    formData.append("upload_preset", uploadPreset);
  
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  
    const data = await response.json();
  
    if (data.error) {
      console.error("Cloudinary upload error:", data.error.message);
      throw new Error("Upload failed");
    }
  
    return data.secure_url;
  };
  
  
  
  const renderUserTypeItem = ({ item }) => (
    <TouchableOpacity onPress={() => { setUserType(item); setModalVisible(false); }}>
      <Text style={styles.modalItem}>{item}</Text>
    </TouchableOpacity>
  );
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My profile</Text>
      </View>

      <View style={styles.avatarContainer}>
      <TouchableOpacity onPress={pickImage}>
    {image ? (
      <Image
        source={{ uri: image }}
        style={styles.avatar}
      />
    ) : (
      <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
    )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
      <Text style={styles.label}>Full Name</Text>
<TextInput style={styles.input} value={username} onChangeText={setUserName} />


        <Text style={styles.label}>Email</Text>
        {/* Email is now a read-only field */}
        <Text style={styles.readOnlyInput}>{email}</Text>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>User Type</Text>
        {/* User Type is now displayed as text */}
        <Text style={styles.readOnlyInput}>{userType}</Text>

        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for User Type dropdown */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={userTypeList}
              renderItem={renderUserTypeItem}
              keyExtractor={(item) => item}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFF0",
  },
  header: {
    backgroundColor: "#4C7339",
    paddingTop: height * 0.06,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: height * 0.06,
    left: 20,
  },
  headerText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#4C7339",
    padding: 5,
    borderRadius: 20,
  },
  form: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "#F0F6DC",
    borderRadius: 10,
    paddingVertical: 17,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 0.5, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  readOnlyInput: {
    backgroundColor: "#F0F6DC",
    borderRadius: 10,
    paddingVertical: 17,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    opacity: 0.6, // Making the read-only fields look visually distinct
    borderWidth: 0.5, // Border thickness
    borderColor: "#2D4223", // Border color

  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4C7339",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: width * 0.8,
  },
  modalItem: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: "#4C7339",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  closeModalText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MyProfile;
