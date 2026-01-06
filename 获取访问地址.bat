@echo off
chcp 65001 >nul
echo ====================================
echo 获取访问地址
echo ====================================
echo.

echo [本地访问地址]
echo.
echo 前端应用：
echo   http://localhost:4173
echo.
echo 后端 API：
echo   http://localhost:3001
echo   健康检查：http://localhost:3001/api/health
echo.

echo [互联网访问地址]
echo.
echo ⚠️  重要：请查看 Cloudflare Tunnel 窗口获取实际地址
echo.
echo 应该会看到类似以下格式的地址：
echo   +----------------------------------------------------------------------------+
echo   ^|  Your quick Tunnel has been created! Visit it at:                         ^|
echo   ^|  https://xxx-xxx-xxx.trycloudflare.com                                    ^|
echo   +----------------------------------------------------------------------------+
echo.
echo 前端隧道窗口会显示前端访问地址
echo 后端隧道窗口会显示后端 API 访问地址
echo.
echo 将这些地址分享给其他人即可访问！
echo.
echo ====================================
echo 测试访问
echo ====================================
echo.
echo 正在测试本地访问...
echo.

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 2 -UseBasicParsing; Write-Host '✓ 后端服务正常：' $r.Content } catch { Write-Host '❌ 后端服务无响应' }"

echo.
echo 提示：如果 Cloudflare Tunnel 窗口没有显示地址，请等待几秒钟
echo 地址生成需要一些时间
echo.
pause

