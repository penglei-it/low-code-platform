@echo off
chcp 65001 >nul
echo ====================================
echo 检查后端服务状态
echo ====================================
echo.

echo 检查端口 3001 是否被占用...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ❌ 端口 3001 未被占用 - 后端服务未运行
    echo.
    echo 正在启动后端服务...
    cd backend
    start "后端服务" cmd /k "npm start"
    timeout /t 5 /nobreak >nul
    cd ..
    echo ✓ 后端服务已启动
    echo 请等待几秒钟让服务完全启动...
) else (
    echo ✓ 端口 3001 已被占用 - 后端服务可能正在运行
    echo.
    echo 测试后端连接...
    curl -s http://localhost:3001/api/health >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  端口被占用但无法连接，可能是其他程序占用
    ) else (
        echo ✓ 后端服务正常响应
    )
)

echo.
echo 提示：如果后端服务未启动，请运行：
echo   cd backend
echo   npm start
echo.
pause

