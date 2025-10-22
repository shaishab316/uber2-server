import { TSocketHandler } from '../../socket/Socket.interface';
import { UserSocket } from './User.socket';
import { DriverSocket } from './Driver.socket';

export const ParcelSocket: TSocketHandler = async ({ io, socket }) => {
  UserSocket({ io, socket });
  DriverSocket({ io, socket });
};
