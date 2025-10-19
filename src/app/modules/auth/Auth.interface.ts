import type z from 'zod';
import { AuthValidations } from './Auth.validation';

export type TUserLogin = z.infer<typeof AuthValidations.login>['body'];
export type TAccountVerify = z.infer<
  typeof AuthValidations.accountVerify
>['body'];
export type TAccountVerifyOtpSend = z.infer<
  typeof AuthValidations.otpSend
>['body'];
