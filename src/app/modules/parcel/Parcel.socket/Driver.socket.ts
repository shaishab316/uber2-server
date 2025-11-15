import { QueryValidations } from '../../query/Query.validation';
import { catchAsyncSocket, socketResponse } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { TSocketHandler } from '../../socket/Socket.interface';
import { ParcelValidations } from '../Parcel.validation';
import { SocketServices } from '../../socket/Socket.service';

export const DriverSocket: TSocketHandler = async ({ socket }) => {
  const driver = socket.data.user;

  //! Recover driver last parcel
  const lastParcel = await ParcelServices.getLastDriverParcel({
    driver_id: driver.id,
  });

  if (lastParcel) {
    socket.emit(
      'parcel:recover',
      socketResponse({
        message: `${lastParcel.status} recover parcel`,
        data: lastParcel,
      }),
    );
  }

  socket.on(
    'parcel:accept',
    catchAsyncSocket(async ({ parcel_id }) => {
      const parcel = await ParcelServices.acceptParcel({
        driver_id: driver.id,
        parcel_id,
      });

      SocketServices.emitToUser(
        parcel.user_id,
        'parcel:accepted',
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
        data: parcel,
      };
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );

  socket.on(
    'parcel:refresh_location',
    catchAsyncSocket(async payload => {
      const parcel = await ParcelServices.refreshLocation(payload);

      SocketServices.emitToUser(
        parcel.user_id,
        'parcel:refresh_location',
        socketResponse({
          message: 'Location updated successfully!',
          data: payload,
        }),
      );

      return {
        message: 'Location updated successfully!',
        data: payload,
      };
    }, ParcelValidations.refreshLocation),
  );
};
