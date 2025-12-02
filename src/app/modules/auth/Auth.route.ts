import { Router } from 'express';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';
import { UserControllers } from '../user/User.controller';
import { UserValidations } from '../user/User.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';

const free = Router();

free.post(
  '/register',
  purifyRequest(UserValidations.register),
  UserControllers.register,
);

free.post(
  '/account-verify',
  purifyRequest(AuthValidations.accountVerify),
  AuthControllers.accountVerify,
);

free.post(
  '/login',
  purifyRequest(AuthValidations.login),
  AuthControllers.login,
);

free.post(
  '/account-verify/otp-send',
  purifyRequest(AuthValidations.otpSend),
  AuthControllers.accountVerifyOtpSend,
);

free.post(
  '/forgot-password',
  purifyRequest(AuthValidations.otpSend),
  AuthControllers.forgotPassword,
);

free.post(
  '/forgot-password/otp-verify',
  purifyRequest(AuthValidations.accountVerify),
  AuthControllers.forgotPasswordOtpVerify,
);

free.post(
  '/reset-password',
  auth.reset_token,
  purifyRequest(AuthValidations.resetPassword),
  AuthControllers.resetPassword,
);

free.get('/logout', AuthControllers.logout);

/**
 * generate new access token
 */
free.get('/refresh-token', auth.refresh_token, AuthControllers.refreshToken);

export const AuthRoutes = { free };
