# Daily Usage Guide - Medical Report Agent

## 🚀 Quick Start (Every Time)

### **Option 1: Quick Run (Recommended)**

```bash
# From anywhere, run these 3 commands:
cd /home/user/MEDMCQ261225/medical-report-agent
source set_api_key.local.sh
cd src && python main.py --patient PT001
```

### **Option 2: One-Line Command**

```bash
cd /home/user/MEDMCQ261225/medical-report-agent && source set_api_key.local.sh && cd src && python main.py --patient PT001
```

---

## 📋 Common Tasks

### **List All Patients**
```bash
cd /home/user/MEDMCQ261225/medical-report-agent
source set_api_key.local.sh
cd src
python main.py --list-patients
```

### **Generate Word Document**
```bash
source ../set_api_key.sh  # If in src/ directory
python main.py --patient PT001 --format word
```

### **Generate PDF Only**
```bash
source ../set_api_key.sh
python main.py --patient PT002 --format pdf
```

### **Generate Both Formats**
```bash
source ../set_api_key.sh
python main.py --patient PT003 --format both
```

---

## 📂 Where Files Are Saved

**Generated reports go to:**
```
/home/user/MEDMCQ261225/medical-report-agent/output/
```

**Files created:**
- `report_PT001_TIMESTAMP.docx` - Word document
- `report_PT001_TIMESTAMP.pdf` - PDF document
- `graph_PT001.png` - Test visualization

---

## 🔧 Current Test Patients

You can use these patient IDs for testing:

| Patient ID | Name          | Age | Tests |
|------------|---------------|-----|-------|
| PT001      | John Doe      | 45  | 3     |
| PT002      | Jane Smith    | 32  | 2     |
| PT003      | Robert Johnson| 58  | 3     |
| PT004      | Maria Garcia  | 28  | 2     |
| PT005      | David Lee     | 41  | 3     |

---

## 📝 Adding Your Own Patients

### **Edit the patient database:**
```bash
nano /home/user/MEDMCQ261225/medical-report-agent/data/patient_db/patients.json
```

### **Add a new patient:**
```json
{
  "patient_id": "PT006",
  "name": "Your Patient Name",
  "age": 35,
  "gender": "Female",
  "date_of_assessment": "2024-03-01",
  "tests": [
    {
      "test_name": "Your Test Name",
      "test_code": "TEST",
      "score": 85,
      "percentile": 75,
      "interpretation": "Above average performance"
    }
  ],
  "clinical_notes": "Your clinical observations"
}
```

### **Generate report for new patient:**
```bash
source ../set_api_key.sh
python main.py --patient PT006
```

---

## 📚 Adding Your Own Example Reports

**Your example reports teach the system YOUR writing style.**

### **Location:**
```
/home/user/MEDMCQ261225/medical-report-agent/data/example_reports/
```

### **Steps:**
1. De-identify your existing reports (remove patient names, dates, IDs)
2. Save as `.txt` files (any name works)
3. Add 20+ reports for best results
4. System automatically learns from ALL `.txt` files

**Example:**
```bash
# Add your de-identified reports
cp ~/my_reports/deidentified_report_1.txt data/example_reports/
cp ~/my_reports/deidentified_report_2.txt data/example_reports/
# ... add 20+ total
```

---

## 💰 Cost Tracking

**Your current setup:**
- API: Anthropic Claude (pay-as-you-go)
- Cost per report: ~$0.02-0.10
- 5-8 reports/month = ~$0.10-0.80/month

**Check usage:**
https://console.anthropic.com/settings/billing

---

## 🆘 Troubleshooting

### **"No API key found"**
```bash
# Make sure you run this first:
source /home/user/MEDMCQ261225/medical-report-agent/set_api_key.sh
```

### **"Patient not found"**
```bash
# List available patients:
python main.py --list-patients
```

### **"Module not found"**
```bash
# Reinstall dependencies:
cd /home/user/MEDMCQ261225/medical-report-agent
pip install -r requirements.txt
```

### **API credit error**
- Check: https://console.anthropic.com/settings/billing
- Add credits or payment method

---

## 📊 Output Quality

**You're currently using:** Claude API Mode ⭐

**Benefits:**
- Natural clinical language
- Better interpretation of test results
- Contextual analysis
- Professional narrative flow
- Detailed recommendations

**Cost:** ~$0.02 per report (very affordable for your volume)

---

## ⚡ Quick Reference

**Generate a report:**
```bash
cd /home/user/MEDMCQ261225/medical-report-agent
source set_api_key.local.sh && cd src && python main.py --patient PT001
```

**List patients:**
```bash
cd /home/user/MEDMCQ261225/medical-report-agent/src
source ../set_api_key.sh
python main.py --list-patients
```

**Check output:**
```bash
ls -lh /home/user/MEDMCQ261225/medical-report-agent/output/
```

---

## 🔒 Security Reminder

**For real patient data:**
1. ✅ Enable zero data retention at Anthropic
2. ✅ Get BAA (Business Associate Agreement) if needed
3. ✅ Encrypt your patient database
4. ✅ Use secure backups
5. ✅ Consider switching to local model for maximum privacy

**Current status:** ⚠️ Using demo data - safe for testing

---

**Questions?** See the full documentation:
- `README.md` - Complete guide
- `QUICKSTART.md` - Setup instructions
- `PROJECT_SUMMARY.md` - Feature overview
