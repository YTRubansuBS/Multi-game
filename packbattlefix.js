(()=>{'use strict';
/* Final runtime patch is injected as a compatibility layer. */
if(window.__CR_FINAL_PATCH__)return;window.__CR_FINAL_PATCH__=true;
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const R={common:'COMMUN',uncommon:'PEU COMMUN',rare:'RARE',epic:'ÉPIQUE',legendary:'LÉGENDAIRE',mythic:'MYTHIQUE',secret:'SECRET'};
const M={common:1,uncommon:1.1,rare:1.22,epic:1.38,legendary:1.58,mythic:1.84,secret:2.18};
const cards=()=>Array.isArray(window.CARDS)&&window.CARDS.length?window.CARDS:(window.CR_CARDS||[]);
const cardOf=id=>cards().find(c=>Number(c.id)===Number(id));
function special(c){const m=M[c.rar]||1;return {...c,atk:Math.round(Number(c.atk||30)*m),hp:Math.round(Number(c.hp||150)*m),specialDamage:Math.round(Number(c.atk||30)*m*(1.9+m*.42)),specialCooldown:Math.max(2.2,7.2-(m-1)*2.5),specialPower:m,specialName:`${R[c.rar]||'SPÉCIALE'} ${c.name} — ${m>=1.8?'ULTIME':'SPÉCIALE'}`}}
function ensureModal(){let x=document.getElementById('crSpecialPanel');if(!x){x=document.createElement('div');x.id='crSpecialPanel';x.className='crSpecialPanel';document.body.appendChild(x)}return x}
function show(c){if(!c)return;const s=special(c),x=ensureModal();const effects={Tank:'impact massif + bouclier',Distance:'rafale longue portée',Assassin:'dash + coup critique',Support:'soin de zone + accélération',Volant:'frappe aérienne + recul',Contrôle:'gel + dégâts de zone',Essaim:'encerclement ultra-rapide'};x.innerHTML=`<div class="crSpecialBox"><div style="font-size:28px;font-weight:1000">✨ ${esc(s.specialName)}</div><div style="color:#ffd23f;font-weight:1000;letter-spacing:1.5px;margin-top:4px">${esc(R[s.rar]||s.rar||'COMMUN')} • PUISSANCE x${s.specialPower.toFixed(2)}</div><div class="crSpecialDesc"><b>${esc(effects[s.type]||'Effet unique')}</b><br>La rareté augmente l’attaque, les PV et surtout la puissance de l’attaque spéciale.</div><div class="crSpecialGrid"><div class="crSI2"><span>💥 DÉGÂTS SPÉCIAUX</span><b>${s.specialDamage}</b></div><div class="crSI2"><span>⏱️ RECHARGE</span><b>${s.specialCooldown.toFixed(1)} s</b></div><div class="crSI2"><span>⚔️ ATTAQUE</span><b>${s.atk}</b></div><div class="crSI2"><span>❤️ PV</span><b>${s.hp}</b></div><div class="crSI2"><span>💨 VITESSE</span><b>${Number(s.speed||0).toFixed(2)}</b></div><div class="crSI2"><span>🎯 PORTÉE</span><b>${s.range}</b></div></div><button class="btn gold full">FERMER</button></div>`;x.classList.add('show');x.querySelector('button').onclick=()=>x.classList.remove('show')}
if(!document.getElementById('crFinalPatchCss')){const st=document.createElement('style');st.id='crFinalPatchCss';st.textContent='#crSpecialPanel{z-index:9000}';document.head.appendChild(st)}
document.addEventListener('click',e=>{const c=e.target.closest('#collectionGrid .card[data-card-id]');if(!c)return;e.preventDefault();e.stopImmediatePropagation();show(cardOf(Number(c.dataset.cardId)))},true);
window.CROWN_RIFT_SHOW_SPECIAL=show;
})();
