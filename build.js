const fs=require('fs'),path=require('path');
const r=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
let html=r('src/template.html').replace('/*CSS*/',()=>r('src/style.css')).replace('/*CORE*/',()=>r('src/core.js')).replace('/*UI*/',()=>r('src/ui.js'));
fs.mkdirSync('dist/icons',{recursive:true});
fs.writeFileSync('dist/index.html',html);
fs.copyFileSync('node_modules/xlsx/dist/xlsx.full.min.js','dist/xlsx.full.min.js');
const sw=fs.readFileSync('dist/sw.js','utf8').replace(/const V='oradores-v\d+'/,"const V='oradores-v2'"); fs.writeFileSync('dist/sw.js',sw);
console.log('dist ok',(html.length/1024).toFixed(0)+' KB');
