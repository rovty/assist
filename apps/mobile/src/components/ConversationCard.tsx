import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Conversation } from '../types';

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationCard({ conversation, onPress }: ConversationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{conversation.contactName[0]}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{conversation.contactName}</Text>
          <Text style={styles.time}>{conversation.updatedAt}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{conversation.lastMessage}</Text>
      </View>
      {conversation.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{conversation.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '600', fontSize: 14, flex: 1 },
  time: { fontSize: 11, color: '#9ca3af', marginLeft: 8 },
  lastMessage: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: {
    backgroundColor: '#6366f1', borderRadius: 10, minWidth: 20,
    height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});
