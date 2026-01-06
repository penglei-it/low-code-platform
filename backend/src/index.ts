import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// ES 模块导入必须包含 .js 扩展名（即使源文件是 .ts）
// ES module imports must include .js extension (even though source files are .ts)
import projectRoutes from './routes/projects.js';
import componentRoutes from './routes/components.js';
import aiRoutes from './routes/ai.js';
import dataModelRoutes from './routes/dataModels.js';
import workflowRoutes from './routes/workflows.js';
import apiDefinitionRoutes from './routes/apiDefinitions.js';
import formDefinitionRoutes from './routes/formDefinitions.js';

// 加载环境变量
dotenv.config();

const app = express();
// Railway 会自动注入 $PORT 环境变量
// Railway automatically injects $PORT environment variable
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Low-code platform API is running' });
});

// 路由
app.use('/api/projects', projectRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/data-models', dataModelRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/api-definitions', apiDefinitionRoutes);
app.use('/api/form-definitions', formDefinitionRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 启动服务器 - 监听所有网络接口以支持外部访问
// Start server - listen on all network interfaces to support external access
const HOST = process.env.HOST || '0.0.0.0';
app.listen(Number(PORT), HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  
  // 测试数据库连接
  try {
    // 动态导入prisma，避免在Prisma Client未生成时报错
    const prisma = await import('./lib/prisma.js').then(m => m.default);
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.warn('⚠️  数据库连接失败，请确保已运行 Prisma 迁移:', error);
    console.log('提示: 运行以下命令初始化数据库:');
    console.log('  cd backend');
    console.log('  npm install prisma@5.19.1 @prisma/client@5.19.1 better-sqlite3 --save');
    console.log('  npx prisma generate');
    console.log('  npx prisma migrate dev --name init');
  }
});

