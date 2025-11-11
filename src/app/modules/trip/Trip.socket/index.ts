import { TSocketHandler } from '../../socket/Socket.interface';
import { UserSocket } from './User.socket';

export const TripSocket: TSocketHandler = async ({ io, socket }) => {
  UserSocket({ io, socket });
};
