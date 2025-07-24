import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase.Config";
import { SafeAreaView } from 'react-native-safe-area-context';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dksqw41vw/image/upload";
const UPLOAD_PRESET = "my_unsigned_preset";

const UpdateProductScreen = () => {
  const { product } = useLocalSearchParams();
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const parsedProduct = product ? JSON.parse(product) : {};
  const [name, setName] = useState(parsedProduct.name || "");
  const [description, setDescription] = useState(parsedProduct.description || "");
  const [price, setPrice] = useState(parsedProduct.price || "");
  const [location, setLocation] = useState(parsedProduct.location || "");
  const [category, setCategory] = useState(parsedProduct.category || "");
  const [image, setImage] = useState(parsedProduct.imageUrl || null);
  const [newImage, setNewImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "product.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
  };

  const handleUpdate = async () => {
    if (!name || !description || !price || !location || !category) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }

    setUpdating(true);
    try {
      let finalImageUrl = parsedProduct.imageUrl;

      if (newImage) {
        finalImageUrl = await uploadImageToCloudinary(newImage);
      }

      const productRef = doc(db, "products", parsedProduct.id);
      await updateDoc(productRef, {
        name,
        description,
        price,
        location,
        category,
        imageUrl: finalImageUrl,
      });

      Alert.alert("Success", "Product updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "Failed to update product.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>

    {/* Header */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Update Products</Text>
       </View>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: newImage || image }}
          style={styles.image}
        />
        <Text style={styles.changeImageText}>Change Image</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Fruits, Vegetables)"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={updating}>
        {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Product</Text>}
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProductScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4C7339',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop:-20,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 20,
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
    flexGrow: 1,
    paddingBottom: 40, // optional
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4C7339",
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  changeImageText: {
    textAlign: "center",
    color: "#4C7339",
    marginBottom: 16,
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  multiline: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4C7339",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
