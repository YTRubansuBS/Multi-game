(()=>{
'use strict';
// Le build Vercel crée /supabase-runtime.js avec les variables d'environnement.
// On intercepte /api/config pour que le jeu fonctionne même si la Serverless Function est absente.
const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:(input&&input.url)||'';
  if(url==='/api/config'||url.endsWith('/api/config')){
    const cfg=window.__CROWN_RIFT_SUPABASE__;
    if(cfg?.url&&cfg?.anonKey)return new Response(JSON.stringify(cfg),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  }
  return originalFetch(input,init);
};
})();
