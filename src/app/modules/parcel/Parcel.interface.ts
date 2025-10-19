import type z from 'zod';
import { ParcelValidations } from './Parcel.validation';

export type TRequestForParcel = z.infer<
  typeof ParcelValidations.requestForParcel
>['body'] & { user_id: string };
