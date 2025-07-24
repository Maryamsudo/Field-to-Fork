import { Feather, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Rating } from 'react-native-ratings';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../firebase.Config';

import { db } from "../firebase.Config";

const { width } = Dimensions.get("window");

const ProductDetails = () => {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const [productRating, setProductRating] = useState(item.rating || 0);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // To check buyer/seller
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  
  const fetchUserType = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const type = userDoc.data().userType || userDoc.data().usertype; // supports both spellings
        setUserType(type?.toLowerCase()); // Normalize to lowercase
      }
    } catch (error) {
      console.error("Error fetching user type:", error);
    }
  };
  
  
  useEffect(() => {
    fetchUserType();
    const fetchSellerInfo = async () => {
      try {
        const docRef = doc(db, "users", item.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSellerInfo(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching seller info:", error);
      }
    };
   
    const fetchRelatedProducts = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", item.category));
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== item.id) {
            products.push({ id: doc.id, ...doc.data() });
          }
        });
        setRelatedProducts(products);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
    fetchRelatedProducts();
  }, []);

  const handleAddToCart = async () => {
    try {
      if (userType !== "buyer") {
        alert("Only buyers can add products to the cart.");
        return;
      }
  
      const cartData = await AsyncStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : [];
  
      const alreadyExists = cart.some(cartItem => cartItem.id === item.id);
      if (alreadyExists) {
        alert("Product already in the cart.");
        return;
      }
  
      cart.push(item);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart.");
    }
  };
  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "products", item.id, "reviews"));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = [];
      for (const docSnap of querySnapshot.docs) {
        fetchedReviews.push({ id: docSnap.id, ...docSnap.data() });
      }
      setReviews(fetchedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };
  
  const submitReview = async () => {
    if (!user) return alert("Please log in first.");
    if (!newRating || !newComment) return alert("Please complete the review.");
  
    try {
      const reviewRef = doc(db, "products", item.id, "reviews", user.uid);
      await setDoc(reviewRef, {
        uid: user.uid,
        username: user.displayName || "Anonymous",
        rating: newRating,
        comment: newComment,
        timestamp: new Date(),
      });
  
      // Recalculate average rating
      const updatedReviews = [...reviews, { rating: newRating }];
      const total = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = total / updatedReviews.length;
  
      await updateDoc(doc(db, "products", item.id), {
        rating: avg,
        ratingCount: updatedReviews.length,
      });
  
      setNewRating(0);
      setNewComment("");
      fetchReviews(); // refresh
      alert("Thanks for your review!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Error while submitting.");
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFF0"}}>
 
      {/* Updated Header */}
      <View style={{
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#4C7339",
  paddingVertical: 15,
  paddingHorizontal: 10,
}}>
    <TouchableOpacity
    onPress={() => {
      console.log("Back pressed!");
      router.back();
    }}
    style={{ backgroundColor: '#4C7339', padding: 5 }}
  >
        <Feather name="arrow-left" size={26} color="#fff" />
  </TouchableOpacity>
  <Text style={{
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: -26 // to compensate the back icon space and keep it centered
  }}>
    Product Description
  </Text>
</View>


      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 + insets.bottom}}>
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: width - 40,
            height: width - 40,
            borderRadius: 15,
            resizeMode: "cover",
            alignSelf: "center",
          }}
        />

        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", flex: 1 }}>{item.name}</Text>
            <Text style={{ fontSize: 20, color: "#666" }}>₹ {item.price}</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 16, color: "#666" }}>📍 {item.location}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="star" size={16} color="#FFD700" />
              <Text style={{ fontSize: 16, marginLeft: 5 }}>
                {item.rating !== undefined ? item.rating.toFixed(1) : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 16, color: "#333", marginTop: 20 }}>{item.description}</Text>

        {/* Only buyers see rating section */}
     

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
          {loading ? (
            <ActivityIndicator size="small" color="#016A34" />
          ) : sellerInfo ? (
            <>
              <Image
                source={{ uri: sellerInfo.profileImage }}
                style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{sellerInfo.username}</Text>
            </>
          ) : (
            <Text style={{ fontSize: 16, color: "#666" }}>Seller info not found</Text>
          )}
        </View>

        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 30 }}>Related Products</Text>
        {relatedProducts.length > 0 ? (
          <FlatList
            data={relatedProducts}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
            renderItem={({ item: related }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/product",
                    params: { product: JSON.stringify(related) },
                  })
                }
                style={{
                  marginRight: 15,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  padding: 10,
                  width: width * 0.45,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5,
                  backgroundColor: "#fff",
                  alignSelf: "center",
                  justifyContent: "space-between"
                }}
              >
                <Image
                  source={{ uri: related.imageUrl }}
                  style={{ width: "100%", height: 100, borderRadius: 10 }}
                />
                <Text style={{ fontWeight: "bold", marginTop: 5 }}>{related.name}</Text>
                <Text style={{ color: "#666" }}>{related.price}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          !loading && <Text style={{ marginTop: 10, color: "#666" }}>No related products found.</Text>
        )}


