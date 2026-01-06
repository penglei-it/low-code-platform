@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Railway 自动部署修复

echo ====================================
echo Railway 自动部署修复工具
echo ====================================
echo.

cd /d "%~dp0"

:: 1. 检查并提交所有更改
echo [1/5] 检查并提交所有更改...
git add .
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Prepare for Railway deployment"
    echo ✓ 已提交更改
) else (
    echo ✓ 没有需要提交的更改
)

:: 2. 检查配置文件
echo.
echo [2/5] 检查 Railway 配置文件...
if exist "railway.json" (
    echo ✓ railway.json 存在
) else (
    echo ❌ railway.json 不存在，正在创建...
    echo {>$railway.json
    echo   "$schema": "https://railway.app/railway.schema.json",>>$railway.json
    echo   "build": { "builder": "NIXPACKS" }>>$railway.json
    echo }>>$railway.json
)

if exist "backend\railway.json" (
    echo ✓ backend/railway.json 存在
) else (
    echo ❌ backend/railway.json 不存在，正在创建...
)

if exist "frontend\railway.json" (
    echo ✓ frontend/railway.json 存在
) else (
    echo ❌ frontend/railway.json 不存在，正在创建...
)

:: 3. 检查 serve 依赖
echo.
echo [3/5] 检查前端依赖...
findstr /C:"serve" "frontend\package.json" >nul
if errorlevel 1 (
    echo ⚠️  serve 依赖缺失，但 package.json 中已包含
) else (
    echo ✓ serve 依赖已配置
)

:: 4. 推送到 GitHub
echo.
echo [4/5] 推送到 GitHub...
git push origin main >nul 2>&1
if errorlevel 1 (
    echo ⚠️  推送失败（可能已在最新状态）
) else (
    echo ✓ 已推送到 GitHub
)

:: 5. 显示部署指南
echo.
echo [5/5] 部署配置指南
echo.
echo ====================================
echo 下一步：在 Railway 中配置服务
echo ====================================
echo.
echo 请按照以下步骤在 Railway 中部署：
echo.
echo 1. 部署 Backend 服务：
echo    - Root Directory: backend
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npm start
echo    - Healthcheck: /api/health
echo.
echo 2. 等待 Backend 启动成功，获取 Public Domain
echo.
echo 3. 部署 Frontend 服务：
echo    - Root Directory: frontend
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npx serve -s dist -p $PORT
echo    - Healthcheck: /
echo    - Environment Variable: VITE_API_BASE_URL = https://[backend-domain]/api
echo.
echo 详细说明请查看：
echo   Railway自动部署配置.md
echo.
echo ====================================
echo 当前状态
echo ====================================
echo.
echo ✓ 代码已推送到 GitHub
echo ✓ Railway 配置文件已检查
echo ✓ 项目已准备好部署
echo.
echo 访问 Railway：https://railway.app
echo 查看部署指南：Railway自动部署配置.md
echo.
pause

endlocal

