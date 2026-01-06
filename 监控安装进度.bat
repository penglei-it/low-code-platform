@echo off
chcp 65001 >nul
echo ====================================
echo 依赖安装进度监控
echo ====================================
echo.

:check
cls
echo [%time%] 检查依赖安装状态...
echo.

echo [前端依赖]
cd frontend
if exist node_modules\vite (
    echo ✓ 前端依赖已安装完成！
    cd ..
    goto check_backend
) else (
    if exist node_modules (
        echo ⏳ 前端依赖安装中...
        for /f %%i in ('dir node_modules /b /ad 2^>nul ^| find /c /v ""') do echo   已安装: %%i 个包
    ) else (
        echo ✗ 前端依赖未开始安装
    )
)
cd ..

echo.
echo [后端依赖]
cd backend
if exist node_modules\express (
    echo ✓ 后端依赖已安装完成！
    cd ..
    goto check_complete
) else (
    if exist node_modules (
        echo ⏳ 后端依赖安装中...
        for /f %%i in ('dir node_modules /b /ad 2^>nul ^| find /c /v ""') do echo   已安装: %%i 个包
    ) else (
        echo ✗ 后端依赖未开始安装
    )
)
cd ..

echo.
echo 等待 10 秒后重新检查...
timeout /t 10 /nobreak >nul
goto check

:check_backend
echo.
echo [后端依赖]
cd backend
if exist node_modules\express (
    echo ✓ 后端依赖已安装完成！
    cd ..
    goto check_complete
) else (
    if exist node_modules (
        echo ⏳ 后端依赖安装中...
    ) else (
        echo ✗ 后端依赖未开始安装
    )
)
cd ..
echo.
echo 等待 10 秒后重新检查...
timeout /t 10 /nobreak >nul
goto check_backend

:check_complete
echo.
echo ====================================
echo ✓ 所有依赖已安装完成！
echo ====================================
echo.
echo 现在可以启动服务了：
echo 1. 运行: 启动项目.bat
echo 2. 或手动执行: npm run dev
echo.
pause

