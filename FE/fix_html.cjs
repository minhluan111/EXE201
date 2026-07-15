const fs = require('fs');

// 1. Clean index.html
let html = fs.readFileSync('index.html', 'utf8');
// Remove all og: tags
html = html.replace(/<meta property="og:title".*?\/>\n?/g, '');
html = html.replace(/<meta property="og:image".*?\/>\n?/g, '');

// Clean any empty lines that might have been left
html = html.replace(/^\s*[\r\n]/gm, '');

// Add the correct Yakishime og tags
html = html.replace('<title>Yakishime</title>', '<title>Yakishime</title>\n    <meta property="og:title" content="Yakishime" />\n    <meta property="og:image" content="/assets/images/logo.jpg" />');
fs.writeFileSync('index.html', html);

// 2. Generate other HTMLs cleanly
const tenants = [
  { name: 'comtam', title: 'Cơm Tấm Ngọ', icon: '/assets/comtamno/logo.jpg', isPng: false },
  { name: 'samhouse', title: 'Sam Houses', icon: '/assets/samhouse/decor/logo.png', isPng: true },
  { name: 'monquanchat', title: 'Món Quảng Chất', icon: '/assets/monquanchat/decor/logo.png', isPng: true },
  { name: 'hoatearoom', title: 'Hòa Tea Room', icon: '/assets/hoatearoom/decor/logo.png', isPng: true }
];

tenants.forEach(t => {
  let newHtml = html.replace('<title>Yakishime</title>\n    <meta property="og:title" content="Yakishime" />\n    <meta property="og:image" content="/assets/images/logo.jpg" />', '<title>' + t.title + '</title>\n    <meta property="og:title" content="' + t.title + '" />\n    <meta property="og:image" content="' + t.icon + '" />');
  newHtml = newHtml.replace('<link id="favicon-link" rel="icon" type="image/jpeg" href="/assets/images/logo.jpg" />', '<link id="favicon-link" rel="icon" type="image/' + (t.isPng ? 'png' : 'jpeg') + '" href="' + t.icon + '" />');
  fs.writeFileSync(t.name + '.html', newHtml);
});
console.log('Fixed and regenerated');
