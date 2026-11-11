// Execute com node build.js a partir de qualquer pasta.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const html = read('template.html').replace('/*CSS*/', () => read('style.css')).replace('/*CORE*/', () => read('core.js')).replace('/*UI*/', () => read('ui.js'));
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
const hash = crypto.createHash('sha256');
['index.html','manifest.json','xlsx.full.min.js','icon-192.png','icon-512.png','icon-maskable-512.png'].forEach(name => hash.update(fs.readFileSync(path.join(__dirname, name))));
const version = 'oradores-' + hash.digest('hex').slice(0,16);
fs.writeFileSync(path.join(__dirname, 'sw.js'), read('sw.js').replace(/const V = '[^']+';/, `const V = '${version}';`));
console.log('App gerado:', version);
