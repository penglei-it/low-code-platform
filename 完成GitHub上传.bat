@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 完成 GitHub 上传
echo ====================================
echo.

:: 检查远程仓库
git remote -v >nul 2>&1
if errorlevel 1 (
    echo 未配置 GitHub 远程仓库
    echo.
    echo 请先创建 GitHub 仓库：
    echo   1. 访问 https://github.com/new
    echo   2. 填写仓库名称
    echo   3. 选择 Public 或 Private
    echo   4. 不要勾选 "Initialize this repository with a README"
    echo   5. 点击 "Create repository"
    echo   6. 复制仓库地址
    echo.
    set /p GIT_REPO="请输入 GitHub 仓库地址: "
    
    if "!GIT_REPO!"=="" (
        echo 未输入地址，退出
        pause
        exit /b 1
    )
    
    git remote add origin !GIT_REPO!
    echo ✓ 已添加远程仓库
) else (
    echo ✓ 远程仓库已配置
    git remote -v
)

echo.
echo 检查当前分支...
git branch --show-current >nul 2>&1
if errorlevel 1 (
    echo 正在创建 main 分支...
    git checkout -b main 2>nul
)

echo.
echo 检查是否有未提交的更改...
git status --porcelain | findstr /v "^$" >nul
if not errorlevel 1 (
    echo 发现未提交的更改，正在提交...
    git add .
    git commit -m "Update: 准备部署到 Railway"
    echo ✓ 已提交更改
) else (
    echo ✓ 所有更改已提交
)

echo.
echo 正在推送代码到 GitHub...
echo.

git branch -M main 2>nul
git push -u origin main 2>nul
if errorlevel 1 (
    echo 尝试使用 master 分支...
    git branch -M master 2>nul
    git push -u origin master 2>nul
    if errorlevel 1 (
        echo.
        echo ❌ 推送失败
        echo.
        echo 可能的原因：
        echo   1. 需要身份验证
        echo   2. 远程仓库地址错误
        echo   3. 分支冲突
        echo.
        echo 请手动执行：
        echo   git push -u origin main
        echo.
        echo 如果提示身份验证，请使用 GitHub Personal Access Token
        echo   访问：https://github.com/settings/tokens
        echo   生成 Token 后，在推送时使用 Token 作为密码
        echo.
        pause
        exit /b 1
    ) else (
        echo.
        echo ✓ 代码已成功推送到 GitHub（master 分支）
    )
) else (
    echo.
    echo ✓ 代码已成功推送到 GitHub（main 分支）
)

echo.
echo ====================================
echo 上传成功！
echo ====================================
echo.
echo 您的代码现在在 GitHub 上了！
echo.
echo 下一步：
echo   1. 访问您的 GitHub 仓库确认代码已上传
echo   2. 运行：开始Railway部署.bat
echo   3. 在 Railway 中连接此仓库进行部署
echo.
pause

endlocal

