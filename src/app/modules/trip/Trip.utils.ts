import { prisma } from '@/utils/db';
import { TRequestForTrip } from './Trip.interface';

export async function generateTripSlug() {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2); // Last 2 digits
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Get today's date prefix
  const datePrefix = `${year}${month}${day}`;

  // Find last trip created today
  const lastTripToday = await prisma.trip.findFirst({
    where: {
      slug: {
        startsWith: `t-${datePrefix}-`,
      },
    },
    orderBy: { requested_at: 'desc' },
    select: { slug: true },
  });

  let sequence = 1;
  if (lastTripToday) {
    // Extract sequence number: p-YY-MM-DD-XXXXX -> XXXXX
    const match = lastTripToday.slug.match(/-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(5, '0');
  return `t-${datePrefix}-${sequenceStr}`;
}

export function calculateSimpleDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function calculateTripCost(
  trip: TRequestForTrip,
): Promise<number> {
  // Calculate distance in kilometers
  const distanceKm = calculateSimpleDistance(
    trip.pickup_lat,
    trip.pickup_lng,
    trip.dropoff_lat,
    trip.dropoff_lng,
  );

  // Simple pricing formula
  const BASE_FARE = 3.0; // Base fare
  const PER_KM_RATE = 2.0; // Rate per km
  const MINIMUM_FARE = 5.0; // Minimum fare

  // Calculate fare
  let fare = BASE_FARE + distanceKm * PER_KM_RATE;

  // Ensure minimum fare
  fare = Math.max(fare, MINIMUM_FARE);

  // Round to 2 decimal places
  return fare | 0;
}
