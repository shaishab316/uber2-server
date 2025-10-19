import type z from 'zod';
import { LoanValidations } from './Loan.validation';
import { TList } from '../query/Query.interface';

export type TStartLoan = z.infer<typeof LoanValidations.startLoan>['body'] & {
  user_id: string;
};

export type TSuperGetAllLoans = z.infer<
  typeof LoanValidations.superGetAllLoans
>['query'] &
  TList;
