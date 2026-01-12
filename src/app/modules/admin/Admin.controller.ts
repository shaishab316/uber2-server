import catchAsync from '@/app/middlewares/catchAsync';
import { AdminServices } from './Admin.service';
import { TGetOverview, TUserTripDetailsArgs } from './Admin.interface';

export const AdminControllers = {
  userTripDetails: catchAsync(async req => {
    const query = req.query as TUserTripDetailsArgs;

    const { data, meta } =
      await AdminServices[`user${query.tab}Details`](query);

    return {
      message: `${query.tab} details fetched successfully.`,
      data,
      meta,
    };
  }),

  /**
   * get whole app overview
   */
  getOverview: catchAsync<TGetOverview>(async ({ query }) => {
    const data = await AdminServices.getOverview(query);

    return {
      message: 'Overview fetched successfully.',
      data,
    };
  }),
};
