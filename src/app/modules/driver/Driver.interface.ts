import z from 'zod';
import { DriverValidations } from './Driver.validation';

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
