import config from '../config';
import ms from 'ms';
import { accountVerifyTemplate } from './accountVerifyTemplate';
import { resetPasswordTemplate } from './resetPasswordTemplate';

export type TTemplate = {
  userName: string;
  otp: string;
  template: 'reset_password' | 'account_verify';
};

export type TTemplateData = {
  companyName: string;
  userName: string;
  otp: string;
  expiryTime: string;
  verificationUrl: string;
  resetUrl: string;
  supportUrl: string;
  privacyUrl: string;
  unsubscribeUrl: string;
  currentYear: number;
};

export const emailTemplate = ({
  otp,
  template,
  userName,
}: TTemplate): string => {
  const data = {
    companyName: config.server.name,
    userName,
    otp,
    expiryTime: ms(ms(config.otp.exp), { long: true }),
    verificationUrl: `http://localhost:3000/verify?email=${encodeURIComponent(userName)}`,
    resetUrl: `http://localhost:3000/reset-password?email=${encodeURIComponent(userName)}`,
    supportUrl: config.email.support,
    privacyUrl: `http://localhost:3000/privacy`,
    unsubscribeUrl: `http://localhost:3000/unsubscribe?email=${encodeURIComponent(userName)}`,
    currentYear: new Date().getFullYear(),
  };

  return {
    account_verify: accountVerifyTemplate,
    reset_password: resetPasswordTemplate,
  }[template](data);
};
