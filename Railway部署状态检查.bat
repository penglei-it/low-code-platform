@echo off
chcp 65001 >nul
title Railway 部署状态检查

echo ====================================
echo Railway 部署状态检查
echo ====================================
echo.

echo 根据您的 Railway 界面显示：
echo.
echo ✅ 服务已创建
echo    - @low-code-platform/frontend
echo    - @low-code-platform/backend
echo.
echo ❌ 服务状态：Service is offline
echo.
echo ====================================
echo 解决方案
echo ====================================
echo.
echo 步骤 1：查看日志找出问题
echo   1. 在 Railway 界面点击 "Logs" 标签
echo   2. 分别查看两个服务的日志
echo   3. 查找错误信息
echo.
echo 步骤 2：获取访问地址
echo   1. 点击服务（frontend 或 backend）
echo   2. 进入 "Settings" 标签
echo   3. 在 "Networking" 或 "Domains" 部分
echo   4. 查看 "Public Domain" 或点击 "Generate Domain"
echo.
echo 步骤 3：检查服务配置
echo.
echo Frontend 服务配置：
echo   - Root Directory: frontend
echo   - Build Command: npm install ^&^& npm run build
echo   - Start Command: npx serve -s dist -p $PORT
echo   - Environment Variables:
echo     VITE_API_BASE_URL = [后端服务的公共域名]
echo.
echo Backend 服务配置：
echo   - Root Directory: backend
echo   - Build Command: npm install ^&^& npm run build
echo   - Start Command: npm start
echo   - Environment Variables:
echo     PORT = $PORT (Railway 自动设置)
echo     NODE_ENV = production
echo.
echo 步骤 4：重启服务
echo   1. 点击服务
echo   2. 进入 "Settings" 标签
echo   3. 点击 "Redeploy" 或 "Restart"
echo.
echo ====================================
echo 常见问题排查
echo ====================================
echo.
echo 问题 1：构建失败
echo   解决：检查 package.json 构建脚本
echo         查看日志中的具体错误信息
echo.
echo 问题 2：服务启动失败
echo   解决：确保使用 process.env.PORT
echo         检查环境变量配置
echo.
echo 问题 3：404 错误
echo   解决：检查 VITE_API_BASE_URL 配置
echo         确认静态文件服务正确
echo.
echo ====================================
echo 访问地址
echo ====================================
echo.
echo Railway 生成的地址格式：
echo   https://[服务名]-[随机字符].railway.app
echo.
echo 请在 Railway 服务 Settings 中查看具体地址
echo.
echo 详细说明请查看：
echo   检查Railway部署状态并获取访问地址.md
echo.
pause

