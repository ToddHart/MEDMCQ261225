#!/bin/bash
# Medical Report Agent - Interactive Launcher

# Colors for better UI
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set working directory
cd "$(dirname "$0")"

# Load API key
if [ -f "set_api_key.local.sh" ]; then
    source set_api_key.local.sh
else
    echo -e "${RED}⚠ API key file not found!${NC}"
    echo "Please create set_api_key.local.sh with your API key"
    read -p "Press Enter to exit..."
    exit 1
fi

# Function to show header
show_header() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}     ${GREEN}MEDICAL REPORT GENERATION SYSTEM${NC}               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}          Secure Local AI Agent                        ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to list patients
list_patients() {
    show_header
    echo -e "${YELLOW}Available Patients:${NC}"
    echo ""
    cd src
    python main.py --list-patients
    cd ..
    echo ""
    read -p "Press Enter to continue..."
}

# Function to generate report
generate_report() {
    show_header
    echo -e "${YELLOW}Generate Report${NC}"
    echo ""
    echo -e "Available patients: ${GREEN}PT001, PT002, PT003, PT004, PT005${NC}"
    echo ""
    read -p "Enter Patient ID (e.g., PT001): " patient_id

    if [ -z "$patient_id" ]; then
        echo -e "${RED}No patient ID entered!${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    echo ""
    echo "Select format:"
    echo "  1) Word only"
    echo "  2) PDF only"
    echo "  3) Both formats"
    echo ""
    read -p "Enter choice (1-3): " format_choice

    case $format_choice in
        1) format="word" ;;
        2) format="pdf" ;;
        3) format="both" ;;
        *) format="word" ;;
    esac

    echo ""
    echo -e "${BLUE}Generating report for ${patient_id}...${NC}"
    echo ""

    cd src
    python main.py --patient "$patient_id" --format "$format"
    cd ..

    echo ""
    echo -e "${GREEN}✓ Report generated!${NC}"
    echo ""
    echo "Output location: $(pwd)/output/"
    echo ""

    # Ask if they want to open the output folder
    read -p "Open output folder? (y/n): " open_folder
    if [ "$open_folder" = "y" ] || [ "$open_folder" = "Y" ]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open output/
        elif command -v nautilus &> /dev/null; then
            nautilus output/
        elif command -v dolphin &> /dev/null; then
            dolphin output/
        else
            echo "Output folder: $(pwd)/output/"
        fi
    fi

    echo ""
    read -p "Press Enter to continue..."
}

# Function to show help
show_help() {
    show_header
    echo -e "${YELLOW}How to Use:${NC}"
    echo ""
    echo "1. Select 'List Patients' to see available patients"
    echo "2. Select 'Generate Report' to create a new report"
    echo "3. Enter patient ID (e.g., PT001, PT002)"
    echo "4. Choose output format (Word, PDF, or both)"
    echo "5. Report is saved to the 'output' folder"
    echo ""
    echo -e "${YELLOW}Adding Your Own Data:${NC}"
    echo ""
    echo "• Add patients: Edit data/patient_db/patients.json"
    echo "• Add examples: Add .txt files to data/example_reports/"
    echo ""
    echo -e "${YELLOW}Output Location:${NC}"
    echo "$(pwd)/output/"
    echo ""
    read -p "Press Enter to continue..."
}

# Function to view recent reports
view_recent_reports() {
    show_header
    echo -e "${YELLOW}Recent Reports:${NC}"
    echo ""

    if [ -d "output" ] && [ "$(ls -A output 2>/dev/null)" ]; then
        ls -lht output/ | head -10
    else
        echo "No reports generated yet."
    fi

    echo ""
    read -p "Press Enter to continue..."
}

# Main menu loop
while true; do
    show_header

    echo -e "${YELLOW}Main Menu:${NC}"
    echo ""
    echo "  1) List Patients"
    echo "  2) Generate Report"
    echo "  3) View Recent Reports"
    echo "  4) Help"
    echo "  5) Exit"
    echo ""
    read -p "Enter choice (1-5): " choice

    case $choice in
        1) list_patients ;;
        2) generate_report ;;
        3) view_recent_reports ;;
        4) show_help ;;
        5)
            echo ""
            echo -e "${GREEN}Thank you for using Medical Report Agent!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            sleep 1
            ;;
    esac
done
