import { EUserRole, Prisma, TLocation } from '../../../../prisma';
import config from '../../../config';
import { prisma } from '../../../utils/db';
import { TRequestForParcel } from './Parcel.interface';

export async function generateParcelSlug() {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2); // Last 2 digits
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Get today's date prefix
  const datePrefix = `${year}${month}${day}`;

  // Find last parcel created today
  const lastParcelToday = await prisma.parcel.findFirst({
    where: {
      slug: {
        startsWith: `p-${datePrefix}-`,
      },
    },
    orderBy: { slug: 'desc' },
    select: { slug: true },
  });

  let sequence = 1;
  if (lastParcelToday) {
    // Extract sequence number: p-YY-MM-DD-XXXXX -> XXXXX
    const match = lastParcelToday.slug.match(/-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(5, '0');
  return `p-${datePrefix}-${sequenceStr}`;
}

export async function calculateParcelCost(parcel: TRequestForParcel) {
  const { weight, amount } = parcel;

  /** TODO: Calculate parcel cost */

  return weight * amount;
}

export async function getNearestDriver(location: TLocation) {
  const pipeline: any = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: location.geo,
        },
        distanceField: 'distance',
        spherical: true,
        maxDistance: config.uber.max_distance,
        query: {
          is_online: true,
          role: EUserRole.DRIVER,
        } as Prisma.UserWhereInput,
      },
    },
    { $limit: 20 },
    {
      $project: {
        driver_id: 1,
      },
    },
  ];

  return (
    (await prisma.user.aggregateRaw({
      pipeline,
    })) as unknown as { _id: { $oid: string } }[]
  ).map(({ _id: { $oid } }) => $oid);
}
