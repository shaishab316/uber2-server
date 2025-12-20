import { Router } from 'express';
import { RideHistoryControllers } from './RideHistory.controller';
import purifyRequest from '@/app/middlewares/purifyRequest';
import { RideHistoryValidations } from './RideHistory.validation';
import { QueryValidations } from '../query/Query.validation';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(QueryValidations.list, RideHistoryValidations.getHistory),
    RideHistoryControllers.getRideHistory,
  );
}

export const RideHistoryRoutes = { all };
