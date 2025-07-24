import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import { doc, setDoc } from "firebase/firestore"; // Import Firebase functions
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { auth, db } from '../firebase.Config';

const SetAddress = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const regionData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(regionData);
      setLocation(regionData);

      const addr = await Location.reverseGeocodeAsync(loc.coords);
      if (addr.length > 0) setAddress(addr[0]);
      setLoading(false);
    })();
  }, []);

  const onRegionChangeComplete = async (newRegion) => {
    setLocation(newRegion);
    const addr = await Location.reverseGeocodeAsync({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
    if (addr.length > 0) setAddress(addr[0]);
  };

  const confirmAddress = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        shippingAddress: address, // Save the address to the user's document
      }, { merge: true });

      router.push('/Confirmorder');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {location && <Marker coordinate={location} />}
      </MapView>

      <View style={styles.addressBox}>
        <Text style={styles.addressText}>
          {address
            ? `${address.name}, ${address.street}, ${address.city}, ${address.region}`
            : "Fetching address..."}
        </Text>
        <Button title="Confirm Address" onPress={confirmAddress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addressBox: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  addressText: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default SetAddress;
