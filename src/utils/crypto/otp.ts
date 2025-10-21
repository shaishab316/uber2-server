import { totp } from 'otplib';
import config from '../../config';
import { TToken } from '../../app/modules/auth/Auth.utils';
import ms from 'ms';

totp.options = {
  digits: config?.otp?.length ?? 6,
  algorithm: 'sha256' as any,
  step: ms(config?.otp?.exp) / 1000,
};

/**
 * Generate numeric OTP for a user
 * @param userId User ID
 * @param tokenType Token type
 * @returns OTP string
 */
export const generateOTP = ({
  tokenType,
  userId,
}: {
  userId: string;
  tokenType: TToken;
}): string => totp.generate(config.jwt[tokenType].secret + userId);

/**
 * Validate OTP for a user
 * @param userId User ID
 * @param tokenType Token type
 * @param otp OTP string
 * @returns boolean
 */
// export const validateOTP = ({
//   otp,
//   tokenType,
//   userId,
// }: {
//   userId: string;
//   tokenType: TToken;
//   otp: string;
// }): boolean => totp.check(otp, config.jwt[tokenType].secret + userId);
// TODO: validateOTP
export const validateOTP: any = () => true;
