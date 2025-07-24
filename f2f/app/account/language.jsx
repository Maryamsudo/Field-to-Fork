import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import {Dimensions,Platform,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity,View,I18nManager,Alert,} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export default function LanguageSwitcherScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    // Load language from storage on mount
    AsyncStorage.getItem('user-lang').then((lang) => {
      if (lang) {
        setSelectedLanguage(lang);
      }
    });
  }, []);

  const handleLanguageSelect = async (lang) => {
    if (selectedLanguage === lang) return;

    setSelectedLanguage(lang);
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('user-lang', lang);

    const isRTL = lang === 'ur';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      Alert.alert(
        'Restart Required',
        'App will reload to apply the language direction.',
        [
          {
            text: 'OK',
            onPress: () => Updates.reloadAsync(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
       {/* Header */}
       <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 19 }]}>
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Language</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleLanguageSelect('en')}
        >
          <Text style={styles.optionText}>English</Text>
          {selectedLanguage === 'en' && (
            <Ionicons name="checkmark-circle" size={width * 0.055} color="#5B8146" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleLanguageSelect('ur')}
        >
          <Text style={styles.optionText}>اردو</Text>
          {selectedLanguage === 'ur' && (
            <Ionicons name="checkmark-circle" size={width * 0.055} color="#5B8146" />
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF0', // soft yellow
  },
  header: {
    backgroundColor: '#4C7339',
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.05,
    borderBottomLeftRadius: width * 0.06,
    borderBottomRightRadius: width * 0.06,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: width * 0.05,
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  headerText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
  content: {
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: width * 0.03,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.045,
    marginBottom: height * 0.02,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#2D4223",
  },
  optionText: {
    fontSize: width * 0.045,
    color: '#333',
  },
});
