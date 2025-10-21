import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { User as TUser } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { enum_decode } from '../../../utils/transform/enum';
import { capitalize } from '../../../utils/transform/capitalize';

export const UserControllers = {
  register: catchAsync(async ({ body }, res) => {
    const user = await UserServices.userRegister(body);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    return {
      statusCode: StatusCodes.CREATED,
      message: `${capitalize(user.role) ?? 'Unknown'} registered successfully!`,
      data: {
        access_token,
        refresh_token,
        user,
      },
    };
  }),

  editProfile: catchAsync(async req => {
    const data = await UserServices.updateUser(req);

    return {
      message: 'Profile updated successfully!',
      data,
    };
  }),

  superEditProfile: catchAsync(async ({ params, body }) => {
    const user = (await prisma.user.findUnique({
      where: { id: params.userId },
    })) as TUser;

    const data = await UserServices.updateUser({
      user,
      body,
    });

    return {
      message: `${capitalize(user?.role) ?? 'User'} updated successfully!`,
      data,
    };
  }),

  getAllUser: catchAsync(async ({ query }) => {
    const { meta, users } = await UserServices.getAllUser(query);

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  superGetAllUser: catchAsync(async ({ query }) => {
    const { meta, users } = await UserServices.getAllUser(query);

    Object.assign(meta, {
      users: await UserServices.getUsersCount(),
    });

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  profile: catchAsync(({ user: { password: _, ...user } }) => {
    return {
      message: 'Profile retrieved successfully!',
      data: user,
    };
  }),

  superDeleteAccount: catchAsync(async ({ params }) => {
    const user = await UserServices.deleteAccount(params.userId);

    return {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    };
  }),

  deleteAccount: catchAsync(async ({ user }) => {
    await UserServices.deleteAccount(user.id);

    return {
      message: `Goodbye ${user?.name ?? enum_decode(user.role)}! Your account has been deleted successfully!`,
    };
  }),

  setupUserProfile: catchAsync(async ({ body, user }) => {
    const data = await UserServices.setupUserProfile({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Profile setup successfully!',
      data,
    };
  }),
};
