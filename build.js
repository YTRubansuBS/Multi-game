const fs=require('fs');
if(!fs.existsSync('public')) fs.mkdirSync('public');
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('rooms.js')) html=html.replace('</body>','<script src="/rooms.js"></script></body>');
if(!html.includes('gamepatch.js')) html=html.replace('</body>','<script src="/gamepatch.js"></script></body>');
fs.writeFileSync('public/index.html',html);
fs.copyFileSync('rooms.js','public/rooms.js');
fs.copyFileSync('gamepatch.js','public/gamepatch.js');
console.log('CROWN RIFT build OK: rooms + admin + deck + battle improvements copied.');
