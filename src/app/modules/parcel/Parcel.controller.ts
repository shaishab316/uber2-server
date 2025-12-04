import catchAsync from '@/app/middlewares/catchAsync';
import { ParcelServices } from './Parcel.service';

export const ParcelControllers = {
  getParcelDetails: catchAsync(async ({ params }) => {
    const parcel = await ParcelServices.getParcelDetails(params.parcel_id);

    return {
      message: 'Parcel details fetched successfully',
      data: parcel,
    };
  }),
};
