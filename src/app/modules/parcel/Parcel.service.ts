import { StatusCodes } from 'http-status-codes';
import { EParcelStatus } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import { TRequestForParcel } from './Parcel.interface';
import { calculateParcelCost, generateParcelSlug } from './Parcel.utils';

export const ParcelServices = {
  async requestForParcel(payload: TRequestForParcel) {
    return prisma.parcel.create({
      data: {
        ...payload,
        slug: await generateParcelSlug(),
        total_cost: await calculateParcelCost(payload),
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
      data: { status: EParcelStatus.ACCEPTED, driver_id },
    });
  },
};
