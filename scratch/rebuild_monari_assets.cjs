const fs = require('fs');
const path = require('path');
const heicConvert = require('E:/IELTS/EXE201/FE/node_modules/heic-convert');

const sourceDir = 'E:\\IELTS\\EXE201\\MONARI';
const userUploaded = 'C:\\Users\\luanq\\.gemini\\antigravity\\brain\\dd2c662f-251a-430d-9c96-e8ba20ce603d\\.user_uploaded\\media_1786124396680.png';
const targetBase = 'E:\\IELTS\\EXE201\\FE\\public\\assets\\monari';
const decorDir = path.join(targetBase, 'decor');
const menuDir = path.join(targetBase, 'menu');
const tablesDir = path.join(targetBase, 'tables');

[decorDir, menuDir, tablesDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function convertAndSave(sourceFile, destFile, quality = 0.85) {
  const sourcePath = path.isAbsolute(sourceFile) ? sourceFile : path.join(sourceDir, sourceFile);
  if (!fs.existsSync(sourcePath)) {
    console.error('File missing:', sourcePath);
    return;
  }

  const buf = fs.readFileSync(sourcePath);
  const isHeic = buf.slice(4, 12).toString('ascii').includes('ftypheic') || buf.slice(4, 12).toString('ascii').includes('ftyp');

  let outputBuffer;
  if (isHeic) {
    outputBuffer = await heicConvert({
      buffer: buf,
      format: 'JPEG',
      quality: quality
    });
  } else {
    outputBuffer = buf;
  }

  fs.writeFileSync(destFile, outputBuffer);
  console.log(`Saved: ${path.basename(destFile)} (${(outputBuffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('=== Processing all Monari Space & Menu Images ===');

  // 1. Logo
  if (fs.existsSync(userUploaded)) {
    fs.copyFileSync(userUploaded, path.join(decorDir, 'logo.png'));
    fs.copyFileSync(userUploaded, path.join(decorDir, 'logo.jpg'));
    console.log('Copied user uploaded Monari Logo!');
  }

  // 2. Real Space photos (Không gian quán)
  await convertAndSave('Không gian quán', path.join(decorDir, 'hero_bg.jpg'), 0.85);
  await convertAndSave('Không gian quán', path.join(decorDir, 'space_main.jpg'), 0.85);
  await convertAndSave('Không gian quán(1)', path.join(decorDir, 'space_1.jpg'), 0.85);
  await convertAndSave('Không gian quán(2)', path.join(decorDir, 'space_2.jpg'), 0.85);
  await convertAndSave('Không gian quán(3)', path.join(decorDir, 'space_3.jpg'), 0.85);
  await convertAndSave('Để trong không gian quán.png', path.join(decorDir, 'space_decor.jpg'), 0.85);
  await convertAndSave('IMG_4195.JPG', path.join(decorDir, 'space_view_1.jpg'), 0.85);
  await convertAndSave('IMG_4196.JPG', path.join(decorDir, 'space_view_2.jpg'), 0.85);
  await convertAndSave('IMG_4197.JPG', path.join(decorDir, 'space_view_3.jpg'), 0.85);
  await convertAndSave('IMG_4198.JPG', path.join(decorDir, 'space_view_4.jpg'), 0.85);

  // 3. Tables
  await convertAndSave('Bàn 2 người', path.join(tablesDir, 'ban_2_nguoi.jpg'), 0.85);
  await convertAndSave('Bàn 4 người.png', path.join(tablesDir, 'ban_4_nguoi.jpg'), 0.85);
  await convertAndSave('Bàn 8 người.png', path.join(tablesDir, 'ban_8_nguoi.jpg'), 0.85);
  await convertAndSave('Không gian quán(3)', path.join(tablesDir, 'san_vuon.jpg'), 0.85);

  // 4. Menu Items
  await convertAndSave('(Menu) Set bánh trung thu 🥮 (Set bánh gồm 4 cái, 2 nhân ngọt, 2 nhân mạnh) - 552.000₫', path.join(menuDir, 'set_banh_trung_thu.jpg'), 0.85);
  await convertAndSave('Coco matcha - 55.000₫ (Matcha + nước dừa tươi)', path.join(menuDir, 'coco_matcha.jpg'), 0.85);
  await convertAndSave('Nước dừa quế hoa🥥 - 49.000₫_', path.join(menuDir, 'nuoc_dua_que_hoa.jpg'), 0.85);
  await convertAndSave('Trà lựu đỏ - 48.000₫ (Trà lựu đỏ + hạt ngọc trai)', path.join(menuDir, 'tra_luu_do.jpg'), 0.85);
  await convertAndSave('Trà ổi hồng - 48.000₫ (Trà ổi hồng + hạt ngọc trai)', path.join(menuDir, 'tra_oi_hong.jpg'), 0.85);
  await convertAndSave('Nước_', path.join(menuDir, 'tra_trai_cay.jpg'), 0.85);

  console.log('=== Finished Rebuilding Monari Assets ===');
}

main().catch(console.error);
