import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase.Config'; // adjust path if needed
const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  
  const currentUser = auth.currentUser;
  const markNotificationsAsRead = () => {
    useEffect(() => {
      markNotificationsAsRead();
    }, []);
    
  };
  
  
  
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
  
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  };
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const renderRightActions = (progress, dragX, id) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={() => handleDelete(id)} style={styles.deleteButton}>
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          Delete
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const createdAt = item.createdAt?.toDate?.(); 
    const timeAgo = createdAt ? formatTimeAgo(createdAt) : '';
  
    return (
      <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}>
        <TouchableOpacity
  onPress={() => {
    markAsRead(item.id);
    if (item.type === 'message') {
      router.push({
        pathname: '/chat',
        params: {
          sellerId: item.senderId,
          productId: item.productId,
        },
      });
    }
  }}
>
          <View style={[styles.notification, !item.read && styles.unreadNotification]}>
            <Text style={styles.title}>
              {item.senderName || 'Someone'} · <Text style={styles.time}>{timeAgo}</Text>
            </Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#016A34" />
        </TouchableOpacity>
        <Text style={styles.heading}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="bounceIn" iterationCount="infinite" duration={2000}>
            <Feather name="bell" size={64} color="#CCCCCC" />
          </Animatable.View>
          <Text style={styles.noNotifications}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 10 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF0',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#016A34',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noNotifications: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
  notification: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  description: {
    color: '#555',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 15,
    borderRadius: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
   unreadNotification: {
    backgroundColor: '#e6f7e6', // light green tint or any highlight color
  },
});

export default NotificationsScreen;
