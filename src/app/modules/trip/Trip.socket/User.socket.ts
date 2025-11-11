import { TSocketHandler } from '../../socket/Socket.interface';
import { catchAsyncSocket } from '../../socket/Socket.utils';
import { TripServices } from '../Trip.service';
import { TripValidations } from '../Trip.validation';

export const UserSocket: TSocketHandler = async ({ socket }) => {
  const { user } = socket.data;

  socket.on(
    'request_for_trip',
    catchAsyncSocket(async payload => {
      const data = await TripServices.requestForTrip({
        ...payload,
        user_id: user.id,
      });

      return {
        message: 'Trip requested successfully!',
        data,
      };
    }, TripValidations.requestForTrip),
  );
};
