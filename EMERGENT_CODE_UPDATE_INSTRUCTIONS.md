# COMPLETE CODE UPDATE INSTRUCTIONS FOR EMERGENT SUPPORT

**Repository:** ToddHart/MEDMCQ261225
**GitHub Branch:** main (all code is already merged and up to date)
**Issue:** Emergent deployment is not syncing with GitHub repository

---

## REQUEST TO EMERGENT SUPPORT

Please update the following 5 files in the Emergent deployment to match the code from the GitHub main branch. All changes are listed below with exact line numbers and complete code.

---

## FILE 1: frontend/public/index.html

**Location:** Line 6
**Action:** Replace the viewport meta tag

### FIND THIS (Line 6):
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### REPLACE WITH:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
```

**Purpose:** Prevents horizontal scrolling on mobile devices

---

## FILE 2: frontend/src/pages/QuestionsPage.js

**Location:** Line 906
**Action:** Change sticky positioning to prevent header cutoff

### FIND THIS (Line 906):
```javascript
className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-4 sm:py-5 sticky top-0 z-30"
```

### REPLACE WITH:
```javascript
className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-4 sm:py-5 sticky top-16 z-30"
```

**Change:** `top-0` → `top-16`
**Purpose:** Positions question header below the main navigation header on mobile

---

**Location:** Line 693
**Action:** Reduce spacing for session stats

### FIND THIS (Line 693):
```javascript
<div className="mt-2 pt-2 border-t-2 border-gray-200">
```

### REPLACE WITH:
```javascript
<div className="mt-1 pt-1 border-t-2 border-gray-200">
```

**Change:** `mt-2 pt-2` → `mt-1 pt-1`
**Purpose:** Moves session stats higher on the page

---

## FILE 3: frontend/src/pages/HomePage.js

**Action:** Update all 6 feature cards to reduce height

This file has **6 cards** that need 3 changes each (18 total changes):

### CHANGE TYPE 1: Card Padding (appears 6 times)

**FIND:**
```javascript
<div className="bg-white p-3 sm:p-4 rounded-xl
```

**REPLACE WITH:**
```javascript
<div className="bg-white p-2 sm:p-3 rounded-xl
```

**Change:** `p-3 sm:p-4` → `p-2 sm:p-3`

---

### CHANGE TYPE 2: Icon Size (appears 6 times)

**FIND:**
```javascript
<svg className="w-10 h-10 sm:w-16 sm:h-16
```

**REPLACE WITH:**
```javascript
<svg className="w-8 h-8 sm:w-12 sm:h-12
```

**Change:** `w-10 h-10 sm:w-16 sm:h-16` → `w-8 h-8 sm:w-12 sm:h-12`

---

### CHANGE TYPE 3: Heading Size (appears 6 times)

**FIND:**
```javascript
<h3 className="text-sm sm:text-lg font-bold
```

**REPLACE WITH:**
```javascript
<h3 className="text-sm sm:text-base font-bold
```

**Change:** `sm:text-lg` → `sm:text-base`

**Purpose:** Makes home page cards smaller so bottom row headings are visible

---

## FILE 4: frontend/src/index.css

**Action:** Replace entire file contents

### COMPLETE FILE CONTENTS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    overflow-x: hidden !important;
    width: 100%;
    min-height: 100%;
    position: relative;
  }

  body {
    overflow-x: hidden !important;
    width: 100%;
    min-height: 100vh;
    position: relative;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @media (max-width: 1023px) {
    html, body {
      overflow-x: hidden !important;
      max-width: 100vw !important;
      width: 100vw !important;
      position: relative;
    }

    #root {
      overflow-x: hidden !important;
      max-width: 100vw !important;
      width: 100vw !important;
    }

    * {
      max-width: 100vw !important;
    }

    /* Prevent elements from causing horizontal scroll */
    img, svg, video, iframe {
      max-width: 100% !important;
      height: auto;
    }

    /* Ensure buttons and inputs fit within viewport */
    button, input, select, textarea {
      max-width: 100% !important;
    }

    /* Fix any fixed/absolute positioned elements */
    .fixed, [class*="fixed"] {
      max-width: 100vw !important;
    }
  }
}

body {
    margin: 0;
    padding: 0;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden !important;
}

/* Ensure containers don't overflow */
.container {
    max-width: 100% !important;
    overflow-x: hidden !important;
}

/* Mobile-specific improvements for better display */
@media (max-width: 1023px) {
  /* Prevent horizontal scrolling */
  body {
    touch-action: pan-y pinch-zoom;
  }

  /* Ensure proper spacing on mobile */
  .container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  /* Fix button sizing on mobile */
  button {
    min-width: fit-content;
    white-space: nowrap;
  }

  /* Ensure mobile menu doesn't cause overflow */
  nav {
    max-width: 100vw !important;
  }

  /* Prevent text from causing overflow */
  h1, h2, h3, h4, h5, h6, p, span, div {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Fix for modals and dropdowns */
  [role="dialog"], [role="menu"] {
    max-width: calc(100vw - 2rem) !important;
  }
}

code {
    font-family:
        source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
}

@layer base {
    :root {
        --background: 0 0% 100%;
        --foreground: 0 0% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 3.9%;
        --primary: 0 0% 9%;
        --primary-foreground: 0 0% 98%;
        --secondary: 0 0% 96.1%;
        --secondary-foreground: 0 0% 9%;
        --muted: 0 0% 96.1%;
        --muted-foreground: 0 0% 45.1%;
        --accent: 0 0% 96.1%;
        --accent-foreground: 0 0% 9%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 89.8%;
        --input: 0 0% 89.8%;
        --ring: 0 0% 3.9%;
        --chart-1: 12 76% 61%;
        --chart-2: 173 58% 39%;
        --chart-3: 197 37% 24%;
        --chart-4: 43 74% 66%;
        --chart-5: 27 87% 67%;
        --radius: 0.5rem;
    }
    .dark {
        --background: 0 0% 3.9%;
        --foreground: 0 0% 98%;
        --card: 0 0% 3.9%;
        --card-foreground: 0 0% 98%;
        --popover: 0 0% 3.9%;
        --popover-foreground: 0 0% 98%;
        --primary: 0 0% 98%;
        --primary-foreground: 0 0% 9%;
        --secondary: 0 0% 14.9%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 14.9%;
        --muted-foreground: 0 0% 63.9%;
        --accent: 0 0% 14.9%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 14.9%;
        --input: 0 0% 14.9%;
        --ring: 0 0% 83.1%;
        --chart-1: 220 70% 50%;
        --chart-2: 160 60% 45%;
        --chart-3: 30 80% 55%;
        --chart-4: 280 65% 60%;
        --chart-5: 340 75% 55%;
    }
}

@layer base {
    * {
        @apply border-border;
    }
    body {
        @apply bg-background text-foreground;
    }
}

@layer base {
    [data-debug-wrapper="true"] {
        display: contents !important;
    }

    [data-debug-wrapper="true"] > * {
        margin-left: inherit;
        margin-right: inherit;
        margin-top: inherit;
        margin-bottom: inherit;
        padding-left: inherit;
        padding-right: inherit;
        padding-top: inherit;
        padding-bottom: inherit;
        column-gap: inherit;
        row-gap: inherit;
        gap: inherit;
        border-left-width: inherit;
        border-right-width: inherit;
        border-top-width: inherit;
        border-bottom-width: inherit;
        border-left-style: inherit;
        border-right-style: inherit;
        border-top-style: inherit;
        border-bottom-style: inherit;
        border-left-color: inherit;
        border-right-color: inherit;
        border-top-color: inherit;
        border-bottom-color: inherit;
    }
}
```

