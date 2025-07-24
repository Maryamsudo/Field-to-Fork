import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Privacy Policy</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.policyText}>
          This Privacy Policy explains how we collect, use, and protect your information when you use our services. By using our app, you agree to the terms outlined in this policy.
        </Text>

        <Text style={styles.policySectionTitle}>1. Information We Collect</Text>
        <Text style={styles.policyText}>
          We collect personal information, such as your name, email address, phone number, and location, to provide you with a personalized experience. We may also collect data on your usage of the app to improve our services.
        </Text>

        <Text style={styles.policySectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.policyText}>
          The information we collect is used to enhance your user experience, including providing services, personalized content, and customer support. We may also use your data for analytics and to communicate important updates.
        </Text>

        <Text style={styles.policySectionTitle}>3. Data Protection</Text>
        <Text style={styles.policyText}>
          We implement security measures to protect your information from unauthorized access, alteration, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </Text>

        <Text style={styles.policySectionTitle}>4. Sharing Your Information</Text>
        <Text style={styles.policyText}>
          We do not sell, rent, or share your personal information with third parties without your consent, except when required by law or to provide our services.
        </Text>

        <Text style={styles.policySectionTitle}>5. Your Rights</Text>
        <Text style={styles.policyText}>
          You have the right to access, correct, or delete your personal information. You can also opt-out of receiving marketing communications at any time.
        </Text>

        <Text style={styles.policySectionTitle}>6. Changes to This Policy</Text>
        <Text style={styles.policyText}>
          We may update this Privacy Policy from time to time. Any changes will be posted within the app, and you will be notified of any material changes to how your information is handled.
        </Text>

        <Text style={styles.policyText}>
          If you have any questions or concerns about this Privacy Policy, please contact us at support@field2forks.com.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C7339',
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flexGrow: 1,
    backgroundColor: '#FFFFF0',
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
  },
  policySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5D1A',
    marginTop: 20,
  },
  policyText: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    lineHeight: 24,
  },
});
