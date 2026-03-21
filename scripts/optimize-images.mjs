import sharp from 'sharp';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, '../attached_assets');

const conversions = [
  // Toy hauler hero — resize to 720×924 (fits 2× retina at 358×462 display)
  {
    input: 'generated_images/Modern_luxury_toy_hauler_2050a416.png',
    output: 'generated_images/Modern_luxury_toy_hauler_2050a416.webp',
    width: 720,
    height: 924,
    quality: 80,
  },
  // EN logo — resize to 2× display size (341×72 display → 682×144 at 2×), quality 75
  {
    input: 'Official_RVclaims_logo_en.png',
    output: 'Official_RVclaims_logo_en.webp',
    width: 512,
    height: 108,
    quality: 75,
  },
  // FR logo — same
  {
    input: 'Official_RVclaims_logo_fr.png',
    output: 'Official_RVclaims_logo_fr.webp',
    width: 512,
    height: 108,
    quality: 75,
  },
  // 10 RV type icons — convert as-is (150×150 source, CSS scales to 90×90)
  { input: 'Class A_1756847838643.png',              output: 'Class A_1756847838643.webp',              quality: 85 },
  { input: 'Class C_1756847838644.png',              output: 'Class C_1756847838644.webp',              quality: 85 },
  { input: 'Destination Trailer_1756847838644.png',  output: 'Destination Trailer_1756847838644.webp',  quality: 85 },
  { input: 'Fifth Wheel_1756847838645.png',          output: 'Fifth Wheel_1756847838645.webp',          quality: 85 },
  { input: 'Pop Up_1756847838645.png',               output: 'Pop Up_1756847838645.webp',               quality: 85 },
  { input: 'Small Trailer_1756847838646.png',        output: 'Small Trailer_1756847838646.webp',        quality: 85 },
  { input: 'Toy Hauler_1756847838646.png',           output: 'Toy Hauler_1756847838646.webp',           quality: 85 },
  { input: 'Travel Trailer_1756847838647.png',       output: 'Travel Trailer_1756847838647.webp',       quality: 85 },
  { input: 'Truck Camper_1756847838647.png',         output: 'Truck Camper_1756847838647.webp',         quality: 85 },
  { input: 'Van Camper_1756847838648.png',           output: 'Van Camper_1756847838648.webp',           quality: 85 },
];

let created = 0;
let skipped = 0;
let errors = 0;

for (const conv of conversions) {
  const inputPath = resolve(assetsDir, conv.input);
  const outputPath = resolve(assetsDir, conv.output);

  if (!existsSync(inputPath)) {
    console.error(`  MISSING: ${conv.input}`);
    errors++;
    continue;
  }

  try {
    let pipeline = sharp(inputPath);
    if (conv.width && conv.height) {
      pipeline = pipeline.resize(conv.width, conv.height, { fit: 'cover' });
    }
    await pipeline.webp({ quality: conv.quality }).toFile(outputPath);
    console.log(`  OK: ${conv.output}`);
    created++;
  } catch (err) {
    console.error(`  ERROR: ${conv.output} — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors`);
if (errors > 0) process.exit(1);
