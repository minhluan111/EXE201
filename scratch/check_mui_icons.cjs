const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@mui/icons-material')) {
        console.log('Found @mui/icons-material in:', fullPath);
      }
    }
  }
}

scanDir('E:\\IELTS\\EXE201\\FE\\src');
console.log('Scan complete.');
