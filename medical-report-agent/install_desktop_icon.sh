#!/bin/bash
# Install Desktop Icon for Medical Report Agent

echo "=========================================="
echo "Installing Desktop Icon"
echo "=========================================="
echo ""

# Get the current directory
INSTALL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installation directory: $INSTALL_DIR"
echo ""

# Create Desktop directory if it doesn't exist
mkdir -p ~/Desktop

# Copy desktop file to Desktop
cp "$INSTALL_DIR/Medical-Report-Agent.desktop" ~/Desktop/
chmod +x ~/Desktop/Medical-Report-Agent.desktop

echo "✓ Desktop icon installed to ~/Desktop/"
echo ""

# Also install to applications menu (optional)
mkdir -p ~/.local/share/applications
cp "$INSTALL_DIR/Medical-Report-Agent.desktop" ~/.local/share/applications/
chmod +x ~/.local/share/applications/Medical-Report-Agent.desktop

echo "✓ Application menu entry installed"
echo ""

# Try to mark as trusted (for some desktop environments)
if command -v gio &> /dev/null; then
    gio set ~/Desktop/Medical-Report-Agent.desktop metadata::trusted true 2>/dev/null
fi

echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "You should now see 'Medical Report Agent' icon on your desktop."
echo ""
echo "To launch:"
echo "  • Double-click the desktop icon"
echo "  • OR search for 'Medical Report Agent' in your applications menu"
echo ""
echo "If the icon doesn't work, you can also run:"
echo "  $INSTALL_DIR/launch_medical_reports.sh"
echo ""
