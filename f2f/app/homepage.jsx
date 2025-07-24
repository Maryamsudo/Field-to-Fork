import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../firebase.Config'; // adjust path if needed
const { width } = Dimensions.get("window");
//banenrs handle here
const banners = [
  require("../assets/images/banner.png"),
  require("../assets/images/banner2.png"),
  require("../assets/images/banner5.png"),
];
// Categories list
const categories = [
  { id: 1, name: "Fruits", image: require("../assets/images/fruits.png") },
  { id: 2, name: "Rice", image: require("../assets/images/rice.png") },
  { id: 3, name: "Herbs", image: require("../assets/images/herbs.png") },
  { id: 4, name: "Crops", image: require("../assets/images/crops.png") }, // New category
  { id: 5, name: "Vegetables", image: require("../assets/images/vegetables.png") }, // New category
  { id: 6, name: "Spices", image: require("../assets/images/spices.png") }, // New category
];
const HomeScreen = () => {
  const router = useRouter(); // 👈 Expo Router
  const insets = useSafeAreaInsets();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Discover");
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Fruits"); // Default category
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerRef = useRef(null);
  const [userType, setUserType] = useState(null); // to store user type (seller/buyer)
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);
  const [products, setProducts] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);


//search data
useEffect(() => {
  const fetchSearchHistory = async () => {
    const history = await AsyncStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };
  fetchSearchHistory();
}, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (querySnapshot) => {
      const productsArray = [];
      querySnapshot.forEach((doc) => {
        productsArray.push({ id: doc.id, ...doc.data() });
      });
      // Group products by category
      const grouped = {};
      productsArray.forEach((product) => {
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        grouped[product.category].push(product);
      });
      setProducts(grouped); // Update state with grouped products
    });
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      bannerRef.current?.scrollToOffset({ offset: (bannerIndex + 1) % banners.length * width, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerIndex]);
  //search data
  // Search handler
const handleSearch = async () => {
  const term = searchText.trim().toLowerCase();
  if (!term) return;
  let allProducts = [];
  Object.values(products).forEach((items) => {
    allProducts = [...allProducts, ...items];
  });
  const results = allProducts.filter((item) =>
    item.name.toLowerCase().includes(term)
  );

  setSearchResults(results);
  setFilteredSuggestions([]);
  // Update and store search history
  let updatedHistory = [...new Set([term, ...searchHistory])];
  setSearchHistory(updatedHistory);
  await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  // ✅ Clear only input text (results stay)
  setSearchText('');
};

// Suggestion click handler
const handleSuggestionClick = async (suggestion) => {
  setSearchResults([suggestion]);
  setFilteredSuggestions([]);
  const term = suggestion.name.toLowerCase();
  let updatedHistory = [...new Set([term, ...searchHistory])];
  setSearchHistory(updatedHistory);
  await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  // ✅ Clear only input text
  setSearchText('');
};
// Updated useEffect (fixed)
useEffect(() => {
  const term = searchText.trim().toLowerCase();
  if (!term) {
    setFilteredSuggestions([]);
    return; // ✅ Do NOT clear searchResults
  }
  let allProducts = [];
  Object.entries(products).forEach(([category, items]) => {
    allProducts = [...allProducts, ...items];
  });
  const matchingCategory = Object.keys(products).find(cat =>
    cat.toLowerCase().includes(term)
  );
  const matchedByName = allProducts.filter((item) =>
    item.name.toLowerCase().includes(term)
  );
  let suggestions = matchedByName;
  if (matchingCategory) {
    suggestions = [...suggestions, ...products[matchingCategory]];
  }
  const uniqueSuggestions = Array.from(new Set(suggestions.map(p => p.id)))
    .map(id => suggestions.find(p => p.id === id));
  setFilteredSuggestions(uniqueSuggestions);
}, [searchText]);
 // we do it undo 
 useEffect(() => {
  const fetchUserRoleFromFirestore = async () => {
    try {
     // const user = auth.currentUser;
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserType(userData.userType || "Buyer"); // 'Seller' or 'Buyer'
        } else {
          console.log("No such user document!");
          setUserType("Buyer");
        }
      } else {
        console.log("No user is logged in");
        setUserType("Buyer");
      }
    } catch (error) {
      console.error("Error fetching user role from Firestore:", error);
      setUserType("Buyer");
    } finally {
      setIsLoadingUserType(false);
    }
  };
  fetchUserRoleFromFirestore();
}, []);
//nw item delete 
useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;
  const q = query(
    collection(db, "notifications"),
    where('recipientId', '==', auth.currentUser.uid), // ✅ adjust field name
    where("read", "==", false)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setNotificationCount(snapshot.size); // ✅ set count instead of boolean
  });

  return () => unsubscribe();
}, []);

