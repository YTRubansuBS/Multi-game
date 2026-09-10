(()=>{
'use strict';
const toast=m=>window.toast?window.toast(m):alert(m);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cardList(){return Array.isArray(window.CARDS)?window.CARDS:[]}
function buildAdmin(){
 const admin=[...document.querySelectorAll('.roomModal')].find(x=>/ADMIN CROWN RIFT/i.test(x.textContent||''));
 if(!admin||document.getElementById('crAdminTools'))return;
 const panel=admin.querySelector('#adminPanel'); if(!panel||panel.style.display==='none')return;
 const tools=document.createElement('div');tools.id='crAdminTools';tools.className='rp';tools.style.marginTop='12px';
 tools.innerHTML=`<h3>🎁 ME RÉCOMPENSER</h3><div style="color:#ae9eb9;font-size:11px;margin-bottom:10px">Choisis exactement ce que tu veux ajouter à TON compte.</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><div><small>💰 Pièces</small><input id="admPieces" class="ri" type="number" min="0" value="1000"></div><div><small>💎 Gemmes</small><input id="admGems" class="ri" type="number" min="0" value="500"></div><div><small>🃏 Carte</small><select id="admCard" class="ri"><option value="">Aucune carte</option>${cardList().map(c=>`<option value="${esc(c.id)}">${esc(c.name)} — ${esc(c.rarity||'')}</option>`).join('')}</select><input id="admCardQty" class="ri" type="number" min="1" value="1"></div></div><button id="admReward" class="rb rgold">✨ AJOUTER LES RÉCOMPENSES</button><div id="admStatus" style="margin-top:8px;color:#ae9eb9;font-size:10px"></div>`;
 panel.appendChild(tools);document.getElementById('admReward').onclick=grant;
}
async function grant(){
 const u=window.user||(await window.sb?.auth?.getSession())?.data?.session?.user;if(!u||!window.sb)return toast('Connecte-toi d’abord.');
 const pieces=Math.max(0,parseInt(document.getElementById('admPieces').value)||0),gems=Math.max(0,parseInt(document.getElementById('admGems').value)||0),cardId=document.getElementById('admCard').value,qty=Math.max(1,parseInt(document.getElementById('admCardQty').value)||1),p=window.profile||{};
 const owned={...(p.owned_cards||p.cards||{})};if(cardId)owned[cardId]=(parseInt(owned[cardId])||0)+qty;
 const patch={gems:(parseInt(p.gems)||0)+gems,gold:(parseInt(p.gold)||0)+pieces,owned_cards:owned};
 if(Array.isArray(p.cards)){const arr=[...p.cards];if(cardId)for(let i=0;i<qty;i++)if(!arr.includes(Number(cardId))&&!arr.includes(cardId))arr.push(Number.isNaN(Number(cardId))?cardId:Number(cardId));patch.cards=arr}
 const q=await window.sb.from('profiles').update(patch).eq('id',u.id);if(q.error)return toast('Erreur sauvegarde : '+q.error.message);
 Object.assign(p,patch);window.profile=p;if(typeof window.renderAll==='function')window.renderAll();
 const parts=[];if(pieces)parts.push(`+${pieces} pièces`);if(gems)parts.push(`+${gems} gemmes`);if(cardId){const c=cardList().find(x=>String(x.id)===String(cardId));parts.push(`+${qty} ${c?.name||'carte'}`)}
 document.getElementById('admStatus').textContent=parts.join(' • ')||'Rien ajouté';toast(parts.join(' • ')||'Aucune récompense choisie.');
}
function boot(){buildAdmin()}
window.addEventListener('load',()=>setTimeout(boot,900));setInterval(boot,1000);
})();
