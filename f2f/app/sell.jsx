import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, SafeAreaView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import Toast from "react-native-toast-message";
import { auth, db } from "../firebase.Config";
const categories = ["Fruits", "Rice", "Herbs", "Crops", "Vegetables", "Spices"];
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dksqw41vw/image/upload";
const UPLOAD_PRESET = "my_unsigned_preset";

const Sell = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        exif: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      } else {
        Toast.show({ type: "info", text1: "Image selection cancelled." });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to pick image", text2: error.message });
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("☁️ Cloudinary response:", data);

    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.secure_url;
  };
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Location permission denied' });
        return;
      }
  
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
  
      if (address.length > 0) {
        const locText = `${address[0].name || ""}, ${address[0].city || ""}, ${address[0].region || ""}`;
        setLocation(locText);
      } else {
        setLocation(`${latitude}, ${longitude}`);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to get location', text2: error.message });
    }
  };
  
  const uploadProduct = async () => {
    if (!image || !name || !description || !price || !location || !category) {
      Toast.show({ type: "error", text1: "Please fill all fields!" });
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImageToCloudinary(image);

      await addDoc(collection(db, "products"), {
        uid: auth.currentUser?.uid || "",
        name: name.trim(),
        description: description.trim(),
        price: price.trim(),
        location: location.trim(),
        category,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Toast.show({ type: "success", text1: "Product added successfully!" });
      router.back();
    } catch (error) {
      Toast.show({ type: "error", text1: "Upload failed", text2: error.message });
    } finally {
      setUploading(false);
    }
  };

  const renderCategoryModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Category</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setCategory(item);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Sell</Text>
      </View>


        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Tap to select product image</Text>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Product Description" value={description} onChangeText={setDescription} multiline />
        <TextInput style={styles.input} placeholder="Price (PKR)" value={price} onChangeText={setPrice} />
        <TouchableOpacity onPress={getCurrentLocation} style={styles.button}>
  <Text style={styles.buttonText}>Get Current Location</Text>
</TouchableOpacity>

    <Text style={{ marginVertical: 8, fontSize: 14 }}>{location ? `📍 ${location}` : "Location not selected yet"}</Text>


        <Text style={styles.pickerLabel}>Select Category:</Text>
        <TouchableOpacity style={styles.pickerWrapper} onPress={() => setModalVisible(true)}>
          <Text style={styles.pickerText}>{category || "-- Select Category --"}</Text>
        </TouchableOpacity>

        {renderCategoryModal()}

        <TouchableOpacity onPress={uploadProduct} style={styles.button} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload Product</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4C7339',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  container: {
    padding: 20,
    backgroundColor: "#FFFFF0",
  },
  imagePicker: {
    backgroundColor: "#eee",
    height: 200,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop:13,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imageText: {
    color: "#888",
  },
  input: {
    backgroundColor: "white",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderColor: "#2D4223",
    borderWidth: 1,
  },
  pickerLabel: {
    marginBottom: 6,
    color: "#333",
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "white",
    borderRadius: 10,
    borderColor: "#2D4223",
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  pickerText: {
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#4C7339",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
  },
  modalItemText: {
    fontSize: 16,
  },
  modalClose: {
    marginTop: 20,
    alignItems: "center",
  },
  modalCloseText: {
    color: "red",
    fontWeight: "bold",
  },
});

export default Sell;
