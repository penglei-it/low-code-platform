@echo off
chcp 65001 >nul
echo ====================================
echo 部署成功检查
echo ====================================
echo.

:: 1. 检查后端构建
echo [1/4] 检查后端构建...
if exist backend\dist\index.js (
    echo ✓ 后端构建产物存在
) else (
    echo ❌ 后端未构建，请先运行：cd backend ^&^& npm run build
    pause
    exit /b 1
)

:: 2. 检查前端构建
echo.
echo [2/4] 检查前端构建...
if exist frontend\dist\index.html (
    echo ✓ 前端构建产物存在
) else (
    echo ❌ 前端未构建，请先运行：cd frontend ^&^& npm run build
    pause
    exit /b 1
)

:: 3. 检查后端服务
echo.
echo [3/4] 检查后端服务...
netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ❌ 后端服务未运行
    echo.
    echo 正在启动后端服务...
    cd backend
    start "后端服务" cmd /k "title 后端服务-端口3001 && npm start"
    cd ..
    echo 等待后端服务启动（8秒）...
    timeout /t 8 /nobreak >nul
    echo ✓ 后端服务已启动
) else (
    echo ✓ 后端服务正在运行
)

:: 4. 检查前端服务
echo.
echo [4/4] 检查前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ❌ 前端服务未运行
    echo.
    echo 正在启动前端服务...
    cd frontend
    start "前端服务" cmd /k "title 前端服务-端口4173 && npm run preview -- --host 0.0.0.0"
    cd ..
    echo ✓ 前端服务已启动
) else (
    echo ✓ 前端服务正在运行
)

echo.
echo ====================================
echo ✓ 所有检查完成
echo ====================================
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001/api/health
echo.
echo 获取本机 IP：
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP: =!
    echo   前端（网络）: http://!LOCAL_IP!:4173
    echo   后端（网络）: http://!LOCAL_IP!:3001/api/health
    goto :ip_done
)
:ip_done

echo.
echo 如果前端仍无法连接后端：
echo   1. 等待后端服务完全启动（可能需要10-15秒）
echo   2. 检查后端服务窗口，确认看到"数据库连接成功"
echo   3. 访问 http://localhost:3001/api/health 测试后端
echo   4. 如果仍然失败，刷新浏览器页面
echo.
pause

