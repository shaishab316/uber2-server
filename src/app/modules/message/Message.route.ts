import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { MessageValidations } from './Message.validation';
import { MessageControllers } from './Message.controller';
import { QueryValidations } from '../query/Query.validation';
import capture from '../../middlewares/capture';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(QueryValidations.list, MessageValidations.getChatMessages),
    MessageControllers.getChatMessages,
  );

  all.post(
    '/upload-media',
    capture({
      images: {
        size: 15 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
      videos: {
        size: 100 * 1024 * 1024,
        maxCount: 10,
        fileType: 'videos',
      },
    }),
    MessageControllers.uploadMedia,
  );
}

/**
 * All message related routes
 */
export const MessageRoutes = {
  /**
   * All user can access
   *
   * @url : (base_url)/messages/
   */
  all,
};
