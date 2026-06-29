//  SAVE / LOAD
// ==========================================

// ---- 存档系统 ----

function autoSave() {
  try {
    const data = JSON.parse(JSON.stringify(GameState));
    data._timestamp = Date.now();
    data._label = `${data.realm||'练气'} ${data.age||18}岁 ${data.plane==='spirit'?'灵界':data.plane==='immortal'?'仙界':'人界'}`;
    localStorage.setItem('fanren_autosave', JSON.stringify(data));
  } catch(e) { /* silent */ }
}

function saveToSlot(slot) {
  try {
    const data = JSON.parse(JSON.stringify(GameState));
    data._timestamp = Date.now();
    data._label = `${data.realm||'练气'} ${data.age||18}岁 ${data.plane==='spirit'?'灵界':data.plane==='immortal'?'仙界':'人界'}`;
    localStorage.setItem('fanren_slot_'+slot, JSON.stringify(data));
    openModal('存档成功', `已保存至槽位 ${slot}。`);
  } catch(e) { openModal('存档失败','存储空间不足。'); }
}

function loadSlot(slot) {
  try {
    const data = localStorage.getItem('fanren_slot_'+slot);
    if(!data){ openModal('空槽位','该槽位无存档。'); return; }
    const saved = JSON.parse(data);
    if(saved._version !== 1) { openModal('版本不兼容','存档版本过旧。'); return; }
    _migrateSaveData(saved);
    Object.assign(GameState, saved);
    GameState._combatState = null;
    renderAll();
    openModal('读档成功', `已从槽位 ${slot} 读取。`);
  } catch(e) { openModal('读档失败','数据损坏。'); }
}

function loadGame() {
  openModal('读档', '选择存档槽位：', [
    { label: '自动存档', onclick: 'closeModal();loadAutoSave()' },
    { label: '槽位1', onclick: 'closeModal();loadSlot(1)' },
    { label: '槽位2', onclick: 'closeModal();loadSlot(2)' },
    { label: '槽位3', onclick: 'closeModal();loadSlot(3)' },
  ]);
}

function loadAutoSave() {
  try {
    const data = localStorage.getItem('fanren_autosave');
    if(!data){ openModal('无存档','没有自动存档。'); return; }
    const saved = JSON.parse(data);
    _migrateSaveData(saved);
    Object.assign(GameState, saved);
    GameState._combatState = null;
    renderAll();
    openModal('读档成功','自动存档已恢复。');
  } catch(e) { openModal('读档失败','数据损坏。'); }
}

function openSaveManager() {
  const slotInfo = [1,2,3].map(s => {
    const d = localStorage.getItem('fanren_slot_'+s);
    if(!d) return `槽位${s}：空`;
    try { const p=JSON.parse(d); return `槽位${s}：${p._label||'--'} · ${new Date(p._timestamp).toLocaleString()}`; }
    catch(e){ return `槽位${s}：损坏`; }
  }).join('<br>');

  openModal('存档管理', slotInfo, [
    { label: '存槽位1', onclick: 'closeModal();saveToSlot(1)' },
    { label: '存槽位2', onclick: 'closeModal();saveToSlot(2)' },
    { label: '存槽位3', onclick: 'closeModal();saveToSlot(3)' },
  ]);
}

function resetGame() {
  openModal('确认重置', '重置将清除所有存档。不可撤销。', [
    { label: '取消', onclick: 'closeModal()' },
    { label: '确认重置', onclick: 'doReset()', primary: true },
  ]);
}

function doReset() {
  closeModal();
  [1,2,3].forEach(s => localStorage.removeItem('fanren_slot_'+s));
  localStorage.removeItem('fanren_autosave');
  resetState(true);
  GameState.breakItems['筑基丹'] = 1;
  grantStarterMaterials();
  const origin = rollOrigin();
  GameState.origin = { id: origin.id, name: origin.name, rarity: origin.rarity };
  GameState.spiritStones = origin.bonus.spiritStones;
  Object.entries(origin.bonus.items).forEach(([n,c]) => { GameState.breakItems[n] = (GameState.breakItems[n] || 0) + c; });
  GameState.spiritRoot = rollSpiritRoot();
  renderAll();
  showOriginCard(origin, function() {
    addLog(`身世：${origin.name}。${origin.desc.slice(0,30)}...`, '');
    addLog(`灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, 'success');
    renderAll();
  });
}

// ---- auto-save hooks ----

// ---- 存档迁移：清理旧版丹药名 ----
const _OLD_PILLS = ['结丹丹','结婴丹','化神丹','炼虚丹','合体丹','大乘丹','真仙丹','金仙丹','太乙丹','大罗丹','道祖丹','破境丹','天劫丹','小还丹','培元丹','凝气丹','血狼丹','洗髓丹','长寿丹','夺天丹'];

function _migrateSaveData(data) {
  if (!data || !data.breakItems) return;
  _OLD_PILLS.forEach(name => { if (data.breakItems[name] !== undefined) delete data.breakItems[name]; });
  if (!data.materials) data.materials = {};
  if (!data.cauldron) data.cauldron = 'xia';
  if (data._alchemyBreakBonus === undefined) data._alchemyBreakBonus = null;
  if (data.stashedSkills === undefined) data.stashedSkills = [];
  if (data._droppedUnique === undefined) data._droppedUnique = {};
  if (data._destinyUsed === undefined) data._destinyUsed = false;
  if (data._tribulationShieldUsed === undefined) data._tribulationShieldUsed = 0;
}

