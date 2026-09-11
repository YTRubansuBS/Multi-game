(()=>{'use strict';
const C=()=>Array.isArray(window.CARDS)?window.CARDS:[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cardOf=id=>C().find(c=>Number(c.id)===Number(id));
const active=()=>!!(window.battle&&!window.battle.done&&document.getElementById('arena'));

function specialData(c){
 const name=String(c?.special||'Pouvoir du Rift');
 const map={
  'Frappe royale':['Frappe massive sur la cible la plus proche','Cible unique','Dégâts élevés','Repousse légèrement la cible','1.2 s','ATK × 1.8'],
  'Explosion du Rift':['Explosion autour de l’unité qui touche toutes les unités ennemies proches','Zone','Dégâts de zone','Touche plusieurs ennemis','1.5 s','ATK × 1.35'],
  'Charge éclair':['Charge instantanée vers la cible avec un bonus de dégâts','Cible unique','Très élevés','Déplacement rapide + bonus dégâts','1.3 s','ATK × 2.0'],
  'Bouclier ancestral':['Bouclier magique qui réduit fortement les dégâts reçus','Soi-même','0','Réduction des dégâts','3 s','-60% dégâts'],
  'Météore':['Un météore tombe sur la zone choisie et frappe tous les ennemis proches','Zone ciblée','Massifs','Dégâts de zone','2 s','ATK × 1.7'],
  'Pluie de plumes':['Une pluie de projectiles frappe plusieurs ennemis dans la zone','Zone','Élevés','Plusieurs impacts','1.6 s','ATK × 1.5'],
  'Gel absolu':['Gèle la cible et l’empêche d’avancer pendant un court instant','Cible unique','Moyens','Immobilisation','2.5 s','ATK × 1.2'],
  'Flèche toxique':['Projectile empoisonné qui inflige des dégâts supplémentaires avec le temps','Cible unique','Élevés','Poison','2 s','ATK × 1.45'],
  'Lame astrale':['Frappe rapide et puissante qui ignore une partie de la défense','Cible unique','Très élevés','Frappe perforante','1.4 s','ATK × 1.9'],
  'Soin du Rift':['Restaure une grande partie des PV de l’unité alliée','Allié','0','Soin','2.5 s','+35% PV'],
  'Exécution':['Frappe une cible affaiblie avec des dégâts supplémentaires','Cible unique','Extrêmes si cible faible','Bonus contre cibles sous 35% PV','2 s','ATK × 2.2'],
  'Nuée sauvage':['Invoque une nuée de petites attaques rapides contre la cible','Cible unique','Élevés','Attaques multiples','2 s','ATK × 1.6'],
  'Impact solaire':['Un impact solaire brûlant frappe une large zone','Zone','Massifs','Brûlure + zone','2 s','ATK × 1.65'],
  'Rappel des ombres':['Téléporte brièvement l’unité puis déclenche une attaque surprise','Cible unique','Très élevés','Téléportation + attaque','2.2 s','ATK × 1.9'],
  'Souffle de cendres':['Un souffle brûlant touche tous les ennemis devant l’unité','Zone frontale','Élevés','Brûlure','1.8 s','ATK × 1.55'],
  'Brume meurtrière':['Crée une zone toxique qui inflige des dégâts progressivement','Zone persistante','Progressifs','Dégâts sur la durée','3 s','ATK × 1.3'],
  'Lune écrasée':['Une attaque verticale écrase la zone et provoque de lourds dégâts','Zone','Massifs','Onde de choc','2.3 s','ATK × 1.8'],
  'Rayon d’éclipse':['Un rayon concentré traverse les ennemis sur sa trajectoire','Ligne','Très élevés','Traverse les ennemis','2 s','ATK × 1.75'],
  'Frappe du Néant':['Une frappe du Néant inflige des dégâts extrêmement importants','Cible unique','Extrêmes','Ignore une partie de la défense','2.5 s','ATK × 2.5'],
  'Renaissance':['Après un délai, l’unité récupère une partie importante de ses PV','Soi-même','0','Régénération','4 s','+45% PV'],
  'Colère du Wyrm':['Le Wyrm déclenche une attaque gigantesque sur une large zone','Zone','Extrêmes','Large zone + projection','3 s','ATK × 2.1']
 };
 const d=map[name]||['Pouvoir unique du Crown Rift','Selon la carte','Selon la carte','Effet spécial propre à la carte','Recharge spéciale','ATK × multiplicateur'];
 const cost=Number(c?.specialCost||c?.cost||2), cd=Number(c?.specialCd||7000), dmg=Math.round(Number(c?.atk||30)*(1.15+cost*.08));
 return {name,desc:d[0],target:d[1],damage:d[2],effect:d[3],duration:d[4],formula:d[5],cost,cd,dmg};
}
function specialModal(c){
 let m=document.getElementById('crSpecialModal');if(!m){m=document.createElement('div');m.id='crSpecialModal';m.className='crIdOverlay';m.onclick=e=>{if(e.target===m)m.classList.remove('show')};document.body.appendChild(m)}
 const s=specialData(c);m.innerHTML=`<div class="crIdBox"><div class="crIdTop"><div class="crIdArt">${esc(c.emoji)}</div><div><div class="crIdName">✨ ${esc(s.name)}</div><div class="crIdRarity">ATTAQUE SPÉCIALE — DÉTAILS COMPLETS</div><div style="color:#ae9eb9;font-size:11px;margin-top:8px">${esc(c.name)} • ${esc(c.type||'Unité')}</div></div></div><div id="crSpecialInfo"><div style="font-size:15px;font-weight:1000;color:#ffd23f;margin-bottom:10px">${esc(s.desc)}</div><div class="crSIgrid"><div class="crSI"><span>⚡ COÛT</span><b>${s.cost}</b></div><div class="crSI"><span>💥 PUISSANCE CALCULÉE</span><b>${s.dmg} dégâts</b></div><div class="crSI"><span>🎯 CIBLE</span><b>${esc(s.target)}</b></div><div class="crSI"><span>🧨 TYPE DE DÉGÂTS</span><b>${esc(s.damage)}</b></div><div class="crSI"><span>🌀 EFFET</span><b>${esc(s.effect)}</b></div><div class="crSI"><span>⏱️ DURÉE / RECHARGE</span><b>${esc(s.duration)} • ${Math.round(s.cd/1000)} s</b></div><div class="crSI"><span>📐 FORMULE</span><b>${esc(s.formula)}</b></div><div class="crSI"><span>📊 CARTE</span><b>ATK ${Number(c.atk||0)} • PV ${Number(c.hp||0)} • portée ${Number(c.range||0)}</b></div></div></div><button class="crIdClose">FERMER</button></div>`;
 m.querySelector('.crIdClose').onclick=()=>m.classList.remove('show');m.classList.add('show');
}
function patchSpecial(){
 document.addEventListener('click',e=>{const el=e.target.closest('.crIdSpecial');if(!el)return;e.preventDefault();e.stopImmediatePropagation();const box=el.closest('.crIdBox');const name=(box?.querySelector('.crIdName')?.textContent||'').replace('✨ ','').trim();const c=C().find(x=>x.name===name);if(c)specialModal(c)},true)
}
function battleHand(){
 if(!active())return;const root=document.getElementById('deck');if(!root)return;
 let ids=[];try{const d=JSON.parse(localStorage.getItem('crown_rift_deck_v2')||'[]');if(Array.isArray(d))ids=[...new Set(d.map(Number))].slice(0,8)}catch(e){}
 const html=ids.map(id=>{const c=cardOf(id);return c?`<button class="deckcard" data-id="${c.id}" onclick="selectBattleCard(${c.id})"><span style="font-size:24px">${esc(c.emoji)}</span><b>${esc(c.name)}</b><small>⚡ ${c.cost} • ⚔️ ${c.atk}</small></button>`:''}).join('');
 if(root.dataset.crBattleOnly!=='1'||root.innerHTML!==html){root.dataset.crBattleOnly='1';root.innerHTML=html}
}
function patchDeckRenderer(){
 const old=window.renderBattleDeck;
 window.renderBattleDeck=function(){if(active()){battleHand();return}if(typeof old==='function')old()};
}
function bridgeFix(){
 const b=window.battle;if(!b||b.done)return;
 for(const u of b.units||[]){if(!u||u.hp<=0)continue;
  // Le pont ne bloque plus personne : franchissement instantané du fleuve.
  if(u.side==='player' && u.y>43 && u.y<59)u.y=42;
  if(u.side==='enemy' && u.y>43 && u.y<59)u.y=60;
  // Les ennemis gardent une vitesse normale, jamais le boost du joueur.
  if(u.side==='enemy'){u._crFast=1;u.card.speed=Math.min(Number(u.card.speed)||.55,.62)}
  else u._crFast=1.45;
  if(u.element){u.element.style.left='calc('+u.x+'% - 27px)';u.element.style.top='calc('+u.y+'% - 27px)'}
 }
}
function collectionColors(){
 if(document.getElementById('crFullCardColors'))return;const s=document.createElement('style');s.id='crFullCardColors';s.textContent=`#cards .card{opacity:1!important;filter:none!important;transform:none!important;background:linear-gradient(180deg,#2b1740,#171022)!important;border-color:#ffffff2b!important;color:#fff!important;box-shadow:0 10px 28px #0007!important}#cards .card.lock{opacity:1!important;filter:none!important;background:linear-gradient(180deg,#2b1740,#171022)!important}#cards .card .art{opacity:1!important;filter:none!important}#cards .card .sub,#cards .card h3,#cards .card .cstats{opacity:1!important}.crDeckCard{opacity:1!important;filter:none!important}.crDeckCard.sel{background:linear-gradient(180deg,#3a2355,#20132f)!important}`;document.head.appendChild(s)
}
function boot(){collectionColors();patchSpecial();patchDeckRenderer();battleHand();setInterval(()=>{collectionColors();if(active()){battleHand();bridgeFix()}},80)}
window.addEventListener('load',()=>setTimeout(boot,1800));
})();
