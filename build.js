const fs=require('fs');
if(!fs.existsSync('public')) fs.mkdirSync('public');

const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const anonKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY||'';

// Ce fichier est généré pendant le build avec les variables Vercel.
fs.writeFileSync(
  'public/supabase-runtime.js',
  `window.__CROWN_RIFT_SUPABASE__=${JSON.stringify({url,anonKey})};`
);

let html=fs.readFileSync('index.html','utf8');
const scripts=['supabase-runtime.js','supabasefix.js','rooms.js','gamepatch.js','authfix.js','roomfix.js','adminfix.js'];

for(const file of scripts){
  if(!html.includes(file)){
    html=html.replace('</body>',`<script src="/${file}"></script></body>`);
  }
}

fs.writeFileSync('public/index.html',html);

// supabase-runtime.js est déjà généré directement dans public/.
// On ne tente donc surtout pas de le copier depuis la racine.
for(const file of scripts.filter(file=>file!=='supabase-runtime.js')){
  if(!fs.existsSync(file)) throw new Error(`Fichier manquant: ${file}`);
  fs.copyFileSync(file,`public/${file}`);
}

console.log('CROWN RIFT build OK: Supabase runtime + pseudo auth + rooms + deck + admin rewards.');
