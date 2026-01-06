@echo off
chcp 65001 >nul
echo ====================================
echo 修复部署问题脚本
echo ====================================
echo.

:: 强制重新构建前端
echo [1/3] 清理并重新构建前端...
cd frontend
if exist dist rmdir /s /q dist
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败，请检查错误信息
    pause
    exit /b 1
)
if exist dist\index.html (
    echo ✓ 前端构建成功
) else (
    echo ❌ 前端构建失败：dist\index.html 不存在
    pause
    exit /b 1
)
cd ..

:: 检查后端构建
echo.
echo [2/3] 检查后端构建...
if exist backend\dist\index.js (
    echo ✓ 后端构建产物存在
) else (
    echo 正在构建后端...
    cd backend
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败
        pause
        exit /b 1
    )
    cd ..
    echo ✓ 后端构建完成
)

:: 检查数据库
echo.
echo [3/3] 检查数据库...
cd backend
if not exist prisma\dev.db (
    echo 正在初始化数据库...
    call npx prisma generate
    if errorlevel 1 (
        echo ⚠️  Prisma Client 生成失败
    )
    call npx prisma migrate dev --name init
    if errorlevel 1 (
        echo ⚠️  数据库迁移失败
    ) else (
        echo ✓ 数据库初始化完成
    )
) else (
    echo ✓ 数据库已存在
)
cd ..

echo.
echo ====================================
echo ✓ 所有检查完成，可以开始部署
echo ====================================
echo.
echo 运行以下命令启动服务：
echo   1. 后端: cd backend ^&^& npm start
echo   2. 前端: cd frontend ^&^& npm run preview -- --host 0.0.0.0
echo.
echo 或运行：一键部署.bat
echo.
pause

