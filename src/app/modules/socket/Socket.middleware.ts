/* eslint-disable no-unused-vars */
import { Socket } from 'socket.io';
import { decodeToken } from '../auth/Auth.utils';
import { prisma } from '../../../utils/db';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { userSelfOmit } from '../user/User.constant';

const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  const token =
    socket.handshake?.auth?.token ?? socket.handshake?.headers?.authorization;

  try {
    const { uid } = decodeToken(token, 'access_token');

    const user = await prisma.user.update({
      where: { id: uid },
      //? Set user as online on every socket connection
      data: { is_online: true, last_online_at: new Date() },
      omit: userSelfOmit.USER,
    });

    if (!user)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Your account is not found');

    Object.assign(socket.data, { user });

    next();
  } catch (error: any) {
    next(error);
  }
};

export default socketAuth;
