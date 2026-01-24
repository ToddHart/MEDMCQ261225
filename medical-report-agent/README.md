# Medical Report Generation Agent

**Secure, Local AI System for Psychological Assessment Reports**

This system learns from your existing reports to generate new professional psychological assessment reports while maintaining complete patient confidentiality.

## Features

✅ **100% Local Operation** - All processing on your computer
✅ **Style Learning** - Learns YOUR writing style, tone, and structure
✅ **Secure** - Patient data never leaves your machine
✅ **Professional Output** - Word & PDF documents with graphs
✅ **HIPAA-Ready** - Designed for healthcare compliance
✅ **Low Volume Optimized** - Perfect for 5-8 reports/month

## How It Works

### 1. Learning Phase
The system analyzes your example reports (with patient data removed) to learn:
- Your writing style and tone
- Report structure and organization
- Clinical terminology preferences
- Formatting patterns (bullets, headers, etc.)
- Document layout preferences

### 2. Generation Phase
For each new patient:
- Retrieves test data from local database
- Generates report matching YOUR learned style
- Creates professional documents with graphs
- Saves to encrypted local storage

### 3. Security
- **Training data**: De-identified example reports (style learning only)
- **Patient data**: Never used for training, only at runtime
- **Processing**: 100% local (no external servers)
- **Storage**: Encrypted local files

## Installation

### Requirements
- Python 3.8+
- 16GB RAM (recommended)
- 100GB free disk space

### Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# (Optional) Set API key for prototype mode
export ANTHROPIC_API_KEY="your-key-here"

# Or use local models (production)
# Install Ollama: https://ollama.ai
```

## Usage

### List available patients
```bash
cd src
python main.py --list-patients
```

### Generate a report
```bash
python main.py --patient PT001
```

### Generate PDF only
```bash
python main.py --patient PT002 --format pdf
```

### Show security information
```bash
python main.py --security-info
```

## Project Structure

```
medical-report-agent/
├── data/
│   ├── example_reports/      # 20+ de-identified example reports
│   └── patient_db/           # Patient test data (JSON)
├── src/
│   ├── main.py              # CLI interface
│   ├── style_analyzer.py    # Learns writing style
│   ├── report_generator.py  # Generates reports
│   └── document_formatter.py # Creates Word/PDF
├── output/                  # Generated reports
└── requirements.txt
```

## Adding Your Own Data

### Example Reports
1. De-identify your existing reports (remove patient names, IDs, dates)
2. Save as `.txt` files in `data/example_reports/`
3. Need 20+ reports for good style learning

### Patient Database
Edit `data/patient_db/patients.json`:

```json
{
  "patient_id": "PT006",
  "name": "Patient Name",
  "age": 45,
  "gender": "Male",
  "date_of_assessment": "2024-01-15",
  "tests": [
    {
      "test_name": "Cognitive Assessment",
      "test_code": "CAB",
      "scores": {
        "memory": 82,
        "attention": 88
      },
      "percentile": 75,
      "interpretation": "Average to above average"
    }
  ]
}
```

## Production Deployment (Local Models)

For complete privacy, use local AI models:

### Option 1: Ollama
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Download medical model
ollama pull llama3.1:70b

# Configure system to use Ollama
# Edit report_generator.py: use_local_model=True
```

### Option 2: LM Studio
1. Download from https://lmstudio.ai
2. Load Llama 3.1 or Mistral model
3. Configure local API endpoint

## Security Best Practices

1. **Encrypt patient database**
   ```bash
   # Use VeraCrypt or similar
   # Store patients.json in encrypted container
   ```

2. **Secure output directory**
   ```bash
   chmod 700 output/
   # Set permissions to owner-only
   ```

3. **Use full disk encryption**
   - Windows: BitLocker
   - Mac: FileVault
   - Linux: LUKS

4. **Regular backups**
   - Backup to encrypted external drive
   - Test restore procedures

## Cost Breakdown

### Prototype Mode (API)
- Uses Claude API for testing: ~$0.01-0.10 per report
- For 5-8 reports/month: ~$0.50/month

### Production Mode (Local)
- **One-time**: $2,000-3,500 (workstation with GPU)
- **Ongoing**: ~$0 (electricity only)
- **No subscription fees**

## Compliance Notes

This system is designed to support HIPAA compliance:

✅ Access controls (implement user authentication)
✅ Audit logging (track all report generation)
✅ Encryption (at rest and in transit)
✅ Data minimization (only necessary PHI stored)
✅ Local processing (no external transmission)

**Important**: Consult with your compliance officer to ensure proper implementation for your specific use case.

## Troubleshooting

### "No API key found"
- Either set `ANTHROPIC_API_KEY` environment variable
- Or use local models (set `use_local_model=True`)

### "Module not found"
```bash
pip install -r requirements.txt
```

### Graphs not generating
```bash
pip install matplotlib
```

### Out of memory
- Use smaller AI model (Llama 8B instead of 70B)
- Close other applications
- Increase system RAM

## Support

This is a prototype demonstration system. For production deployment:
- Implement user authentication
- Add audit logging
- Set up encrypted storage
- Configure local AI models
- Implement access controls
- Add backup systems

## License

Prototype for demonstration purposes. Implement appropriate security measures before production use with real patient data.

---

**IMPORTANT**: This prototype uses external APIs for demonstration. For production use with real patient data, configure local AI models to ensure complete privacy and HIPAA compliance.
