import { catchAsyncSocket } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { ParcelValidations } from '../Parcel.validation';
import { QueryValidations } from '../../query/Query.validation';
import { TSocketHandler } from '../../socket/Socket.interface';
import { NotificationServices } from '../../notification/Notification.service';

export const UserSocket: TSocketHandler = async ({ socket }) => {
  const { user } = socket.data;

  //! Recover user last parcel
  const lastParcel = await ParcelServices.getLastUserParcel({
    user_id: user.id,
  });

  if (lastParcel) {
    socket.emit('parcel:recover', lastParcel);
  }

  socket.on(
    'parcel:request',
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
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );
};
