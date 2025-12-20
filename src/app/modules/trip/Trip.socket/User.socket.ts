import { TSocketHandler } from '../../socket/Socket.interface';
import { catchAsyncSocket } from '../../socket/Socket.utils';
import { TripServices } from '../Trip.service';
import { TripValidations } from '../Trip.validation';
import { QueryValidations } from '../../query/Query.validation';
import { SocketServices } from '../../socket/Socket.service';
import { NotificationServices } from '../../notification/Notification.service';

export const UserSocket: TSocketHandler = async ({ socket }) => {
  const { user } = socket.data;

  //! Recover user last trip
  const lastTrip = await TripServices.getLastUserTrip({
    user_id: user.id,
  });

  if (lastTrip) {
    socket.emit('trip:recover', lastTrip);
  }

  socket.on(
    'trip:request',
    catchAsyncSocket(async payload => {
      const data = await TripServices.requestForTrip({
        ...payload,
        user_id: user.id,
      });

      //? Notify user that their trip request is being processed
      await NotificationServices.createNotification({
        user_id: user.id,
        title: 'Trip Request Received',
        message: 'Searching for nearby drivers...',
        type: 'INFO',
      });

      return data;
    }, TripValidations.requestForTrip),
  );

  socket.on(
    'trip:cancel',
    catchAsyncSocket(async ({ trip_id }) => {
      const data = await TripServices.cancelTrip({
        trip_id,
        user_id: user.id,
      });

      return data;
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );

  socket.on(
    'trip:pay',
    catchAsyncSocket(async ({ trip_id }) => {
      const { transaction, trip, wallet } = await TripServices.payForTrip({
        trip_id,
        user_id: user.id,
      });

      //? Notify driver that trip has been paid
      SocketServices.emitToUser(trip.driver_id!, 'trip:paid', {
        trip,
        transaction,
      });

      return {
        current_balance: wallet?.balance,
        transaction,
        trip_id: trip.id,
      };
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );
};
