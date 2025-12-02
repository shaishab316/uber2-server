import {
  prisma,
  ETransactionType,
  Prisma,
  Transaction as TTransaction,
} from '@/utils/db';
import { TPagination } from '@/utils/server/serveResponse';
import { TList } from '../query/Query.interface';
import { transactionSearchableFields as searchableFields } from './Transaction.constant';

export const TransactionServices = {
  async create(transactionData: TTransaction) {
    return prisma.transaction.create({ data: transactionData });
  },

  async getUserTransactions({
    page,
    limit,
    user_id,
    search,
  }: TList & { user_id?: string }) {
    const where: Prisma.TransactionWhereInput = {};
    const omit: Prisma.TransactionOmit = {};

    if (user_id) {
      where.user_id = user_id;
      omit.user_id = true;
      omit.driver_id = true;
    }

    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit,
    });

    const total = await prisma.transaction.count({
      where,
    });

    const totalExpenseAmount = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: ETransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    });

    const wallet = await prisma.wallet.findFirst({
      where: {
        user_id,
      },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        totalExpenseAmount: totalExpenseAmount._sum.amount ?? 0,
        availableBalance: wallet?.balance ?? 0,
      },
      transactions,
    };
  },

  async getDriverTransactions({
    page,
    limit,
    driver_id,
    search,
  }: TList & { driver_id: string }) {
    const where: Prisma.TransactionWhereInput = { driver_id };
    const omit: Prisma.TransactionOmit = { driver_id: true, user_id: true };

    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit,
    });

    const total = await prisma.transaction.count({
      where,
    });

    const totalEarningAmount = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: ETransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    });

    const wallet = await prisma.wallet.findFirst({
      where: {
        user_id: driver_id,
      },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        totalEarningAmount: totalEarningAmount._sum.amount,
        availableBalance: wallet?.balance ?? 0,
      },
      transactions,
    };
  },
};
