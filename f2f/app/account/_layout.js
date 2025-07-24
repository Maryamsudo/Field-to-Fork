import { Stack } from 'expo-router';

const AccountLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="myprofile" />
      <Stack.Screen name="policy" />
      <Stack.Screen name="updateproduct" />
      <Stack.Screen name="trackorder" />
    </Stack>
  );
};

export default AccountLayout;