import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = './public/logo.png';
const outputDir = './public/icons';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons from logo.png...\n');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 15, g: 10, b: 26, alpha: 1 } // #0f0a1a - dark purple bg
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated: icon-${size}x${size}.png`);
  }
  
  console.log('\n🎉 All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
