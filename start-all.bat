@echo off
echo ========================================================
echo Starting Quantum Research Navigator...
echo ========================================================

REM Add portable node to path if needed
set PATH=C:\Users\ASUS\.gemini\antigravity\tools\node-v22.11.0-win-x64;%PATH%

start "Quantum API Backend" cmd /k "cd /d %~dp0backend && python3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "Quantum Web Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo Application starting!
echo Backend API:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Web Frontend: http://localhost:5173
echo ========================================================
