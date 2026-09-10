const fs=require('fs');
if(!fs.existsSync('public')) fs.mkdirSync('public');
const html=fs.readFileSync('index.html','utf8');
fs.writeFileSync('public/index.html',html);
console.log('CROWN RIFT build OK: public/index.html created.');
