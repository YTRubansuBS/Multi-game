const fs=require('fs');
if(!fs.existsSync('public')) fs.mkdirSync('public');
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('rooms.js')) html=html.replace('</body>','<script src="/rooms.js"></script></body>');
fs.writeFileSync('public/index.html',html);
fs.copyFileSync('rooms.js','public/rooms.js');
console.log('CROWN RIFT build OK: index + social rooms + admin copied.');
