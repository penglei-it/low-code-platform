@echo off
chcp 65001 >nul
title GitHub 上传修复工具

echo.
echo ========================================
echo    GitHub 上传修复工具
echo ========================================
echo.

cd /d "%~dp0"

:: 步骤 1: 检查 Git 状态
echo [步骤 1/5] 检查 Git 状态...
git status --short >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 仓库未初始化
    git init
    echo ✓ 已初始化 Git 仓库
) else (
    echo ✓ Git 仓库正常
)

:: 步骤 2: 提交所有更改
echo.
echo [步骤 2/5] 提交所有更改...
git add .
git commit -m "Update: 清理无用文件" --quiet 2>nul
if errorlevel 1 (
    echo ✓ 没有需要提交的更改
) else (
    echo ✓ 已提交所有更改
)

:: 步骤 3: 检查远程仓库
echo.
echo [步骤 3/5] 检查远程仓库配置...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 未配置远程仓库
    echo.
    echo 需要配置 GitHub 远程仓库
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
    echo 等待您创建仓库...
    timeout /t 10 /nobreak >nul
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址（例如：https://github.com/penglei-it/low-code-platform.git）: "
    if "!REPO_URL!"=="" (
        echo.
        echo ❌ 未输入仓库地址，退出
        pause
        exit /b 1
    )
    git remote add origin "!REPO_URL!"
    echo.
    echo ✓ 已添加远程仓库：!REPO_URL!
) else (
    echo ✓ 远程仓库已配置
    for /f "tokens=*" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
    echo   地址: !REMOTE_URL!
)

:: 步骤 4: 测试远程连接
echo.
echo [步骤 4/5] 测试远程仓库连接...
git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  远程仓库连接失败（可能需要身份验证）
    echo   这通常没问题，推送时会提示输入凭证
) else (
    echo ✓ 远程仓库连接正常
)

:: 步骤 5: 推送到 GitHub
echo.
echo [步骤 5/5] 推送到 GitHub...
echo.
echo ⚠️  重要提示：
echo.
echo   如果提示身份验证：
echo   - 用户名：输入您的 GitHub 用户名（例如：penglei-it）
echo   - 密码：输入 Personal Access Token（不是 GitHub 密码！）
echo.
echo   如何生成 Token：
echo   1. 访问：https://github.com/settings/tokens
echo   2. 点击 "Generate new token (classic)"
echo   3. 勾选 "repo" 权限
echo   4. 复制生成的 Token（只显示一次）
echo.
echo   如果没有 Token，现在去生成一个...
echo.
pause

echo.
echo 正在推送到 GitHub...
echo.
git branch -M main 2>nul
git push -u origin main
if errorlevel 1 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 常见问题解决：
    echo.
    echo 1. 如果提示 "Authentication failed"：
    echo    → 确保使用 Personal Access Token，不是 GitHub 密码
    echo    → 生成 Token：https://github.com/settings/tokens
    echo.
    echo 2. 如果提示 "Repository not found"：
    echo    → 检查仓库地址是否正确
    echo    → 确保仓库已创建
    echo    → 确保用户名正确
    echo.
    echo 3. 如果提示 "Permission denied"：
    echo    → 确保 Token 有 repo 权限
    echo    → 确保仓库是您自己的
    echo.
    echo 请按照提示解决问题后，再次运行此脚本
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ 代码已成功推送到 GitHub！
echo ========================================
echo.
echo 远程仓库地址：
git remote get-url origin
echo.
echo 访问 GitHub 仓库查看代码：
for /f "tokens=*" %%i in ('git remote get-url origin') do echo %%i
echo.
echo 推送完成！✅
echo.
pause

