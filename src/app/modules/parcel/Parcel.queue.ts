import Queue from 'bull';
import config from '@/config';
import { queueOptions } from '@/utils/mq';
import { prisma } from '@/utils/db';
import { processSingleDriverDispatch } from './Parcel.job';
import { errorLogger } from '@/utils/logger';

export type TParcelDispatchQueueData = {
  helper_id: string;
};

export const parcelDispatchQueue = new Queue<TParcelDispatchQueueData>(
  `${config.server.name}:parcel-dispatch`,
  queueOptions,
);

parcelDispatchQueue.process(async ({ data }) => {
  const { helper_id } = data;

  const helper = await prisma.parcelHelper.findUnique({
    where: { id: helper_id },
    include: {
      parcel: {
        select: {
          is_processing: true,
        },
      },
    },
  });

  if (!helper || helper.parcel.is_processing) {
    // Invalid helper or parcel already processing
    return;
  }

  await processSingleDriverDispatch(helper);
});

parcelDispatchQueue.on('completed', async job => {
  await job.remove(); // Force remove to free memory
});

parcelDispatchQueue.on('failed', async (job, err) => {
  errorLogger.error(`Job ${job?.id} failed:`, err);

  // Remove failed jobs older than 1 hour
  if (job && Date.now() - job.timestamp > 3600000) {
    await job.remove();
  }
});

// Clean old jobs every 30 minutes
setInterval(async () => {
  try {
    await parcelDispatchQueue.clean(300000, 'completed'); // 5 min old
    await parcelDispatchQueue.clean(3600000, 'failed'); // 1 hour old
  } catch (err) {
    errorLogger.error('Queue cleanup error:', err);
  }
}, 1800000); // 30 minutes
