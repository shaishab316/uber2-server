import { totp } from 'otplib';
import config from '@/config';
import ms from 'ms';
import { TGenerateOTP, TValidateOTP } from '@/types/utils.types';

totp.options = {
  digits: config?.otp?.length ?? 6,
  algorithm: 'sha256' as any,
  step: ms(config?.otp?.exp) / 1000,
};

/**
 * Generate numeric OTP using TOTP
 */
export const generateOTP: TGenerateOTP = ({ tokenType, otpId }) =>
  totp.generate(config.jwt[tokenType].secret + otpId);

/**
 * Validate OTP using TOTP
 */
export const validateOTP: TValidateOTP = ({ otp, tokenType, otpId }) =>
  totp.check(otp, config.jwt[tokenType].secret + otpId);
