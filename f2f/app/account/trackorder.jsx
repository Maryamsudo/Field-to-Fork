import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.Config';
import { Ionicons } from '@expo/vector-icons'; // for icons

const STATUS_STEPS = ['Accepted', 'Packed', 'Out for Delivery', 'Delivered'];

const TrackOrderScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTypeAndOrder = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().userType);
        }

        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order or user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTypeAndOrder();
  }, [orderId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Order not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentStatus = order.status || 'Order Placed';
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Track Your Order</Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Order ID:</Text>
          <Text>{orderId}</Text>
        </View>

        {/* Vertical Stepper */}
        <View style={styles.stepperContainer}>
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentIndex;
            return (
              <View key={index} style={styles.stepRow}>
                {/* Left side - icon and line */}
                <View style={styles.stepIconContainer}>
                  <View style={[styles.stepIcon, isActive ? styles.activeStep : styles.inactiveStep]}>
                    {isActive ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>
                  {index !== STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, isActive ? styles.activeLine : styles.inactiveLine]} />
                  )}
                </View>

                {/* Right side - label */}
                <View style={styles.stepTextContainer}>
                  <Text style={[styles.stepLabel, isActive ? styles.activeText : styles.inactiveText]}>
                    {step}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {userType === 'Seller' && (
          <Text style={styles.sellerNote}>
            Seller view: You can update status from Orders screen.
          </Text>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Orders</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#4C7339',
  },
  infoBox: {
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  stepperContainer: {
    marginVertical: 30,
    paddingHorizontal: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    alignItems: 'center',
    width: 40,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  activeStep: {
    backgroundColor: '#4C7339',
  },
  inactiveStep: {
    backgroundColor: '#ccc',
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepLine: {
    width: 2,
    height: 40,
    marginTop: 2,
  },
  activeLine: {
    backgroundColor: '#4C7339',
  },
  inactiveLine: {
    backgroundColor: '#ccc',
  },
  stepTextContainer: {
    marginLeft: 10,
    marginTop: -2,
  },
  stepLabel: {
    fontSize: 16,
    marginBottom: 20,
  },
  activeText: {
    color: '#4C7339',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#999',
  },
  sellerNote: {
    marginTop: 10,
    color: '#4C7339',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#4C7339',
    padding: 12,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  message: {
    marginTop: 50,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default TrackOrderScreen;
