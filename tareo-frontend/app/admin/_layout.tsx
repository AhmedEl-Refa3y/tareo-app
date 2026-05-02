import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="adminHome" />
      <Stack.Screen name="adminUsers" />
      <Stack.Screen name="adminFeedback" />
      <Stack.Screen name="adminKnowledge" />
      <Stack.Screen name="adminSettings" />
    </Stack>
  );
}
