import catchAsync from '@/app/middlewares/catchAsync';
import { ParcelServices } from './Parcel.service';
import { calculateParcelCost } from './Parcel.utils';
import { TGetSuperParcelDetails } from './Parcel.interface';

export const ParcelControllers = {
  getParcelDetails: catchAsync(async ({ params }) => {
    const parcel = await ParcelServices.getParcelDetails(params.parcel_id);

    return {
      message: 'Parcel details fetched successfully',
      data: parcel,
    };
  }),

  /**
   * Calculate estimated fare for a parcel
   */
  calculateEstimatedFare: catchAsync(async ({ body }) => {
    const estimatedFare = await calculateParcelCost(body);

    return {
      message: 'Estimated fare calculated successfully',
      data: { estimated_fare: estimatedFare, query: body },
    };
  }),

  /**
   * Get super detailed parcel info for admin
   */
  getSuperParcelDetails: catchAsync<TGetSuperParcelDetails>(
    async ({ params }) => {
      const parcel = await ParcelServices.getSuperParcelDetails(params);

      return {
        message: 'Super parcel details fetched successfully',
        data: parcel,
      };
    },
  ),
};
