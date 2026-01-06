@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 低代码平台 - 完整部署测试
echo ====================================
echo.

:: 1. 检查构建
echo [1/5] 检查构建产物...
if exist backend\dist\index.js (
    echo ✓ 后端构建产物存在
) else (
    echo ❌ 后端未构建，正在构建...
    cd backend
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败
        pause
        exit /b 1
    )
    cd ..
    echo ✓ 后端构建完成
)

if exist frontend\dist\index.html (
    echo ✓ 前端构建产物存在
) else (
    echo ❌ 前端未构建，正在构建...
    cd frontend
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败
        pause
        exit /b 1
    )
    cd ..
    echo ✓ 前端构建完成
)

:: 2. 检查数据库
echo.
echo [2/5] 检查数据库...
cd backend
if exist prisma\dev.db (
    echo ✓ 数据库文件存在
) else (
    echo ⚠️  数据库不存在，正在初始化...
    call npx prisma generate
    if errorlevel 1 (
        echo ⚠️  Prisma Client 生成失败
    )
    call npx prisma migrate dev --name init
    if errorlevel 1 (
        echo ⚠️  数据库初始化失败，但将继续启动
    ) else (
        echo ✓ 数据库初始化完成
    )
)
cd ..

:: 3. 检查端口占用
echo.
echo [3/5] 检查端口占用...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ✓ 端口 3001 可用
) else (
    echo ⚠️  端口 3001 已被占用，请先关闭占用该端口的程序
)

netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ✓ 端口 4173 可用
) else (
    echo ⚠️  端口 4173 已被占用，请先关闭占用该端口的程序
)

:: 4. 获取本机 IP
echo.
echo [4/5] 获取本机 IP 地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP: =!
    echo ✓ 本机 IP: !LOCAL_IP!
    goto :ip_found
)
:ip_found

:: 5. 启动服务
echo.
echo [5/5] 启动服务...
echo.
echo 正在启动后端服务...
start "后端服务-生产环境" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 5 /nobreak >nul

echo 正在启动前端预览服务...
start "前端预览-生产环境" cmd /k "cd /d %~dp0frontend && npm run preview -- --host 0.0.0.0"
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo ✓ 部署完成！
echo ====================================
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001
if defined LOCAL_IP (
    echo   前端（网络）: http://!LOCAL_IP!:4173
    echo   后端（网络）: http://!LOCAL_IP!:3001
)
echo.
echo 测试后端健康检查：
echo   curl http://localhost:3001/api/health
echo.
echo 提示：
echo   1. 如果其他设备无法访问，请检查 Windows 防火墙设置
echo   2. 确保防火墙允许端口 3001 和 4173
echo   3. 查看服务窗口的输出以确认服务正常启动
echo.
pause

endlocal