//favorite system handles here
const handleFavorite = async (item) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("User not logged in");
      return;
    }
    const key = `favorites_${user.uid}`;
    const existing = await AsyncStorage.getItem(key);
    let favorites = existing ? JSON.parse(existing) : [];
    const isAlreadyFav = favorites.some(fav => fav.id === item.id);
    if (!isAlreadyFav) {
      const updatedFavorites = [...favorites, item];
      await AsyncStorage.setItem(key, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    }
  } catch (error) {
    console.error('Error saving favorite:', error);
  }
};
const toggleFavorite = async (product) => {
  if (userType !== "Buyer") {
    alert("Only buyers can add items to favorites.");
    return;
  }
  try {
    const user = auth.currentUser;
    if (!user) return;
    const key = `favorites_${user.uid}`;
    const existing = await AsyncStorage.getItem(key);
    let favs = existing ? JSON.parse(existing) : [];
    const exists = favs.find(fav => fav.id === product.id);
    let updated;
    if (exists) {
      updated = favs.filter(fav => fav.id !== product.id);
    } else {
      updated = [...favs, product];
    }
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    setFavorites(updated);
  } catch (error) {
    console.error("Error updating favorites:", error);
  }
};
//Handle Cart Data here
const [cartItems, setCartItems] = useState([]);
const handleAddToCart = async (product) => {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add items to the cart.");
    return;
  }
  if (userType !== "Buyer") {
    alert("Only buyers can add items to the cart.");
    return;
  }
  try {
    const key = `cart_${user.uid}`;
    const existingCart = await AsyncStorage.getItem(key);
    let cart = existingCart ? JSON.parse(existingCart) : [];
    const index = cart.findIndex(item => item.id === product.id);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    await AsyncStorage.setItem(key, JSON.stringify(cart));
    setCartItems(cart); // update local state
    alert("Added to cart!");
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};
 return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
        <FlatList
        data={searchResults.length > 0 ? searchResults : products[selectedCategory] || []}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 20 }}
        contentContainerStyle={{
        paddingBottom: insets.bottom + 120, // ✅ Prevent hidden footer under nav bar
      }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#016A34" }}>FieldToFork</Text>
                <View style={{ flexDirection: "row", gap: 15 }}>
                  {/* Weather icon */}
                  <TouchableOpacity
      style={{ marginRight: 4 }}
      onPress={() => router.push("/weather")}
    >
      <View style={{ position: 'relative', width: 30, height: 30 }}>
        {/* Sun (bottom layer) */}
        <Feather name="sun"
          size={24}
          color="orange"
          style={{ position: 'absolute', top: -6, left: 6 }}
        />
        {/* Cloud (top layer) */}
        <MaterialCommunityIcons
          name="weather-cloudy"
          size={30}
          color="skyblue"
          style={{ position: 'absolute', top: -2, left: 3 }}  />
      </View>
    </TouchableOpacity>
                <TouchableOpacity onPress={() => {if (userType === "Buyer") { router.push("/mycart"); } else {
                 Alert.alert("Access Denied", "Only buyers can add products into cart."); }}}>
                    <Feather name="shopping-cart" size={24} color="#016A34" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.push('/notification')}>
  <View style={{ position: 'relative' }}>
  <Ionicons name="notifications-outline" size={28} color="black" />
  {notificationCount > 0 && (
    <View
      style={{
        position: 'absolute',
        right: -4,
        top: -4,
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        {notificationCount}
      </Text>
    </View>
  )}
</View>

</TouchableOpacity>
 </View>
</View>
 <View style={{ marginHorizontal: 20 }}>
  {/* Search bar */}
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={{
      flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 30,
      flex: 1,
      padding: 4,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#607953"}}>
  <TextInput
        placeholder="Search.."
        style={{ flex: 1, marginLeft: 10 }}
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"/>
    </View>
    <TouchableOpacity
      onPress={handleSearch}
      style={{
        backgroundColor: "#EAF8E6",
        width: 45,
        height: 45,
        borderRadius: 50,
        borderColor:"#2D4223",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10
      }} >
      <Feather name="search" size={22} color="#2D4223" />
    </TouchableOpacity>
  </View>
  {/* Suggestions dropdown */}
  {filteredSuggestions.length > 0 && (
    <View style={{
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      marginTop: 5,
      maxHeight: 180,
      overflow: "scroll",
      elevation: 5,
      zIndex: 999
    }}>
      {filteredSuggestions.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => handleSuggestionClick(item)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#eee"
          }} >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>)}
</View>
         {/* Banner Slider */}
              <FlatList
                ref={bannerRef}
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                onScroll={Animated.event([
                  { nativeEvent: { contentOffset: { x: scrollX } } }
                ], { useNativeDriver: false })}
                renderItem={({ item }) => (
                  <Image source={item} style={{ width: width - 40, height: 180, resizeMode: "cover", borderRadius: 10, margin: 20 }} />
                )}/>
              {/* Dots */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                {banners.map((_, i) => (
                  <View key={i} style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: i === bannerIndex ? "#016A34" : "#ccc",
                  marginHorizontal: 5
                  }} />))}
              </View>
              {/* Categories */}
              <Text style={{ fontSize: 18, fontWeight: "bold", marginHorizontal: 20, marginTop: 20 }}>Categories</Text>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 20, marginTop: 9 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      marginRight: 15,
                      backgroundColor: selectedCategory === item.name ? "#E0F7FA" : "#EAF8E6",
                      padding: 10,
                      borderRadius: 50
                    }}
                    onPress={() => {
                      setSelectedCategory(item.name);
                      setSearchResults([]); // ✅ clear search when selecting a category
                    }}
                  >
                    <Image source={item.image} style={{ width: 60, height: 60, borderRadius: 30 }} />
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>}
          renderItem={({ item }) => {
            const isFav = favorites.some((fav) => fav.id === item.id);
            return (
              <View style={{ flex: 1, marginHorizontal: 5 }}>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/product", params: { product: JSON.stringify(item) } })}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 15,
                    padding: 10,
                    marginTop: 15,
                    minHeight: 290,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                    justifyContent: "space-between"
                  }} >
                  <TouchableOpacity
                    onPress={() => 
                      toggleFavorite(item)}
                      disabled={userType !== "Buyer"}
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 15,
                      zIndex: 2,
                      backgroundColor: "#fff",
                      borderRadius: 20,
                      padding: 5,
                      elevation: 3
                    }}  >
                    <FontAwesome name="heart" size={20}  color={
      userType === "Buyer" && favorites.some(fav => fav.id === item.id)
        ? "#FF0000"
        : "#999" } />
                  </TouchableOpacity>
                  <Image source={{ uri: item.imageUrl }} style={{ width: "100%", height: 120, borderRadius: 10 }} />
                  <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 5 }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: "#666" }}>{item.price}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                    <FontAwesome name="star" size={14} color="#FFD700" />
                    <Text style={{ fontSize: 14, marginLeft: 4 }}>
                    {item.rating ? item.rating.toFixed(1) : "N/A"}</Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#016A34",
                      paddingVertical: 8,
                      paddingHorizontal: 15,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                      borderWidth: 1, 
                      borderColor: "#2D4223", // Border color
                    }}
                    onPress={() => handleAddToCart(item)}  >
                    <FontAwesome name="shopping-cart" size={16} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 5 }}>Add to Cart</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            );
          }}
        />
        {/* Footer Navigation Bar */}
        <View style={{
          position: "absolute",
          bottom: 25,
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 15,
          backgroundColor: "#FFFFF0",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderColor: "#DDD",
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          zIndex: 10
        }}>
            {[{ name: "Discover", icon: "home" }, { name: "Favorites", icon: "heart" }, { name: "Sell", icon: "camera" }, { name: "Settings", icon: "cog" }].map((tab) => {
    const isActive = activeTab === tab.name;
    const isSell = tab.name === "Sell"; // Ensure userType is loaded before checking
    const isSeller = userType === "Seller" && !isLoadingUserType;
    const isDisabled = isSell && !isSeller;
    return (
      <TouchableOpacity
        key={tab.name}
        onPress={() => {
          if (tab.name === "Settings") {
            router.push("/setting");
          } else if (tab.name === "Favorites") {
            if (userType === "Buyer") {
              router.push({ pathname: "/favorites", params: { favorites: JSON.stringify(favorites) } });
            } else {
              Alert.alert("Access Denied", "Only buyers can access Favorites.");
            }
          } else if (isSell && isSeller) {
            router.push("/sell");
          } else if (!isSell) {
            setActiveTab(tab.name);
          }  }}
        style={{ alignItems: "center", opacity: isDisabled ? 0.5 : 1 }}
        disabled={isDisabled} >
        <Ionicons
          name={tab.icon}
          size={24}
          color={isSell ? (isSeller ? "#016A34" : "#888") : (isActive ? "#016A34" : "#666")}   />
        <Text style={{ fontSize: 12, color: isActive ? "#2D4223" : "#666" }}>{tab.name}</Text>
      </TouchableOpacity>
    );
  })}
</View>
      </SafeAreaView>
    );
};
export default HomeScreen;

