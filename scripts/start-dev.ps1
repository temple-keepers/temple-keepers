# Kill any existing node processes on ports 5173-5176
Write-Host "Cleaning up ports..." -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 5173,5174,5175,5176 -ErrorAction SilentlyContinue | 
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
