@echo off
chcp 65001 >nul
echo ====================================
echo 快速访问指南
echo ====================================
echo.

echo 您现在看到 Cloudflare 授权页面了吗？
echo.
echo 有两个选择：
echo.
echo [选择 1] 快速访问（推荐，无需配置域名）
echo   1. 关闭授权页面（点击 X 或返回）
echo   2. 运行此脚本选择快速模式
echo   3. 立即获得访问地址
echo.
echo [选择 2] 使用您的域名 hajimi.com
echo   1. 点击域名 hajimi.com 继续授权
echo   2. 完成后需要配置 DNS（详见文档）
echo   3. 配置完成后使用 hajimi.com 访问
echo.
echo ====================================
echo 立即开始（快速模式）
echo ====================================
echo.
set /p CHOICE="选择 1 快速模式，选择 2 使用域名，或其他键退出: "

if "%CHOICE%"=="1" (
    echo.
    echo 正在启动快速模式（随机域名）...
    echo.
    
    :: 检查服务
    echo 检查服务状态...
    netstat -ano | findstr ":4173" >nul
    if errorlevel 1 (
        echo 启动前端服务...
        cd frontend
        start "前端服务" cmd /k "title 前端服务 && npm run preview -- --host 0.0.0.0"
        cd ..
        timeout /t 3 /nobreak >nul
    )
    
    netstat -ano | findstr ":3001" >nul
    if errorlevel 1 (
        echo 启动后端服务...
        cd backend
        start "后端服务" cmd /k "title 后端服务 && npm start"
        cd ..
        timeout /t 5 /nobreak >nul
    )
    
    echo 启动 Cloudflare Tunnel...
    start "Cloudflare Tunnel - 前端" cmd /k "title Cloudflare Tunnel - 前端 && cloudflared tunnel --url http://localhost:4173"
    timeout /t 2 /nobreak >nul
    start "Cloudflare Tunnel - 后端" cmd /k "title Cloudflare Tunnel - 后端 && cloudflared tunnel --url http://localhost:3001"
    
    echo.
    echo ====================================
    echo ✓ 启动完成！
    echo ====================================
    echo.
    echo 请查看新打开的 Cloudflare Tunnel 窗口
    echo 会显示访问地址，格式类似：
    echo   https://xxx-xxx-xxx.trycloudflare.com
    echo.
    echo 将地址分享给其他人即可访问！
    echo.
    goto :end
)

if "%CHOICE%"=="2" (
    echo.
    echo ====================================
    echo 使用域名 hajimi.com
    echo ====================================
    echo.
    echo 步骤：
    echo   1. 在授权页面点击 hajimi.com 继续
    echo   2. 等待授权完成
    echo   3. 查看详细文档：如何访问应用.md
    echo.
    echo 提示：需要配置 DNS 才能使用域名
    echo 如果想快速访问，建议选择方式 1
    echo.
    goto :end
)

:end
pause

