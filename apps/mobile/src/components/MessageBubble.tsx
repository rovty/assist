import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.sender === 'agent';

  return (
    <View style={[styles.row, isAgent && styles.rowRight]}>
      <View style={[styles.bubble, isAgent ? styles.agentBubble : styles.contactBubble]}>
        <Text style={[styles.text, isAgent && styles.agentText]}>{message.text}</Text>
        <Text style={[styles.time, isAgent && styles.agentTime]}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 4 },
  rowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 10, paddingHorizontal: 14 },
  contactBubble: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  agentBubble: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
  text: { fontSize: 14, lineHeight: 20 },
  agentText: { color: '#fff' },
  time: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  agentTime: { color: 'rgba(255,255,255,0.7)' },
});
