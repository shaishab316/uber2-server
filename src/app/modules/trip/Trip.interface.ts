import type z from 'zod';
import { TripValidations } from './Trip.validation';
import { TList } from '../query/Query.interface';

export type TRequestForTrip = z.infer<
  typeof TripValidations.requestForTrip
>['body'] & { passenger_id: string };

export type TGetTripHistory = z.infer<
  typeof TripValidations.getTripHistory
>['query'] &
  TList & { driver_id?: string; passenger_id?: string };
