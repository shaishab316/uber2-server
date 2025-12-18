import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import capture from '../../middlewares/capture';
import { AuthControllers } from '../auth/Auth.controller';

const avatarCapture = capture({
  avatar: {
    size: 5 * 1024 * 1024,
    maxCount: 1,
    fileType: 'images',
  },
});

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, UserValidations.getAllUser),
    UserControllers.getAllUser,
  );

  admin.patch(
    ':user_id/edit',
    avatarCapture,
    purifyRequest(
      QueryValidations.exists('user_id', 'user'),
      UserValidations.edit,
    ),
    UserControllers.superEditProfile,
  );

  admin.delete(
    '/',
    purifyRequest(UserValidations.deleteUser),
    UserControllers.superDeleteAccount,
  );

  /**
   * GET Pending Users
   */
  admin.get(
    '/pending-users',
    purifyRequest(QueryValidations.list, UserValidations.getPendingUsers),
    UserControllers.getPendingUsers,
  );

  /**
   * Pending User Action
   */
  admin.post(
    '/pending-users',
    purifyRequest(UserValidations.pendingUserAction),
    UserControllers.pendingUserAction,
  );
}

const all = Router();
{
  all.get('/', UserControllers.profile);

  all.patch(
    '/edit',
    avatarCapture,
    purifyRequest(UserValidations.edit),
    UserControllers.editProfile,
  );

  all.delete('/delete', UserControllers.deleteAccount);

  all.post(
    '/change-password',
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );

  /**
   * Connect stripe account
   */
  all.get('/connect-stripe', UserControllers.connectStripeAccount);

  all.post(
    '/setup-user-profile',
    capture({
      nid_photos: {
        size: 5 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
    }),
    purifyRequest(UserValidations.setupUserProfile),
    UserControllers.setupUserProfile,
  );

  all.post(
    '/upload-capture-avatar',
    avatarCapture,
    UserControllers.uploadCaptureAvatar,
  );
}

export const UserRoutes = {
  admin,
  all,
};
