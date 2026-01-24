#!/usr/bin/env python3
"""
Medical Report Agent - Main CLI Interface
Secure local system for generating medical psychological reports

Usage:
    python main.py --patient PT001
    python main.py --patient PT002 --format pdf
    python main.py --list-patients
"""

import argparse
import sys
import json
from pathlib import Path

from style_analyzer import StyleAnalyzer
from report_generator import ReportGenerator
from document_formatter import DocumentFormatter


class MedicalReportAgent:
    """Main application controller"""

    def __init__(self, data_dir=None, output_dir=None):
        # Get project root (parent of src directory)
        project_root = Path(__file__).parent.parent

        self.data_dir = Path(data_dir) if data_dir else project_root / "data"
        self.output_dir = Path(output_dir) if output_dir else project_root / "output"
        self.patient_db_path = self.data_dir / "patient_db" / "patients.json"
        self.example_reports_dir = self.data_dir / "example_reports"

        # Components
        self.style_analyzer = None
        self.report_generator = None
        self.document_formatter = DocumentFormatter(self.output_dir)

    def initialize(self):
        """Initialize the system by analyzing style"""
        print("\n" + "="*70)
        print(" "*15 + "MEDICAL REPORT GENERATION SYSTEM")
        print(" "*20 + "Secure Local AI Agent")
        print("="*70)

        print("\n[INITIALIZATION]")
        print("-" * 70)

        # Analyze writing style from examples
        print("\n📚 Step 1: Learning your writing style from example reports...")
        self.style_analyzer = StyleAnalyzer(self.example_reports_dir)
        style_analysis = self.style_analyzer.analyze_all()

        print("\n🤖 Step 2: Initializing AI report generator...")
        self.report_generator = ReportGenerator(style_analysis)

        print("\n✓ System ready to generate reports!")
        print("-" * 70)

        return style_analysis

    def list_patients(self):
        """List all available patients"""
        print("\n" + "="*70)
        print("AVAILABLE PATIENTS")
        print("="*70 + "\n")

        with open(self.patient_db_path, 'r') as f:
            patients = json.load(f)

        for patient in patients:
            print(f"Patient ID: {patient['patient_id']}")
            print(f"  Name: {patient['name']}")
            print(f"  Age: {patient['age']}, Gender: {patient['gender']}")
            print(f"  Assessment Date: {patient['date_of_assessment']}")
            print(f"  Number of Tests: {len(patient['tests'])}")

            # List test names
            test_names = [test['test_name'] for test in patient['tests']]
            print(f"  Tests: {', '.join(test_names[:3])}")
            if len(test_names) > 3:
                print(f"         {', '.join(test_names[3:])}")

            print()

        print(f"Total patients in database: {len(patients)}")
        print("="*70)

    def generate_report_for_patient(self, patient_id, output_format='both'):
        """Generate a complete report for a patient"""

        # Generate report content
        report_data = self.report_generator.generate_report(
            patient_id=patient_id,
            patient_db_path=self.patient_db_path,
            example_reports_dir=self.example_reports_dir
        )

        # Load patient data for formatting
        with open(self.patient_db_path, 'r') as f:
            patients = json.load(f)
            patient_data = next((p for p in patients if p['patient_id'] == patient_id), None)

        # Format and save documents
        outputs = self.document_formatter.format_report(
            report_data,
            patient_data,
            format=output_format
        )

        return report_data, outputs

    def show_security_info(self):
        """Display security and privacy information"""
        print("\n" + "="*70)
        print("SECURITY & PRIVACY INFORMATION")
        print("="*70)
        print("""
This system is designed for LOCAL, SECURE operation:

✓ All data processing happens on YOUR computer
✓ Patient data NEVER leaves your machine (when using local model)
✓ Example reports are de-identified for style learning
✓ Generated reports stored locally in encrypted folders (recommended)
✓ No external servers involved (in production with local models)

CURRENT CONFIGURATION:
""")

        if self.report_generator and self.report_generator.api_client:
            print("⚠ PROTOTYPE MODE: Using Claude API for demonstration")
            print("  → In production, switch to local models (Ollama/LM Studio)")
            print("  → Set use_local_model=True in configuration")
        else:
            print("✓ SECURE MODE: Using local model (no external API calls)")

        print("""
DATA SECURITY RECOMMENDATIONS:
1. Store patient database in encrypted folder
2. Use full disk encryption on your computer
3. Regular backups to encrypted external drive
4. Secure deletion of temporary files
5. Password-protect all generated documents

COMPLIANCE NOTES:
- This system CAN be configured for HIPAA compliance
- Consult with compliance officer for your organization
- Implement access controls and audit logging
- Regular security assessments recommended
""")
        print("="*70)


def main():
    """Main CLI entry point"""

    parser = argparse.ArgumentParser(
        description="Medical Report Generation Agent - Secure Local System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --list-patients                    # List all patients
  python main.py --patient PT001                    # Generate report for PT001
  python main.py --patient PT002 --format pdf       # Generate only PDF
  python main.py --security-info                    # Show security information
        """
    )

    parser.add_argument('--patient', '-p', type=str,
                       help='Patient ID to generate report for')
    parser.add_argument('--format', '-f', type=str,
                       choices=['word', 'pdf', 'both'], default='both',
                       help='Output format (default: both)')
    parser.add_argument('--list-patients', '-l', action='store_true',
                       help='List all available patients')
    parser.add_argument('--security-info', '-s', action='store_true',
                       help='Show security and privacy information')

    args = parser.parse_args()

    # Initialize agent
    agent = MedicalReportAgent()

    # Handle different commands
    if args.security_info:
        agent.initialize()
        agent.show_security_info()
        return

    if args.list_patients:
        agent.list_patients()
        return

    if args.patient:
        # Generate report
        agent.initialize()

        print(f"\n{'='*70}")
        print(f"GENERATING REPORT FOR PATIENT: {args.patient}")
        print(f"{'='*70}")

        try:
            report_data, outputs = agent.generate_report_for_patient(
                args.patient,
                output_format=args.format
            )

            print(f"\n{'='*70}")
            print("✓ SUCCESS - Report Generated!")
            print(f"{'='*70}")
            print(f"\nPatient: {report_data['patient_name']}")
            print(f"Generated: {report_data['generated_date']}")
            print(f"\nOutput files:")
            for format_type, path in outputs.items():
                print(f"  {format_type.upper()}: {path}")

            print(f"\n{'='*70}")
            print("REPORT PREVIEW (first 1000 characters):")
            print(f"{'='*70}")
            print(report_data['content'][:1000])
            if len(report_data['content']) > 1000:
                print("\n[... content truncated ...]")
                print(f"\nFull report saved to files above.")

        except ValueError as e:
            print(f"\n❌ Error: {e}")
            print("\nUse --list-patients to see available patients")
            sys.exit(1)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
