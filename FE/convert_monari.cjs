const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

const sourceDir = 'E:\\IELTS\\EXE201\\MONARI';
const targetBase = 'E:\\IELTS\\EXE201\\FE\\public\\assets\\monari';
const decorDir = path.join(targetBase, 'decor');
const menuDir = path.join(targetBase, 'menu');
const tablesDir = path.join(targetBase, 'tables');

[decorDir, menuDir, tablesDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function convertFile(sourceFile, destFile, quality = 0.85) {
  const sourcePath = path.join(sourceDir, sourceFile);
  if (!fs.existsSync(sourcePath)) {
    console.error('File does not exist:', sourcePath);
    return;
  }

  const buf = fs.readFileSync(sourcePath);
  const isHeic = buf.slice(4, 12).toString('ascii').includes('ftypheic') || buf.slice(4, 12).toString('ascii').includes('ftyp');
  const isPng = buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  const isJpg = buf.slice(0, 3).toString('hex') === 'ffd8ff';

  let outputBuffer;
  if (isHeic) {
    outputBuffer = await heicConvert({
      buffer: buf,
      format: 'JPEG',
      quality: quality
    });
  } else {
    // For JPEG / PNG, if it's already an image, write buffer directly
    outputBuffer = buf;
  }

  fs.writeFileSync(destFile, outputBuffer);
  const sizeKB = (outputBuffer.length / 1024).toFixed(1);
  console.log(`Converted: ${sourceFile} -> ${path.basename(destFile)} (${sizeKB} KB)`);
}

async function run() {
  console.log('=== Starting MONARI Image Conversion & Optimization ===');

  const files = fs.readdirSync(sourceDir);

  for (const f of files) {
    const lower = f.toLowerCase();

    // 1. Menu Items
    if (lower.includes('trung thu')) {
      if (lower.includes('(1)')) {
        await convertFile(f, path.join(menuDir, 'set_banh_trung_thu_1.jpg'), 0.82);
      } else if (lower.includes('(2)')) {
        await convertFile(f, path.join(menuDir, 'set_banh_trung_thu_2.jpg'), 0.82);
      } else {
        await convertFile(f, path.join(menuDir, 'set_banh_trung_thu.jpg'), 0.82);
      }
    }
    else if (lower.includes('coco matcha')) {
      await convertFile(f, path.join(menuDir, 'coco_matcha.jpg'), 0.82);
    }
    else if (lower.includes('quế hoa') || lower.includes('que hoa')) {
      await convertFile(f, path.join(menuDir, 'nuoc_dua_que_hoa.jpg'), 0.82);
    }
    else if (lower.includes('lựu đỏ') || lower.includes('luu do')) {
      await convertFile(f, path.join(menuDir, 'tra_luu_do.jpg'), 0.82);
    }
    else if (lower.includes('ổi hồng') || lower.includes('oi hong')) {
      await convertFile(f, path.join(menuDir, 'tra_oi_hong.jpg'), 0.82);
    }
    else if (lower === 'nước_' || lower === 'nuoc_') {
      await convertFile(f, path.join(menuDir, 'tra_trai_cay.jpg'), 0.82);
    }

    // 2. Tables / Seating
    else if (lower.includes('bàn 2') || lower.includes('ban 2')) {
      if (lower.includes('(1)')) {
        await convertFile(f, path.join(tablesDir, 'ban_2_nguoi_1.jpg'), 0.82);
      } else if (lower.includes('(2)')) {
        await convertFile(f, path.join(tablesDir, 'ban_2_nguoi_2.jpg'), 0.82);
      } else if (lower.includes('(3)')) {
        await convertFile(f, path.join(tablesDir, 'ban_2_nguoi_3.jpg'), 0.82);
      } else {
        await convertFile(f, path.join(tablesDir, 'ban_2_nguoi.jpg'), 0.82);
      }
    }
    else if (lower.includes('bàn 4') || lower.includes('ban 4')) {
      if (lower.includes('(1)')) {
        await convertFile(f, path.join(tablesDir, 'ban_4_nguoi_1.jpg'), 0.82);
      } else if (lower.endsWith('.png')) {
        await convertFile(f, path.join(tablesDir, 'ban_4_nguoi_2.png'), 0.82);
      } else {
        await convertFile(f, path.join(tablesDir, 'ban_4_nguoi.jpg'), 0.82);
      }
    }
    else if (lower.includes('bàn 8') || lower.includes('ban 8')) {
      await convertFile(f, path.join(tablesDir, 'ban_8_nguoi.png'), 0.82);
    }

    // 3. Decor / Space
    else if (lower.includes('không gian quán') || lower.includes('khong gian quan')) {
      if (lower.includes('(1)')) {
        await convertFile(f, path.join(decorDir, 'decor_1.jpg'), 0.82);
      } else if (lower.includes('(2)')) {
        await convertFile(f, path.join(decorDir, 'decor_2.jpg'), 0.82);
      } else if (lower.includes('(3)')) {
        await convertFile(f, path.join(decorDir, 'decor_3.jpg'), 0.82);
      } else {
        await convertFile(f, path.join(decorDir, 'hero_bg.jpg'), 0.85);
        await convertFile(f, path.join(decorDir, 'space_main.jpg'), 0.82);
      }
    }
    else if (lower.includes('không gian') || lower.includes('khong gian')) {
      await convertFile(f, path.join(decorDir, 'decor_4.png'), 0.82);
    }
  }

  // Also copy/link logo and decor gallery
  if (fs.existsSync(path.join(decorDir, 'decor_1.jpg'))) {
    fs.copyFileSync(path.join(decorDir, 'decor_1.jpg'), path.join(decorDir, 'logo.jpg'));
  }

  console.log('=== Finished MONARI Image Conversion ===');
}

run().catch(console.error);
