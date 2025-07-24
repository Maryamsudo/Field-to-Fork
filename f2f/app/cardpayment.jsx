import React, { useState } from 'react'; 
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.Config';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const router = useRouter();
  const {
    pkr,
    shippingAddress,
    paymentMethod,
    cartItems,
    subtotal,
    deliveryCharge,
  } = useLocalSearchParams();

  const user = auth.currentUser;
  const pkrAmount = parseFloat(pkr);
  const usdAmount = (pkrAmount / 285).toFixed(2);
  const flutterwaveLink = `https://sandbox.flutterwave.com/pay/ldsrzmkyd1gy`;

  const [paymentDone, setPaymentDone] = useState(false);

  const saveOrder = async () => {
    try {
      if (!user) return;

      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        address: shippingAddress,
        paymentMethod,
        paymentReceived: true,
        subtotal: parseFloat(subtotal),
        deliveryCharge: parseFloat(deliveryCharge),
        grandTotal: pkrAmount,
        cartItems: JSON.parse(cartItems),
        status: 'Paid',
        createdAt: serverTimestamp(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        trackingInfo: {
          currentStatus: 'Paid',
          trackingNumber: '',
          carrier: '',
        },
      });

      setPaymentDone(true);
      Alert.alert('Payment Successful', 'You can now go back to confirm order.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save order.');
      console.log('Save Order Error:', error);
    }
  };

  const handleNavigation = ({ url }) => {
    if (url.includes('thank-you') || url.includes('success')) {
      saveOrder();
    } else if (url.includes('cancel')) {
      router.replace('/paymentfailed');
    }
  };

  const goBackToConfirm = () => {
    router.replace({
      pathname: '/Confirmorder',
      params: {
        paymentStatus: paymentDone ? 'Paid' : 'Pending',
        paymentMethod,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToConfirm} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Payment</Text>
      </View>

      <Text style={styles.title}>
        Pay Rs. {pkrAmount} (≈ ${usdAmount} USD)
      </Text>

      <WebView
        source={{ uri: flutterwaveLink }}
        onNavigationStateChange={handleNavigation}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color="green" />}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    backgroundColor: '#4C7339',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  title: { textAlign: 'center', marginVertical: 8, fontSize: 16 },
});
