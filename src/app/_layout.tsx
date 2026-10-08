import React from 'react';
import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(citizen)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(internal)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
