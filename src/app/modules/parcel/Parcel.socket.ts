import { TSocketHandler } from '../socket/Socket.interface';
import { catchAsyncSocket } from '../socket/Socket.utils';
import { ParcelValidations } from './Parcel.validation';
import { ParcelServices } from './Parcel.service';
import { QueryValidations } from '../query/Query.validation';

const ParcelSocket: TSocketHandler = async (io, socket) => {
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
    }, ParcelValidations.requestForParcel.shape.body),
  );

  socket.on(
    'accept_parcel',
    catchAsyncSocket(async ({ parcel_id }) => {
      const data = await ParcelServices.acceptParcel({
        driver_id: user.id,
        parcel_id,
      });

      return {
        message: 'Parcel accepted successfully!',
        data,
      };
    }, QueryValidations.exists('parcel_id', 'parcel').shape.params),
  );
};

export default ParcelSocket;
