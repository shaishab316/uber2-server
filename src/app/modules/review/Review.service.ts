import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { TGiveReview } from './Review.interface';
import { ZodError } from 'zod';

export const ReviewServices = {
  async giveReview({ reviewer_id, user_id, ...payload }: TGiveReview) {
    if (payload.ref_parcel_id) {
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewer_id,
          ref_parcel_id: payload.ref_parcel_id,
        },
        select: { id: true },
      });

      if (existingReview)
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'You have already reviewed',
        );
    }
    // Todo: do for ref_trip_id
    else {
      throw new ZodError([
        {
          code: 'custom',
          path: ['ref_parcel_id'],
          message: 'Reference parcel id is missing',
        },
      ]);
    }

    return prisma.$transaction(async tx => {
      // Create the review
      const review = await tx.review.create({
        data: {
          ...payload,
          reviewer_id,
          user_id,
        },
      });

      // Calculate new average rating
      const aggregation = await tx.review.aggregate({
        where: { user_id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      // Update user rating
      await tx.user.update({
        where: { id: user_id },
        data: {
          rating_count: aggregation._count.rating,
          rating: aggregation._avg.rating ?? 5,
        },
      });

      return review;
    });
  },
};
