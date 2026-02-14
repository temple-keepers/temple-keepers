# ============================================================
# Temple Keepers — Recover deleted features/ files from git
# ============================================================
# RUN FROM: C:\Users\sagac\temple-keepers-v3
# ============================================================

Write-Host "=== Recovering features/ from git history ===" -ForegroundColor Cyan

# Find the last commit that had these files
$lastCommit = git log --all --pretty=format:"%H" -- "src/features/wellness/components/CheckInForm.jsx" | Select-Object -First 1

if ($lastCommit) {
    Write-Host "  Found last commit with features/ files: $lastCommit" -ForegroundColor Green
    
    # Restore ALL features/ files from that commit
    git checkout $lastCommit -- src/features/
    
    Write-Host "  Restored src/features/ from commit $lastCommit" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Could not find features/ files in git history!" -ForegroundColor Red
    Write-Host "  Try: git log --all --diff-filter=D -- 'src/features/'" -ForegroundColor Yellow
}

# Fix the known broken import
$file = "src\features\wellness\services\wellnessService.js"
if (Test-Path $file) {
    (Get-Content $file -Raw) -replace "from '\.\./\.\./\.\./core/api/supabase'", "from '../../../lib/supabase'" | Set-Content $file -NoNewline
    Write-Host "  Fixed wellnessService.js import" -ForegroundColor Green
}

Write-Host ""
Write-Host "Now run: npm run build" -ForegroundColor Yellow
