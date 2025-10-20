import { Prisma, User as TUser } from '../../../../prisma';

export const userSearchableFields: (keyof TUser)[] = ['name', 'email', 'phone'];

export const userOmit: Prisma.UserOmit = {
  password: true,
  is_verification_pending: true,
};
