@echo off
chcp 65001 >nul
echo ====================================
echo Railway 一键部署助手
echo ====================================
echo.

echo 此脚本将帮助您完成 Railway 部署的所有准备工作
echo.
pause

call Railway自动化部署.bat

echo.
echo ====================================
echo 部署检查清单
echo ====================================
echo.
echo 请确认以下事项：
echo.
echo [ ] 代码已推送到 GitHub
echo [ ] 已在 Railway.app 注册账号
echo [ ] 已创建项目并连接 GitHub 仓库
echo [ ] 后端服务已部署（Root Directory: backend）
echo [ ] 已获取后端地址
echo [ ] 前端服务已部署（Root Directory: frontend）
echo [ ] 已配置前端环境变量 VITE_API_BASE_URL
echo [ ] 已获得访问地址
echo.
echo 如果遇到问题，请查看：
echo   - Railway部署完整指南.md
echo   - Railway快速开始.md
echo.
pause

