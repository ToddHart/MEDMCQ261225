"""
Report Generator - Creates medical reports using learned style and patient data
Uses AI to generate reports matching the learned writing style
"""

import json
import os
from pathlib import Path
from datetime import datetime


class ReportGenerator:
    """Generates medical reports using learned style patterns and patient data"""

    def __init__(self, style_analysis, use_local_model=False):
        self.style_analysis = style_analysis
        self.use_local_model = use_local_model
        self.api_client = None

        # Initialize AI client (local or API)
        if not use_local_model:
            try:
                import anthropic
                api_key = os.environ.get("ANTHROPIC_API_KEY")
                if api_key:
                    self.api_client = anthropic.Anthropic(api_key=api_key)
                    print("✓ Using Claude API (for prototype - will use local model in production)")
                else:
                    print("⚠ No API key found - will use template-based generation")
            except ImportError:
                print("⚠ Anthropic library not installed - using template-based generation")
        else:
            print("Using local model (Ollama/LM Studio)")

    def load_patient_data(self, patient_id, patient_db_path):
        """Load patient data from database"""
        with open(patient_db_path, 'r') as f:
            patients = json.load(f)

        for patient in patients:
            if patient['patient_id'] == patient_id:
                return patient

        raise ValueError(f"Patient {patient_id} not found in database")

    def generate_with_ai(self, patient_data, example_reports):
        """Generate report using AI (Claude API or local model)"""

        # Create prompt that teaches the AI the style
        style_examples = "\n\n---EXAMPLE REPORT---\n\n".join([
            report['content'] for report in example_reports[:3]  # Use first 3 as examples
        ])

        prompt = f"""You are a clinical psychologist writing a psychological assessment report.

I will show you examples of how I write reports, then give you patient data to create a new report.

EXAMPLE REPORTS (showing my writing style, structure, tone, and format):

---EXAMPLE REPORT---

{style_examples}

---END EXAMPLES---

Now, write a NEW psychological assessment report for this patient, using the EXACT same style, structure, tone, and formatting as shown in the examples above:

PATIENT DATA:
{json.dumps(patient_data, indent=2)}

IMPORTANT INSTRUCTIONS:
1. Match the writing style, tone, and formality of the example reports
2. Use similar section headers and organization
3. Use similar language patterns and clinical terminology
4. Format the report professionally
5. Be thorough but concise
6. Include all relevant test data
7. Provide clinical interpretation of results
8. Make appropriate recommendations
9. Use [REDACTED] for examiner name and license info at the end
10. The report should look like it came from the same psychologist who wrote the examples

Write the complete report now:"""

        if self.api_client:
            try:
                response = self.api_client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4000,
                    messages=[{
                        "role": "user",
                        "content": prompt
                    }]
                )
                return response.content[0].text
            except Exception as e:
                print(f"⚠ API error: {e}")
                print("Falling back to template-based generation...")
                return self._generate_template_based(patient_data)
        else:
            return self._generate_template_based(patient_data)

    def _generate_template_based(self, patient_data):
        """Fallback: Generate report using template (when AI not available)"""

        template = self.style_analysis['template']

        # Build report sections
        report = f"""PSYCHOLOGICAL ASSESSMENT REPORT

IDENTIFYING INFORMATION:
Patient ID: {patient_data['patient_id']}
Age: {patient_data['age']} years
Gender: {patient_data['gender']}
Date of Assessment: {patient_data['date_of_assessment']}

TESTS ADMINISTERED:
"""

        for test in patient_data['tests']:
            report += f"• {test['test_name']} ({test['test_code']})\n"

        report += "\nBEHAVIORAL OBSERVATIONS:\n"
        report += "The patient presented as cooperative throughout the assessment process. Effort appeared adequate and results are considered valid.\n"

        report += "\nTEST RESULTS AND INTERPRETATION:\n\n"

        for test in patient_data['tests']:
            report += f"{test['test_name']}:\n"

            # Add scores
            if 'scores' in test:
                for key, value in test['scores'].items():
                    report += f"  {key.replace('_', ' ').title()}: {value}\n"
            elif 'score' in test:
                report += f"  Score: {test['score']}\n"

            if 'percentile' in test:
                report += f"  Percentile: {test['percentile']}\n"

            if 'interpretation' in test:
                report += f"\nInterpretation: {test['interpretation']}\n"

            report += "\n"

        report += f"\nCLINICAL NOTES:\n{patient_data.get('clinical_notes', 'No additional notes.')}\n"

        report += "\nRECOMMENDATIONS:\n"
        report += "1. Follow-up assessment as clinically indicated\n"
        report += "2. Consider appropriate interventions based on findings\n"
        report += "3. Monitor progress over time\n"

        report += "\n\n_______________________\n"
        report += "[REDACTED], Psy.D.\n"
        report += "Licensed Clinical Psychologist\n"

        return report

    def generate_report(self, patient_id, patient_db_path, example_reports_dir):
        """Main method to generate a complete report"""
        print(f"\n{'='*60}")
        print(f"Generating Report for Patient: {patient_id}")
        print(f"{'='*60}\n")

        # Load patient data
        print("Loading patient data...")
        patient_data = self.load_patient_data(patient_id, patient_db_path)
        print(f"✓ Loaded data for {patient_data['name']}")
        print(f"  Tests: {len(patient_data['tests'])} assessments")

        # Load example reports for style reference
        print("\nLoading example reports for style reference...")
        example_reports = []
        example_dir = Path(example_reports_dir)
        for report_file in list(example_dir.glob("*.txt"))[:5]:  # Use 5 examples
            with open(report_file, 'r') as f:
                example_reports.append({
                    'filename': report_file.name,
                    'content': f.read()
                })
        print(f"✓ Loaded {len(example_reports)} example reports for style reference")

        # Generate report
        print("\nGenerating report using learned style...")
        report_content = self.generate_with_ai(patient_data, example_reports)

        print(f"\n{'='*60}")
        print("Report Generation Complete!")
        print(f"{'='*60}")

        return {
            'patient_id': patient_id,
            'patient_name': patient_data['name'],
            'content': report_content,
            'generated_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }


if __name__ == "__main__":
    # Test report generation
    from style_analyzer import StyleAnalyzer

    # First analyze style
    analyzer = StyleAnalyzer("../data/example_reports")
    style_analysis = analyzer.analyze_all()

    # Then generate a report
    generator = ReportGenerator(style_analysis)
    report = generator.generate_report(
        patient_id="PT001",
        patient_db_path="../data/patient_db/patients.json",
        example_reports_dir="../data/example_reports"
    )

    print("\n" + "="*60)
    print("GENERATED REPORT PREVIEW:")
    print("="*60)
    print(report['content'][:500] + "...")
