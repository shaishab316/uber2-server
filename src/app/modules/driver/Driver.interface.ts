import z from 'zod';
import { DriverValidations } from './Driver.validation';
import { TList } from '../query/Query.interface';

export type TSetupDriverProfile = z.infer<
  typeof DriverValidations.setupDriverProfile
>['body'] & { driver_id: string };

export type TSetupVehicle = z.infer<
  typeof DriverValidations.setupVehicle
>['body'] & { driver_id: string };

export type TToggleOnline = z.infer<typeof DriverValidations.toggleOnline> & {
  driver_id: string;
};

export type TRefreshLocation = z.infer<
  typeof DriverValidations.refreshLocation
> & { driver_id: string };

export type TGetEarningsArgs = z.infer<
  typeof DriverValidations.getEarnings
>['query'] & {
  driver_id: string;
} & TList;
