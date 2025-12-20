import { QueryValidations } from '../../query/Query.validation';
import { catchAsyncSocket } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { TSocketHandler } from '../../socket/Socket.interface';
import { ParcelValidations } from '../Parcel.validation';
import { SocketServices } from '../../socket/Socket.service';

export const parcelValidator = QueryValidations.exists('parcel_id', 'parcel')
  .shape.params;

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
    }, parcelValidator),
  );

  socket.on(
    'parcel:driver_cancel',
    catchAsyncSocket(async ({ parcel_id }) => {
      await ParcelServices.driverCancelParcel({
        driver_id: driver.id,
        parcel_id,
      });

      return { parcel_id };
    }, parcelValidator),
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

  socket.on(
    'parcel:start',
    catchAsyncSocket(async ({ parcel_id }) => {
      const parcel = await ParcelServices.startParcel({
        driver_id: driver.id,
        parcel_id,
      });

      SocketServices.emitToUser(parcel.user_id, 'parcel:started', parcel);

      return parcel;
    }, parcelValidator),
  );

  socket.on(
    'parcel:deliver',
    catchAsyncSocket(async payload => {
      const parcel = await ParcelServices.deliverParcel({
        ...payload,
        driver_id: driver.id,
      });

      SocketServices.emitToUser(parcel.user_id, 'parcel:delivered', parcel);

      return parcel;
    }, ParcelValidations.deliver_parcel),
  );

  socket.on(
    'parcel:complete_delivery',
    catchAsyncSocket(async ({ parcel_id }) => {
      const parcel = await ParcelServices.completeParcelDelivery({
        driver_id: driver.id,
        parcel_id,
      });

      SocketServices.emitToUser(
        parcel.user_id,
        'parcel:delivery_completed',
        parcel,
      );

      return parcel;
    }, parcelValidator),
  );
};
