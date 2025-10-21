import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { TSocketHandler } from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TripServices } from './Trip.service';
import { tripNotificationMaps } from './Trip.utils';
import { tripOmit } from './Trip.constant';
import { EUserRole } from '../../../../prisma';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';
import { AvailableDriverServices } from '../availableDriver/AvailableDriver.service';
import getDistanceAndTime from '../../../utils/location/getDistanceAndTime';
import { calculateFare } from '../../../utils/uber/calculateFare';

const TripSocket: TSocketHandler = async ({ io, socket }) => {
  const { user } = socket.data;

  //! Launch started trip quickly
  await TripServices.launchStartedTrip({ io, socket });

  //! delete offline driver from availableDriver
  socket.on('disconnect', async () => {
    try {
      await AvailableDriverServices.leave({ driver_id: user.id });
    } catch {
      void 0;
    }
  });

  const isUser = user.role === EUserRole.USER;

  socket.on(
    'join_trip_room',
    catchAsyncSocket(async ({ trip_id }) => {
      const trip = (await prisma.trip.findFirst({
        where: { id: trip_id },
        omit: tripOmit,
      }))!;

      if (trip.passenger_id !== user.id && trip.driver_id !== user.id) {
        throw new ServerError(
          StatusCodes.UNAUTHORIZED,
          `You are not ${isUser ? 'passenger' : 'driver'} of this trip`,
        );
      }

      // Join room
      socket.join(trip.id);

      return {
        message: 'Joined trip successfully',
        data: trip,
        meta: { trip_id },
      };
    }, TripValidations.joinTrip),
  );

  socket.on(
    'update_trip_location',
    catchAsyncSocket(async ({ location, trip_id }) => {
      const trip = await TripServices.updateTripLocation({
        user_id: user.id,
        trip_id,
        location,
      });

      socket.to(trip_id).emit(
        'update_trip_location',
        socketResponse({
          message: `${user.name} updated trip's location`,
          data: location,
          meta: { trip_id },
        }),
      );

      const { distance, duration } = await getDistanceAndTime(
        trip.pickup_address.geo,
        location.geo,
      );

      const estimatedFare = calculateFare({
        distance: distance.value,
        time: duration.value,
        passengerAges: trip.passenger_ages,
      });

      if (trip.total_cost < estimatedFare) {
        await prisma.trip.update({
          where: { id: trip_id },
          data: { total_cost: estimatedFare },
        });
      }

      const { distance: xDistance, duration: xDuration } =
        await getDistanceAndTime(location.geo, trip.dropoff_address.geo);

      const closestNotification = tripNotificationMaps.find(
        notification => xDistance.value <= notification.distance,
      );

      const notification = closestNotification?.message;

      if (notification) {
        socket.to(trip.passenger_id).emit(
          'trip_notification',
          socketResponse({
            message: notification,
            data: {
              distance: xDistance,
              duration: xDuration,
            },
            meta: { trip_id },
          }),
        );
      }

      return {
        message: "Trip's location updated successfully!",
        data: location,
        meta: { trip_id },
      };
    }, TripValidations.updateTripLocation),
  );
};

export default TripSocket;
