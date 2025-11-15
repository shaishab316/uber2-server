import { TSocketHandler } from '../../socket/Socket.interface';
import { catchAsyncSocket, socketResponse } from '../../socket/Socket.utils';
import { TripServices } from '../Trip.service';
import { TripValidations } from '../Trip.validation';
import { QueryValidations } from '../../query/Query.validation';

export const UserSocket: TSocketHandler = async ({ socket }) => {
  const { user } = socket.data;

  //! Recover user last trip
  const lastTrip = await TripServices.getLastUserTrip({
    user_id: user.id,
  });

  if (lastTrip) {
    socket.emit(
      'recover_trip',
      socketResponse({
        message: `${lastTrip.status} recover trip`,
        data: lastTrip,
      }),
    );
  }

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

  socket.on(
    'cancel_trip',
    catchAsyncSocket(async ({ trip_id }) => {
      const data = await TripServices.cancelTrip({
        trip_id,
        user_id: user.id,
      });

      return {
        message: 'Trip cancelled successfully!',
        data,
      };
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );
};
