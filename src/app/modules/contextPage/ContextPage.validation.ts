import { TModelZod } from '@/types/zod';
import { z } from 'zod';
import type { ContextPage } from '@/utils/db';

export const ContextPageValidations = {
  modify: z.object({
    body: z.object({
      page_name: z
        .string({
          error: 'Page name is missing',
        })
        .min(1, "Page name can't be empty"),
      content: z
        .string({
          error: 'Content is missing',
        })
        .min(1, "Content can't be empty"),
    } satisfies TModelZod<ContextPage>),
  }),
};
