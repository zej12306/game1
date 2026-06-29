// ==========================================
//  js/alchemy.js — 炼丹系统逻辑与UI（原著向）
// ==========================================

let _alchemySelectedRecipe = null;
let _alchemyFilterTier = 0;

// ---- 主入口 ----
function openAlchemy() {
  if (!GameState.materials) GameState.materials = {};
  if (!GameState.cauldron) GameState.cauldron = 'xia';
  _alchemySelectedRecipe = null;
  _renderAlchemyModal();
}

function _renderAlchemyModal() {
  const cauldronData = _getCauldronData();
  const materialCount = Object.values(GameState.materials).reduce((s, c) => s + c, 0);
  const canBuyBetter = _getNextCauldron();

  // header: 丹炉 + 材料概览
  let headerHtml = `<div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">`;
  headerHtml += `<div style="flex:1;background:var(--bg-surface);border-radius:var(--radius-sm);padding:10px 14px;">
    <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">当前丹炉</div>
    <div style="font-size:15px;font-weight:500;color:var(--gold);">${cauldronData.name}</div>
    <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;line-height:1.5;">${cauldronData.desc}</div>
    <div style="font-size:10px;color:var(--text-secondary);">
      成丹${cauldronData.successBonus>=0?'+':''}${Math.round(cauldronData.successBonus*100)}% · 耗时${cauldronData.timeMult>=1?'+':''}${Math.round((cauldronData.timeMult-1)*100)}% · 品质${cauldronData.qualityBonus>=0?'+':''}${Math.round(cauldronData.qualityBonus*100)}%
    </div>
    ${canBuyBetter ? `<div style="margin-top:6px;"><button onclick="closeModal();_buyCauldron()" style="background:var(--bg-card);border:1px solid rgba(255,255,255,0.1);color:var(--gold);padding:3px 10px;border-radius:var(--radius-sm);font-size:11px;cursor:pointer;font-family:var(--font-sans);">升级 → ${canBuyBetter.name} (${canBuyBetter.price}灵石)</button></div>` : `<div style="margin-top:6px;font-size:10px;color:var(--text-tertiary);">已是最高品级</div>`}
  </div>`;
  headerHtml += `<div style="flex:1;background:var(--bg-surface);border-radius:var(--radius-sm);padding:10px 14px;">
    <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">材料库存 (${materialCount})</div>
    <div style="font-size:14px;font-weight:500;color:var(--text-primary);">${materialCount > 0 ? _materialPreview() : '<span style="color:var(--text-tertiary);">空空如也</span>'}</div>
    <div style="margin-top:6px;"><button onclick="closeModal();_openMaterialShop()" style="background:var(--bg-card);border:1px solid rgba(255,255,255,0.1);color:var(--azure);padding:3px 10px;border-radius:var(--radius-sm);font-size:11px;cursor:pointer;font-family:var(--font-sans);">灵石采买</button></div>
  </div>`;
  headerHtml += `</div>`;

  // 筛选栏
  let filterHtml = `<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
    <button onclick="_alchemyFilterTier=0;_renderAlchemyBody()" style="padding:3px 10px;border:1px solid ${_alchemyFilterTier===0?'var(--gold)':'rgba(255,255,255,0.1)'};border-radius:var(--radius-sm);background:${_alchemyFilterTier===0?'rgba(201,169,110,0.1)':'var(--bg-surface)'};color:${_alchemyFilterTier===0?'var(--gold)':'var(--text-secondary)'};font-size:11px;cursor:pointer;font-family:var(--font-sans);">全部</button>`;
  for (let t = 1; t <= 5; t++) {
    const tierNames = ['','一品','二品','三品','四品','五品'];
    filterHtml += `<button onclick="_alchemyFilterTier=${t};_renderAlchemyBody()" style="padding:3px 10px;border:1px solid ${_alchemyFilterTier===t?'var(--gold)':'rgba(255,255,255,0.1)'};border-radius:var(--radius-sm);background:${_alchemyFilterTier===t?'rgba(201,169,110,0.1)':'var(--bg-surface)'};color:${_alchemyFilterTier===t?'var(--gold)':'var(--text-secondary)'};font-size:11px;cursor:pointer;font-family:var(--font-sans);">${tierNames[t]}</button>`;
  }
  filterHtml += `</div>`;

  // 丹方列表
  const filtered = _alchemyFilterTier === 0 ? ALCHEMY_RECIPES : ALCHEMY_RECIPES.filter(r => r.tier === _alchemyFilterTier);

  let listHtml = `<div id="alchemy-recipe-list" style="max-height:240px;overflow-y:auto;margin-bottom:10px;">`;
  filtered.forEach(recipe => {
    const canCraft = _canCraft(recipe);
    const selected = _alchemySelectedRecipe && _alchemySelectedRecipe.id === recipe.id;
    const borderColor = selected ? 'var(--gold)' : (canCraft ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.06)');
    const bgColor = selected ? 'rgba(201,169,110,0.08)' : 'var(--bg-surface)';
    const opacity = canCraft ? 1 : 0.55;
    const tierColor = ['','var(--text-secondary)','var(--jade)','var(--azure)','#b066ff','var(--gold)'][recipe.tier];

    listHtml += `<div onclick="_selectAlchemyRecipe('${recipe.id}')" style="display:flex;align-items:center;padding:8px 10px;margin-bottom:4px;border:1px solid ${borderColor};border-radius:var(--radius-sm);background:${bgColor};cursor:pointer;opacity:${opacity};transition:all 0.15s;font-size:12px;">
      <span style="color:${tierColor};font-weight:500;min-width:65px;">[${recipe.tier}品] ${recipe.name}</span>
      <span style="color:var(--text-secondary);flex:1;margin:0 8px;font-size:11px;">${recipe.effect.desc}</span>
      <span style="color:var(--text-tertiary);font-size:10px;">难${recipe.difficulty}</span>
    </div>`;
  });
  listHtml += `</div>`;

  // 选中丹方详情
  let detailHtml = '';
  if (_alchemySelectedRecipe) {
    const recipe = _alchemySelectedRecipe;
    const canCraft = _canCraft(recipe);
    detailHtml = `<div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:12px 14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-size:14px;font-weight:500;color:var(--gold);">${recipe.name}</div>
        <div style="font-size:11px;color:var(--text-tertiary);">${recipe.days}天 · 难度${recipe.difficulty}</div>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;line-height:1.5;">${recipe.desc}</div>
      <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">所需材料：</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${_renderRecipeMaterials(recipe)}</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">
        预计成丹率：<span style="color:${_calcSuccessRate(recipe)>=0.65?'var(--jade)':_calcSuccessRate(recipe)>=0.4?'var(--amber)':'var(--crimson)'};">${Math.round(_calcSuccessRate(recipe)*100)}%</span>
      </div>`;

    if (canCraft) {
      detailHtml += `<button onclick="closeModal();_doCraft('${recipe.id}')" style="width:100%;padding:10px 0;border:1px solid var(--gold);border-radius:var(--radius-sm);background:rgba(201,169,110,0.12);color:var(--gold);font-size:14px;cursor:pointer;font-family:var(--font-sans);">开炉炼丹</button>`;
    } else {
      detailHtml += `<div style="font-size:12px;color:var(--crimson);text-align:center;">材料不足，无法炼制</div>`;
    }
    detailHtml += `</div>`;
  } else {
    detailHtml = `<div style="text-align:center;padding:20px;color:var(--text-tertiary);font-size:12px;">选择上方丹方查看详情</div>`;
  }

  // 底部材料清单
  let invHtml = `<div style="margin-top:8px;font-size:11px;color:var(--text-tertiary);">材料清单：</div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;max-height:80px;overflow-y:auto;">`;
  const entries = Object.entries(GameState.materials).filter(([_,c]) => c > 0)
    .sort((a,b) => (ALCHEMY_MATERIALS[a[0]]?.tier||9) - (ALCHEMY_MATERIALS[b[0]]?.tier||9));
  if (entries.length === 0) {
    invHtml += `<span style="color:var(--text-tertiary);font-size:10px;">无材料</span>`;
  } else {
    entries.forEach(([id, count]) => {
      const mat = ALCHEMY_MATERIALS[id];
      const tColor = mat ? ['','var(--text-secondary)','var(--jade)','var(--azure)','#b066ff','var(--gold)'][mat.tier] : 'var(--text-secondary)';
      invHtml += `<span style="padding:1px 6px;border:1px solid rgba(255,255,255,0.06);border-radius:3px;font-size:10px;color:${tColor};">${mat?mat.name:id} ×${count}</span>`;
    });
  }
  invHtml += `</div>`;

  const body = headerHtml + filterHtml + listHtml + invHtml + detailHtml;
  openModal('炼丹阁', body, [{ label: '关闭', onclick: 'closeModal()' }]);
}

