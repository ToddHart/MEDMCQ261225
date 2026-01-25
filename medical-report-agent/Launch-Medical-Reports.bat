@echo off
REM Medical Report Agent - Windows Launcher
REM Double-click this to run the Medical Report Agent

echo ========================================
echo Medical Report Agent Launcher
echo ========================================
echo.

REM Check if WSL is installed
wsl --list >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: WSL is not installed or not running
    echo Please install WSL first: wsl --install
    pause
    exit /b 1
)

echo Starting Medical Report Agent...
echo.

REM Run the setup and launcher in WSL
wsl bash -c "cd ~ && ([ -d MEDMCQ261225 ] || bash <(curl -s https://raw.githubusercontent.com/ToddHart/MEDMCQ261225/claude/secure-medical-agents-TkKPt/medical-report-agent/setup_windows_wsl.sh)) && cd MEDMCQ261225/medical-report-agent && ./launch_medical_reports.sh"

echo.
echo Medical Report Agent closed.
pause
