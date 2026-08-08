const fs = require('fs');
const path = require('path');
const dir = 'E:\\IELTS\\EXE201\\MONARI';
const files = fs.readdirSync(dir);
console.log('Total files in MONARI:', files.length);
files.forEach((f, i) => {
  const stat = fs.statSync(path.join(dir, f));
  console.log((i + 1) + '. [' + (stat.size / 1024 / 1024).toFixed(2) + ' MB] ' + f);
});
