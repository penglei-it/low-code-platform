@echo off
chcp 65001 >nul
echo ====================================
echo 现在就访问！
echo ====================================
echo.

echo [方式 1] 本地访问（现在就可以用）
echo.
echo 在浏览器中打开：
echo   前端：http://localhost:4173
echo   后端：http://localhost:3001/api/health
echo.
echo 按回车键自动打开前端页面...
pause >nul
start http://localhost:4173

echo.
echo ====================================
echo [方式 2] 互联网访问（需要 Cloudflare Tunnel）
echo ====================================
echo.
echo 如果想通过互联网访问，需要启动 Cloudflare Tunnel
echo.
echo 选项 A：快速模式（随机域名，无需配置）
echo   运行：一键启动CloudflareTunnel.bat
echo   选择：1
echo.
echo 选项 B：使用域名 hajimi.com
echo   1. 在授权页面点击 hajimi.com 继续
echo   2. 完成授权后配置 DNS
echo   3. 查看文档：如何访问应用.md
echo.
echo ====================================
echo.
pause

