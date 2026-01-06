@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 自动部署到互联网并修复问题
echo ====================================
echo.

set ERRORS=0

:: 1. 检查并构建后端
echo [1/7] 检查后端构建...
cd backend
if not exist dist\index.js (
    echo ⚠️  后端未构建，正在构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败
        set /a ERRORS+=1
        goto :error_check
    )
    echo ✓ 后端构建完成
) else (
    echo ✓ 后端已构建
)
cd ..

:: 2. 检查并构建前端
echo.
echo [2/7] 检查前端构建...
cd frontend
if not exist dist\index.html (
    echo ⚠️  前端未构建，正在构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败
        set /a ERRORS+=1
        goto :error_check
    )
    echo ✓ 前端构建完成
) else (
    echo ✓ 前端已构建
)
cd ..

:: 3. 检查后端服务
echo.
echo [3/7] 检查后端服务...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ⚠️  后端服务未运行，正在启动...
    cd backend
    start "后端服务" cmd /k "title 后端服务-端口3001 && npm start"
    cd ..
    echo 等待后端服务启动...
    timeout /t 8 /nobreak >nul
    
    :: 测试后端连接
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing; Write-Host '✓ 后端服务启动成功' } catch { Write-Host '⚠️  后端服务可能还在启动中，继续...' }" 2>nul
) else (
    echo ✓ 后端服务正在运行
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '   ✓ 后端响应正常' } catch { Write-Host '   ⚠️  后端无响应，尝试重启...' }" 2>nul
)

:: 4. 检查前端服务
echo.
echo [4/7] 检查前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ⚠️  前端服务未运行，正在启动...
    cd frontend
    start "前端服务" cmd /k "title 前端服务-端口4173 && npm run preview -- --host 0.0.0.0"
    cd ..
    echo 等待前端服务启动...
    timeout /t 5 /nobreak >nul
    echo ✓ 前端服务已启动
) else (
    echo ✓ 前端服务正在运行
)

:: 5. 检查 cloudflared
echo.
echo [5/7] 检查 cloudflared...
cloudflared version >nul 2>&1
if errorlevel 1 (
    echo ❌ cloudflared 未安装
    echo.
    echo 正在尝试安装 cloudflared...
    echo 请选择安装方式：
    echo   1. 使用 Scoop（如果已安装）
    echo   2. 使用 Chocolatey（如果已安装）
    echo   3. 手动下载
    echo.
    set /p INSTALL_METHOD="请选择 (1/2/3，或按回车跳过): "
    
    if "!INSTALL_METHOD!"=="1" (
        scoop install cloudflared
    ) else if "!INSTALL_METHOD!"=="2" (
        choco install cloudflared
    ) else (
        echo.
        echo 请手动安装 cloudflared：
        echo   1. 访问: https://github.com/cloudflare/cloudflared/releases
        echo   2. 下载: cloudflared-windows-amd64.exe
        echo   3. 重命名为 cloudflared.exe
        echo   4. 放到 PATH 目录
        echo.
        set /a ERRORS+=1
        goto :error_check
    )
    
    cloudflared version >nul 2>&1
    if errorlevel 1 (
        echo ❌ cloudflared 安装失败，请手动安装
        set /a ERRORS+=1
        goto :error_check
    )
)
echo ✓ cloudflared 已安装
cloudflared version | findstr /i "cloudflared"

:: 6. 检查登录状态
echo.
echo [6/7] 检查 Cloudflare 登录状态...
if exist "%USERPROFILE%\.cloudflared\cert.pem" (
    echo ✓ 已登录 Cloudflare
) else (
    echo ⚠️  未登录 Cloudflare，正在启动登录...
    echo 请在弹出的浏览器中完成登录
    cloudflared tunnel login
    if errorlevel 1 (
        echo ❌ 登录失败，请稍后手动运行: cloudflared tunnel login
        set /a ERRORS+=1
        goto :error_check
    )
)

:: 7. 启动 Cloudflare Tunnel（快速模式）
echo.
echo [7/7] 启动 Cloudflare Tunnel...
echo.

:: 检查是否已有 tunnel 在运行
tasklist | findstr /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo 启动前端隧道（端口 4173）...
    start "Cloudflare Tunnel - 前端" cmd /k "title Cloudflare Tunnel - 前端 ^& color 0A ^& echo ==================================== ^& echo Cloudflare Tunnel - 前端 ^& echo ==================================== ^& echo. ^& echo 访问地址将在下方显示 ^& echo. ^& cloudflared tunnel --url http://localhost:4173"
    
    timeout /t 3 /nobreak >nul
    
    echo 启动后端隧道（端口 3001）...
    start "Cloudflare Tunnel - 后端" cmd /k "title Cloudflare Tunnel - 后端 ^& color 0B ^& echo ==================================== ^& echo Cloudflare Tunnel - 后端 ^& echo ==================================== ^& echo. ^& echo 访问地址将在下方显示 ^& echo. ^& cloudflared tunnel --url http://localhost:3001"
    
    timeout /t 5 /nobreak >nul
    echo ✓ Cloudflare Tunnel 已启动
) else (
    echo ✓ Cloudflare Tunnel 已在运行
)

:error_check
echo.
echo ====================================
if %ERRORS%==0 (
    echo ✓ 部署完成！
    echo ====================================
    echo.
    echo [访问地址]
    echo.
    echo 本地访问：
    echo   前端: http://localhost:4173
    echo   后端: http://localhost:3001/api/health
    echo.
    echo 互联网访问：
    echo   请查看新打开的 Cloudflare Tunnel 窗口
    echo   会显示类似以下格式的地址：
    echo     https://xxx-xxx-xxx.trycloudflare.com
    echo.
    echo   前端隧道窗口 = 前端访问地址
    echo   后端隧道窗口 = 后端 API 访问地址
    echo.
    echo 将地址分享给其他人即可访问！
    echo.
    
    :: 尝试打开本地前端
    timeout /t 2 /nobreak >nul
    start http://localhost:4173
    
    echo 已自动打开浏览器访问本地前端
    echo.
) else (
    echo ⚠️  发现 %ERRORS% 个问题，请根据上方提示修复
    echo ====================================
    echo.
    echo 常见问题解决：
    echo   1. cloudflared 未安装 - 请手动安装
    echo   2. 服务启动失败 - 检查端口是否被占用
    echo   3. 构建失败 - 检查依赖是否安装完整
    echo.
)

echo 提示：请保持所有窗口运行，关闭窗口会导致服务停止
echo.
pause

endlocal

