# Desktop Icon - Quick Guide

## ✅ Desktop Icon Installed!

You now have a **clickable desktop icon** to launch the Medical Report Agent.

---

## 🖱️ How to Use

### **Option 1: Desktop Icon (Easiest!)**
1. Look for **"Medical Report Agent"** icon on your desktop
2. **Double-click** the icon
3. Interactive menu appears in a terminal window
4. Follow the on-screen prompts

### **Option 2: Applications Menu**
1. Open your applications menu
2. Search for **"Medical Report Agent"**
3. Click to launch

### **Option 3: Direct Command**
```bash
/home/user/MEDMCQ261225/medical-report-agent/launch_medical_reports.sh
```

---

## 📋 Interactive Menu Options

When you launch the app, you'll see:

```
╔════════════════════════════════════════════════════════════╗
║     MEDICAL REPORT GENERATION SYSTEM                       ║
║          Secure Local AI Agent                             ║
╚════════════════════════════════════════════════════════════╝

Main Menu:

  1) List Patients
  2) Generate Report
  3) View Recent Reports
  4) Help
  5) Exit

Enter choice (1-5):
```

---

## 🎯 Using the Menu

### **Option 1: List Patients**
- Shows all available patients (PT001-PT005)
- Displays patient details and number of tests

### **Option 2: Generate Report**
- Enter patient ID (e.g., PT001)
- Choose format:
  - Word only
  - PDF only
  - Both formats
- Report is generated and saved
- Option to open output folder

### **Option 3: View Recent Reports**
- Shows last 10 generated reports
- Displays file sizes and timestamps

### **Option 4: Help**
- Usage instructions
- How to add your own data
- Output location

### **Option 5: Exit**
- Close the application

---

## 📂 Where Reports Are Saved

All generated reports go to:
```
/home/user/MEDMCQ261225/medical-report-agent/output/
```

Files include:
- `report_PT001_TIMESTAMP.docx` - Word document
- `report_PT001_TIMESTAMP.pdf` - PDF document
- `graph_PT001.png` - Test visualization

---

## 🔧 Troubleshooting

### **Icon doesn't appear on desktop**
Run this command:
```bash
/home/user/MEDMCQ261225/medical-report-agent/install_desktop_icon.sh
```

### **Double-click doesn't work**
Try right-click → "Allow Launching" or "Mark as Trusted"

Or run directly:
```bash
/home/user/MEDMCQ261225/medical-report-agent/launch_medical_reports.sh
```

### **"API key not found" error**
Make sure you have `set_api_key.local.sh` in the project folder with your API key.

---

## 🚀 Quick Example

1. **Double-click** desktop icon
2. **Press 2** (Generate Report)
3. **Type: PT001** (patient ID)
4. **Press 1** (Word format)
5. **Wait** ~15 seconds
6. **Press y** to open output folder
7. **Open** the Word document

Done! 🎉

---

## 📝 Adding Your Own Patients

1. Launch the app (double-click icon)
2. After generating a test report, close the app
3. Edit patient database:
   ```bash
   nano /home/user/MEDMCQ261225/medical-report-agent/data/patient_db/patients.json
   ```
4. Add your patient data (follow existing format)
5. Launch app again - your new patients will appear

---

## 💡 Pro Tips

**Faster Workflow:**
- Keep the app open between reports
- Generate multiple reports in one session
- Use "View Recent Reports" to track your work

**Keyboard Shortcuts:**
- Just type the number and press Enter
- No need to click anything with mouse

**Output Management:**
- Reports are timestamped automatically
- Old reports are never overwritten
- You can safely delete old reports from `output/` folder

---

## 🎨 Desktop Icon Details

**Icon Location:**
- Desktop: `~/Desktop/Medical-Report-Agent.desktop`
- Apps Menu: `~/.local/share/applications/Medical-Report-Agent.desktop`

**To Reinstall Icon:**
```bash
cd /home/user/MEDMCQ261225/medical-report-agent
./install_desktop_icon.sh
```

**To Uninstall Icon:**
```bash
rm ~/Desktop/Medical-Report-Agent.desktop
rm ~/.local/share/applications/Medical-Report-Agent.desktop
```

---

## ✨ That's It!

You now have a **simple, clickable interface** for generating medical reports.

**No more typing long commands** - just double-click and follow the menu!

---

**For advanced usage, see:**
- USAGE.md - Command-line usage
- README.md - Full documentation
- QUICKSTART.md - Setup guide
