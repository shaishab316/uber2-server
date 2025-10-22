import { catchAsyncSocket, socketResponse } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { ParcelValidations } from '../Parcel.validation';
import { QueryValidations } from '../../query/Query.validation';
import { TSocketHandler } from '../../socket/Socket.interface';

export const UserSocket: TSocketHandler = async ({ socket }) => {
  const { user } = socket.data;

  //! Recover user last parcel
  const lastParcel = await ParcelServices.getLastUserParcel({
    user_id: user.id,
  });

  if (lastParcel) {
    socket.emit(
      'recover_parcel',
      socketResponse({
        message: `${lastParcel.status} recover parcel`,
        data: lastParcel,
      }),
    );
  }

  socket.on(
    'request_for_parcel',
    catchAsyncSocket(async payload => {
      const data = await ParcelServices.requestForParcel({
        ...payload,
        user_id: user.id,
      });

      return {
        message: 'Parcel requested successfully!',
        data,
      };
    }, ParcelValidations.requestForParcel),
  );

  socket.on(
    'cancel_parcel',
    catchAsyncSocket(async ({ parcel_id }) => {
      const data = await ParcelServices.cancelParcel({
        parcel_id,
        user_id: user.id,
      });

      return {
        message: 'Parcel cancelled successfully!',
        data,
      };
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );
};
