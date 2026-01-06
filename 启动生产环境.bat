@echo off
chcp 65001 >nul
echo ====================================
echo 低代码平台 - 生产环境启动脚本
echo ====================================
echo.

echo [1/5] 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)
echo ✓ Node.js已安装

echo.
echo [2/5] 构建前端...
cd frontend
if not exist node_modules (
    echo 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo 正在构建前端...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✓ 前端构建完成

echo.
echo [3/5] 构建后端...
cd ..\backend
if not exist node_modules (
    echo 正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo 正在构建后端...
call npm run build
if errorlevel 1 (
    echo ❌ 后端构建失败
    pause
    exit /b 1
)
echo ✓ 后端构建完成

echo.
echo [4/5] 初始化数据库（如果需要）...
if not exist prisma\dev.db (
    echo 数据库不存在，正在初始化...
    call npx prisma generate
    call npx prisma migrate dev --name init
    if errorlevel 1 (
        echo ⚠️  数据库初始化失败，将继续启动但可能无法正常工作
    ) else (
        echo ✓ 数据库初始化完成
    )
) else (
    echo ✓ 数据库已存在
)

echo.
echo [5/5] 启动服务...
cd ..
echo.
echo ====================================
echo ✓ 准备启动生产环境服务
echo ====================================
echo.
echo 请选择启动方式:
echo   1. 仅启动后端（前端已构建，可手动提供静态文件服务）
echo   2. 启动后端 + 前端预览
echo   3. 使用 PM2 管理进程（推荐）
echo.
set /p choice="请选择 (1/2/3): "

if "%choice%"=="1" (
    echo 启动后端服务...
    start "后端服务-生产环境" cmd /k "cd backend && npm start"
    echo.
    echo ✓ 后端服务已启动
    echo 访问地址: http://本机IP:3001
    echo.
) else if "%choice%"=="2" (
    echo 启动后端服务...
    start "后端服务-生产环境" cmd /k "cd backend && npm start"
    timeout /t 3 /nobreak >nul
    echo 启动前端预览...
    start "前端预览-生产环境" cmd /k "cd frontend && npm run preview -- --host 0.0.0.0"
    echo.
    echo ✓ 服务已启动
    echo 前端地址: http://本机IP:4173
    echo 后端地址: http://本机IP:3001
    echo.
) else if "%choice%"=="3" (
    echo 检查 PM2...
    pm2 --version >nul 2>&1
    if errorlevel 1 (
        echo PM2 未安装，正在全局安装...
        call npm install -g pm2
    )
    echo 使用 PM2 启动服务...
    pm2 start backend/dist/index.js --name "low-code-backend" --env production
    pm2 start npm --name "low-code-frontend" -- run preview -- --host 0.0.0.0 --prefix frontend
    pm2 save
    echo.
    echo ✓ 服务已通过 PM2 启动
    echo 使用 'pm2 list' 查看服务状态
    echo 使用 'pm2 logs' 查看日志
    echo 前端地址: http://本机IP:4173
    echo 后端地址: http://本机IP:3001
    echo.
) else (
    echo 无效选择，退出...
    pause
    exit /b 1
)

echo 提示: 如果其他设备无法访问，请检查:
echo   1. Windows 防火墙是否允许端口 3001 (和 4173)
echo   2. 设备是否在同一网络
echo   3. 使用 'ipconfig' 查看本机 IP 地址
echo.
pause

