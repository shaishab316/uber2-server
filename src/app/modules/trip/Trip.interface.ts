import z from 'zod';
import { TripValidations } from './Trip.validation';

/**
 * @type : validation for request for trip
 */
export type TRequestForTrip = z.infer<typeof TripValidations.requestForTrip> & {
  user_id: string;
};
