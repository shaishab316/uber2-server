import { EParcelType, prisma } from '@/utils/db';
import { TGetNearestDriver, TRequestForParcel } from './Parcel.interface';
import { calculateSimpleDistance } from '../trip/Trip.utils';

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
    orderBy: { requested_at: 'desc' },
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

export async function calculateParcelCost(
  parcel: TRequestForParcel,
): Promise<number> {
  const {
    weight,
    amount,
    parcel_type,
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
  } = parcel;

  const distanceKm = calculateSimpleDistance(
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
  );

  const BASE_FARE = 3.0;
  const DISTANCE_RATE = 1.0; // $1 per km
  const WEIGHT_RATE = 0.8; // $0.8 per kg
  const ITEM_RATE = 0.2; // $0.2 per item

  let cost =
    BASE_FARE +
    distanceKm * DISTANCE_RATE +
    weight * WEIGHT_RATE +
    amount * ITEM_RATE;

  switch (parcel_type) {
    case EParcelType.SMALL:
      cost *= 1.0;
      break;
    case EParcelType.MEDIUM:
      cost *= 1.1;
      break;
    case EParcelType.LARGE:
      cost *= 1.3;
      break;
  }

  const MIN_FARE = 5.0;
  if (cost < MIN_FARE) {
    cost = MIN_FARE;
  }

  return cost | 0;
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
      (
        6371 * acos(
          cos(radians(${pickup_lat})) 
          * cos(radians(location_lat)) 
          * cos(radians(location_lng) - radians(${pickup_lng})) 
          + sin(radians(${pickup_lat})) 
          * sin(radians(location_lat))
        )
      ) ASC
    LIMIT 20
  `;
  return nearestDrivers.map(driver => driver.id);
}
