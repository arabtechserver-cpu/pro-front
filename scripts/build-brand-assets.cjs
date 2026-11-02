const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public/images/brand");
const write = (file, buffer) => fs.writeFile(path.join(root, file), buffer);

function ico(images) {
  const directory = Buffer.alloc(6 + images.length * 16);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(images.length, 4);
  let offset = directory.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;
    directory[entry] = size === 256 ? 0 : size;
    directory[entry + 1] = size === 256 ? 0 : size;
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([directory, ...images.map(image => image.data)]);
}

function shareSvg(lang, mark) {
  const ar = lang === "ar";
  const copy = ar
    ? `<text x="1125" y="235" text-anchor="start" direction="rtl" font-size="56" font-weight="bold" fill="#f4f7ed">عرب تك برو سيرفر</text><text x="1125" y="318" text-anchor="start" direction="rtl" font-size="34" fill="#d3fc59">سوفت وير الهواتف</text><text x="1125" y="368" text-anchor="start" direction="rtl" font-size="34" fill="#d3fc59">والخدمات عن بُعد</text>`
    : `<text x="80" y="214" font-size="58" font-weight="bold" fill="#f4f7ed">ARAB TECH PRO</text><text x="80" y="285" font-size="63" font-weight="bold" letter-spacing="8" fill="#f4f7ed">SERVER</text><text x="80" y="365" font-size="28" fill="#d3fc59">Phone software &amp; remote services</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><radialGradient id="glow"><stop stop-color="#36713b" stop-opacity=".65"/><stop offset="1" stop-color="#071e16" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="#071e16"/><ellipse cx="${ar ? 290 : 940}" cy="300" rx="430" ry="360" fill="url(#glow)"/><rect x="26" y="26" width="1148" height="578" rx="28" fill="none" stroke="#476c40" stroke-width="2"/><image href="data:image/png;base64,${mark}" x="${ar ? 45 : 750}" y="85" width="405" height="405"/><g font-family="Tahoma, Arial, sans-serif">${copy}<text x="${ar ? 1125 : 80}" y="535" text-anchor="${ar ? "end" : "start"}" font-size="23" letter-spacing="1" fill="#a8bca9">arabtechproserver.tech</text></g><path d="M80 430h1040" stroke="#285039"/><circle cx="${ar ? 1115 : 85}" cy="470" r="5" fill="#d3fc59"/></svg>`;
}

function wordmarkSvg(lang, mark, dark = false) {
  const ar = lang === "ar";
  const text = dark ? "#f4f7ed" : "#143b2b";
  const muted = dark ? "#c1d59e" : "#5d784a";
  const copy = ar
    ? `<text x="825" y="130" text-anchor="start" direction="rtl" font-size="78" font-weight="bold" fill="${text}">عرب تك برو سيرفر</text><text x="825" y="195" text-anchor="start" direction="rtl" font-size="34" fill="${muted}">سوفت وير وخدمات عن بُعد</text>`
    : `<text x="285" y="125" font-size="58" font-weight="bold" fill="${text}">ARAB TECH PRO SERVER</text><text x="287" y="185" font-size="27" letter-spacing="1" fill="${muted}">SOFTWARE &amp; REMOTE SERVICES</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="260"><image href="data:image/png;base64,${mark}" x="${ar ? 860 : 20}" y="10" width="230" height="240"/><g font-family="Tahoma, Arial, sans-serif">${copy}</g></svg>`;
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  // Use an installed Arabic-capable UI font when available; do not bundle system fonts.
  const fontFile = path.join(process.env.WINDIR || "C:/Windows", "Fonts/tahomabd.ttf");
  try {
    await fs.access(fontFile);
    await sharp({ text: { text: "عرب تك", font: "Tahoma Bold 12", fontfile: fontFile, rgba: true } }).png().toBuffer();
  } catch { /* The platform's default Arabic fallback remains available. */ }
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const mark = await sharp(path.join(output, "atp-master-v2.png")).trim({ threshold: 12 }).resize(900, 900, { fit: "contain", background: transparent }).png().toBuffer();
  await write("public/images/brand/mark-v2.png", mark);
  await sharp(mark).resize(256, 256).webp({ quality: 95 }).toFile(path.join(output, "mark-v2.webp"));
  const base64 = mark.toString("base64");

  for (const lang of ["ar", "en"]) {
    const share = await sharp(Buffer.from(shareSvg(lang, base64))).png().toBuffer();
    await write(`public/images/brand/share-${lang}-v2.png`, share);
    await write(`public/images/og_share_${lang}.png`, share);
    for (const dark of [false, true]) {
      const wordmark = await sharp(Buffer.from(wordmarkSvg(lang, base64, dark))).png().toBuffer();
      await write(`public/images/brand/wordmark-${lang}-${dark ? "dark" : "light"}-v2.png`, wordmark);
      if (!dark) {
        await write(`public/images/logo_${lang}.png`, wordmark);
        await sharp(wordmark).webp({ quality: 95 }).toFile(path.join(root, `public/images/logo_${lang}.webp`));
        await sharp(wordmark).flatten({ background: "#f5f4ef" }).jpeg({ quality: 95 }).toFile(path.join(root, `public/images/logo_${lang}.jpg`));
      }
    }
  }

  const iconCanvas = await sharp(mark).resize(460, 460).extend({ top: 26, bottom: 26, left: 26, right: 26, background: "#0a2118" }).png().toBuffer();
  for (const size of [48, 180, 192, 512]) {
    const data = await sharp(iconCanvas).resize(size, size).png().toBuffer();
    const name = size === 48 ? "icon-48-v2.png" : size === 180 ? "apple-touch-icon-v2.png" : `logo-${size}-v2.png`;
    await write(`public/images/brand/${name}`, data);
  }
  const favicon = ico(await Promise.all([16, 32, 48, 64, 128, 256].map(async size => ({ size, data: await sharp(iconCanvas).resize(size, size).png().toBuffer() }))));
  for (const file of ["public/images/brand/favicon-v2.ico", "public/favicon.ico", "src/app/favicon.ico"]) await write(file, favicon);
  const canonical = await fs.readFile(path.join(output, "logo-512-v2.png"));
  for (const file of ["public/main-logo.png", "public/icon.png"]) await write(file, canonical);
  const apple = await fs.readFile(path.join(output, "apple-touch-icon-v2.png"));
  for (const file of ["public/apple-icon.png", "public/images/apple-touch-icon.png"]) await write(file, apple);
  await write("public/images/icon-48.png", await fs.readFile(path.join(output, "icon-48-v2.png")));
  const share = await fs.readFile(path.join(output, "share-en-v2.png"));
  for (const file of ["public/og-image.png", "public/images/og-image.png"]) await write(file, share);
  await sharp(share).jpeg({ quality: 95 }).toFile(path.join(root, "public/images/og-image.jpg"));
  console.log("Generated ATP brand marks, wordmarks, share cards, app icons and multi-resolution favicons.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
