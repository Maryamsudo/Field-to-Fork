import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection,getDocs, doc, getDoc, query, onSnapshot,  updateDoc,} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {ActivityIndicator,FlatList,Image,Platform,StatusBar,StyleSheet,Text,TouchableOpacity,View,SafeAreaView,} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../../firebase.Config';

const OrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  const statusFlow = {
    Pending: 'Accepted',
    Accepted: 'Out for Delivery',
    'Out for Delivery': 'Delivered',
  };

  useEffect(() => {
    const fetchUserType = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserType(userDoc.data().userType); // 'Buyer' or 'Seller'
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userType) return;

    const q = collection(db, 'orders');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => {
          const isBuyer = userType === 'Buyer' && order.userId === user.uid;
          const isSeller = userType === 'Seller' && order.cartItems.some((item) => item.uid === user.uid);
          return isBuyer || isSeller;
        });
      setOrders(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userType]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
  
      // Update the status first
      await updateDoc(orderRef, { status: newStatus });
  
      // Fetch the updated order data to check payment method
      const updatedOrderDoc = await getDoc(orderRef);
      if (updatedOrderDoc.exists()) {
        const orderData = updatedOrderDoc.data();
  
        // If status is Delivered AND paymentMethod is COD (case-insensitive)
        if (
          newStatus === 'Delivered' &&
          orderData.paymentMethod.toLowerCase() === 'cod'
        ) {
          await updateDoc(orderRef, { paymentReceived: true });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  const filteredOrders = orders.filter((order) =>
    activeTab === 'active' ? order.status !== 'Delivered' : order.status === 'Delivered'
  );

  const renderOrder = ({ item }) => {
    const nextStatus = statusFlow[item.status];
    const currentUser = auth.currentUser;

    // Check if the logged-in seller is part of this order
    const isSellerInvolved =
      userType === 'Seller' &&
      item.cartItems.some((product) => product.uid === currentUser.uid);

    return (
      <View style={styles.card}>
        <Text style={styles.orderTitle}>Order ID: {item.id}</Text>

        {item.cartItems.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.name}>{product.name}</Text>
              <Text>Qty: {String(product.quantity)}</Text>
              <Text>Price: {String(product.price)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.summary}>
          <Text>Subtotal: Rs. {String(item.subtotal)}</Text>
          <Text>Delivery: Rs. {String(item.deliveryCharge)}</Text>
          <Text style={styles.total}>Total: Rs. {String(item.grandTotal)}</Text>
          <Text>Payment: {String(item.paymentMethod)}</Text>

          {/* Status Section */}
          {userType === 'Seller' && isSellerInvolved && nextStatus ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>Update Status:</Text>
              <Picker
                selectedValue={item.status}
                onValueChange={(value) => handleStatusChange(item.id, value)}
                mode="dropdown"
              >
                <Picker.Item label={item.status} value={item.status} />
                <Picker.Item label={nextStatus} value={nextStatus} />
              </Picker>
            </View>
          ) : (
            <Text>Status: {item.status}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() =>
            router.push({
              pathname: '/account/trackorder',
              params: { orderId: item.id },
            })
          }
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Track Order</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
        >
          <Text style={activeTab === 'active' ? styles.activeText : styles.inactiveText}>
            Active Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
        >
          <Text style={activeTab === 'history' ? styles.activeText : styles.inactiveText}>
            Order History
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filteredOrders.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40 }}>No orders found.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFF0',
  },
  headerWrapper: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#4C7339',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#4C7339',
  },
  tab: { paddingBottom: 8 },
  activeTab: { borderBottomWidth: 2, borderColor: '#4C7339' },
  activeText: { fontWeight: 'bold', color: '#4C7339' },
  inactiveText: { color: '#555' },
  card: {
    backgroundColor: '#D6E6CE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  orderTitle: { fontWeight: 'bold', marginBottom: 8 },
  productRow: { flexDirection: 'row', marginBottom: 10 },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  details: { justifyContent: 'center' },
  name: { fontWeight: 'bold' },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    marginTop: 8,
  },
  total: { fontWeight: 'bold', marginTop: 4 },
  trackButton: {
    backgroundColor: '#4C7339',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2D4223',
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 80,
  },
});

export default OrdersScreen;
