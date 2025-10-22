import { TSocketHandler } from '../socket/Socket.interface';
import { catchAsyncSocket } from '../socket/Socket.utils';
import { DriverServices } from './Driver.service';
import { DriverValidations } from './Driver.validation';

export const DriverSocket: TSocketHandler = ({ socket }) => {
  const driver = socket.data.user;

  socket.on(
    'toggle_online',
    catchAsyncSocket(async ({ online }) => {
      const data = await DriverServices.toggleOnline({
        driver_id: driver.id,
        online,
      });

      return {
        message: 'Online status updated successfully!',
        data,
      };
    }, DriverValidations.toggleOnline),
  );
};
