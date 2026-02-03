// import Queue from 'bull';
// import config from '@/config';
// import type { TSendMail } from '@/types/utils.types';
// import { sendEmail } from '../sendMail';

// /**
//  * Email Queue used to send emails to users in the background
//  */
// const emailQueue = new Queue<TSendMail>(
//   `${config.server.name}:emails`,
//   config.url.redis,
// );

// emailQueue.process(async ({ data }) => sendEmail(data));

// export default emailQueue;
