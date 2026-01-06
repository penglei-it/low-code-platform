// Prisma配置文件（Prisma 7.x要求）
// Prisma configuration file (required for Prisma 7.x)
import { defineConfig } from 'prisma';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: 'file:./dev.db',
  },
});

