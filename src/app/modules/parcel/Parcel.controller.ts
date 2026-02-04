import catchAsync from '@/app/middlewares/catchAsync';
import { ParcelServices } from './Parcel.service';
import { calculateParcelCost } from './Parcel.utils';
import {
  TCancelParcelV2,
  TDeliverParcel,
  TGetSuperParcelDetails,
  TPayForParcelV2,
  TRequestForParcelV2,
} from './Parcel.interface';
import { StatusCodes } from 'http-status-codes';
import { SocketServices } from '../socket/Socket.service';
import { NotificationServices } from '../notification/Notification.service';
import { RIDE_KIND } from '../trip/Trip.constant';
import { TRideResponseV2 } from '../trip/Trip.interface';

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

  getLastParcel: catchAsync(async ({ user }) => {
    let parcel: any = null;

    if (user.role === 'DRIVER') {
      parcel = await ParcelServices.getLastDriverParcel({
        driver_id: user.id,
      });
    } else if (user.role === 'USER') {
      parcel = await ParcelServices.getLastUserParcel({
        user_id: user.id,
      });
    }

    return {
      statusCode: parcel ? StatusCodes.OK : StatusCodes.NO_CONTENT,
      message: 'Last parcel fetched successfully',
      data: parcel,
    };
  }),

  /**
   * Driver deliver parcel
   */
  deliverParcel: catchAsync<TDeliverParcel>(async ({ body, user: driver }) => {
    const parcel = await ParcelServices.deliverParcel({
      ...body,
      driver_id: driver.id,
    });

    if (parcel.user_id) {
      //? Notify user that their parcel is being delivered
      SocketServices.emitToUser(parcel.user_id, 'parcel:delivered', parcel);
    }

    return {
      message: 'Parcel delivery data submitted successfully',
      data: parcel,
    };
  }),

  /**
   * V2 Controllers
   */

  /**
   * request for parcel v2
   */
  requestForParcelV2: catchAsync<TRequestForParcelV2>(
    async ({ body: payload, user }) => {
      const data = await ParcelServices.requestForParcel({
        ...payload,
        user_id: user.id,
      });

      //? Notify user that their parcel request is being processed
      await NotificationServices.createNotification({
        user_id: user.id,
        title: 'Parcel Request Received',
        message: 'Searching for nearby drivers...',
        type: 'INFO',
      });

      return {
        message: 'Parcel request submitted successfully',
        data: {
          kind: RIDE_KIND.PARCEL,
          trip: null,
          parcel: data,
        } satisfies TRideResponseV2,
      };
    },
  ),

  /**
   * cancel parcel v2
   */
  cancelParcelV2: catchAsync<TCancelParcelV2>(
    async ({ body: payload, user }) => {
      const data = await ParcelServices.cancelParcel({
        parcel_id: payload.parcel_id,
        user_id: user.id,
      });

      return {
        message: 'Parcel cancelled successfully',
        data: {
          kind: RIDE_KIND.PARCEL,
          trip: null,
          parcel: data,
        } satisfies TRideResponseV2,
      };
    },
  ),

  /**
   * pay for parcel v2
   */
  payForParcelV2: catchAsync<TPayForParcelV2>(
    async ({ body: payload, user }) => {
      const { transaction, parcel, wallet } = await ParcelServices.payForParcel(
        {
          parcel_id: payload.parcel_id,
          user_id: user.id,
        },
      );

      //? Notify driver that parcel has been paid
      SocketServices.emitToUser(parcel.driver_id!, 'parcel:paid', {
        parcel,
        transaction,
        user: {
          name: user.name,
          trip_received_count: user.trip_received_count,
          avatar: user.avatar,
          rating: user.rating,
          rating_count: user.rating_count,
        },
      });

      return {
        message: 'Parcel paid successfully',
        data: {
          kind: RIDE_KIND.PARCEL,
          trip: null,
          parcel,

          //? extra data
          current_balance: wallet?.balance,
          transaction,
          parcel_id: parcel.id,
        } satisfies TRideResponseV2,
      };
    },
  ),
};
