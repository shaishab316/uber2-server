import { Server } from 'http';
import cron from 'node-cron';
import {
  prisma,
  Trip as TTrip,
  TripHelper as TTripHelper,
} from '../../../utils/db';
import { SocketServices } from '../socket/Socket.service';
import ms from 'ms';
import { errorLogger } from '../../../utils/logger';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export function TripJob(server: Server): () => void {
  //? every 5 seconds
  const tripDispatchJob = cron.schedule('*/5 * * * * *', async () => {
    /**
     * STEP 1: Find eligible trips for processing
     * - Trips with search_at time reached
     * - Associated trip not currently being processed
     * - Limited to 100 trips per batch for performance
     */
    const eligibleHelpers = await prisma.tripHelper.findMany({
      where: {
        search_at: { lte: new Date() },
        trip: {
          is_processing: false,
        },
      },
      take: 100,
      orderBy: { search_at: 'asc' }, // Process oldest requests first
    });

    await Promise.all(eligibleHelpers.map(processSingleDriverDispatch));
  });

  return () => tripDispatchJob.destroy();
}

async function processSingleDriverDispatch(tripHelper: TTripHelper) {
  try {
    /**
     * STEP 1: Extract next driver from the queue (FIFO)
     */
    const nextDriverId = tripHelper.driver_ids[0];

    if (!nextDriverId) {
      // No drivers remaining in queue - cleanup completed helper
      await prisma.tripHelper.delete({ where: { id: tripHelper.id } });
      return;
    }

    /**
     * STEP 2: Prepare remaining drivers for next iteration
     */
    const remainingDriverQueue = tripHelper.driver_ids.slice(1);

    /**
     * STEP 3: Mark trip as processing and driver as offline
     */
    const processingTrip = await prisma.trip.update({
      where: { id: tripHelper.trip_id },
      data: {
        is_processing: true,
        processing_driver_id: nextDriverId,
        processing_at: new Date(),
      },
    });

    /**
     * STEP 4: Send real-time dispatch request to driver
     */
    sendDriverDispatchNotification(processingTrip);

    /**
     * STEP 5: Mark driver as temporarily offline
     * - Prevents duplicate dispatch requests
     * - Gives driver time to respond to current request
     */
    await prisma.user.update({
      where: { id: nextDriverId },
      data: {
        is_online: false,
      },
    });

    /**
     * STEP 6: Handle queue management
     */
    if (remainingDriverQueue.length > 0) {
      // More drivers available - schedule next attempt in 5 seconds
      await prisma.tripHelper.update({
        where: { id: tripHelper.id },
        data: {
          driver_ids: remainingDriverQueue,
          search_at: new Date(Date.now() + ms('5s')), // Retry after 5 seconds
        },
      });
    } else {
      // No drivers remaining in queue - cleanup completed helper
      await prisma.tripHelper.delete({ where: { id: tripHelper.id } });
    }
  } catch (error) {
    errorLogger.error(`Error processing trip: ${tripHelper.id}`, error);
  }
}

/**
 * Sends real-time trip dispatch notification to driver via WebSocket
 *
 * @param processingTrip - The trip data to send to the driver
 */
function sendDriverDispatchNotification(processingTrip: TTrip): void {
  if (!processingTrip.processing_driver_id) return;
  SocketServices.emitToUser(
    processingTrip.processing_driver_id,
    'trip:request',
    processingTrip,
  );
}
