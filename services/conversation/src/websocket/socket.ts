import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createLogger } from '@assist/shared-utils';
import type { JwtPayload } from '@assist/shared-types';
import { redis } from '../utils/redis.js';
import { conversationService } from '../services/conversation.service.js';
import { sendMessageSchema } from '../schemas/conversation.schema.js';

const logger = createLogger('websocket');

interface AuthenticatedSocket {
  id: string;
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

export function setupWebSocket(httpServer: HttpServer, jwtSecret: string) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 10000,
    transports: ['websocket', 'polling'],
  });

  // ─── Authentication Middleware ───
  io.use(async (socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined
      ?? socket.handshake.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Check blacklist
    const blacklisted = await redis.get(`bl:${token}`);
    if (blacklisted) {
      return next(new Error('Token revoked'));
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      (socket as unknown as AuthenticatedSocket).userId = payload.sub;
      (socket as unknown as AuthenticatedSocket).tenantId = payload.tenantId;
      (socket as unknown as AuthenticatedSocket).role = payload.role;
      (socket as unknown as AuthenticatedSocket).email = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection Handler ───
  io.on('connection', (socket) => {
    const authSocket = socket as unknown as AuthenticatedSocket & typeof socket;
    const tenantId = authSocket.tenantId;
    const userId = authSocket.userId;

    logger.info({ userId, tenantId, socketId: socket.id }, 'Client connected');

    // Join tenant room (for broadcasting to all tenant agents)
    socket.join(`tenant:${tenantId}`);
    // Join user-specific room (for direct notifications)
    socket.join(`user:${userId}`);

    // Track online presence in Redis
    redis.sadd(`online:${tenantId}`, userId).catch(() => {});
    redis.set(`presence:${userId}`, JSON.stringify({
      socketId: socket.id,
      tenantId,
      status: 'online',
      connectedAt: new Date().toISOString(),
    }), 'EX', 3600).catch(() => {});

    // ─── Join conversation room ───
    socket.on('conversation:join', async (conversationId: string) => {
      try {
        await conversationService.getConversation(tenantId, conversationId);
        socket.join(`conversation:${conversationId}`);
        logger.debug({ userId, conversationId }, 'Joined conversation room');
      } catch (err) {
        socket.emit('error', { message: 'Conversation not found' });
      }
    });

    // ─── Leave conversation room ───
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ─── Send message ───
    socket.on('message:send', async (data: { conversationId: string; content: unknown; senderType?: string }) => {
      try {
        const input = sendMessageSchema.parse({
          content: data.content,
          senderType: data.senderType ?? 'agent',
        });

        const message = await conversationService.sendMessage(
          tenantId,
          data.conversationId,
          userId,
          input,
        );

        // Broadcast to conversation room
        io.to(`conversation:${data.conversationId}`).emit('message:new', {
          conversationId: data.conversationId,
          message,
        });

        // Notify tenant agents
        io.to(`tenant:${tenantId}`).emit('conversation:updated', {
          conversationId: data.conversationId,
          lastMessage: message,
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to send message';
        socket.emit('error', { message: errMsg });
      }
    });

    // ─── Typing indicators ───
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // ─── Mark messages read ───
    socket.on('messages:read', async (conversationId: string) => {
      try {
        await conversationService.markMessagesRead(tenantId, conversationId, userId);
        io.to(`conversation:${conversationId}`).emit('messages:read', {
          conversationId,
          userId,
          readAt: new Date().toISOString(),
        });
      } catch {
        // Silent fail for read receipts
      }
    });

    // ─── Get online agents ───
    socket.on('agents:online', async () => {
      try {
        const onlineUsers = await redis.smembers(`online:${tenantId}`);
        socket.emit('agents:online', onlineUsers);
      } catch {
        socket.emit('agents:online', []);
      }
    });

    // ─── Disconnect ───
    socket.on('disconnect', (reason) => {
      logger.info({ userId, tenantId, socketId: socket.id, reason }, 'Client disconnected');
      redis.srem(`online:${tenantId}`, userId).catch(() => {});
      redis.del(`presence:${userId}`).catch(() => {});
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}
