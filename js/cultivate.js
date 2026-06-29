// ---- 衰老系统 ----

function getAgingDebuff() {
  const pct = GameState.lifespanMax > 0 ? GameState.age / GameState.lifespanMax : 0;
  if (pct >= 1.0) return { eff: 0, vit: -10, wis: -3, label: '寿元耗尽' };
  if (pct >= 0.85) return { eff: 0.20, vit: -5, wis: -1, label: '风烛残年' };
  if (pct >= 0.70) return { eff: 0.12, vit: -2, wis: 0, label: '迟暮之年' };
  if (pct >= 0.50) return { eff: 0.05, vit: 0, wis: 0, label: '衰老初现' };
  return { eff: 0, vit: 0, wis: 0, label: '鼎盛' };
}

// ---- 死亡与轮回 ----

function triggerDeath(cause) {
  const s = GameState;

  // 轮回经·destiny 效果：一次免死
  const msEff = getMainSkillEffect();
  if (msEff && msEff.type === 'destiny' && !s._destinyUsed) {
    s._destinyUsed = true;
    addLog('轮回经运转！命运逆转，逃过一劫', 'crit');
    s.cultivation = Math.floor(s.cultivationMax * 0.5);
    s.lifespanMax -= 10;
    renderAll();
    return;
  }

  // 滴血重生·deathResist 效果
  const deathResist = getSubSkillEffectVal('deathResist');
  if (deathResist > 0 && Math.random() < deathResist) {
    addLog('滴血重生触发生效！重伤存活', 'success');
    s.cultivation = Math.floor(s.cultivation * 0.3);
    s.lifespanMax -= 20;
    renderAll();
    return;
  }

  s.pastLives.push({ cause, age: s.age, realm: s.realm, subLevel: s.subLevel, totalDays: s.totalDays, spiritStones: s.spiritStones });

  const last = s.pastLives[s.pastLives.length - 1];
  const pastHtml = s.pastLives.map((l,i) =>
    `<div style="font-size:11px;color:var(--text-tertiary);padding:2px 0;">第${i+1}世 ${l.cause} ${l.realm} ${l.age}岁</div>`
  ).join('');

  const body = `
    <div style="text-align:center;font-family:var(--font-display);font-size:20px;color:var(--gold);margin-bottom:8px;">轮回台</div>
    <div style="text-align:center;font-size:13px;color:var(--text-secondary);margin-bottom:4px;">
      第 <b>${s.pastLives.length}</b> 世终结 · 死于：${cause} · 享年 <b>${last.age}</b> 岁
    </div>
    <div style="text-align:center;font-size:12px;color:var(--text-tertiary);margin-bottom:12px;">
      最高境界：${last.realm}${({1:'初期',5:'中期',9:'圆满'}[last.subLevel]||'中期')}
    </div>
    <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:8px 12px;margin-bottom:14px;">${pastHtml}</div>
    <div class="death-grid">
      <div class="death-card" onclick="closeModal();doRebirth()">
        <div class="death-name">重新投胎</div>
        <div class="death-desc">完全重置，随机身世，无任何惩罚</div>
      </div>
      <div class="death-card" onclick="closeModal();doRebirthKeep()">
        <div class="death-name">转世重修</div>
        <div class="death-desc">保留1件物品，下世寿元${Math.round((s.rebirthDebuff+0.3)*100)}%</div>
        <div class="death-risk">代价：寿元-30%（可叠加）</div>
      </div>
      <div class="death-card" onclick="closeModal();doRebirthLegacy()">
        <div class="death-name">因果传承</div>
        <div class="death-desc">遗留${Math.floor(s.spiritStones*0.1)}灵石+1颗丹药于初始地图</div>
        <div class="death-risk">必须探索找到，否则消失</div>
      </div>
      <div class="death-card possess-card" onclick="closeModal();showPossess()">
        <div class="death-name">夺舍</div>
        <div class="death-desc">侵占他人肉身重生，保留大量遗产</div>
        <div class="death-risk">失败→强制重新投胎</div>
      </div>
    </div>
    <div style="text-align:center;font-size:10px;color:var(--text-tertiary);margin-top:8px;">选择后不可撤回</div>
  `;

  openModal('', body, []);
}

