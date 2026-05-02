import { Stack } from "expo-router";

export default function PagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="session-history" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="aboutScreen" />
      <Stack.Screen name="privacy-security" />
    </Stack>
  );
}
