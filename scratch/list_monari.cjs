const fs = require('fs');
const path = require('path');

const srcDir = 'E:\\IELTS\\EXE201\\MONARI';
const files = fs.readdirSync(srcDir);

console.log('Files in MONARI:');
files.forEach(f => {
  const stat = fs.statSync(path.join(srcDir, f));
  console.log(`- "${f}" (${(stat.size / 1024).toFixed(1)} KB)`);
});
