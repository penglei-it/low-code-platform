@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 上传到 GitHub
echo ====================================
echo 上传到 GitHub - 简单版
echo ====================================
echo.
cd /d "%~dp0"

echo 步骤 1: 检查 Git 状态...
git status --short
echo.

echo 步骤 2: 提交所有更改...
git add .
git commit -m "Update project files" 2>nul
echo ✓ 已提交
echo.

echo 步骤 3: 检查远程仓库...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ 未配置远程仓库
    echo.
    echo 请先创建 GitHub 仓库（如果还没有）：
    echo   1. 访问：https://github.com/new
    echo   2. 仓库名称：low-code-platform
    echo   3. 选择 Public 或 Private
    echo   4. 不要勾选任何初始化选项
    echo   5. 点击 "Create repository"
    echo.
    start https://github.com/new
    echo.
    echo 等待您创建仓库（10秒后继续）...
    timeout /t 10 /nobreak >nul
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址（例如：https://github.com/penglei-it/low-code-platform.git）: "
    if "!REPO_URL!"=="" (
        echo 未输入地址，退出
        pause
        exit /b 1
    )
    git remote add origin "!REPO_URL!"
    echo ✓ 已添加远程仓库: !REPO_URL!
) else (
    echo ✓ 远程仓库已配置
    for /f "tokens=*" %%i in ('git remote get-url origin') do echo   地址: %%i
)
echo.

echo 步骤 4: 推送到 GitHub...
echo.
echo 如果提示身份验证：
echo   用户名: 输入您的 GitHub 用户名
echo   密码: 输入 Personal Access Token（不是 GitHub 密码）
echo   生成 Token: https://github.com/settings/tokens
echo.
pause

git branch -M main 2>nul
git push -u origin main
if errorlevel 1 (
    echo.
    echo 推送失败，请检查：
    echo   1. GitHub 仓库地址是否正确
    echo   2. 是否使用了 Personal Access Token
    echo   3. 网络连接是否正常
)
echo.
pause

