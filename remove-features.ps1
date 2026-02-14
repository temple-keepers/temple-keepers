# ============================================================
# Temple Keepers — Remove Dead features/ Directory
# ============================================================
# 
# Build confirmed: nothing imports from src/features/
# The entire directory is leftover from a planned refactor
# that was abandoned. All live code uses:
#   ./contexts/  ./pages/  ./components/  ./lib/  ./services/
#
# RUN FROM: C:\Users\sagac\temple-keepers-v3
# ============================================================

Write-Host "=== Removing dead features/ directory ===" -ForegroundColor Cyan

if (Test-Path "src\features") {
    $fileCount = (Get-ChildItem -Path "src\features" -Recurse -File).Count
    Write-Host "  Deleting src\features\ ($fileCount files)..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "src\features"
    Write-Host "  Done." -ForegroundColor Green
} else {
    Write-Host "  src\features\ already removed." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Run 'npm run build' to verify." -ForegroundColor Yellow
