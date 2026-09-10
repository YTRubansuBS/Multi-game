(()=>{
'use strict';
async function sessionUser(){
 try{
  if(window.sb?.auth){const r=await window.sb.auth.getSession();const u=r.data?.session?.user||null;window.user=u;return u}
 }catch(e){}
 return window.user||null;
}
function patch(){
 const b=document.getElementById('roomsBtn');
 if(!b)return;
 b.onclick=async()=>{
  const u=await sessionUser();
  if(!u||!window.sb)return window.toast?window.toast('Connecte-toi d’abord.') : alert('Connecte-toi d’abord.');
  const m=document.querySelector('.roomModal');
  if(m)m.classList.add('show');
 };
}
window.addEventListener('load',()=>setTimeout(patch,700));
setInterval(patch,1500);
})();
