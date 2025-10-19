import type z from 'zod';
import { ChatValidations } from './Chat.validation';

export type TGetChat = z.infer<typeof ChatValidations.getChat>['query'];
