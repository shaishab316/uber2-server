import type { z } from 'zod';
import type { RideHistoryValidations } from './RideHistory.validation';
import type { TList } from '../query/Query.interface';

export type TGetRideHistoryArgs = z.infer<
  typeof RideHistoryValidations.getHistory
>['query'] & {
  user_id?: string;
  driver_id?: string;
} & TList;
