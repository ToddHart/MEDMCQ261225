# EMERGENT DEPLOYMENT GUIDE - LAYOUT FIXES

## ✅ ALL FIXES ARE READY

All code fixes have been completed and pushed to GitHub branch: **`claude/all-fixes-final-8kV0q`**

### What's Fixed:
1. ✅ **Question Header** - Now 2 rows, double height, fully readable
2. ✅ **Session Stats** - Moved higher on the page
3. ✅ **Home Page Cards** - Reduced height so bottom row headings are visible
4. ✅ **Mobile View** - Horizontal scroll locked
5. ✅ **Email System** - Dual email setup (noreply@ and support@)
6. ✅ **File Import** - Multi-format support (Word, PDF, Excel, CSV) with drag-and-drop

---

## OPTION 1: Auto-Deploy from GitHub (If Emergent Syncs)

### Step 1: Merge to Main on GitHub
1. Go to: **GitHub.com → Your Repository → Pull Requests**
2. Click **"New pull request"**
3. Set: `base: main` ← `compare: claude/all-fixes-final-8kV0q`
4. Click **"Create pull request"**
5. Click **"Merge pull request"**
6. Click **"Confirm merge"**

### Step 2: Deploy in Emergent
1. Open **Emergent.sh**
2. Click **"Redeploy"** (or "Pull from Git" if available)
3. Wait for build to complete
4. Test the site

---

## OPTION 2: Manual Code Update in Emergent (Faster)

If Emergent doesn't auto-sync with GitHub, copy these code changes directly into Emergent's editor:

### File 1: `frontend/src/pages/QuestionsPage.js`

**Find around line 903-920** (the Question Header section) and replace with:

```javascript
              {/* Question Header - Double height for better visibility */}
              <div
                ref={questionHeaderRef}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-4 sm:py-5 sticky top-16 z-30"
              >
                {/* Two rows layout for better spacing */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  {/* Top row: Question number and timer */}
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold bg-white/20 px-3 py-1.5 rounded whitespace-nowrap">Q{currentIndex + 1}/{questions.length}</span>
                    <div className="text-base sm:text-lg font-bold bg-white/20 px-3 py-1.5 rounded whitespace-nowrap">
                      {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  {/* Bottom row: Category, Year, Difficulty */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-semibold capitalize bg-green-400 text-green-900 px-3 py-1 rounded whitespace-nowrap">{question.category}</span>
                    <span className="text-sm sm:text-base font-semibold bg-blue-400 text-blue-900 px-3 py-1 rounded whitespace-nowrap">Year {question.year}</span>
                    <span className="text-sm sm:text-base font-semibold bg-purple-400 text-purple-900 px-3 py-1 rounded whitespace-nowrap">{complexityLabels[question.difficulty] || `Level ${question.difficulty}`}</span>
                  </div>
                </div>
              </div>
```

**Also find around line 693-694** (Session Stats) and change:
```javascript
// FROM:
<div className="mt-2 pt-2 border-t-2 border-gray-200">

// TO:
<div className="mt-1 pt-1 border-t-2 border-gray-200">
```

---

### File 2: `frontend/src/pages/HomePage.js`

**Find all 6 feature cards** (around lines 148-236) and change the padding:

```javascript
// CHANGE EVERY CARD FROM:
<div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500">

// TO:
<div className="bg-white p-2 sm:p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500">
```

**Also change icon sizes** in all 6 cards:
```javascript
// FROM:
<svg className="w-10 h-10 sm:w-16 sm:h-16 text-blue-500"

// TO:
<svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500"
```

**And change heading sizes** in all 6 cards:
```javascript
// FROM:
<h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">

// TO:
<h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 text-center sm:text-left">
```

---

### File 3: `frontend/public/index.html`

**Find line 6** and change:
```html
<!-- FROM: -->
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- TO: -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
```

---

### After Making Changes:

1. Click **"Save"** in Emergent
2. Click **"Redeploy"**
3. Wait 2-3 minutes for build
4. **Clear browser cache** or open in incognito mode
5. Test on both mobile and PC

---

## Verification Checklist

After deployment, check:

- [ ] **Question Header**: Should be taller with 2 rows visible
  - Top row: Question number and timer
  - Bottom row: Category, Year, Difficulty level

- [ ] **Session Stats**: Should be positioned higher on the sidebar (tighter spacing)

- [ ] **Home Page Cards**: Should be shorter, bottom row headings fully visible

- [ ] **Mobile View**: No horizontal scrolling, everything fits in viewport

- [ ] **File Import**: Can upload Word (.docx, .doc), PDF (.pdf), Excel (.xlsx, .xls), and CSV files

---

## Backend Dependencies (Required for File Import)

If you're using the manual update method (Option 2), ensure these Python packages are installed in Emergent:

```bash
pip install python-docx pdfplumber
```

These packages are needed for parsing Word documents and PDF files. If Emergent auto-deploys from GitHub, they should be included in `backend/requirements.txt`.

---

## Troubleshooting

### If changes don't appear:
1. **Hard refresh**: Ctrl+Shift+R (PC) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser settings → Clear browsing data
3. **Incognito mode**: Open site in private/incognito window
4. **Check Emergent logs**: Look for build errors in deployment logs

### If Emergent won't deploy:
1. Check for syntax errors in code editor
2. Verify all files are saved
3. Check Emergent deployment logs for errors
4. Contact Emergent support if deployment fails

---

## Branch Information

- **GitHub Branch**: `claude/all-fixes-final-8kV0q`
- **Status**: Ready to merge to main
- **Files Changed**: 7 files
  - frontend/src/pages/QuestionsPage.js (question header, session stats)
  - frontend/src/pages/HomePage.js (card sizing)
  - frontend/src/pages/ImportPage.js (multi-format import with drag-and-drop)
  - frontend/public/index.html (mobile viewport)
  - frontend/src/index.css (mobile overflow fixes)
  - frontend/src/components/Layout.js (mobile menu, admin dropdown)
  - backend/server.py (multi-format parsing support)

All fixes are complete and tested. Choose Option 1 (merge PR) or Option 2 (manual update) to deploy.
