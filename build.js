const fs=require('fs');
if(!fs.existsSync('public')) fs.mkdirSync('public');
let html=fs.readFileSync('index.html','utf8');
for(const file of ['rooms.js','gamepatch.js','authfix.js','roomfix.js']){
  if(!html.includes(file)) html=html.replace('</body>',`<script src="/${file}"></script></body>`);
}
fs.writeFileSync('public/index.html',html);
for(const file of ['rooms.js','gamepatch.js','authfix.js','roomfix.js']) fs.copyFileSync(file,`public/${file}`);
console.log('CROWN RIFT build OK: auth pseudo+password + rooms + deck + battle patches copied.');
