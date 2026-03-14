'use client';

import { Card, CardContent, CardHeader, CardTitle, Avatar, Badge } from '@assist/ui';
import { MessageInput } from './message-input';

interface ConversationDetailProps {
  conversationId: string;
}

const mockMessages = [
  { id: '1', sender: 'contact', text: 'Hi, I need help with my order', time: '10:30 AM' },
  { id: '2', sender: 'agent', text: 'Of course! Can you share your order number?', time: '10:31 AM' },
  { id: '3', sender: 'contact', text: 'It's ORD-12345', time: '10:32 AM' },
];

export function ConversationDetail({ conversationId }: ConversationDetailProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center gap-3 border-b">
        <Avatar name="John Doe" size="sm" />
        <div className="flex-1">
          <CardTitle className="text-base">John Doe</CardTitle>
          <p className="text-xs text-muted-foreground">john@example.com</p>
        </div>
        <Badge variant="success">Open</Badge>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  msg.sender === 'agent'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{msg.text}</p>
                <span className="mt-1 block text-xs opacity-70">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <div className="border-t p-4">
        <MessageInput conversationId={conversationId} />
      </div>
    </Card>
  );
}
