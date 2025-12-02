import { Transaction as TTransaction } from '@/utils/db';

export const transactionSearchableFields: (keyof TTransaction)[] = [
  'stripe_transaction_id',
  'user_id',
];
