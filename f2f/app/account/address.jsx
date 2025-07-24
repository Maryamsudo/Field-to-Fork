import { AntDesign, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from "../../firebase.Config";
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'; // Import GestureHandlerRootView and Swipeable
import { db } from "../../firebase.Config";

const { width, height } = Dimensions.get('window');

export default function DeliveryAddressManager() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [screen, setScreen] = useState('list'); // 'list' or 'add'
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const fetchDefaultAddress = async () => {
    try {
     
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.default) {
            const defaultAddr = data.default;
            setAddresses([
              {
                id: defaultAddr.id,
                name: defaultAddr.name,
                address: defaultAddr.address,
              },
            ]);
            setSelectedAddress(defaultAddr.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch default address:', error);
    }
  };
  

  const handleAdd = () => {
    if (name.trim() && address.trim()) {
      const newEntry = {
        id: Date.now().toString(),
        name,
        address,
      };
      const updatedAddresses = [...addresses, newEntry];
      setAddresses(updatedAddresses);
      setSelectedAddress(newEntry.id);
      saveDefaultAddress(newEntry); // <-- Save new as default
      setName('');
      setAddress('');
      setScreen('list');
    }
  };

  const renderAddressItem = ({ item }) => {
    const handleDelete = async () => {
      try {
        
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            address: {
              default: null, // Clear default if this was the selected one
            },
          });

          // Remove address from local state
          setAddresses((prevAddresses) =>
            prevAddresses.filter((address) => address.id !== item.id)
          );
        }
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    };

    const renderLeftActions = () => (
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <AntDesign name="delete" size={width * 0.06} color="#fff" />
      </TouchableOpacity>
    );

    return (
      <Swipeable renderLeftActions={renderLeftActions}>
        <TouchableOpacity
          style={styles.addressItem}
          onPress={() => {
            setSelectedAddress(item.id);
            saveDefaultAddress(item);
          }}
        >
          <View style={styles.iconWithText}>
            <Entypo name="home" size={width * 0.06} color="#7BAF66" style={{ marginRight: 10 }} />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
          </View>
          <View style={styles.circle}>
            {selectedAddress === item.id && <View style={styles.selectedDot} />}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const saveDefaultAddress = async (addressObj) => {
    try {
    
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            default: addressObj,
          },
          { merge: true }
        );
        
      }
    } catch (error) {
      console.error('Failed to save default address:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (screen === 'add') {
              setScreen('list');
            } else {
              router.back(); // goes back to previous screen
            }
          }}
        >
          <AntDesign name="arrowleft" size={width * 0.06} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {screen === 'list' ? 'Delivery Address' : 'Add New Address'}
        </Text>
      </View>

      {screen === 'list' ? (
        <View style={styles.innerContainer}>
          {addresses.length > 0 ? (
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={renderAddressItem}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          ) : (
            <Text style={styles.noAddressText}>No saved addresses yet.</Text>
          )}

          <TouchableOpacity style={styles.addNewBtn} onPress={() => setScreen('add')}>
            <AntDesign name="pluscircle" size={width * 0.05} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { height: height * 0.15 }]}
            placeholder="Delivery Address"
            value={address}
            onChangeText={setAddress}
            multiline
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF0',
  },
  header: {
    backgroundColor: '#4C7339',
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginRight: 24,
  },
  backButton: {
    position: 'absolute',
    left: width * 0.05,
    zIndex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: width * 0.05,
  },
  addressItem: {
    backgroundColor: '#fff',
    padding: width * 0.04,
    marginBottom: height * 0.02,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.2,
    height: height * 0.1,
    borderRadius: 10,
  },
  nameText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addressText: {
    fontSize: width * 0.04,
    color: '#555',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  circle: {
    width: width * 0.05,
    height: width * 0.05,
    borderRadius: width * 0.025,
    borderWidth: 2,
    borderColor: '#4C7339',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: width * 0.025,
    height: width * 0.025,
    backgroundColor: '#4C7339',
    borderRadius: width * 0.0125,
  },
  addNewBtn: {
    flexDirection: 'row',
    backgroundColor: '#4C7339',
    borderRadius: 10,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    borderWidth: 2, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  addNewText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: width * 0.05,
    
  },
  input: {
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: height * 0.025,
    fontSize: width * 0.04,
    borderWidth: 0.5, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  addBtn: {
    backgroundColor: '#4C7339',
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1, // Border thickness
    borderColor: "#2D4223", // Border color
  },
  addBtnText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  noAddressText: {
    fontSize: width * 0.045,
    color: '#666',
    textAlign: 'center',
    marginTop: height * 0.05,
  },
});
