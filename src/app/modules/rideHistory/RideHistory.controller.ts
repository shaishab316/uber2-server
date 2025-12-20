import catchAsync from '@/app/middlewares/catchAsync';
import type { TGetRideHistoryArgs } from './RideHistory.interface';
import { EUserRole } from 'prisma/client/enums';
import { RideHistoryServices } from './RideHistory.service';
import { User as TUser } from '@/utils/db';

export const RideHistoryControllers = {
  getRideHistory: catchAsync(
    async ({ user, query }: { user: TUser; query: TGetRideHistoryArgs }) => {
      const payload: TGetRideHistoryArgs = {
        ...query,
      };

      //? show user and driver their own ride history
      if (user.role === EUserRole.DRIVER) {
        payload.driver_id = user.id;
      } else {
        payload.user_id = user.id;
      }

      const { data, meta } =
        await RideHistoryServices[`${query.tab}History`](payload);

      return {
        message: 'Ride history fetched successfully!',
        meta,
        data,
      };
    },
  ),
};
