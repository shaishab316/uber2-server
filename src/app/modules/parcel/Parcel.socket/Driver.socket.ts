import { QueryValidations } from '../../query/Query.validation';
import { catchAsyncSocket } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { TSocketHandler } from '../../socket/Socket.interface';
import { ParcelValidations } from '../Parcel.validation';
import { SocketServices } from '../../socket/Socket.service';
import { prisma } from '../../../../utils/db';

export const DriverSocket: TSocketHandler = async ({ socket }) => {
  const driver = socket.data.user;

  //! Recover driver last parcel
  const lastParcel = await ParcelServices.getLastDriverParcel({
    driver_id: driver.id,
  });

  if (lastParcel) {
    socket.emit('parcel:recover', lastParcel);
  }

  socket.on(
    'parcel:accept',
    catchAsyncSocket(async ({ parcel_id }) => {
      const parcel = await ParcelServices.acceptParcel({
        driver_id: driver.id,
        parcel_id,
      });

      SocketServices.emitToUser(parcel.user_id, 'parcel:accepted', {
        name: driver.name,
        avatar: driver.avatar,
        parcel_id,
        location_lat: driver.location_lat,
        location_lng: driver.location_lng,
      });

      return parcel;
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );

  socket.on(
    'parcel:cancel',
    catchAsyncSocket(async ({ parcel_id }) => {
      await prisma.parcel.update({
        where: { id: parcel_id },
        data: {
          processing_driver_id: null,
          is_processing: false,
          processing_at: new Date(), //? invoke time
        },
      });

      return { parcel_id };
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );

  socket.on(
    'parcel:refresh_location',
    catchAsyncSocket(async payload => {
      const parcel = await ParcelServices.refreshLocation(payload);

      SocketServices.emitToUser(
        parcel.user_id,
        'parcel:refresh_location',
        payload,
      );

      return payload;
    }, ParcelValidations.refreshLocation),
  );
};
