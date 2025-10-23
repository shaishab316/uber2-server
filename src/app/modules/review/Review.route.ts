import { Router } from 'express';
import { ReviewControllers } from './Review.controller';
import { ReviewValidations } from './Review.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const user = Router();
{
  user.post(
    '/give-review',
    purifyRequest(ReviewValidations.giveReview),
    ReviewControllers.giveReview,
  );
}

export const ReviewRoutes = { user };
