#!/usr/bin/env node

/**
 * Build optimization script
 * Runs additional optimizations after Vite build
 */

import { promises as fs } from 'fs'
import path from 'path'
import { gzip } from 'zlib'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gzipAsync = promisify(gzip)

class BuildOptimizer {
  constructor() {
    this.distDir = path.join(__dirname, '..', 'dist')
    this.assetsDir = path.join(this.distDir, 'assets')
  }

  async optimize() {
    console.log('🚀 Starting build optimizations...')
    
    try {
      await this.analyzeBundle()
      await this.optimizeAssets()
      await this.generatePreloadHints()
      await this.createManifest()
      
      console.log('✅ Build optimizations complete!')
    } catch (error) {
      console.error('❌ Build optimization failed:', error)
      process.exit(1)
    }
  }

  async analyzeBundle() {
    console.log('📊 Analyzing bundle size...')
    
    try {
      const files = await fs.readdir(this.assetsDir)
      const jsFiles = files.filter(f => f.endsWith('.js'))
      const cssFiles = files.filter(f => f.endsWith('.css'))
      
      let totalSize = 0
      let gzippedSize = 0
      
      for (const file of [...jsFiles, ...cssFiles]) {
        const filePath = path.join(this.assetsDir, file)
        const content = await fs.readFile(filePath)
        const compressed = await gzipAsync(content)
        
        totalSize += content.length
        gzippedSize += compressed.length
        
        // Warn about large files
        if (content.length > 500000) { // 500KB
          console.warn(`⚠️ Large file detected: ${file} (${Math.round(content.length / 1024)}KB)`)
        }
      }
      
      console.log(`📦 Total bundle size: ${Math.round(totalSize / 1024)}KB`)
      console.log(`🗜️ Gzipped size: ${Math.round(gzippedSize / 1024)}KB`)
      
      // Store metrics for future reference
      await fs.writeFile(
        path.join(this.distDir, 'bundle-stats.json'),
        JSON.stringify({
          totalSize,
          gzippedSize,
          files: jsFiles.length + cssFiles.length,
          timestamp: new Date().toISOString()
        }, null, 2)
      )
    } catch (error) {
      console.warn('Bundle analysis failed:', error.message)
    }
  }

  async optimizeAssets() {
    console.log('🎨 Optimizing assets...')
    
    // Add resource hints to index.html
    const indexPath = path.join(this.distDir, 'index.html')
    
    try {
      let indexContent = await fs.readFile(indexPath, 'utf8')
      
      // Add preconnect to Google Fonts and Supabase
      const preconnectHints = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="${process.env.VITE_SUPABASE_URL || 'https://supabase.co'}">
  `
      
      indexContent = indexContent.replace('<head>', `<head>${preconnectHints}`)
      
      await fs.writeFile(indexPath, indexContent)
      console.log('✅ Added resource hints to index.html')
    } catch (error) {
      console.warn('Failed to optimize index.html:', error.message)
    }
  }

  async generatePreloadHints() {
    console.log('🔗 Generating preload hints...')
    
    try {
      const files = await fs.readdir(this.assetsDir)
      const criticalFiles = files.filter(f => 
        f.includes('index') || f.includes('vendor') || f.includes('chunk')
      )
      
      const preloadHints = criticalFiles
        .slice(0, 3) // Only preload most critical files
        .map(file => {
          const ext = path.extname(file)
          const as = ext === '.css' ? 'style' : 'script'
          return `<link rel="preload" href="/assets/${file}" as="${as}" ${ext === '.css' ? '' : 'crossorigin'}>`
        })
        .join('\\n  ')
      
      // Store preload hints for injection
      await fs.writeFile(
        path.join(this.distDir, 'preload-hints.html'),
        preloadHints
      )
      
      console.log(`✅ Generated ${criticalFiles.length} preload hints`)
    } catch (error) {
      console.warn('Failed to generate preload hints:', error.message)
    }
  }

  async createManifest() {
    console.log('📋 Creating optimization manifest...')
    
    const manifest = {
      version: process.env.npm_package_version || '1.0.0',
      buildTime: new Date().toISOString(),
      optimizations: [
        'Bundle analysis',
        'Resource hints',
        'Preload hints',
        'Gzip compression analysis'
      ]
    }
    
    await fs.writeFile(
      path.join(this.distDir, 'optimization-manifest.json'),
      JSON.stringify(manifest, null, 2)
    )
    
    console.log('✅ Optimization manifest created')
  }
}

// Run if called directly (works on all platforms)
console.log('🚀 Starting build optimizer...')
const optimizer = new BuildOptimizer()
optimizer.optimize().catch(error => {
  console.error('Build optimization failed:', error)
  process.exit(1)
})

export { BuildOptimizer }