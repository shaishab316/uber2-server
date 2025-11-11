import startServer from './utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { ParcelJob } from './app/modules/parcel/Parcel.job';
import { TripJob } from './app/modules/trip/Trip.job';

startServer().then(server => {
  const cleanupSocket = SocketServices.init(server);
  const cleanupParcel = ParcelJob(server);
  const cleanupTrip = TripJob(server);

  ['SIGINT', 'SIGTERM'].forEach(signal =>
    process.once(signal, async () => {
      cleanupParcel();
      cleanupSocket();
      cleanupTrip();
      server.close(() => process.exit(0));
    }),
  );
});
