import { Feather } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useRouter } from 'expo-router'; // 🧭 Import router
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const Weather = () => {
const router = useRouter(); // 🔁 Router hook
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  
  const insets = useSafeAreaInsets(); // Inside Weather component
  const apiKey = '776f7ea8a34850ea5ef4682b5c26872d'; 

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityName = geo[0]?.city || geo[0]?.region || 'Unknown Location';

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      const dailyForecast = data.list.filter(item => item.dt_txt.includes('12:00:00'));

      setForecast(dailyForecast);
      setCity(cityName);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getSuggestion = (temp, condition) => {
    if (condition.includes('rain') || condition.includes('storm') || condition.includes('drizzle') || condition.includes('thunder'))  {
      return '🌧️ Advice: Farmers should cover crops. Consumers may experience delivery delays.';
    } else if (temp > 35) {
      return '☀️ Advice: Very hot. Water your crops regularly. Stay hydrated.';
    } else if (temp < 10) {
      return '❄️ Advice: Cold weather. Use protective measures for plants and animals.';
    } else {
      return '🌤️ Advice: Good weather for farming and deliveries.';
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#228B22" />
        <Text>Fetching weather forecast...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fff0" }}>
  {/* Styled Header */}
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
      marginLeft: -26,
    }}>
      Weather Forecast
    </Text>
  </View>


    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.city}>📍 {city}</Text>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchWeather}>
        <Text style={styles.refreshText}>🔄 Refresh Weather</Text>
      </TouchableOpacity>

      {forecast.map((day, index) => {
        const temp = day.main.temp;
        const condition = day.weather[0].main.toLowerCase();
        const suggestion = getSuggestion(temp, condition);
        const humidity = day.main.humidity;
        const windSpeed = day.wind.speed;
        return (
          <View key={index} style={styles.card}>
            <Text style={styles.date}>{new Date(day.dt_txt).toDateString()}</Text>
            <Image
              style={styles.icon}
              source={{ uri: `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png` }}
            />
            <Text style={styles.temp}>{temp}°C</Text>
            <Text style={styles.description}>{day.weather[0].description}</Text>
            <Text style={styles.advice}>{suggestion}</Text>
            <Text style={styles.extra}>💧 Humidity: {humidity}%</Text>
            <Text style={styles.extra}>🌬️ Wind: {windSpeed} m/s</Text>
            <Text style={styles.sellerTip}>📦 Seller Tip: Schedule deliveries before noon to avoid peak heat.</Text>
          </View>
        );
      })}
    </ScrollView>
  </SafeAreaView>
);
  
};

export default Weather;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFF0',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    fontSize: 16,
    color: '#2e8b57',
    marginRight: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  city: {
    fontSize: 18,
    marginBottom: 20,
    color: '#444',
  },
  card: {
    backgroundColor: '#f0fff0',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  
    // Android Shadow
    elevation: 6, // This is crucial for Android
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 80,
    height: 80,
  },
  temp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  description: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  advice: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  extra: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  sellerTip: {
    fontSize: 13,
    color: '#006400',
    fontStyle: 'italic',
    marginTop: 8,
  },
  refreshBtn: {
    backgroundColor: '#e0f5e0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  refreshText: {
    fontSize: 16,
    color: '#2e8b57',
    fontWeight: 'bold',
  },
});
