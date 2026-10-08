import React from 'react';
import { Stack } from 'expo-router';

export default function CitizenLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'City Reporter',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-report"
        options={{
          title: 'Report Issue',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="confirmation"
        options={{
          title: 'Report Submitted',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
