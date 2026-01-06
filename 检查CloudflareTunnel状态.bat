@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo Cloudflare Tunnel 部署状态检查
echo ====================================
echo.

set ALL_OK=1

:: 1. 检查 cloudflared 是否安装
echo [1/6] 检查 cloudflared 是否安装...
cloudflared version >nul 2>&1
if errorlevel 1 (
    echo ❌ cloudflared 未安装
    echo    请先运行: 部署CloudflareTunnel.bat
    set ALL_OK=0
) else (
    echo ✓ cloudflared 已安装
    for /f "tokens=*" %%i in ('cloudflared version 2^>nul') do (
        set VERSION=%%i
        echo    版本: %%i
    )
)

:: 2. 检查是否已登录
echo.
echo [2/6] 检查是否已登录 Cloudflare...
if exist "%USERPROFILE%\.cloudflared\cert.pem" (
    echo ✓ 已登录 Cloudflare
) else (
    echo ❌ 未登录 Cloudflare
    echo    请运行: cloudflared tunnel login
    set ALL_OK=0
)

:: 3. 检查隧道是否已创建
echo.
echo [3/6] 检查隧道是否已创建...
cloudflared tunnel list >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法列出隧道（可能需要先登录）
    set ALL_OK=0
) else (
    echo ✓ 隧道列表：
    cloudflared tunnel list 2>nul | findstr /i "low-code-platform"
    if errorlevel 1 (
        echo    ⚠️  未找到 low-code-platform 隧道
        echo    如需创建，运行: cloudflared tunnel create low-code-platform
        set ALL_OK=0
    ) else (
        echo    ✓ 找到 low-code-platform 隧道
    )
)

:: 4. 检查前端服务
echo.
echo [4/6] 检查前端服务（端口 4173）...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ❌ 前端服务未运行
    echo    请运行: cd frontend ^&^& npm run preview -- --host 0.0.0.0
    set ALL_OK=0
) else (
    echo ✓ 前端服务正在运行
)

:: 5. 检查后端服务
echo.
echo [5/6] 检查后端服务（端口 3001）...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ❌ 后端服务未运行
    echo    请运行: cd backend ^&^& npm start
    set ALL_OK=0
) else (
    echo ✓ 后端服务正在运行
    echo    测试后端连接...
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '    ✓ 后端响应正常' } catch { Write-Host '    ⚠️  后端无响应' }" 2>nul
)

:: 6. 检查 Cloudflare Tunnel 进程
echo.
echo [6/6] 检查 Cloudflare Tunnel 是否运行...
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo ❌ Cloudflare Tunnel 未运行
    echo.
    echo    快速模式：运行以下命令启动
    echo      前端: cloudflared tunnel --url http://localhost:4173
    echo      后端: cloudflared tunnel --url http://localhost:3001
    echo.
    echo    标准模式：运行
    echo      cloudflared tunnel run low-code-platform
    echo.
    echo    或运行: 一键启动CloudflareTunnel.bat
    set ALL_OK=0
) else (
    echo ✓ Cloudflare Tunnel 正在运行
    echo.
    echo    正在运行的隧道进程：
    tasklist /FI "IMAGENAME eq cloudflared.exe" /FO LIST | findstr /I "cloudflared"
)

echo.
echo ====================================
if %ALL_OK%==1 (
    echo ✓ 所有检查通过！部署成功！
    echo ====================================
    echo.
    echo 如果隧道正在运行，您应该能看到访问地址
    echo 请查看 Cloudflare Tunnel 的窗口输出
    echo.
    echo 如果是随机域名模式，地址格式类似：
    echo   https://random-words.trycloudflare.com
    echo.
    echo 如果是自定义域名模式，使用您配置的域名访问
) else (
    echo ⚠️  部分检查未通过，请根据上述提示修复
    echo ====================================
    echo.
    echo 快速修复：
    echo   1. 首次部署：运行 部署CloudflareTunnel.bat
    echo   2. 启动服务：运行 一键启动CloudflareTunnel.bat
    echo   3. 查看文档：CloudflareTunnel完整指南.md
)
echo.
pause

