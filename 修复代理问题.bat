@echo off
chcp 65001 >nul
echo ====================================
echo 修复代理问题
echo ====================================
echo.

echo 问题：前端无法连接到后端（ECONNREFUSED）
echo.
echo 解决方案：
echo   1. 确保后端服务正在运行
echo   2. 后端必须监听在 http://localhost:3001
echo.

echo [步骤 1] 检查后端服务...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ❌ 后端服务未运行
    echo.
    echo 正在启动后端服务...
    cd backend
    start "后端服务" cmd /k "title 后端服务-端口3001 && npm start"
    cd ..
    echo ✓ 后端服务已启动
    echo 请等待 5 秒钟让服务完全启动...
    timeout /t 5 /nobreak >nul
) else (
    echo ✓ 后端服务正在运行
)

echo.
echo [步骤 2] 测试后端连接...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '✓ 后端响应正常:' $response.Content } catch { Write-Host '❌ 后端连接失败，请检查后端服务是否正常启动' }"

echo.
echo [步骤 3] 检查前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo 前端服务未运行
) else (
    echo ✓ 前端服务正在运行
)

echo.
echo ====================================
echo 修复说明
echo ====================================
echo.
echo 如果后端已启动但仍无法连接，请：
echo.
echo 方法 1：重启前端服务（推荐）
echo   1. 关闭当前前端服务窗口
echo   2. 运行：cd frontend ^&^& npm run preview -- --host 0.0.0.0
echo.
echo 方法 2：使用环境变量直接指向后端
echo   1. 创建 frontend/.env.production 文件
echo   2. 添加：VITE_API_BASE_URL=http://localhost:3001/api
echo   3. 重新构建：npm run build
echo   4. 重启预览服务
echo.
echo 方法 3：使用代理服务器（如果需要）
echo   1. 运行：npm run preview:proxy
echo.
pause

