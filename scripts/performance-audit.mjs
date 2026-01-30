/**
 * Performance Audit Script
 * Automated performance testing and optimization analysis
 */

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync, mkdirSync } from 'fs'
import { spawn } from 'child_process'

class PerformanceAuditor {
  constructor() {
    this.results = {
      lighthouse: null,
      bundleAnalysis: null,
      loadTesting: null,
      score: 0
    }
    this.chrome = null
  }

  async runAudit() {
    console.log('🚀 Starting Performance Audit...\n')
    
    try {
      // Build the application first
      await this.buildApplication()
      
      // Start development server
      const serverProcess = await this.startDevServer()
      
      // Wait for server to be ready
      await this.waitForServer('http://localhost:5173')
      
      // Run Lighthouse audit
      await this.runLighthouseAudit()
      
      // Analyze bundle size
      await this.analyzeBundleSize()
      
      // Run basic load testing
      await this.runLoadTesting()
      
      // Generate comprehensive report
      await this.generateReport()
      
      // Cleanup
      serverProcess.kill()
      
    } catch (error) {
      console.error('❌ Performance audit failed:', error)
    } finally {
      if (this.chrome) {
        await this.chrome.kill()
      }
    }
  }

  async buildApplication() {
    console.log('🔨 Building application...')
    
    try {
      const result = await this.runCommand('npm run build')
      if (result.code !== 0) {
        throw new Error('Build failed')
      }
      console.log('✅ Build completed successfully')
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`)
    }
  }

  async startDevServer() {
    console.log('🌐 Starting development server...')
    
    return new Promise((resolve, reject) => {
      const server = spawn('npm', ['run', 'preview'], { shell: true })
      
      server.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Local:') || output.includes('localhost')) {
          console.log('✅ Development server started')
          resolve(server)
        }
      })
      
      server.stderr.on('data', (data) => {
        console.error('Server error:', data.toString())
      })
      
      server.on('error', reject)
      
      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Server startup timeout'))
      }, 30000)
    })
  }

  async waitForServer(url, maxAttempts = 30) {
    console.log('⏳ Waiting for server to be ready...')
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          console.log('✅ Server is ready')
          return
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    throw new Error('Server failed to become ready')
  }

  async runLighthouseAudit() {
    console.log('💡 Running Lighthouse audit...')
    
    try {
      // Launch Chrome
      this.chrome = await chromeLauncher.launch({chromeFlags: ['--headless']})
      
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        port: this.chrome.port,
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        }
      }
      
      // Run Lighthouse
      const runnerResult = await lighthouse('http://localhost:5173', options)
      this.results.lighthouse = runnerResult.lhr
      
      console.log('✅ Lighthouse audit completed')
      
      // Display key metrics
      const scores = runnerResult.lhr.categories
      console.log('\n📊 Lighthouse Scores:')
      console.log(`  Performance: ${Math.round(scores.performance.score * 100)}/100`)
      console.log(`  Accessibility: ${Math.round(scores.accessibility.score * 100)}/100`)
      console.log(`  Best Practices: ${Math.round(scores['best-practices'].score * 100)}/100`)
      console.log(`  SEO: ${Math.round(scores.seo.score * 100)}/100`)
      console.log(`  PWA: ${Math.round(scores.pwa.score * 100)}/100`)
      
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message)
      this.results.lighthouse = { error: error.message }
    }
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...')
    
    try {
      const { readdir, stat } = await import('fs/promises')
      const path = await import('path')
      
      const distDir = 'dist'
      const files = await readdir(distDir, { recursive: true })
      
      let totalSize = 0
      const fileAnalysis = []
      
      for (const file of files) {
        try {
          const filePath = path.join(distDir, file)
          const stats = await stat(filePath)
          
          if (stats.isFile()) {
            totalSize += stats.size
            fileAnalysis.push({
              name: file,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024 * 100) / 100
            })
          }
        } catch (error) {
          // Skip files that can't be analyzed
        }
      }
      
      // Sort by size (largest first)
      fileAnalysis.sort((a, b) => b.size - a.size)
      
      this.results.bundleAnalysis = {
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        files: fileAnalysis.slice(0, 10) // Top 10 largest files
      }
      
      console.log('✅ Bundle analysis completed')
      console.log(`  Total bundle size: ${this.results.bundleAnalysis.totalSizeMB} MB`)
      console.log('  Largest files:')
      this.results.bundleAnalysis.files.slice(0, 5).forEach(file => {
        console.log(`    ${file.name}: ${file.sizeKB} KB`)
      })
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message)
      this.results.bundleAnalysis = { error: error.message }
    }
  }

  async runLoadTesting() {
    console.log('⚡ Running basic load testing...')
    
    try {
      const startTime = Date.now()
      const requests = []
      const requestCount = 50
      const concurrency = 10
      
      // Function to make a single request
      const makeRequest = async () => {
        const requestStart = Date.now()
        try {
          const response = await fetch('http://localhost:5173')
          const requestEnd = Date.now()
          
          return {
            status: response.status,
            responseTime: requestEnd - requestStart,
            success: response.ok
          }
        } catch (error) {
          const requestEnd = Date.now()
          return {
            status: 0,
            responseTime: requestEnd - requestStart,
            success: false,
            error: error.message
          }
        }
      }
      
      // Run requests in batches
      const results = []
      for (let i = 0; i < requestCount; i += concurrency) {
        const batch = []
        for (let j = 0; j < concurrency && (i + j) < requestCount; j++) {
          batch.push(makeRequest())
        }
        const batchResults = await Promise.all(batch)
        results.push(...batchResults)
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const endTime = Date.now()
      
      // Analyze results
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      const responseTimes = results.map(r => r.responseTime)
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const minResponseTime = Math.min(...responseTimes)
      const maxResponseTime = Math.max(...responseTimes)
      const totalDuration = endTime - startTime
      const requestsPerSecond = (requestCount / totalDuration) * 1000
      
      this.results.loadTesting = {
        totalRequests: requestCount,
        successful,
        failed,
        successRate: (successful / requestCount) * 100,
        avgResponseTime: Math.round(avgResponseTime),
        minResponseTime,
        maxResponseTime,
        requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
        totalDuration
      }
      
      console.log('✅ Load testing completed')
      console.log(`  Requests: ${requestCount} (${successful} successful, ${failed} failed)`)
      console.log(`  Success rate: ${this.results.loadTesting.successRate.toFixed(1)}%`)
      console.log(`  Average response time: ${avgResponseTime.toFixed(0)}ms`)
      console.log(`  Requests per second: ${requestsPerSecond.toFixed(1)}`)
      
    } catch (error) {
      console.error('❌ Load testing failed:', error.message)
      this.results.loadTesting = { error: error.message }
    }
  }

  calculateOverallScore() {
    let score = 0
    let components = 0
    
    // Lighthouse performance score (40% weight)
    if (this.results.lighthouse && this.results.lighthouse.categories) {
      score += this.results.lighthouse.categories.performance.score * 40
      components++
    }
    
    // Bundle size score (30% weight)
    if (this.results.bundleAnalysis && !this.results.bundleAnalysis.error) {
      let bundleScore = 1
      const sizeMB = this.results.bundleAnalysis.totalSizeMB
      
      if (sizeMB > 5) bundleScore = 0.3
      else if (sizeMB > 3) bundleScore = 0.5
      else if (sizeMB > 2) bundleScore = 0.7
      else if (sizeMB > 1) bundleScore = 0.85
      
      score += bundleScore * 30
      components++
    }
    
    // Load testing score (30% weight)
    if (this.results.loadTesting && !this.results.loadTesting.error) {
      let loadScore = 1
      const successRate = this.results.loadTesting.successRate
      const avgResponseTime = this.results.loadTesting.avgResponseTime
      
      if (successRate < 95) loadScore -= 0.3
      if (avgResponseTime > 1000) loadScore -= 0.3
      else if (avgResponseTime > 500) loadScore -= 0.2
      else if (avgResponseTime > 200) loadScore -= 0.1
      
      loadScore = Math.max(0, loadScore)
      score += loadScore * 30
      components++
    }
    
    return components > 0 ? Math.round(score / components * 100) : 0
  }

  async generateReport() {
    this.results.score = this.calculateOverallScore()
    
    console.log('\n📊 Performance Audit Report')
    console.log('============================\n')
    
    console.log(`Overall Performance Score: ${this.results.score}/100\n`)
    
    // Lighthouse results
    if (this.results.lighthouse && this.results.lighthouse.categories) {
      console.log('💡 Lighthouse Results:')
      const categories = this.results.lighthouse.categories
      Object.keys(categories).forEach(key => {
        const category = categories[key]
        console.log(`  ${category.title}: ${Math.round(category.score * 100)}/100`)
      })
      console.log()
      
      // Core Web Vitals
      const audits = this.results.lighthouse.audits
      if (audits) {
        console.log('🌟 Core Web Vitals:')
        if (audits['first-contentful-paint']) {
          console.log(`  First Contentful Paint: ${audits['first-contentful-paint'].displayValue}`)
        }
        if (audits['largest-contentful-paint']) {
          console.log(`  Largest Contentful Paint: ${audits['largest-contentful-paint'].displayValue}`)
        }
        if (audits['cumulative-layout-shift']) {
          console.log(`  Cumulative Layout Shift: ${audits['cumulative-layout-shift'].displayValue}`)
        }
        if (audits['total-blocking-time']) {
          console.log(`  Total Blocking Time: ${audits['total-blocking-time'].displayValue}`)
        }
        console.log()
      }
    }
    
    // Bundle analysis
    if (this.results.bundleAnalysis && !this.results.bundleAnalysis.error) {
      console.log('📦 Bundle Analysis:')
      console.log(`  Total size: ${this.results.bundleAnalysis.totalSizeMB} MB`)
      console.log('  Largest files:')
      this.results.bundleAnalysis.files.slice(0, 5).forEach(file => {
        console.log(`    ${file.name}: ${file.sizeKB} KB`)
      })
      console.log()
    }
    
    // Load testing
    if (this.results.loadTesting && !this.results.loadTesting.error) {
      console.log('⚡ Load Testing:')
      console.log(`  Success rate: ${this.results.loadTesting.successRate.toFixed(1)}%`)
      console.log(`  Average response time: ${this.results.loadTesting.avgResponseTime}ms`)
      console.log(`  Requests per second: ${this.results.loadTesting.requestsPerSecond}`)
      console.log()
    }
    
    // Recommendations
    console.log('💡 Recommendations:')
    
    if (this.results.lighthouse && this.results.lighthouse.categories.performance.score < 0.9) {
      console.log('  • Optimize performance based on Lighthouse suggestions')
    }
    
    if (this.results.bundleAnalysis && this.results.bundleAnalysis.totalSizeMB > 2) {
      console.log('  • Consider code splitting and lazy loading to reduce bundle size')
    }
    
    if (this.results.loadTesting && this.results.loadTesting.avgResponseTime > 500) {
      console.log('  • Optimize server response times and implement caching')
    }
    
    // Save detailed report
    try {
      mkdirSync('reports', { recursive: true })
      writeFileSync('reports/performance-audit.json', JSON.stringify(this.results, null, 2))
      
      // Save Lighthouse HTML report if available
      if (this.results.lighthouse) {
        const lighthouse = await import('lighthouse')
        const reportHtml = lighthouse.generateReport(this.results.lighthouse, 'html')
        writeFileSync('reports/lighthouse-report.html', reportHtml)
        console.log('📄 Lighthouse HTML report saved to: reports/lighthouse-report.html')
      }
      
      console.log('📄 Detailed report saved to: reports/performance-audit.json')
    } catch (error) {
      console.error('❌ Failed to save reports:', error.message)
    }
  }

  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ')
      const process = spawn(cmd, args, { shell: true })
      
      let stdout = ''
      let stderr = ''
      
      process.stdout?.on('data', (data) => {
        stdout += data.toString()
      })
      
      process.stderr?.on('data', (data) => {
        stderr += data.toString()
      })
      
      process.on('close', (code) => {
        resolve({ code, stdout, stderr })
      })
      
      process.on('error', reject)
    })
  }
}

// Run the audit
const auditor = new PerformanceAuditor()
auditor.runAudit().catch(console.error)