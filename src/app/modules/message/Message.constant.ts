import type { Message as TMessage } from '../../../utils/db';

export const messageSearchableFields = ['text'] satisfies (keyof TMessage)[];
