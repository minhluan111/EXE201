const fs = require('fs');
const path = require('path');
const dir = 'E:\\IELTS\\EXE201\\MONARI';
const files = fs.readdirSync(dir);

files.forEach(f => {
  const p = path.join(dir, f);
  const buf = Buffer.alloc(16);
  const fd = fs.openSync(p, 'r');
  fs.readSync(fd, buf, 0, 16, 0);
  fs.closeSync(fd);
  const hex = buf.toString('hex');
  const ascii = buf.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
  console.log(`${f.slice(0, 30).padEnd(32)} | Hex: ${hex} | ASCII: ${ascii}`);
});
