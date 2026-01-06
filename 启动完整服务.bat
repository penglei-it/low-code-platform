@echo off
chcp 65001 >nul
echo ====================================
echo 启动完整服务（后端 + 前端）
echo ====================================
echo.

:: 检查后端是否已运行
echo [1/3] 检查后端服务...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo 后端服务未运行，正在启动...
    cd backend
    start "后端服务" cmd /k "title 后端服务 && npm start"
    cd ..
    echo ✓ 后端服务启动中...
    timeout /t 5 /nobreak >nul
) else (
    echo ✓ 后端服务已在运行
)

:: 检查前端是否已运行
echo.
echo [2/3] 检查前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo 前端服务未运行，正在启动...
    cd frontend
    start "前端服务" cmd /k "title 前端服务 && npm run preview -- --host 0.0.0.0"
    cd ..
    echo ✓ 前端服务启动中...
) else (
    echo ✓ 前端服务已在运行
)

echo.
echo [3/3] 等待服务完全启动...
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo ✓ 服务启动完成
echo ====================================
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001
echo   健康检查: http://localhost:3001/api/health
echo.
echo 获取本机 IP 地址：
ipconfig | findstr "IPv4"
echo.
echo 提示：
echo   1. 请在新打开的窗口中查看服务启动状态
echo   2. 如果看到错误，请检查端口是否被占用
echo   3. 确保数据库已初始化
echo.
pause

