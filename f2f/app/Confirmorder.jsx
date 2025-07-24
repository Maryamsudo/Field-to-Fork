import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase.Config';
import { useLocalSearchParams } from 'expo-router';

const PaymentScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const deliveryCharge = 100;
  const [loading, setLoading] = useState(true);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const { paymentStatus: routePaymentStatus } = useLocalSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(routePaymentStatus || 'Pending');

  useEffect(() => {
  const loadCart = async () => {
  try {
    const authUser = auth.currentUser;
    if (!authUser) return;
    const key = `cart_${authUser.uid}`;
    const data = await AsyncStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : [];
    const formattedCart = parsed.map(item => {
    let price = 0;
    if (typeof item.price === 'string') {
    price = parseFloat(item.price.replace(/[^\d.]/g, '').trim()) || 0;
    } else if (typeof item.price === 'number') {
     price = item.price;
    } 
    return {
    ...item,
     quantity: item.quantity || 1,
     price,
     };
     });

    setCartItems(formattedCart);
    } catch (error) {
     console.error("Error loading cart:", error);
    } finally {
     setLoading(false);
    }
    };
    loadCart();
  }, []);

  const loadAddress = async () => {
  if (user) {
  try {
   const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
     const userData = userDoc.data();
     const defaultAddr = userData?.default?.address || "";
     const shippingAddr = userData?.shippingAddress?.formattedAddress || "";
          setDefaultAddress(defaultAddr);
          setManualAddress(shippingAddr);
          setShippingAddress(useDefaultAddress ? defaultAddr : shippingAddr);
        }
      } catch (error) {
        console.error("Error loading address:", error);
      }
    }
  };

  useEffect(() => {
    if (defaultAddress || manualAddress) {
      setShippingAddress(useDefaultAddress ? defaultAddress : manualAddress);
    }
  }, [useDefaultAddress, defaultAddress, manualAddress]);

  useEffect(() => {
    const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
    const pricenumber = typeof item.price === 'number' ? item.price : 0;
    const price = parseFloat(pricenumber);
        // Log the price for debugging
    console.log('Price string:', pricenumber);
    console.log('Parsed price:', price);
const quantity = parseInt(item.quantity, 10) || 0;
  return total + (price * quantity);
}, 0);

       
const quantity = cartItems.reduce((total, item) => {
  const qty = parseInt(item.quantity, 10) || 0;
  return total + qty;
}, 0);


      setSubtotal(subtotal);
      setTotalQuantity(quantity);
      setGrandTotal(subtotal + deliveryCharge);
      console.log('Subtotal:', subtotal); // Log subtotal here
   
    };

    calculateTotals();
  }, [cartItems]);

  const handleDeleteItem = async (index) => {
    const updatedItems = [...cartItems];
    updatedItems.splice(index, 1);
    setCartItems(updatedItems);

    const key = `cart_${user.uid}`;
    await AsyncStorage.setItem(key, JSON.stringify(updatedItems));
  };

 
  const handlePayNow = async () => {
    if (!shippingAddress) {
      Alert.alert('Error', 'Please fill in the required shipping address field.');
      return;
    }
  
    if (!paymentMethod || paymentMethod === 'No payment method selected') {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }
  
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }
  
    // 🔁 REDIRECT TO FLUTTERWAVE PAYMENT SCREEN
    if (paymentMethod.toLowerCase() === 'card' && paymentStatus === 'Paid') {
      router.push('/successconfirmorder');
      return;
    }

    try {
      const paymentReceived = paymentMethod.toLowerCase() === 'cod' ? false : true;

      const orderRef = await addDoc(collection(db, 'orders'), {

        userId: user.uid,
        cartItems,
        address: shippingAddress,
        subtotal,
        deliveryCharge,
        grandTotal,
        paymentMethod,
        paymentReceived,
        status: 'Pending',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        trackingInfo: {
          currentStatus: 'Pending',
          trackingNumber: '',
          carrier: '',
        },
      });
  
      Alert.alert('Success', 'Order placed successfully!');
      router.push({ pathname: '/successconfirmorder', params: { orderId: orderRef.id } });
    } catch (error) {
      console.log('Error saving order: ', error);
      Alert.alert('Error', 'Failed to place order.');
    }
  };
  
  
// Disable button if address or payment method is not set
const isProceedDisabled =
  !shippingAddress || !paymentMethod || paymentMethod === 'No payment method selected';
  useEffect(() => {
    const fetchPaymentMethodFromFirebase = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPaymentMethod(data.paymentMethod || "No payment method selected");
        }
      }
    };

    fetchPaymentMethodFromFirebase();
    loadAddress();
  }, []);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/mycart')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Shipping Address */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TouchableOpacity onPress={() => router.push('/setaddress')}>
            <Feather name="edit-2" size={16} color="#4C7339" />
          </TouchableOpacity>
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{shippingAddress}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
  <TouchableOpacity

