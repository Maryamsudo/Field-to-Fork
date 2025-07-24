import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../i18n'; // <-- Load i18n config
import i18n from '../i18n';
const RootLayout = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <>
          <Stack>
            <Stack.Screen name="getstarted" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="nextpage" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="homepage" options={{ headerShown: false }} />
            <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
            <Stack.Screen name="success" options={{ headerShown: false }} />
            <Stack.Screen name="setting" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
            <Stack.Screen name="favorites" options={{ headerShown: false }} />
            <Stack.Screen name="sell" options={{ headerShown: false }} />
            <Stack.Screen name="mycart" options={{ headerShown: false }} />
            <Stack.Screen name="notification" options={{ headerShown: false }} />
            <Stack.Screen name="product" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="Confirmorder" options={{ headerShown: false }} />
            <Stack.Screen name="editpayment" options={{ headerShown: false }} />
            <Stack.Screen name="addcard" options={{ headerShown: false }} />
            <Stack.Screen name="successconfirmorder" options={{ headerShown: false }} />
            <Stack.Screen name="weather" options={{ headerShown: false }} />
            <Stack.Screen name="cardpayment" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      </I18nextProvider>
  );
};

export default RootLayout;
