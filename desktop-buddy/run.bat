@echo off
title Clicky - Desktop AI Buddy (Windows)
echo ========================================================
echo        Starting Clicky - Desktop AI Buddy (Windows)
echo ========================================================
echo.
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please run:
    echo uv venv --python 3.12
    pause
    exit /b
)

echo Starting background desktop buddy...
echo Shortut: Alt + C (Circle or drag over any equation)
echo Right-Click Buddy: Open Settings (Gemini / OpenAI API Key)
echo.
start "" ".venv\Scripts\pythonw.exe" "main.py"
exit
