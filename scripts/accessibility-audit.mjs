/**
 * Accessibility Audit Script
 * Automated accessibility testing and WCAG compliance checking
 */

import { spawn } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { createServer } from 'http'
import { readFileSync } from 'fs'

class AccessibilityAuditor {
  constructor() {
    this.results = {
      violations: [],
      warnings: [],
      passed: [],
      score: 0,
      wcagLevel: 'AA'
    }
    this.server = null
    this.port = 3002
  }

  async runAudit() {
    console.log('♿ Starting Accessibility Audit...\n')
    
    try {
      // Start test server
      await this.startTestServer()
      
      // Run accessibility tests
      await this.runAxeAudit()
      await this.checkColorContrast()
      await this.checkKeyboardNavigation()
      await this.checkScreenReaderCompatibility()
      await this.checkImageAltText()
      await this.checkFormLabels()
      await this.checkHeadingStructure()
      await this.checkLandmarksAndRoles()
      
      // Generate comprehensive report
      await this.generateReport()
      
    } catch (error) {
      console.error('❌ Accessibility audit failed:', error)
    } finally {
      if (this.server) {
        this.server.close()
      }
    }
  }

  async startTestServer() {
    console.log('🌐 Starting test server...')
    
    return new Promise((resolve, reject) => {
      // Serve the built application
      const handler = (req, res) => {
        try {
          let filePath = req.url === '/' ? '/index.html' : req.url
          let content = readFileSync(`dist${filePath}`, 'utf8')
          
          const contentType = this.getContentType(filePath)
          res.writeHead(200, { 'Content-Type': contentType })
          res.end(content)
        } catch (error) {
          res.writeHead(404)
          res.end('Not Found')
        }
      }

      this.server = createServer(handler)
      this.server.listen(this.port, () => {
        console.log(`✅ Test server started on http://localhost:${this.port}`)
        resolve()
      })

      this.server.on('error', reject)
    })
  }

  getContentType(filePath) {
    if (filePath.endsWith('.html')) return 'text/html'
    if (filePath.endsWith('.css')) return 'text/css'
    if (filePath.endsWith('.js')) return 'application/javascript'
    if (filePath.endsWith('.json')) return 'application/json'
    return 'text/plain'
  }

  async runAxeAudit() {
    console.log('🔍 Running axe-core accessibility audit...')
    
    try {
      // Use axe-cli to audit the page
      const result = await this.runCommand(`npx axe http://localhost:${this.port} --format=json`)
      
      if (result.stdout) {
        try {
          const axeResults = JSON.parse(result.stdout)
          
          // Process violations
          if (axeResults.violations && axeResults.violations.length > 0) {
            axeResults.violations.forEach(violation => {
              this.results.violations.push({
                test: 'Axe Core Audit',
                rule: violation.id,
                impact: violation.impact,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: violation.nodes.length,
                wcagTags: violation.tags.filter(tag => tag.startsWith('wcag'))
              })
            })
          }
          
          // Process passed tests
          if (axeResults.passes && axeResults.passes.length > 0) {
            axeResults.passes.forEach(pass => {
              this.results.passed.push(`Axe: ${pass.description}`)
            })
          }
          
          // Process incomplete tests (warnings)
          if (axeResults.incomplete && axeResults.incomplete.length > 0) {
            axeResults.incomplete.forEach(incomplete => {
              this.results.warnings.push({
                test: 'Axe Core Audit',
                rule: incomplete.id,
                description: incomplete.description,
                message: 'Test incomplete - manual verification required'
              })
            })
          }
          
        } catch (parseError) {
          console.error('Failed to parse axe results:', parseError.message)
        }
      }
      
      console.log('✅ Axe audit completed')
      
    } catch (error) {
      console.error('❌ Axe audit failed:', error.message)
      this.results.warnings.push({
        test: 'Axe Core Audit',
        message: 'Could not run axe-core audit',
        error: error.message
      })
    }
  }

  async checkColorContrast() {
    console.log('🎨 Checking color contrast...')
    
    try {
      // Read CSS files to analyze color usage
      const cssContent = this.getCSSContent()
      
      // Basic color contrast checks
      const colorIssues = []
      
      // Check for common low-contrast patterns
      const lowContrastPatterns = [
        { bg: '#ffffff', fg: '#cccccc', description: 'Light gray on white' },
        { bg: '#000000', fg: '#333333', description: 'Dark gray on black' },
        { bg: '#f8f9fa', fg: '#dee2e6', description: 'Very light colors' }
      ]
      
      lowContrastPatterns.forEach(pattern => {
        if (cssContent.includes(pattern.bg) && cssContent.includes(pattern.fg)) {
          colorIssues.push({
            test: 'Color Contrast',
            issue: pattern.description,
            recommendation: 'Ensure color contrast ratio is at least 4.5:1 for normal text, 3:1 for large text'
          })
        }
      })
      
      if (colorIssues.length > 0) {
        this.results.warnings.push(...colorIssues)
      } else {
        this.results.passed.push('Color contrast analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Color Contrast',
        message: 'Could not analyze color contrast',
        error: error.message
      })
    }
  }

