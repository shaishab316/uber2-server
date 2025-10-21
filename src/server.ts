import startServer from './utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { ParcelJob } from './app/modules/parcel/Parcel.job';

startServer().then(server => {
  const cleanupSocket = SocketServices.init(server);
  const cleanupParcel = ParcelJob(server);

  ['SIGINT', 'SIGTERM'].forEach(signal =>
    process.once(signal, async () => {
      cleanupParcel();
      cleanupSocket();
      server.close(() => process.exit(0));
    }),
  );
});
