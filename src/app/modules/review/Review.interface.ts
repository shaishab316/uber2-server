import type z from 'zod';
import { ReviewValidations } from './Review.validation';

export type TGiveReview = z.infer<
  typeof ReviewValidations.giveReview
>['body'] & { reviewer_id: string };
