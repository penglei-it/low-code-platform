@echo off
chcp 65001 >nul
echo ====================================
echo 快速实现互联网访问
echo ====================================
echo.

echo 当前部署状态：
echo   ✓ 本地和局域网用户可以访问
echo   ✗ 互联网用户无法访问
echo.

echo 要实现互联网访问，有以下方案：
echo.
echo [方案 1] ngrok（最简单，5分钟）
echo   运行：使用ngrok快速部署.bat
echo   优点：快速、简单
echo   缺点：免费版域名每次变化
echo.
echo [方案 2] Cloudflare Tunnel（推荐，免费且稳定）
echo   查看：使用CloudflareTunnel部署.md
echo   优点：免费、域名稳定、自动 HTTPS
echo   缺点：需要注册 Cloudflare 账号
echo.
echo [方案 3] 云服务器部署（生产环境）
echo   查看：云服务器部署指南.md
echo   优点：最稳定、性能最好
echo   缺点：需要付费购买服务器
echo.

echo 详细说明请查看：互联网访问部署方案.md
echo.
pause

