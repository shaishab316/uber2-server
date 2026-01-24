/* eslint-disable no-unused-vars */
import { Server as IOServer, Socket } from 'socket.io';
import { User as TUser } from '@/utils/db';

export type TSocketHandler = ({
  io,
  socket,
}: {
  io: IOServer;
  socket: TAuthenticatedSocket;
}) => void;

export interface TAuthenticatedSocket extends Socket {
  data: {
    user: TUser;
  };
}
