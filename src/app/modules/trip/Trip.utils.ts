import { prisma } from '../../../utils/db';
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

export async function calculateTripCost(trip: TRequestForTrip) {
  /** TODO: Calculate trip cost */

  void trip;

  return 100;
}
