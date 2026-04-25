/**
 * Converts public/favicon.png → public/favicon.ico
 * An .ico file is just a container of multiple BMP/PNG images.
 * We manually write the ICO binary format with 16x16 and 32x32 sizes.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'favicon.png');
const DEST = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
const DEST2 = path.join(__dirname, '..', 'public', 'favicon.ico');

async function pngToIco(sizes) {
  const images = await Promise.all(
    sizes.map(size =>
      sharp(SRC)
        .resize(size, size)
        .ensureAlpha()          // force RGBA (4 channels)
        .png({ compressionLevel: 9 })
        .toBuffer()
    )
  );

  // ICO format: ICONDIR header + ICONDIRENTRY[] + image data
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const headerSize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * images.length;

  let offset = headerSize;
  const entries = [];
  for (let i = 0; i < images.length; i++) {
    entries.push({ buf: images[i], offset });
    offset += images[i].length;
  }

  const totalSize = offset;
  const ico = Buffer.alloc(totalSize);

  // ICONDIR
  ico.writeUInt16LE(0, 0);           // Reserved
  ico.writeUInt16LE(1, 2);           // Type: 1 = ICO
  ico.writeUInt16LE(images.length, 4); // Image count

  // ICONDIRENTRY for each image
  entries.forEach(({ buf, offset: imgOffset }, i) => {
    const base = ICONDIR_SIZE + i * ICONDIRENTRY_SIZE;
    const size = sizes[i];
    ico.writeUInt8(size === 256 ? 0 : size, base);     // Width (0 = 256)
    ico.writeUInt8(size === 256 ? 0 : size, base + 1); // Height
    ico.writeUInt8(0, base + 2);   // Color count
    ico.writeUInt8(0, base + 3);   // Reserved
    ico.writeUInt16LE(1, base + 4); // Color planes
    ico.writeUInt16LE(32, base + 6); // Bits per pixel
    ico.writeUInt32LE(buf.length, base + 8);  // Image data size
    ico.writeUInt32LE(imgOffset, base + 12);  // Offset to image data
  });

  // Write image data
  entries.forEach(({ buf, offset: imgOffset }) => {
    buf.copy(ico, imgOffset);
  });

  fs.writeFileSync(DEST, ico);
  fs.writeFileSync(DEST2, ico);
  console.log(`✅ favicon.ico written (${(totalSize / 1024).toFixed(1)} KB) with sizes: ${sizes.join(', ')}px`);
}

pngToIco([16, 32, 48, 64]).catch(console.error);
