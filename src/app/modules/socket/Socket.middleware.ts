/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { decodeToken } from '../auth/Auth.utils';
import { prisma } from '@/utils/db';
import { userSelfOmit } from '../user/User.constant';
import { commonValidator as commonAuthValidator } from '@/app/middlewares/auth';
import { formatError } from '@/app/middlewares/globalErrorHandler';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token =
    socket.handshake?.auth?.token ?? socket.handshake?.headers?.authorization;

  try {
    const { uid } = decodeToken(token, 'access_token');

    try {
      socket.data.user = await prisma.user.update({
        where: { id: uid, is_deleted: false },
        //? Set user as online on every socket connection
        data: { is_online: true, last_online_at: new Date() },
        omit: userSelfOmit.USER,
      });
    } catch {
      next(new Error('Your account is not found'));
    }

    //? Run common auth validators
    commonAuthValidator(socket.data.user);

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new Error(formatError(error).message));
    }
  }
};

export default socketAuth;
