import { QueryValidations } from '../../query/Query.validation';
import { TSocketHandler } from '../../socket/Socket.interface';
import { catchAsyncSocket, socketResponse } from '../../socket/Socket.utils';
import { TripServices } from '../Trip.service';
import { TripValidations } from '../Trip.validation';
import { SocketServices } from '../../socket/Socket.service';

export const DriverSocket: TSocketHandler = async ({ socket }) => {
  const driver = socket.data.user;

  //! Recover driver last trip
  const lastTrip = await TripServices.getLastDriverTrip({
    driver_id: driver.id,
  });

  if (lastTrip) {
    socket.emit(
      'trip:recover',
      socketResponse({
        message: `${lastTrip.status} recover trip`,
        data: lastTrip,
      }),
    );
  }

  socket.on(
    'trip:accept',
    catchAsyncSocket(async ({ trip_id }) => {
      const trip = await TripServices.acceptTrip({
        driver_id: driver.id,
        trip_id,
      });

      SocketServices.emitToUser(
        trip.user_id,
        'trip:accepted',
        socketResponse({
          message: 'trip accepted successfully!',
          data: {
            name: driver.name,
            avatar: driver.avatar,
            trip_id,
            location_lat: driver.location_lat,
            location_lng: driver.location_lng,
          },
        }),
      );

      return {
        message: 'trip accepted successfully!',
        data: trip,
      };
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );

  socket.on(
    'trip:refresh_location',
    catchAsyncSocket(async payload => {
      const trip = await TripServices.refreshLocation(payload);

      SocketServices.emitToUser(
        trip.user_id,
        'trip:refresh_location',
        socketResponse({
          message: 'Location updated successfully!',
          data: payload,
        }),
      );

      return {
        message: 'Location updated successfully!',
        data: payload,
      };
    }, TripValidations.refreshLocation),
  );
};
