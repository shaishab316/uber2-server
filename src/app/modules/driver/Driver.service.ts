import { EUserRole, Prisma } from '@/utils/db';
import { prisma } from '../../../utils/db';
import { TList } from '../query/Query.interface';
import {
  userSearchableFields as searchFields,
  userOmit,
} from '../user/User.constant';
import { TPagination } from '../../../utils/server/serveResponse';
import {
  TGetEarningsArgs,
  TRefreshLocation,
  TSetupDriverProfile,
  TSetupVehicle,
  TToggleOnline,
} from './Driver.interface';
import deleteFilesQueue from '@/utils/mq/deleteFilesQueue';
import { dateRange } from '../datetime/Datetime.utils';
import { NotificationServices } from '../notification/Notification.service';

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
    const approvedDriver = await prisma.user.update({
      where: { id: driverId },
      omit: userOmit.DRIVER,
      data: {
        role: EUserRole.DRIVER,
      },
    });

    //? Notify driver about approval
    await NotificationServices.createNotification({
      user_id: driverId,
      title: 'Driver Application Approved',
      message:
        'Congratulations! Your driver application has been approved. You can now start accepting trips.',
      type: 'INFO',
    });

    return approvedDriver;
  },

  async superRejectDriver(driverId: string) {
    const rejectedDriver = await prisma.user.update({
      where: { id: driverId },
      omit: userOmit.DRIVER,
      data: {
        role: EUserRole.USER,
      },
    });

    //? Notify user about rejection
    await NotificationServices.createNotification({
      user_id: driverId,
      title: 'Driver Application Rejected',
      message:
        'Your driver application has been rejected. Please contact support for more information.',
      type: 'WARNING',
    });

    return rejectedDriver;
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
        date_of_birth: new Date(payload.date_of_birth),
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

  async tripEarnings({
    driver_id,
    limit,
    page,
    dateRange: range,
    startDate,
    endDate,
  }: TGetEarningsArgs) {
    const whereTrip: Prisma.TripWhereInput = { driver_id };

    if (range) {
      whereTrip.payment_at = dateRange[range](startDate, endDate, false);
    }

    const trips = await prisma.trip.groupBy({
      by: ['date'],
      where: whereTrip,
      _sum: {
        total_cost: true,
        time: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const aggregate = await prisma.trip.aggregate({
      where: whereTrip,
      _sum: {
        total_cost: true,
        time: true,
      },
      _count: { id: true },
    });

    const total = aggregate._count.id;

    return {
      data: trips.map(group => ({
        date: new Date(group.date ?? new Date()).toISOString().split('T')[0],
        total_cost: group._sum.total_cost ?? 0,
        total_time: group._sum.time ?? 0,
        total_count: group._count.id,
      })),
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        total_count: aggregate._count.id,
        total_earnings: aggregate._sum.total_cost ?? 0,
        total_time: aggregate._sum.time ?? 0,
      },
    };
  },

  async parcelEarnings({
    driver_id,
    limit,
    page,
    dateRange: range,
    startDate,
    endDate,
  }: TGetEarningsArgs) {
    const whereParcel: Prisma.ParcelWhereInput = { driver_id };

    if (range) {
      whereParcel.payment_at = dateRange[range](startDate, endDate, false);
    }

    const parcels = await prisma.parcel.groupBy({
      by: ['date'],
      where: whereParcel,
      _sum: {
        total_cost: true,
        time: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const aggregate = await prisma.parcel.aggregate({
      where: whereParcel,
      _sum: {
        total_cost: true,
        time: true,
      },
      _count: { id: true },
    });

    const total = aggregate._count.id;

    return {
      data: parcels.map(group => ({
        date: new Date(group.date ?? new Date()).toISOString().split('T')[0],
        total_cost: group._sum.total_cost ?? 0,
        total_time: group._sum.time ?? 0,
        total_count: group._count.id,
      })),
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        total_count: aggregate._count.id,
        total_earnings: aggregate._sum.total_cost ?? 0,
        total_time: aggregate._sum.time ?? 0,
      },
    };
  },

  async home({ driver_id }: { driver_id: string }) {
    const aggregateTrip = await prisma.trip.aggregate({
      where: { driver_id },
      _sum: {
        total_cost: true,
        time: true,
      },
      _count: { id: true },
    });

    const aggregateParcel = await prisma.parcel.aggregate({
      where: { driver_id },
      _sum: {
        total_cost: true,
        time: true,
      },
      _count: { id: true },
    });

    return {
      total_count: aggregateTrip._count.id + aggregateParcel._count.id,
      total_earnings:
        (aggregateTrip._sum.total_cost ?? 0) +
        (aggregateParcel._sum.total_cost ?? 0),
      total_time:
        (aggregateTrip._sum.time ?? 0) + (aggregateParcel._sum.time ?? 0),
    };
  },
};
