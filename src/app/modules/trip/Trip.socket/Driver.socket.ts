import { QueryValidations } from '../../query/Query.validation';
import { TSocketHandler } from '../../socket/Socket.interface';
import { catchAsyncSocket, socketResponse } from '../../socket/Socket.utils';
import { TripServices } from '../Trip.service';
import { TripValidations } from '../Trip.validation';

export const DriverSocket: TSocketHandler = async ({ socket, io }) => {
  const driver = socket.data.user;

  //! Recover driver last trip
  const lastTrip = await TripServices.getLastDriverTrip({
    driver_id: driver.id,
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
    'accept_trip',
    catchAsyncSocket(async ({ trip_id }) => {
      const trip = await TripServices.acceptTrip({
        driver_id: driver.id,
        trip_id,
      });

      io.to(trip.user_id).emit(
        'accepted_trip',
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
    'refresh_location',
    catchAsyncSocket(async payload => {
      const trip = await TripServices.refreshLocation(payload);

      io.to(trip.user_id).emit(
        'refresh_location',
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
