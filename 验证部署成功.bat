@echo off
chcp 65001 >nul
echo ====================================
echo 验证部署成功
echo ====================================
echo.

echo [1/3] 检查后端服务...
timeout /t 2 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing; Write-Host '✓ 后端服务正常运行！'; Write-Host '   响应:' $r.Content } catch { Write-Host '❌ 后端服务未运行或未响应'; Write-Host '   错误:' $_.Exception.Message }"

echo.
echo [2/3] 检查前端服务...
netstat -ano | findstr ":4173" >nul
if errorlevel 1 (
    echo ❌ 前端服务未运行
) else (
    echo ✓ 前端服务正在运行
)

echo.
echo [3/3] 获取访问地址...
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001
echo   健康检查: http://localhost:3001/api/health
echo.
echo 本机 IP 地址：
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP: =!
    echo   前端（网络）: http://!LOCAL_IP!:4173
    echo   后端（网络）: http://!LOCAL_IP!:3001/api/health
    goto :ip_done
)
:ip_done

echo.
echo ====================================
echo 部署验证完成
echo ====================================
echo.
echo 如果后端服务未运行，请执行：
echo   cd backend
echo   npm start
echo.
echo 如果前端服务未运行，请执行：
echo   cd frontend
echo   npm run preview -- --host 0.0.0.0
echo.
pause

