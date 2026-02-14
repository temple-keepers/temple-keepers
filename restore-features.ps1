# ============================================================
# Temple Keepers — Restore features/ and fix imports
# ============================================================
# The features/ directory IS used by pages. We need to either:
# A) Restore features/ from git (best option)
# B) Move all features/ code into the flat structure
#
# Option A is safest. Run from: C:\Users\sagac\temple-keepers-v3
# ============================================================

Write-Host "=== Restoring features/ from git ===" -ForegroundColor Cyan
git checkout -- src/features/
Write-Host "  Restored src/features/" -ForegroundColor Green

# Now fix the one broken import we found earlier
Write-Host "  Fixing wellnessService.js import..." -ForegroundColor Yellow
$file = "src\features\wellness\services\wellnessService.js"
if (Test-Path $file) {
    (Get-Content $file) -replace "from '\.\./\.\./\.\./core/api/supabase'", "from '../../../lib/supabase'" | Set-Content $file
    Write-Host "    Fixed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Run 'npm run build' to verify." -ForegroundColor Yellow
