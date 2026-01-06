@echo off
chcp 65001 >nul
echo ====================================
echo 立即修复代理问题
echo ====================================
echo.

echo 问题：前端无法连接到后端（ECONNREFUSED）
echo 原因：后端服务未运行
echo.

echo [修复步骤]
echo.
echo 1. 启动后端服务...
cd backend
if not exist dist\index.js (
    echo 后端未构建，正在构建...
    call npm run build
)
start "后端服务" cmd /k "title 后端服务-端口3001 && npm start"
cd ..
echo ✓ 后端服务已启动

echo.
echo 2. 等待后端服务启动（8秒）...
timeout /t 8 /nobreak >nul

echo.
echo 3. 测试后端连接...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing; Write-Host '✓ 后端服务运行正常！' } catch { Write-Host '⚠️  后端服务可能还在启动中...' }"

echo.
echo 4. 检查前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo 前端服务未运行，正在启动...
    cd frontend
    start "前端服务" cmd /k "title 前端服务-端口4173 && npm run preview -- --host 0.0.0.0"
    cd ..
    echo ✓ 前端服务已启动
) else (
    echo ✓ 前端服务已在运行
    echo 提示：如果仍有错误，请关闭前端服务窗口后重新运行：
    echo   cd frontend
    echo   npm run preview -- --host 0.0.0.0
)

echo.
echo ====================================
echo ✓ 修复完成
echo ====================================
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端健康检查: http://localhost:3001/api/health
echo.
echo 如果仍有问题，请：
echo   1. 查看后端服务窗口，确认服务已启动
echo   2. 查看前端服务窗口的错误信息
echo   3. 运行：修复代理问题.bat 获取更多帮助
echo.
pause

