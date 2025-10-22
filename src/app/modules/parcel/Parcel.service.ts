import { StatusCodes } from 'http-status-codes';
import { EParcelStatus } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { TRequestForParcel } from './Parcel.interface';
import {
  calculateParcelCost,
  generateParcelSlug,
  getNearestDriver,
} from './Parcel.utils';

export const ParcelServices = {
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
};
