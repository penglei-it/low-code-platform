@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo Cloudflare Tunnel 部署助手
echo ====================================
echo.

:: 检查 cloudflared 是否已安装
echo [步骤 1/5] 检查 cloudflared 是否已安装...
cloudflared version >nul 2>&1
if errorlevel 1 (
    echo ❌ cloudflared 未安装
    echo.
    echo 正在安装 cloudflared...
    echo.
    echo 方法 1：使用 Scoop（推荐）
    echo   scoop install cloudflared
    echo.
    echo 方法 2：使用 Chocolatey
    echo   choco install cloudflared
    echo.
    echo 方法 3：手动下载
    echo   1. 访问: https://github.com/cloudflare/cloudflared/releases
    echo   2. 下载: cloudflared-windows-amd64.exe
    echo   3. 重命名为 cloudflared.exe
    echo   4. 放到 PATH 目录或项目目录
    echo.
    echo 请先安装 cloudflared，然后重新运行此脚本
    pause
    exit /b 1
) else (
    echo ✓ cloudflared 已安装
    cloudflared version
)

echo.
echo [步骤 2/5] 登录 Cloudflare...
echo.
echo ⚠️  重要提示：
echo   1. 如果还没有 Cloudflare 账号，请先注册：https://dash.cloudflare.com/sign-up
echo   2. 登录后将自动打开浏览器
echo   3. 选择要使用的域名（如果没有域名，可以选择随机域名方案）
echo.
pause

cloudflared tunnel login
if errorlevel 1 (
    echo ❌ 登录失败，请检查网络连接或重试
    pause
    exit /b 1
)

echo.
echo [步骤 3/5] 创建隧道...
echo.
set TUNNEL_NAME=low-code-platform
echo 隧道名称：%TUNNEL_NAME%
echo.

cloudflared tunnel create %TUNNEL_NAME%
if errorlevel 1 (
    echo ⚠️  隧道可能已存在，继续下一步...
)

echo.
echo [步骤 4/5] 获取隧道 ID...
echo.
for /f "tokens=*" %%i in ('cloudflared tunnel list ^| findstr /i "%TUNNEL_NAME%"') do (
    set TUNNEL_LINE=%%i
    echo 找到隧道: %%i
)

echo.
echo [步骤 5/5] 选择部署模式...
echo.
echo 请选择部署模式：
echo   1. 快速模式（使用随机域名，无需配置 DNS）
echo   2. 标准模式（使用自己的域名，需要配置 DNS）
echo.
set /p MODE="请输入选项 (1 或 2): "

if "%MODE%"=="1" (
    echo.
    echo ====================================
    echo 快速模式：随机域名
    echo ====================================
    echo.
    echo 正在启动前端隧道（端口 4173）...
    start "Cloudflare Tunnel - 前端" cmd /k "title Cloudflare Tunnel - 前端 ^& cloudflared tunnel --url http://localhost:4173"
    
    timeout /t 2 /nobreak >nul
    
    echo 正在启动后端隧道（端口 3001）...
    start "Cloudflare Tunnel - 后端" cmd /k "title Cloudflare Tunnel - 后端 ^& cloudflared tunnel --url http://localhost:3001"
    
    echo.
    echo ✓ 隧道已启动！
    echo.
    echo 请查看新打开的窗口，您会看到类似以下的地址：
    echo   https://random-words-1234.trycloudflare.com
    echo.
    echo 将这些地址分享给其他人即可访问！
    echo.
    echo ⚠️  注意：
    echo   - 每次重启，域名会变化
    echo   - 适合临时演示和测试
    echo   - 如需固定域名，请选择标准模式
    goto :end
)

if "%MODE%"=="2" (
    echo.
    echo ====================================
    echo 标准模式：自定义域名
    echo ====================================
    echo.
    echo ⚠️  需要先配置：
    echo   1. 在 Cloudflare Dashboard 中添加您的域名
    echo   2. 修改 DNS 名称服务器为 Cloudflare 提供的服务器
    echo   3. 等待 DNS 生效
    echo.
    set /p DOMAIN="请输入您的域名（如：example.com）: "
    set /p API_SUBDOMAIN="请输入 API 子域名（如：api，将创建 api.%DOMAIN%）: "
    
    echo.
    echo 正在创建配置文件...
    
    set CONFIG_FILE=%USERPROFILE%\.cloudflared\config.yml
    set CONFIG_DIR=%USERPROFILE%\.cloudflared
    
    if not exist "!CONFIG_DIR!" mkdir "!CONFIG_DIR!"
    
    echo 请手动创建配置文件: !CONFIG_FILE!
    echo.
    echo 配置内容：
    echo ====================================
    echo tunnel: %TUNNEL_NAME%
    echo credentials-file: %%USERPROFILE%%\.cloudflared\^<tunnel-id^>.json
    echo.
    echo ingress:
    echo   # 前端 - 主域名
    echo   - hostname: %DOMAIN%
    echo     service: http://localhost:4173
    echo.
    echo   # 后端 API - 子域名
    echo   - hostname: %API_SUBDOMAIN%.%DOMAIN%
    echo     service: http://localhost:3001
    echo.
    echo   # 默认规则（必须放在最后）
    echo   - service: http_status:404
    echo ====================================
    echo.
    echo 配置完成后，运行：
    echo   cloudflared tunnel run %TUNNEL_NAME%
    echo.
    echo 详细说明请查看：使用CloudflareTunnel部署.md
    goto :end
)

echo.
echo 无效的选项，请重新运行脚本
:end
echo.
pause

