import { Router } from 'express';
import { TransactionControllers } from './Transaction.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(QueryValidations.list),
    TransactionControllers.getUserTransactions,
  );
}

const driver = Router();
{
  driver.get(
    '/',
    purifyRequest(QueryValidations.list),
    TransactionControllers.getDriverTransactions,
  );
}

const admin = Router();
{
  admin.get(
    '/',
    purifyRequest(QueryValidations.list),
    TransactionControllers.getSuperTransactions,
  );
}

export const TransactionRoutes = { all, admin, driver };
