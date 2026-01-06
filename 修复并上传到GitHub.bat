@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 修复并上传到 GitHub
echo ====================================
echo.

:: 1. 提交所有更改
echo [1/4] 提交所有更改...
git add .
git commit -m "清理无用文件并整理项目结构" 2>nul
echo ✓ 已提交所有更改

:: 2. 检查远程仓库
echo.
echo [2/4] 检查远程仓库配置...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 未配置远程仓库
    echo.
    echo 从您的 GitHub 页面看到，用户名是：penglei-it
    echo 请创建新仓库或使用已有仓库
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
    echo ✓ 已添加远程仓库：!REPO_URL!
) else (
    echo ✓ 远程仓库已配置
    git remote -v
    echo.
    echo 测试远程仓库连接...
    git ls-remote origin >nul 2>&1
    if errorlevel 1 (
        echo ❌ 远程仓库无法访问
        echo.
        echo 可能的原因：
        echo   1. 仓库地址错误
        echo   2. 需要身份验证
        echo   3. 仓库不存在
        echo.
        set /p FIX="是否重新配置远程仓库？(Y/N): "
        if /i "!FIX!"=="Y" (
            git remote remove origin
            set /p NEW_REPO="请输入正确的 GitHub 仓库地址: "
            if not "!NEW_REPO!"=="" (
                git remote add origin !NEW_REPO!
                echo ✓ 已更新远程仓库
            )
        )
    ) else (
        echo ✓ 远程仓库连接正常
    )
)

:: 3. 确保在 main 分支
echo.
echo [3/4] 检查分支...
git branch -M main 2>nul
echo ✓ 当前分支：main

:: 4. 推送到 GitHub
echo.
echo [4/4] 推送到 GitHub...
echo.
echo ⚠️  重要提示：
echo   如果提示身份验证，请使用：
echo   - 用户名：您的 GitHub 用户名
echo   - 密码：Personal Access Token（不是 GitHub 密码）
echo.
echo   生成 Token：
echo   访问：https://github.com/settings/tokens
echo   点击 "Generate new token (classic)"
echo   勾选 "repo" 权限
echo   复制生成的 Token
echo.
pause

echo.
echo 正在推送...
git push -u origin main
if errorlevel 1 (
    echo.
    echo ⚠️  推送失败
    echo.
    echo 可能的原因：
    echo   1. 未使用 Personal Access Token
    echo   2. Token 权限不足
    echo   3. 仓库地址错误
    echo   4. 网络问题
    echo.
    echo 请重试，确保：
    echo   - 使用 Token 作为密码（不是 GitHub 密码）
    echo   - Token 有 repo 权限
    echo   - 仓库地址正确
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
echo 请在 GitHub 上验证代码已上传
echo 访问您的仓库页面查看
echo.
pause

endlocal

