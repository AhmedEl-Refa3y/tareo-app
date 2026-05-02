import { Stack } from "expo-router";

export default function ConsultingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" />
      <Stack.Screen name="video" />
    </Stack>
  );
}
