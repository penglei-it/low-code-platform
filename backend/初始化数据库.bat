@echo off
chcp 65001 >nul
echo ========================================
echo 数据库初始化脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo [2/4] 安装Prisma依赖...
call npm install prisma@5.19.1 @prisma/client@5.19.1 better-sqlite3 --save-exact
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo [3/4] 生成Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo 错误: Prisma Client生成失败
    pause
    exit /b 1
)

echo [4/4] 创建数据库迁移...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo 错误: 数据库迁移失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 数据库初始化完成！
echo ========================================
echo.
echo 数据库文件位置: prisma\dev.db
echo.
echo 可以使用以下命令查看数据库:
echo   npx prisma studio
echo.
pause

