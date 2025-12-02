/* eslint-disable no-var */
import { User as TUser } from '@/utils/db';

declare global {
  namespace Express {
    interface Request {
      user: TUser;
      tempFiles: string[];
    }
  }
}
