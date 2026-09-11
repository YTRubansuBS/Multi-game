const fs=require('fs');
if(!fs.existsSync('public'))fs.mkdirSync('public');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const anonKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY||'';
if(!url||!anonKey)throw new Error('Variables Supabase manquantes dans Vercel: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
let html=fs.readFileSync('index.html','utf8');
const runtime={url,anonKey};
const bootstrap=`<script>window.__CROWN_RIFT_SUPABASE__=${JSON.stringify(runtime)};(function(){const originalFetch=window.fetch.bind(window);window.fetch=async function(input,init){const u=typeof input==='string'?input:(input&&input.url)||'';if(u==='/api/config'||u.endsWith('/api/config')){const c=window.__CROWN_RIFT_SUPABASE__;return new Response(JSON.stringify({url:c.url,anonKey:c.anonKey}),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}return originalFetch(input,init)}})();</script>`;
if(!html.includes('window.__CROWN_RIFT_SUPABASE__'))html=html.replace('<head>','<head>'+bootstrap);
const scripts=['rooms.js','gamepatch.js','authfix.js','roomfix.js','adminfix.js','crownfix.js','chatfix.js','cards300.js','ui300fix.js','battlefix2.js','featurepatch.js','battlebalance.js'];
for(const file of scripts){if(!html.includes(file))html=html.replace('</body>',`<script src="/${file}"></script></body>`)}
html=html.replace("sb=window.supabase.createClient(cfg.url,cfg.anonKey);","sb=window.supabase.createClient(cfg.url,cfg.anonKey);window.sb=sb;");
if(!html.includes('window.sb=sb'))html=html.replace('sb=window.supabase.createClient(cfg.url,cfg.anonKey);','sb=window.supabase.createClient(cfg.url,cfg.anonKey);window.sb=sb;');
fs.writeFileSync('public/index.html',html);
for(const file of scripts){if(!fs.existsSync(file))throw new Error(`Fichier manquant: ${file}`);fs.copyFileSync(file,`public/${file}`)}
console.log('CROWN RIFT build OK');
