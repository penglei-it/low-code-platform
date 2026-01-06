@echo off
chcp 65001 >nul
echo ====================================
echo 最终部署验证
echo ====================================
echo.

echo [检查 1] 后端服务...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ❌ 后端服务未运行
    echo 正在启动后端服务...
    cd backend
    start "后端服务" cmd /k "title 后端服务 && npm start"
    cd ..
    timeout /t 8 /nobreak >nul
) else (
    echo ✓ 后端服务正在运行
)
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '   ✓ 后端响应正常' } catch { Write-Host '   ⚠️  后端无响应' }" 2>nul

echo.
echo [检查 2] 前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ❌ 前端服务未运行
    echo 正在启动前端服务...
    cd frontend
    start "前端服务" cmd /k "title 前端服务 && npm run preview -- --host 0.0.0.0"
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo ✓ 前端服务正在运行
)

echo.
echo [检查 3] Cloudflare Tunnel...
tasklist | findstr /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo ❌ Cloudflare Tunnel 未运行
    echo 正在启动 Cloudflare Tunnel...
    
    echo 启动前端隧道...
    start "Cloudflare Tunnel - 前端" cmd /k "title Cloudflare Tunnel - 前端 ^& color 0A ^& echo ==================================== ^& echo Cloudflare Tunnel - 前端 ^& echo ==================================== ^& echo. ^& echo 访问地址将在下方显示 ^& echo 格式：https://xxx-xxx-xxx.trycloudflare.com ^& echo. ^& cloudflared tunnel --url http://localhost:4173"
    
    timeout /t 3 /nobreak >nul
    
    echo 启动后端隧道...
    start "Cloudflare Tunnel - 后端" cmd /k "title Cloudflare Tunnel - 后端 ^& color 0B ^& echo ==================================== ^& echo Cloudflare Tunnel - 后端 ^& echo ==================================== ^& echo. ^& echo 访问地址将在下方显示 ^& echo 格式：https://yyy-yyy-yyy.trycloudflare.com ^& echo. ^& cloudflared tunnel --url http://localhost:3001"
    
    timeout /t 5 /nobreak >nul
    echo ✓ Cloudflare Tunnel 已启动
) else (
    echo ✓ Cloudflare Tunnel 正在运行
)

echo.
echo ====================================
echo ✓ 部署验证完成
echo ====================================
echo.
echo [本地访问地址]
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001/api/health
echo.
echo [互联网访问地址]
echo   请查看新打开的 Cloudflare Tunnel 窗口
echo   前端窗口会显示前端访问地址
echo   后端窗口会显示后端 API 访问地址
echo.
echo 地址格式类似：https://xxx-xxx-xxx.trycloudflare.com
echo.
echo 将地址分享给其他人即可访问！
echo.
pause

