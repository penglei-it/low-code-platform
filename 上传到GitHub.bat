@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 上传项目到 GitHub
echo ====================================
echo.

:: 1. 检查 Git
echo [步骤 1/6] 检查 Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安装
    echo 请先安装 Git：https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✓ Git 已安装
git --version

:: 2. 初始化 Git 仓库
echo.
echo [步骤 2/6] 检查 Git 仓库...
if not exist .git (
    echo 正在初始化 Git 仓库...
    git init
    echo ✓ Git 仓库已初始化
) else (
    echo ✓ Git 仓库已存在
)

:: 3. 检查 .gitignore
echo.
echo [步骤 3/6] 检查 .gitignore...
if not exist .gitignore (
    echo ⚠️  .gitignore 不存在，正在创建...
    goto :create_gitignore
) else (
    echo ✓ .gitignore 已存在
)

:create_gitignore
:: 4. 添加所有文件
echo.
echo [步骤 4/6] 添加文件到 Git...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✓ 文件已添加到暂存区

:: 5. 提交
echo.
echo [步骤 5/6] 提交更改...
git commit -m "Initial commit: 低代码开发平台" 2>nul
if errorlevel 1 (
    echo ⚠️  提交失败或没有需要提交的文件
    git status --short
)

:: 6. 配置远程仓库
echo.
echo [步骤 6/6] 配置 GitHub 远程仓库...
echo.

git remote -v >nul 2>&1
if errorlevel 1 (
    echo 未配置远程仓库
    echo.
    echo 请选择：
    echo   1. 我已经在 GitHub 创建了仓库
    echo   2. 我需要创建新仓库
    echo.
    set /p CHOICE="请选择 (1 或 2): "
    
    if "!CHOICE!"=="1" (
        echo.
        set /p GIT_REPO="请输入 GitHub 仓库地址（例如：https://github.com/username/repo.git）: "
        if not "!GIT_REPO!"=="" (
            git remote add origin !GIT_REPO!
            echo ✓ 已添加远程仓库：!GIT_REPO!
        ) else (
            echo ⚠️  未输入地址，跳过
            goto :push_code
        )
    ) else (
        echo.
        echo ====================================
        echo 创建 GitHub 仓库步骤
        echo ====================================
        echo.
        echo 1. 访问 https://github.com/new
        echo 2. 填写仓库名称
        echo 3. 选择 Public 或 Private
        echo 4. 不要勾选 "Initialize this repository with a README"
        echo 5. 点击 "Create repository"
        echo 6. 复制仓库地址（例如：https://github.com/username/repo.git）
        echo.
        pause
        
        set /p GIT_REPO="请输入 GitHub 仓库地址: "
        if not "!GIT_REPO!"=="" (
            git remote add origin !GIT_REPO!
            echo ✓ 已添加远程仓库：!GIT_REPO!
        ) else (
            echo ⚠️  未输入地址
            goto :end
        )
    )
) else (
    echo ✓ 远程仓库已配置
    git remote -v
)

:push_code
echo.
echo ====================================
echo 推送到 GitHub
echo ====================================
echo.

echo 正在推送代码到 GitHub...
git branch -M main 2>nul
git push -u origin main 2>nul
if errorlevel 1 (
    git push -u origin master 2>nul
    if errorlevel 1 (
        echo.
        echo ⚠️  推送失败，可能的原因：
        echo   1. 远程仓库地址错误
        echo   2. 需要身份验证
        echo   3. 分支名称不匹配
        echo.
        echo 请手动执行：
        echo   git branch -M main
        echo   git push -u origin main
        echo.
        echo 或如果使用 master 分支：
        echo   git push -u origin master
        echo.
        echo 如果提示身份验证，请：
        echo   1. 使用 GitHub Personal Access Token
        echo   2. 或配置 SSH 密钥
        goto :end
    ) else (
        echo ✓ 代码已推送到 GitHub（master 分支）
    )
) else (
    echo ✓ 代码已推送到 GitHub（main 分支）
)

:end
echo.
echo ====================================
echo 完成
echo ====================================
echo.
echo 如果推送成功，您的代码现在在 GitHub 上了！
echo.
echo 下一步：
echo   1. 访问您的 GitHub 仓库确认代码已上传
echo   2. 在 Railway 中连接此仓库进行部署
echo.
pause

endlocal

