import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase.Config';

const ChatScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerProfilePic, setSellerProfilePic] = useState(null);
  const [buyerProfilePic, setBuyerProfilePic] = useState(null);

  const flatListRef = useRef(null);
  const { sellerId, productId } = useLocalSearchParams();
  const currentUserId = auth.currentUser?.uid;
  //const recipientId = currentUserId === buyerId ? sellerIdFinal : buyerId;
  const generateChatId = (userId1, userId2, productId) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}_${productId}`;
  };
  
  const [chatId, setChatId] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [sellerIdFinal, setSellerIdFinal] = useState(null);

  // Fetch user role and seller info
  useEffect(() => {
    if (!currentUserId || !sellerId || !productId) return;
  
    const fetchUserInfo = async () => {
      const currentUserRef = doc(db, 'users', currentUserId);
      const currentUserSnap = await getDoc(currentUserRef);
  
      if (!currentUserSnap.exists()) return;
  
      const currentUserData = currentUserSnap.data();
      const currentUserRole = currentUserData.userType?.toLowerCase();
      setUserRole(currentUserRole);
  
      let buyer = '';
      let seller = '';
  
      if (currentUserRole === 'buyer') {
        buyer = currentUserId;
        seller = sellerId;
      } else {
        buyer = sellerId;
        seller = currentUserId;
      }
  
      setBuyerId(buyer);
      setSellerIdFinal(seller);
  
      // Always fetch seller info using sellerIdFinal
      const sellerRef = doc(db, 'users', seller);
      const sellerSnap = await getDoc(sellerRef);
  
      if (sellerSnap.exists()) {
        const sellerData = sellerSnap.data();
        setSellerInfo(sellerData);
        setSellerProfilePic(sellerData.profileImage || null);
      }
      const buyerRef = doc(db, 'users', buyer);
      const buyerSnap = await getDoc(buyerRef);
      
      if (buyerSnap.exists()) {
        const buyerData = buyerSnap.data();
        setBuyerProfilePic(buyerData.profileImage || null);
      }
      const generatedChatId = generateChatId(buyer, seller, productId);
      setChatId(generatedChatId);
    };
  
    fetchUserInfo();
  }, [currentUserId, sellerId, productId]);

  // Fetch messages and listen to typing
  useEffect(() => {
    if (!chatId || !buyerId || !sellerIdFinal) return;

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data || !data.senderId || !data.text) return null;
        return {
          id: doc.id,
          ...data,
        };
      })
      .filter(Boolean); // removes null/undefined
      setMessages(msgs);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const lastMessage = lastDoc?.data();
      if (lastMessage?.senderId !== currentUserId && !lastMessage?.seen) {
        const lastMessageRef = doc(db, 'chats', chatId, 'messages', lastDoc.id);
        updateDoc(lastMessageRef, { seen: true });
      }
    });

    const typingRef = doc(db, 'chats', chatId);
    const unsubscribeTyping = onSnapshot(typingRef, (docSnap) => {
      const data = docSnap.data();
      if (data?.typing && data.typing !== currentUserId) {
        setOtherUserTyping(true);
      } else {
        setOtherUserTyping(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [chatId, buyerId, sellerIdFinal]);

  const handleSend = async () => {
    if (newMessage.trim() === '' || !chatId) return;
  
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
  
      const chatData = {
        users: [buyerId, sellerIdFinal],
        productId,
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
        typing: '',
      };
  
      if (!chatDoc.exists()) {
        await setDoc(chatRef, chatData);
      } else {
        await updateDoc(chatRef, {
          lastMessage: newMessage,
          updatedAt: serverTimestamp(),
          typing: '',
        });
      }
  
      // Send the actual message
      await addDoc(collection(chatRef, 'messages'), {
        senderId: currentUserId,
        text: newMessage,
        timestamp: serverTimestamp(),
        seen: false,
      });
      
      // ✅ Create notification document for the recipient (e.g. seller)
      const recipientId = currentUserId === buyerId ? sellerIdFinal : buyerId;
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      const senderName = userDoc.exists() ? userDoc.data().username || 'Someone' : 'Someone';


   await addDoc(collection(db, 'notifications'), {
  title: 'New Message',
  description:`You have a new message: "${newMessage}"`,
  recipientId,
  senderId: currentUserId,
  senderName,
  createdAt: serverTimestamp(),
  chatId,
  productId,
  type: 'message',
  read: false,
});
  
      setNewMessage('');
      setTyping(false);
      await updateDoc(chatRef, { typing: '' });
  
    } catch (error) {
      console.error('Error sending message or creating chat:', error);
    }
  };

  let typingTimeout;
  const handleTyping = (text) => {
    setNewMessage(text);
    if (!typing && text.trim()) {
      setTyping(true);
      updateDoc(doc(db, 'chats', chatId), { typing: currentUserId });
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTyping(false);
      updateDoc(doc(db, 'chats', chatId), { typing: '' });
    }, 2000);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    if (!item || !item.id) return null;
  
    const isCurrentUserMessage = item.senderId === currentUserId;
  
    // Find the index of the last message sent by current user and is seen
    const lastSeenIndex = messages
      .map((msg, i) => (msg.senderId === currentUserId && msg.seen ? i : -1))
      .filter(i => i !== -1)
      .pop();
  
    const showSeenLabel = isCurrentUserMessage && index === lastSeenIndex && item.seen;
  
    const MessageContent = () => (
      <View
        style={[styles.messageRow, item.senderId === buyerId ? styles.buyerRow : styles.sellerRow]}
      >
        {/* Show buyer profile pic on buyer messages */}
        {item.senderId === buyerId && buyerProfilePic && (
          <Image source={{ uri: buyerProfilePic }} style={styles.profilePic} />
        )}
  
        {/* Show seller profile pic on seller messages */}
        {item.senderId !== buyerId && sellerProfilePic && (
          <Image source={{ uri: sellerProfilePic }} style={styles.profilePic} />
        )}
  
        <View
          style={[
            styles.messageBubble,
            item.senderId === buyerId ? styles.buyerBubble : styles.sellerBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.senderId === buyerId ? styles.buyerText : styles.sellerText,
            ]}
          >
            {item.text}
          </Text>
  
          {/* Show Seen below last sent message by current user */}
          {showSeenLabel && (
            <Text style={{ color: '#555', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
              Seen
            </Text>
          )}
        </View>
      </View>
    );
  
    if (isCurrentUserMessage) {
      return (
        <Swipeable
          renderRightActions={() => (
            <TouchableOpacity
              onPress={() => handleDeleteMessage(item.id)}
              style={{
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: '100%',
              }}
            >
              <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        >
          <MessageContent />
        </Swipeable>
      );
    }
  
    return <MessageContent />;
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFF0' }}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
  >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {sellerProfilePic && (
            <Image source={{ uri: sellerProfilePic }} style={styles.sellerImage} />
          )}
          <Text style={styles.headerText}>{sellerInfo?.username || 'Chat'}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        
        keyExtractor={(item, index) => item?.id ? item.id : index.toString()}
        contentContainerStyle={styles.chatBody}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {otherUserTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#666" />
          <Text>Typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          style={styles.input}
        />
      <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
     <Ionicons name="send" size={18} color="#fff" />
    </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
   
</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFF0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4C7339',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  sellerImage: { width: 36, height: 36, borderRadius: 18 },
  chatBody: { padding: 12 },
  messageRow: { flexDirection: 'row', marginVertical: 6, alignItems: 'flex-end' },
  buyerRow: { justifyContent: 'flex-end' },
  sellerRow: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '70%', borderRadius: 8, padding: 10 },
  buyerBubble: { backgroundColor: '#4C7339' ,borderColor: '#2D4223' },
  sellerBubble: { backgroundColor: '#B6D1A8',borderColor: '#4C7339' },
  messageText: { fontSize: 16 },
  buyerText: { color: '#fff' },
  sellerText: { color: '#333' },
  profilePic: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#B6D1A8',
    backgroundColor: '#FFFFF0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#B6D1A8',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2D4223',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 4,
    
  },
  sendButton: {
    backgroundColor: '#4C7339',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D4223',
  },
});

export default ChatScreen;