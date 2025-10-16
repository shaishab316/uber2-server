import { EUserRole, Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TList } from '../query/Query.interface';
import { userOmit } from '../user/User.service';
import { userSearchableFields as searchFields } from '../user/User.constant';
import { TPagination } from '../../../utils/server/serveResponse';

export const DriverServices = {
  async superGetPendingDriver({ page, limit, search }: TList) {
    const where: Prisma.UserWhereInput = {};

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where,
      omit: userOmit,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      users,
    };
  },

  async superApproveDriver(driverId: string) {
    return prisma.user.update({
      where: { id: driverId },
      omit: userOmit,
      data: {
        role: EUserRole.DRIVER,
      },
    });
  },

  async superRejectDriver(driverId: string) {
    return prisma.user.update({
      where: { id: driverId },
      omit: userOmit,
      data: {
        role: EUserRole.USER,
      },
    });
  },
};
