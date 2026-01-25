// Medical Report Agent - JavaScript
// Modern 2026 Interactive Interface

let patients = [];
let selectedPatient = null;
let currentWordFile = null;
let currentPdfFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadPatients();
    loadSettings();
    loadRecentReports();

    // Event listeners
    document.getElementById('patient-select').addEventListener('change', handlePatientSelect);
    document.getElementById('generate-btn').addEventListener('click', handleGenerateReport);
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding view
            const viewName = item.getAttribute('data-view');
            showView(viewName);
        });
    });
}

function showView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');

        // Load data for specific views
        if (viewName === 'patients') {
            displayPatients();
        } else if (viewName === 'recent') {
            loadRecentReports();
        } else if (viewName === 'settings') {
            loadSettings();
        }
    }
}

// Load Patients
async function loadPatients() {
    try {
        const response = await fetch('/api/patients');
        const data = await response.json();

        if (data.success) {
            patients = data.patients;
            populatePatientSelect();
            updatePatientsCount();
        } else {
            showToast('Error loading patients: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Error loading patients: ' + error.message, 'error');
    }
}

function populatePatientSelect() {
    const select = document.getElementById('patient-select');
    select.innerHTML = '<option value="">Select a patient...</option>';

    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.patient_id;
        option.textContent = `${patient.patient_id} - ${patient.name} (${patient.age}, ${patient.gender})`;
        select.appendChild(option);
    });
}

function handlePatientSelect(e) {
    const patientId = e.target.value;

    if (!patientId) {
        document.getElementById('patient-info').style.display = 'none';
        selectedPatient = null;
        return;
    }

    selectedPatient = patients.find(p => p.patient_id === patientId);

    if (selectedPatient) {
        displayPatientInfo(selectedPatient);
    }
}

function displayPatientInfo(patient) {
    document.getElementById('patient-age').textContent = patient.age;
    document.getElementById('patient-gender').textContent = patient.gender;
    document.getElementById('patient-date').textContent = patient.date_of_assessment;
    document.getElementById('patient-tests').textContent = patient.tests.length;
    document.getElementById('patient-info').style.display = 'block';
}

// Display all patients
function displayPatients() {
    const container = document.getElementById('patients-list');
    container.innerHTML = '';

    patients.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <h3>${patient.name}</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Patient ID</span>
                    <span class="info-value">${patient.patient_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Age</span>
                    <span class="info-value">${patient.age}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gender</span>
                    <span class="info-value">${patient.gender}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tests</span>
                    <span class="info-value">${patient.tests.length}</span>
                </div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                Assessment: ${patient.date_of_assessment}
            </p>
        `;

        card.addEventListener('click', () => {
            showView('generate');
            document.getElementById('patient-select').value = patient.patient_id;
            displayPatientInfo(patient);
            selectedPatient = patient;
        });

        container.appendChild(card);
    });
}

// Generate Report
async function handleGenerateReport() {
    if (!selectedPatient) {
        showToast('Please select a patient first', 'error');
        return;
    }

    const format = document.querySelector('input[name="format"]:checked').value;
    const btn = document.getElementById('generate-btn');

    // Show loading
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span><span>Generating...</span>';
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('results').style.display = 'none';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patient_id: selectedPatient.patient_id,
                format: format
            })
        });

        const data = await response.json();

        if (data.success) {
            displayResults(data, format);
            showToast('Report generated successfully!', 'success');

            // Auto-open the report
            setTimeout(() => {
                if (format === 'word' || format === 'both') {
                    openFile(data.files.word);
                } else if (format === 'pdf') {
                    openFile(data.files.pdf);
                }
            }, 500);
        } else {
            showToast('Error generating report: ' + data.error, 'error');
            console.error(data.traceback);
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">✨</span><span>Generate Report</span>';
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

function displayResults(data, format) {
    const resultsDiv = document.getElementById('results');
    document.getElementById('results-patient').textContent = `Report for ${data.patient_name}`;

    // Show Word file
    if (data.files.word) {
        currentWordFile = data.files.word;
        const wordDiv = document.getElementById('word-file');
        wordDiv.style.display = 'flex';
        wordDiv.querySelector('.file-path').textContent = data.files.word;

        const wordBtn = wordDiv.querySelector('.btn-open-word');
        wordBtn.onclick = () => openFile(data.files.word);
    } else {
        document.getElementById('word-file').style.display = 'none';
    }

    // Show PDF file
    if (data.files.pdf) {
        currentPdfFile = data.files.pdf;
        const pdfDiv = document.getElementById('pdf-file');
        pdfDiv.style.display = 'flex';
        pdfDiv.querySelector('.file-path').textContent = data.files.pdf;

        const pdfBtn = pdfDiv.querySelector('.btn-open-pdf');
        pdfBtn.onclick = () => openFile(data.files.pdf);
    } else {
        document.getElementById('pdf-file').style.display = 'none';
    }

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Open file in default application
async function openFile(filePath) {
    try {
        const response = await fetch('/api/open-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_path: filePath
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Opening file...', 'success');
        } else {
            showToast('Error opening file: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Recent Reports
async function loadRecentReports() {
    try {
        const response = await fetch('/api/recent-reports');
        const data = await response.json();

        if (data.success) {
            displayRecentReports(data.reports);
        }
    } catch (error) {
        console.error('Error loading recent reports:', error);
    }
}

function displayRecentReports(reports) {
    const container = document.getElementById('recent-list');

    if (reports.length === 0) {
        container.innerHTML = '<div class="loading">No reports generated yet</div>';
        return;
    }

    container.innerHTML = '';

    reports.forEach(report => {
        const item = document.createElement('div');
        item.className = 'report-item';
        item.innerHTML = `
            <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${report.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${report.modified} • ${formatFileSize(report.size)}
                </div>
            </div>
            <button class="btn-secondary" onclick="openFile('${report.path}')">
                Open
            </button>
        `;
        container.appendChild(item);
    });
}

// Settings
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data.success) {
            document.getElementById('training-path').textContent = data.settings.example_reports_path;
            document.getElementById('patient-db-path').textContent = data.settings.patient_db_path;
            document.getElementById('output-path').textContent = data.settings.output_path;
            document.getElementById('style-count').textContent = data.settings.num_example_reports;
            document.getElementById('training-files-count').textContent = data.settings.num_example_reports;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function openOutputFolder() {
    const outputPath = document.getElementById('output-path').textContent;
    openFile(outputPath);
}

// Update counts
function updatePatientsCount() {
    document.getElementById('patients-count').textContent = patients.length;
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
