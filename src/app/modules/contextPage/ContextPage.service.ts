import { ContextPage as TContextPage, prisma } from '@/utils/db';

export const ContextPageServices = {
  async modify({ page_name, content }: TContextPage) {
    return prisma.contextPage.upsert({
      where: {
        page_name,
      },
      update: {
        content,
      },
      create: {
        page_name,
        content,
      },
    });
  },

  async getPage(page_name: string) {
    return prisma.contextPage.findFirst({
      where: {
        page_name: {
          equals: page_name,
          mode: 'insensitive',
        },
      },
    });
  },

  async getPageNames() {
    return prisma.contextPage.findMany({ select: { page_name: true } });
  },
};
