# Medical Report Agent - Data Privacy & Training FAQ

## 📋 Quick Answers

### Q: Is my patient data used to train Claude/Anthropic's models?

**A: NO. Your data is NOT used to train Claude models.**

Anthropic's Commercial Terms clearly state:
- API data is NOT used for model training
- Your prompts and outputs are private
- Data is only processed to provide the service
- You retain ownership of all your data

### Q: Does my data leave my computer?

**A: Yes, but only during specific operations:**

**Data that stays LOCAL (never sent):**
- Your training reports (example_reports folder) - stays on your PC
- Your patient database (patients.json) - stays on your PC
- Generated reports (.docx, .pdf files) - stays on your PC

**Data sent to Anthropic (encrypted):**
- When you click "Start Training": Example reports sent to analyze style
- When you click "Generate Report": Patient data + examples sent to create report
- When you upload patient documents: Content extracted locally, then sent with report generation

All transmissions use HTTPS/TLS encryption.

---

## 🔒 Current Privacy Level: MODERATE

### ✅ What's Protected:
- Data encrypted in transit (HTTPS/TLS)
- Data NOT used to train AI models
- Data not stored long-term by Anthropic
- Training data stays local until you trigger training
- Generated reports never leave your PC

### ⚠️ Current Limitations:
- Data goes to Anthropic servers during report generation
- NOT HIPAA-compliant by default (no Business Associate Agreement)
- Relies on Anthropic's privacy policy

---

## 🏥 HIPAA Compliance Options

### Option 1: Business Associate Agreement (BAA) with Anthropic
**Best for: Professional practice with high-quality reports**

**Requirements:**
1. Contact Anthropic Enterprise Sales
2. Sign Business Associate Agreement
3. Pay for enterprise plan
4. Configure BAA-compliant API endpoint

**Pros:**
- Highest quality reports (Claude Opus 4.5)
- HIPAA compliant
- Full legal protection

**Cons:**
- Requires enterprise plan ($$$)
- Still sends data to Anthropic (but covered by BAA)

### Option 2: Self-Hosted Local Model
**Best for: Maximum privacy, no data transmission**

**Implementation:**
- Use Ollama or LM Studio with local LLM
- All processing on your PC
- Zero data transmission
- No internet required for report generation

**Pros:**
- Absolute privacy
- No data leaves your computer
- No ongoing API costs
- True HIPAA compliance

**Cons:**
- Lower quality reports than Claude Opus 4.5
- Requires powerful PC (16GB+ RAM)
- Slower generation
- More complex setup

**I can help you set this up if needed.**

---

## 📊 Training Data Structure

### Current Structure (What You Have):
```
data/
├── example_reports/
│   ├── report_style_01.txt  (just the report text)
│   ├── report_style_02.txt
│   └── ...
└── patient_db/
    └── patients.json  (test data separate)
```

**What the AI learns:**
- ✅ Writing style, tone, formality
- ✅ Section structure and organization
- ✅ Clinical terminology you use
- ⚠️ Does NOT learn which test statistics you emphasize

### Improved Structure (Optional):
```
data/
└── training_cases/
    ├── case_001/
    │   ├── tests.json       (test data for this case)
    │   └── report.txt       (report written from these tests)
    ├── case_002/
    │   ├── tests.json
    │   └── report.txt
    └── ...
```

**Additional learning with paired data:**
- ✅ How you select relevant test data
- ✅ Which statistics you emphasize
- ✅ How you interpret specific test results
- ✅ Correlation between test scores and your interpretations

**You DON'T need to change your structure now.** The current approach works. But if you want the AI to better learn your data interpretation patterns, pairing tests with reports helps.

---

## 🔐 What Happens During Each Operation

### When You Click "Start Training":
1. Reads .txt files from your training data folder
2. Analyzes structure, headers, tone, vocabulary (LOCAL)
3. Sends 3-5 example reports to Claude API
4. Claude analyzes writing patterns
5. Style patterns saved locally
6. **Data sent:** Training report examples
7. **Purpose:** Learn your writing style

### When You Click "Generate Report":
1. Loads patient test data (LOCAL)
2. Reads uploaded documents if any (LOCAL)
3. Sends to Claude API:
   - Patient test scores
   - Patient demographics
   - 3-5 training report examples
   - Uploaded document content (if any)
   - Report type (parent/specialist/other)
4. Claude generates report matching your style
5. Report saved to your output folder (LOCAL)
6. **Data sent:** Patient data + training examples
7. **Purpose:** Generate report

### When You Upload Patient Documents:
1. Files saved to temporary folder (LOCAL)
2. Content extracted (Word/Excel/PDF parsing) (LOCAL)
3. Content stored in memory until report generation
4. Included in report generation prompt
5. Temp files deleted after session
6. **Data sent:** None (until you generate report)
7. **Purpose:** Add context to report

---

## 🛡️ Security Best Practices

### Current Setup (What You Should Do):
1. ✅ Use strong WiFi password
2. ✅ Keep Windows updated
3. ✅ Use Windows Defender
4. ✅ Don't share your API key
5. ✅ De-identify training data (remove patient names)
6. ✅ Use generic patient IDs in examples

### For Compliance:
1. ⚠️ Sign BAA with Anthropic (if processing real PHI)
2. ⚠️ Document your privacy procedures
3. ⚠️ Get patient consent for AI-assisted reports
4. ⚠️ Maintain audit logs (who generates which reports)

### For Maximum Privacy:
1. 🔒 Switch to local model (I can help)
2. 🔒 Disconnect from internet during report generation
3. 🔒 Encrypt your hard drive
4. 🔒 Use VPN for all internet access

---

## ❓ Common Questions

### Do I need to separate tests and reports for training?
**No, not required.** Your current structure works. But separating helps the AI learn:
- Which test data you consider important
- How you interpret specific test scores
- Your patterns in selecting relevant information

### Can I use this in my professional practice?
**Not yet for real patients.** Current setup is:
- ✅ Good for: Testing, learning, de-identified cases
- ⚠️ Not HIPAA compliant without BAA
- ❌ Don't use with: Real PHI without BAA

### How do I make this fully HIPAA compliant?
**Two options:**
1. Get BAA with Anthropic ($$, enterprise plan)
2. Switch to local model (free, lower quality)

### Is the generated report confidential?
**Yes.** The report:
- Saved only to your local PC
- Never uploaded anywhere
- You control all copies

### What if Anthropic has a data breach?
**Your data would be encrypted in their systems.** But:
- They only keep data temporarily during processing
- No long-term storage of your reports
- Data encrypted at rest and in transit

### Should I de-identify training data?
**Highly recommended.** Replace:
- Real names → "Patient," "Parent," or generic names
- Specific schools → "Local Elementary School"
- Specific locations → "Midwest," "Urban area"
- Identifiable details → Generic descriptions

---

## 📞 Need Help?

**Want to set up local model for maximum privacy?**
I can help you configure Ollama or LM Studio with a local LLM.

**Need HIPAA compliance?**
I can provide documentation for BAA setup with Anthropic.

**Questions about data flow?**
Ask me - I'll explain exactly what happens with your data.

---

**Last Updated:** 2026-01-26
