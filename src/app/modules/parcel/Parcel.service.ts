import { StatusCodes } from 'http-status-codes';
import { EParcelStatus } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import type {
  TParcelRefreshLocation,
  TRequestForParcel,
} from './Parcel.interface';
import {
  calculateParcelCost,
  generateParcelSlug,
  getNearestDriver,
} from './Parcel.utils';

export const ParcelServices = {
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

    return prisma.parcel.update({
      where: { id: parcel_id },
      data: {
        status: EParcelStatus.ACCEPTED,
        driver_id,
        accepted_at: new Date(),
      },
    });
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

    if (parcel?.user.id !== user_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't cancel ${parcel?.user?.name?.split(' ')[0]}'s parcel`,
      );

    return prisma.parcel.update({
      where: { id: parcel_id },
      data: { status: EParcelStatus.CANCELLED, cancelled_at: new Date() },
    });
  },

  async getProcessingDriverParcel({ driver_id }: { driver_id: string }) {
    return prisma.parcel.findFirst({
      where: { processing_driver_id: driver_id },
      orderBy: { processing_at: 'desc' },
    });
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
    return prisma.parcel.findFirst({
      where: {
        driver_id,
        status: {
          notIn: [EParcelStatus.COMPLETED, EParcelStatus.CANCELLED],
        },
      },
      orderBy: {
        accepted_at: 'desc',
      },
    });
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
};
