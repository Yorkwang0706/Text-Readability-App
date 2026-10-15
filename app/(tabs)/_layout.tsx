import { Stack } from "expo-router";

// A normal web page: no mobile Home / Explore tab bar.
export default function WebLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
    </Stack>
  );
}
