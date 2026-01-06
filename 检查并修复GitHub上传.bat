@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 检查并修复 GitHub 上传问题
echo ====================================
echo.

:: 1. 检查 Git 状态
echo [步骤 1] 检查 Git 状态...
git status --short
if errorlevel 1 (
    echo ⚠️  Git 仓库未初始化
    git init
    echo ✓ 已初始化 Git 仓库
)

:: 2. 检查远程仓库
echo.
echo [步骤 2] 检查远程仓库...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 未配置远程仓库
    goto :configure_remote
) else (
    echo ✓ 远程仓库已配置：
    git remote -v
    echo.
    echo 测试远程仓库连接...
    git ls-remote --heads origin >nul 2>&1
    if errorlevel 1 (
        echo ❌ 远程仓库无法访问
        echo.
        echo 可能的原因：
        echo   1. 仓库地址错误
        echo   2. 仓库不存在
        echo   3. 权限不足
        echo.
        goto :fix_remote
    ) else (
        echo ✓ 远程仓库连接正常
    )
)

:: 3. 提交所有更改
echo.
echo [步骤 3] 提交所有更改...
git add .
git status --short | findstr /v "^$" >nul
if errorlevel 1 (
    echo ✓ 没有需要提交的更改
) else (
    echo 发现未提交的更改，正在提交...
    git commit -m "Update: 清理无用文件并准备部署"
    if errorlevel 1 (
        echo ❌ 提交失败
        pause
        exit /b 1
    )
    echo ✓ 更改已提交
)

:: 4. 检查分支
echo.
echo [步骤 4] 检查分支...
git branch --show-current >nul 2>&1
if errorlevel 1 (
    git checkout -b main 2>nul
    echo ✓ 已创建 main 分支
)
git branch -M main 2>nul
echo ✓ 当前分支：main

:: 5. 推送到 GitHub
echo.
echo [步骤 5] 推送到 GitHub...
echo.
echo ⚠️  如果提示身份验证：
echo   用户名: 输入 GitHub 用户名
echo   密码: 输入 Personal Access Token（不是 GitHub 密码）
echo   生成 Token: https://github.com/settings/tokens
echo.
pause

git push -u origin main 2>nul
if errorlevel 1 (
    echo.
    echo ⚠️  推送失败，尝试其他方法...
    git push origin main 2>nul
    if errorlevel 1 (
        echo.
        echo ❌ 推送仍然失败
        echo.
        echo 请检查：
        echo   1. 是否使用了 Personal Access Token
        echo   2. 仓库地址是否正确
        echo   3. 是否有推送权限
        echo.
        echo 手动推送命令：
        echo   git push -u origin main
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ====================================
echo ✓ 代码已成功推送到 GitHub！
echo ====================================
echo.
echo 请在 GitHub 上验证：
git remote get-url origin
echo.
echo 访问仓库查看代码是否已上传
echo.
pause
goto :end

:configure_remote
echo.
echo 需要配置 GitHub 远程仓库
echo.
echo 请选择：
echo   1. 已有 GitHub 仓库
echo   2. 需要创建新仓库
echo.
set /p CHOICE="请选择 (1 或 2): "

if "!CHOICE!"=="1" (
    set /p REPO_URL="请输入 GitHub 仓库地址: "
    if "!REPO_URL!"=="" (
        echo 未输入地址
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
    echo ✓ 已添加远程仓库
    goto :step3
)

if "!CHOICE!"=="2" (
    echo.
    echo 请先创建 GitHub 仓库：
    echo   1. 访问：https://github.com/new
    echo   2. 填写仓库名称
    echo   3. 选择 Public 或 Private
    echo   4. 不要勾选任何初始化选项
    echo   5. 点击 "Create repository"
    echo.
    start https://github.com/new
    echo.
    set /p REPO_URL="请输入 GitHub 仓库地址: "
    if "!REPO_URL!"=="" (
        echo 未输入地址
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
    echo ✓ 已添加远程仓库
    goto :step3
)

goto :end

:fix_remote
echo.
echo 远程仓库配置有问题，请修复...
echo.
echo 当前远程仓库：
git remote -v
echo.
set /p FIX="是否重新配置远程仓库？(Y/N): "
if /i "!FIX!"=="Y" (
    git remote remove origin 2>nul
    set /p NEW_REPO="请输入正确的 GitHub 仓库地址: "
    if not "!NEW_REPO!"=="" (
        git remote add origin !NEW_REPO!
        echo ✓ 已更新远程仓库
        goto :step3
    )
)

:step3
echo.
echo 继续执行步骤 3...
goto :step3_actual

:step3_actual
:: 3. 提交所有更改
echo.
echo [步骤 3] 提交所有更改...
git add .
git commit -m "Update: 清理无用文件并准备部署" 2>nul
echo ✓ 已提交

:: 4. 检查分支
echo.
echo [步骤 4] 检查分支...
git branch -M main 2>nul
echo ✓ 当前分支：main

:: 5. 推送到 GitHub
echo.
echo [步骤 5] 推送到 GitHub...
echo.
echo ⚠️  如果提示身份验证，请使用 Personal Access Token
echo.
pause

git push -u origin main 2>nul
if errorlevel 1 (
    git push origin main 2>nul
    if errorlevel 1 (
        echo.
        echo ❌ 推送失败
        echo.
        echo 常见问题解决：
        echo   1. 检查是否使用了 Token（不是密码）
        echo   2. 验证仓库地址是否正确
        echo   3. 检查网络连接
        echo.
        echo 生成 Token：https://github.com/settings/tokens
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ====================================
echo ✓ 代码已成功推送到 GitHub！
echo ====================================
echo.
echo 远程仓库地址：
git remote get-url origin
echo.
echo 访问 GitHub 仓库验证代码已上传
echo.

:end
pause
endlocal

