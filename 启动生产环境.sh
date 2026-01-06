#!/bin/bash

echo "===================================="
echo "低代码平台 - 生产环境启动脚本"
echo "===================================="
echo ""

# 检查 Node.js
echo "[1/5] 检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi
echo "✓ Node.js已安装"

# 构建前端
echo ""
echo "[2/5] 构建前端..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
fi
echo "正在构建前端..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
echo "✓ 前端构建完成"

# 构建后端
echo ""
echo "[3/5] 构建后端..."
cd ../backend
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 后端依赖安装失败"
        exit 1
    fi
fi
echo "正在构建后端..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 后端构建失败"
    exit 1
fi
echo "✓ 后端构建完成"

# 初始化数据库
echo ""
echo "[4/5] 初始化数据库（如果需要）..."
if [ ! -f "prisma/dev.db" ]; then
    echo "数据库不存在，正在初始化..."
    npx prisma generate
    npx prisma migrate dev --name init
    if [ $? -ne 0 ]; then
        echo "⚠️  数据库初始化失败，将继续启动但可能无法正常工作"
    else
        echo "✓ 数据库初始化完成"
    fi
else
    echo "✓ 数据库已存在"
fi

cd ..

# 启动服务
echo ""
echo "===================================="
echo "✓ 准备启动生产环境服务"
echo "===================================="
echo ""
echo "请选择启动方式:"
echo "  1. 仅启动后端（前端已构建，可手动提供静态文件服务）"
echo "  2. 启动后端 + 前端预览"
echo "  3. 使用 PM2 管理进程（推荐）"
echo ""
read -p "请选择 (1/2/3): " choice

case $choice in
    1)
        echo "启动后端服务..."
        cd backend && npm start &
        echo ""
        echo "✓ 后端服务已启动"
        echo "访问地址: http://$(hostname -I | awk '{print $1}'):3001"
        echo ""
        ;;
    2)
        echo "启动后端服务..."
        cd backend && npm start &
        sleep 3
        echo "启动前端预览..."
        cd frontend && npm run preview &
        echo ""
        echo "✓ 服务已启动"
        echo "前端地址: http://$(hostname -I | awk '{print $1}'):4173"
        echo "后端地址: http://$(hostname -I | awk '{print $1}'):3001"
        echo ""
        ;;
    3)
        echo "检查 PM2..."
        if ! command -v pm2 &> /dev/null; then
            echo "PM2 未安装，正在全局安装..."
            npm install -g pm2
        fi
        echo "使用 PM2 启动服务..."
        pm2 start backend/dist/index.js --name "low-code-backend" --env production
        pm2 start npm --name "low-code-frontend" -- run preview --prefix frontend
        pm2 save
        echo ""
        echo "✓ 服务已通过 PM2 启动"
        echo "使用 'pm2 list' 查看服务状态"
        echo "使用 'pm2 logs' 查看日志"
        echo "前端地址: http://$(hostname -I | awk '{print $1}'):4173"
        echo "后端地址: http://$(hostname -I | awk '{print $1}'):3001"
        echo ""
        ;;
    *)
        echo "无效选择，退出..."
        exit 1
        ;;
esac

echo "提示: 如果其他设备无法访问，请检查:"
echo "  1. 防火墙是否允许相应端口"
echo "  2. 设备是否在同一网络"
echo "  3. 使用 'ifconfig' 或 'ip addr' 查看本机 IP 地址"
echo ""

