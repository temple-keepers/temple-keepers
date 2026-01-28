// Pre-dev cleanup script
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function cleanup() {
  try {
    console.log('🧹 Cleaning up stale processes...')
    
    // Kill processes on ports 5173-5176
    const ports = [5173, 5174, 5175, 5176]
    
    for (const port of ports) {
      try {
        if (process.platform === 'win32') {
          await execAsync(`powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`)
        } else {
          await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`)
        }
      } catch (err) {
        // Ignore errors - port might not be in use
      }
    }
    
    console.log('✅ Cleanup complete')
  } catch (error) {
    console.log('⚠️  Cleanup skipped')
  }
}

cleanup()
