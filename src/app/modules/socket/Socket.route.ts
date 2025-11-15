import { DriverSocket } from '../driver/Driver.socket';
import { MessageSocket } from '../message/Message.socket';
import { ParcelSocket } from '../parcel/Parcel.socket';
import { TripSocket } from '../trip/Trip.socket';
import type { TSocketHandler } from './Socket.interface';

export type TSocketRoutes = '/';

const router = new Map<string, TSocketHandler>();
{
  // Single root namespace: attach all feature socket handlers here
  router.set('/', ({ io, socket }) => {
    TripSocket({ io, socket });
    ParcelSocket({ io, socket });
    DriverSocket({ io, socket });
    MessageSocket({ io, socket });
  });
}

export const SocketRoutes = router;
