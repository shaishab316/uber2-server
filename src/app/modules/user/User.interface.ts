import type z from 'zod';
import { UserValidations } from './User.validation';
import { TList } from '../query/Query.interface';

export type TUserRegister = z.infer<typeof UserValidations.register>['body'];
export type TUserEdit = z.infer<typeof UserValidations.edit>['body'];
export type TSetupUserProfile = z.infer<
  typeof UserValidations.setupUserProfile
>['body'] & { user_id: string };

export type TGetPendingUsers = z.infer<
  typeof UserValidations.getPendingUsers
>['query'] &
  TList;

export type TPendingUserAction = z.infer<
  typeof UserValidations.pendingUserAction
>['body'];

export type TGetAllUser = z.infer<typeof UserValidations.getAllUser>['query'] &
  TList;

export type TDeleteUser = z.infer<typeof UserValidations.deleteUser>['body'];
