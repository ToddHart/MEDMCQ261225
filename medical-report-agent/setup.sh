#!/bin/bash
# Setup script for Medical Report Agent

echo "=========================================="
echo "Medical Report Agent - Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Error: Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found"
echo ""

# Create virtual environment (optional but recommended)
echo "Would you like to create a virtual environment? (recommended)"
read -p "Create venv? (y/n): " create_venv

if [ "$create_venv" = "y" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✓ Virtual environment created and activated"
fi

echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error installing dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Test the installation
echo "Testing installation..."
cd src
python main.py --list-patients > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Installation successful!"
else
    echo "❌ Installation test failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Quick Start:"
echo "  1. cd src"
echo "  2. python main.py --list-patients"
echo "  3. python main.py --patient PT001"
echo ""
echo "See QUICKSTART.md for detailed instructions."
echo ""

# Ask about API key
echo "Configuration Options:"
echo ""
echo "For best quality reports (prototype mode):"
echo "  export ANTHROPIC_API_KEY='your-key-here'"
echo ""
echo "For complete privacy (production mode):"
echo "  Install Ollama: curl https://ollama.ai/install.sh | sh"
echo "  Then edit src/report_generator.py (use_local_model=True)"
echo ""
