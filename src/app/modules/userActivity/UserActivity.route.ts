import { Router } from 'express';
import { UserActivityControllers } from './UserActivity.controller';
import { UserActivityValidations } from './UserActivity.validation';
import { QueryValidations } from '../query/Query.validation';
import purifyRequest from '@/app/middlewares/purifyRequest';

const admin = Router();
{
  /**
   * Get all user activities with optional filters and pagination
   */
  admin.get(
    '/',
    purifyRequest(
      QueryValidations.list,
      UserActivityValidations.getAllActivity,
    ),
    UserActivityControllers.getAllActivity,
  );

  /**
   * Toggle the read status of a user activity
   */
  admin.post(
    '/',
    purifyRequest(UserActivityValidations.toggleReadStatus),
    UserActivityControllers.toggleReadStatus,
  );

  /**
   * Delete a user activity or all activities if no ID is provided
   */
  admin.delete(
    '/',
    purifyRequest(UserActivityValidations.deleteActivity),
    UserActivityControllers.deleteActivity,
  );
}

export const UserActivityRoutes = {
  /**
   * Only accessible by admin
   *
   * @url /admin/user-activities
   */
  admin,
};