function doRebirth() {
  resetState(false);
  const origin = rollOrigin();
  GameState.origin = { id: origin.id, name: origin.name, rarity: origin.rarity };
  GameState.spiritStones = origin.bonus.spiritStones;
  Object.entries(origin.bonus.items).forEach(([n,c]) => {
    GameState.breakItems[n] = (GameState.breakItems[n] || 0) + c;
  });
  GameState.spiritRoot = rollSpiritRoot();
  grantStarterMaterials();
  addLog(`第${GameState.pastLives.length}世：重新投胎 · ${origin.name} · 灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, '');
  renderAll();
}

function doRebirthKeep() {
  // save current items for selection
  const items = Object.entries(GameState.breakItems).filter(([_,c]) => c > 0);
  // 也包含暂存功法残卷
  const stashed = (GameState.stashedSkills||[]).map(id => ({ id, name: (getSubSkill(id)?.name||id) + '·功法残卷' }));
  if (items.length === 0 && stashed.length === 0) {
    const savedOrigin = GameState.origin;
    resetState(false);
    GameState.origin = savedOrigin;
    GameState.spiritRoot = rollSpiritRoot();
    GameState.rebirthDebuff += 0.3;
    GameState.lifespanMax = Math.floor(GameState.lifespanMax * (1 - GameState.rebirthDebuff));
    grantStarterMaterials();
    addLog(`转世重修：无物可留，寿元受${Math.round(GameState.rebirthDebuff*100)}%惩罚 · 灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, 'danger');
    renderAll();
    return;
  }

  // let player pick one item
  let itemHtml = items.map(([n,c],i) =>
    `<button style="display:block;width:100%;margin:4px 0;padding:8px 12px;border:1px solid var(--color-border-tertiary);border-radius:var(--border-radius-sm);background:var(--color-background-secondary);color:var(--color-text-primary);cursor:pointer;font-size:12px;font-family:var(--font-sans);text-align:left;" onclick="closeModal();_doRebirthKeep('${n}')">${n} x${c}</button>`
  ).join('');
  if (stashed.length > 0) {
    itemHtml += `<div style="font-size:10px;color:var(--text-tertiary);margin:6px 0 2px;">功法残卷：</div>` +
      stashed.map(s => `<button style="display:block;width:100%;margin:4px 0;padding:8px 12px;border:1px solid var(--color-border-tertiary);border-radius:var(--border-radius-sm);background:var(--color-background-secondary);color:var(--color-text-primary);cursor:pointer;font-size:12px;font-family:var(--font-sans);text-align:left;" onclick="closeModal();_doRebirthKeepSkill('${s.id}')">${s.name}</button>`).join('');
  }

  openModal('选择保留物品', `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">选择一件物品带入下世：</div>${itemHtml}`, [
    { label: '放弃', onclick: 'closeModal();_doRebirthKeep(null)' }
  ]);
}

function _doRebirthKeep(itemName) {
  const savedOrigin = GameState.origin; // 转世重修保留身世
  resetState(false);
  GameState.origin = savedOrigin;
  GameState.spiritRoot = rollSpiritRoot();
  GameState.rebirthDebuff += 0.3;
  GameState.lifespanMax = Math.floor(GameState.lifespanMax * (1 - GameState.rebirthDebuff));
  if (itemName) GameState.breakItems[itemName] = 1;
  grantStarterMaterials();
  // add origin bonus stones
  const originData = ORIGINS.find(o => o.id === savedOrigin.id);
  if (originData) GameState.spiritStones = originData.bonus.spiritStones;
  addLog(`转世重修：保留${itemName||'无'}，寿元受${Math.round(GameState.rebirthDebuff*100)}%惩罚 · 灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, 'danger');
  renderAll();
}

function _doRebirthKeepSkill(skillId) {
  const savedOrigin = GameState.origin;
  const sk = getSubSkill(skillId);
  resetState(false);
  GameState.origin = savedOrigin;
  GameState.spiritRoot = rollSpiritRoot();
  GameState.rebirthDebuff += 0.3;
  GameState.lifespanMax = Math.floor(GameState.lifespanMax * (1 - GameState.rebirthDebuff));
  GameState.stashedSkills = [skillId];
  grantStarterMaterials();
  const originData = ORIGINS.find(o => o.id === savedOrigin.id);
  if (originData) GameState.spiritStones = originData.bonus.spiritStones;
  addLog(`转世重修：保留「${sk?.name||skillId}」功法残卷，寿元受${Math.round(GameState.rebirthDebuff*100)}%惩罚 · 灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, 'danger');
  renderAll();
}

function doRebirthLegacy() {
  const s = GameState;
  const stones = Math.floor(s.spiritStones * 0.1);
  // pick a random break item
  const items = Object.entries(s.breakItems).filter(([_,c]) => c > 0);
  const legacyItem = items.length > 0 ? items[Math.floor(Math.random()*items.length)][0] : null;

  s.legacyStash = {
    stones: stones,
    item: legacyItem,
    nodeName: '初始之地',
    claimed: false,
  };

  resetState(false);
  const origin = rollOrigin();
  GameState.origin = { id: origin.id, name: origin.name, rarity: origin.rarity };
  GameState.spiritStones = origin.bonus.spiritStones;
  GameState.spiritRoot = rollSpiritRoot();
  Object.entries(origin.bonus.items).forEach(([n,c]) => {
    GameState.breakItems[n] = (GameState.breakItems[n] || 0) + c;
  });
  grantStarterMaterials();
  addLog(`因果传承：${stones}灵石 + ${legacyItem||'无'} 埋藏在初始之地，探索可得 · 新身世：${origin.name} · 灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]`, 'loot');
  renderAll();
}