function _renderAlchemyBody() { _renderAlchemyModal(); }
function _selectAlchemyRecipe(recipeId) { _alchemySelectedRecipe = ALCHEMY_RECIPES.find(r => r.id === recipeId); _renderAlchemyModal(); }

function _materialPreview() {
  const entries = Object.entries(GameState.materials).filter(([_,c]) => c > 0).sort((a,b) => b[1] - a[1]).slice(0, 4);
  return entries.map(([id, count]) => {
    const mat = ALCHEMY_MATERIALS[id];
    return (mat ? mat.name : id) + '×' + count;
  }).join(' ') + (Object.keys(GameState.materials).filter(k => GameState.materials[k] > 0).length > 4 ? ' ...' : '');
}

function _renderRecipeMaterials(recipe) {
  return Object.entries(recipe.materials).map(([matId, need]) => {
    const mat = ALCHEMY_MATERIALS[matId];
    const have = GameState.materials[matId] || 0;
    const enough = have >= need;
    const tColor = mat ? ['','var(--text-secondary)','var(--jade)','var(--azure)','#b066ff','var(--gold)'][mat.tier] : 'var(--text-secondary)';
    return `<span style="padding:2px 8px;border:1px solid ${enough?'rgba(201,169,110,0.3)':'rgba(192,57,43,0.3)'};border-radius:3px;font-size:10px;color:${tColor};">
      ${mat?mat.name:matId} <span style="color:${enough?'var(--jade)':'var(--crimson)'};">${need}/${have}</span>
    </span>`;
  }).join('');
}

