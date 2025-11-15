/* eslint-disable no-console */
import { Server } from 'http';
import cron from 'node-cron';
import { prisma } from '../../../utils/db';
import {
  ParcelHelper as TParcelHelper,
  Parcel as TParcel,
} from '../../../../prisma';
import { SocketServices } from '../socket/Socket.service';
import ms from 'ms';

/**
 * Parcel Dispatch Job Scheduler
 *
 * Handles the automated dispatch process for parcel delivery requests:
 * 1. Finds pending parcel helpers ready for driver assignment
 * 2. Processes drivers sequentially with 5-second intervals
 * 3. Sends real-time notifications to drivers via WebSocket
 * 4. Manages driver availability and retry logic
 *
 * @param server - HTTP server instance for Socket.IO integration
 */
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export function ParcelJob(server: Server): () => void {
  const parcelDispatchJob = cron.schedule('*/5 * * * * *', async () => {
    /**
     * STEP 1: Find eligible parcel helpers for processing
     * - Helpers with search_at time reached
     * - Associated parcel not currently being processed
     * - Limited to 100 helpers per batch for performance
     */
    const eligibleHelpers = await prisma.parcelHelper.findMany({
      where: {
        search_at: { lte: new Date() },
        parcel: {
          is_processing: false,
        },
      },
      take: 100,
      orderBy: { search_at: 'asc' }, // Process oldest requests first
    });

    /**
     * STEP 2: Process all eligible helpers concurrently
     * Each helper processes one driver at a time with 5-second intervals
     */
    await Promise.all(eligibleHelpers.map(processSingleDriverDispatch));
  });

  return () => parcelDispatchJob.destroy();
}

/**
 * Processes a single driver dispatch for a parcel helper
 *
 * Flow:
 * 1. Takes the first available driver from the queue
 * 2. Marks parcel as processing and driver as offline
 * 3. Sends real-time dispatch request via WebSocket
 * 4. Either schedules next driver or cleans up completed helper
 *
 * @param parcelHelper - The helper containing driver queue and parcel reference
 */
async function processSingleDriverDispatch(
  parcelHelper: TParcelHelper,
): Promise<void> {
  try {
    /**
     * STEP 1: Extract next driver from the queue (FIFO)
     */
    const nextDriverId = parcelHelper.driver_ids[0];

    if (!nextDriverId) {
      // No drivers remaining in queue - cleanup completed helper
      await prisma.parcelHelper.delete({ where: { id: parcelHelper.id } });
      return;
    }

    /**
     * STEP 2: Prepare remaining drivers for next iteration
     */
    const remainingDriverQueue = parcelHelper.driver_ids.slice(1);

    /**
     * STEP 3: Update parcel status to mark as processing
     * - Prevents concurrent processing of same parcel
     * - Tracks which driver is currently being notified
     */
    const processingParcel = await prisma.parcel.update({
      where: { id: parcelHelper.parcel_id },
      data: {
        is_processing: true,
        processing_driver_id: nextDriverId,
        processing_at: new Date(),
      },
    });

    /**
     * STEP 4: Send real-time dispatch request to driver
     */
    sendDriverDispatchNotification(processingParcel);

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
      await prisma.parcelHelper.update({
        where: { id: parcelHelper.id },
        data: {
          driver_ids: remainingDriverQueue,
          search_at: new Date(Date.now() + ms('5s')), // Retry after 5 seconds
        },
      });
    } else {
      // No more drivers in queue - cleanup completed helper
      await prisma.parcelHelper.delete({ where: { id: parcelHelper.id } });
    }
  } catch (error) {
    console.error(`Error processing parcel helper ${parcelHelper.id}:`, error);
  }
}

/**
 * Sends real-time parcel dispatch notification to driver via WebSocket
 *
 * @param processingParcel - The parcel data to send to the driver
 */
function sendDriverDispatchNotification(processingParcel: TParcel): void {
  if (!processingParcel.processing_driver_id) return;
  SocketServices.emitToUser(
    processingParcel.processing_driver_id,
    'parcel:request',
    processingParcel,
  );
}
