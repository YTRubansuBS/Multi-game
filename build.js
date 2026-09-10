const fs=require('fs');
const file='index.html';
let html=fs.readFileSync(file,'utf8');
html=html.replaceAll('__SUPABASE_URL__',process.env.NEXT_PUBLIC_SUPABASE_URL||'');
html=html.replaceAll('__SUPABASE_PUBLISHABLE_KEY__',process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'');
fs.writeFileSync(file,html);
console.log('CROWN RIFT build: Supabase variables injected.');
