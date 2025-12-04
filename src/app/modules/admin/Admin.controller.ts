import catchAsync from '@/app/middlewares/catchAsync';
import { AdminServices } from './Admin.service';
import { TUserTripDetailsArgs } from './Admin.interface';

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
};
