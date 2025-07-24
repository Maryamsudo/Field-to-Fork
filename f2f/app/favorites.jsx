import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { auth } from '../firebase.Config';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Favorite() {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ✅ Fetch logged-in user ID
  const fetchUserId = () => {
    const user = auth.currentUser
   
    if (user) {
      setUserId(user.uid); // Or use user.email
    }
  };

  const fetchFavorites = async () => {
    try {
      if (!userId) return;
      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const removeFromFavorites = async (itemToRemove) => {
    const updatedFavorites = favorites.filter((item) => item.id !== itemToRemove.id);
    setFavorites(updatedFavorites);
    if (userId) {
      await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserId();
    }, [])
  );

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const renderRightActions = (item) => (
    <TouchableOpacity
      onPress={() => removeFromFavorites(item)}
      style={{
        backgroundColor: '#ff5c5c',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 10,
        marginBottom: 15,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      <StatusBar backgroundColor="#4B783F" barStyle="light-content" />

      {/* Header */}
      <View style={{
        backgroundColor: '#4B783F',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: insets.top + 10,
        paddingBottom: 25,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: '#fff',
          marginRight: 24
        }}>
          Favourite
        </Text>
      </View>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>No favorites added yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              <View style={{
                backgroundColor: '#fff',
                padding: 15,
                marginBottom: 5,
                marginTop: 5,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 0.5,
                borderColor: "#2D4223",
              }}>
                <Image source={{ uri: item.imageUrl }} style={{ width: 60, height: 60, borderRadius: 10, marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ color: '#666' }}>{item.price}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromFavorites(item)} style={{ marginLeft: 10 }}>
                  <FontAwesome name="trash" size={24} color="#ff5c5c" />
                </TouchableOpacity>
              </View>
            </Swipeable>
          )}
        />
      )}
    </View>
  );
}
