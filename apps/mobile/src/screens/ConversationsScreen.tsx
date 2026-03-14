import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useConversations } from '../hooks/useConversations';
import { ConversationCard } from '../components/ConversationCard';

export function ConversationsScreen({ navigation }: any) {
  const { data: conversations, isLoading, refetch } = useConversations();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading conversations…</Text>
        </View>
      ) : (
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onPress={() => navigation.navigate('Chat', { conversationId: item.id, contactName: item.contactName })}
            />
          )}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No conversations</Text>
            </View>
          }
          contentContainerStyle={conversations?.length ? undefined : styles.emptyList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#9ca3af', fontSize: 14 },
  emptyList: { flex: 1 },
});
