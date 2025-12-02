process.stdout.write('\x1Bc'); //? clear console
import startServer from '@/utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { ParcelJob } from './app/modules/parcel/Parcel.job';
import { TripJob } from './app/modules/trip/Trip.job';

/**
 * server initialization
 */
const server = await startServer();

/**
 * Add plugins to the server
 */
server.addPlugins(
  SocketServices.init(server),
  ParcelJob(server),
  TripJob(server),
);
