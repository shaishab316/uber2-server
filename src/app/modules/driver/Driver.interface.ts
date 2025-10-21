import z from 'zod';
import { DriverValidations } from './Driver.validation';

export type TSetupDriverProfile = z.infer<
  typeof DriverValidations.setupDriverProfile
>['body'] & { driver_id: string };
