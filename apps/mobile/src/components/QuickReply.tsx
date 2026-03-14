import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const replies = [
  'Thanks for contacting us! How can I help?',
  'Let me check that for you.',
  'One moment please…',
  'Is there anything else I can help with?',
  'Thank you! Have a great day.',
];

interface QuickReplyProps {
  onSelect: (text: string) => void;
}

export function QuickReply({ onSelect }: QuickReplyProps) {
  return (
    <FlatList
      horizontal
      data={replies}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.chip} onPress={() => onSelect(item)}>
          <Text style={styles.chipText}>{item}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12, gap: 8 },
  chip: {
    backgroundColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipText: { fontSize: 13, color: '#374151' },
});
