import { prisma } from '../../../utils/db';
import { TRequestForParcel } from './Parcel.interface';
import generateParcelSlug from './Parcel.utils';

export const ParcelServices = {
  async requestForParcel(payload: TRequestForParcel) {
    return prisma.parcel.create({
      data: { ...payload, slug: await generateParcelSlug() },
    });
  },
};
