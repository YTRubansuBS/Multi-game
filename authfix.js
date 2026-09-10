(()=>{
'use strict';
const fakeEmail=p=>{const s=String(p||'').trim().toLowerCase().replace(/[^a-z0-9._-]/g,'');return s?s+'@crownrift.local':''};
function fields(){return {email:document.getElementById('email'),password:document.getElementById('password'),username:document.getElementById('username'),button:document.getElementById('authButton'),msg:document.getElementById('authMsg')}}
function patch(){
 const f=fields(); if(!f.username||!f.password)return;
 if(f.email){f.email.type='hidden';f.email.value=fakeEmail(f.username.value)}
 f.username.classList.remove('hidden');f.username.style.display='';f.username.placeholder='Pseudo';f.username.autocomplete='username';
 f.password.type='password';f.password.placeholder='Mot de passe';f.password.required=true;f.password.autocomplete='current-password';
 const tabs=document.getElementById('loginMode'), signup=document.getElementById('signupMode');
 if(tabs&&signup){tabs.textContent='CONNEXION';signup.textContent='CRÉER UN COMPTE'}
 const old=window.setAuthMode;
 window.setAuthMode=function(mode){
   window.authMode=mode;
   if(tabs)tabs.classList.toggle('on',mode==='login');
   if(signup)signup.classList.toggle('on',mode==='signup');
   f.username.classList.remove('hidden');f.username.style.display='';
   if(f.email){f.email.type='hidden';f.email.value=fakeEmail(f.username.value)}
   if(f.button)f.button.textContent=mode==='login'?"⚔️ ENTRER DANS L'ARÈNE":'✨ CRÉER MON COMPTE';
   f.username.placeholder='Pseudo';
 };
 const note=f.username.parentElement?.parentElement||f.username.parentElement;
 if(note&&!document.getElementById('crAuthNote')){const d=document.createElement('div');d.id='crAuthNote';d.textContent='Connexion avec ton PSEUDO + ton MOT DE PASSE. Aucun e-mail à saisir.';d.style.cssText='margin:8px 0 12px;padding:10px 12px;border-radius:11px;background:#ffffff08;border:1px solid #ffffff12;color:#cdbfd5;font-size:11px';note.parentElement?.insertBefore(d,note)}
 const sync=()=>{if(f.email)f.email.value=fakeEmail(f.username.value)};f.username.addEventListener('input',sync);sync();
 window.authSubmit=async function(){
   const pseudo=f.username.value.trim(),password=f.password.value;
   if(!window.sb)return toast('Supabase non configuré.');
   if(pseudo.length<2)return toast('Entre un pseudo d’au moins 2 caractères.');
   if(password.length<6)return toast('Le mot de passe doit faire au moins 6 caractères.');
   sync(); if(f.button)f.button.disabled=true;
   try{
     if(window.authMode==='signup'){
       const q=await window.sb.auth.signUp({email:f.email.value,password,options:{data:{username:pseudo,display_name:pseudo}}});
       if(q.error)throw q.error;
       if(!q.data.session){
         if(f.msg){f.msg.textContent='Compte créé. Si Supabase demande une confirmation e-mail, désactive « Confirm email » dans Authentication → Providers → Email.';f.msg.style.color='#ffd23f'}
         return;
       }
       window.user=q.data.user; if(typeof window.loadProfile==='function')await window.loadProfile(); if(typeof window.enterApp==='function')window.enterApp(); toast('Bienvenue 👑');
     }else{
       const q=await window.sb.auth.signInWithPassword({email:f.email.value,password});
       if(q.error)throw q.error;
       window.user=q.data.user; if(typeof window.loadProfile==='function')await window.loadProfile(); if(typeof window.enterApp==='function')window.enterApp(); toast('Connexion réussie ⚔️');
     }
   }catch(e){toast(e.message||'Erreur de connexion');}
   finally{if(f.button)f.button.disabled=false}
 };
 if(window.authMode===undefined)window.authMode='login';
 window.setAuthMode(window.authMode);
}
window.addEventListener('load',()=>setTimeout(patch,350));
setTimeout(()=>{try{patch()}catch(e){}},1200);
})();
