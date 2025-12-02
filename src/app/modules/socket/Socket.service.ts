import { Server } from 'http';
import { Server as IOServer, Namespace } from 'socket.io';
import config from '../../../config';
import { SocketRoutes } from './Socket.route';
import auth from './Socket.middleware';
import { TAuthenticatedSocket } from './Socket.interface';
import { logger } from '../../../utils/logger';
import chalk from 'chalk';
import { prisma } from '../../../utils/db';

let io: IOServer | null = null;
const onlineUsers = new Set<string>();
const userSockets = new Map<string, Set<string>>();

export const SocketServices = {
  init(server: Server): () => void {
    if (io) return this.cleanup;

    io = new IOServer(server, {
      cors: { origin: config.server.allowed_origins },
    });

    logger.info(chalk.green('🚀 Socket services initialized successfully'));

    // Single root namespace only
    const nsp = io.of('/');
    nsp.use(auth);

    // Attach all feature handlers on root namespace
    const rootHandler = SocketRoutes.get('/')!;

    nsp.on('connection', (socket: TAuthenticatedSocket) => {
      const { user } = socket.data;

      this._trackConnection(user.id, socket.id);
      this._markOnline(user.id);
      logger.info(`👤 User (${user.name}) connected on /`);

      // errors
      socket.on('error', logger.error);

      // wire up feature handlers
      try {
        rootHandler({ io: nsp as unknown as Namespace, socket });
      } catch (err) {
        logger.error('Root namespace handler error:', err);
      }

      socket.on('disconnect', async () => {
        await this._trackDisconnection(user.id, socket.id);
        logger.info(`👤 User (${user.name}) disconnected from /`);
      });
    });

    return this.cleanup;
  },

  emitToUser(userId: string, event: string, payload: any) {
    const sockets = userSockets.get(userId);
    if (!io || !sockets || sockets.size === 0) return;
    for (const sid of sockets) {
      io.of('/').to(sid).emit(event, payload);
    }
  },

  broadcast(event: string, payload: any) {
    io?.of('/').emit(event, payload);
  },

  getIO(): Namespace | undefined {
    return io?.of('/');
  },

  cleanup() {
    if (!io) return;
    onlineUsers.clear();
    userSockets.clear();
    io.close(() => logger.info('Socket.IO server closed.'));
    io = null;
  },

  _trackConnection(userId: string, socketId: string) {
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId)!.add(socketId);
  },

  async _trackDisconnection(userId: string, socketId: string) {
    const set = userSockets.get(userId);
    if (set) {
      set.delete(socketId);
      if (set.size === 0) {
        userSockets.delete(userId);
        await this._markOffline(userId);
      }
    }
  },

  _markOnline(userId: string) {
    onlineUsers.add(userId);
    this._emitOnline();
  },

  async _markOffline(userId: string) {
    onlineUsers.delete(userId);
    this._emitOnline();

    await prisma.user.update({
      where: { id: userId },
      data: { is_online: false, last_online_at: new Date() },
      select: { id: true },
    });
  },

  _emitOnline() {
    io?.of('/').emit('presence:online', Array.from(onlineUsers));
  },
};
