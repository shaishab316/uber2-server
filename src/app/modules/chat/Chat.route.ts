import { Router } from 'express';
import { ChatControllers } from './Chat.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { ChatValidations } from './Chat.validation';
import { QueryValidations } from '../query/Query.validation';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(QueryValidations.list, ChatValidations.getInbox),
    ChatControllers.getInbox,
  );

  all.post(
    '/new-chat',
    purifyRequest(ChatValidations.newChat),
    ChatControllers.newChat,
  );

  all.delete(
    '/delete-chat',
    purifyRequest(ChatValidations.deleteChat),
    ChatControllers.deleteChat,
  );
}

/**
 * All chat related routes
 */
export const ChatRoutes = {
  /**
   * All user can access
   *
   * @url : (base_url)/inbox
   */
  all,
};
