@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 一键上传到 GitHub
echo ====================================
echo.

:: 1. 检查并提交更改
echo [1/5] 检查并提交更改...
git add .
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Update: 清理无用文件并整理项目结构"
    echo ✓ 已提交更改
) else (
    echo ✓ 没有需要提交的更改
)

:: 2. 检查远程仓库
echo.
echo [2/5] 检查远程仓库...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 未配置远程仓库
    echo.
    echo 请创建 GitHub 仓库（如果还没有）：
    echo   1. 访问：https://github.com/new
    echo   2. 仓库名称：low-code-platform（或其他名称）
    echo   3. 选择 Public 或 Private
    echo   4. 不要勾选任何初始化选项
    echo   5. 点击 "Create repository"
    echo.
    start https://github.com/new
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址（例如：https://github.com/penglei-it/low-code-platform.git）: "
    if "!REPO_URL!"=="" (
        echo 未输入地址，退出
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
    echo ✓ 已添加远程仓库
) else (
    echo ✓ 远程仓库已配置
    git remote get-url origin
)

:: 3. 测试远程连接
echo.
echo [3/5] 测试远程仓库连接...
git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 远程仓库连接失败
    echo.
    echo 可能的原因：
    echo   1. 仓库地址错误
    echo   2. 需要身份验证
    echo   3. 仓库不存在或无权访问
    echo.
    echo 请检查仓库地址并重试
    pause
    exit /b 1
) else (
    echo ✓ 远程仓库连接正常
)

:: 4. 确保在 main 分支
echo.
echo [4/5] 检查分支...
git branch -M main 2>nul
echo ✓ 当前分支：main

:: 5. 推送到 GitHub
echo.
echo [5/5] 推送到 GitHub...
echo.
echo ⚠️  重要提示：
echo   - 如果提示输入用户名：输入您的 GitHub 用户名（penglei-it）
echo   - 如果提示输入密码：输入 Personal Access Token（不是 GitHub 密码！）
echo.
echo   生成 Token 步骤：
echo   1. 访问：https://github.com/settings/tokens
echo   2. 点击 "Generate new token (classic)"
echo   3. 输入名称（如：low-code-platform）
echo   4. 勾选 "repo" 权限（全选）
echo   5. 点击 "Generate token"
echo   6. 复制生成的 Token（只显示一次）
echo.
pause

echo.
echo 正在推送...
git push -u origin main
if errorlevel 1 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 常见问题和解决方案：
    echo.
    echo 1. 如果提示 "Authentication failed"：
    echo    - 确保使用 Personal Access Token，不是 GitHub 密码
    echo    - 确保 Token 有 repo 权限
    echo.
    echo 2. 如果提示 "Repository not found"：
    echo    - 检查仓库地址是否正确
    echo    - 确保仓库已创建
    echo    - 确保有访问权限
    echo.
    echo 3. 如果提示 "Permission denied"：
    echo    - 检查 Token 权限
    echo    - 确认仓库是您自己的或您有推送权限
    echo.
    echo 请按照上述提示解决问题后重试
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✓ 代码已成功推送到 GitHub！
echo ====================================
echo.
echo 远程仓库地址：
git remote get-url origin
echo.
echo 访问您的 GitHub 仓库查看代码：
git remote get-url origin | findstr /r "github.com"
echo.
echo 推送完成！
echo.
pause

endlocal

