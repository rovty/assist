import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const stats = [
  { label: 'Open Conversations', value: '24' },
  { label: 'Avg Response Time', value: '2m 30s' },
  { label: 'Resolution Rate', value: '87%' },
  { label: 'CSAT Score', value: '4.5/5' },
];

export function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics</Text>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.card}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  value: { fontSize: 24, fontWeight: 'bold', color: '#6366f1' },
  label: { fontSize: 12, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});
