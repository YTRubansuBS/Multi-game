(()=>{'use strict';
if(window.__CR_FINAL_FIX2__)return;
window.__CR_FINAL_FIX2__=true;

const $=id=>document.getElementById(id);
const cards=()=>Array.isArray(window.CARDS)&&window.CARDS.length?window.CARDS:(window.CR_CARDS||[]);
const cardOf=id=>cards().find(c=>Number(c.id)===Number(id));
const owned=id=>Number(window.profile?.owned_cards?.[id]||0)>0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function css(){
  if($('crFinalFix2Css'))return;
  const s=document.createElement('style');
  s.id='crFinalFix2Css';
  s.textContent=`
    /* CARTES: vrais sous-onglets */
    #cards .tabs{display:flex!important;gap:7px!important;overflow:auto!important;margin-bottom:12px!important}
    #cards .tabs .tab{display:block!important;visibility:visible!important}
    #cards .tabs .tab.crFinalDeckTab{background:#151020;color:#ae9eb9}
    #cards .tabs .tab.crFinalDeckTab.on{background:#30203d;color:#fff}
    #cardsCollection,#cardsFusion,#cardsPacks,#crDeckPanelMaster{transition:none!important}
    #cardsCollection.crFinalHidden,#cardsFusion.crFinalHidden,#cardsPacks.crFinalHidden,#crDeckPanelMaster.crFinalHidden{display:none!important}
    /* Le deck de configuration doit être un vrai 4e écran */
    #crDeckPanelMaster.crFinalDeckOpen{display:block!important}
    /* Combat: 5 cartes visibles, même si une ancienne rustine recrée 8 boutons */
    #deck.crFinalHand5{grid-template-columns:repeat(5,minmax(0,1fr))!important}
    #deck.crFinalHand5>.crBattleCard,#deck.crFinalHand5>.crFH{min-width:0!important}
    #deck.crFinalHand5>.crFinalBattleHidden{display:none!important}
    @media(max-width:900px){#deck.crFinalHand5{grid-template-columns:repeat(5,minmax(0,1fr))!important}}
    @media(max-width:640px){#deck.crFinalHand5{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:5px!important}#deck.crFinalHand5>.crBattleCard,#deck.crFinalHand5>.crFH{min-height:72px!important;padding:5px!important}}
  `;
  document.head.appendChild(s)
}

function cardSections(){
  return {collection:$('cardsCollection'),fusion:$('cardsFusion'),packs:$('cardsPacks'),deck:$('crDeckPanelMaster')};
}

function ensureDeckTab(){
  const page=$('cards');
  const tabs=page?.querySelector('.tabs');
  if(!page||!tabs)return;

  let btn=$('crFinalDeckTab');
  if(!btn){
    btn=document.createElement('button');
    btn.id='crFinalDeckTab';
    btn.className='tab crFinalDeckTab';
    btn.type='button';
    btn.textContent='⚔️ MON DECK';
    tabs.appendChild(btn);
  }

  const masterTab=$('crMasterDeckTab');
  if(masterTab&&masterTab!==btn){masterTab.style.display='none';}

  btn.onclick=e=>{
    e.preventDefault();
    e.stopPropagation();
    window.setCardTab('deck');
  };
}

function setVisibleSection(mode){
  const s=cardSections();
  for(const k of ['collection','fusion','packs','deck']){
    const el=s[k];
    if(!el)continue;
    const on=k===mode;
    el.classList.toggle('crFinalHidden',!on);
    if(k==='deck')el.classList.toggle('crFinalDeckOpen',on);
    if(k!=='deck')el.style.display=on?'block':'none';
    else el.style.display=on?'block':'none';
    el.classList.remove('hidden');
  }
}

function syncTabButtons(mode){
  const map={collection:'ct-collection',fusion:'ct-fusion',packs:'ct-packs',deck:'crFinalDeckTab'};
  Object.entries(map).forEach(([k,id])=>{const b=$(id);if(b)b.classList.toggle('on',k===mode)});
}

window.setCardTab=function(mode){
  const t=['collection','fusion','packs','deck'].includes(mode)?mode:'collection';
  ensureDeckTab();
  if(t==='deck' && !$('crDeckPanelMaster') && typeof window.buildDeckUI==='function'){
    try{window.buildDeckUI()}catch(e){}
  }
  setVisibleSection(t);
  syncTabButtons(t);
  if(t==='collection' && typeof window.renderCards==='function')setTimeout(()=>{try{window.renderCards()}catch(e){}},0);
  if(t==='fusion' && typeof window.renderFusion==='function')setTimeout(()=>{try{window.renderFusion()}catch(e){}},0);
  if(t==='deck' && typeof window.renderDeckUI==='function')setTimeout(()=>{try{window.renderDeckUI()}catch(e){}},0);
};

function battleButtons(){
  const root=$('deck');
  if(!root)return [];
  return [...root.querySelectorAll('.crBattleCard,.crFH')].filter(x=>x.matches('button,[role="button"]'));
}

function deckIdsFromSaved(){
  let d=[];
  if(Array.isArray(window.profile?.deck))d=window.profile.deck.slice();
  if(!d.length){
    try{d=JSON.parse(localStorage.getItem('crown_rift_deck_v3')||localStorage.getItem('crown_rift_deck_v2')||'[]')}catch(e){d=[]}
  }
  const out=[];
  for(const id of d.map(Number)){
    if(cardOf(id)&&owned(id)&&!out.includes(id))out.push(id);
    if(out.length>=8)break;
  }
  for(const c of cards()){
    if(out.length>=8)break;
    if(owned(c.id)&&!out.includes(Number(c.id)))out.push(Number(c.id));
  }
  return out.slice(0,8);
}

function shuffle(a){
  const x=a.slice();
  for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}
  return x;
}

function resetVisibleHand(){
  const root=$('deck');
  if(!root)return;
  const btns=battleButtons();
  if(btns.length<1)return;

  root.classList.add('crFinalHand5');
  btns.forEach(b=>b.classList.remove('crFinalBattleHidden'));

  const available=btns.map((b,i)=>Number(b.dataset.id||b.dataset.crbattle||i)).filter((v,i,a)=>a.indexOf(v)===i);
  const chosen=shuffle(available).slice(0,Math.min(5,available.length));
  root.__crFinalVisibleIds=chosen;
  btns.forEach((b,i)=>{
    const id=Number(b.dataset.id||b.dataset.crbattle||i);
    b.classList.toggle('crFinalBattleHidden',!chosen.includes(id));
  });
}

function rotateOne(){
  const root=$('deck');
  if(!root)return;
  const btns=battleButtons();
  if(btns.length<=5)return;
  const now=Array.isArray(root.__crFinalVisibleIds)?root.__crFinalVisibleIds.slice():[];
  const all=btns.map((b,i)=>Number(b.dataset.id||b.dataset.crbattle||i)).filter((v,i,a)=>a.indexOf(v)===i);
  const hidden=shuffle(all.filter(id=>!now.includes(id)));
  if(!hidden.length)return;
  const old=now[Math.floor(Math.random()*now.length)];
  const fresh=hidden[0];
  root.__crFinalVisibleIds=now.map(id=>id===old?fresh:id);
  btns.forEach((b,i)=>{
    const id=Number(b.dataset.id||b.dataset.crbattle||i);
    b.classList.toggle('crFinalBattleHidden',!root.__crFinalVisibleIds.includes(id));
  });
}

function keepFive(){
  const battle=$('battleGame');
  const root=$('deck');
  if(!battle||!root)return;
  const active=!battle.classList.contains('hidden') && getComputedStyle(battle).display!=='none';
  if(!active){root.__crFinalVisibleIds=null;return}
  const btns=battleButtons();
  if(!btns.length)return;
  root.classList.add('crFinalHand5');
  const validIds=btns.map((b,i)=>Number(b.dataset.id||b.dataset.crbattle||i)).filter((v,i,a)=>a.indexOf(v)===i);
  let visible=Array.isArray(root.__crFinalVisibleIds)?root.__crFinalVisibleIds.filter(id=>validIds.includes(id)):[];
  if(visible.length!==Math.min(5,validIds.length)){
    resetVisibleHand();
    visible=root.__crFinalVisibleIds||[];
  }
  btns.forEach((b,i)=>{const id=Number(b.dataset.id||b.dataset.crbattle||i);b.classList.toggle('crFinalBattleHidden',!visible.includes(id))});
}

function installBattleCycle(){
  const root=$('deck');
  if(!root||root.__crFinalCycleInstalled)return;
  root.__crFinalCycleInstalled=true;
  root.addEventListener('click',e=>{
    const b=e.target.closest('.crBattleCard,.crFH');
    if(!b||!root.contains(b)||b.classList.contains('crFinalBattleHidden'))return;
    clearTimeout(root.__crCycleTimer);
    root.__crCycleTimer=setTimeout(()=>{rotateOne()},3000);
  },true);
}

function repairTabsAfterOtherScripts(){
  ensureDeckTab();
  const s=cardSections();
  // Remove the broken helper's custom visibility classes if present.
  Object.values(s).forEach(el=>{if(el)el.classList.remove('crSectionHidden','crShown')});
  installBattleCycle();
  keepFive();
}

function boot(){
  css();
  ensureDeckTab();
  const current=['collection','fusion','packs','deck'].find(x=>{
    const b=$(x==='deck'?'crFinalDeckTab':'ct-'+x);return b?.classList.contains('on')
  })||'collection';
  window.setCardTab(current);
  installBattleCycle();
  keepFive();
  setTimeout(()=>{if($('battleGame')&&!$('battleGame').classList.contains('hidden'))resetVisibleHand()},80);
}

const obs=new MutationObserver(()=>{repairTabsAfterOtherScripts()});
window.addEventListener('load',()=>{setTimeout(boot,250);setTimeout(boot,1200);setTimeout(boot,2500)});
setInterval(()=>{try{repairTabsAfterOtherScripts()}catch(e){}},350);
setInterval(()=>{try{keepFive()}catch(e){}},150);
try{obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']})}catch(e){}
})();
