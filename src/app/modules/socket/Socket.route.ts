import ChatSocket from '../chat/Chat.socket';
import ParcelSocket from '../parcel/Parcel.socket';
import TripSocket from '../trip/Trip.socket';
import { TSocketHandler } from './Socket.interface';

const router = new Map<string, TSocketHandler>();
{
  router.set('/chat', ChatSocket);
  router.set('/trip', TripSocket);
  router.set('/parcel', ParcelSocket);
}

export const SocketRoutes = router;
