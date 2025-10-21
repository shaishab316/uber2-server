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
    UserControllers.superGetAllUser,
  );

  admin.patch(
    ':userId/edit',
    avatarCapture,
    purifyRequest(
      QueryValidations.exists('userId', 'user'),
      UserValidations.edit,
    ),
    UserControllers.superEditProfile,
  );

  admin.delete(
    '/:userId/delete',
    purifyRequest(QueryValidations.exists('userId', 'user')),
    UserControllers.superDeleteAccount,
  );
}

const user = Router();
{
  user.get('/', UserControllers.profile);

  user.patch(
    '/edit',
    avatarCapture,
    purifyRequest(UserValidations.edit),
    UserControllers.editProfile,
  );

  user.delete('/delete', UserControllers.deleteAccount);

  user.post(
    '/change-password',
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );

  user.post(
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
}

export const UserRoutes = {
  admin,
  user,
};
