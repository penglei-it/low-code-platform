@echo off
chcp 65001 >nul
echo ====================================
echo Cloudflare Tunnel 一键启动
echo ====================================
echo.

:: 检查 cloudflared
cloudflared version >nul 2>&1
if errorlevel 1 (
    echo ❌ cloudflared 未安装
    echo 请先运行: 部署CloudflareTunnel.bat
    pause
    exit /b 1
)

:: 检查服务是否运行
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ⚠️  前端服务未运行，正在启动...
    cd frontend
    start "前端服务" cmd /k "title 前端服务 && npm run preview -- --host 0.0.0.0"
    cd ..
    timeout /t 3 /nobreak >nul
) else (
    echo ✓ 前端服务正在运行
)

netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ⚠️  后端服务未运行，正在启动...
    cd backend
    start "后端服务" cmd /k "title 后端服务 && npm start"
    cd ..
    timeout /t 3 /nobreak >nul
) else (
    echo ✓ 后端服务正在运行
)

echo.
echo ====================================
echo 启动 Cloudflare Tunnel
echo ====================================
echo.
echo 选择模式：
echo   1. 快速模式（随机域名，无需配置）
echo   2. 标准模式（自定义域名，需先配置）
echo.
set /p MODE="请选择 (1 或 2): "

if "%MODE%"=="1" (
    echo.
    echo 正在启动前端隧道...
    start "Cloudflare Tunnel - 前端" cmd /k "title Cloudflare Tunnel - 前端 && cloudflared tunnel --url http://localhost:4173"
    
    timeout /t 2 /nobreak >nul
    
    echo 正在启动后端隧道...
    start "Cloudflare Tunnel - 后端" cmd /k "title Cloudflare Tunnel - 后端 && cloudflared tunnel --url http://localhost:3001"
    
    echo.
    echo ✓ 隧道已启动！
    echo.
    echo 请查看新打开的窗口获取访问地址
    echo 地址格式类似：https://random-words.trycloudflare.com
    goto :end
)

if "%MODE%"=="2" (
    echo.
    echo 请输入隧道名称（默认：low-code-platform）
    set /p TUNNEL_NAME="隧道名称: "
    if "!TUNNEL_NAME!"=="" set TUNNEL_NAME=low-code-platform
    
    echo.
    echo 正在启动隧道...
    start "Cloudflare Tunnel" cmd /k "title Cloudflare Tunnel && cloudflared tunnel run !TUNNEL_NAME!"
    
    echo.
    echo ✓ 隧道已启动！
    echo.
    echo 如果配置了域名，可以通过以下地址访问：
    echo   - 前端：https://your-domain.com
    echo   - 后端：https://api.your-domain.com
    goto :end
)

echo 无效的选项
:end
echo.
pause