// ---- 夺舍系统 ----

const POSSESS_TIERS = [
  { name: '练气散修', rate: 0.80, keepItems: true, keepStones: true, keepCount: 3, startRealm: '练气' },
  { name: '筑基散修', rate: 0.50, keepItems: true, keepStones: true, keepCount: 2, startRealm: '练气', startSub: 7 },
  { name: '金丹修士', rate: 0.25, keepItems: true, keepStones: true, keepCount: -1, startRealm: '筑基', startSub: 4 },
  { name: '元婴魔修', rate: 0.08, keepItems: true, keepStones: true, keepCount: -1, startRealm: '金丹', startSub: 1 },
];

function showPossess() {
  const wisBonus = Math.floor(GameState.wis / 10) * 0.02;
  const failPenalty = GameState.takeOverFailCount * 0.05;

  const tiersHtml = POSSESS_TIERS.map((t,i) => {
    const rate = Math.max(0.01, t.rate + wisBonus - failPenalty);
    return `<div class="possess-tier" onclick="closeModal();doPossess(${i})">
      <div class="tier-name">${t.name}</div>
      <div class="tier-rate">${Math.round(rate*100)}%</div>
      <div class="tier-bonus">起始${t.startRealm}${t.startSub ? '第'+t.startSub+'层' : '初期'}</div>
    </div>`;
  }).join('');

  const body = `
    <div style="font-size:14px;font-weight:500;color:var(--crimson);margin-bottom:6px;">夺舍</div>
    <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">神识+${Math.floor(wisBonus*100)}% · 失败惩罚-${Math.floor(failPenalty*100)}% · 失败=强制重新投胎</div>
    <div class="possess-tier-grid">${tiersHtml}</div>
    <div style="font-size:10px;color:var(--text-tertiary);text-align:center;">夺舍失败：强制重新投胎 + 下次夺舍各档永久-5%</div>
  `;

  openModal('', body, [{ label: '放弃夺舍', onclick: 'closeModal();showDeathAgain()' }]);
}

function showDeathAgain() {
  // re-show the four-card death screen
  const s = GameState;
  if (s.pastLives.length === 0) return;
  triggerDeath(s.pastLives[s.pastLives.length-1].cause);
}

function doPossess(tierIdx) {
  const tier = POSSESS_TIERS[tierIdx];
  const wisBonus = Math.floor(GameState.wis / 10) * 0.02;
  const failPenalty = GameState.takeOverFailCount * 0.05;
  const rate = Math.max(0.01, tier.rate + wisBonus - failPenalty);

  const roll = Math.random();
  if (roll < rate) {
    // success
    const savedStones = tier.keepStones ? GameState.spiritStones : 0;
    let savedItems = {};
    if (tier.keepItems && tier.keepCount === -1) {
      savedItems = GameState.breakItems; // all items
    } else if (tier.keepItems) {
      const entries = Object.entries(GameState.breakItems).slice(0, tier.keepCount);
      entries.forEach(([n,c]) => { savedItems[n] = c; });
    }

    resetState(false);
    GameState.realm = tier.startRealm;
    GameState.subLevel = tier.startSub || 1;
    GameState.spiritStones = savedStones;
    GameState.breakItems = savedItems;

    const realm = getRealmData(tier.startRealm, 'human');
    if (realm) {
      GameState.lifespanMax = realm.lifespan;
      GameState.cultivationMax = 200;
    }
    // 夺舍：新肉身，新身世
    const origin = rollOrigin();
    GameState.origin = { id: origin.id, name: origin.name, rarity: origin.rarity };
    GameState.spiritRoot = rollSpiritRoot();
    grantStarterMaterials();
    addLog(`夺舍成功！侵占${tier.name}肉身，新身世：${origin.name}，灵根：${GameState.spiritRoot.name}[${GameState.spiritRoot.elements.join('·')}]，保留${Object.keys(savedItems).length}件物品 + ${savedStones}灵石`, 'success');
  } else {
    // failure
    GameState.takeOverFailCount++;
    addLog(`夺舍失败！神魂俱灭，强制轮回`, 'danger');
    doRebirth();
  }
  renderAll();
}

// ---- 前世查看 ----

function showPastLives() {
  const lives = GameState.pastLives;
  if (lives.length === 0) {
    openModal('前世记录', '尚无前世记录，珍惜此生。');
    return;
  }
  const html = '<table style="width:100%;font-size:12px;color:var(--text-secondary);border-collapse:collapse;">' +
    '<tr style="color:var(--text-tertiary);"><th style="text-align:left;padding:4px;">世</th><th style="text-align:left;">死因</th><th style="text-align:left;">境界</th><th style="text-align:right;">享年</th><th style="text-align:right;">修炼天数</th></tr>' +
    lives.map((l,i) => `<tr style="border-top:1px solid rgba(255,255,255,0.04);">
      <td style="padding:4px;color:var(--gold);">第${i+1}世</td>
      <td style="padding:4px;">${l.cause}</td>
      <td style="padding:4px;">${l.realm}${({1:'初期',5:'中期',9:'圆满'}[l.subLevel]||'中期')}</td>
      <td style="text-align:right;padding:4px;">${l.age}岁</td>
      <td style="text-align:right;padding:4px;">${l.totalDays||'-'}天</td>
    </tr>`).join('') + '</table>';
  openModal('前世记录', html);
}

