import Queue from 'bull';
import config from '@/config';
import type { TSendMail } from '@/types/utils.types';
import { sendEmail } from '../sendMail';
import { queueOptions } from '.';

/**
 * Email Queue used to send emails to users in the background
 */
const emailQueue = new Queue<TSendMail>(
  `${config.server.name}:emails`,
  queueOptions,
);

emailQueue.process(async ({ data }) => sendEmail(data));

export default emailQueue;
