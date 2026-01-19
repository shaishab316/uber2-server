import catchAsync from '@/app/middlewares/catchAsync';
import { AdminServices } from './Admin.service';
import { TGetOverview, TUserTripDetailsArgs } from './Admin.interface';
import { prisma } from '@/utils/db';
import { userOmit } from '../user/User.constant';

export const AdminControllers = {
  userTripDetails: catchAsync(async req => {
    const query = req.query as TUserTripDetailsArgs;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      omit: userOmit.USER,
    });

    const { data, meta } =
      await AdminServices[`user${query.tab}Details`](query);

    return {
      message: `${query.tab} details fetched successfully.`,
      data,
      meta: {
        ...meta,
        currentUser: user,
      },
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
