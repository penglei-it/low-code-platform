@echo off
chcp 65001 >nul
echo ====================================
echo 快速启动服务
echo ====================================
echo.

:: 检查并启动后端
echo [1/2] 启动后端服务...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo 后端服务未运行，正在启动...
    cd backend
    start "后端服务" cmd /k "title 后端服务 && npm start"
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo ✓ 后端服务已在运行
)

:: 检查并启动前端
echo.
echo [2/2] 启动前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo 前端服务未运行，正在启动...
    cd frontend
    start "前端服务" cmd /k "title 前端服务 && npm run preview -- --host 0.0.0.0"
    cd ..
) else (
    echo ✓ 前端服务已在运行
)

echo.
echo ====================================
echo ✓ 服务启动完成
echo ====================================
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001/api/health
echo.
echo 获取本机 IP：
ipconfig | findstr "IPv4"
echo.
pause