// ---- 辅助 ----
function _getCauldronData() {
  return CAULDRONS.find(c => c.id === (GameState.cauldron || 'xia')) || CAULDRONS[0];
}

function _getNextCauldron() {
  const tiers = ['xia', 'zhong', 'shang', 'ji'];
  const idx = tiers.indexOf(GameState.cauldron);
  if (idx < 0 || idx >= tiers.length - 1) return null;
  return CAULDRONS.find(c => c.id === tiers[idx + 1]);
}

function _canCraft(recipe) {
  return Object.entries(recipe.materials).every(([matId, need]) => (GameState.materials[matId] || 0) >= need);
}

function _calcSuccessRate(recipe) {
  const cauldron = _getCauldronData();
  let rate = ALCHEMY_BASE_SUCCESS - (recipe.difficulty - 1) * 0.07;
  rate += cauldron.successBonus;
  rate += Math.floor(getEffectiveWis() / 10) * 0.02;
  if (GameState.spiritRoot && GameState.spiritRoot.breakthroughBonus) {
    rate += GameState.spiritRoot.breakthroughBonus * 0.5;
  }
  return Math.max(0.05, Math.min(0.95, rate));
}

// ---- 炼制核心 ----
function _doCraft(recipeId) {
  const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;
  if (!_canCraft(recipe)) {
    openModal('材料不足', '缺少必要材料，无法炼制。');
    return;
  }

  // 消耗材料
  Object.entries(recipe.materials).forEach(([matId, need]) => {
    GameState.materials[matId] = (GameState.materials[matId] || 0) - need;
    if (GameState.materials[matId] <= 0) delete GameState.materials[matId];
  });

  const cauldron = _getCauldronData();
  const days = Math.max(1, Math.round(recipe.days * cauldron.timeMult));
  advanceTime(days);

  const rate = _calcSuccessRate(recipe);
  const success = Math.random() < rate;

  if (!success) {
    // 失败 → 原著中可能炸炉
    let msg = `炼丹失败！${recipe.name}化为飞灰。`;
    // 炸炉判定：高难度丹方+倒霉时
    if (recipe.difficulty >= 6 && Math.random() < 0.08) {
      _damageCauldron();
      msg += ` 丹炉遭受损伤！`;
    }
    addLog(msg + `（${days}天）`, 'danger');
    renderAll();
    return;
  }

  // 成功 → 判定品质
  const cauldronQB = cauldron.qualityBonus;
  const weights = {
    low:  Math.max(5,  BASE_QUALITY_WEIGHT.low  - Math.round(cauldronQB * 100)),
    mid:  BASE_QUALITY_WEIGHT.mid,
    high: BASE_QUALITY_WEIGHT.high + Math.round(cauldronQB * 50),
    top:  Math.max(1,  BASE_QUALITY_WEIGHT.top  + Math.round(cauldronQB * 50)),
  };
  const totalW = weights.low + weights.mid + weights.high + weights.top;
  let roll = Math.random() * totalW;
  let quality = 'low';
  if ((roll -= weights.top) <= 0) quality = 'top';
  else if ((roll -= weights.high) <= 0) quality = 'high';
  else if ((roll -= weights.mid) <= 0) quality = 'mid';

  const pq = PILL_QUALITY[quality];
  const qualitySuffix = quality !== 'low' ? `【${pq.name}】` : '';
  const qualityMult = pq.mult;

  // 处理效果
  const eff = recipe.effect;
  switch (eff.type) {
    case 'breakRequired':
      // 筑基丹——必须品
      GameState.breakItems[eff.itemName] = (GameState.breakItems[eff.itemName] || 0) + 1;
      addLog(`炼丹成功！获得 ${eff.itemName}${qualitySuffix}（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;

    case 'breakBonus':
      // 降尘丹/结婴药液——突破加成，自动在对应的突破时消耗
      GameState.breakItems[recipe.name] = (GameState.breakItems[recipe.name] || 0) + 1;
      if (!GameState._alchemyBreakBonus) GameState._alchemyBreakBonus = {};
      GameState._alchemyBreakBonus[recipe.name] = {
        val: Math.round(eff.val * qualityMult * 100) / 100,
        quality,
      };
      addLog(`炼丹成功！获得 ${recipe.name}${qualitySuffix}（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;

    case 'cultRecover':
      const crGain = Math.round(eff.val * qualityMult);
      GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + crGain);
      addLog(`炼丹成功！${recipe.name}${qualitySuffix}，修为+${crGain}（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;

    case 'attrUp':
      const attrGain = Math.round(eff.val * qualityMult);
      GameState[eff.attr] = (GameState[eff.attr] || 0) + attrGain;
      const attrName = { atk:'攻击', def:'防御', spd:'速度', wis:'神识', vit:'体魄', spi:'灵力' }[eff.attr];
      addLog(`炼丹成功！${recipe.name}${qualitySuffix}，${attrName}永久+${attrGain}（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;

    case 'lifespan':
      const lsGain = Math.round(eff.val * qualityMult);
      applyLifespan(GameState, lsGain);
      addLog(`炼丹成功！${recipe.name}${qualitySuffix}，寿元上限+${lsGain}年（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;

    case 'allAttr':
      const allGain = Math.round(eff.val * qualityMult);
      ['atk','def','spd','wis','vit','spi'].forEach(a => {
        GameState[a] = (GameState[a] || 0) + allGain;
      });
      addLog(`炼丹成功！${recipe.name}${qualitySuffix}，六维全属性+${allGain}（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;

    case 'combatItem':
      // 战斗消耗品：存入 combatItems 而非 breakItems
      if (!GameState.combatItems) GameState.combatItems = {};
      GameState.combatItems[eff.itemId] = (GameState.combatItems[eff.itemId] || 0) + 1;
      addLog(`炼丹成功！获得 ${recipe.name}${qualitySuffix}，已存入战斗物品（${days}天）`, quality === 'top' ? 'crit' : 'success');
      break;
  }

  // 炼丹声望
  const alchemyRenown = gainAlchemyRenown(recipe.tier);
  if (alchemyRenown.gained > 0) addLog(`炼丹声望 +${alchemyRenown.gained}`, '');
  if (alchemyRenown.rankedUp) addLog(`声望升阶！晋升为「${alchemyRenown.newRank.name}」`, 'crit');

  if (checkDeath()) return;
  renderAll();
}

// 炸炉：丹炉降级（原著中韩立也炸过炉）
function _damageCauldron() {
  const tiers = ['xia', 'zhong', 'shang', 'ji'];
  const idx = tiers.indexOf(GameState.cauldron);
  if (idx <= 0) return; // 下品不会再降
  GameState.cauldron = tiers[idx - 1];
}

// ---- 灵石采买 ----
function _openMaterialShop() {
  const matList = Object.entries(ALCHEMY_MATERIALS).map(([id, mat]) => {
    const have = GameState.materials[id] || 0;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div>
        <span style="font-size:12px;color:var(--text-primary);">${mat.name}</span>
        <span style="font-size:10px;color:var(--text-tertiary);margin-left:6px;">${mat.desc}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:11px;color:var(--text-secondary);">×${have}</span>
        <button onclick="event.stopPropagation();_buyMaterial('${id}')" style="padding:2px 10px;border:1px solid var(--gold);border-radius:var(--radius-sm);background:rgba(201,169,110,0.08);color:var(--gold);font-size:11px;cursor:pointer;font-family:var(--font-sans);">${mat.price}灵石</button>
      </div>
    </div>`;
  }).join('');

  const body = `
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">当前灵石：<b style="color:var(--gold);">${GameState.spiritStones}</b></div>
    <div style="max-height:320px;overflow-y:auto;">${matList}</div>
  `;
  openModal('灵石采买', body, [
    { label: '返回炼丹阁', onclick: 'closeModal();openAlchemy()' },
  ]);
}

function _buyMaterial(matId) {
  const mat = ALCHEMY_MATERIALS[matId];
  if (!mat) return;
  if (GameState.spiritStones < mat.price) {
    openModal('灵石不足', `购买${mat.name}需要${mat.price}灵石，当前仅有${GameState.spiritStones}灵石。`);
    return;
  }
  GameState.spiritStones -= mat.price;
  GameState.materials[matId] = (GameState.materials[matId] || 0) + 1;
  addLog(`采买 ${mat.name} ×1，灵石-${mat.price}`, 'loot');
  renderAll();
  _openMaterialShop();
}

// ---- 丹炉升级 ----
function _buyCauldron() {
  const next = _getNextCauldron();
  if (!next) { openModal('已满级', '当前已是最高品质丹炉。'); return; }
  if (GameState.spiritStones < next.price) {
    openModal('灵石不足', `${next.name}需要${next.price}灵石，当前仅有${GameState.spiritStones}灵石。`);
    return;
  }

  openModal('升级丹炉',
    `<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">
      <div>当前：<b style="color:var(--gold);">${_getCauldronData().name}</b></div>
      <div>升级至：<b style="color:var(--gold);">${next.name}</b></div>
      <div style="margin-top:6px;font-size:11px;color:var(--text-tertiary);">${next.desc}</div>
      <div style="margin-top:4px;font-size:11px;color:var(--text-tertiary);">
        成丹${next.successBonus>=0?'+':''}${Math.round(next.successBonus*100)}% ·
        耗时${next.timeMult>=1?'+':''}${Math.round((next.timeMult-1)*100)}% ·
        品质${next.qualityBonus>=0?'+':''}${Math.round(next.qualityBonus*100)}%
      </div>
      <div style="margin-top:8px;color:var(--gold);">费用：${next.price} 灵石</div>
    </div>`,
    [
      { label: '取消', onclick: 'closeModal()' },
      { label: '购买', onclick: 'closeModal();_doBuyCauldron()', primary: true },
    ]
  );
}

function _doBuyCauldron() {
  const next = _getNextCauldron();
  if (!next || GameState.spiritStones < next.price) return;
  GameState.spiritStones -= next.price;
  GameState.cauldron = next.id;
  addLog(`升级丹炉 → ${next.name}，灵石-${next.price}`, 'success');
  renderAll();
}

// ---- 探索材料掉落 ----
function tryMaterialDrop(nodeName) {
  const dropChance = 0.25;
  if (Math.random() > dropChance) return null;

  const plane = GameState.plane;
  let maxTier = 1;
  if (plane === 'human') maxTier = 3;
  else if (plane === 'spirit') maxTier = 4;
  else maxTier = 5;

  const tierWeights = [0, 50, 30, 15, 4, 1];
  const totalW = tierWeights.slice(1, maxTier + 1).reduce((s, w) => s + w, 0);
  let roll = Math.random() * totalW;
  let tier = 1;
  for (let t = 1; t <= maxTier; t++) {
    roll -= tierWeights[t];
    if (roll <= 0) { tier = t; break; }
  }

  const matId = rollMaterialFromTier(tier);
  if (!matId) return null;

  GameState.materials[matId] = (GameState.materials[matId] || 0) + 1;
  const mat = ALCHEMY_MATERIALS[matId];
  return mat ? mat.name : matId;
}

// ---- 初始材料（黄枫谷时期灵药） ----
function grantStarterMaterials() {
  const starters = { tianlingguo: 8, baiyulu: 5, chijinzhi: 3, lingShiFen: 3 };
  Object.entries(starters).forEach(([id, count]) => {
    GameState.materials[id] = (GameState.materials[id] || 0) + count;
  });
  GameState.cauldron = 'xia';
}
