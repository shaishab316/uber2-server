// import Queue from 'bull';
// import config from '@/config';
// import { prisma } from '@/utils/db';
// import { processSingleDriverDispatch } from './Trip.job';

// export type TTripDispatchQueueData = {
//   helper_id: string;
// };

// export const tripDispatchQueue = new Queue<TTripDispatchQueueData>(
//   `${config.server.name}:trip-dispatch`,
//   config.url.redis,
// );

// tripDispatchQueue.process(async ({ data }) => {
//   const { helper_id } = data;

//   const helper = await prisma.tripHelper.findUnique({
//     where: { id: helper_id },
//     include: {
//       trip: {
//         select: {
//           is_processing: true,
//         },
//       },
//     },
//   });

//   if (!helper || helper.trip.is_processing) {
//     // Invalid helper or trip already processing
//     return;
//   }

//   await processSingleDriverDispatch(helper);
// });
