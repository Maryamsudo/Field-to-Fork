import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth } from '../firebase.Config';
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();
  const user = auth.currentUser;
  useEffect(() => {
    loadCart();
  }, []);
  
  
  const getCartKey = () => `cart_${user?.uid}`;
  
  const loadCart = async () => {
    try {
      if (!user) return;
      const data = await AsyncStorage.getItem(getCartKey());
      const parsed = data ? JSON.parse(data) : [];
      const withQuantity = parsed.map(item => ({
        ...item,
        quantity: item.quantity || 1,
      }));
      setCartItems(withQuantity);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };
  
  const saveCart = async (updatedCart) => {
    try {
      if (!user) return;
      setCartItems(updatedCart);
      await AsyncStorage.setItem(getCartKey(), JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        loadCart();
      } else {
        setCartItems([]); // clear if no user
      }
    });
  
    return unsubscribe;
  }, []);
  
  const increaseQuantity = (id) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updatedCart);
  };

  const decreaseQuantity = (id) => {
    const updatedCart = cartItems.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    saveCart(updatedCart);
  };

  const removeItem = async (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    saveCart(updatedCart);
  };
  const handleCheckout = () => {
    router.push({
      pathname: "/Confirmorder",
      params: {
        cart: JSON.stringify(cartItems),
        total: getTotal(),
      },
    });
  };
  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(item.price.toString().replace(/[^\d]/g, ""));
      return total + price * item.quantity;
    }, 0);
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
       <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />

       <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() => decreaseQuantity(item.id)}
            style={styles.quantityBtn}
          >
            <Text style={styles.quantitySymbol}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQuantity(item.id)}
            style={styles.quantityBtn}
          >
            <Text style={styles.quantitySymbol}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.id)}>
        <Feather name="trash-2" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push("/homepage")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <View style={styles.checkoutBox}>
            <Text style={styles.totalText}>Total: ₹{getTotal()}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default MyCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  header: {
    backgroundColor: "#4C7339",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1, 
    borderColor: "#2D4223"
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 3,
    borderWidth: 0.5, 
    borderColor: "#2D4223"
  },
  itemImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  itemPrice: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
     borderWidth: 1, 
    borderColor: "#2D4223"
  },
  quantitySymbol: {
    fontSize: 16,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 15,
  },
  checkoutBox: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 3,
     borderWidth: 0.5, 
    borderColor: "#2D4223"
  },
  totalText: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: "#4C7339",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
     borderWidth: 1, 
    borderColor: "#2D4223"
  },
  checkoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});