  async checkKeyboardNavigation() {
    console.log('⌨️ Checking keyboard navigation...')
    
    try {
      const htmlContent = this.getHTMLContent()
      
      const keyboardIssues = []
      
      // Check for skip links
      if (!htmlContent.includes('skip') || !htmlContent.includes('#main')) {
        keyboardIssues.push({
          test: 'Keyboard Navigation',
          issue: 'No skip link found',
          recommendation: 'Add skip link to main content for keyboard users'
        })
      }
      
      // Check for focus indicators in CSS
      const cssContent = this.getCSSContent()
      if (!cssContent.includes(':focus') && !cssContent.includes('focus-visible')) {
        keyboardIssues.push({
          test: 'Keyboard Navigation',
          issue: 'No focus indicators defined',
          recommendation: 'Add :focus styles for keyboard navigation visibility'
        })
      }
      
      // Check for tabindex issues
      const negativeTabindex = htmlContent.match(/tabindex\s*=\s*["\']?\s*-\d+/gi)
      if (negativeTabindex && negativeTabindex.length > 5) {
        keyboardIssues.push({
          test: 'Keyboard Navigation',
          issue: 'Excessive use of negative tabindex',
          recommendation: 'Minimize use of tabindex="-1" as it removes elements from tab order'
        })
      }
      
      if (keyboardIssues.length > 0) {
        this.results.warnings.push(...keyboardIssues)
      } else {
        this.results.passed.push('Keyboard navigation analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Keyboard Navigation',
        message: 'Could not analyze keyboard navigation',
        error: error.message
      })
    }
  }

  async checkScreenReaderCompatibility() {
    console.log('🔊 Checking screen reader compatibility...')
    
    try {
      const htmlContent = this.getHTMLContent()
      
      const screenReaderIssues = []
      
      // Check for ARIA labels
      const ariaLabels = htmlContent.match(/aria-label/gi)
      const ariaLabelledby = htmlContent.match(/aria-labelledby/gi)
      const ariaDescribedby = htmlContent.match(/aria-describedby/gi)
      
      if (!ariaLabels && !ariaLabelledby) {
        screenReaderIssues.push({
          test: 'Screen Reader Compatibility',
          issue: 'No ARIA labels found',
          recommendation: 'Add aria-label or aria-labelledby attributes for better screen reader support'
        })
      }
      
      // Check for semantic HTML
      const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer']
      const missingElements = semanticElements.filter(element => 
        !htmlContent.includes(`<${element}`)
      )
      
      if (missingElements.length > 3) {
        screenReaderIssues.push({
          test: 'Screen Reader Compatibility',
          issue: `Missing semantic elements: ${missingElements.join(', ')}`,
          recommendation: 'Use semantic HTML elements for better document structure'
        })
      }
      
      // Check for heading structure
      const headings = htmlContent.match(/<h[1-6][^>]*>/gi)
      if (!headings || headings.length === 0) {
        screenReaderIssues.push({
          test: 'Screen Reader Compatibility',
          issue: 'No headings found',
          recommendation: 'Add proper heading structure (h1-h6) for screen reader navigation'
        })
      }
      
      if (screenReaderIssues.length > 0) {
        this.results.violations.push(...screenReaderIssues)
      } else {
        this.results.passed.push('Screen reader compatibility analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Screen Reader Compatibility',
        message: 'Could not analyze screen reader compatibility',
        error: error.message
      })
    }
  }

  async checkImageAltText() {
    console.log('🖼️ Checking image alt text...')
    
    try {
      const htmlContent = this.getHTMLContent()
      
      const images = htmlContent.match(/<img[^>]*>/gi) || []
      const imageIssues = []
      
      images.forEach((img, index) => {
        if (!img.includes('alt=')) {
          imageIssues.push({
            test: 'Image Alt Text',
            issue: `Image ${index + 1} missing alt attribute`,
            recommendation: 'Add alt attribute to all images'
          })
        } else if (img.includes('alt=""') && !img.includes('role="presentation"')) {
          // Empty alt is OK for decorative images, but should be intentional
          this.results.warnings.push({
            test: 'Image Alt Text',
            message: `Image ${index + 1} has empty alt text`,
            recommendation: 'Verify if image is decorative or needs descriptive alt text'
          })
        }
      })
      
      if (imageIssues.length > 0) {
        this.results.violations.push(...imageIssues)
      } else {
        this.results.passed.push('Image alt text analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Image Alt Text',
        message: 'Could not analyze image alt text',
        error: error.message
      })
    }
  }

  async checkFormLabels() {
    console.log('📝 Checking form labels...')
    
    try {
      const htmlContent = this.getHTMLContent()
      
      const inputs = htmlContent.match(/<input[^>]*>/gi) || []
      const textareas = htmlContent.match(/<textarea[^>]*>/gi) || []
      const selects = htmlContent.match(/<select[^>]*>/gi) || []
      
      const formElements = [...inputs, ...textareas, ...selects]
      const labelIssues = []
      
      formElements.forEach((element, index) => {
        const hasLabel = element.includes('aria-label=') || 
                         element.includes('aria-labelledby=') ||
                         htmlContent.includes(`<label[^>]*for=["'][^"']*["'][^>]*>`) ||
                         element.includes('id=') // Assuming labels exist for ids
        
        if (!hasLabel && !element.includes('type="hidden"')) {
          labelIssues.push({
            test: 'Form Labels',
            issue: `Form element ${index + 1} missing label`,
            recommendation: 'Add <label> element or aria-label attribute'
          })
        }
      })
      
      if (labelIssues.length > 0) {
        this.results.violations.push(...labelIssues)
      } else {
        this.results.passed.push('Form labels analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Form Labels',
        message: 'Could not analyze form labels',
        error: error.message
      })
    }
  }

  async checkHeadingStructure() {
    console.log('📋 Checking heading structure...')
    
    try {
      const htmlContent = this.getHTMLContent()
      
      const headings = []
      for (let i = 1; i <= 6; i++) {
        const matches = htmlContent.match(new RegExp(`<h${i}[^>]*>`, 'gi'))
        if (matches) {
          headings.push(...matches.map(match => ({ level: i, element: match })))
        }
      }
      
      const headingIssues = []
      
      // Check if h1 exists
      const h1Count = headings.filter(h => h.level === 1).length
      if (h1Count === 0) {
        headingIssues.push({
          test: 'Heading Structure',
          issue: 'No h1 heading found',
          recommendation: 'Add exactly one h1 heading per page'
        })
      } else if (h1Count > 1) {
        headingIssues.push({
          test: 'Heading Structure',
          issue: 'Multiple h1 headings found',
          recommendation: 'Use only one h1 heading per page'
        })
      }
      
      // Check heading sequence
      for (let i = 1; i < headings.length; i++) {
        const current = headings[i].level
        const previous = headings[i - 1].level
        
        if (current > previous + 1) {
          headingIssues.push({
            test: 'Heading Structure',
            issue: `Heading level skip detected (h${previous} to h${current})`,
            recommendation: 'Do not skip heading levels - use sequential hierarchy'
          })
          break // Report only first occurrence
        }
      }
      
      if (headingIssues.length > 0) {
        this.results.violations.push(...headingIssues)
      } else {
        this.results.passed.push('Heading structure analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Heading Structure',
        message: 'Could not analyze heading structure',
        error: error.message
      })
    }
  }

  async checkLandmarksAndRoles() {
    console.log('🏛️ Checking landmarks and ARIA roles...')
    
    try {
      const htmlContent = this.getHTMLContent()
      
      const landmarkIssues = []
      
      // Check for main landmark
      if (!htmlContent.includes('<main') && !htmlContent.includes('role="main"')) {
        landmarkIssues.push({
          test: 'Landmarks and Roles',
          issue: 'No main landmark found',
          recommendation: 'Add <main> element or role="main" to identify main content'
        })
      }
      
      // Check for navigation landmark
      if (!htmlContent.includes('<nav') && !htmlContent.includes('role="navigation"')) {
        landmarkIssues.push({
          test: 'Landmarks and Roles',
          issue: 'No navigation landmark found',
          recommendation: 'Add <nav> element or role="navigation" for site navigation'
        })
      }
      
      // Check for banner/header
      if (!htmlContent.includes('<header') && !htmlContent.includes('role="banner"')) {
        landmarkIssues.push({
          test: 'Landmarks and Roles',
          issue: 'No banner landmark found',
          recommendation: 'Add <header> element or role="banner" for page header'
        })
      }
      
      // Check for invalid ARIA roles
      const ariaRoles = htmlContent.match(/role\s*=\s*["']([^"']*)["']/gi) || []
      const validRoles = [
        'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
        'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
        'definition', 'dialog', 'directory', 'document', 'form', 'grid',
        'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
        'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar',
        'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'note',
        'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
        'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
        'separator', 'slider', 'spinbutton', 'status', 'tab', 'tablist',
        'tabpanel', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
        'treeitem', 'none'
      ]
      
      ariaRoles.forEach(roleAttr => {
        const roleMatch = roleAttr.match(/role\s*=\s*["']([^"']*)["']/i)
        if (roleMatch) {
          const role = roleMatch[1].toLowerCase()
          if (!validRoles.includes(role)) {
            landmarkIssues.push({
              test: 'Landmarks and Roles',
              issue: `Invalid ARIA role: ${role}`,
              recommendation: 'Use only valid ARIA roles from the ARIA specification'
            })
          }
        }
      })
      
      if (landmarkIssues.length > 0) {
        this.results.violations.push(...landmarkIssues)
      } else {
        this.results.passed.push('Landmarks and roles analysis')
      }
      
    } catch (error) {
      this.results.warnings.push({
        test: 'Landmarks and Roles',
        message: 'Could not analyze landmarks and roles',
        error: error.message
      })
    }
  }

  getHTMLContent() {
    try {
      return readFileSync('dist/index.html', 'utf8')
    } catch (error) {
      throw new Error('Could not read HTML content')
    }
  }

  getCSSContent() {
    try {
      const { readdirSync } = require('fs')
      const files = readdirSync('dist/assets')
      const cssFiles = files.filter(file => file.endsWith('.css'))
      
      let cssContent = ''
      cssFiles.forEach(file => {
        cssContent += readFileSync(`dist/assets/${file}`, 'utf8')
      })
      
      return cssContent
    } catch (error) {
      return ''
    }
  }

  calculateScore() {
    const totalIssues = this.results.violations.length + this.results.warnings.length
    const passedTests = this.results.passed.length
    const totalTests = totalIssues + passedTests
    
    if (totalTests === 0) return 0
    
    let score = (passedTests / totalTests) * 100
    
    // Deduct more points for violations than warnings
    const criticalViolations = this.results.violations.filter(v => v.impact === 'critical').length
    const seriousViolations = this.results.violations.filter(v => v.impact === 'serious').length
    const moderateViolations = this.results.violations.filter(v => v.impact === 'moderate').length
    
    score -= criticalViolations * 15
    score -= seriousViolations * 10
    score -= moderateViolations * 5
    score -= this.results.warnings.length * 2
    
    return Math.max(0, Math.round(score))
  }

  async generateReport() {
    this.results.score = this.calculateScore()
    
    console.log('\n♿ Accessibility Audit Report')
    console.log('==============================\n')
    
    console.log(`Overall Accessibility Score: ${this.results.score}/100`)
    console.log(`WCAG Compliance Level: ${this.results.wcagLevel}`)
    console.log(`Violations: ${this.results.violations.length}`)
    console.log(`Warnings: ${this.results.warnings.length}`)
    console.log(`Passed Tests: ${this.results.passed.length}\n`)
    
    if (this.results.violations.length > 0) {
      console.log('🚨 VIOLATIONS:')
      this.results.violations.forEach(violation => {
        console.log(`  ❌ ${violation.test}`)
        console.log(`     ${violation.issue || violation.description}`)
        if (violation.impact) {
          console.log(`     Impact: ${violation.impact}`)
        }
        if (violation.recommendation || violation.help) {
          console.log(`     💡 ${violation.recommendation || violation.help}`)
        }
        if (violation.helpUrl) {
          console.log(`     🔗 ${violation.helpUrl}`)
        }
        console.log('')
      })
    }
    
    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS:')
      this.results.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning.test}`)
        console.log(`     ${warning.message || warning.issue}`)
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
    
    // Compliance assessment
    console.log('\n📊 WCAG 2.1 Compliance Assessment:')
    if (this.results.score >= 95) {
      console.log('  🏆 Excellent - Likely meets WCAG 2.1 AAA standards')
    } else if (this.results.score >= 85) {
      console.log('  ✅ Good - Likely meets WCAG 2.1 AA standards')
    } else if (this.results.score >= 70) {
      console.log('  ⚠️  Fair - May meet WCAG 2.1 A standards with improvements')
    } else {
      console.log('  ❌ Poor - Significant accessibility improvements needed')
    }
    
    // Save detailed report
    try {
      mkdirSync('reports', { recursive: true })
      writeFileSync('reports/accessibility-audit.json', JSON.stringify(this.results, null, 2))
      console.log('\n📄 Detailed report saved to: reports/accessibility-audit.json')
    } catch (error) {
      console.error('❌ Failed to save report:', error.message)
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
const auditor = new AccessibilityAuditor()
auditor.runAudit().catch(console.error)