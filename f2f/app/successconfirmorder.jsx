import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebase.Config';

const { width, height } = Dimensions.get('window');

const SuccessScreen = () => {
  const { orderId } = useLocalSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) setOrderData(snapshot.data());
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading || !orderData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C7339" />
        <Text>Loading order details...</Text>
      </View>
    );
  }

  const { cartItems, address, grandTotal, status, estimatedDelivery } = orderData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Confirmed</Text>
      </View>

      <Text style={styles.title}>✅ Order Confirmed!</Text>
      <Text style={styles.orderId}>Order ID: {orderId}</Text>

      <Text style={styles.sectionTitle}>Delivery Address:</Text>
      <Text style={styles.text}>{address}</Text>

      <Text style={styles.sectionTitle}>Items:</Text>
      {cartItems.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.text}>• {item.name} x {item.quantity}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Grand Total:</Text>
      <Text style={styles.text}>₹{grandTotal}</Text>

      <Text style={styles.sectionTitle}>Status:</Text>
      <Text style={styles.text}>{status}</Text>

      <Text style={styles.sectionTitle}>Estimated Delivery:</Text>
      <Text style={styles.text}>
        {new Date(estimatedDelivery?.seconds * 1000).toDateString()}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/homepage')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    padding: '3%',
    backgroundColor: '#FFFFF0',
    flexGrow: 1,
  },

  // Header style
  header: {
    backgroundColor: '#4C7339',
    paddingVertical: '5%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
   
    width: '100%',
  },
  backButton: {
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: width > 400 ? 18 : 16, // Adjusts font size based on screen width
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To center the title visually
  },

  // Other styles
  title: {
    fontSize: width > 400 ? 22 : 20, // Adjusts font size based on screen width
    fontWeight: 'bold',
    color: '#2D4223',
    marginBottom: 10,
    textAlign: 'center',
  },
  orderId: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 15,
    color: '#4C7339',
  },
  text: {
    fontSize: width > 400 ? 16 : 15, // Adjusts font size based on screen width
    marginTop: 4,
    color: '#333',
  },
  item: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFF0',
  },
  button: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#4C7339',
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    
  },
});
