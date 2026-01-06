@echo off
chcp 65001 >nul
echo ====================================
echo 一键部署前端到 Vercel
echo ====================================
echo.

echo 这是最简单的免费部署方案！
echo.
echo 优点：
echo   ✓ 完全免费（100GB 带宽/月）
echo   ✓ 零配置，上传即用
echo   ✓ 自动 HTTPS 和 CDN
echo   ✓ 全球加速
echo.

echo [步骤 1] 检查 Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI 未安装，正在安装...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ 安装失败，请手动安装：
        echo   npm install -g vercel
        pause
        exit /b 1
    )
    echo ✓ Vercel CLI 安装成功
) else (
    echo ✓ Vercel CLI 已安装
    vercel --version
)

echo.
echo [步骤 2] 检查前端构建...
cd frontend
if not exist dist\index.html (
    echo 前端未构建，正在构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败
        pause
        exit /b 1
    )
    echo ✓ 前端构建完成
) else (
    echo ✓ 前端已构建
)

echo.
echo [步骤 3] 登录 Vercel...
echo ⚠️  如果未登录，会打开浏览器进行登录
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 未登录，正在登录...
    vercel login
    if errorlevel 1 (
        echo ❌ 登录失败，请重试
        pause
        exit /b 1
    )
) else (
    echo ✓ 已登录 Vercel
    vercel whoami
)

echo.
echo [步骤 4] 部署到 Vercel...
echo.
echo 提示：
echo   - 首次部署会询问项目配置，直接按回车使用默认值
echo   - 部署完成后会获得访问地址
echo.
pause

echo 正在部署...
vercel --prod

if errorlevel 1 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 常见问题：
    echo   1. 网络问题 - 检查网络连接
    echo   2. 登录问题 - 运行: vercel login
    echo   3. 权限问题 - 检查 Vercel 账号权限
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✓ 部署成功！
echo ====================================
echo.
echo 访问地址已在上方显示
echo 格式类似：https://your-project.vercel.app
echo.
echo 提示：
echo   1. 可以配置自定义域名（在 Vercel Dashboard）
echo   2. 每次推送代码到 GitHub 会自动部署（如果连接了 GitHub）
echo   3. 查看部署：https://vercel.com/dashboard
echo.
pause
cd ..

