const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const tenants = [
  { name: 'comtam', title: 'Cơm Tấm Ngọ', icon: '/assets/comtamno/logo.jpg', isPng: false },
  { name: 'samhouse', title: 'Sam Houses', icon: '/assets/samhouse/decor/logo.png', isPng: true },
  { name: 'monquanchat', title: 'Món Quảng Chất', icon: '/assets/monquanchat/decor/logo.png', isPng: true },
  { name: 'hoatearoom', title: 'Hòa Tea Room', icon: '/assets/hoatearoom/decor/logo.png', isPng: true },
  { name: 'emcoffee', title: 'Em Coffee', icon: '/assets/emcoffee/logo.jpg', isPng: false },
  { name: 'monari', title: 'MONARI', icon: '/assets/monari/decor/logo.png', isPng: true },
  { name: 'cochin', title: 'Cochin Café', icon: '/assets/cochin/logo.jpg', isPng: false },
  { name: 'taotao', title: 'Táo Tào cà phê', icon: '/assets/taotao/logo.jpg', isPng: false },
  { name: 'hanhuyen', title: 'Quán Nước Hàn Huyên', icon: '/assets/hanhuyen/Logo.jpg', isPng: false },
  { name: 'yakishime', title: 'Yakishime', icon: '/assets/images/logo.jpg', isPng: false }
];

tenants.forEach(t => {
  let newHtml = html.replace('<title>Yakishime</title>', '<title>' + t.title + '</title>\n    <meta property="og:title" content="' + t.title + '" />\n    <meta property="og:image" content="' + t.icon + '" />');
  newHtml = newHtml.replace('<link id="favicon-link" rel="icon" type="image/jpeg" href="/assets/images/logo.jpg" />', '<link id="favicon-link" rel="icon" type="image/' + (t.isPng ? 'png' : 'jpeg') + '" href="' + t.icon + '" />');
  fs.writeFileSync(t.name + '.html', newHtml);
});

// Update original index.html with OG tags too
let originalHtml = html.replace('<title>Yakishime</title>', '<title>Yakishime</title>\n    <meta property="og:title" content="Yakishime" />\n    <meta property="og:image" content="/assets/images/logo.jpg" />');
fs.writeFileSync('index.html', originalHtml);
console.log('Generated HTML files.');
