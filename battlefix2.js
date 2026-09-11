(()=>{'use strict';
let installed=false;
const T=m=>window.toast?window.toast(m):alert(m);
const A=()=>window.CROWN_RIFT_DECK?window.CROWN_RIFT_DECK():[];
function install(){
 if(installed)return; if(typeof window.startBotBattle!=='function'||typeof window.endBattle!=='function')return;installed=true;
 const oldStart=window.startBotBattle;
 window.startBotBattle=function(){oldStart();setTimeout(setupArena,40)};
 const oldEnd=window.endBattle;
 window.endBattle=function(){window.__crBattleFixStop?.();oldEnd()};
 window.__crBattleFixStop=()=>{if(window.__crBattleFixTimer)clearInterval(window.__crBattleFixTimer);window.__crBattleFixTimer=null};
 window.__crBattleFixSetup=setupArena;
}
function setupArena(){
 const arena=document.getElementById('arena');const battle=window.battle;if(!arena||!battle)return;
 let chest=arena.querySelector('#crEnemyChest');if(!chest){chest=document.createElement('div');chest.id='crEnemyChest';chest.textContent='🪙';chest.title='Coffre du Rift';chest.style.cssText='position:absolute;top:3%;left:calc(50% - 31px);width:62px;height:54px;border-radius:14px;display:grid;place-items:center;font-size:30px;background:linear-gradient(#ffd966,#9d5a14);border:2px solid #fff8;box-shadow:0 0 30px #ffd23f55;z-index:6';arena.appendChild(chest)}
 const style=document.getElementById('crBridgeFixStyle')||document.createElement('style');style.id='crBridgeFixStyle';style.textContent=`#arena .bridge{z-index:5;box-shadow:inset 0 0 10px #0005}#arena .unit{transition:left .16s linear,top .16s linear}#crBattleInfo{position:absolute;left:10px;right:10px;bottom:10px;z-index:25;display:flex;justify-content:center;pointer-events:none}.crBI{padding:7px 11px;border-radius:99px;background:#09060ed9;border:1px solid #ffffff18;color:#fff;font-size:10px;font-weight:900}`;document.head.appendChild(style);
 if(!document.getElementById('crBattleInfo'))arena.insertAdjacentHTML('beforeend','<div id="crBattleInfo"><div class="crBI">🃏 Tes cartes traversent le pont après avoir vaincu les ennemis.</div></div>');
 window.__crBattleFixStop?.();window.__crBattleFixTimer=setInterval(step,120);step();
}
function getUnits(){return Array.isArray(window.battle?.units)?window.battle.units:[]}
function remove(u){u.hp=0;u.element?.remove();window.battle.units=window.battle.units.filter(x=>x!==u)}
function d(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function hpBar(u){const i=u.element?.querySelector('.uhp i');if(i)i.style.width=Math.max(0,u.hp/u.maxHp*100)+'%'}
function hit(att,target){if(!target||target.hp<=0)return;const amount=Math.max(8,att.card.atk);target.hp-=amount;target.element?.classList.add('hit');setTimeout(()=>target.element?.classList.remove('hit'),150);hpBar(target);if(target.hp<=0){target.element?.remove();window.battle.units=window.battle.units.filter(x=>x!==target)} }
function targetFor(u,units){const hostile=units.filter(x=>x.side!==u.side&&x.hp>0);if(!hostile.length)return null;hostile.sort((a,b)=>d(u,a)-d(u,b));return hostile[0]}
function step(){const battle=window.battle,arena=document.getElementById('arena');if(!battle||battle.done||!arena)return;const units=getUnits();const enemies=units.filter(u=>u.side==='enemy'&&u.hp>0);const players=units.filter(u=>u.side==='player'&&u.hp>0);battle.energy=Math.min(10,(battle.energy||0)+.065);
 for(const u of [...units]){if(!u.element||u.hp<=0)continue;u.cd=(u.cd||0)-120;const enemy=targetFor(u,units);const bridgeY=u.side==='player'?51:49; if(enemy&&d(u,enemy)<=Math.max(32,(u.card.range||40)/1.3)){if(u.cd<=0){hit(u,enemy);u.cd=u.card.rate||1000}continue}
  const advance=u.card.speed*.2*(u.side==='player'? -1:1); if(!enemy){ if(u.side==='player'){u.y-=advance; if(u.y<bridgeY&&u.y>bridgeY-3)u.y-=1.5; if(enemies.length===0)u.y-=advance*.8; if(u.y<=6){battle.botTower=Math.max(0,(battle.botTower||0)-Math.max(15,u.card.atk*.08));u.y=7} } else {u.y+=advance; if(enemies.length===0)u.y+=advance*.8; if(u.y>=88){u.y=88} } }
  else {u.x+=(enemy.x-u.x)*.01;u.y+=(enemy.y-u.y)*.01}
  u.element.style.left='calc('+u.x+'% - 27px)';u.element.style.top='calc('+u.y+'% - 27px)';hpBar(u);
 }
 if(document.getElementById('playerTowerHp')){document.getElementById('botTowerHp').textContent=Math.max(0,Math.round(battle.botTower||0));document.getElementById('playerTowerHp').textContent=Math.max(0,Math.round(battle.playerTower||0));document.getElementById('botTowerBar').style.width=Math.max(0,(battle.botTower||0)/10)+'%';document.getElementById('playerTowerBar').style.width=Math.max(0,(battle.playerTower||0)/10)+'%';document.getElementById('energyFill').style.width=((battle.energy||0)/10*100)+'%';document.getElementById('energyText').textContent='Énergie '+(battle.energy||0).toFixed(1)+' / 10'}
}
function patchDeckBattle(){const render=window.renderDeck;if(typeof render!=='function')return;window.renderDeck=function(){render();const d=A();const root=document.getElementById('deck');if(root&&d.length){root.innerHTML=d.map(c=>`<button class="deckcard" onclick="selectBattleCard(${c.id})"><span style="font-size:24px">${c.emoji}</span><b>${String(c.name).replace(/[<>]/g,'')}</b><small>⚡ ${c.cost} • ⚔️ ${c.atk}</small></button>`).join('')}}}
function boot(){install();patchDeckBattle()}
window.addEventListener('load',()=>setTimeout(boot,900));setInterval(boot,1500);
})();
