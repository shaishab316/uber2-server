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
    if (payload.ref_trip_id) {
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewer_id,
          ref_trip_id: payload.ref_trip_id,
        },
        select: { id: true },
      });

      if (existingReview)
        review = await prisma.review.update({
          where: { id: existingReview.id },
          data: payload,
        });
    } else {
      throw new ZodError(
        ['trip', 'parcel'].map(field => ({
          code: 'custom',
          path: [`ref_${field}_id`],
          message: `Reference ${field} id is missing`,
        })),
      );
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
