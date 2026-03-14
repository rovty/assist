import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageBubble } from '../components/MessageBubble';
import type { Message } from '../types';

const mockMessages: Message[] = [
  { id: '1', conversationId: '1', sender: 'contact', text: 'Hi, I need help with my order', createdAt: new Date().toISOString() },
  { id: '2', conversationId: '1', sender: 'agent', text: 'Sure! What\'s your order number?', createdAt: new Date().toISOString() },
];

export function ChatScreen({ route }: any) {
  const [messages] = useState<Message[]>(mockMessages);
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    // TODO: send via API
    setText('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!text.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, gap: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8, backgroundColor: '#6366f1', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
