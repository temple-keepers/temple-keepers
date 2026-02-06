const fs = require('fs');
const path = require('path');

// Simple PNG resizer using Canvas (Node 18+)
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.log('Installing sharp...');
  require('child_process').execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  sharp = require('sharp');
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const logo = path.join(__dirname, 'public', 'logo.png');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  for (const { name, size } of sizes) {
    await sharp(logo)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // Maskable icon — logo with purple background padding
  await sharp(logo)
    .resize(410, 410)
    .extend({
      top: 51, bottom: 51, left: 51, right: 51,
      background: { r: 107, g: 33, b: 168, alpha: 1 }
    })
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'));
  console.log('✓ maskable-icon-512x512.png (512x512)');

  // Copy apple-touch-icon to public root
  fs.copyFileSync(
    path.join(iconsDir, 'apple-touch-icon.png'),
    path.join(__dirname, 'public', 'apple-touch-icon.png')
  );
  console.log('✓ apple-touch-icon.png → public/');

  console.log('\n✅ All PWA icons generated! You can delete this file now.');
}

generate().catch(console.error);
