import Queue from 'bull';
import config from '@/config';
import { deleteFiles } from '@/app/middlewares/capture';

/**
 * Delete files queue
 */
const deleteFilesQueue = new Queue<string[]>('delete-files', config.url.redis);

deleteFilesQueue.process(async ({ data }) => {
  await deleteFiles(data);
});

export default deleteFilesQueue;
