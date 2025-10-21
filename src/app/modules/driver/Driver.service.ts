import { EUserRole, Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TList } from '../query/Query.interface';
import {
  userSearchableFields as searchFields,
  userOmit,
} from '../user/User.constant';
import { TPagination } from '../../../utils/server/serveResponse';
import { TSetupDriverProfile, TSetupVehicle } from './Driver.interface';
import { deleteFile, deleteFiles } from '../../middlewares/capture';

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

  async setupDriverProfile({ driver_id, ...payload }: TSetupDriverProfile) {
    const driver = await prisma.user.findUnique({
      where: { id: driver_id },
    });

    // Clean up old files
    if (driver?.avatar) await deleteFile(driver.avatar);
    if (driver?.nid_photos) await deleteFiles(driver.nid_photos);

    return prisma.user.update({
      where: { id: driver_id },
      omit: userOmit,
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
      await deleteFiles(driver.vehicle_registration_photos);
    if (driver?.vehicle_photos) await deleteFiles(driver.vehicle_photos);

    return prisma.user.update({
      where: { id: driver_id },
      omit: userOmit,
      data: payload,
    });
  },
};
