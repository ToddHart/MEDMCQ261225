# Medical Report Agent - Desktop Icon Installer
# Run this once to create a working desktop shortcut

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Medical Report Agent" -ForegroundColor Green
Write-Host "Desktop Icon Installer" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if API key already exists in WSL
Write-Host "Checking for existing API key..." -ForegroundColor Yellow
$ExistingKey = wsl bash -c "cd ~/MEDMCQ261225/medical-report-agent 2>/dev/null && [ -f set_api_key.local.sh ] && grep 'ANTHROPIC_API_KEY=' set_api_key.local.sh | sed 's/.*ANTHROPIC_API_KEY=\"\(.*\)\"/\1/'" 2>$null

if ([string]::IsNullOrWhiteSpace($ExistingKey)) {
    # No existing key, prompt for it
    Write-Host "Enter your Anthropic API key:" -ForegroundColor Yellow
    Write-Host "(Get it from: https://console.anthropic.com/settings/keys)" -ForegroundColor Gray
    $ApiKey = Read-Host "API Key"

    if ([string]::IsNullOrWhiteSpace($ApiKey)) {
        Write-Host "✗ API key required" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit
    }
} else {
    # Reuse existing key
    $ApiKey = $ExistingKey.Trim()
    Write-Host "✓ Found existing API key" -ForegroundColor Green
}

# Create application directory
$AppDir = "$env:USERPROFILE\MedicalReportAgent"
$BatchFile = "$AppDir\START-HERE.bat"

Write-Host ""
Write-Host "Creating application directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

# Create launcher batch file with API key
Write-Host "Creating launcher..." -ForegroundColor Yellow

$BatchContent = @"
@echo off
REM Medical Report Agent - Launcher

echo =========================================
echo Medical Report Agent
echo =========================================
echo.

wsl --list >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: WSL not installed
    pause
    exit /b 1
)

echo Setting up...
wsl bash -c "cd ~ && [ -d MEDMCQ261225 ] || git clone https://github.com/ToddHart/MEDMCQ261225.git" >nul 2>&1
wsl bash -c "cd ~/MEDMCQ261225 && git pull -q && git checkout claude/secure-medical-agents-TkKPt" >nul 2>&1
wsl bash -c "pip3 install --break-system-packages -q flask anthropic python-docx reportlab matplotlib pandas numpy pillow 2>&1 | grep -v WARNING"
wsl bash -c "cd ~/MEDMCQ261225/medical-report-agent && echo 'export ANTHROPIC_API_KEY=\"$ApiKey\"' > set_api_key.local.sh"

echo Opening browser...
start "" "http://127.0.0.1:5000"

echo Starting server...
echo Keep this window open.
echo.

wsl bash -c "cd ~/MEDMCQ261225/medical-report-agent && source set_api_key.local.sh && python3 web_app.py"

pause
"@

$BatchContent | Out-File -FilePath $BatchFile -Encoding ASCII

# Create desktop shortcut
Write-Host "Creating desktop shortcut..." -ForegroundColor Yellow

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Medical Report Agent.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $BatchFile
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.Description = "Generate medical psychological reports"
$Shortcut.IconLocation = "%SystemRoot%\System32\shell32.dll,70"
$Shortcut.Save()

Write-Host "✓ Desktop shortcut created!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now:" -ForegroundColor White
Write-Host "  1. Double-click 'Medical Report Agent' on your desktop" -ForegroundColor Cyan
Write-Host "  2. Wait for browser to open (first time takes longer)" -ForegroundColor Cyan
Write-Host "  3. Generate professional medical reports!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Location: $ShortcutPath" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "Would you like to launch it now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Launching Medical Report Agent..." -ForegroundColor Cyan
    Start-Process $ShortcutPath
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"
