@echo off
chcp 65001 >nul
echo ====================================
echo 检查 Railway 部署状态
echo ====================================
echo.

echo [检查 1] GitHub 代码上传状态...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 未配置 GitHub 远程仓库
    echo    代码尚未上传到 GitHub
    echo.
    echo    请先上传到 GitHub：
    echo      运行：上传到GitHub-简单版.bat
    goto :railway_check
) else (
    echo ✓ GitHub 远程仓库已配置
    git remote -v
    echo.
    
    echo 检查是否已推送到 GitHub...
    git ls-remote --heads origin main >nul 2>&1
    if errorlevel 1 (
        git ls-remote --heads origin master >nul 2>&1
        if errorlevel 1 (
            echo ❌ 代码尚未推送到 GitHub
            echo    请运行：上传到GitHub-简单版.bat
        ) else (
            echo ✓ 代码已推送到 GitHub（master 分支）
        )
    ) else (
        echo ✓ 代码已推送到 GitHub（main 分支）
    )
)

:railway_check
echo.
echo ====================================
echo [检查 2] Railway 部署状态
echo ====================================
echo.
echo ⚠️  无法自动检查 Railway 部署状态
echo    需要在 Railway Dashboard 中查看
echo.
echo 请访问：https://railway.app/dashboard
echo.
echo 检查步骤：
echo   1. 登录 Railway
echo   2. 查看项目列表
echo   3. 点击项目，查看服务状态
echo   4. 如果服务显示 "Running"，说明已部署
echo   5. 在服务设置中查看 "Public Domain" 获取访问地址
echo.

echo ====================================
echo 部署状态总结
echo ====================================
echo.
echo GitHub 状态：
git remote -v 2>nul
if errorlevel 1 (
    echo   ❌ 未配置远程仓库
) else (
    echo   ✓ 已配置远程仓库
)

echo.
echo Railway 状态：
echo   ⚠️  请在 Railway Dashboard 中查看
echo   访问：https://railway.app/dashboard
echo.

echo ====================================
echo 如果尚未部署到 Railway
echo ====================================
echo.
echo 步骤：
echo   1. 确保代码已上传到 GitHub
echo   2. 访问 https://railway.app
echo   3. 使用 GitHub 账号登录
echo   4. 点击 "New Project" → "Deploy from GitHub repo"
echo   5. 选择您的仓库
echo   6. 配置并部署服务
echo.
echo 详细说明：
echo   - Railway部署完整指南.md
echo   - Railway快速开始.md
echo   - 开始Railway部署.bat
echo.
pause

