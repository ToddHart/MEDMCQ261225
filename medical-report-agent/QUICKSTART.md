# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd medical-report-agent
pip install -r requirements.txt
```

### Step 2: Test the System
```bash
cd src
python main.py --list-patients
```

You should see 5 demo patients (PT001-PT005).

### Step 3: Generate Your First Report
```bash
python main.py --patient PT001
```

This will:
1. Analyze 22 example reports to learn writing style
2. Generate a professional report for patient PT001
3. Create a Word document with graphs
4. Save to `../output/` directory

### Step 4: View the Output
Open the generated `.docx` file in Microsoft Word or LibreOffice.

You'll see:
- Professional formatting
- Clinical test results
- Data visualization graphs
- Report structure matching example styles

## 📊 What You'll Get

**Generated Files:**
- `report_PT001_YYYYMMDD_HHMMSS.docx` - Formatted Word document
- `graph_PT001.png` - Test results visualization

**Report Includes:**
- Patient demographics
- Tests administered
- Detailed results with percentiles
- Clinical interpretation
- Recommendations
- Professional graphs

## 🎯 Next Steps

### Generate More Reports
```bash
# For patient PT002
python main.py --patient PT002

# PDF only
python main.py --patient PT003 --format pdf

# Both formats
python main.py --patient PT004 --format both
```

### Add Your Own Patients

Edit `data/patient_db/patients.json`:

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
  "clinical_notes": "Your clinical observations here"
}
```

Then generate:
```bash
python main.py --patient PT006
```

### Add Your Own Example Reports

1. De-identify your existing reports (remove patient info)
2. Save as `.txt` files in `data/example_reports/`
3. Name them like `my_report_01.txt`, `my_report_02.txt`, etc.
4. The system will automatically learn from ALL reports in that folder

## 🔒 Security Mode

### For Production (Real Patient Data)

**Option 1: Use Local AI Model (Recommended)**

Install Ollama:
```bash
curl https://ollama.ai/install.sh | sh
ollama pull llama3.1:70b
```

Then update `src/report_generator.py` line 17:
```python
self.use_local_model = True  # Change from False to True
```

**Option 2: Use API with Privacy Settings**

Set environment variable:
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

Note: With Claude API, you can request zero data retention for HIPAA compliance.

## 💡 Tips

### Speed Up Generation
- First run analyzes all 22 example reports (takes ~10 seconds)
- Subsequent reports in same session are faster
- Consider caching analysis results for production

### Improve Report Quality
- Add MORE example reports (30-50 recommended)
- Ensure examples show different test types
- Include variety of writing styles you use

### Customize Output
- Edit `src/document_formatter.py` to change fonts, colors
- Modify graph styles in `create_test_graphs()` method
- Adjust document layouts and spacing

## ❓ Troubleshooting

### "No such file or directory"
Make sure you're running from the `src/` directory:
```bash
cd medical-report-agent/src
python main.py --list-patients
```

### "Module not found"
Install requirements:
```bash
pip install -r requirements.txt
```

### No graphs appearing
Check matplotlib installation:
```bash
pip install matplotlib
python -c "import matplotlib; print('OK')"
```

### Out of memory
- Use smaller test dataset
- Close other applications
- Generate one report at a time

## 📈 Performance

**Tested on:**
- 16GB RAM laptop
- No GPU required
- Generation time: 5-30 seconds per report
- File sizes: 50-150KB per document

**Scales to:**
- Unlimited patients
- Unlimited example reports
- 5-8 reports/month (optimal for this setup)
- Can handle batch processing if needed

## 🎓 Learning Resources

**Understanding the System:**
1. `style_analyzer.py` - How style learning works
2. `report_generator.py` - Report generation logic
3. `document_formatter.py` - Document creation
4. `main.py` - CLI interface

**Customization:**
- Modify templates in `report_generator.py`
- Change document styles in `document_formatter.py`
- Add new test types by updating patient JSON structure

## ✅ Success Checklist

- [ ] Installed all dependencies
- [ ] Listed available patients
- [ ] Generated first test report
- [ ] Opened and viewed Word document
- [ ] Saw graphs in the report
- [ ] Understood how to add new patients
- [ ] Know how to add example reports
- [ ] Configured security settings for production use

---

**Ready for Production?**

See `README.md` for:
- HIPAA compliance setup
- Encryption configuration
- Backup procedures
- Access controls
- Audit logging

**Questions?**
Review the main `README.md` for detailed documentation.
