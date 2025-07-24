import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AddNewCard = () => {
  const router = useRouter();
  const [selectedCardType, setSelectedCardType] = useState('Visa');

  const cardTypes = ['Visa', 'MasterCard', 'Debit/Credit'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card Type */}
        <Text style={styles.sectionTitle}>Card Type</Text>
        {cardTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioRow}
            onPress={() => setSelectedCardType(type)}
          >
            <View style={styles.radioOuter}>
              {selectedCardType === type && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>{type}</Text>
          </TouchableOpacity>
        ))}

        {/* Card Holder Name */}
        <Text style={styles.sectionTitle}>Card Holder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter card holder name"
          placeholderTextColor="#aaa"
        />

        {/* Card Number */}
        <Text style={styles.sectionTitle}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter card number"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        {/* CVV & Expiry Date */}
        <View style={styles.row}>
          <View style={styles.halfContainer}>
            <Text style={styles.smallLabel}>CVV</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="CVV"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfContainer}>
            <Text style={styles.smallLabel}>Expiry Date</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="MM/YY"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        {/* Save Card Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddNewCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCE3',
  },
  header: {
    backgroundColor: '#4C7339',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 6,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4C7339',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4C7339',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  halfContainer: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  smallInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4C7339',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    alignSelf: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});