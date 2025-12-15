import { QueryValidations } from '../../query/Query.validation';
import { TSocketHandler } from '../../socket/Socket.interface';
import { catchAsyncSocket } from '../../socket/Socket.utils';
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
    socket.emit('trip:recover', lastTrip);
  }

  socket.on(
    'trip:accept',
    catchAsyncSocket(async ({ trip_id }) => {
      const trip = await TripServices.acceptTrip({
        driver_id: driver.id,
        trip_id,
      });

      SocketServices.emitToUser(trip.user_id, 'trip:accepted', {
        name: driver.name,
        avatar: driver.avatar,
        trip_id,
        location_lat: driver.location_lat,
        location_lng: driver.location_lng,
      });

      return trip;
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );

  socket.on(
    'trip:driver_cancel',
    catchAsyncSocket(async ({ trip_id }) => {
      await TripServices.driverCancelTrip({
        driver_id: driver.id,
        trip_id,
      });

      return { trip_id };
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );

  socket.on(
    'trip:refresh_location',
    catchAsyncSocket(async payload => {
      const trip = await TripServices.refreshLocation(payload);

      SocketServices.emitToUser(trip.user_id, 'trip:refresh_location', payload);

      return payload;
    }, TripValidations.refreshLocation),
  );

  socket.on(
    'trip:start',
    catchAsyncSocket(async ({ trip_id }) => {
      const trip = await TripServices.startTrip({
        driver_id: driver.id,
        trip_id,
      });

      SocketServices.emitToUser(trip.user_id, 'trip:started', {
        trip_id,
      });

      return trip;
    }, QueryValidations.exists('trip_id', 'trip').shape.params),
  );
};
