@echo off
chcp 65001 >nul
echo ====================================
echo 检查依赖安装状态
echo ====================================
echo.

echo [前端依赖检查]
cd frontend
if exist node_modules\vite (
    echo ✓ 前端依赖已安装
    dir node_modules /b | find /c /v "" >nul 2>&1
    echo   已安装包数量: 
    for /f %%i in ('dir node_modules /b /ad ^| find /c /v ""') do echo   %%i 个包
) else (
    echo ✗ 前端依赖未安装
    echo   正在检查安装进度...
    if exist node_modules (
        echo   发现 node_modules 目录，可能正在安装中
    ) else (
        echo   未发现 node_modules 目录
    )
)
cd ..

echo.
echo [后端依赖检查]
cd backend
if exist node_modules\express (
    echo ✓ 后端依赖已安装
    dir node_modules /b | find /c /v "" >nul 2>&1
    echo   已安装包数量:
    for /f %%i in ('dir node_modules /b /ad ^| find /c /v ""') do echo   %%i 个包
) else (
    echo ✗ 后端依赖未安装
    echo   正在检查安装进度...
    if exist node_modules (
        echo   发现 node_modules 目录，可能正在安装中
    ) else (
        echo   未发现 node_modules 目录
    )
)
cd ..

echo.
echo ====================================
echo 检查完成
echo ====================================
echo.
echo 如果依赖未安装，请运行: 启动项目.bat
echo 或手动执行: npm install
echo.
pause

