@echo off
chcp 65001 >nul
echo ====================================
echo 使用 ngrok 快速实现互联网访问
echo ====================================
echo.

echo [步骤 1] 检查 ngrok 是否已安装...
ngrok version >nul 2>&1
if errorlevel 1 (
    echo ngrok 未安装
    echo.
    echo 正在安装 ngrok...
    npm install -g ngrok
    if errorlevel 1 (
        echo ❌ ngrok 安装失败
        echo.
        echo 请手动安装：
        echo   1. 访问 https://ngrok.com/download
        echo   2. 下载 Windows 版本
        echo   3. 解压到 PATH 目录
        pause
        exit /b 1
    )
    echo ✓ ngrok 安装成功
) else (
    echo ✓ ngrok 已安装
)

echo.
echo [步骤 2] 检查服务是否运行...
echo.
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ⚠️  前端服务未运行
    echo 正在启动前端服务...
    cd frontend
    start "前端服务" cmd /k "npm run preview -- --host 0.0.0.0"
    timeout /t 3 /nobreak >nul
    cd ..
) else (
    echo ✓ 前端服务正在运行
)

netstat -ano | findstr ":3001" >nul
if errorlevel 1 (
    echo ⚠️  后端服务未运行
    echo 正在启动后端服务...
    cd backend
    start "后端服务" cmd /k "npm start"
    timeout /t 3 /nobreak >nul
    cd ..
) else (
    echo ✓ 后端服务正在运行
)

echo.
echo [步骤 3] 启动 ngrok 隧道...
echo.
echo ⚠️  重要提示：
echo   1. 如果首次使用，需要注册 ngrok 账号
echo   2. 访问 https://dashboard.ngrok.com/get-started/your-authtoken
echo   3. 获取 authtoken 后运行：ngrok config add-authtoken <你的token>
echo.
echo 正在启动前端 ngrok 隧道（端口 4173）...
start "ngrok-前端" cmd /k "ngrok http 4173"

timeout /t 2 /nobreak >nul

echo 正在启动后端 ngrok 隧道（端口 3001）...
start "ngrok-后端" cmd /k "ngrok http 3001"

echo.
echo ====================================
echo ✓ ngrok 隧道已启动
echo ====================================
echo.
echo 请查看新打开的 ngrok 窗口：
echo   1. 前端：会显示类似 https://abc123.ngrok.io
echo   2. 后端：会显示类似 https://xyz456.ngrok.io
echo.
echo 将这两个地址分享给其他人即可访问！
echo.
echo 提示：
echo   - 免费版域名每次启动都会变化
echo   - 如需固定域名，需要付费版本
echo   - 前端地址用于访问应用
echo   - 后端地址用于 API（需要配置前端环境变量）
echo.
pause

