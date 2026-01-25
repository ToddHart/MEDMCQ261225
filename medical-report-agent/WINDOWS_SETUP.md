# Windows Desktop Shortcut Setup

## 🚀 Super Easy Setup (2 Steps!)

### **Step 1: Open PowerShell**
- Press `Windows Key + X`
- Click "Windows PowerShell" or "Terminal"

### **Step 2: Copy & Paste This ONE Command**

```powershell
irm https://raw.githubusercontent.com/ToddHart/MEDMCQ261225/claude/secure-medical-agents-TkKPt/medical-report-agent/Create-Desktop-Shortcut.ps1 | iex
```

Press Enter. The script will:
- ✅ Create a desktop shortcut
- ✅ Ask if you want to test it

---

## 🎯 That's It!

You'll now have **"Medical Report Agent"** icon on your desktop.

**Double-click it** to:
- Download repository (first time only)
- Install dependencies (first time only)
- Launch the interactive menu

---

## 📋 What the Shortcut Does

**First Time:**
- Downloads the Medical Report Agent
- Installs Python packages (~2-3 minutes)
- Sets up your API key
- Launches the app

**Every Time After:**
- Launches instantly!
- Shows the interactive menu
- Generate reports with a few clicks

---

## 🖱️ Alternative: Manual Shortcut Creation

If you prefer to create it manually:

1. **Right-click Desktop** → New → Shortcut
2. **Paste this location:**
```
wsl.exe bash -c "cd ~ && ([ -d MEDMCQ261225 ] || git clone https://github.com/ToddHart/MEDMCQ261225.git) && cd MEDMCQ261225 && git checkout claude/secure-medical-agents-TkKPt && cd medical-report-agent && ./launch_medical_reports.sh"
```
3. **Name it:** Medical Report Agent
4. **Click Finish**

---

## 📂 Where Are Reports Saved?

Open Windows File Explorer and go to:
```
\\wsl$\Ubuntu\home\YOUR_USERNAME\MEDMCQ261225\medical-report-agent\output\
```

Or after generating a report, the app will offer to open the folder!

---

## ❓ Troubleshooting

### "WSL not found"
Run in PowerShell:
```powershell
wsl --install
```
Then restart your computer.

### "Permission denied"
Right-click PowerShell → "Run as Administrator"

### Shortcut doesn't work
Try the batch file instead:
1. Download: `Launch-Medical-Reports.bat`
2. Double-click it

---

## 🎉 You're Done!

Double-click the desktop icon and start generating professional medical reports!
