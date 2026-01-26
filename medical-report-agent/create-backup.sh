#!/bin/bash
# Medical Report Agent - Complete Code Backup Script (Linux/WSL)
# Creates a comprehensive backup of all code files

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="CODE_BACKUP_${TIMESTAMP}.txt"

echo "==============================================================="
echo "Creating complete code backup..."
echo "Backup file: $BACKUP_FILE"
echo "==============================================================="
echo ""

# Create backup file header
cat > "$BACKUP_FILE" << 'EOF'
================================================================================
MEDICAL REPORT AGENT - COMPLETE CODE BACKUP
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

================================================================================
FILE STRUCTURE:
================================================================================

medical-report-agent/
├── web_app.py                 # Main Flask web server
├── requirements.txt           # Python dependencies
├── src/
│   ├── style_analyzer.py      # Analyzes writing style
│   ├── report_generator.py    # Generates reports with AI
│   └── document_formatter.py  # Creates Word/PDF documents
├── templates/
│   └── index.html             # Web interface HTML
├── static/
│   ├── style.css              # Professional light theme
│   └── app.js                 # Frontend JavaScript
├── data/
│   ├── example_reports/       # Training data
│   └── patient_db/            # Patient test data
└── output/                    # Generated reports

================================================================================
COMPLETE CODE FILES:
================================================================================

EOF

# Function to add file to backup
add_file() {
    local file=$1
    local desc=$2

    if [ -f "$file" ]; then
        echo "  ✓ Adding: $file"
        cat >> "$BACKUP_FILE" << EOF


################################################################################
# FILE: $file
# $desc
################################################################################

EOF
        cat "$file" >> "$BACKUP_FILE"
    else
        echo "  ✗ Not found: $file"
    fi
}

# Backup all important files
echo "Backing up Python files..."
add_file "web_app.py" "Main Flask web server - handles all API endpoints"
add_file "src/style_analyzer.py" "Analyzes writing style from training reports"
add_file "src/report_generator.py" "Generates reports using Claude Opus 4.5"
add_file "src/document_formatter.py" "Creates formatted Word and PDF documents"

echo ""
echo "Backing up frontend files..."
add_file "templates/index.html" "Main web interface with modern 2026 design"
add_file "static/style.css" "Professional light theme CSS styling"
add_file "static/app.js" "Frontend JavaScript functionality"

echo ""
echo "Backing up configuration files..."
add_file "requirements.txt" "Python package dependencies"
add_file "INSTALL-DESKTOP-ICON.ps1" "Desktop icon installer for Windows"

# Add recovery instructions
cat >> "$BACKUP_FILE" << 'EOF'


################################################################################
# RECOVERY INSTRUCTIONS
################################################################################

To restore this code from backup:

1. Create project directory:
   mkdir -p medical-report-agent/{src,templates,static,data,output}
   cd medical-report-agent

2. Extract each file from this backup:
   - Find the file section (marked with #### FILE: filename ####)
   - Copy everything after the header until the next file section
   - Save to the correct file path

3. Install Python dependencies:
   pip3 install -r requirements.txt

4. Configure API key:
   Create set_api_key.local.sh with:
   export ANTHROPIC_API_KEY="your-key-here"

5. Add your training data:
   - Put your example reports (.txt files) in data/example_reports/
   - Create patients.json in data/patient_db/

6. Run the application:
   python3 web_app.py

################################################################################
# END OF BACKUP
################################################################################
EOF

echo ""
echo "==============================================================="
echo "✓ BACKUP COMPLETE!"
echo "==============================================================="
echo ""
echo "Backup saved to: $BACKUP_FILE"
echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
echo "This backup contains ALL your code and can be used to restore"
echo "the entire application if anything is lost or corrupted."
echo ""
echo "IMPORTANT: This backup does NOT include:"
echo "  - Your API key (for security)"
echo "  - Your training data (example reports)"
echo "  - Your patient database"
echo "  - Generated reports"
echo ""
echo "Make sure to back up those separately!"
echo ""
