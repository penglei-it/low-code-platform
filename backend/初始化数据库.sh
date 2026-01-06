#!/bin/bash

echo "========================================"
echo "数据库初始化脚本"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/4] 检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "[2/4] 安装Prisma依赖..."
npm install prisma@5.19.1 @prisma/client@5.19.1 better-sqlite3 --save-exact
if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo "[3/4] 生成Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "错误: Prisma Client生成失败"
    exit 1
fi

echo "[4/4] 创建数据库迁移..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "错误: 数据库迁移失败"
    exit 1
fi

echo ""
echo "========================================"
echo "数据库初始化完成！"
echo "========================================"
echo ""
echo "数据库文件位置: prisma/dev.db"
echo ""
echo "可以使用以下命令查看数据库:"
echo "  npx prisma studio"
echo ""

