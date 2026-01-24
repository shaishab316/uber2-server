import Queue from 'bull';
import config from '@/config';
import { queueOptions } from '@/utils/mq';
import { prisma } from '@/utils/db';
import { processSingleDriverDispatch } from './Trip.job';
import { errorLogger } from '@/utils/logger';

export type TTripDispatchQueueData = {
  helper_id: string;
};

export const tripDispatchQueue = new Queue<TTripDispatchQueueData>(
  `${config.server.name}:trip-dispatch`,
  queueOptions,
);

tripDispatchQueue.process(async ({ data }) => {
  const { helper_id } = data;

  const helper = await prisma.tripHelper.findUnique({
    where: { id: helper_id },
    include: {
      trip: {
        select: {
          is_processing: true,
        },
      },
    },
  });

  if (!helper || helper.trip.is_processing) {
    // Invalid helper or trip already processing
    return;
  }

  await processSingleDriverDispatch(helper);
});

tripDispatchQueue.on('completed', async job => {
  await job.remove(); // Force remove to free memory
});

tripDispatchQueue.on('failed', async (job, err) => {
  errorLogger.error(`Job ${job?.id} failed:`, err);

  // Remove failed jobs older than 1 hour
  if (job && Date.now() - job.timestamp > 3600000) {
    await job.remove();
  }
});

// Clean old jobs every 30 minutes
setInterval(async () => {
  try {
    await tripDispatchQueue.clean(300000, 'completed'); // 5 min old
    await tripDispatchQueue.clean(3600000, 'failed'); // 1 hour old
  } catch (err) {
    errorLogger.error('Queue cleanup error:', err);
  }
}, 1800000); // 30 minutes
