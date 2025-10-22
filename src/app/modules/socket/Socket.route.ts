import { DriverSocket } from '../driver/Driver.socket';
import { ParcelSocket } from '../parcel/Parcel.socket';
import type { TSocketHandler } from './Socket.interface';

const router = new Map<string, TSocketHandler>();
{
  router.set('/parcel', ParcelSocket);
  router.set('/driver', DriverSocket);
}

export const SocketRoutes = router;
