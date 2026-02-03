import { catchAsyncSocket } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { ParcelValidations } from '../Parcel.validation';
import { parcelValidator } from './Driver.socket';
import { TSocketHandler } from '../../socket/Socket.interface';
import { NotificationServices } from '../../notification/Notification.service';
import { SocketServices } from '../../socket/Socket.service';

export const UserSocket: TSocketHandler = async ({ socket }) => {
  const { user } = socket.data;

  // //! Recover user last parcel
  // const lastParcel = await ParcelServices.getLastUserParcel({
  //   user_id: user.id,
  // });

  // if (lastParcel) {
  //   socket.emit('parcel:recover', lastParcel);
  // }

  socket.on(
    'parcel:new_request',
    catchAsyncSocket(async payload => {
      const data = await ParcelServices.requestForParcel({
        ...payload,
        user_id: user.id,
      });

      //? Notify user that their parcel request is being processed
      await NotificationServices.createNotification({
        user_id: user.id,
        title: 'Parcel Request Received',
        message: 'Searching for nearby drivers...',
        type: 'INFO',
      });

      return data;
    }, ParcelValidations.requestForParcel),
  );

  socket.on(
    'parcel:cancel',
    catchAsyncSocket(async ({ parcel_id }) => {
      const data = await ParcelServices.cancelParcel({
        parcel_id,
        user_id: user.id,
      });

      return data;
    }, parcelValidator),
  );

  socket.on(
    'parcel:pay',
    catchAsyncSocket(async ({ parcel_id }) => {
      const { transaction, parcel, wallet } = await ParcelServices.payForParcel(
        {
          parcel_id,
          user_id: user.id,
        },
      );

      //? Notify driver that parcel has been paid
      SocketServices.emitToUser(parcel.driver_id!, 'parcel:paid', {
        parcel,
        transaction,
        user: {
          name: user.name,
          trip_received_count: user.trip_received_count,
          avatar: user.avatar,
          rating: user.rating,
          rating_count: user.rating_count,
        },
      });

      return {
        current_balance: wallet?.balance,
        transaction,
        parcel_id: parcel.id,
      };
    }, parcelValidator),
  );
};
