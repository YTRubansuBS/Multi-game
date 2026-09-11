(()=>{'use strict';
const KEY='crown_rift_deck_v2';
const C=()=>Array.isArray(window.CARDS)?window.CARDS:[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cardOf=id=>C().find(c=>Number(c.id)===Number(id));
const getIds=()=>{let d=[];try{d=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){}if(!Array.isArray(d))d=[];const owned=window.profile?.owned_cards||{};d=d.map(Number).filter(id=>cardOf(id)&&Number(owned[id]||0)>0);if(!d.length){d=C().filter(c=>Number(owned[c.id]||0)>0).slice(0,8).map(c=>Number(c.id))}return [...new Set(d)].slice(0,8)};
function login300(){
  document.querySelectorAll('.authgrid .mini span,.authgrid .mini p').forEach(x=>{x.textContent=x.textContent.replace(/21\s*cartes?/gi,'300 cartes')});
  document.querySelectorAll('#totalCards').forEach(x=>x.textContent='300');
  document.querySelectorAll('.homegrid .tile p').forEach(x=>{x.textContent=x.textContent.replace(/21\s*cartes?/gi,'300 cartes')});
}
function ownedColors(){
  const owned=window.profile?.owned_cards||{};
  document.querySelectorAll('#collectionGrid .card[data-card-id]').forEach(el=>{
    const id=Number(el.dataset.cardId),yes=Number(owned[id]||0)>0;
    el.classList.toggle('lock',!yes);el.classList.toggle('crOwned',yes);
    el.style.filter=yes?'none':'grayscale(1) brightness(.62)';
    el.style.opacity=yes?'1':'.52';
  });
  const st=document.getElementById('crOwnedCardsStyle');
  if(!st){const s=document.createElement('style');s.id='crOwnedCardsStyle';s.textContent=`#collectionGrid .card.crOwned{filter:none!important;opacity:1!important;background:linear-gradient(180deg,#35204f,#140b1d)!important;border-color:#ffffff28!important;box-shadow:0 10px 30px #0009,0 0 18px #8f54ff18!important}#collectionGrid .card.lock{filter:grayscale(1) brightness(.62)!important;opacity:.52!important}`;document.head.appendChild(s)}
}
let lockedHandHTML='';
function handHTML(ids){return ids.map(id=>{const c=cardOf(id);return c?`<button class="deckcard" data-id="${c.id}" onclick="selectBattleCard(${c.id})"><span style="font-size:24px">${esc(c.emoji)}</span><b>${esc(c.name)}</b><small>⚡ ${c.cost} • ⚔️ ${c.atk}</small></button>`:''}).join('')}
function battleActive(){return !!(window.battle&&!window.battle.done&&document.getElementById('battleGame')&&!document.getElementById('battleGame').classList.contains('hidden'))}
function stabilizeDeck(){const root=document.getElementById('deck');if(!root)return;if(!battleActive()){lockedHandHTML='';return}const ids=getIds();const html=handHTML(ids);if(html!==lockedHandHTML||root.innerHTML!==html){lockedHandHTML=html;root.innerHTML=html}}
function stopDeckOscillation(){const root=document.getElementById('deck');if(!root||root.dataset.crFinalObserver)return;root.dataset.crFinalObserver='1';const obs=new MutationObserver(()=>{if(battleActive())stabilizeDeck()});obs.observe(root,{childList:true,subtree:true});window.CR_FINAL_DECK_OBSERVER=obs}
function speedAndPath(){
  const b=window.battle;if(!b||b.done)return;
  const units=Array.isArray(b.units)?b.units:[];
  for(const u of units){
    if(!u||u.hp<=0)continue;
    const enemies=units.filter(v=>v&&v.hp>0&&v.side!==u.side);
    let t=enemies.sort((a,z)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(z.x-u.x,z.y-u.y))[0];
    if(t&&Math.hypot(t.x-u.x,t.y-u.y)<10)continue;
    if(!t)t={x:50,y:u.side==='player'?4:95};
    const dx=t.x-u.x,dy=t.y-u.y,d=Math.hypot(dx,dy)||1;
    const base=Math.max(.28,Number(u.card?.speed)||.55);
    const mult=u.side==='player'?1.35:0.72;
    const step=base*.08*mult;
    u.x+=dx/d*step;u.y+=dy/d*step;
    u.x=Math.max(5,Math.min(95,u.x));u.y=Math.max(4,Math.min(96,u.y));
    if(u.element){u.element.style.left='calc('+u.x+'% - 27px)';u.element.style.top='calc('+u.y+'% - 27px)'}
    if(u.side==='enemy')u._crFast=1;
  }
}
function specialButton(){
 document.querySelectorAll('.crIdSpecial').forEach(el=>{if(el.dataset.finalSpecial)return;el.dataset.finalSpecial='1';el.style.cursor='pointer';el.title='Voir toutes les informations';el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();el.dataset.finalClicked='1';});});
}
function patchCollectionIdentity(){
 const css=document.getElementById('crFinalUxCss');if(css)return;
 const s=document.createElement('style');s.id='crFinalUxCss';s.textContent=`.crIdSpecial{cursor:pointer!important;user-select:none}.crIdSpecial:hover{box-shadow:0 0 0 1px #ffd23f44,0 0 22px #ffd23f18;transform:translateY(-1px);transition:.15s}.deck{grid-template-columns:repeat(8,1fr)}#deck .deckcard{min-width:0;overflow:hidden}#deck .deckcard b{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.crSpecialButton{display:block}`;document.head.appendChild(s)
 }
function boot(){login300();ownedColors();patchCollectionIdentity();stopDeckOscillation();stabilizeDeck();specialButton();setInterval(()=>{login300();ownedColors();stopDeckOscillation();stabilizeDeck();specialButton();speedAndPath()},180)}
window.addEventListener('load',()=>setTimeout(boot,3200));setTimeout(()=>{try{boot()}catch(e){}},4200);
})();
