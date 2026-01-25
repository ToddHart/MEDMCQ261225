#!/bin/bash
# Medical Report Agent - Modern GUI Launcher
# Launches the 2026-style web interface

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Medical Report Agent"
echo "Modern Web Interface"
echo "=========================================="
echo ""

# Load API key
if [ -f "set_api_key.local.sh" ]; then
    source set_api_key.local.sh
else
    echo "⚠ Warning: API key not configured"
    echo "Create set_api_key.local.sh with your API key"
    echo ""
fi

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Installing required packages..."
    pip3 install -q -r requirements.txt
    echo "✓ Installation complete"
    echo ""
fi

# Launch the web app
echo "Starting web interface..."
echo "The application will open in your browser automatically"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 web_app.py
