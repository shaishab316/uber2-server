import { catchAsyncSocket } from '../../socket/Socket.utils';
import { ParcelServices } from '../Parcel.service';
import { ParcelValidations } from '../Parcel.validation';
import { QueryValidations } from '../../query/Query.validation';
import { TSocketHandler } from '../../socket/Socket.interface';

export const UserSocket: TSocketHandler = ({ socket }) => {
  const { user } = socket.data;

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
