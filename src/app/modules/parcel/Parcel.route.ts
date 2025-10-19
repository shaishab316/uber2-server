import { Router } from 'express';

const user = Router();
{
  // user routes ...
}

const driver = Router();
{
  // driver routes ...
}

const admin = Router();
{
  // admin routes ...
}

export const ParcelRoutes = { user, driver, admin };
