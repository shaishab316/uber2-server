import { prisma } from '../../../utils/db';

export default async function generateParcelSlug() {
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
