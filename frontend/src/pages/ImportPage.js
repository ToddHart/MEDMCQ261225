import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { importQuestions } from '../api/endpoints';
import { useTenant } from '../contexts/TenantContext';

const ImportPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { tenant } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  
  // Update page title
  useEffect(() => {
    document.title = `Import Questions | ${tenantName}`;
  }, [tenantName]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const response = await importQuestions(file);
      setResult(response.data);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to import questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-2">
          <svg className="w-8 h-8 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Import Questions</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Upload your question bank in Excel or CSV format to add them to your personal library.
        </p>
        
        {/* Sample Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Need a Template?</h3>
          <p className="text-blue-800 mb-4">
            Download our sample Excel file to see the correct format for importing questions.
          </p>
          <a
            href="/sample_questions.xlsx"
            download
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Sample Template
          </a>
        </div>

        {/* Template Preview - Visual representation of Excel format */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Template Preview</h3>
          <p className="text-gray-600 mb-4">
            Your Excel file should have these exact column headers and format:
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">question</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">optionA</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">optionB</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">optionC</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">optionD</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">optionE</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">correctAnswer</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">explanation</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">category</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">subCategory</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">year</th>
                  <th className="border border-gray-400 px-2 py-2 font-bold text-green-800">level</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-400 px-2 py-2 max-w-xs truncate">A 65-year-old man with smoking history...</td>
                  <td className="border border-gray-400 px-2 py-2">Asthma</td>
                  <td className="border border-gray-400 px-2 py-2">Chronic bronchitis</td>
                  <td className="border border-gray-400 px-2 py-2">Emphysema</td>
                  <td className="border border-gray-400 px-2 py-2">Bronchiectasis</td>
                  <td className="border border-gray-400 px-2 py-2">Interstitial lung disease</td>
                  <td className="border border-gray-400 px-2 py-2 font-bold text-blue-600">C</td>
                  <td className="border border-gray-400 px-2 py-2 max-w-xs truncate">Emphysema is characterized by...</td>
                  <td className="border border-gray-400 px-2 py-2">respiratory</td>
                  <td className="border border-gray-400 px-2 py-2">COPD</td>
                  <td className="border border-gray-400 px-2 py-2">3</td>
                  <td className="border border-gray-400 px-2 py-2">2</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 px-2 py-2 max-w-xs truncate">A 55-year-old woman presents with chest pain...</td>
                  <td className="border border-gray-400 px-2 py-2">LAD artery</td>
                  <td className="border border-gray-400 px-2 py-2">Circumflex artery</td>
                  <td className="border border-gray-400 px-2 py-2">Right coronary</td>
                  <td className="border border-gray-400 px-2 py-2">Left main</td>
                  <td className="border border-gray-400 px-2 py-2">Posterior descending</td>
                  <td className="border border-gray-400 px-2 py-2 font-bold text-blue-600">C</td>
                  <td className="border border-gray-400 px-2 py-2 max-w-xs truncate">ST-elevation in II, III, aVF indicates...</td>
                  <td className="border border-gray-400 px-2 py-2">cardiology</td>
                  <td className="border border-gray-400 px-2 py-2">Acute Coronary Syndrome</td>
                  <td className="border border-gray-400 px-2 py-2">4</td>
                  <td className="border border-gray-400 px-2 py-2">3</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Column Descriptions */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">Column Descriptions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>question:</strong> The full question text</li>
                <li><strong>optionA-E:</strong> Five answer choices</li>
                <li><strong>correctAnswer:</strong> Letter A, B, C, D, or E</li>
                <li><strong>explanation:</strong> Why the answer is correct</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">Categories and Levels</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>category:</strong> anatomy, biochemistry, cardiology, cardiovascular, dermatology, endocrinology, ent, gastroenterology, gynecology, hematology, immunology, medicine, microbiology, neurology, neuroscience, obstetrics, ophthalmology, orthopedics, pathology, pediatrics, pharmacology, physiology, psychiatry, radiology, renal, respiratory, surgery, urology, general</li>
                <li><strong>subCategory:</strong> Specific topic (e.g., COPD, Arrhythmias)</li>
                <li><strong>year:</strong> Medical school year (1-6)</li>
                <li><strong>level:</strong> 1 (Foundational), 2 (Competent), 3 (Proficient), 4 (Advanced)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Upload Excel or CSV File</h3>
            <p className="text-gray-600 mb-4">
              <strong>Required columns:</strong> question, optionA, optionB, optionC, optionD, optionE, 
              correctAnswer, explanation, category, subCategory, year, level
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: Excel (.xlsx, .xls), CSV (.csv), Word (.docx, .doc), PDF (.pdf)
            </p>

            {/* Drag and Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.docx,.doc,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {dragActive ? 'Drop file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-gray-500 text-sm mb-3">or</p>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {file && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-800 font-medium">{file.name}</span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-1 ml-7">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : (
                'Import Questions'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-900 mb-2">✓ Import Complete!</h2>
            <div className="text-green-800 space-y-1">
              <p><strong>{result.questions_imported}</strong> new questions imported successfully.</p>
              {result.duplicates_skipped > 0 && (
                <p className="text-yellow-700">
                  ⚠️ <strong>{result.duplicates_skipped}</strong> duplicate questions skipped (already in database)
                </p>
              )}
              {result.duplicates_in_file > 0 && (
                <p className="text-yellow-700">
                  ⚠️ <strong>{result.duplicates_in_file}</strong> duplicate questions within file skipped
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Total rows in file: {result.total_in_file}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/questions'}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Practicing →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImportPage;
