# ============================================================
# Temple Keepers — Consolidate features/ into flat structure
# ============================================================
# Moves all actively-imported features/ code into the flat
# structure (services/, hooks/, components/), updates imports
# in all consuming files, then removes features/.
#
# SAFE: No logic changes. Only file moves + import path updates.
# RUN FROM: C:\Users\sagac\temple-keepers-v3
# ============================================================

$ErrorActionPreference = "Stop"
Write-Host "=== Consolidating features/ into flat structure ===" -ForegroundColor Cyan
Write-Host ""

# ──────────────────────────────────────────────────
# STEP 1: Create destination directories
# ──────────────────────────────────────────────────
Write-Host "Step 1: Creating directories..." -ForegroundColor Yellow
@(
    "src\components\fasting",
    "src\components\wellness"
) | ForEach-Object {
    if (!(Test-Path $_)) { 
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "  Created $_" -ForegroundColor DarkGray
    }
}

# ──────────────────────────────────────────────────
# STEP 2: Copy files to new locations
# ──────────────────────────────────────────────────
Write-Host "Step 2: Copying files..." -ForegroundColor Yellow

$moves = @(
    # Services
    @{ From = "src\features\fasting\services\fastingService.js";     To = "src\services\fastingService.js" },
    @{ From = "src\features\wellness\services\wellnessService.js";   To = "src\services\wellnessService.js" },
    @{ From = "src\features\mealplans\services\mealPlanService.js";  To = "src\services\mealPlanService.js" },
    @{ From = "src\features\pods\services\podService.js";            To = "src\services\podService.js" },

    # Hooks
    @{ From = "src\features\fasting\hooks\useFasting.js";            To = "src\hooks\useFasting.js" },
    @{ From = "src\features\wellness\hooks\useCheckIns.js";          To = "src\hooks\useCheckIns.js" },
    @{ From = "src\features\wellness\hooks\useMealLogs.js";          To = "src\hooks\useMealLogs.js" },
    @{ From = "src\features\wellness\hooks\useSymptoms.js";          To = "src\hooks\useSymptoms.js" },

    # Fasting components
    @{ From = "src\features\fasting\components\LiveSessionCard.jsx";     To = "src\components\fasting\LiveSessionCard.jsx" },
    @{ From = "src\features\fasting\components\FastingTracker.jsx";      To = "src\components\fasting\FastingTracker.jsx" },
    @{ From = "src\features\fasting\components\ChangeFastingType.jsx";   To = "src\components\fasting\ChangeFastingType.jsx" },
    @{ From = "src\features\fasting\components\FastingTypeSelector.jsx"; To = "src\components\fasting\FastingTypeSelector.jsx" },

    # Wellness components
    @{ From = "src\features\wellness\components\CheckInForm.jsx";    To = "src\components\wellness\CheckInForm.jsx" },
    @{ From = "src\features\wellness\components\MealLogForm.jsx";    To = "src\components\wellness\MealLogForm.jsx" },
    @{ From = "src\features\wellness\components\SymptomLogForm.jsx"; To = "src\components\wellness\SymptomLogForm.jsx" }
)

foreach ($m in $moves) {
    if (Test-Path $m.From) {
        Copy-Item -Path $m.From -Destination $m.To -Force
        Write-Host "  $($m.From) -> $($m.To)" -ForegroundColor DarkGray
    } else {
        Write-Host "  WARNING: $($m.From) not found!" -ForegroundColor Red
    }
}

# ──────────────────────────────────────────────────
# STEP 3: Fix internal imports in moved files
# ──────────────────────────────────────────────────
Write-Host "Step 3: Fixing internal imports in moved files..." -ForegroundColor Yellow

# fastingService.js: was ../../../lib/supabase -> now ../lib/supabase
$f = "src\services\fastingService.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./lib/supabase'", "from '../lib/supabase'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# wellnessService.js: was ../../../lib/supabase -> now ../lib/supabase
$f = "src\services\wellnessService.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./lib/supabase'", "from '../lib/supabase'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# mealPlanService.js: was ../../../lib/supabase -> now ../lib/supabase
$f = "src\services\mealPlanService.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./lib/supabase'", "from '../lib/supabase'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# podService.js: was ../../../lib/supabase -> now ../lib/supabase
$f = "src\services\podService.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./lib/supabase'", "from '../lib/supabase'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# useFasting.js: was ../services/fastingService -> now ../services/fastingService (same! already correct)
# No change needed

# useCheckIns.js: was ../services/wellnessService -> now ../services/wellnessService (need to fix path)
# Old: from '../services/wellnessService' (relative to features/wellness/hooks/)
# New: from '../services/wellnessService' (relative to hooks/) - same relative path, works!
# But useAuth import changes: from '../../../contexts/AuthContext' -> from '../contexts/AuthContext'
$f = "src\hooks\useCheckIns.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./contexts/AuthContext'", "from '../contexts/AuthContext'" -replace "from '\.\./services/wellnessService'", "from '../services/wellnessService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

$f = "src\hooks\useMealLogs.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./contexts/AuthContext'", "from '../contexts/AuthContext'" -replace "from '\.\./services/wellnessService'", "from '../services/wellnessService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

