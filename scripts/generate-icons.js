/**
 * Generates PWA icon PNGs from scripts/icon-source.png into public/icons/.
 *
 * Run once after changing the source:
 *   node scripts/generate-icons.js
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, 'icon-source.png');
const OUT_DIR = resolve(__dirname, '..', 'public', 'icons');

// Standard sizes — center-cropped square if source isn't square
const SIZES = [
  { size: 180, name: 'icon-180.png' },  // iOS apple-touch-icon
  { size: 192, name: 'icon-192.png' },  // PWA standard
  { size: 512, name: 'icon-512.png' },  // PWA hi-res
];

// Maskable: 80 % safe zone — shrink content to 80 % and pad with black
const MASKABLE = {
  size: 512,
  name: 'icon-512-maskable.png',
  innerScale: 0.8,
  bg: { r: 0, g: 0, b: 0, alpha: 1 },
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Standard icons
  for (const { size, name } of SIZES) {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .png({ compressionLevel: 9 })
      .toFile(resolve(OUT_DIR, name));
    console.log(`✓ ${name} (${size}×${size})`);
  }

  // Maskable: resize source to 80 % of canvas, then composite on black canvas
  const inner = Math.round(MASKABLE.size * MASKABLE.innerScale);
  const innerBuf = await sharp(SOURCE)
    .resize(inner, inner, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: MASKABLE.size,
      height: MASKABLE.size,
      channels: 4,
      background: MASKABLE.bg,
    },
  })
    .composite([{ input: innerBuf, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT_DIR, MASKABLE.name));
  console.log(`✓ ${MASKABLE.name} (${MASKABLE.size}×${MASKABLE.size}, maskable, inner ${inner}px)`);

  console.log('\nHotovo. Ikony jsou v public/icons/.');
}

main().catch((e) => {
  console.error('Chyba:', e);
  process.exit(1);
});
