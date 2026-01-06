@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 推送到 GitHub

echo ====================================
echo 立即推送到 GitHub
echo ====================================
echo.

cd /d "%~dp0"

:: 配置远程仓库
echo [1/3] 配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/penglei-it/low-code-platform.git
if errorlevel 1 (
    echo ❌ 配置失败
    pause
    exit /b 1
)
echo ✓ 已配置远程仓库: https://github.com/penglei-it/low-code-platform.git
git remote -v
echo.

:: 确保在 main 分支
echo [2/3] 检查分支...
git branch -M main 2>nul
echo ✓ 当前分支: main
echo.

:: 推送到 GitHub
echo [3/3] 推送到 GitHub...
echo.
echo ⚠️  如果提示身份验证：
echo   - 用户名：penglei-it
echo   - 密码：Personal Access Token（不是 GitHub 密码！）
echo   - 生成 Token：https://github.com/settings/tokens
echo.
pause

echo.
echo 正在推送...
git push -u origin main
if errorlevel 1 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 可能的原因：
    echo   1. 未使用 Personal Access Token（需要使用 Token，不是密码）
    echo   2. Token 权限不足（需要 repo 权限）
    echo   3. 网络问题
    echo.
    echo 生成 Token 步骤：
    echo   1. 访问：https://github.com/settings/tokens
    echo   2. 点击 "Generate new token (classic)"
    echo   3. 勾选 "repo" 权限
    echo   4. 复制 Token 并在推送时使用
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✓ 代码已成功推送到 GitHub！
echo ====================================
echo.
echo 访问仓库查看：
echo https://github.com/penglei-it/low-code-platform
echo.
pause

endlocal

