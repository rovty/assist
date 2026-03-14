import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockLeads = [
  { id: '1', name: 'Alice Johnson', company: 'TechCorp', stage: 'Qualified', score: 85 },
  { id: '2', name: 'Bob Smith', company: 'StartupXYZ', stage: 'Contacted', score: 60 },
  { id: '3', name: 'Carol White', company: 'Acme Inc', stage: 'New', score: 40 },
];

export function LeadsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockLeads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.company}>{item.company}</Text>
            </View>
            <View style={styles.right}>
              <View style={[styles.badge, stageColor(item.stage)]}>
                <Text style={styles.badgeText}>{item.stage}</Text>
              </View>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function stageColor(stage: string) {
  switch (stage) {
    case 'New': return { backgroundColor: '#dbeafe' };
    case 'Contacted': return { backgroundColor: '#fef3c7' };
    case 'Qualified': return { backgroundColor: '#ede9fe' };
    default: return { backgroundColor: '#f3f4f6' };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16, gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 12, gap: 12,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 14 },
  company: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  score: { fontSize: 12, color: '#6b7280' },
});
