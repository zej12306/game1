//  INIT
// ==========================================

function init() {
  const saved = localStorage.getItem('fanren_autosave');
  document.getElementById('btn-continue').style.display = saved ? '' : 'none';
}

function startGame(load) {
  document.getElementById('landing').classList.add('fade');
  setTimeout(() => { document.getElementById('landing').style.display = 'none'; }, 400);

  if (load) {
    const saved = localStorage.getItem('fanren_autosave');
    if (saved) {
      try { const data = JSON.parse(saved); _migrateSaveData(data); Object.assign(GameState, data); GameState._combatState = null; renderAll(); return; }
      catch (e) {}
    }
  }

  const origin = rollOrigin();
  GameState.origin = { id: origin.id, name: origin.name, rarity: origin.rarity };
  GameState.spiritStones = origin.bonus.spiritStones;
  GameState.spiritRoot = rollSpiritRoot();
  Object.entries(origin.bonus.items).forEach(([n,c]) => {
    GameState.breakItems[n] = (GameState.breakItems[n] || 0) + c;
  });
  GameState.breakItems['筑基丹'] = 1;

  grantStarterMaterials();

  showOriginCard(origin, function() {
    addLog(`身世：${origin.name}。${origin.desc.slice(0,30)}...`, '');
    addLog(`灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, 'success');
    renderAll();
  });
}

init();
