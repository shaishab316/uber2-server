import z from 'zod';
import { EParcelType } from '../../../../prisma';
import { locationSchema } from '../user/User.validation';

export const ParcelValidations = {
  requestForParcel: z.object({
    body: z.object({
      parcel_type: z.enum(EParcelType).default(EParcelType.MEDIUM),
      pickup_location: locationSchema,
      dropoff_location: locationSchema,
      weight: z.coerce.number().min(1).max(1000).default(10),
      amount: z.coerce.number().min(1).max(1000).default(10),
    }),
  }),
};
