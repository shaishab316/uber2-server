import z from 'zod';
import { AdminValidations } from './Admin.validation';
import { TList } from '../query/Query.interface';

export type TUserTripDetailsArgs = z.infer<
  typeof AdminValidations.userTripDetails
>['query'] &
  TList;

export type TGetOverviewQuery = z.infer<
  typeof AdminValidations.getOverview
>['query'];

export type TGetOverview = {
  query: TGetOverviewQuery;
};

export type TGetOverviewArgs = TGetOverviewQuery;
