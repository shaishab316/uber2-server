import catchAsync from '../../middlewares/catchAsync';
import { TGetEarningsArgs } from './Driver.interface';
import { DriverServices } from './Driver.service';

export const DriverControllers = {
  superGetPendingDrivers: catchAsync(async ({ query }) => {
    const { meta, users } = await DriverServices.superGetPendingDriver(query);

    return {
      message: 'Pending drivers retrieved successfully!',
      meta,
      data: users,
    };
  }),

  superApproveDriver: catchAsync(async ({ params }) => {
    const data = await DriverServices.superApproveDriver(params.driverId);

    return {
      message: 'Driver approved successfully!',
      data,
    };
  }),

  superRejectDriver: catchAsync(async ({ params }) => {
    const data = await DriverServices.superRejectDriver(params.driverId);

    return {
      message: 'Driver rejected successfully!',
      data,
    };
  }),

  setupDriverProfile: catchAsync(async ({ body, user }) => {
    const data = await DriverServices.setupDriverProfile({
      ...body,
      driver_id: user.id,
    });

    return {
      message: 'Driver Profile setup successfully!',
      data,
    };
  }),

  setupVehicle: catchAsync(async ({ body, user }) => {
    const data = await DriverServices.setupVehicle({
      ...body,
      driver_id: user.id,
    });

    return {
      message: 'Vehicle setup successfully!',
      data,
    };
  }),

  getEarnings: catchAsync(async ({ query }: { query: TGetEarningsArgs }) => {
    const { meta, data } = await DriverServices[`${query.tab}Earnings`](query);

    return {
      message: 'Driver earnings retrieved successfully!',
      meta,
      data,
    };
  }),

  home: catchAsync(async ({ user: driver }) => {
    const data = await DriverServices.home({ driver_id: driver.id });

    return {
      message: 'Driver home data retrieved successfully!',
      data,
    };
  }),
};
