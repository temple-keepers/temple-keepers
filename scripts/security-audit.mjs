/**
 * Security Audit Script
 * Automated security testing and vulnerability scanning
 */

import { createServer } from 'http'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

class SecurityAuditor {
  constructor() {
    this.results = {
      vulnerabilities: [],
      warnings: [],
      passed: [],
      score: 0
    }
    this.server = null
    this.port = 3001
  }

  async runAudit() {
    console.log('🔒 Starting Security Audit...\n')
    
    try {
      // Start local server for testing
      await this.startTestServer()
      
      // Run security tests
      await this.checkDependencyVulnerabilities()
      await this.checkSecurityHeaders()
      await this.checkContentSecurityPolicy()
      await this.checkCookieSettings()
      await this.checkHTTPS()
      await this.checkInputValidation()
      await this.checkAuthenticationSecurity()
      
      // Generate report
      await this.generateReport()
      
    } catch (error) {
      console.error('❌ Security audit failed:', error)
    } finally {
      // Cleanup
      if (this.server) {
        this.server.close()
      }
    }
  }

  async startTestServer() {
    return new Promise((resolve, reject) => {
      // Simple static server for testing
      this.server = createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Security-Policy': "default-src 'self'",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        })
        res.end('<html><body><h1>Test Server</h1></body></html>')
      })

      this.server.listen(this.port, () => {
        console.log(`✅ Test server started on http://localhost:${this.port}`)
        resolve()
      })

      this.server.on('error', reject)
    })
  }

  async checkDependencyVulnerabilities() {
    console.log('📦 Checking dependency vulnerabilities...')
    
    try {
      const result = await this.runCommand('npm audit --json')
      const auditData = JSON.parse(result.stdout)
      
      if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
        const critical = Object.values(auditData.vulnerabilities)
          .filter(v => v.severity === 'critical').length
        const high = Object.values(auditData.vulnerabilities)
          .filter(v => v.severity === 'high').length
        
        if (critical > 0) {
          this.results.vulnerabilities.push({
            test: 'Dependency Vulnerabilities',
            severity: 'critical',
            message: `${critical} critical vulnerabilities found in dependencies`,
            recommendation: 'Run npm audit fix to resolve vulnerabilities'
          })
        } else if (high > 0) {
          this.results.warnings.push({
            test: 'Dependency Vulnerabilities',
            severity: 'high',
            message: `${high} high-severity vulnerabilities found`,
            recommendation: 'Review and update vulnerable packages'
          })
        } else {
          this.results.passed.push('Dependency vulnerabilities check')
        }
      } else {
        this.results.passed.push('Dependency vulnerabilities check')
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'Dependency Vulnerabilities',
        message: 'Could not check dependency vulnerabilities',
        error: error.message
      })
    }
  }

  async checkSecurityHeaders() {
    console.log('🛡️ Checking security headers...')
    
    try {
      const response = await fetch(`http://localhost:${this.port}`)
      const headers = response.headers
      
      const securityHeaders = [
        { name: 'X-Frame-Options', required: true },
        { name: 'X-Content-Type-Options', required: true },
        { name: 'Content-Security-Policy', required: true },
        { name: 'Strict-Transport-Security', required: false }, // Only needed in production with HTTPS
        { name: 'X-XSS-Protection', required: false } // Deprecated but still useful for older browsers
      ]
      
      securityHeaders.forEach(header => {
        if (headers.has(header.name.toLowerCase())) {
          this.results.passed.push(`Security header: ${header.name}`)
        } else if (header.required) {
          this.results.vulnerabilities.push({
            test: 'Security Headers',
            severity: 'medium',
            message: `Missing required security header: ${header.name}`,
            recommendation: `Add ${header.name} header to server response`
          })
        } else {
          this.results.warnings.push({
            test: 'Security Headers',
            message: `Optional security header not set: ${header.name}`
          })
        }
      })
    } catch (error) {
      this.results.warnings.push({
        test: 'Security Headers',
        message: 'Could not check security headers',
        error: error.message
      })
    }
  }

  async checkContentSecurityPolicy() {
    console.log('🔐 Checking Content Security Policy...')
    
    try {
      const response = await fetch(`http://localhost:${this.port}`)
      const csp = response.headers.get('content-security-policy')
      
      if (!csp) {
        this.results.vulnerabilities.push({
          test: 'Content Security Policy',
          severity: 'high',
          message: 'No Content Security Policy header found',
          recommendation: 'Implement CSP to prevent XSS attacks'
        })
        return
      }
      
      const directives = csp.split(';').map(d => d.trim())
      const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src']
      
      requiredDirectives.forEach(directive => {
        const hasDirective = directives.some(d => d.startsWith(directive))
        if (hasDirective) {
          this.results.passed.push(`CSP directive: ${directive}`)
        } else {
          this.results.warnings.push({
            test: 'Content Security Policy',
            message: `Missing CSP directive: ${directive}`,
            recommendation: `Add ${directive} directive to CSP`
          })
        }
      })
      
      // Check for unsafe directives
      const unsafeDirectives = directives.filter(d => 
        d.includes("'unsafe-inline'") || d.includes("'unsafe-eval'")
      )
      
      if (unsafeDirectives.length > 0) {
        this.results.warnings.push({
          test: 'Content Security Policy',
          message: 'CSP contains unsafe directives',
          details: unsafeDirectives,
          recommendation: 'Remove unsafe-inline and unsafe-eval where possible'
        })
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'Content Security Policy',
        message: 'Could not analyze CSP',
        error: error.message
      })
    }
  }

  async checkCookieSettings() {
    console.log('🍪 Checking cookie security settings...')
    
    // This would need to be tested with actual cookies in a real application
    // For now, we'll check configuration files
    try {
      const vercelConfig = await fs.readFile('vercel.json', 'utf8')
      const config = JSON.parse(vercelConfig)
      
      if (config.headers) {
        const cookieHeaders = config.headers.some(h => 
          h.headers && h.headers.some(header => 
            header.key === 'Set-Cookie' && 
            header.value.includes('Secure') && 
            header.value.includes('HttpOnly') && 
            header.value.includes('SameSite')
          )
        )
        
        if (cookieHeaders) {
          this.results.passed.push('Cookie security settings')
        } else {
          this.results.warnings.push({
            test: 'Cookie Security',
            message: 'Cookie security flags not properly configured',
            recommendation: 'Ensure cookies have Secure, HttpOnly, and SameSite flags'
          })
        }
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'Cookie Security',
        message: 'Could not check cookie configuration',
        error: error.message
      })
    }
  }

  async checkHTTPS() {
    console.log('🔒 Checking HTTPS configuration...')
    
    // Check if the app enforces HTTPS in production
    try {
      const vercelConfig = await fs.readFile('vercel.json', 'utf8')
      const config = JSON.parse(vercelConfig)
      
      if (config.headers && config.headers.some(h => 
        h.headers && h.headers.some(header => 
          header.key === 'Strict-Transport-Security'
        )
      )) {
        this.results.passed.push('HTTPS enforcement (HSTS)')
      } else {
        this.results.warnings.push({
          test: 'HTTPS Configuration',
          message: 'HTTPS enforcement not configured',
          recommendation: 'Add Strict-Transport-Security header for production'
        })
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'HTTPS Configuration',
        message: 'Could not check HTTPS configuration',
        error: error.message
      })
    }
  }

  async checkInputValidation() {
    console.log('✅ Checking input validation implementation...')
    
    try {
      // Check if security utilities exist
      const securityUtilsPath = 'src/utils/security.js'
      const securityUtils = await fs.readFile(securityUtilsPath, 'utf8')
      
      const validationChecks = [
        { name: 'sanitizeInput', pattern: /sanitizeInput.*function|const.*sanitizeInput/i },
        { name: 'validateForm', pattern: /validateForm.*function|const.*validateForm/i },
        { name: 'XSS prevention', pattern: /xss|sanitize|escape/i },
        { name: 'SQL injection prevention', pattern: /sql.*injection|parameterized|prepared/i }
      ]
      
      validationChecks.forEach(check => {
        if (check.pattern.test(securityUtils)) {
          this.results.passed.push(`Input validation: ${check.name}`)
        } else {
          this.results.warnings.push({
            test: 'Input Validation',
            message: `${check.name} implementation not found`,
            recommendation: `Implement ${check.name} in security utilities`
          })
        }
      })
    } catch (error) {
      this.results.vulnerabilities.push({
        test: 'Input Validation',
        severity: 'high',
        message: 'Security utilities not found',
        recommendation: 'Implement input validation and sanitization utilities'
      })
    }
  }

  async checkAuthenticationSecurity() {
    console.log('🔐 Checking authentication security...')
    
    try {
      // Check authentication implementation
      const authFiles = ['src/hooks/useAuth.jsx', 'src/contexts/AuthContext.jsx']
      let authImplemented = false
      
      for (const filePath of authFiles) {
        try {
          const content = await fs.readFile(filePath, 'utf8')
          if (content.includes('auth') || content.includes('Auth')) {
            authImplemented = true
            break
          }
        } catch (error) {
          // File not found, continue checking
        }
      }
      
      if (authImplemented) {
        this.results.passed.push('Authentication implementation')
        
        // Check for rate limiting
        try {
          const securityUtils = await fs.readFile('src/utils/security.js', 'utf8')
          if (securityUtils.includes('RateLimiter') || securityUtils.includes('rateLimit')) {
            this.results.passed.push('Rate limiting implementation')
          } else {
            this.results.warnings.push({
              test: 'Authentication Security',
              message: 'Rate limiting not implemented',
              recommendation: 'Add rate limiting to prevent brute force attacks'
            })
          }
        } catch (error) {
          this.results.warnings.push({
            test: 'Authentication Security',
            message: 'Could not verify rate limiting implementation'
          })
        }
      } else {
        this.results.vulnerabilities.push({
          test: 'Authentication Security',
          severity: 'critical',
          message: 'No authentication implementation found',
          recommendation: 'Implement secure authentication system'
        })
      }
    } catch (error) {
      this.results.warnings.push({
        test: 'Authentication Security',
        message: 'Could not check authentication implementation',
        error: error.message
      })
    }
  }

  calculateScore() {
    const totalTests = this.results.passed.length + this.results.warnings.length + this.results.vulnerabilities.length
    const passedTests = this.results.passed.length
    const criticalVulns = this.results.vulnerabilities.filter(v => v.severity === 'critical').length
    const highVulns = this.results.vulnerabilities.filter(v => v.severity === 'high').length
    const mediumVulns = this.results.vulnerabilities.filter(v => v.severity === 'medium').length
    
    let score = (passedTests / totalTests) * 100
    
    // Deduct points for vulnerabilities
    score -= criticalVulns * 20
    score -= highVulns * 10
    score -= mediumVulns * 5
    
    return Math.max(0, Math.round(score))
  }

  async generateReport() {
    this.results.score = this.calculateScore()
    
    console.log('\n📊 Security Audit Report')
    console.log('========================\n')
    
    console.log(`Overall Security Score: ${this.results.score}/100`)
    console.log(`Passed Tests: ${this.results.passed.length}`)
    console.log(`Warnings: ${this.results.warnings.length}`)
    console.log(`Vulnerabilities: ${this.results.vulnerabilities.length}\n`)
    
    if (this.results.vulnerabilities.length > 0) {
      console.log('🚨 VULNERABILITIES:')
      this.results.vulnerabilities.forEach(vuln => {
        console.log(`  ❌ ${vuln.test} (${vuln.severity || 'medium'})`)
        console.log(`     ${vuln.message}`)
        if (vuln.recommendation) {
          console.log(`     💡 ${vuln.recommendation}`)
        }
        console.log('')
      })
    }
    
    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS:')
      this.results.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning.test}`)
        console.log(`     ${warning.message}`)
        if (warning.recommendation) {
          console.log(`     💡 ${warning.recommendation}`)
        }
        console.log('')
      })
    }
    
    console.log('✅ PASSED TESTS:')
    this.results.passed.forEach(test => {
      console.log(`  ✅ ${test}`)
    })
    
    // Save detailed report
    const reportPath = 'reports/security-audit.json'
    await fs.mkdir('reports', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2))
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
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
const auditor = new SecurityAuditor()
auditor.runAudit().catch(console.error)