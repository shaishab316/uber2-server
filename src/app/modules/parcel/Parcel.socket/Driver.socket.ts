import { QueryValidations } from '../../query/Query.validation';
import { catchAsyncSocket, socketResponse } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { TSocketHandler } from '../../socket/Socket.interface';

export const DriverSocket: TSocketHandler = ({ socket, io }) => {
  const driver = socket.data.user;

  socket.on(
    'accept_parcel',
    catchAsyncSocket(async ({ parcel_id }) => {
      const data = await ParcelServices.acceptParcel({
        driver_id: driver.id,
        parcel_id,
      });

      io.emit(
        `accepted_parcel::${parcel_id}`,
        socketResponse({
          message: 'Parcel accepted successfully!',
          data: {
            name: driver.name,
            avatar: driver.avatar,
            parcel_id,
            location_lat: driver.location_lat,
            location_lng: driver.location_lng,
          },
        }),
      );

      return {
        message: 'Parcel accepted successfully!',
        data,
      };
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );
};
