import z from 'zod';
import { UserActivityValidations } from './UserActivity.validation';
import { TList } from '../query/Query.interface';

export type TToggleUserActivityReadStatus = z.infer<
  typeof UserActivityValidations.toggleReadStatus
>['body'];

export type TDeleteUserActivity = z.infer<
  typeof UserActivityValidations.deleteActivity
>['body'];

export type TGetAllUserActivity = z.infer<
  typeof UserActivityValidations.getAllActivity
>['query'] &
  TList;