onPress={async () => {
  const next = !useDefaultAddress;
  setUseDefaultAddress(next);

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();

        const defaultAddr = data?.default?.address || "";
        const shippingAddr = data?.shippingAddress?.formattedAddress || "";

        setDefaultAddress(defaultAddr);
        setManualAddress(shippingAddr);

        setShippingAddress(next ? defaultAddr : shippingAddr);
      }
    } catch (error) {
      console.error("Error updating shipping address:", error);
    }
  }
}}

    style={{
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: '#4C7339',
      backgroundColor: useDefaultAddress ? '#4C7339' : '#fff',
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {useDefaultAddress && (
      <Ionicons name="checkmark" size={14} color="#fff" />
    )}
  </TouchableOpacity>
  <Text style={{ fontSize: 14, color: '#333' }}>Use default address</Text>
</View>

<View style={styles.section}>
  <View style={styles.sectionRow}>
    <Text style={styles.sectionTitle}>Order Summary</Text>
    <TouchableOpacity onPress={() => router.push('/mycart')}>
      <Text style={styles.editText}>Edit</Text>
    </TouchableOpacity>
  </View>
  {cartItems.length === 0 ? (
  <Text>No items in the cart</Text>
) : (
  cartItems.map((item, index) => (
    <View key={index} style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.imagePlaceholder} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemInfo}>Today, {new Date().toLocaleTimeString()}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(2)}</Text>
          <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteItem(index)}>
        <MaterialIcons name="delete-outline" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  ))
)}
</View>


        {/* Payment Method */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/editpayment', params: { total: grandTotal.toFixed(2) } })}>
        

            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {paymentMethod && (
  <View style={styles.addressContainer}>
    <Text
      style={[
        styles.addressText,
        {
          color:
            paymentMethod.toLowerCase() === 'card'
              ? 'green'
              : 'red',
          fontWeight: 'bold',
        },
      ]}
    >
      Payment Status:{' '}
      {paymentStatus === 'Paid' ? 'Paid' : 'Pending'}

    </Text>
  </View>
)}

       
        {/* Totals */}
        <View style={styles.totalRow}>
  <Text style={styles.totalLabel}>Total Quantity</Text>
  <Text style={styles.totalValue}>{totalQuantity}</Text>
</View>

<View style={styles.totalRow}>
  <Text style={styles.totalLabel}>Subtotal</Text>
  <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
</View>

<View style={styles.totalRow}>
  <Text style={styles.totalLabel}>Delivery Charge</Text>
  <Text style={styles.totalValue}>₹{deliveryCharge.toFixed(2)}</Text>
</View>

<View style={[styles.totalRow, { marginTop: 5, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 }]}>
  <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Grand Total</Text>
  <Text style={[styles.totalValue, { fontWeight: 'bold' }]}>₹{grandTotal.toFixed(2)}</Text>
</View>

        {/* Pay Now Button */}
        <View style={styles.buttonContainer}>
        <TouchableOpacity
  style={[
    styles.payNowBtn,
    isProceedDisabled ? styles.disabledBtn : null, // apply disabled style if needed
  ]}
  onPress={handlePayNow}
  disabled={isProceedDisabled}
>
  <Text style={styles.payNowText}>Confirm to Proceed</Text>
</TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentScreen;

// Styles (same as you gave, no changes)
const styles = StyleSheet.create({
  // ... styles are same as yours
  container: { flex: 1, backgroundColor: '#FFFFF0' },
  header: { backgroundColor: '#4C7339', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 16, top: 50 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 6 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  addressContainer: { backgroundColor: '#B6D1A8', borderRadius: 25, padding: 12, paddingHorizontal: 18 ,borderWidth: 1, borderColor: "#2D4223" },
  addressText: { fontSize: 14, color: '#333' },
  editText: { fontSize: 13, color: '#4C7339', textDecorationLine: 'underline' },
  section: { marginTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', marginTop: 15, borderBottomWidth: 1, borderBottomColor: '#B6D1A8', paddingBottom: 15 },
  imagePlaceholder: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#D9D9D9' },
  itemName: { fontSize: 14, fontWeight: 'bold' },
  itemInfo: { fontSize: 12, color: '#555' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  quantityText: { fontSize: 12, color: '#555' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  totalLabel: { fontSize: 14, color: '#333' },
  totalValue: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  buttonContainer: { marginTop: 25, alignItems: 'center' },
  payNowBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, backgroundColor: '#4C7339',borderWidth: 1,
    borderColor: "#2D4223"},
  payNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
