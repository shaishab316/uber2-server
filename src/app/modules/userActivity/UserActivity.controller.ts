import catchAsync from '@/app/middlewares/catchAsync';
import { UserActivityServices } from './UserActivity.service';

/**
 * Controller layer for managing user activities
 */
export const UserActivityControllers = {
  /**
   * Toggle the read status of a user activity
   */
  toggleReadStatus: catchAsync(async ({ body }) => {
    await UserActivityServices.toggleReadStatus(body);

    return {
      message: `Activity ${body?.unread ? 'marked as unread' : 'marked as read'} successfully`,
    };
  }),

  /**
   * Delete a user activity
   */
  deleteActivity: catchAsync(async ({ body }) => {
    await UserActivityServices.deleteActivity(body);

    return {
      message: 'Activity deleted successfully',
    };
  }),

  /**
   * Get all user activities with optional filters and pagination
   */
  getAllActivity: catchAsync(async ({ query }) => {
    const { activities, meta } =
      await UserActivityServices.getAllActivity(query);

    return {
      message: 'User activities fetched successfully',
      meta,
      data: activities,
    };
  }),
};