<View style={{ marginTop: 40 }}>
  <Text style={{ fontSize: 20, fontWeight: "bold" }}>Rate & Reviews</Text>

  {/* Average Rating */}
  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
    <FontAwesome name="star" size={18} color="#FFD700" />
    <Text style={{ marginLeft: 8, fontSize: 16 }}>
      {item.rating ? `${item.rating.toFixed(1)} out of 5` : "No rating yet"}
    </Text>
  </View>

  {/* Reviews List */}
  {reviews.map((review, index) => (
    <View key={index} style={{ marginBottom: 15, borderBottomWidth: 0.5, borderColor: '#ccc', paddingBottom: 10 }}>
     
     
    </View>
  ))}

  {/* Add Review Form */}
  {userType === "buyer" && (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>Write a Review</Text>
      <Rating
        type="star"
        ratingCount={5}
        imageSize={30}
        startingValue={newRating}
        onFinishRating={setNewRating}
        style={{ paddingVertical: 10 }}
      />
      <TextInput
        placeholder="Write your feedback..."
        value={newComment}
        onChangeText={setNewComment}
        multiline
        style={{ backgroundColor: "#fff", borderRadius: 8, padding: 10, height: 80 }}
      />
      <TouchableOpacity
        onPress={submitReview}
        style={{ backgroundColor: "#4C7339", padding: 12, borderRadius: 8, marginTop: 10 }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Submit Review</Text>
      </TouchableOpacity>
    </View>

  )}
</View>
{/* List of Reviews */}
<View style={{ marginTop: 20 }}>
  {reviews.length === 0 ? (
    <Text style={{ color: "#666" }}>No reviews yet.</Text>
  ) : (
    reviews.map((review) => (
      <View
        key={review.id}
        style={{
          backgroundColor: "#f2f2f2",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FontAwesome name="user-circle" size={20} color="#333" />
          <Text style={{ fontWeight: "bold", marginLeft: 8 }}>{review.username}</Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 5 }}>
          {[...Array(5)].map((_, index) => (
            <FontAwesome
              key={index}
              name={index < review.rating ? "star" : "star-o"}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>

        <Text style={{ marginTop: 5 }}>{review.comment}</Text>
        <Text style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
          {review.timestamp?.toDate?.().toLocaleString?.() ?? ""}
        </Text>
      </View>
    ))
  )}
</View>

      </ScrollView>

      {/* Add to Cart & Chat Buttons */}
      <View style={{
        position: "absolute",
        bottom: insets.bottom,
        width: "100%",
        flexDirection: "row",
        backgroundColor: "#FFFFF0",
        padding: 15,
        paddingVertical: 10,
      }}>
        <TouchableOpacity
          onPress={userType === "buyer" ? handleAddToCart : () => alert("Only buyers can add products to cart.")}
          style={{
            backgroundColor: "#4C7339",
            flex: 1,
            marginRight: 10,
            padding: 15,
            borderRadius: 30,
            alignItems: "center",
            borderWidth: 1, // Border thickness
            borderColor: "#2D4223", // Border color
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
  onPress={() => {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      alert("Please log in to start a chat.");
      return;
    }

    // Only allow if current user is the uploader or a buyer
    if (currentUserId === item.uid || userType === "buyer") {
      router.push({
        pathname: '/chat',
        params: {
          sellerId: item.uid,
          productId: item.id,
          productName: item.name,
          buyerId: currentUserId
        }
      });
    } else {
      alert("Only buyers or the product uploader can initiate chat.");
    }
  }}
  style={{
    backgroundColor: "#71A757",
    flex: 1,
    marginLeft: 10,
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#2D4223",
    alignItems: "center",
  }}
>
  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Chat</Text>
</TouchableOpacity>

      </View>
   
      </SafeAreaView>
  );
};

export default ProductDetails;
