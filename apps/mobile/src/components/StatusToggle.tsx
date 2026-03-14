import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { AgentStatus } from '../types';

const statuses: { value: AgentStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Online', color: '#22c55e' },
  { value: 'away', label: 'Away', color: '#f59e0b' },
  { value: 'offline', label: 'Offline', color: '#9ca3af' },
];

export function StatusToggle() {
  const [status, setStatus] = useState<AgentStatus>('online');

  return (
    <View style={styles.container}>
      {statuses.map((s) => (
        <TouchableOpacity
          key={s.value}
          style={[styles.option, status === s.value && styles.active]}
          onPress={() => setStatus(s.value)}
        >
          <View style={[styles.dot, { backgroundColor: s.color }]} />
          <Text style={[styles.label, status === s.value && styles.activeLabel]}>{s.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb',
  },
  active: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 13, color: '#6b7280' },
  activeLabel: { fontWeight: '600', color: '#4f46e5' },
});
