import { z } from 'zod';
import { exists } from '../../../utils/db/exists';
import { capitalize } from '../../../utils/transform/capitalize';
import { TModels } from '../../../types/db';

export const QueryValidations = {
  list: z.object({
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).default(10),
      search: z.coerce.string().trim().optional(),
    }),
  }),

  /**
   * Validation for checking if a document exists in the given model.
   * @param _id The name of the param containing the document ID
   * @param model The prisma model for the document
   */
  exists: (_id: string, model: TModels) =>
    z.object({
      params: z.object({
        [_id]: z.string({ error: `${_id} is required` }).refine(exists(model), {
          error: ({ input }) =>
            `${capitalize(model)} not found with id: ${input}`,
          path: [_id],
        }),
      }),
    }),
};
