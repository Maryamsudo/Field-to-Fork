import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../firebase.Config'; // adjust path if needed
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebase.Config'; // adjust path as needed
import { useLocalSearchParams } from 'expo-router';
const EditPaymentMethod = () => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const { total } = useLocalSearchParams();
const pkrAmount = total ? parseFloat(total) : 0;

console.log("Received grandTotal param (from total):", total);
console.log("Parsed amount:", pkrAmount);

  
  const handleProceed = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        paymentMethod: selectedMethod,
      });
  
      // Redirect based on payment method
      if (selectedMethod === 'card') {
        // Go directly to card payment screen
        router.push({
        
          pathname: '/cardpayment',
          params: {
            pkr: pkrAmount.toFixed(2), // 💡 safe now!
          },
        });
      } else {
        router.push('/Confirmorder');
      }
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
  };
  
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Payment Method</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Payment Options */}
        {[
  { key: 'card', label: 'Credit/Debit Card' },
  { key: 'cod', label: 'Cash on Delivery' },
  { key: 'easypaisa', label: 'Easypaisa / JazzCash' },
].map((method) => (
  <TouchableOpacity
    key={method.key}
    style={styles.optionContainer}
    onPress={async () => {
      try {
        setSelectedMethod(method.key); // update selected visually
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { paymentMethod: method.key });

        if (method.key === 'card') {
          router.push({
            pathname: '/cardpayment',
            params: { pkr: pkrAmount.toFixed(2) },
          });
        } else {
          router.push('/Confirmorder');
        }
      } catch (error) {
        console.error("Error selecting payment method:", error);
      }
    }}
  >
    <Text style={styles.optionText}>{method.label}</Text>
    {selectedMethod === method.key && (
      <Ionicons name="checkmark-circle" size={20} color="#4C7339" />
    )}
  </TouchableOpacity>
))}

        {/* Add New Card Button */}
        <View style={styles.addCardContainer}>
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={handleProceed}

          >
            <Text style={styles.addCardText}>Proceed to Order confirmation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditPaymentMethod;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF0',
  },
  header: {
    backgroundColor: '#4C7339',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  optionContainer: {
    backgroundColor: '#B6D1A8',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1, 
    borderColor: "#2D4223"
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  addCardContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  addCardButton: {
    backgroundColor: '#4C7339',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#000',
  },
  addCardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});