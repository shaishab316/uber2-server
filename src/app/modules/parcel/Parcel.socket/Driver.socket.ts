import { QueryValidations } from '../../query/Query.validation';
import { catchAsyncSocket } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { TSocketHandler } from '../../socket/Socket.interface';

export const DriverSocket: TSocketHandler = (io, socket) => {
  const driver = socket.data.user;

  socket.on(
    'accept_parcel',
    catchAsyncSocket(async ({ parcel_id }) => {
      const data = await ParcelServices.acceptParcel({
        driver_id: driver.id,
        parcel_id,
      });

      return {
        message: 'Parcel accepted successfully!',
        data,
      };
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );
};
