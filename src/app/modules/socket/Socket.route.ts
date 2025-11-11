import { DriverSocket } from '../driver/Driver.socket';
import { MessageSocket } from '../message/Message.socket';
import { ParcelSocket } from '../parcel/Parcel.socket';
import { TripSocket } from '../trip/Trip.socket';
import type { TSocketHandler } from './Socket.interface';

export type TSocketRoutes = '/' | '/trip' | '/parcel' | '/driver' | '/message';

const router = new Map<string, TSocketHandler>();
{
  router.set('/trip', TripSocket);
  router.set('/parcel', ParcelSocket);
  router.set('/driver', DriverSocket);
  router.set('/message', MessageSocket);
}

export const SocketRoutes = router;
