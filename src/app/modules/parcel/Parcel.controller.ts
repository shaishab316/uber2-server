import catchAsync from '../../middlewares/catchAsync';
import { ParcelServices } from './Parcel.service';

export const ParcelControllers = {
  requestForParcel: catchAsync(async ({ body, user }) => {
    const parcel = await ParcelServices.requestForParcel({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Parcel requested successfully!',
      data: parcel,
    };
  }),
};
