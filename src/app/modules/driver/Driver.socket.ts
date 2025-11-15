import { ParcelServices } from '../parcel/Parcel.service';
import { TSocketHandler } from '../socket/Socket.interface';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';
import { DriverServices } from './Driver.service';
import { DriverValidations } from './Driver.validation';

export const DriverSocket: TSocketHandler = async ({ socket }) => {
  const driver = socket.data.user;

  const processingParcel = await ParcelServices.getProcessingDriverParcel({
    driver_id: driver.id,
  });

  if (processingParcel) {
    socket.emit(
      'parcel:request',
      socketResponse({
        message: 'New parcel request',
        data: processingParcel,
      }),
    );
  }

  socket.on(
    'driver:toggle_online',
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

  socket.on(
    'driver:refresh_location',
    catchAsyncSocket(async payload => {
      await DriverServices.refreshLocation({
        ...payload,
        driver_id: driver.id,
      });

      return {
        message: 'Location updated successfully!',
        data: payload,
      };
    }, DriverValidations.refreshLocation),
  );
};