$f = "src\hooks\useSymptoms.js"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./contexts/AuthContext'", "from '../contexts/AuthContext'" -replace "from '\.\./services/wellnessService'", "from '../services/wellnessService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# FastingTracker.jsx: from '../services/fastingService' -> from '../../services/fastingService'
$f = "src\components\fasting\FastingTracker.jsx"
(Get-Content $f -Raw) -replace "from '\.\./services/fastingService'", "from '../../services/fastingService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# ChangeFastingType.jsx: from './FastingTypeSelector' stays same, but fix supabase + auth
$f = "src\components\fasting\ChangeFastingType.jsx"
(Get-Content $f -Raw) -replace "from '\.\./\.\./\.\./lib/supabase'", "from '../../lib/supabase'" -replace "from '\.\./\.\./\.\./contexts/AuthContext'", "from '../../contexts/AuthContext'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# useFasting.js: from '../services/fastingService' -> from '../services/fastingService' (now relative to hooks/)
$f = "src\hooks\useFasting.js"
(Get-Content $f -Raw) -replace "from '\.\./services/fastingService'", "from '../services/fastingService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# ──────────────────────────────────────────────────
# STEP 4: Update imports in consuming pages
# ──────────────────────────────────────────────────
Write-Host "Step 4: Updating page imports..." -ForegroundColor Yellow

# Today.jsx
$f = "src\pages\Today.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/fasting/components/LiveSessionCard'", "from '../components/fasting/LiveSessionCard'" `
    -replace "from '\.\./features/fasting/hooks/useFasting'", "from '../hooks/useFasting'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# ProgramDay.jsx
$f = "src\pages\ProgramDay.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/fasting/components/FastingTracker'", "from '../components/fasting/FastingTracker'" `
    -replace "from '\.\./features/fasting/components/ChangeFastingType'", "from '../components/fasting/ChangeFastingType'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# ProgramDetail.jsx
$f = "src\pages\ProgramDetail.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/fasting/components/FastingTypeSelector'", "from '../components/fasting/FastingTypeSelector'" `
    -replace "from '\.\./features/fasting/hooks/useFasting'", "from '../hooks/useFasting'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# WellnessHub.jsx
$f = "src\pages\WellnessHub.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/wellness/hooks/useCheckIns'", "from '../hooks/useCheckIns'" `
    -replace "from '\.\./features/wellness/hooks/useMealLogs'", "from '../hooks/useMealLogs'" `
    -replace "from '\.\./features/wellness/hooks/useSymptoms'", "from '../hooks/useSymptoms'" `
    -replace "from '\.\./features/wellness/services/wellnessService'", "from '../services/wellnessService'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# WellnessCheckIn.jsx
$f = "src\pages\WellnessCheckIn.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/wellness/services/wellnessService'", "from '../services/wellnessService'" `
    -replace "from '\.\./features/wellness/components/CheckInForm'", "from '../components/wellness/CheckInForm'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# WellnessMealLog.jsx
$f = "src\pages\WellnessMealLog.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/wellness/services/wellnessService'", "from '../services/wellnessService'" `
    -replace "from '\.\./features/wellness/components/MealLogForm'", "from '../components/wellness/MealLogForm'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# WellnessSymptomLog.jsx
$f = "src\pages\WellnessSymptomLog.jsx"
(Get-Content $f -Raw) `
    -replace "from '\.\./features/wellness/services/wellnessService'", "from '../services/wellnessService'" `
    -replace "from '\.\./features/wellness/components/SymptomLogForm'", "from '../components/wellness/SymptomLogForm'" |
    Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# MealPlans.jsx
$f = "src\pages\MealPlans.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/mealplans/services/mealPlanService'", "from '../services/mealPlanService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# MealPlanBuilder.jsx
$f = "src\pages\MealPlanBuilder.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/mealplans/services/mealPlanService'", "from '../services/mealPlanService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# ShoppingList.jsx
$f = "src\pages\ShoppingList.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/mealplans/services/mealPlanService'", "from '../services/mealPlanService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# Pantry.jsx
$f = "src\pages\Pantry.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/mealplans/services/mealPlanService'", "from '../services/mealPlanService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# RecipeDetail.jsx
$f = "src\pages\RecipeDetail.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/mealplans/services/mealPlanService'", "from '../services/mealPlanService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# Pods.jsx
$f = "src\pages\Pods.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/pods/services/podService'", "from '../services/podService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# PodDetail.jsx
$f = "src\pages\PodDetail.jsx"
(Get-Content $f -Raw) -replace "from '\.\./features/pods/services/podService'", "from '../services/podService'" | Set-Content $f -NoNewline
Write-Host "  Fixed $f" -ForegroundColor DarkGray

# ──────────────────────────────────────────────────
# STEP 5: Remove features/ directory
# ──────────────────────────────────────────────────
Write-Host "Step 5: Removing features/ directory..." -ForegroundColor Yellow
if (Test-Path "src\features") {
    Remove-Item -Recurse -Force "src\features"
    Write-Host "  Deleted src\features\" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "New structure:" -ForegroundColor Cyan
Write-Host "  src/services/   - fastingService, wellnessService, mealPlanService, podService (+ existing)" -ForegroundColor White
Write-Host "  src/hooks/       - useFasting, useCheckIns, useMealLogs, useSymptoms (+ existing)" -ForegroundColor White
Write-Host "  src/components/fasting/   - FastingTracker, ChangeFastingType, FastingTypeSelector, LiveSessionCard" -ForegroundColor White
Write-Host "  src/components/wellness/  - CheckInForm, MealLogForm, SymptomLogForm" -ForegroundColor White
Write-Host ""
Write-Host "Run: npm run build" -ForegroundColor Yellow
