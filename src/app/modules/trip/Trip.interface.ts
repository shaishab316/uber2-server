import z from 'zod';
import { TripValidations } from './Trip.validation';

/**
 * @type : validation for request for trip
 */
export type TRequestForTrip = z.infer<typeof TripValidations.requestForTrip> & {
  user_id: string;
};

export type TTripRefreshLocation = z.infer<
  typeof TripValidations.refreshLocation
>;

export type TGetSuperTripDetailsParams = {
  trip_id: string;
};

export type TGetSuperTripDetailsPayload = TGetSuperTripDetailsParams;

export type TGetSuperTripDetails = {
  params: TGetSuperTripDetailsParams;
};
