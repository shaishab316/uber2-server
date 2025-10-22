import z from 'zod';
import { EParcelType } from '../../../../prisma';

export const ParcelValidations = {
  requestForParcel: z.object({
    body: z.object({
      parcel_type: z.enum(EParcelType).default(EParcelType.MEDIUM),
      weight: z.coerce.number().min(1).max(1000).default(10),
      amount: z.coerce.number().min(1).max(1000).default(10),
    }),
  }),
};
