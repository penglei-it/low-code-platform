/**
 * Prisma Client实例
 * Prisma Client instance
 * 单例模式，确保整个应用只有一个Prisma Client实例
 */

// 全局变量，用于开发环境的热重载
declare global {
  // eslint-disable-next-line no-var
  var __prisma: any;
}

// 动态导入Prisma Client，避免在未生成时报错
let PrismaClientClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const prismaModule = require('@prisma/client');
  PrismaClientClass = prismaModule.PrismaClient;
} catch (error) {
  // Prisma Client未生成时，提供一个占位符
  console.warn('⚠️  Prisma Client未生成，请运行: npx prisma generate');
  PrismaClientClass = class {
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
    project = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
    dataModel = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
    apiDefinition = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
    workflow = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
    workflowInstance = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
    formDefinition = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
    formSubmission = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    };
  };
}

// 创建Prisma Client实例
// 在开发环境中，使用全局变量避免热重载时创建多个实例
const prisma =
  global.__prisma ||
  new PrismaClientClass({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 开发环境中，将实例保存到全局变量
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;
