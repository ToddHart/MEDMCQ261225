# Medical Report Agent - Complete Code Backup
Generated: 2026-01-26

## Project Overview
Private medical report generation system using Claude Opus 4.5 AI.
Maintains patient confidentiality with local processing and secure API usage.

## File Structure
```
medical-report-agent/
├── web_app.py                 # Main Flask web server
├── requirements.txt           # Python dependencies
├── INSTALL-DESKTOP-ICON.ps1   # Windows desktop installer
├── src/
│   ├── style_analyzer.py      # Analyzes writing style from examples
│   ├── report_generator.py    # Generates reports using AI
│   └── document_formatter.py  # Creates Word/PDF documents
├── templates/
│   └── index.html             # Web interface HTML
├── static/
│   ├── style.css              # Professional light theme
│   └── app.js                 # Frontend JavaScript
├── data/
│   ├── example_reports/       # Training data (22 example reports)
│   └── patient_db/            # Patient test data
└── output/                    # Generated reports

## Key Features
- Claude Opus 4.5 powered report generation
- 6 report types: Parent/Specialist/Other (Full/Shortened)
- File upload for additional patient data
- Custom training data paths
- Light professional interface
- Windows + WSL compatible
- Auto-opens generated reports

## Privacy & Security
- Uses Anthropic API (encrypted transmission)
- Data NOT used to train Claude models
- Patient data only sent during report generation
- Training data stays local until "Start Training" clicked
- For full HIPAA compliance: Need BAA with Anthropic or use local model

## Installation
1. Install WSL (Windows Subsystem for Linux)
2. Clone repository to WSL
3. Install Python dependencies: `pip3 install -r requirements.txt`
4. Run INSTALL-DESKTOP-ICON.ps1 to create desktop shortcut
5. Double-click "Medical Report Agent" icon to launch

## Usage
1. System auto-selects first patient as "Current patient"
2. Upload optional patient documents (Word/Excel/PDF)
3. Select report type (6 options)
4. Choose output format (Word/PDF/Both)
5. Click "Generate Report" - opens automatically
6. Access previous reports in "Recent Reports" tab
7. Configure training data path in Settings
8. Click "Start Training" to retrain on your reports

## API Configuration
API Key stored in: `~/MEDMCQ261225/medical-report-agent/set_api_key.local.sh`
Model: claude-opus-4-5-20251101 (8000 max tokens)

---

# Complete Code Files Below
"""
Medical Report Agent - Modern Web Interface
Flask-based GUI with 2026 design aesthetic
"""

from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
import webbrowser
import threading
import tempfile
from werkzeug.utils import secure_filename

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from style_analyzer import StyleAnalyzer
from report_generator import ReportGenerator
from document_formatter import DocumentFormatter

app = Flask(__name__)
app.config['SECRET_KEY'] = 'medical-report-agent-2026'

# Global state
style_analysis = None
report_generator = None
document_formatter = None
project_root = Path(__file__).parent

def initialize_system():
    """Initialize the report generation system"""
    global style_analysis, report_generator, document_formatter

    example_reports_dir = project_root / "data" / "example_reports"

    print("Initializing Medical Report Agent...")
    analyzer = StyleAnalyzer(example_reports_dir)
    style_analysis = analyzer.analyze_all()

    report_generator = ReportGenerator(style_analysis)
    document_formatter = DocumentFormatter(project_root / "output")

    print("System ready!")
    return True

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/patients')
def get_patients():
    """Get list of patients"""
    try:
        patient_db_path = project_root / "data" / "patient_db" / "patients.json"
        with open(patient_db_path, 'r') as f:
            patients = json.load(f)
        return jsonify({'success': True, 'patients': patients})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/settings')
def get_settings():
    """Get current settings"""
    try:
        settings = {
            'example_reports_path': str(project_root / "data" / "example_reports"),
            'patient_db_path': str(project_root / "data" / "patient_db" / "patients.json"),
            'output_path': str(project_root / "output"),
            'num_example_reports': len(list((project_root / "data" / "example_reports").glob("*.txt")))
        }
        return jsonify({'success': True, 'settings': settings})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/generate', methods=['POST'])
def generate_report():
    """Generate a medical report"""
    try:
        data = request.json
        patient_id = data.get('patient_id')
        output_format = data.get('format', 'both')
        report_type = data.get('report_type', 'parent-full')
        uploaded_data = data.get('uploaded_data', [])  # Get uploaded file content

        if not patient_id:
            return jsonify({'success': False, 'error': 'Patient ID required'})

        # Load patient data
        patient_db_path = project_root / "data" / "patient_db" / "patients.json"
        with open(patient_db_path, 'r') as f:
            patients = json.load(f)

        patient_data = next((p for p in patients if p['patient_id'] == patient_id), None)
        if not patient_data:
            return jsonify({'success': False, 'error': f'Patient {patient_id} not found'})

        # Add uploaded data to patient data if provided
        if uploaded_data:
            additional_info = "\n\n=== Additional Patient Data ===\n"
            for file_info in uploaded_data:
                additional_info += f"\n--- {file_info['filename']} ---\n"
                additional_info += file_info['content'] + "\n"

            # Store it temporarily in patient data
            patient_data['additional_documents'] = additional_info

        # Generate report
        report_data = report_generator.generate_report(
            patient_id=patient_id,
            patient_db_path=str(patient_db_path),
            example_reports_dir=str(project_root / "data" / "example_reports"),
            additional_context=patient_data.get('additional_documents', ''),
            report_type=report_type
        )

        # Format documents
        outputs = document_formatter.format_report(
            report_data,
            patient_data,
            format=output_format
        )

        # Convert paths to strings
        output_files = {
            'word': str(outputs.get('word', '')) if outputs.get('word') else None,
            'pdf': str(outputs.get('pdf', '')) if outputs.get('pdf') else None
        }

        return jsonify({
            'success': True,
            'patient_name': patient_data['name'],
            'files': output_files,
            'content_preview': report_data['content'][:500]
        })

    except Exception as e:
        import traceback
        return jsonify({'success': False, 'error': str(e), 'traceback': traceback.format_exc()})

@app.route('/api/open-file', methods=['POST'])
def open_file():
    """Open a file in the default application"""
    try:
        data = request.json
        file_path = data.get('file_path')

        if not file_path or not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'File not found'})

        # Check if running in WSL
        is_wsl = 'microsoft' in os.uname().release.lower() if hasattr(os, 'uname') else False

        # Open file in default application
        if is_wsl or sys.platform == 'win32':
            # WSL or Windows - convert to Windows path and open
            try:
                # Convert WSL path to Windows path
                result = subprocess.run(['wslpath', '-w', file_path],
                                      capture_output=True, text=True, check=True)
                windows_path = result.stdout.strip()

                # Open using cmd.exe from WSL
                subprocess.run(['cmd.exe', '/c', 'start', '', windows_path],
                             shell=False, check=False)
                return jsonify({'success': True})
            except Exception as e:
                return jsonify({'success': False, 'error': f'Failed to open file: {str(e)}'})
        elif sys.platform == 'darwin':
            subprocess.run(['open', file_path])
        else:
            subprocess.run(['xdg-open', file_path])

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/recent-reports')
def get_recent_reports():
    """Get list of recent reports"""
    try:
        output_dir = project_root / "output"
        if not output_dir.exists():
            return jsonify({'success': True, 'reports': []})

        reports = []
        for file in output_dir.glob("report_*.docx"):
            stat = file.stat()
            reports.append({
                'name': file.name,
                'path': str(file),
                'size': stat.st_size,
                'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            })

        # Sort by modified time, newest first
        reports.sort(key=lambda x: x['modified'], reverse=True)

        return jsonify({'success': True, 'reports': reports[:10]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/upload-patient-data', methods=['POST'])
def upload_patient_data():
    """Handle patient data file uploads"""
    try:
        if 'files' not in request.files:
            return jsonify({'success': False, 'error': 'No files provided'})

        files = request.files.getlist('files')
        uploaded_files = []

        # Create temp directory for this session
        temp_dir = tempfile.mkdtemp(prefix='patient_data_')

        for file in files:
            if file.filename == '':
                continue

            # Secure the filename
            filename = secure_filename(file.filename)
            file_path = os.path.join(temp_dir, filename)

            # Save the file
            file.save(file_path)

            # Extract text content based on file type
            content = extract_file_content(file_path, filename)

            uploaded_files.append({
                'filename': filename,
                'path': file_path,
                'size': os.path.getsize(file_path),
                'content': content,
                'type': get_file_type(filename)
            })

        return jsonify({
            'success': True,
            'files': uploaded_files,
            'temp_dir': temp_dir
        })

    except Exception as e:
        import traceback
        return jsonify({'success': False, 'error': str(e), 'traceback': traceback.format_exc()})

def get_file_type(filename):
    """Get file type from extension"""
    ext = filename.lower().split('.')[-1]
    if ext in ['doc', 'docx']:
        return 'word'
    elif ext in ['xls', 'xlsx']:
        return 'excel'
    elif ext == 'pdf':
        return 'pdf'
    else:
        return 'unknown'

def extract_file_content(file_path, filename):
    """Extract text content from uploaded files"""
    try:
        ext = filename.lower().split('.')[-1]

        if ext in ['docx', 'doc']:
            # Extract from Word document
            try:
                from docx import Document
                doc = Document(file_path)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                return '\n'.join(paragraphs)
            except Exception as e:
                return f"[Word document: {filename} - Content extraction requires python-docx]"

        elif ext in ['xlsx', 'xls']:
            # Extract from Excel
            try:
                import pandas as pd
                df = pd.read_excel(file_path)
                return df.to_string()
            except Exception as e:
                return f"[Excel document: {filename} - Content extraction requires pandas and openpyxl]"

        elif ext == 'pdf':
            # Extract from PDF
            try:
                import PyPDF2
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    text = []
                    for page in pdf_reader.pages:
                        text.append(page.extract_text())
                    return '\n'.join(text)
            except Exception as e:
                return f"[PDF document: {filename} - Content extraction requires PyPDF2]"

        else:
            # Try to read as plain text
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()

    except Exception as e:
        return f"[Error reading {filename}: {str(e)}]"

@app.route('/api/train', methods=['POST'])
def train_agent():
    """Train the AI agent on the current training data"""
    try:
        data = request.json
        training_path = data.get('training_path')

        if not training_path or training_path == '--':
            training_path = str(project_root / "data" / "example_reports")

        # Convert Windows path to WSL path if needed
        if training_path.startswith('C:') or training_path.startswith('\\'):
            # This is a Windows path, need to convert
            # For now, use the default path
            training_path = str(project_root / "data" / "example_reports")

        training_dir = Path(training_path)
        if not training_dir.exists():
            return jsonify({'success': False, 'error': 'Training data path does not exist'})

        # Reinitialize the style analyzer with new data
        print(f"\nTraining AI agent on data from: {training_path}")
        analyzer = StyleAnalyzer(training_dir)
        global style_analysis, report_generator
        style_analysis = analyzer.analyze_all()
        report_generator = ReportGenerator(style_analysis)

        # Count the number of reports
        num_reports = len(list(training_dir.glob("*.txt")))

        print(f"✓ Training complete! Analyzed {num_reports} reports.")

        return jsonify({
            'success': True,
            'num_reports': num_reports,
            'training_path': str(training_path)
        })

    except Exception as e:
        import traceback
        return jsonify({'success': False, 'error': str(e), 'traceback': traceback.format_exc()})

@app.route('/api/update-training-path', methods=['POST'])
def update_training_path():
    """Update the training data path"""
    try:
        data = request.json
        new_path = data.get('training_path')

        if not new_path:
            return jsonify({'success': False, 'error': 'No path provided'})

        # Convert Windows path to WSL path if needed
        if new_path.startswith('C:') or new_path.startswith('\\'):
            # Try to convert Windows path to WSL path
            try:
                # Remove drive letter and convert backslashes
                if new_path[1] == ':':
                    drive = new_path[0].lower()
                    path_part = new_path[2:].replace('\\', '/')
                    wsl_path = f"/mnt/{drive}{path_part}"
                    new_path = wsl_path
            except Exception:
                return jsonify({'success': False, 'error': 'Could not convert Windows path to WSL path'})

        path_obj = Path(new_path)
        if not path_obj.exists():
            return jsonify({'success': False, 'error': f'Path does not exist: {new_path}'})

        if not path_obj.is_dir():
            return jsonify({'success': False, 'error': 'Path is not a directory'})

        # Count reports in new path
        num_reports = len(list(path_obj.glob("*.txt")))

        if num_reports == 0:
            return jsonify({'success': False, 'error': 'No .txt files found in specified directory'})

        return jsonify({
            'success': True,
            'training_path': str(new_path),
            'num_reports': num_reports
        })

    except Exception as e:
        import traceback
        return jsonify({'success': False, 'error': str(e), 'traceback': traceback.format_exc()})

@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('static', path)

def open_browser():
    """Open browser after a short delay"""
    import time
    time.sleep(1.5)
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == '__main__':
    print("="*60)
    print("Medical Report Agent - Web Interface")
    print("Modern 2026 Design")
    print("="*60)
    print()

    # Initialize system
    initialize_system()

    # Open browser
    threading.Thread(target=open_browser, daemon=True).start()

    print()
    print("Opening web interface at http://127.0.0.1:5000")
    print("Press Ctrl+C to stop")
    print()

    # Run Flask
    app.run(host='127.0.0.1', port=5000, debug=False)


---


