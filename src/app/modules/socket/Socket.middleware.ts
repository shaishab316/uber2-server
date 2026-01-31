/* eslint-disable no-unused-vars */
import { decodeToken } from '../auth/Auth.utils';
import { prisma, type User as TUser } from '@/utils/db';
import { userOmit } from '../user/User.constant';
import { commonValidator as commonAuthValidator } from '@/app/middlewares/auth';
import { formatError } from '@/app/middlewares/globalErrorHandler';
import { TAuthenticatedSocket } from './Socket.interface';
import { omit } from '@/utils/db/omit';

const socketAuth = async (
  socket: TAuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  const token =
    socket.handshake?.auth?.token ?? socket.handshake?.headers?.authorization;

  try {
    const { uid } = decodeToken(token, 'access_token');

    try {
      const user = await prisma.user.findUnique({
        where: { id: uid },
      });

      if (!user || user.is_deleted) {
        return next(new Error('Your account is not found'));
      }

      //? Run common auth validators
      commonAuthValidator(user);

      socket.data.user = omit(user, userOmit[user.role]) as TUser;
    } catch {
      return next(new Error('Your account is not found'));
    }

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new Error(formatError(error).message));
    }
  }
};

export default socketAuth;
