import { z } from 'zod';
import { TModelZod } from '@/types/zod';
import { Trip as TTrip } from '@/utils/db';
import { exists } from '@/utils/db/exists';

export const TripValidations = {
  //! Socket
  requestForTrip: z.object({
    pickup_type: z.literal('Point').default('Point'),
    pickup_lat: z.coerce
      .number({ error: 'Pickup latitude is required' })
      .refine(lat => lat >= -90 && lat <= 90, {
        error: 'Pickup latitude must be between -90 and 90',
      }),
    pickup_lng: z.coerce
      .number({ error: 'Pickup longitude is required' })
      .refine(lng => lng >= -180 && lng <= 180, {
        error: 'Pickup longitude must be between -180 and 180',
      }),
    pickup_address: z.string().optional(),

    dropoff_type: z.literal('Point').default('Point'),
    dropoff_lat: z.coerce
      .number({ error: 'Dropoff latitude is required' })
      .refine(lat => lat >= -90 && lat <= 90, {
        error: 'Dropoff latitude must be between -90 and 90',
      }),
    dropoff_lng: z.coerce
      .number({ error: 'Dropoff longitude is required' })
      .refine(lng => lng >= -180 && lng <= 180, {
        error: 'Dropoff longitude must be between -180 and 180',
      }),
    dropoff_address: z.string().optional(),
  } satisfies TModelZod<TTrip>),

  refreshLocation: z.object({
    location_type: z.literal('Point').default('Point'),
    location_lat: z.coerce
      .number({ error: 'Location latitude is required' })
      .refine(lat => lat >= -90 && lat <= 90, {
        error: 'Location latitude must be between -90 and 90',
      }),
    location_lng: z.coerce
      .number({ error: 'Location longitude is required' })
      .refine(lng => lng >= -180 && lng <= 180, {
        error: 'Location longitude must be between -180 and 180',
      }),
    location_address: z.string().optional(),
    trip_id: z.string().refine(exists('trip'), {
      error: ({ input }) => `Trip not found with id: ${input}`,
    }),
  }),
};
