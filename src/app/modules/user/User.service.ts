import {
  userSearchableFields as searchFields,
  userOmit,
  userSelfOmit,
} from './User.constant';
import { type Prisma, prisma, User as TUser } from '@/utils/db';
import type { TPagination } from '@/utils/server/serveResponse';
import type {
  TDeleteUser,
  TGetAllUser,
  TGetPendingUsers,
  TPendingUserAction,
  TSetupUserProfile,
  TUpdateOneSignalId,
  TUserEdit,
  TUserRegister,
} from './User.interface';
import ServerError from '@/errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { hashPassword } from '../auth/Auth.utils';
import deleteFilesQueue from '@/utils/mq/deleteFilesQueue';
import stripeAccountConnectQueue from '@/utils/mq/stripeAccountConnectQueue';
import { NotificationServices } from '../notification/Notification.service';

export const UserServices = {
  async userRegister({ password, email, phone, role }: TUserRegister) {
    AuthServices.validEmailORPhone({ email, phone });

    //! check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `User already exists with this ${email ? 'email' : ''} ${phone ? 'phone' : ''}`.trim(),
      );

    //! finally create user and in return omit auth fields
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: await hashPassword(password),
        role,
        is_verified: true,
      },
      omit: userSelfOmit[role],
    });

    //? create wallet for user
    await prisma.wallet.create({
      data: { id: user.id },
    });

    await stripeAccountConnectQueue.add({
      user_id: user.id,
    });

    // try {
    //   const otp = generateOTP({
    //     tokenType: 'access_token',
    //     otpId: user.id + otp_id,
    //   });

    //   if (email)
    //     await emailQueue.add({
    //       to: email,
    //       subject: `Your ${config.server.name} Account Verification OTP is ⚡ ${otp} ⚡.`,
    //       html: await emailTemplate({
    //         userName: user.name,
    //         otp,
    //         template: 'account_verify',
    //       }),
    //     });
    // } catch (error: any) {
    //   errorLogger.error(error.message);
    // }

    //? Send welcome notification
    await NotificationServices.createNotification({
      user_id: user.id,
      title: 'Welcome to Pathao!',
      message:
        'Thank you for registering. Please verify your account to get started.',
      type: 'INFO',
    });

    return user;
  },

  async updateUser({ user, body }: { user: Partial<TUser>; body: TUserEdit }) {
    if (body.phone || body.email) {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: body.email }, { phone: body.phone }] },
        select: { id: true, email: true, phone: true },
      });

      if (existingUser && existingUser.id !== user.id) {
        throw new ServerError(
          StatusCodes.CONFLICT,
          `User already exists with this ${existingUser.email ? 'email' : ''} ${existingUser.phone ? 'phone' : ''}`.trim(),
        );
      }
    }

    body.avatar ||= undefined;
    if (body.avatar && user?.avatar) await deleteFilesQueue.add([user.avatar]);

    return prisma.user.update({
      where: { id: user.id },
      omit: userOmit[body.role ?? user.role!],
      data: body,
    });
  },

  async getAllUser({ page, limit, search, role }: TGetAllUser) {
    const where: Prisma.UserWhereInput = {
      role,
      is_deleted: false,
    };

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where,
      omit: userSelfOmit[role],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      users,
    };
  },

  async getUserById({
    userId,
    omit = undefined,
  }: {
    userId: string;
    omit?: Prisma.UserOmit;
  }) {
    return prisma.user.findUnique({
      where: { id: userId },
      omit,
    });
  },

  async getUsersCount() {
    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    return Object.fromEntries(
      counts.map(({ role, _count }) => [role, _count._all]),
    );
  },

  async deleteAccount({ user_id }: TDeleteUser) {
    const user = await prisma.user.findUnique({ where: { id: user_id } });

    if (user?.avatar) await deleteFilesQueue.add([user.avatar]);

    return prisma.user.update({
      where: { id: user_id },
      data: { is_deleted: true },
      omit: userSelfOmit[user!.role],
    });
  },

  async setupUserProfile({
    avatar,
    date_of_birth,
    gender,
    name,
    nid_photos,
    user_id,
  }: TSetupUserProfile) {
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    // Clean up old files
    if (user?.avatar) await deleteFilesQueue.add([user.avatar]);
    if (user?.nid_photos) await deleteFilesQueue.add(user.nid_photos);

    return prisma.user.update({
      where: { id: user_id },
      data: {
        avatar,
        date_of_birth,
        gender,
        name,
        nid_photos,

        is_verification_pending: true,
      },
      omit: userSelfOmit.USER,
    });
  },

  async getPendingUsers({ limit, page, search, role }: TGetPendingUsers) {
    const where: Prisma.UserWhereInput = {
      is_verification_pending: true,
      role,
    };

    if (search) {
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit: {
        ...userSelfOmit[role],
        capture_avatar: false, //? allow capture avatar for admin review
      },
    });

    const total = await prisma.user.count({
      where,
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
      users,
    };
  },

  //?? Admin Actions
  async pendingUserAction({ action, user_id }: TPendingUserAction) {
    return prisma.user.update({
      where: { id: user_id },
      data: {
        is_verification_pending: false,
        is_active: action === 'approve',
      },
      omit: userSelfOmit.USER,
    });
  },

  async uploadCaptureAvatar({
    avatar,
    user_id,
  }: {
    user_id: string;
    avatar: string;
  }) {
    if (!avatar) {
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Avatar is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (user?.capture_avatar) await deleteFilesQueue.add([user.capture_avatar]);

    return prisma.user.update({
      where: { id: user_id },
      data: {
        capture_avatar: avatar,
        is_verification_pending: true,
      },
      omit: userSelfOmit[user!.role],
    });
  },

  async onesignalIdUpdate({ onesignal_id, user_id }: TUpdateOneSignalId) {
    await prisma.user.update({
      where: { id: user_id },
      data: {
        onesignal_id,
      },
    });
  },
};
