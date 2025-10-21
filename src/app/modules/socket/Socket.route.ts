import ParcelSocket from '../parcel/Parcel.socket';
import { TSocketHandler } from './Socket.interface';

const router = new Map<string, TSocketHandler>();
{
  router.set('/parcel', ParcelSocket);
}

export const SocketRoutes = router;
