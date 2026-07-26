@echo off
title ComfyUI Launcher
echo ============================================
echo  ComfyUI Launcher for CharityWork
echo ============================================
echo.

set COMFYUI_URL=http://127.0.0.1:8188
set COMFYUI_DIR=C:\AI\ComfyUI
set PYTHON=%COMFYUI_DIR%\.venv\Scripts\python.exe

echo Checking if ComfyUI is already running...
curl -s %COMFYUI_URL%/system_stats >nul 2>&1
if %errorlevel% equ 0 (
    echo ComfyUI is already running at %COMFYUI_URL%
    goto :ready
)

echo ComfyUI is not running. Starting it now...
if not exist "%PYTHON%" (
    echo ERROR: Python venv not found at %PYTHON%
    echo Please run the setup first.
    pause
    exit /b 1
)

start "ComfyUI Server" cmd /k "title ComfyUI Server && cd /d %COMFYUI_DIR% && %PYTHON% main.py --cpu --listen 127.0.0.1 --port 8188"

echo Waiting for ComfyUI to start (up to 90 seconds)...
set ATTEMPTS=0
:wait_loop
timeout /t 3 /nobreak >nul
set /a ATTEMPTS+=1
if %ATTEMPTS% geq 30 (
    echo ERROR: ComfyUI did not start within 90 seconds.
    echo Check the ComfyUI console window for errors.
    pause
    exit /b 1
)
curl -s %COMFYUI_URL%/system_stats >nul 2>&1
if %errorlevel% neq 0 (
    echo   Attempt %ATTEMPTS%/30 - not ready yet...
    goto :wait_loop
)

echo ComfyUI is ready at %COMFYUI_URL%

:ready
echo.
echo You can now run generate.bat or dry_run.bat
echo.
pause
