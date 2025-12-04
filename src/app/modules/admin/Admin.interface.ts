import z from 'zod';
import { AdminValidations } from './Admin.validation';
import { TList } from '../query/Query.interface';

export type TUserTripDetailsArgs = z.infer<
  typeof AdminValidations.userTripDetails
>['query'] &
  TList;
