import type z from 'zod';
import { ParcelValidations } from './Parcel.validation';

export type TRequestForParcel = z.infer<
  typeof ParcelValidations.requestForParcel
> & { user_id: string };

export type TGetNearestDriver = {
  pickup_lat: number;
  pickup_lng: number;
};

export type TParcelRefreshLocation = z.infer<
  typeof ParcelValidations.refreshLocation
>;

export type TStartParcelArgs = {
  driver_id: string;
  parcel_id: string;
};

export type TDeliverParcelArgs = z.infer<
  typeof ParcelValidations.deliver_parcel
> & { driver_id: string };
