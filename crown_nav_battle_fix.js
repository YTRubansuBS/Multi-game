(()=>{'use strict';
if(window.__CR_NAV_BATTLE_FIX__)return;window.__CR_NAV_BATTLE_FIX__=true;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const cards=()=>Array.isArray(window.CARDS)&&window.CARDS.length?window.CARDS:(window.CR_CARDS||[]);
const cardOf=id=>cards().find(c=>Number(c.id)===Number(id));
const owned=id=>Number(window.profile?.owned_cards?.[id]||0)>0;
function deck8(){let d=Array.isArray(window.profile?.deck)?window.profile.deck:[];try{if(!d.length)d=JSON.parse(localStorage.getItem('crown_rift_deck_v3')||localStorage.getItem('crown_rift_deck_v2')||'[]')}catch(e){}const out=[];for(const id of d.map(Number)){if(cardOf(id)&&owned(id)&&!out.includes(id))out.push(id);if(out.length>=8)break}for(const c of cards()){if(out.length>=8)break;if(owned(c.id)&&!out.includes(Number(c.id)))out.push(Number(c.id))}return out.slice(0,8)}
function css(){if(document.getElementById('crNavBattleFixCss'))return;const s=document.createElement('style');s.id='crNavBattleFixCss';s.textContent=`
.crSectionHidden{display:none!important}
#cards .crSubPanel{display:none!important}#cards .crSubPanel.crShown{display:block!important}
#cards .crCardsSubNav{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}
#cards .crCardsSubNav button{padding:10px 14px;border-radius:12px;background:#171020;color:#b9acbf;border:1px solid #ffffff16;font-weight:1000;cursor:pointer}
#cards .crCardsSubNav button.crOn{background:linear-gradient(135deg,#8f54ff,#6244e7);color:#fff}
#deck.crBattleDeck8{grid-template-columns:repeat(8,minmax(0,1fr))!important}
.crBattleDeck8 .crFH{min-height:92px}
@media(max-width:900px){#deck.crBattleDeck8{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
`;document.head.appendChild(s)}
function text(el){return (el?.innerText||el?.textContent||'').trim().toLowerCase()}
function panelFor(root,word){return [...root.querySelectorAll(':scope > *, .panel, .glass')].find(x=>text(x).includes(word)&&x.querySelector('button,select,input'))}
function setupCardTabs(){const root=document.getElementById('cards');if(!root)return;let nav=root.querySelector('.crCardsSubNav');if(!nav){nav=document.createElement('div');nav.className='crCardsSubNav';const names=[['collection','📚 Collection'],['fusion','🧬 Fusion'],['packs','🎁 Packs'],['deck','⚔️ Deck']];for(const [key,label] of names){const b=document.createElement('button');b.dataset.crtab=key;b.textContent=label;nav.appendChild(b)}const anchor=root.querySelector('.tabs')||root.firstElementChild;anchor?anchor.insertAdjacentElement('afterend',nav):root.prepend(nav)}
const getSections=()=>{const result={collection:document.getElementById('cardsCollection'),fusion:document.getElementById('cardsFusion'),packs:document.getElementById('cardsPacks'),deck:document.getElementById('crDeckPanelMaster')};for(const k of Object.keys(result))if(!result[k]){const words={collection:['collection','toutes les cartes'],fusion:['fusion'],packs:['packs','pack'],deck:['mon deck','deck']};result[k]=panelFor(root,words[k][0])||panelFor(root,words[k][1])}return result};
function show(key){const sec=getSections();Object.entries(sec).forEach(([k,x])=>{if(x)x.classList.toggle('crShown',k===key),x.classList.toggle('crSectionHidden',k!==key)});nav.querySelectorAll('button').forEach(b=>b.classList.toggle('crOn',b.dataset.crtab===key));if(key==='collection'&&typeof window.renderCards==='function')setTimeout(()=>window.renderCards(),0)}
nav.querySelectorAll('button').forEach(b=>{if(b.__crWired)return;b.__crWired=true;b.onclick=e=>{e.preventDefault();e.stopPropagation();show(b.dataset.crtab)}});if(!root.__crDefault){root.__crDefault=true;show('collection')}}
function battleCards8(){const d=document.getElementById('deck');const ids=deck8();if(!d||!ids.length)return;d.className='deck crBattleDeck8';d.innerHTML=ids.map((id,i)=>{const c=cardOf(id);return `<button type="button" class="crFH" data-crbattle="${id}"><div class="art">${c.emoji||'🃏'}</div><b>${String(c.name||'Carte')}</b><small>⚡ ${c.cost||0} • ⚔️ ${c.atk||0}</small></button>`}).join('');d.querySelectorAll('[data-crbattle]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const id=Number(b.dataset.crbattle);d.querySelectorAll('.crFH').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');window.__CR_FINAL_SELECTED__=id;if(typeof window.selectBattleCard==='function')window.selectBattleCard(id)})}
function keepBattle8(){const g=document.getElementById('battleGame');if(!g||g.classList.contains('hidden')||g.offsetParent===null)return;const d=document.getElementById('deck');if(!d)return;if(!d.dataset.crLocked8){d.dataset.crLocked8='1';battleCards8()}else if(d.children.length!==Math.min(8,deck8().length)||!d.classList.contains('crBattleDeck8'))battleCards8()}
function patchStart(){const old=window.startBotBattle;if(typeof old!=='function'||old.__cr8)return;const f=function(){const r=old.apply(this,arguments);setTimeout(keepBattle8,30);setTimeout(keepBattle8,250);setTimeout(keepBattle8,800);return r};f.__cr8=true;window.startBotBattle=f}
function wire(){css();setupCardTabs();patchStart();keepBattle8()}
const obs=new MutationObserver(()=>{setupCardTabs();patchStart();keepBattle8()});
function boot(){wire();obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});setInterval(keepBattle8,500)}
window.addEventListener('load',()=>setTimeout(boot,500));setTimeout(()=>{try{boot()}catch(e){}},1400);
})();
