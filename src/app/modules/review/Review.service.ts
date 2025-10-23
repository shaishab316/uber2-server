import { prisma } from '../../../utils/db';
import { TGiveReview } from './Review.interface';
import { ZodError } from 'zod';
import { Review } from '../../../../prisma';

export const ReviewServices = {
  async giveReview({ reviewer_id, user_id, ...payload }: TGiveReview) {
    let review: Review;

    if (payload.ref_parcel_id) {
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewer_id,
          ref_parcel_id: payload.ref_parcel_id,
        },
        select: { id: true },
      });

      if (existingReview)
        review = await prisma.review.update({
          where: { id: existingReview.id },
          data: payload,
        });
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

    // Create new review
    review ??= await prisma.review.create({
      data: {
        ...payload,
        reviewer_id,
        user_id,
      },
    });

    // Calculate new average rating
    const aggregation = await prisma.review.aggregate({
      where: { user_id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Update user rating
    await prisma.user.update({
      where: { id: user_id },
      data: {
        rating_count: aggregation._count.rating,
        rating: aggregation._avg.rating ?? 5,
      },
    });

    return review;
  },
};
