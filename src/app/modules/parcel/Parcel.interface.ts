import type z from 'zod';
import { ParcelValidations } from './Parcel.validation';

export type TRequestForParcel = z.infer<
  typeof ParcelValidations.requestForParcel
> & { user_id: string };

export type TGetNearestDriver = {
  pickup_lat: number;
  pickup_lng: number;
};
