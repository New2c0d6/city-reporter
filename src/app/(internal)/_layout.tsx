import React from 'react';
import { Stack } from 'expo-router';

export default function InternalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Internal Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Reports',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
