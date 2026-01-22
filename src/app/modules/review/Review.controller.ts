import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import { ReviewServices } from './Review.service';

export const ReviewControllers = {
  giveReview: catchAsync(async ({ body, user }) => {
    await ReviewServices.giveReview({
      ...body,
      reviewer_id: user.id,
    });

    return {
      statusCode: StatusCodes.CREATED,
      message: 'Review given successfully!',
      data: body,
    };
  }),
};
