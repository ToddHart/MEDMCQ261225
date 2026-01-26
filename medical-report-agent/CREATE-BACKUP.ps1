# Medical Report Agent - Complete Code Backup Script
# Creates a comprehensive backup of all code files
# Run this from Windows PowerShell in the medical-report-agent directory

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupFile = "CODE_BACKUP_$timestamp.txt"

Write-Host "Creating complete code backup..." -ForegroundColor Cyan
Write-Host "Backup file: $backupFile" -ForegroundColor Yellow
Write-Host ""

# Create backup file header
@"
================================================================================
MEDICAL REPORT AGENT - COMPLETE CODE BACKUP
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
================================================================================

PROJECT OVERVIEW:
Private medical psychological report generation system using Claude Opus 4.5 AI.
Maintains patient confidentiality with local processing and secure API usage.

KEY FEATURES:
- Claude Opus 4.5 powered report generation (8000 tokens)
- 6 report types: Parent/Specialist/Other (Full/Shortened)
- File upload for additional patient data (Word/Excel/PDF)
- Custom training data paths
- AI training button to learn your writing style
- Light professional 2026 interface
- Windows + WSL compatible
- Auto-opens generated reports in Word/PDF

PRIVACY & SECURITY:
✓ Uses Anthropic API (encrypted HTTPS transmission)
✓ Your data is NOT used to train Claude models
✓ Data only sent to Anthropic during report generation
✓ Training data stays local until "Start Training" clicked
⚠ For full HIPAA compliance: Need Business Associate Agreement with Anthropic

INSTALLATION:
1. Install WSL: wsl --install
2. Clone repo to WSL home directory
3. Install dependencies: pip3 install -r requirements.txt
4. Run: .\INSTALL-DESKTOP-ICON.ps1
5. Click "Medical Report Agent" desktop icon to launch

================================================================================
FILE STRUCTURE:
================================================================================

medical-report-agent/
├── web_app.py                 # Main Flask web server (Python)
├── requirements.txt           # Python dependencies
├── INSTALL-DESKTOP-ICON.ps1   # Windows desktop installer
├── CREATE-BACKUP.ps1          # This backup script
├── src/
│   ├── style_analyzer.py      # Analyzes writing style from training reports
│   ├── report_generator.py    # Generates reports using Claude Opus 4.5
│   └── document_formatter.py  # Creates Word/PDF documents with graphs
├── templates/
│   └── index.html             # Web interface HTML (modern 2026 design)
├── static/
│   ├── style.css              # Professional light theme CSS
│   └── app.js                 # Frontend JavaScript functionality
├── data/
│   ├── example_reports/       # Training data (your example reports)
│   └── patient_db/            # Patient test data (JSON)
└── output/                    # Generated reports output folder

================================================================================
COMPLETE CODE FILES:
================================================================================

"@ | Out-File -FilePath $backupFile -Encoding UTF8

# Function to append file with header
function Add-FileToBackup {
    param (
        [string]$FilePath,
        [string]$Description
    )

    if (Test-Path $FilePath) {
        Write-Host "  ✓ Adding: $FilePath" -ForegroundColor Green

        @"


################################################################################
# FILE: $FilePath
# $Description
################################################################################

"@ | Out-File -FilePath $backupFile -Append -Encoding UTF8

        Get-Content $FilePath | Out-File -FilePath $backupFile -Append -Encoding UTF8
    } else {
        Write-Host "  ✗ Not found: $FilePath" -ForegroundColor Red
    }
}

# Backup all important files
Write-Host "Backing up Python files..." -ForegroundColor Cyan
Add-FileToBackup "web_app.py" "Main Flask web server - handles all API endpoints and routing"
Add-FileToBackup "src\style_analyzer.py" "Analyzes writing style patterns from training reports"
Add-FileToBackup "src\report_generator.py" "Generates reports using Claude Opus 4.5 AI"
Add-FileToBackup "src\document_formatter.py" "Creates formatted Word and PDF documents"

Write-Host ""
Write-Host "Backing up frontend files..." -ForegroundColor Cyan
Add-FileToBackup "templates\index.html" "Main web interface HTML with modern 2026 design"
Add-FileToBackup "static\style.css" "Professional light theme CSS styling"
Add-FileToBackup "static\app.js" "Frontend JavaScript - handles user interactions"

Write-Host ""
Write-Host "Backing up configuration files..." -ForegroundColor Cyan
Add-FileToBackup "requirements.txt" "Python package dependencies"
Add-FileToBackup "INSTALL-DESKTOP-ICON.ps1" "Desktop icon installer for Windows"

# Add recovery instructions
@"


################################################################################
# RECOVERY INSTRUCTIONS
################################################################################

To restore this code from backup:

1. Create project directory:
   mkdir medical-report-agent
   cd medical-report-agent

2. Extract each file from this backup:
   - Find the file section (marked with #### FILE: filename ####)
   - Copy everything after the header until the next file section
   - Save to the correct file path

3. Create required directories:
   mkdir src, templates, static, data, output
   mkdir data\example_reports, data\patient_db

4. Install Python dependencies:
   pip3 install -r requirements.txt

5. Configure API key:
   Create set_api_key.local.sh in WSL with:
   export ANTHROPIC_API_KEY="your-key-here"

6. Add your training data:
   - Put your example reports (.txt files) in data/example_reports/
   - Create patients.json in data/patient_db/

7. Run the application:
   python3 web_app.py

################################################################################
# END OF BACKUP
################################################################################
"@ | Out-File -FilePath $backupFile -Append -Encoding UTF8

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "BACKUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backup saved to: $backupFile" -ForegroundColor Yellow
Write-Host "File size: $((Get-Item $backupFile).Length / 1KB) KB" -ForegroundColor Yellow
Write-Host ""
Write-Host "This backup contains ALL your code and can be used to restore" -ForegroundColor Cyan
Write-Host "the entire application if anything is lost or corrupted." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: This backup does NOT include:" -ForegroundColor Yellow
Write-Host "  - Your API key (for security)" -ForegroundColor Yellow
Write-Host "  - Your training data (example reports)" -ForegroundColor Yellow
Write-Host "  - Your patient database" -ForegroundColor Yellow
Write-Host "  - Generated reports" -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure to back up those separately!" -ForegroundColor Red
Write-Host ""

Read-Host "Press Enter to exit"
