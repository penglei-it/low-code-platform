@echo off
chcp 65001 >nul
echo ====================================
echo 低代码平台 - 构建测试脚本
echo ====================================
echo.

echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)
echo ✓ Node.js已安装
node --version

echo.
echo [2/4] 检查依赖...
cd backend
if not exist node_modules (
    echo ⚠️  后端依赖未安装，正在安装...
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo ✓ 后端依赖已安装

cd ..\frontend
if not exist node_modules (
    echo ⚠️  前端依赖未安装，正在安装...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo ✓ 前端依赖已安装

echo.
echo [3/4] 构建后端...
cd ..\backend
echo 正在构建后端...
call npm run build
if errorlevel 1 (
    echo ❌ 后端构建失败
    echo.
    echo 常见问题排查:
    echo   1. 检查 TypeScript 错误: 查看上方错误信息
    echo   2. 检查 Prisma Client: 运行 npx prisma generate
    echo   3. 检查依赖: 删除 node_modules 后重新 npm install
    pause
    exit /b 1
)
echo ✓ 后端构建成功

echo.
echo [4/4] 构建前端...
cd ..\frontend
echo 正在构建前端...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    echo.
    echo 常见问题排查:
    echo   1. 检查 TypeScript 错误: 查看上方错误信息
    echo   2. 检查依赖: 删除 node_modules 后重新 npm install
    echo   3. 检查 Vite 配置: 查看 vite.config.ts
    pause
    exit /b 1
)
echo ✓ 前端构建成功

cd ..
echo.
echo ====================================
echo ✓ 所有构建测试通过！
echo ====================================
echo.
echo 构建产物位置:
echo   后端: backend\dist
echo   前端: frontend\dist
echo.
pause

