import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import { NotificationServices } from './Notification.service';
import serveResponse from '../../../utils/server/serveResponse';

export const NotificationControllers = {
  getAllNotifications: catchAsync(async ({ query, user }, res) => {
    const { meta, notifications } =
      await NotificationServices.getAllNotifications({
        ...query,
        user_id: user.id,
      });

    serveResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Notifications retrieved successfully',
      meta,
      data: notifications,
    });
  }),
};
