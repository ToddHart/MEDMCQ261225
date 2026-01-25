# Medical Report Agent - Desktop Shortcut Creator
# Run this PowerShell script to create a desktop shortcut

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Medical Report Agent" -ForegroundColor Green
Write-Host "Desktop Shortcut Creator" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the desktop path
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Medical Report Agent.lnk"

# Create WScript Shell object
$WshShell = New-Object -ComObject WScript.Shell

# Create the shortcut
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

# Set shortcut properties
$Shortcut.TargetPath = "wsl.exe"
$Shortcut.Arguments = 'bash -c "cd ~ && ([ -d MEDMCQ261225 ] || bash <(curl -s https://raw.githubusercontent.com/ToddHart/MEDMCQ261225/claude/secure-medical-agents-TkKPt/medical-report-agent/setup_windows_wsl.sh)) && cd MEDMCQ261225/medical-report-agent && ./launch_medical_reports.sh; read -p ''Press Enter to close...''"'

$Shortcut.WorkingDirectory = "%USERPROFILE%"
$Shortcut.Description = "Generate medical psychological reports"
$Shortcut.IconLocation = "%SystemRoot%\System32\shell32.dll,70"

# Save the shortcut
$Shortcut.Save()

Write-Host "✓ Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Location: $ShortcutPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now double-click 'Medical Report Agent' on your desktop!" -ForegroundColor Cyan
Write-Host ""
Write-Host "First launch will:" -ForegroundColor Yellow
Write-Host "  - Download the repository" -ForegroundColor Gray
Write-Host "  - Install dependencies (2-3 minutes)" -ForegroundColor Gray
Write-Host "  - Set up your API key" -ForegroundColor Gray
Write-Host ""
Write-Host "After that, it launches instantly!" -ForegroundColor Green
Write-Host ""

# Ask if they want to launch now
$response = Read-Host "Would you like to test the shortcut now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Launching Medical Report Agent..." -ForegroundColor Cyan
    Start-Process $ShortcutPath
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to close this window"
