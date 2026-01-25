#!/bin/bash
# Medical Report Agent - Windows WSL Setup Script
# Run this in your WSL Ubuntu terminal

echo "=========================================="
echo "Medical Report Agent - WSL Setup"
echo "=========================================="
echo ""

# Navigate to home directory
cd ~
echo "Working directory: $(pwd)"
echo ""

# Check if repository already exists
if [ -d "MEDMCQ261225" ]; then
    echo "Repository already exists. Updating..."
    cd MEDMCQ261225
    git pull origin claude/secure-medical-agents-TkKPt
else
    echo "Cloning repository from GitHub..."
    git clone https://github.com/ToddHart/MEDMCQ261225.git
    cd MEDMCQ261225
fi

echo ""
echo "Checking out medical report agent branch..."
git checkout claude/secure-medical-agents-TkKPt

echo ""
echo "Navigating to medical-report-agent..."
cd medical-report-agent

echo ""
echo "Setting up API key..."
echo ""
echo "Please enter your Anthropic API key:"
echo "(Get it from: https://console.anthropic.com/settings/keys)"
read -p "API Key: " api_key

cat > set_api_key.local.sh << EOF
#!/bin/bash
# Medical Report Agent - API Configuration (LOCAL - DO NOT COMMIT)

# Your Anthropic API key
export ANTHROPIC_API_KEY="$api_key"

echo "✓ API key configured (local)"
echo ""
echo "You can now run:"
echo "  cd medical-report-agent/src"
echo "  python main.py --patient PT001"
echo ""
EOF

chmod +x set_api_key.local.sh
chmod +x launch_medical_reports.sh
echo "✓ API key configured"

echo ""
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y python3-pip python3-venv

echo ""
echo "Installing Python packages..."
pip3 install -r requirements.txt

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To launch the Medical Report Agent, run:"
echo "  ~/MEDMCQ261225/medical-report-agent/launch_medical_reports.sh"
echo ""
echo "Or create a Windows desktop shortcut with:"
echo "  wsl.exe -d Ubuntu -- bash -c \"cd ~/MEDMCQ261225/medical-report-agent && ./launch_medical_reports.sh\""
echo ""
echo "Would you like to launch now? (y/n)"
read -p "> " launch_now

if [ "$launch_now" = "y" ] || [ "$launch_now" = "Y" ]; then
    ./launch_medical_reports.sh
fi
