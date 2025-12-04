import { UserActivity as TUserActivity } from '@/utils/db';

/**
 * Fields of UserActivity that are searchable
 */
export const userActivitySearchableFields = ['content', 'path'] satisfies Array<
  keyof TUserActivity
>;
