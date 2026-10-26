// public/icons/resize.js
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const image = await loadImage('icon-512x512.png');
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, size, size);
    fs.writeFileSync(`icon-${size}x${size}.png`, canvas.toBuffer('image/png'));
    console.log(`✅ Created icon-${size}x${size}.png`);
  });
}

generateIcons().catch(console.error);