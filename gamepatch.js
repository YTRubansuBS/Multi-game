(()=>{
'use strict';
const KEY='crown_rift_deck_v2';
const DEFAULT_COUNT=8;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cards(){return Array.isArray(window.CARDS)?window.CARDS:[]}
function owned(c){
  try{
    if(typeof window.isOwned==='function') return !!window.isOwned(c);
  }catch(e){}
  if(typeof c.owned==='number') return c.owned>0;
  if(c.owned===true) return true;
  if(Array.isArray(window.profile?.cards)) return window.profile.cards.includes(c.id)||window.profile.cards.includes(String(c.id));
  return true;
}
function getDeck(){
  const all=cards().filter(owned);
  let ids=[];
  try{ids=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){}
  ids=Array.isArray(ids)?ids:[];
  let out=ids.map(id=>all.find(c=>String(c.id)===String(id))).filter(Boolean);
  const used=new Set(out.map(c=>String(c.id)));
  if(out.length<DEFAULT_COUNT) for(const c of all){if(out.length>=DEFAULT_COUNT)break;if(!used.has(String(c.id))){out.push(c);used.add(String(c.id))}}
  return out.slice(0,DEFAULT_COUNT);
}
function saveDeck(){localStorage.setItem(KEY,JSON.stringify(deckIds));}
let deckIds=[];
function syncIds(){deckIds=getDeck().map(c=>c.id);saveDeck()}
function injectStyle(){
 if(document.getElementById('crPatchStyle'))return;
 const s=document.createElement('style');s.id='crPatchStyle';s.textContent=`
 #crDeckPanel{display:none;margin-top:12px}.crDeckGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.crDeckCard{position:relative;padding:11px;border-radius:16px;background:linear-gradient(180deg,#241432,#100814);border:1px solid #ffffff18;cursor:pointer;transition:.15s}.crDeckCard:hover{transform:translateY(-2px)}.crDeckCard.sel{outline:2px solid #ffd23f;box-shadow:0 0 22px #ffd23f20}.crDeckCard .art{height:75px;margin:0 0 7px;font-size:42px}.crDeckCard b{display:block;font-size:12px}.crDeckCard small{color:#ae9eb9;font-size:9px}.crDeckBadge{position:absolute;right:7px;top:7px;padding:4px 7px;border-radius:99px;background:#ffd23f;color:#1b0d00;font-weight:1000;font-size:9px}.crDeckHint{padding:12px;border-radius:13px;background:#ffffff06;border:1px solid #ffffff10;margin-bottom:10px;color:#cdbfd5;font-size:11px}.crDeckSlots{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 13px}.crSlot{padding:7px 10px;border-radius:10px;background:#171020;border:1px solid #ffffff12;font-size:10px}.crSlot b{color:#ffd23f}.crChest{position:absolute;top:5%;left:calc(50% - 30px);width:60px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:31px;background:linear-gradient(180deg,#ffd75a,#a85b15);border:2px solid #fff5;box-shadow:0 0 30px #ffd23f55;z-index:6}.crPatchUnitMove{transition:left .32s linear,top .32s linear}.crEnemyCap{position:absolute;right:9px;top:9px;z-index:50;padding:5px 8px;border-radius:99px;background:#170d1fdd;border:1px solid #ffffff18;color:#fff;font-size:9px;font-weight:1000}
 @media(max-width:700px){.crDeckGrid{grid-template-columns:repeat(2,1fr)}}`;
 document.head.appendChild(s);
}
function findCardsPage(){return [...document.querySelectorAll('.page')].find(p=>/card|cartes/i.test(p.id+' '+p.textContent.slice(0,100)))||document.querySelector('.page');}
function buildDeckUI(){
 if(document.getElementById('crDeckTab'))return;
 const page=findCardsPage();if(!page)return;
 const tabs=page.querySelector('.tabs');if(!tabs)return;
 const b=document.createElement('button');b.className='tab';b.id='crDeckTab';b.textContent='🃏 DECK';tabs.appendChild(b);
 const panel=document.createElement('div');panel.id='crDeckPanel';panel.className='panel glass';
 panel.innerHTML=`<div class="title" style="margin-top:0"><div><h2>🃏 Mon deck de combat</h2><span>Choisis jusqu'à ${DEFAULT_COUNT} cartes</span></div><button class="btn gold" id="crDeckReset">AUTO</button></div><div class="crDeckHint">Les cartes sélectionnées sont prioritaires pour les combats. Clique sur une carte pour l'ajouter ou la retirer.</div><div class="crDeckSlots" id="crDeckSlots"></div><div class="crDeckGrid" id="crDeckGrid"></div>`;
 page.appendChild(panel);
 const normal=[...page.querySelectorAll('.cardgrid,.filters')];
 b.onclick=()=>{const on=panel.style.display==='block';panel.style.display=on?'none':'block';b.classList.toggle('on',!on);normal.forEach(x=>x.style.display=on?'':'none');if(!on)renderDeck()};
 document.getElementById('crDeckReset').onclick=()=>{deckIds=cards().filter(owned).slice(0,DEFAULT_COUNT).map(c=>c.id);saveDeck();renderDeck();};
 renderDeck();
}
function renderDeck(){
 const grid=document.getElementById('crDeckGrid'),slots=document.getElementById('crDeckSlots');if(!grid||!slots)return;
 const all=cards().filter(owned);const set=new Set(deckIds.map(String));
 slots.innerHTML=getDeck().map((c,i)=>`<div class="crSlot"><b>${i+1}</b> ${esc(c.name)}</div>`).join('')||'<span class="muted">Aucune carte sélectionnée</span>';
 grid.innerHTML=all.map(c=>{const on=set.has(String(c.id));return `<button class="crDeckCard ${on?'sel':''}" data-id="${esc(c.id)}"><span class="crDeckBadge" style="display:${on?'block':'none'}">DECK</span><div class="art">${esc(c.emoji||'⚔️')}</div><b>${esc(c.name)}</b><small>⚔️ ${c.atk??'-'} · ${esc(c.rarity||'')}</small></button>`}).join('');
 grid.querySelectorAll('.crDeckCard').forEach(b=>b.onclick=()=>toggleDeck(b.dataset.id));
}
function toggleDeck(id){
 const i=deckIds.findIndex(x=>String(x)===String(id));
 if(i>=0){deckIds.splice(i,1);saveDeck();renderDeck();return}
 if(deckIds.length>=DEFAULT_COUNT){return window.toast?window.toast('Deck complet : 8 cartes maximum.'):alert('Deck complet : 8 cartes maximum.')}
 const c=cards().find(x=>String(x.id)===String(id));if(!c)return;deckIds.push(c.id);saveDeck();renderDeck();
}
function exposeDeck(){
 syncIds();
 window.CROWN_RIFT_DECK=()=>getDeck();
 window.CROWN_RIFT_DECK_IDS=()=>getDeck().map(c=>c.id);
}
function usernameOnlyAuth(){
 const inputs=[...document.querySelectorAll('input')];
 const emailInputs=inputs.filter(i=>i.type==='email'||/email|e-mail|adresse mail/i.test(i.placeholder||i.name||''));
 emailInputs.forEach(i=>{const wrap=i.closest('label,.field,.form-group,.input-group,div')||i; if(wrap!==i && wrap.querySelectorAll('input').length===1) wrap.style.display='none'; else i.style.display='none';});
 const userInput=inputs.find(i=>i!==emailInputs[0]&&(/pseudo|identifiant|username|nom/i.test((i.placeholder||'')+' '+(i.name||''))))||inputs.find(i=>i.type==='text');
 if(userInput){userInput.placeholder='Pseudo';userInput.autocomplete='username';}
 if(emailInputs[0]&&userInput){
   const toFake=()=>{if(userInput.value.trim())emailInputs[0].value=userInput.value.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'')+'@crownrift.local'};
   userInput.addEventListener('input',toFake);
   document.addEventListener('click',toFake,true);
 }
}
function capEnemies(){
 const arena=document.querySelector('.arena');if(!arena)return;
 let badge=document.getElementById('crEnemyCap');if(!badge){badge=document.createElement('div');badge.id='crEnemyCap';badge.className='crEnemyCap';arena.appendChild(badge)}
 const enemies=[...arena.querySelectorAll('.unit.enemy')];
 const MAX=6;
 if(enemies.length>MAX){enemies.slice(0,enemies.length-MAX).forEach(e=>e.remove())}
 badge.textContent=`👹 ${Math.min(enemies.length,MAX)}/${MAX} ennemis`;
 if(!arena.querySelector('.crChest')){const chest=document.createElement('div');chest.className='crChest';chest.textContent='🏆';chest.title='Coffre ennemi';arena.appendChild(chest)}
 moveUnits(arena);
}
function pos(e){const x=parseFloat(e.style.left),y=parseFloat(e.style.top);return [Number.isFinite(x)?x:50,Number.isFinite(y)?y:50]}
function moveUnits(arena){
 const enemies=[...arena.querySelectorAll('.unit.enemy')],players=[...arena.querySelectorAll('.unit.player')];
 if(!players.length)return;
 const rect=arena.getBoundingClientRect();
 players.forEach(p=>{
   p.classList.add('crPatchUnitMove');
   const [px,py]=pos(p);
   let target=null;
   if(enemies.length){let best=Infinity;for(const e of enemies){const [ex,ey]=pos(e);const d=(ex-px)**2+(ey-py)**2;if(d<best){best=d;target=e}}}
   if(target){
     const [tx,ty]=pos(target);const dx=tx-px,dy=ty-py,dist=Math.hypot(dx,dy)||1; if(dist>68){p.style.left=(px+dx/dist*18)+'px';p.style.top=(py+dy/dist*18)+'px'}
   }else{
     const x=rect.width/2-27,y=55;p.style.left=x+'px';p.style.top=y+'px';
   }
 });
}
function hookBattle(){
 let n=0;const timer=setInterval(()=>{capEnemies();if(++n>1800)clearInterval(timer)},500);
}
function boot(){injectStyle();exposeDeck();buildDeckUI();usernameOnlyAuth();hookBattle();}
window.addEventListener('load',()=>setTimeout(boot,250));
setTimeout(()=>{try{boot()}catch(e){}},1000);
})();