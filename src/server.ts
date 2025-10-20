import startServer from './utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { ParcelJob } from './app/modules/parcel/Parcel.job';

startServer().then(server => {
  SocketServices.init(server);
  ParcelJob(server);
});
