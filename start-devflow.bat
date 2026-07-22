@echo off
title DevFlow Platform -- Single-Click Live Launcher
cd /d "%~dp0"
echo ===========================================================
echo    DevFlow Platform  --  Single-Click Live Launcher        
echo ===========================================================
echo.
echo Launching all microservices and frontend application...
powershell -ExecutionPolicy Bypass -File .\start-dev-headless.ps1
echo.
echo Waiting 5 seconds for initialization...
timeout /t 5 >nul
echo Opening DevFlow Live App in browser...
start http://localhost:4000
echo.
echo DevFlow is running at http://localhost:4000
