import catchAsync from '@/app/middlewares/catchAsync';
import type { TGetRideHistoryArgs } from './RideHistory.interface';
import { RideHistoryServices } from './RideHistory.service';
import { type User as TUser, EUserRole } from '@/utils/db';

export const RideHistoryControllers = {
  getRideHistory: catchAsync(
    async ({ user, query }: { user: TUser; query: TGetRideHistoryArgs }) => {
      const payload: TGetRideHistoryArgs = {
        ...query,
      };

      //? flag to identify if the requester is a driver
      let is_driver = false;

      //? show user and driver their own ride history
      if (user.role === EUserRole.DRIVER) {
        payload.driver_id = user.id;
        is_driver = true;
      } else {
        payload.user_id = user.id;
      }

      const tripHistory = await RideHistoryServices.tripHistory(payload);
      const parcelHistory = await RideHistoryServices.parcelHistory(payload);

      return {
        message: 'Ride history fetched successfully!',
        meta: {
          pagination: {
            page: query.page,
            limit: query.limit,
            total:
              tripHistory.meta.pagination.total +
              parcelHistory.meta.pagination.total,
            totalPages: Math.max(
              tripHistory.meta.pagination.totalPages,
              parcelHistory.meta.pagination.totalPages,
            ),
          },
        },
        data: [
          ...tripHistory.data.map(({ user, driver, ...trip }) => ({
            ...trip,
            user: is_driver ? user : driver, //? show rider info to driver and driver info to user
            is_parcel: false,
          })),
          ...parcelHistory.data.map(({ user, driver, ...parcel }) => ({
            ...parcel,
            is_parcel: true,
            user: is_driver ? user : driver, //? show sender info to driver and receiver info to user
          })),
          ...parcelHistory.data,
        ].sort((a, b) => b.requested_at.getTime() - a.requested_at.getTime()),
      };
    },
  ),
};
