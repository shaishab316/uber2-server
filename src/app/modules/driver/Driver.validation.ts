import z from 'zod';
import { date } from '../../../utils/transform/date';
import { enum_encode } from '../../../utils/transform/enum';
import { EGender } from '../../../../prisma';

export const DriverValidations = {
  setupDriverProfile: z.object({
    body: z.object({
      avatar: z
        .string({
          error: 'Avatar is required',
        })
        .nonempty('Avatar is required'),
      name: z
        .string({
          error: 'Name is required',
        })
        .nonempty('Name is required'),
      date_of_birth: z.union([
        z.string().transform(date).pipe(z.date()),
        z.date(),
      ]),
      gender: z
        .string({
          error: 'Gender is required',
        })
        .transform(enum_encode)
        .pipe(z.enum(EGender)),
      nid_photo: z
        .array(
          z
            .string({
              error: 'NID or Passport is required',
            })
            .nonempty('NID or Passport is required'),
        )
        .nonempty('NID or Passport is required'),
      driving_license: z
        .array(
          z
            .string({
              error: 'Driving license is required',
            })
            .nonempty('Driving license is required'),
        )
        .nonempty('Driving license is required'),
    }),
  }),
};
