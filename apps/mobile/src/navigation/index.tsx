import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConversationsScreen } from '../screens/ConversationsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { LeadsScreen } from '../screens/LeadsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

type ConversationStackParams = {
  ConversationList: undefined;
  Chat: { conversationId: string; contactName: string };
};

const ConversationStack = createNativeStackNavigator<ConversationStackParams>();

function ConversationsNav() {
  return (
    <ConversationStack.Navigator>
      <ConversationStack.Screen
        name="ConversationList"
        component={ConversationsScreen}
        options={{ title: 'Conversations' }}
      />
      <ConversationStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params.contactName })}
      />
    </ConversationStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
        }}
      >
        <Tab.Screen name="Conversations" component={ConversationsNav} />
        <Tab.Screen name="Leads" component={LeadsScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
