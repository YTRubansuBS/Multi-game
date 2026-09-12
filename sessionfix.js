(()=>{'use strict';
if(window.__CR_SESSION_FIX__)return;window.__CR_SESSION_FIX__=true;
let ready=false,busy=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function hydrate(user){
 if(!user||!window.sb)return false;
 window.user=user;
 for(let i=0;i<4;i++){
  try{
   if(typeof window.loadProfile==='function'){
    await window.loadProfile();
    if(window.profile)return true;
   }
   const q=await window.sb.from('profiles').select('*').eq('id',user.id).maybeSingle();
   if(!q.error&&q.data){window.profile=q.data;return true}
  }catch(e){}
  await sleep(250);
 }
 return !!window.profile;
}
async function restore(){
 if(busy||!window.sb)return false;busy=true;
 try{
  const q=await window.sb.auth.getSession();
  const u=q?.data?.session?.user||null;
  if(!u){ready=false;return false}
  const ok=await hydrate(u);ready=true;
  if(ok){
   window.user=u;
   window.CR_AUTH_READY=true;
   document.documentElement.dataset.crAuth='ready';
   window.dispatchEvent(new CustomEvent('crAuthReady',{detail:{user:u,profile:window.profile}}));
  }
  return ok;
 }catch(e){return false}finally{busy=false}
}
function patchPackGuards(){
 const oldToast=window.toast;
 window.CR_REQUIRE_AUTH=async function(){
  if(ready&&window.user&&window.profile)return true;
  const ok=await restore();
  if(ok)return true;
  if(oldToast)oldToast('Connexion en cours…');
  await sleep(350);
  return !!(await restore());
 };
}
async function boot(){
 patchPackGuards();
 if(!window.sb){setTimeout(boot,300);return}
 try{window.sb.auth.onAuthStateChange(async(_event,session)=>{const u=session?.user||null;if(u)await hydrate(u);else{window.user=null;window.profile=null;ready=false;}})}catch(e){}
 await restore();
 setInterval(()=>{if(window.sb&&!ready)restore()},1500);
}
window.addEventListener('load',()=>setTimeout(boot,250));
setTimeout(()=>{try{boot()}catch(e){}},1000);
})();
