const fs = require('fs');
const heicConvert = require('heic-convert');

async function test() {
  const inputBuffer = fs.readFileSync('E:\\IELTS\\EXE201\\MONARI\\Bàn 2 người');
  console.log('Read HEIC bytes:', inputBuffer.length);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.85
  });
  console.log('Converted JPEG bytes:', outputBuffer.length);
  fs.writeFileSync('E:\\IELTS\\EXE201\\FE\\public\\assets\\monari\\tables\\ban_2_nguoi.jpg', outputBuffer);
  console.log('Saved test image successfully!');
}

test().catch(console.error);
