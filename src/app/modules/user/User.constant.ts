import { EUserRole, Prisma, User as TUser } from '@/utils/db';

export const userSearchableFields = [
  'name',
  'email',
  'phone',
] satisfies (keyof TUser)[];

const selfOmit = {
  password: true,
  location_lng: true,
  location_lat: true,
  location_type: true,
} satisfies Prisma.UserOmit;

export const userDefaultOmit = {
  email: true,
  phone: true,
  is_verified: true,
  is_active: true,
  is_admin: true,
  updated_at: true,
  created_at: true,
  is_verification_pending: true,
  date_of_birth: true,
  nid_photos: true,
  location_address: true,
} satisfies Prisma.UserOmit;

export const userUserOmit = {
  ...selfOmit,
  driving_license_photos: true,
  vehicle_brand: true,
  vehicle_model: true,
  vehicle_photos: true,
  vehicle_plate_number: true,
  vehicle_registration_photos: true,
  vehicle_type: true,
  trip_given_count: true,
} satisfies Prisma.UserOmit;

export const userDriverOmit = {
  ...selfOmit,
  trip_received_count: true,
};

export const userSelfOmit = {
  [EUserRole.USER]: userUserOmit,
  [EUserRole.DRIVER]: userDriverOmit,
};

export const userOmit = {
  [EUserRole.USER]: { ...userDefaultOmit, ...userUserOmit },
  [EUserRole.DRIVER]: { ...userDefaultOmit, ...userDriverOmit },
};
