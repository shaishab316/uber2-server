import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import { NotificationServices } from './Notification.service';
import serveResponse from '../../../utils/server/serveResponse';

export const NotificationControllers = {
  getAllNotifications: catchAsync(async ({ query }, res) => {
    const { meta, notifications } =
      await NotificationServices.getAllNotifications(query);

    serveResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Notifications retrieved successfully',
      meta,
      data: notifications,
    });
  }),
};
