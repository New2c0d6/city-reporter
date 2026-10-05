import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>City Reporter</Text>
      <Text style={styles.subtitle}>
        Report civic issues with evidence and location
      </Text>

      <Link href="/(citizen)/create-report" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Report</Text>
        </TouchableOpacity>
      </Link>

      <Text style={styles.placeholder}>
        MVP: Citizen report creation interface
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});
