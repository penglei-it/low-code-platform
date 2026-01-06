@echo off
chcp 65001 >nul
echo ====================================
echo 完整部署流程：GitHub + Railway
echo ====================================
echo.

echo 此脚本将帮助您完成：
echo   1. 上传代码到 GitHub
echo   2. 部署到 Railway
echo   3. 获取互联网访问地址
echo.

pause

:: 步骤 1：上传到 GitHub
echo.
echo ====================================
echo 步骤 1：上传代码到 GitHub
echo ====================================
echo.

git remote -v >nul 2>&1
if errorlevel 1 (
    echo 未配置 GitHub 远程仓库
    echo.
    echo 请先创建 GitHub 仓库：
    start https://github.com/new
    echo.
    echo 已在浏览器中打开 GitHub 创建仓库页面
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址: "
    if "%REPO_URL%"=="" (
        echo 未输入地址，退出
        pause
        exit /b 1
    )
    
    git remote add origin %REPO_URL%
    echo ✓ 已添加远程仓库
) else (
    echo ✓ GitHub 远程仓库已配置
)

echo.
echo 正在推送代码到 GitHub...
git add .
git commit -m "Update: 准备部署到 Railway" 2>nul
git branch -M main 2>nul
git push -u origin main 2>nul
if errorlevel 1 (
    echo.
    echo ⚠️  推送失败，请检查：
    echo   1. 是否使用了 Personal Access Token
    echo   2. 仓库地址是否正确
    echo.
    echo 手动推送：
    echo   git push -u origin main
    echo.
    pause
    exit /b 1
) else (
    echo ✓ 代码已成功推送到 GitHub
)

:: 步骤 2：部署到 Railway
echo.
echo ====================================
echo 步骤 2：部署到 Railway
echo ====================================
echo.
echo 现在开始部署到 Railway
echo.
pause

start https://railway.app

echo.
echo ====================================
echo Railway 部署配置
echo ====================================
echo.
echo 请在 Railway 中按照以下步骤操作：
echo.
echo 1. 使用 GitHub 账号登录 Railway
echo.
echo 2. 点击 "New Project" → "Deploy from GitHub repo"
echo    选择您的仓库
echo.
echo 3. 部署后端服务：
echo    - Root Directory: backend
echo    - Build: npm install ^&^& npm run build
echo    - Start: npm start
echo    - 等待部署完成，获取后端地址
echo.
echo 4. 部署前端服务：
echo    - 点击 "+ New" → "GitHub Repo"
echo    - Root Directory: frontend
echo    - Build: npm install ^&^& npm run build
echo    - Start: npx serve -s dist -p $PORT
echo    - 添加环境变量: VITE_API_BASE_URL=https://后端地址/api
echo    - 重新部署前端
echo.
echo 5. 获取访问地址：
echo    - 前端：服务设置 → Networking → Public Domain
echo    - 后端：服务设置 → Networking → Public Domain
echo.
echo 详细说明请查看：Railway部署完整指南.md
echo.
pause

