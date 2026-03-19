// scripts/generate-app-icons.js — Generate all required app icon sizes
// Run: node scripts/generate-app-icons.js <source-icon-1024.png>
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE = process.argv[2];
if (!SOURCE) {
  console.log('Usage: node scripts/generate-app-icons.js <source-1024x1024.png>');
  console.log('Source must be 1024x1024 PNG with no transparency (iOS requirement)');
  process.exit(1);
}

// All sizes needed for iOS + Android
const sizes = [
  // iOS
  { size: 20, name: 'ios/AppIcon-20.png' },
  { size: 40, name: 'ios/AppIcon-20@2x.png' },
  { size: 60, name: 'ios/AppIcon-20@3x.png' },
  { size: 29, name: 'ios/AppIcon-29.png' },
  { size: 58, name: 'ios/AppIcon-29@2x.png' },
  { size: 87, name: 'ios/AppIcon-29@3x.png' },
  { size: 40, name: 'ios/AppIcon-40.png' },
  { size: 80, name: 'ios/AppIcon-40@2x.png' },
  { size: 120, name: 'ios/AppIcon-40@3x.png' },
  { size: 120, name: 'ios/AppIcon-60@2x.png' },
  { size: 180, name: 'ios/AppIcon-60@3x.png' },
  { size: 76, name: 'ios/AppIcon-76.png' },
  { size: 152, name: 'ios/AppIcon-76@2x.png' },
  { size: 167, name: 'ios/AppIcon-83.5@2x.png' },
  { size: 1024, name: 'ios/AppIcon-1024.png' },

  // Android (adaptive icon foreground — 108dp at various densities)
  { size: 36, name: 'android/mipmap-ldpi/ic_launcher.png' },
  { size: 48, name: 'android/mipmap-mdpi/ic_launcher.png' },
  { size: 72, name: 'android/mipmap-hdpi/ic_launcher.png' },
  { size: 96, name: 'android/mipmap-xhdpi/ic_launcher.png' },
  { size: 144, name: 'android/mipmap-xxhdpi/ic_launcher.png' },
  { size: 192, name: 'android/mipmap-xxxhdpi/ic_launcher.png' },
  { size: 432, name: 'android/mipmap-xxxhdpi/ic_launcher_foreground.png' },
  { size: 512, name: 'android/playstore-icon.png' },

  // PWA icons
  { size: 72, name: 'pwa/icon-72.png' },
  { size: 96, name: 'pwa/icon-96.png' },
  { size: 128, name: 'pwa/icon-128.png' },
  { size: 144, name: 'pwa/icon-144.png' },
  { size: 152, name: 'pwa/icon-152.png' },
  { size: 192, name: 'pwa/icon-192.png' },
  { size: 384, name: 'pwa/icon-384.png' },
  { size: 512, name: 'pwa/icon-512.png' },
];

async function generate() {
  const outDir = path.join(process.cwd(), 'app-icons');

  for (const { size, name } of sizes) {
    const outPath = path.join(outDir, name);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 8, g: 35, b: 93, alpha: 1 } })
      .png()
      .toFile(outPath);

    console.log(`✓ ${name} (${size}x${size})`);
  }

  console.log(`\nDone! ${sizes.length} icons in ./app-icons/`);
  console.log('\nCopy to native projects:');
  console.log('  iOS: Copy ios/ folder contents into ios/App/App/Assets.xcassets/AppIcon.appiconset/');
  console.log('  Android: Copy android/ folder contents into android/app/src/main/res/');
  console.log('  PWA: Copy pwa/ folder contents into public/icons/');
}

generate().catch(console.error);
