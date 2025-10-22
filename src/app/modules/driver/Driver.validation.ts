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
      nid_photos: z
        .array(
          z
            .string({
              error: 'NID or Passport is required',
            })
            .nonempty('NID or Passport is required'),
        )
        .nonempty('NID or Passport is required'),
      driving_license_photos: z
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

  setupVehicle: z.object({
    body: z.object({
      vehicle_type: z
        .string({
          error: 'Vehicle type is required',
        })
        .nonempty('Vehicle type is required'),
      vehicle_brand: z
        .string({
          error: 'Vehicle brand is required',
        })
        .nonempty('Vehicle brand is required'),
      vehicle_model: z
        .string({
          error: 'Vehicle model is required',
        })
        .nonempty('Vehicle model is required'),
      vehicle_plate_number: z
        .string({
          error: 'Vehicle plate number is required',
        })
        .nonempty('Vehicle plate number is required'),
      vehicle_registration_photos: z
        .array(
          z
            .string({
              error: 'Vehicle registration photo is required',
            })
            .nonempty('Vehicle registration photo is required'),
        )
        .nonempty('Vehicle registration photo is required'),
      vehicle_photos: z
        .array(
          z
            .string({
              error: 'Vehicle photo is required',
            })
            .nonempty('Vehicle photo is required'),
        )
        .nonempty('Vehicle photo is required'),
    }),
  }),

  //! socket
  toggleOnline: z.object({
    online: z.boolean({ error: 'Online status is required' }),
  }),
};
