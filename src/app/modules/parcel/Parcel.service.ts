import { StatusCodes } from 'http-status-codes';
import ServerError from '@/errors/ServerError';
import { EParcelStatus, ETransactionType, prisma } from '@/utils/db';
import type {
  TCompleteParcelDeliveryArgs,
  TDeliverParcelArgs,
  TParcelRefreshLocation,
  TRequestForParcel,
  TStartParcelArgs,
} from './Parcel.interface';
import {
  calculateParcelCost,
  generateParcelSlug,
  getNearestDriver,
} from './Parcel.utils';
import { userOmit } from '../user/User.constant';
import { NotificationServices } from '../notification/Notification.service';

export const ParcelServices = {
  async getParcelDetails(parcel_id: string) {
    return prisma.parcel.findUnique({
      where: { id: parcel_id },
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
  async requestForParcel(payload: TRequestForParcel) {
    const driver_ids = await getNearestDriver(payload);

    return prisma.parcel.create({
      data: {
        ...payload,
        slug: await generateParcelSlug(),
        total_cost: await calculateParcelCost(payload),
        helper: {
          create: {
            driver_ids,
          },
        },
      },
    });
  },

  async acceptParcel({
    parcel_id,
    driver_id,
  }: {
    parcel_id: string;
    driver_id: string;
  }) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
      select: {
        driver: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (parcel?.driver?.id && parcel?.driver?.id !== driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `${parcel?.driver?.name?.split(' ')[0]} is already accepted this parcel`,
      );

    const acceptedParcel = await prisma.parcel.update({
      where: { id: parcel_id },
      data: {
        status: EParcelStatus.ACCEPTED,
        driver_id,
        accepted_at: new Date(),
      },
    });

    if (acceptedParcel.user_id) {
      //? Notify user about parcel acceptance
      await NotificationServices.createNotification({
        user_id: acceptedParcel.user_id,
        title: 'Parcel Accepted',
        message: 'A driver has accepted your parcel delivery request.',
        type: 'INFO',
      });
    }

    return acceptedParcel;
  },

  async cancelParcel({
    parcel_id,
    user_id,
  }: {
    parcel_id: string;
    user_id: string;
  }) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
      select: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (parcel?.user?.id !== user_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't cancel ${parcel?.user?.name?.split(' ')[0]}'s parcel`,
      );

    const cancelledParcel = await prisma.parcel.update({
      where: { id: parcel_id },
      data: { status: EParcelStatus.CANCELLED, cancelled_at: new Date() },
    });

    //? Notify driver if assigned
    if (cancelledParcel.driver_id) {
      await NotificationServices.createNotification({
        user_id: cancelledParcel.driver_id,
        title: 'Parcel Cancelled',
        message: 'The user has cancelled the parcel delivery.',
        type: 'WARNING',
      });
    }

    return cancelledParcel;
  },

  async getProcessingDriverParcel({ driver_id }: { driver_id: string }) {
    const data = await prisma.parcel.findFirst({
      where: { processing_driver_id: driver_id },
      include: {
        user: {
          select: {
            name: true,
            trip_received_count: true,
            avatar: true,
            rating: true,
            rating_count: true,
          },
        },
      },
      orderBy: { processing_at: 'desc' },
    });

    if (!data) {
      return null;
    }

    const { user, ...parcel } = data;

    return {
      parcel,
      user,
    };
  },

  async getLastUserParcel({ user_id }: { user_id: string }) {
    return prisma.parcel.findFirst({
      where: {
        user_id,
        status: {
          notIn: [EParcelStatus.COMPLETED, EParcelStatus.CANCELLED],
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

  async getLastDriverParcel({ driver_id }: { driver_id: string }) {
    const data = await prisma.parcel.findFirst({
      where: {
        driver_id,
        status: {
          notIn: [EParcelStatus.COMPLETED, EParcelStatus.CANCELLED],
        },
      },
      orderBy: {
        accepted_at: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            trip_received_count: true,
            avatar: true,
            rating: true,
            rating_count: true,
          },
        },
      },
    });

    if (!data) return null;

    const { user, ...parcel } = data;

    return { parcel, user };
  },

  async refreshLocation({ parcel_id, ...payload }: TParcelRefreshLocation) {
    return prisma.parcel.update({
      where: { id: parcel_id },
      data: payload,
    });
  },

  async driverCancelParcel({
    parcel_id,
    driver_id,
  }: {
    parcel_id: string;
    driver_id: string;
  }) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
    });

    if (parcel?.processing_driver_id !== driver_id) {
      throw new Error('You are not assigned to this parcel');
    }

    await prisma.parcel.update({
      where: { id: parcel_id },
      data: {
        processing_driver_id: null,
        is_processing: false,
        processing_at: new Date(), //? invoke time
      },
    });
  },

  //? New method to start parcel
  async startParcel({ driver_id, parcel_id }: TStartParcelArgs) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
    });

    if (parcel?.driver_id !== driver_id) {
      throw new Error('You are not assigned to this parcel');
    }

    if (parcel.status === EParcelStatus.STARTED) {
      return parcel; //? already started
    }

    if (parcel.status !== EParcelStatus.ACCEPTED) {
      throw new Error('Parcel is not accepted yet');
    }

    return prisma.parcel.update({
      where: { id: parcel_id },
      data: {
        status: EParcelStatus.STARTED,
        started_at: new Date(),
      },
    });
  },

  async deliverParcel({
    driver_id,
    files,
    parcel_id,
    delivery_lat,
    delivery_lng,
  }: TDeliverParcelArgs) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
    });

    if (parcel?.driver_id !== driver_id) {
      throw new Error('You are not assigned to this parcel');
    }

    if (
      parcel.status !== EParcelStatus.DELIVERED &&
      parcel.status !== EParcelStatus.STARTED
    ) {
      throw new Error('Parcel is not started yet');
    }

    return prisma.parcel.update({
      where: { id: parcel_id },
      data: {
        status: EParcelStatus.DELIVERED,
        delivered_at: new Date(),
        delivery_proof_files: files,
        delivery_lat,
        delivery_lng,
      },
    });
  },

  async payForParcel({
    user_id,
    parcel_id,
  }: {
    user_id: string;
    parcel_id: string;
  }) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
    });

    if (parcel?.user_id !== user_id) {
      throw new Error('You are not authorized to pay for this parcel');
    }

    if (parcel.payment_at) {
      return {
        parcel,
        wallet: await prisma.wallet.findUnique({ where: { id: user_id } }),
        transaction: await prisma.transaction.findFirst({
          where: { ref_parcel_id: parcel_id },
        }),
      };
    }

    return prisma.$transaction(async tx => {
      //? Mark parcel as paid
      const parcel = await tx.parcel.update({
        where: { id: parcel_id },
        data: { payment_at: new Date() },
      });

      //? Deduct from wallet
      const wallet = await tx.wallet.update({
        where: { id: user_id },
        data: {
          balance: {
            decrement: parcel.total_cost,
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
          amount: parcel.total_cost,
          type: ETransactionType.EXPENSE,
          ref_parcel_id: parcel_id,
          payment_method: 'WALLET',
        },
      });

      //? Record driver income transaction
      await tx.transaction.create({
        data: {
          user_id: parcel.driver_id!,
          amount: parcel.total_cost,
          type: ETransactionType.INCOME,
          ref_parcel_id: parcel_id,
          payment_method: 'WALLET',
        },
      });

      //? Notify user about payment
      await NotificationServices.createNotification({
        user_id,
        title: 'Payment Successful',
        message: `Payment of $${parcel.total_cost} for parcel delivery completed successfully.`,
        type: 'INFO',
      });

      //? Notify driver about payment received
      await NotificationServices.createNotification({
        user_id: parcel.driver_id!,
        title: 'Payment Received',
        message: `You received $${parcel.total_cost} for the completed parcel delivery.`,
        type: 'INFO',
      });

      return { parcel, wallet, transaction };
    });
  },

  async completeParcelDelivery({
    driver_id,
    parcel_id,
  }: TCompleteParcelDeliveryArgs) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcel_id },
    });

    if (parcel?.driver_id !== driver_id) {
      throw new Error('You are not assigned to this parcel');
    }

    if (parcel.status === EParcelStatus.COMPLETED) {
      return parcel; //? already completed
    }

    if (parcel.status !== EParcelStatus.DELIVERED) {
      throw new Error('Parcel is not delivered yet');
    }

    parcel.started_at ??= new Date(); //? fallback
    const completed_at = new Date();

    return prisma.parcel.update({
      where: { id: parcel_id },
      data: {
        status: EParcelStatus.COMPLETED,
        completed_at,

        //? Calculate total time in milliseconds
        time: completed_at.getTime() - parcel.started_at.getTime(),
      },
    });
  },
};
