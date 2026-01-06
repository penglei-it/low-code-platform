@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 一键上传到 GitHub
echo ====================================
echo.

:: 1. 提交所有更改
echo [1/4] 提交所有更改...
git add .
git commit -m "Update: 准备部署" 2>nul
if errorlevel 1 (
    echo ✓ 没有需要提交的更改
) else (
    echo ✓ 更改已提交
)

:: 2. 检查远程仓库
echo.
echo [2/4] 检查远程仓库...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未配置远程仓库
    echo.
    echo 请先创建 GitHub 仓库：
    echo   1. 访问：https://github.com/new
    echo   2. 填写仓库名称
    echo   3. 选择 Public 或 Private
    echo   4. 不要勾选任何初始化选项
    echo   5. 点击 "Create repository"
    echo   6. 复制仓库地址
    echo.
    start https://github.com/new
    echo.
    set /p GIT_REPO="请输入 GitHub 仓库地址（例如：https://github.com/username/repo.git）: "
    
    if "!GIT_REPO!"=="" (
        echo.
        echo ⚠️  未输入地址，退出
        echo 您可以稍后手动运行：完成GitHub上传.bat
        pause
        exit /b 1
    )
    
    git remote add origin !GIT_REPO!
    echo ✓ 已添加远程仓库
) else (
    echo ✓ 远程仓库已配置
    git remote -v
)

:: 3. 确保在 main 分支
echo.
echo [3/4] 检查分支...
git branch -M main 2>nul
echo ✓ 当前分支：main

:: 4. 推送代码
echo.
echo [4/4] 推送到 GitHub...
echo.
echo ⚠️  如果提示身份验证：
echo   1. 用户名：输入您的 GitHub 用户名
echo   2. 密码：输入 GitHub Personal Access Token（不是密码）
echo.
echo 生成 Token：https://github.com/settings/tokens
echo.
pause

git push -u origin main 2>nul
if errorlevel 1 (
    echo.
    echo ⚠️  推送失败
    echo.
    echo 可能的原因：
    echo   1. 需要身份验证（请使用 Personal Access Token）
    echo   2. 远程仓库地址错误
    echo   3. 网络问题
    echo.
    echo 请手动执行：
    echo   git push -u origin main
    echo.
    echo 如果使用 Token，访问：
    echo   https://github.com/settings/tokens
    echo   生成 Token 后，推送时使用 Token 作为密码
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✓ 上传成功！
echo ====================================
echo.
echo 您的代码现在在 GitHub 上了！
echo.
echo 下一步：
echo   1. 访问您的 GitHub 仓库确认代码已上传
echo   2. 运行：开始Railway部署.bat
echo   3. 在 Railway 中连接此仓库进行部署
echo.
echo 查看远程仓库地址：
git remote -v
echo.
pause

endlocal

