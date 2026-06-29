// ==========================================
//  RENDER functions
// ==========================================

function renderAll() {
  renderRealmCard();
  renderAttributes();
  renderStatus();
  renderLogs();
  renderActions();
  autoSave();
}

function renderRealmCard() {
  const s = GameState;
  const realm = getRealmData(s.realm, s.plane);
  const pct = ((s.cultivation / s.cultivationMax) * 100).toFixed(1);

  document.getElementById('realm-name').textContent = s.realm + ({1:'初期',5:'中期',9:'后期'}[s.subLevel] || '中期');
  document.getElementById('realm-sub').textContent = `第 ${s.subLevel} 层 / 共 ${realm.subLevels} 层`;
  document.getElementById('realm-bar-fill').style.width = pct + '%';
  document.getElementById('realm-cult').textContent = `修为 ${s.cultivation}`;
  document.getElementById('realm-cultmax').textContent = `满 ${s.cultivationMax}`;

  const bar = document.getElementById('realm-bar-fill');
  if (s.cultivation >= s.cultivationMax) {
    bar.classList.add('pulse');
    if (s.delayDays >= 30) bar.style.background = 'var(--crimson)';
    else bar.style.background = 'var(--gold)';
  } else {
    bar.classList.remove('pulse');
    bar.style.background = 'var(--gold)';
  }

  // demon warning on realm card
  const sub = document.getElementById('realm-sub');
  if (s.delayDays >= 120) {
    sub.style.color = 'var(--crimson)';
    sub.textContent = `心魔入体！已拖延 ${s.delayDays} 天`;
  } else if (s.delayDays >= 60) {
    sub.style.color = 'var(--crimson)';
    sub.textContent = `心魔反噬... 已拖延 ${s.delayDays} 天`;
  } else if (s.delayDays >= 30) {
    sub.style.color = 'var(--amber)';
    sub.textContent = `修为躁动 ${s.delayDays} 天 | 尽快突破`;
  } else {
    sub.style.color = 'var(--text-secondary)';
    const realm = getRealmData(s.realm);
    sub.textContent = `第 ${s.subLevel} 层 / 共 ${realm.subLevels} 层`;
  }

  // origin
  const el = document.getElementById('origin-display');
  if (s.origin) {
    const rarityMap = { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗', legendary: '传说' };
    const rootText = s.spiritRoot
      ? ` · 灵根：${s.spiritRoot.name}${s.spiritRoot.elements.length>0?' ['+s.spiritRoot.elements.join('·')+']':''} ×${s.spiritRoot.eff}`
      : '';
    el.innerHTML = `身世 | ${rarityMap[s.origin.rarity] || ''} · ${s.origin.name}${rootText}`;
  } else if (s.spiritRoot) {
    el.innerHTML = `灵根 | ${s.spiritRoot.name} [${s.spiritRoot.elements.join('·')}] ×${s.spiritRoot.eff}`;
  } else {
    el.textContent = '';
  }
}

function renderAttributes() {
  const skillBonus = getSkillAttrBonus();
  const attrs = [
    { key: 'atk', label: '攻', color: 'atk' },
    { key: 'def', label: '防', color: 'def' },
    { key: 'spd', label: '速', color: 'spd' },
    { key: 'wis', label: '识', color: 'wis' },
    { key: 'vit', label: '体', color: 'vit' },
    { key: 'spi', label: '灵', color: 'spi' },
  ];

  const baseMax = Math.max(...attrs.map(a => GameState[a.key] + (skillBonus[a.key]||0)), 10);

  document.getElementById('attr-rows').innerHTML = attrs.map(a => {
    const val = GameState[a.key];
    const bonus = skillBonus[a.key] || 0;
    const total = val + bonus;
    const pct = Math.min(100, (total / baseMax * 100)).toFixed(0);
    const bonusText = bonus > 0 ? `<span style="color:var(--gold);font-size:10px;">+${bonus}</span>` : '';
    return `<div class="attr-row">
      <span class="attr-label">${a.label}</span>
      <div class="attr-bar-wrap"><div class="attr-bar-fill ${a.color}" style="width:${pct}%"></div></div>
      <span class="attr-val">${val}${bonusText}</span>
    </div>`;
  }).join('');
}

function renderStatus() {
  const s = GameState;
  const lifespanPct = s.lifespanMax > 0 ? Math.min(1, s.age / s.lifespanMax) : 0;
  const aging = getAgingDebuff();
  const dangerClass = lifespanPct > 0.85 ? 'danger glow-danger' : (lifespanPct > 0.7 ? 'danger' : (lifespanPct > 0.5 ? '' : ''));

  // lifespan bar
  const bar = document.getElementById('lifespan-bar-fill');
  bar.style.width = (lifespanPct * 100).toFixed(0) + '%';
  if (lifespanPct > 0.85) bar.style.background = 'var(--crimson)';
  else if (lifespanPct > 0.70) bar.style.background = 'var(--amber)';
  else if (lifespanPct > 0.50) bar.style.background = 'var(--amber-dim)';
  else bar.style.background = 'var(--jade)';

  const agingBadge = aging.label !== '鼎盛'
    ? `<span style="font-size:10px;color:${lifespanPct>0.85?'var(--crimson)':'var(--amber)'};"> (${aging.label} -${Math.round(aging.eff*100)}%)</span>`
    : '';

  document.getElementById('lifespan-text').innerHTML = `${s.age} / ${s.lifespanMax} 岁${agingBadge}${s.rebirthDebuff > 0 ? ` <span style="color:var(--crimson);font-size:10px;">[转世-${Math.round(s.rebirthDebuff*100)}%]</span>` : ''}`;

  document.getElementById('status-grid').innerHTML = `
    <div class="status-item">
      <div class="status-val">${s.spiritStones}</div>
      <div class="status-label">灵石</div>
    </div>
    <div class="status-item">
      <div class="status-val">${s.totalDays}</div>
      <div class="status-label">累计天数</div>
    </div>
    <div class="status-item">
      <div class="status-val">${s.plane === 'human' ? '人界' : s.plane === 'spirit' ? '灵界' : '仙界'}</div>
      <div class="status-label">位面</div>
    </div>
    <div class="status-item">
      ${(() => {
        const items = Object.entries(s.breakItems||{}).filter(([_,c]) => c > 0);
        return items.length > 0
          ? `<div class="status-val" style="font-size:12px;">${items.map(([n,c]) => n+' x'+c).join(' ')}</div>
             <div class="status-label">丹药</div>`
          : `<div class="status-val" style="font-size:12px;color:var(--text-tertiary);">--</div>
             <div class="status-label">丹药</div>`;
      })()}
    </div>
    ${s.legacyStash && !s.legacyStash.claimed ? `<div class="status-item">
      <div class="status-val" style="font-size:12px;color:var(--gold);">传承待寻</div>
      <div class="status-label">因果传承</div>
    </div>` : ''}
  `;
}

function renderLogs() {
  const container = document.getElementById('log-entries');
  if (GameState.logs.length === 0) {
    container.innerHTML = '<div class="log-entry"><span class="log-day">--</span><span class="log-text">踏上修仙之路...</span></div>';
    return;
  }
  container.innerHTML = GameState.logs.map(l => `
    <div class="log-entry">
      <span class="log-day">第 ${l.day} 天</span>
      <span class="log-text ${l.cls || ''}">${l.text}</span>
    </div>
  `).join('');
  container.parentElement.scrollTop = container.parentElement.scrollHeight;
}

function renderActions() {
  const s = GameState;
  const realm = getRealmData(s.realm, s.plane);

  // breakthrough available when cultivation is full
  const canBreak = s.cultivation >= s.cultivationMax;
  const btn = document.getElementById('btn-breakthrough');
  if (canBreak) {
    btn.classList.add('primary');
    if (s.delayDays >= 60) {
      btn.textContent = '突破!!';
      btn.style.animation = 'glow-danger 0.8s ease-in-out infinite';
    } else if (s.delayDays >= 30) {
      btn.textContent = '突破!';
      btn.style.animation = '';
    } else {
      btn.textContent = '突破!';
      btn.style.animation = '';
    }
  } else {
    btn.classList.remove('primary');
    btn.textContent = '突破';
    btn.style.animation = '';
  }

  // enable explore, disable others not yet implemented
  document.getElementById('btn-explore').classList.remove('disabled');
  document.getElementById('btn-skills').classList.remove('disabled');

  // ascend button state
  const ascendBtn = document.getElementById('btn-ascend');
  if (canAscend()) {
    ascendBtn.classList.add('primary');
    ascendBtn.classList.remove('disabled');
    ascendBtn.textContent = '飞升!';
  } else {
    ascendBtn.classList.remove('primary');
    ascendBtn.textContent = '飞升';
    // disable if not at last realm
    const lastRealm = getLastRealmInPlane(s.plane);
    ascendBtn.classList.toggle('disabled', !lastRealm || s.realm !== lastRealm.name || s.subLevel < lastRealm.subLevels);
  }
}

// ==========================================
//  ACTIONS
// ==========================================

function addLog(text, cls) {
  GameState.logs.push({ day: GameState.totalDays, text, cls: cls || '' });
  if (GameState.logs.length > 200) GameState.logs.shift();
}

function advanceTime(days, isCultivate) {
  if (days <= 0) return;
  GameState.totalDays += days;
  GameState.narrativeDay += days;
  GameState.age = 18 + Math.floor(GameState.totalDays / 360);
  if (isCultivate) {
    if (GameState.cultivation >= GameState.cultivationMax) {
      GameState.delayDays += days;
    }
  }
  checkDemon();
  checkNarrative();
}

// ==========================================
//  MODAL
// ==========================================

function openModal(title, body, actions) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  const actionsEl = document.getElementById('modal-actions');
  if (actions) {
    actionsEl.innerHTML = actions.map(a =>
      `<button class="${a.primary ? 'primary' : ''}" onclick="${a.onclick}">${a.label}</button>`
    ).join('');
  } else {
    actionsEl.innerHTML = '<button onclick="closeModal()">确定</button>';
  }
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// async confirm (returns true/false) for use in cultivation loop
function askConfirm(title, bodyHtml) {
  return new Promise(resolve => {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-actions').innerHTML =
      '<button onclick="closeModal();_resolver(false)">停止修炼</button>' +
      '<button class="primary" onclick="closeModal();_resolver(true)">继续修炼</button>';
    document.getElementById('modal-overlay').classList.add('active');
    window._resolver = resolve;
  });
}

function makeBagDisplay() {
  const breakItems = Object.entries(GameState.breakItems || {}).filter(([_,c]) => c > 0);
  const materials = Object.entries(GameState.materials || {}).filter(([_,c]) => c > 0);
  let html = '';

  if (breakItems.length === 0 && materials.length === 0) return '背包空空如也。';

  if (breakItems.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">丹药</div>';
    html += breakItems.map(([name, count]) => `<div style="font-size:12px;color:var(--text-primary);padding:2px 0;">${name} ×${count}</div>`).join('');
  }
  if (materials.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-tertiary);margin:10px 0 4px;">炼丹材料</div>';
    html += materials.sort((a,b) => (ALCHEMY_MATERIALS[a[0]]?.tier||9) - (ALCHEMY_MATERIALS[b[0]]?.tier||9))
      .map(([id, count]) => {
        const mat = ALCHEMY_MATERIALS[id];
        const tColor = mat ? ['','var(--text-secondary)','var(--jade)','var(--azure)','#b066ff','var(--gold)'][mat.tier] : 'var(--text-secondary)';
        return `<div style="font-size:12px;color:${tColor};padding:2px 0;">${mat?mat.name:id} ×${count}</div>`;
      }).join('');
  }
  return html;
}

// multi-plane map helpers
function getCurrentMap() {
  if (GameState.plane === 'spirit') return { data: SPIRIT_MAP, positions: SPIRIT_POSITIONS, connections: SPIRIT_CONNECTIONS, exploreFn: SPIRIT_getExploreResult };
  if (GameState.plane === 'immortal') return { data: IMMORTAL_MAP, positions: IMMORTAL_POSITIONS, connections: IMMORTAL_CONNECTIONS, exploreFn: IMMORTAL_getExploreResult };
  return { data: HUMAN_MAP, positions: MAP_POSITIONS, connections: MAP_CONNECTIONS, exploreFn: getExploreResult };
}

// 平面感知的通用辅助函数（覆盖 map_human.js 中的同名函数）

function getRegion(id) {
  const cmap = getCurrentMap();
  return cmap.data.regions.find(r => r.id === id);
}

function getNode(regionId, nodeId) {
  const region = getRegion(regionId);
  if (!region) return null;
  return region.nodes.find(n => n.id === nodeId);
}

function getUnlockedRegions() {
  const cmap = getCurrentMap();
  return cmap.data.regions.filter(r => !r.isHidden && canAccessRegion(r));
}
