const fs=require('fs');
if(!fs.existsSync('public')) fs.mkdirSync('public');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const anonKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY||'';
fs.writeFileSync('public/supabase-runtime.js',`window.__CROWN_RIFT_SUPABASE__=${JSON.stringify({url,anonKey})};`);
let html=fs.readFileSync('index.html','utf8');
for(const file of ['supabase-runtime.js','supabasefix.js','rooms.js','gamepatch.js','authfix.js','roomfix.js','adminfix.js']){
  if(!html.includes(file)) html=html.replace('</body>',`<script src="/${file}"></script></body>`);
}
fs.writeFileSync('public/index.html',html);
for(const file of ['supabase-runtime.js','supabasefix.js','rooms.js','gamepatch.js','authfix.js','roomfix.js','adminfix.js']) fs.copyFileSync(file,`public/${file}`);
console.log('CROWN RIFT build OK: Supabase runtime + pseudo auth + rooms + deck + admin rewards.');