// ---- 重置辅助 ----

function resetState(clearPastLives) {
  const s = GameState;
  s.realm = '练气'; s.subLevel = 1; s.maxSubLevel = 9;
  s.cultivation = 0; s.cultivationMax = 100;
  s.totalDays = 0; s.age = 18; s.lifespanMax = 100;
  s.atk = 3; s.def = 3; s.spd = 3; s.wis = 3; s.vit = 3; s.spi = 3;
  s.spiritStones = 10; s.plane = 'human';
  s.currentRegion = 'yue_huangfeng'; s.currentNode = 'hf_main';
  s.lastExploreDay = {};
  s.discoveredRegions = {};
  s.logs = []; s.delayDays = 0;
  s.breakItems = {};
  s.combatItems = {};
  s.mainSkill = 'qingyuan'; s.subSkills = []; s.skillProgress = {};
  s.stashedSkills = []; s._droppedUnique = {};
  s._destinyUsed = false; s._tribulationShieldUsed = 0;
  s._breakBonus = null; s._tribResist = null; s._alchemyBreakBonus = null;
  s.materials = {}; s.cauldron = 'xia'; s.pendingPillEffect = null;
  s._combatState = null;
  s.narrativeDay = 0; s.narrativeTriggered = []; s.lastRandomNarrative = 0;
  if (clearPastLives) {
    s.pastLives = []; s.rebirthDebuff = 0; s.takeOverFailCount = 0; s.legacyStash = null;
    s.spiritRoot = null;
  }
}

// ---- 修炼选择器弹窗 ----

function openCultivateSelector() {
  const realm = getRealmData(GameState.realm, GameState.plane);
  const aging = getAgingDebuff();
  const perDay = realm.cultivationPerDay * (PLANE_MODIFIER[GameState.plane] || 1) * (1 - aging.eff) * (GameState.spiritRoot?.eff || 1);
  const agingNote = aging.eff > 0 ? ` (${aging.label} -${Math.round(aging.eff*100)}%)` : '';

  const rootNote = GameState.spiritRoot ? ` · 灵根速率 ×${GameState.spiritRoot.eff}` : '';

  const presets = [
    { days: 3,  label: '浅修',  rate: '5%/天',  tip: '安全' },
    { days: 10, label: '静修',  rate: '8%/天',  tip: '保底1天' },
    { days: 30, label: '苦修',  rate: '10%/天', tip: '保底3天' },
    { days: 90, label: '闭关',  rate: '12%/天', tip: '有概率走火入魔' },
  ];

  let selectedDays = 10;
  const previewHtml = (d) => {
    const base = d * perDay;
    const critMin = d >= 90 ? 5 : d >= 30 ? 3 : d >= 10 ? 1 : 0;
    const critMax = Math.floor(d * 0.2);
    const critBonus = critMin * perDay;
    return `基础修为：<span>+${base}</span> ${agingNote}${rootNote} | 暴击范围：<span>+${critBonus} ~ +${critMax * perDay}</span>`;
  };

  const body = `
    <div class="cult-grid" id="cult-grid">${presets.map((p,i) => `
      <div class="cult-card ${p.days===selectedDays?'selected':''}" data-days="${p.days}" onclick="selectCultCard(this)">
        <div class="cult-days">${p.days}天</div>
        <div class="cult-label">${p.label}</div>
        <div class="cult-rate">${p.rate} ${p.tip}</div>
      </div>`).join('')}
    </div>
    <div class="cult-custom-row">
      <input type="number" id="cult-custom" placeholder="自定义天数 (1-365)" min="1" max="365" value="10">
    </div>
    <div class="cult-preview" id="cult-preview">${previewHtml(10)}</div>
  `;

  document.getElementById('modal-overlay').onclick = function(e) {
    if (e.target === this) closeModal();
  };

  openModal('修炼', body, [
    { label: '取消', onclick: 'closeModal()' },
    { label: '开始修炼', onclick: 'doCultivate()', primary: true },
  ]);

  // enable custom input
  setTimeout(() => {
    const inp = document.getElementById('cult-custom');
    if (inp) {
      inp.addEventListener('input', function() {
        const v = parseInt(this.value) || 10;
        selectedDays = Math.max(1, Math.min(365, v));
        document.querySelectorAll('.cult-card').forEach(c => c.classList.remove('selected'));
        updateCultPreview(selectedDays);
      });
    }
  }, 50);
}

