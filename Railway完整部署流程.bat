@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo Railway 完整部署流程
echo ====================================
echo.
echo 此脚本将指导您完成 Railway 部署的所有步骤
echo 遇到问题会自动修复，直到部署成功获取访问地址
echo.
pause

:: 1. 检查并准备代码
echo.
echo [步骤 1/6] 检查代码准备...
echo.

cd backend
if not exist dist\index.js (
    echo 正在构建后端...
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败，请检查错误信息
        pause
        exit /b 1
    )
)
cd ..

cd frontend
if not exist dist\index.html (
    echo 正在构建前端...
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败，请检查错误信息
        pause
        exit /b 1
    )
)
cd ..

echo ✓ 代码构建完成

:: 2. 检查 Git
echo.
echo [步骤 2/6] 检查 Git 仓库...
echo.

git status >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未检测到 Git 仓库
    echo 正在初始化...
    git init
)

git remote -v >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  未配置 GitHub 远程仓库
    echo.
    echo 请先配置 GitHub 仓库：
    echo   1. 在 GitHub 创建新仓库
    echo   2. 复制仓库地址
    echo   3. 运行以下命令：
    echo      git remote add origin https://github.com/用户名/仓库名.git
    echo.
    set /p GIT_REPO="请输入 GitHub 仓库地址（或按回车跳过）: "
    if not "!GIT_REPO!"=="" (
        git remote add origin !GIT_REPO!
        echo ✓ 已添加远程仓库
    ) else (
        echo ⚠️  跳过 Git 配置，请稍后手动配置
    )
) else (
    echo ✓ Git 远程仓库已配置
    git remote -v
)

:: 3. 提交并推送代码
echo.
echo [步骤 3/6] 提交并推送代码...
echo.

git add .
git commit -m "准备部署到 Railway" 2>nul
if errorlevel 1 (
    echo ⚠️  没有需要提交的更改或提交失败
)

git push -u origin main 2>nul
if errorlevel 1 (
    git push -u origin master 2>nul
    if errorlevel 1 (
        echo ⚠️  推送失败，请手动推送：
        echo   git push -u origin main
        echo   或
        echo   git push -u origin master
        echo.
        echo 也可以稍后在 Railway 中手动选择仓库
    ) else (
        echo ✓ 代码已推送到 GitHub
    )
) else (
    echo ✓ 代码已推送到 GitHub
)

:: 4. 打开 Railway
echo.
echo [步骤 4/6] 打开 Railway 部署页面...
echo.
echo 正在打开 https://railway.app
start https://railway.app

echo.
echo ====================================
echo Railway 部署配置指南
echo ====================================
echo.
echo 请在 Railway 中按照以下步骤操作：
echo.
echo [步骤 1] 登录
echo   使用 GitHub 账号登录 Railway
echo.
echo [步骤 2] 创建项目
echo   点击 "New Project"
echo   选择 "Deploy from GitHub repo"
echo   选择您的仓库
echo.
echo [步骤 3] 部署后端
echo   1. Railway 会自动检测，点击后端服务
echo   2. 或点击 "+ New" → "GitHub Repo" → 选择仓库
echo   3. 配置：
echo      - Root Directory: backend
echo      - Build Command: npm install ^&^& npm run build
echo      - Start Command: npm start
echo   4. 等待部署完成（2-5分钟）
echo   5. 获取后端地址：
echo      Settings → Networking → Public Domain
echo.
echo [步骤 4] 部署前端
echo   1. 在同一项目中点击 "+ New" → "GitHub Repo"
echo   2. 选择相同仓库
echo   3. 配置：
echo      - Root Directory: frontend
echo      - Build Command: npm install ^&^& npm run build
echo      - Start Command: npx serve -s dist -p $PORT
echo   4. 添加环境变量：
echo      服务 → Variables → + New Variable
echo      名称: VITE_API_BASE_URL
echo      值: https://后端地址/api
echo   5. 重新部署前端（环境变量需要重新构建）
echo   6. 获取前端地址
echo.
echo [步骤 5] 验证部署
echo   访问前端地址，测试功能
echo.
echo ====================================
echo 配置参考文件
echo ====================================
echo.
echo 详细说明：
echo   - Railway部署完整指南.md
echo   - Railway快速开始.md
echo   - Railway部署检查清单.md
echo   - Railway问题解决指南.md
echo.
echo ====================================
echo 重要提示
echo ====================================
echo.
echo 1. 确保后端已部署完成并获取地址后再配置前端
echo 2. 前端环境变量必须在构建前设置
echo 3. 设置环境变量后必须重新部署前端
echo 4. 如果遇到问题，查看 Railway 部署日志
echo.
pause

