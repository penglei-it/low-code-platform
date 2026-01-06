@echo off
chcp 65001 >nul
echo ====================================
echo 快速检查部署状态
echo ====================================
echo.

echo [检查 1] Cloudflare Tunnel 状态...
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo ❌ Cloudflare Tunnel 未运行
) else (
    echo ✓ Cloudflare Tunnel 正在运行
    echo   进程信息：
    tasklist /FI "IMAGENAME eq cloudflared.exe" /FO TABLE
)

echo.
echo [检查 2] 前端服务状态（端口 4173）...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ❌ 前端服务未运行
    echo   请运行: cd frontend ^&^& npm run preview -- --host 0.0.0.0
) else (
    echo ✓ 前端服务正在运行
    netstat -ano | findstr ":4173"
)

echo.
echo [检查 3] 后端服务状态（端口 3001）...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ❌ 后端服务未运行
    echo   请运行: cd backend ^&^& npm start
) else (
    echo ✓ 后端服务正在运行
    netstat -ano | findstr ":3001"
    echo   测试后端连接...
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '   ✓ 后端响应正常: ' $r.Content } catch { Write-Host '   ❌ 后端无响应' }" 2>nul
)

echo.
echo ====================================
echo 部署状态总结
echo ====================================
echo.

tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
set TUNNEL_RUNNING=%errorlevel%

netstat -ano | findstr ":4173" >nul
set FRONTEND_RUNNING=%errorlevel%

netstat -ano | findstr ":3001" >nul
set BACKEND_RUNNING=%errorlevel%

if %TUNNEL_RUNNING%==0 if %FRONTEND_RUNNING%==0 if %BACKEND_RUNNING%==0 (
    echo ✅ 部署成功！所有服务都在运行！
    echo.
    echo 请查看 Cloudflare Tunnel 窗口获取访问地址
    echo 如果是随机域名，地址格式：https://xxx.trycloudflare.com
) else (
    echo ⚠️  部分服务未运行，请检查上方提示
    echo.
    echo 快速启动：
    echo   1. 运行: 一键启动CloudflareTunnel.bat
    echo   2. 或查看: 部署状态总结.md
)

echo.
pause

