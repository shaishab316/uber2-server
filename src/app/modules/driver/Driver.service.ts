import { EUserRole, Prisma } from '@/utils/db';
import { prisma } from '../../../utils/db';
import { TList } from '../query/Query.interface';
import {
  userSearchableFields as searchFields,
  userOmit,
} from '../user/User.constant';
import { TPagination } from '../../../utils/server/serveResponse';
import {
  TRefreshLocation,
  TSetupDriverProfile,
  TSetupVehicle,
  TToggleOnline,
} from './Driver.interface';
import deleteFilesQueue from '@/utils/mq/deleteFilesQueue';

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
      omit: userOmit.DRIVER,
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
      omit: userOmit.DRIVER,
      data: {
        role: EUserRole.DRIVER,
      },
    });
  },

  async superRejectDriver(driverId: string) {
    return prisma.user.update({
      where: { id: driverId },
      omit: userOmit.DRIVER,
      data: {
        role: EUserRole.USER,
      },
    });
  },

  async setupDriverProfile({ driver_id, ...payload }: TSetupDriverProfile) {
    const driver = await prisma.user.findUnique({
      where: { id: driver_id },
    });

    // Clean up old files
    if (payload?.avatar && driver?.avatar)
      await deleteFilesQueue.add([driver.avatar]);
    if (payload?.nid_photos && driver?.nid_photos)
      await deleteFilesQueue.add(driver.nid_photos);

    return prisma.user.update({
      where: { id: driver_id },
      omit: userOmit.DRIVER,
      data: {
        ...payload,
        is_verification_pending: true,
      },
    });
  },

  async setupVehicle({ driver_id, ...payload }: TSetupVehicle) {
    const driver = await prisma.user.findUnique({
      where: { id: driver_id },
    });

    if (driver?.vehicle_registration_photos)
      await deleteFilesQueue.add(driver.vehicle_registration_photos);
    if (driver?.vehicle_photos)
      await deleteFilesQueue.add(driver.vehicle_photos);

    return prisma.user.update({
      where: { id: driver_id },
      omit: userOmit.DRIVER,
      data: payload,
    });
  },

  async toggleOnline({ online, driver_id }: TToggleOnline) {
    return prisma.user.update({
      where: { id: driver_id },
      data: { is_online: online },
      select: { is_online: true },
    });
  },

  async refreshLocation({ driver_id, ...payload }: TRefreshLocation) {
    return prisma.user.update({
      where: { id: driver_id },
      data: payload,
    });
  },
};
