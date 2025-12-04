import { notFoundError } from '@/errors';
import catchAsync from '../../middlewares/catchAsync';
import { ContextPageServices } from './ContextPage.service';

export const ContextPageControllers = {
  modify: catchAsync(async ({ body }) => {
    const data = await ContextPageServices.modify(body);

    return {
      message: `${body.page_name} updated successfully!`,
      data,
    };
  }),

  getPageNames: catchAsync(async () => {
    const data = await ContextPageServices.getPageNames();

    return {
      message: 'Context Page retrieved successfully!',
      data: data.map(({ page_name }) => page_name),
    };
  }),

  getPage: catchAsync(async ({ params, originalUrl }) => {
    const data = await ContextPageServices.getPage(params.page_name);

    if (!data) throw notFoundError(originalUrl);

    return {
      message: `${params.page_name} retrieved successfully!`,
      data,
    };
  }),
};