**Purpose:** Comprehensive mobile overflow fixes to prevent horizontal scrolling

---

## FILE 5: backend/requirements.txt

**Action:** Add two dependencies for multi-format file import

### FIND THIS SECTION (around line 70-72):
```
pandas==2.3.3
passlib==1.7.4
pathspec==0.12.1
pillow==12.0.0
```

### REPLACE WITH:
```
pandas==2.3.3
passlib==1.7.4
pathspec==0.12.1
pdfplumber==0.11.4
python-docx==1.1.2
pillow==12.0.0
```

**Added lines:**
- `pdfplumber==0.11.4` (for PDF parsing)
- `python-docx==1.1.2` (for Word document parsing)

**Purpose:** Enables importing questions from Word and PDF files

---

## VERIFICATION AFTER UPDATE

After making these changes and redeploying, please verify:

1. **Mobile View:** No horizontal scrolling on mobile devices
2. **Question Header:** Double-height header visible on mobile, not cut off at top
3. **Session Stats:** Tighter spacing, positioned higher on sidebar
4. **Home Page Cards:** All 6 cards are smaller, bottom row text visible
5. **File Import:** Can accept .docx, .doc, .pdf, .xlsx, .xls, .csv files with drag-and-drop

---

## ADDITIONAL CONTEXT

All code changes are already present in the GitHub repository:
- **Repository:** https://github.com/ToddHart/MEDMCQ261225
- **Branch:** main
- **Last merge:** PR #11 (merged successfully)

The GitHub repository is up to date. The issue is that Emergent is not syncing with GitHub when "Redeploy" is clicked.

---

## FILES ALREADY CORRECT (NO CHANGES NEEDED)

These files are already up to date in both GitHub and Emergent:
- ✅ `frontend/src/pages/ImportPage.js` (multi-format import with drag-and-drop)
- ✅ `backend/server.py` (Word/PDF parsing logic, line count: 3135 lines)
- ✅ `frontend/src/components/Layout.js` (mobile menu responsive fixes)

---

## SUMMARY OF CHANGES

**Total Files to Update:** 5
**Total Line Changes:** ~25 lines

| File | Changes | Purpose |
|------|---------|---------|
| frontend/public/index.html | 1 line | Mobile viewport lock |
| frontend/src/pages/QuestionsPage.js | 2 lines | Question header positioning & stats spacing |
| frontend/src/pages/HomePage.js | 18 lines (6 cards × 3 changes) | Card sizing |
| frontend/src/index.css | Replace entire file | Mobile overflow prevention |
| backend/requirements.txt | Add 2 lines | PDF/Word parsing libraries |

**Expected outcome:** Mobile view works correctly, no horizontal scroll, question headers display properly, file import supports multiple formats.
