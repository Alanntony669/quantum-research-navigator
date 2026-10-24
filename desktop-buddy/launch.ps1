# Clicky Windows Launcher
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$PythonExe = Join-Path $ScriptDir ".venv\Scripts\python.exe"

if (-Not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Virtual environment not found at $PythonExe" -ForegroundColor Red
    pause
    exit
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Clicky - Windows Desktop AI Buddy" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Shortcut: Alt + C" -ForegroundColor Yellow
Write-Host "Left-Click Buddy: Circle Equation" -ForegroundColor Green
Write-Host "Right-Click Buddy: Open Settings (Gemini / OpenAI Key)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

& $PythonExe "main.py"
