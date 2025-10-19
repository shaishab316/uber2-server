import { TSocketHandler } from '../socket/Socket.interface';
import { catchAsyncSocket } from '../socket/Socket.utils';
import { ParcelValidations } from './Parcel.validation';
import { ParcelServices } from './Parcel.service';

const ParcelSocket: TSocketHandler = async (io, socket) => {
  const { user } = socket.data;

  socket.on(
    'request_for_parcel',
    catchAsyncSocket(async ({ body }) => {
      const parcel = await ParcelServices.requestForParcel({
        ...body,
        user_id: user.id,
      });

      return {
        message: 'Parcel requested successfully!',
        data: parcel,
      };
    }, ParcelValidations.requestForParcel),
  );
};

export default ParcelSocket;
