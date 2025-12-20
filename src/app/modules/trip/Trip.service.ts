import { StatusCodes } from 'http-status-codes';
import ServerError from '@/errors/ServerError';
import { ETransactionType, ETripStatus, prisma } from '@/utils/db';
import type { TRequestForTrip, TTripRefreshLocation } from './Trip.interface';
import { calculateTripCost, generateTripSlug } from './Trip.utils';
import { getNearestDriver } from '../parcel/Parcel.utils';
import { userOmit } from '../user/User.constant';
import { NotificationServices } from '../notification/Notification.service';

export const TripServices = {
  async getTripDetails(trip_id: string) {
    return prisma.trip.findUnique({
      where: { id: trip_id },
      include: {
        user: {
          omit: userOmit.USER,
        },
        driver: {
          omit: userOmit.DRIVER,
        },
      },
    });
  },

  //! Socket
  async requestForTrip(payload: TRequestForTrip) {
    const driver_ids = await getNearestDriver(payload);

    return prisma.trip.create({
      data: {
        ...payload,
        slug: await generateTripSlug(),
        total_cost: await calculateTripCost(payload),
        helper: {
          create: {
            driver_ids,
          },
        },
      },
    });
  },

  async acceptTrip({
    trip_id,
    driver_id,
  }: {
    trip_id: string;
    driver_id: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      select: {
        driver: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (trip?.driver?.id && trip?.driver?.id !== driver_id) {
      throw new ServerError(
        StatusCodes.CONFLICT,
        `${trip?.driver?.name?.split(' ')[0]} is already accepted this trip`,
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.ACCEPTED,
        driver_id,
        accepted_at: new Date(),
      },
    });

    //? sort for consistent chat user_ids
    const user_ids = [updatedTrip.user_id, driver_id].sort();

    //? Create chat for trip
    const chat = await prisma.chat.upsert({
      where: { id: trip_id },
      create: { user_ids },
      update: { user_ids },
    });

    //? Initial message
    await prisma.message.create({
      data: {
        chat_id: chat.id,
        user_id: driver_id,
        text: "Hi! I'am your driver. I'm here to assist you with your trip.",
      },
    });

    //? Notify user about trip acceptance
    await NotificationServices.createNotification({
      user_id: updatedTrip.user_id,
      title: 'Trip Accepted',
      message: 'A driver has accepted your trip request.',
      type: 'INFO',
    });

    return updatedTrip;
  },

  async cancelTrip({ trip_id, user_id }: { trip_id: string; user_id: string }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      select: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (trip?.user.id !== user_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't cancel ${trip?.user?.name?.split(' ')[0]}'s trip`,
      );

    const cancelledTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: { status: ETripStatus.CANCELLED, cancelled_at: new Date() },
    });

    //? Notify driver if assigned
    if (cancelledTrip.driver_id) {
      await NotificationServices.createNotification({
        user_id: cancelledTrip.driver_id,
        title: 'Trip Cancelled',
        message: 'The user has cancelled the trip.',
        type: 'WARNING',
      });
    }

    return cancelledTrip;
  },

  async getProcessingDriverTrip({ driver_id }: { driver_id: string }) {
    return prisma.trip.findFirst({
      where: { processing_driver_id: driver_id },
      orderBy: { processing_at: 'desc' },
    });
  },

  async getLastUserTrip({ user_id }: { user_id: string }) {
    return prisma.trip.findFirst({
      where: {
        user_id,
        status: {
          notIn: [ETripStatus.COMPLETED, ETripStatus.CANCELLED],
        },
      },
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
            location_lat: true,
            location_lng: true,
            location_address: true,
          },
        },
      },
      orderBy: {
        requested_at: 'desc',
      },
    });
  },

  async getLastDriverTrip({ driver_id }: { driver_id: string }) {
    return prisma.trip.findFirst({
      where: {
        driver_id,
        status: {
          notIn: [ETripStatus.COMPLETED, ETripStatus.CANCELLED],
        },
      },
      orderBy: {
        accepted_at: 'desc',
      },
    });
  },

  async refreshLocation({ trip_id, ...payload }: TTripRefreshLocation) {
    return prisma.trip.update({
      where: { id: trip_id },
      data: payload,
    });
  },

  async driverCancelTrip({
    trip_id,
    driver_id,
  }: {
    trip_id: string;
    driver_id: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
    });

    if (trip?.processing_driver_id !== driver_id) {
      throw new Error('You are not assigned to this trip');
    }

    await prisma.trip.update({
      where: { id: trip_id },
      data: {
        processing_driver_id: null,
        is_processing: false,
        processing_at: new Date(), //? invoke time
      },
    });
  },

  async startTrip({
    trip_id,
    driver_id,
  }: {
    trip_id: string;
    driver_id: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
    });

    if (trip?.driver_id !== driver_id) {
      throw new Error('You are not assigned to this trip');
    }

    const startedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.STARTED,
        started_at: new Date(),
      },
    });

    //? Notify user that trip has started
    await NotificationServices.createNotification({
      user_id: startedTrip.user_id,
      title: 'Trip Started',
      message: 'Your trip has started. Enjoy your ride!',
      type: 'INFO',
    });

    return startedTrip;
  },

  async endTrip({
    trip_id,
    driver_id,
  }: {
    trip_id: string;
    driver_id: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
    });

    if (trip?.driver_id !== driver_id) {
      throw new Error('You are not assigned to this trip');
    }

    trip.started_at ??= new Date();

    const completed_at = new Date();

    const completedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.COMPLETED,
        completed_at,

        //? Calculate total time in milliseconds
        time: completed_at.getTime() - trip.started_at.getTime(),

        //? Recalculate total cost in case of any changes during the trip
        total_cost: await calculateTripCost(trip as any),
      },
      include: {
        user: {
          select: {
            name: true,
            rating: true,
            avatar: true,
            rating_count: true,
          },
        },
      },
    });

    //? Notify user that trip has ended
    await NotificationServices.createNotification({
      user_id: completedTrip.user_id,
      title: 'Trip Completed',
      message: `Your trip has been completed. Total cost: $${completedTrip.total_cost}`,
      type: 'INFO',
    });

    return completedTrip;
  },

  async payForTrip({ user_id, trip_id }: { user_id: string; trip_id: string }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
    });

    if (trip?.user_id !== user_id) {
      throw new Error('You are not authorized to pay for this trip');
    }

    if (trip.payment_at) {
      return {
        trip,
        wallet: await prisma.wallet.findUnique({ where: { id: user_id } }),
        transaction: await prisma.transaction.findFirst({
          where: { ref_trip_id: trip_id },
        }),
      };
    }

    return prisma.$transaction(async tx => {
      //? Mark trip as paid
      const trip = await tx.trip.update({
        where: { id: trip_id },
        data: { payment_at: new Date() },
      });

      //? Deduct from wallet
      const wallet = await tx.wallet.update({
        where: { id: user_id },
        data: {
          balance: {
            decrement: trip.total_cost,
          },
        },
      });

      //? Check for sufficient balance
      if (wallet.balance < 0) {
        throw new Error('Insufficient balance in wallet');
      }

      //? Warn if balance is low (less than $10)
      if (wallet.balance < 10) {
        await NotificationServices.createNotification({
          user_id,
          title: 'Low Wallet Balance',
          message: `Your wallet balance is low ($${wallet.balance.toFixed(2)}). Please top up to continue using our services.`,
          type: 'WARNING',
        });
      }

      //? Record transaction for user
      const transaction = await tx.transaction.create({
        data: {
          user_id,
          amount: trip.total_cost,
          type: ETransactionType.EXPENSE,
          ref_trip_id: trip_id,
          payment_method: 'WALLET',
        },
      });

      //? Record driver income transaction
      await tx.transaction.create({
        data: {
          user_id: trip.driver_id!,
          amount: trip.total_cost,
          type: ETransactionType.INCOME,
          ref_trip_id: trip_id,
          payment_method: 'WALLET',
        },
      });

      //? Notify user about payment
      await NotificationServices.createNotification({
        user_id,
        title: 'Payment Successful',
        message: `Payment of $${trip.total_cost} for trip completed successfully.`,
        type: 'INFO',
      });

      //? Notify driver about payment received
      await NotificationServices.createNotification({
        user_id: trip.driver_id!,
        title: 'Payment Received',
        message: `You received $${trip.total_cost} for the completed trip.`,
        type: 'INFO',
      });

      return { trip, wallet, transaction };
    });
  },
};
