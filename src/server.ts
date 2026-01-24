process.stdout.write('\x1Bc'); //? clear console
import startServer from '@/utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';

/**
 * server initialization
 */
const server = await startServer();

/**
 * Add plugins to the server
 */
server.addPlugins(SocketServices.init(server));