function selectCultCard(el) {
  document.querySelectorAll('.cult-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const days = parseInt(el.dataset.days);
  document.getElementById('cult-custom').value = days;
  updateCultPreview(days);
}

function updateCultPreview(days) {
  const realm = getRealmData(GameState.realm, GameState.plane);
  const aging = getAgingDebuff();
  const perDay = realm.cultivationPerDay * (PLANE_MODIFIER[GameState.plane] || 1) * (1 - aging.eff) * (GameState.spiritRoot?.eff || 1);
  const agingNote = aging.eff > 0 ? ` (${aging.label} -${Math.round(aging.eff*100)}%)` : '';
  const rootNote = GameState.spiritRoot ? ` · 灵根速率 ×${GameState.spiritRoot.eff}` : '';
  const base = days * perDay;
  const critMin = days >= 90 ? 5 : days >= 30 ? 3 : days >= 10 ? 1 : 0;
  const critMax = Math.floor(days * 0.2);
  const critBonus = critMin * perDay;
  document.getElementById('cult-preview').innerHTML =
    `基础修为：<span>+${base}</span> ${agingNote}${rootNote} | 暴击范围：<span>+${critBonus} ~ +${critMax * perDay}</span>`;
}

// ---- 修炼主函数 ----

function doCultivate() {
  const customVal = document.getElementById('cult-custom')?.value;
  let days = parseInt(customVal) || 10;
  // fallback: read from selected card
  const sel = document.querySelector('.cult-card.selected');
  if (sel) days = parseInt(sel.dataset.days);
  else days = Math.max(1, Math.min(365, days));

  if (!days || days < 1 || days > 365) return;
  closeModal();
  startCultivate(days);
}

async function startCultivate(days) {
  // guard: cultivation already full
  if (GameState.cultivation >= GameState.cultivationMax && GameState.delayDays >= 60) {
    openModal('心魔警告', `修为已满且心魔已深（拖延${GameState.delayDays}天）。继续修炼不会获得修为，反而可能加重心魔。确定继续？`, [
      { label: '取消', onclick: 'closeModal()' },
      { label: '强行修炼', onclick: 'closeModal();_startCultivate('+days+')' },
    ]);
    return;
  }
  await _startCultivate(days);
}

async function _startCultivate(days) {
  // pre-cultivation death risk check
  const lifespanPct = GameState.lifespanMax > 0 ? GameState.age / GameState.lifespanMax : 0;
  if (lifespanPct >= 0.85) {
    const result = await askConfirm(
      '风险警告',
      `<div style="font-size:13px;line-height:1.7;">
        <div style="color:var(--crimson);font-weight:500;margin-bottom:6px;">风烛残年，修炼凶险</div>
        <div style="color:var(--text-secondary);">寿元仅剩 <b>${GameState.lifespanMax - GameState.age}</b> 年，修炼中可能因衰老猝死。<br>确定继续吗？</div>
      </div>`
    );
    if (!result) return;
  }

  // pre-cultivation: long cultivation with demon risk
  if (GameState.delayDays >= 60 && GameState.cultivation >= GameState.cultivationMax) {
    const result = await askConfirm(
      '心魔警告',
      `<div style="font-size:13px;line-height:1.7;">
        <div style="color:var(--crimson);font-weight:500;margin-bottom:6px;">心魔已深（${GameState.delayDays}天）</div>
        <div style="color:var(--text-secondary);">继续修炼可能触发心魔反噬或致死。建议先突破。</div>
      </div>`
    );
    if (!result) return;
  }

  // disable UI during cultivation
  document.getElementById('app').classList.add('cult-running');

  const realm = getRealmData(GameState.realm, GameState.plane);
  const aging = getAgingDebuff();
  let perDay = realm.cultivationPerDay * (PLANE_MODIFIER[GameState.plane] || 1) * (1 - aging.eff) * (GameState.spiritRoot?.eff || 1);

  // 累积乘数后一次性取整，避免多次 floor 精度损失
  let cultMult = 1.0;
  const msEff = getMainSkillEffect();
  if (msEff && (msEff.type === 'cultivation' || msEff.type === 'all')) {
    cultMult *= (1 + msEff.val);
  }
  const subCult = getSubSkillEffectVal('cultivation');
  if (subCult > 0) cultMult *= (1 + subCult);
  perDay = Math.floor(perDay * cultMult);

  // 血炼大法 penalty：每层消耗寿命（修炼天数 × penalty × 10 年）
  const msPenalty = msEff?.penalty || 0;
  if (msPenalty > 0) {
    GameState.lifespanMax -= Math.floor(days * msPenalty * 10);
    addLog(`血炼大法反噬，寿元 -${Math.floor(days * msPenalty * 10)}年`, 'danger');
  }

  let totalCult = 0;
  let critDays = 0;
  let eventLog = [];
  let aborted = false;

  // step is how many "ticks" to show in animation
  const isLong = days >= 30;
  const tickInterval = isLong ? Math.ceil(days / 6) : 1;

  for (let d = 1; d <= days && !aborted; d++) {
    // base cultivation
    let todayCult = perDay;
    let dangerEvent = null;

    // 辅修 critCult 暴击修炼（夺天术）—— 独立于随机事件门控
    const critCultChance = getSubSkillEffectVal('critCult');
    if (critCultChance > 0 && Math.random() < critCultChance) {
      todayCult = Math.floor(todayCult * 3);
      eventLog.push({ day: d, text: '夺天术触发！今日修为三倍', cls: 'crit' });
    }

    // -- random cultivation event --
    if (Math.random() < (isLong ? 0.10 : 0.33)) {
      const roll = Math.random();

      if (roll < 0.03) {
        todayCult = 0;
        dangerEvent = '走火入魔！灵气逆行，今日修为归零';
        eventLog.push({ day: d, text: dangerEvent, cls: 'danger' });
      } else if (roll < 0.08) {
        todayCult = 0;
        eventLog.push({ day: d, text: '灵气稀薄，修炼毫无进展', cls: '' });
      } else if (roll < 0.14) {
        todayCult = Math.floor(todayCult * 1.5);
        eventLog.push({ day: d, text: '心有所悟，修为暴涨', cls: 'loot' });
      } else if (roll < 0.20) {
        todayCult = Math.floor(todayCult * 2.0);
        eventLog.push({ day: d, text: '天地共鸣！灵力如潮水般涌入', cls: 'crit' });
      }
    }

    totalCult += todayCult;
    GameState.totalDays++;
    GameState.narrativeDay++;
    GameState.age = 18 + Math.floor(GameState.totalDays / 360);

    // death risk during cultivation: pause and ask
    const newPct = GameState.lifespanMax > 0 ? GameState.age / GameState.lifespanMax : 0;
    if (dangerEvent && newPct >= 0.85) {
      const shouldStop = await askConfirm(
        '生死危机',
        `<div style="font-size:13px;line-height:1.7;">
          <div style="color:var(--crimson);font-weight:500;margin-bottom:6px;">${dangerEvent}</div>
          <div style="color:var(--text-secondary);">寿元仅剩 <b>${GameState.lifespanMax - GameState.age}</b> 年，继续修炼恐有不测。</div>
        </div>`
      );
      if (shouldStop) {
        aborted = true;
        addLog('察觉危险，强行中断修炼', 'danger');
        break;
      }
    }

    // tick animation
    if (d % tickInterval === 0 || d === days) {
      GameState.cultivation = Math.min(GameState.cultivation + totalCult, GameState.cultivationMax);
      totalCult = 0;
      addLog(`修炼中... 第${d}天`, '');
      renderAll();

      const logPanel = document.getElementById('log-panel');
      logPanel.classList.add('log-flash');
      setTimeout(() => logPanel.classList.remove('log-flash'), 600);

      await new Promise(r => setTimeout(r, isLong ? 180 : 80));
    }
  }

  // flush remaining
  if (!aborted && totalCult > 0) {
    GameState.cultivation = Math.min(GameState.cultivation + totalCult, GameState.cultivationMax);
  }

  if (!aborted) {
    // post-cultivation: crit calculation
    let critChance = days >= 90 ? 0.12 : days >= 30 ? 0.10 : days >= 10 ? 0.08 : 0.05;
    let guaranteedCrit = days >= 90 ? 5 : days >= 30 ? 3 : days >= 10 ? 1 : 0;
    for (let i = 0; i < days; i++) {
      if (Math.random() < critChance) critDays++;
    }
    critDays = Math.max(critDays, guaranteedCrit);
    critDays = Math.min(critDays, Math.floor(days * 0.2));
    const critCult = critDays * perDay;
    GameState.cultivation = Math.min(GameState.cultivation + critCult, GameState.cultivationMax);

    const overflow = Math.max(0, GameState.cultivation - GameState.cultivationMax);
    GameState.cultivation = Math.min(GameState.cultivation, GameState.cultivationMax);

    let logText = `修炼 ${days} 天完成，修为 +${(days * perDay) + critCult}`;
    if (critDays > 0) logText += `（顿悟 ${critDays} 天！）`;
    if (overflow > 0) logText += `，修为已达瓶颈`;
    addLog(logText, critDays > 0 ? 'crit' : '');

    // sub-events
    for (const ev of eventLog) {
      addLog(`第${GameState.totalDays - days + ev.day}天：${ev.text}`, ev.cls);
    }

    // 修炼灵石收益（采灵术）
    const stoneGain = getSubSkillEffectVal('stoneGain');
    if (stoneGain > 0) {
      const earned = Math.floor(days * stoneGain * 5);
      GameState.spiritStones += earned;
      addLog(`采灵术获取灵石 +${earned}`, 'loot');
    }

    checkDemon();
  }

  checkNarrative();

  document.getElementById('app').classList.remove('cult-running');
  if (checkDeath()) return;
  renderAll();
}

// ---- 心魔系统 ----

function checkDemon() {
  const s = GameState;
  if (s.cultivation < s.cultivationMax) {
    s.delayDays = 0;
    return;
  }
  if (s.delayDays >= 120) {
    const penalty = 0.30 + Math.random() * 0.20;
    s.cultivation = Math.floor(s.cultivation * (1 - penalty));
    s.wis -= 5;
    s.spi -= 5;
    s.lifespanMax -= 10;
    addLog(`心魔入体！修为 -${Math.floor(penalty*100)}%，神识-5, 灵力-5, 寿元-10年`, 'danger');
    s.delayDays = 0;
  } else if (s.delayDays >= 60) {
    const penalty = 0.10 + Math.random() * 0.20;
    s.cultivation = Math.floor(s.cultivation * (1 - penalty));
    s.wis -= 2;
    addLog(`心魔反噬！修为 -${Math.floor(penalty*100)}%, 神识-2`, 'danger');
  } else if (s.delayDays >= 30) {
    if (s.delayDays - 1 < 30) { // only log once when crossing threshold
      addLog('心魔滋生，修为躁动不安，尽快突破！', 'danger');
    }
  }
}

function doBreakthrough() {
  const s = GameState;
  if (s.cultivation < s.cultivationMax) {
    openModal('无法突破', '修为未满，无法突破。');
    return;
  }

  const realm = getRealmData(s.realm, s.plane);

  if (s.subLevel < realm.subLevels) {
    // ---- minor breakthrough ----
    s.subLevel++;
    s.cultivation = 0;
    s.cultivationMax = 100 + s.subLevel * 50;
    s.delayDays = 0;
    advanceTime(30);

    const phase = ({1:'初期', 5:'中期', 9:'后期'}[s.subLevel] || '中期');
    addLog(`突破至${s.realm}${phase}（第${s.subLevel}层）`, 'success');
  } else {
    // ---- major breakthrough ----
    // check break item
    if (realm.breakItem) {
      if (!s.breakItems[realm.breakItem] || s.breakItems[realm.breakItem] <= 0) {
        openModal('缺少丹药', `突破需要 ${realm.breakItem}，当前未持有。请通过探索或坊市获取。`);
        return;
      }
      s.breakItems[realm.breakItem]--;
    }

    // tribulation
    if (realm.tribulation) {
      // 天劫伤害减免（天雷引）
      const tribReduce = getSubSkillEffectVal('tribulation');
      // 天劫护盾（太一护法）
      const shieldCharges = Math.floor(getSubSkillEffectVal('tribulation_shield'));
      
      let tribText = `${realm.tribulation}降临！天地变色，雷云密布...`;
      if (shieldCharges > 0) tribText += ` (太一护法·${shieldCharges}次免疫)`;
      if (tribReduce > 0) tribText += ` (减伤+${Math.round(tribReduce*100)}%)`;
      addLog(tribText, 'danger');
    }

    advanceTime(360);
    s.cultivation = 0;

    // wisdom bonus to success rate (every 10 wisdom = +1% success)
    const wisBonus = Math.floor(s.wis / 10) * 0.01;
    // 主修心法 breakthrough 加成
    const msEff = getMainSkillEffect();
    const btBonus = (msEff && (msEff.type === 'breakthrough' || msEff.type === 'all')) ? msEff.val : 0;
    // 辅修功法 breakthrough 加成（大衍诀等）
    const subBtBonus = getSubSkillEffectVal('breakthrough');
    // 灵根突破加成
    const rootBonus = s.spiritRoot?.breakthroughBonus || 0;
    // 炼丹：突破加成丹（降尘丹/结婴药液等）
    let pillBonus = 0;
    let bonusPillName = null;
    if (s._alchemyBreakBonus) {
      // 当前境界 → 对应加成丹名
      const bonusMap = { '筑基': '降尘丹', '金丹': '结婴药液' };
      const pillId = bonusMap[s.realm];
      if (pillId && s.breakItems[pillId] && s.breakItems[pillId] > 0 && s._alchemyBreakBonus[pillId]) {
        s.breakItems[pillId]--;
        pillBonus = s._alchemyBreakBonus[pillId].val;
        bonusPillName = pillId;
        delete s._alchemyBreakBonus[pillId];
      }
    }
    if (bonusPillName) {
      addLog(`服用${bonusPillName}，突破成功率+${Math.round(pillBonus*100)}%`, 'loot');
    }
    const successRate = Math.min(0.95, realm.baseSuccess + wisBonus + btBonus + subBtBonus + rootBonus + pillBonus);
    const roll = Math.random();

    if (roll < successRate) {
      // ---- success ----
      const nextRealm = getNextRealmInPlane(s.plane, realm.planeOrder);
      if (nextRealm) {
        s.realm = nextRealm.name;
        s.subLevel = 1;
        s.maxSubLevel = nextRealm.subLevels;
        s.cultivationMax = 200;
        s.lifespanMax = nextRealm.lifespan + Math.floor(getSubSkillEffectVal('lifespan') * 100) + Math.floor(getSubSkillEffectVal('lifespanBig'));
        s.delayDays = 0;

        const tribText = realm.tribulation ? `，渡过${realm.tribulation}` : '';
        addLog(`晋升${s.realm}！${tribText}` + (wisBonus > 0 ? `（神识+${Math.floor(wisBonus*100)}%成功率）` : ''), 'success');
      } else {
        // no next realm in this plane — ascend?
        addLog(`已是${s.realm}圆满，需飞升至更高位面`, 'crit');
      }
    } else {
      // ---- failure ----
      const fp = realm.failPenalty;
      // 天劫伤害减免（天雷引功法）
      const tribReduce = getSubSkillEffectVal('tribulation');
      const shieldCount = Math.floor(getSubSkillEffectVal('tribulation_shield'));
      s.cultivation = Math.floor(s.cultivation * (1 - fp.cultivation * (1 - tribReduce)));
      s.lifespanMax -= Math.floor(fp.lifespan * (1 - tribReduce));
      advanceTime(180);

      // 太一护法触发
      if (shieldCount > 0 && Math.random() < fp.deathChance) {
        s._tribulationShieldUsed = (s._tribulationShieldUsed||0) + 1;
        if (s._tribulationShieldUsed <= shieldCount) {
          addLog(`太一护法发动！挡下致命天劫（${s._tribulationShieldUsed}/${shieldCount}次）`, 'success');
          renderAll();
          return;
        }
        s._tribulationShieldUsed = Math.max(s._tribulationShieldUsed, shieldCount);
      }

      if (Math.random() < fp.deathChance) {
        addLog(`${realm.tribulation || '天劫'}之下，灰飞烟灭！`, 'danger');
        triggerDeath('天劫陨落');
        return;
      }

      addLog(`渡劫失败！修为 -${Math.floor(fp.cultivation*100)}%，寿元 -${fp.lifespan}年`, 'danger');
    }
  }

  if (checkDeath()) return;
  renderAll();
}

// ---- 飞升 ----

function canAscend() {
  const s = GameState;
  const req = ASCENSION_REQUIREMENTS[s.plane];
  if (!req) return false;
  return s.realm === req.target && s.subLevel >= req.subLevel;
}

function doAscend() {
  const s = GameState;
  const req = ASCENSION_REQUIREMENTS[s.plane];
  if (!req) {
    openModal('无法飞升', '当前位面已是最高位面。');
    return;
  }

  if (!canAscend()) {
    openModal('条件不足', `需达到 ${req.target} 圆满方可飞升。`);
    return;
  }

  openModal('飞升', `确定飞升至${req.nextPlane === 'spirit' ? '灵界' : '仙界'}？将消耗 ${req.days} 天。`, [
    { label: '取消', onclick: 'closeModal()' },
    { label: '飞升!', onclick: 'closeModal(); _doAscend()', primary: true },
  ]);
}

function _doAscend() {
  const req = ASCENSION_REQUIREMENTS[GameState.plane];
  if (!req) return;

  advanceTime(req.days);
  GameState.plane = req.nextPlane;
  // reset map position to first region of new plane
  GameState.currentRegion = req.nextPlane === 'spirit' ? 'sp_ice' : 'im_ascend';
  GameState.currentNode = GameState.currentRegion === 'sp_ice' ? 'si_city' : 'ia_hall';
  GameState.realm = req.nextRealm;
  GameState.subLevel = 1;
  GameState.cultivation = 0;
  GameState.cultivationMax = 300;
  GameState.delayDays = 0;

  const nextRealm = getRealmData(req.nextRealm, req.nextPlane);
  if (nextRealm) {
    GameState.maxSubLevel = nextRealm.subLevels;
    GameState.lifespanMax = nextRealm.lifespan;
  }

  const planeName = req.nextPlane === 'spirit' ? '灵界' : '仙界';
  addLog(`历经${req.days}天飞升，抵达${planeName}！`, 'success');
  addLog(`界力淬体，晋升${req.nextRealm}`, 'crit');

  renderAll();
}

function doExplore() {
  toggleMap();
}

function checkDeath() {
  // sudden death check (age > 85% lifespan)
  const pct = GameState.lifespanMax > 0 ? GameState.age / GameState.lifespanMax : 0;
  if (pct > 0.85 && Math.random() < 0.005) {
    triggerDeath('衰老猝死');
    return true;
  }
  // natural death
  if (GameState.age >= GameState.lifespanMax) {
    triggerDeath('寿元耗尽');
    return true;
  }
  return false;
}
