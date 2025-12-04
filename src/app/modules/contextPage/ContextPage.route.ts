import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { ContextPageValidations } from './ContextPage.validation';
import { ContextPageControllers } from './ContextPage.controller';

const admin = Router();
{
  admin.post(
    '/modify',
    purifyRequest(ContextPageValidations.modify),
    ContextPageControllers.modify,
  );
}

const user = Router();
{
  user.get('/', ContextPageControllers.getPageNames);

  user.get('/:page_name', ContextPageControllers.getPage);
}

export const ContextPageRoutes = { admin, user };
