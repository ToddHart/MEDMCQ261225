"""
Style Analyzer - Learns writing patterns from example reports
This module analyzes example reports to extract style, structure, and formatting patterns
"""

import os
import re
from collections import Counter
from pathlib import Path


class StyleAnalyzer:
    """Analyzes example reports to learn writing style patterns"""

    def __init__(self, example_reports_dir):
        self.example_reports_dir = Path(example_reports_dir)
        self.reports = []
        self.style_patterns = {}

    def load_reports(self):
        """Load all example reports from directory"""
        print(f"Loading example reports from {self.example_reports_dir}...")

        for report_file in self.example_reports_dir.glob("*.txt"):
            with open(report_file, 'r', encoding='utf-8') as f:
                content = f.read()
                self.reports.append({
                    'filename': report_file.name,
                    'content': content
                })

        print(f"Loaded {len(self.reports)} example reports")
        return len(self.reports)

    def analyze_structure(self):
        """Analyze structural patterns in reports"""
        print("\nAnalyzing report structure patterns...")

        structures = {
            'sections': [],
            'headers': [],
            'common_patterns': []
        }

        for report in self.reports:
            content = report['content']

            # Extract headers (lines in all caps or with specific patterns)
            headers = re.findall(r'^([A-Z\s]{3,}:?)\s*$', content, re.MULTILINE)
            headers.extend(re.findall(r'^([A-Z][A-Za-z\s]+:)\s*$', content, re.MULTILINE))
            structures['headers'].extend(headers)

            # Find common section markers
            sections = re.findall(r'(?:REASON|PURPOSE|BACKGROUND|TESTS?|RESULTS?|FINDINGS?|SUMMARY|RECOMMENDATIONS?|IMPRESSION)', content, re.IGNORECASE)
            structures['sections'].extend(sections)

        # Count most common patterns
        self.style_patterns['common_headers'] = Counter(structures['headers']).most_common(15)
        self.style_patterns['common_sections'] = Counter(structures['sections']).most_common(10)

        print(f"  Found {len(set(structures['headers']))} unique header patterns")
        print(f"  Found {len(set(structures['sections']))} unique section types")

        return structures

    def analyze_tone_and_language(self):
        """Analyze language patterns, tone, and vocabulary"""
        print("\nAnalyzing tone and language patterns...")

        vocabulary = {
            'formal_indicators': [],
            'clinical_terms': [],
            'connectors': [],
            'descriptors': []
        }

        # Combine all report text
        all_text = " ".join([r['content'] for r in self.reports])

        # Formal language indicators
        formal_phrases = re.findall(r'\b(demonstrates?|indicates?|suggests?|reveals?|presents?)\b', all_text, re.IGNORECASE)
        vocabulary['formal_indicators'] = Counter(formal_phrases).most_common(10)

        # Common clinical descriptors
        descriptors = re.findall(r'\b(mild|moderate|severe|significant|average|above average|below average|adequate|impaired)\b', all_text, re.IGNORECASE)
        vocabulary['descriptors'] = Counter(descriptors).most_common(10)

        # Identify person/tense usage
        person_indicators = {
            'third_person': len(re.findall(r'\b(the (?:patient|client|individual|examinee))\b', all_text, re.IGNORECASE)),
            'first_person': len(re.findall(r'\b(I |my |we )\b', all_text)),
        }

        self.style_patterns['vocabulary'] = vocabulary
        self.style_patterns['person'] = 'third_person' if person_indicators['third_person'] > person_indicators['first_person'] else 'mixed'

        print(f"  Detected writing style: {self.style_patterns['person']}")
        print(f"  Found {len(vocabulary['descriptors'])} common descriptors")

        return vocabulary

    def analyze_formatting(self):
        """Analyze formatting patterns"""
        print("\nAnalyzing formatting patterns...")

        formatting = {
            'bullet_usage': 0,
            'numbered_lists': 0,
            'separators': 0,
            'subsections': 0
        }

        for report in self.reports:
            content = report['content']

            # Count formatting elements
            formatting['bullet_usage'] += len(re.findall(r'[•▸★✓→-]\s', content))
            formatting['numbered_lists'] += len(re.findall(r'^\s*\d+[\.)]\s', content, re.MULTILINE))
            formatting['separators'] += len(re.findall(r'^[━═_-]{3,}', content, re.MULTILINE))
            formatting['subsections'] += len(re.findall(r'^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*:\s*$', content, re.MULTILINE))

        self.style_patterns['formatting'] = formatting

        print(f"  Bullet points used in reports: {formatting['bullet_usage']} times")
        print(f"  Numbered lists: {formatting['numbered_lists']} instances")
        print(f"  Visual separators: {formatting['separators']} instances")

        return formatting

    def get_report_template(self):
        """Generate a template based on analyzed patterns"""
        print("\nGenerating report template from learned patterns...")

        # Determine most common structure
        template = {
            'title_style': 'formal',  # Based on most reports having formal titles
            'sections': [
                'IDENTIFYING INFORMATION',
                'REASON FOR REFERRAL',
                'TESTS ADMINISTERED',
                'BEHAVIORAL OBSERVATIONS',
                'TEST RESULTS',
                'SUMMARY',
                'RECOMMENDATIONS'
            ],
            'tone': self.style_patterns.get('person', 'third_person'),
            'use_bullets': self.style_patterns['formatting']['bullet_usage'] > 50,
            'use_separators': self.style_patterns['formatting']['separators'] > 5,
        }

        return template

    def analyze_all(self):
        """Run complete style analysis"""
        print("\n" + "="*60)
        print("STYLE ANALYSIS - Learning from Example Reports")
        print("="*60)

        self.load_reports()
        self.analyze_structure()
        self.analyze_tone_and_language()
        self.analyze_formatting()

        template = self.get_report_template()

        print("\n" + "="*60)
        print("Style Analysis Complete!")
        print("="*60)

        return {
            'style_patterns': self.style_patterns,
            'template': template,
            'num_reports_analyzed': len(self.reports)
        }


if __name__ == "__main__":
    # Test the analyzer
    analyzer = StyleAnalyzer("../data/example_reports")
    results = analyzer.analyze_all()

    print("\n\nLearned Style Summary:")
    print(f"- Analyzed {results['num_reports_analyzed']} reports")
    print(f"- Writing style: {results['template']['tone']}")
    print(f"- Uses bullet points: {results['template']['use_bullets']}")
    print(f"- Template sections: {len(results['template']['sections'])}")
