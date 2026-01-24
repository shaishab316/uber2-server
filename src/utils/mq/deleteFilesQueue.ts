import Queue from 'bull';
import config from '@/config';
import { deleteFiles } from '@/app/middlewares/capture';
import { queueOptions } from '.';

/**
 * Delete files queue
 */
const deleteFilesQueue = new Queue<string[]>(
  `${config.server.name}:delete-files`,
  queueOptions,
);

deleteFilesQueue.process(async ({ data }) => {
  await deleteFiles(data);
});

export default deleteFilesQueue;
