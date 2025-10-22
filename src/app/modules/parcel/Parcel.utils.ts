import { prisma } from '../../../utils/db';
import { TGetNearestDriver, TRequestForParcel } from './Parcel.interface';

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

export async function getNearestDriver({
  pickup_lat,
  pickup_lng,
}: TGetNearestDriver): Promise<string[]> {
  const nearestDrivers = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM users
    WHERE role = 'DRIVER'
      AND is_online = true
      AND is_verified = true
      AND is_active = true
      AND location_lat IS NOT NULL
      AND location_lng IS NOT NULL
    ORDER BY 
      SQRT(
        POWER((location_lat - ${pickup_lat}), 2) + 
        POWER((location_lng - ${pickup_lng}), 2)
      ) ASC
    LIMIT 20
  `;

  return nearestDrivers.map(driver => driver.id);
}
