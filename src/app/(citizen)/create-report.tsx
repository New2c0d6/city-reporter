import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Report</Text>
      <Text style={styles.placeholder}>
        Form: Category, Title, Description, Location, Media
      </Text>
      <Text style={styles.note}>TASK-201 will implement this</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  placeholder: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#999',
  },
});
