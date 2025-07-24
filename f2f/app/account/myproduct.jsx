import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from 'react-native-gesture-handler';
import { auth, db } from "../../firebase.Config";

const MyProductsScreen = () => {

  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "products"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);
  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };
  
  const handleEdit = (product) => {
    router.push({
      pathname: "/account/updateproduct",
      params: { product: JSON.stringify(product) },
    });
  };

  const renderRightActions = (productId) => (
    <TouchableOpacity 
      style={styles.deleteButton} 
      onPress={() => deleteProduct(productId)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete</Text>
    </TouchableOpacity>
  );
  
  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.details}>₨{item.price} • {item.category}</Text>
          <Text style={styles.details}>{item.location}</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Products</Text>
    </View>
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingBottom: 20,
        paddingHorizontal: 15,
        paddingTop: 20, // <-- adds space below header
      }}
      showsVerticalScrollIndicator={false}
    />
  </View>
  );
};

export default MyProductsScreen;

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
    flex: 1,
    backgroundColor: "#FFFFF0",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    backgroundColor: "#4C7339",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 7,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  }
  
});
