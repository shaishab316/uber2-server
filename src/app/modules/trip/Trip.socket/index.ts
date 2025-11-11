import { TSocketHandler } from '../../socket/Socket.interface';
import { DriverSocket } from './Driver.socket';
import { UserSocket } from './User.socket';

export const TripSocket: TSocketHandler = async ({ io, socket }) => {
  UserSocket({ io, socket });
  DriverSocket({ io, socket });
};
