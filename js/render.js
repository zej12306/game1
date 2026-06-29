// ==========================================
//  RENDER functions
// ==========================================

function renderAll() {
  renderRealmCard();
  renderRankCard();
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

function renderRankCard() {
  const s = GameState;
  if (!s.planeRank) s.planeRank = s.plane || 'human';
  if (s.renown === undefined) s.renown = 0;

  const currentRank = getCurrentRank();
  const nextRank = getNextRank();

  const el = document.getElementById('rank-card');
  if (!el) return;

  const rankNameEl = el.querySelector('.rank-name');
  const rankPctEl = el.querySelector('.rank-bar-fill');
  const rankTextEl = el.querySelector('.rank-text');
  const rankDescEl = document.getElementById('rank-desc');

  if (rankNameEl) rankNameEl.textContent = currentRank.name;
  if (rankDescEl) rankDescEl.textContent = currentRank.desc;

  if (nextRank) {
    const pct = Math.min(100, ((s.renown - currentRank.renownMin) / (nextRank.renownMin - currentRank.renownMin)) * 100).toFixed(1);
    if (rankPctEl) rankPctEl.style.width = pct + '%';
    if (rankTextEl) rankTextEl.innerHTML = `声望 <span>${s.renown}</span> / <span>${nextRank.renownMin}</span> → ${nextRank.name}`;
  } else {
    if (rankPctEl) rankPctEl.style.width = '100%';
    if (rankTextEl) rankTextEl.innerHTML = `声望 <span>${s.renown}</span> · 已达巅峰`;
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

  // lifespan bar
  const bar = document.getElementById('lifespan-bar-fill');
  bar.style.width = (lifespanPct * 100).toFixed(0) + '%';
  if (lifespanPct > 0.85) bar.style.background = 'var(--crimson)';
  else if (lifespanPct > 0.70) bar.style.background = 'var(--amber)';
  else if (lifespanPct > 0.50) bar.style.background = 'var(--amber-dim)';
  else bar.style.background = 'var(--jade)';

  // P2-10: 风烛残年标签
  if (lifespanPct > 0.85) {
    const warning = document.getElementById('lifespan-warning');
    if (warning) {
      warning.style.display = 'block';
      warning.textContent = `⚠ ${aging.label}`;
    }
  } else {
    const warning = document.getElementById('lifespan-warning');
    if (warning) warning.style.display = 'none';
  }

  const agingBadge = aging.label !== '鼎盛'
    ? `<span style="font-size:10px;color:${lifespanPct>0.85?'var(--crimson)':'var(--amber)'};"> (${aging.label} -${Math.round(aging.eff*100)}%)</span>`
    : '';

  // P2-9: 剩余天数
  const remainDays = Math.max(0, Math.floor(s.lifespanMax * 360 - s.totalDays));
  const remainText = lifespanPct > 0.5
    ? ` <span style="font-size:10px;color:${lifespanPct>0.85?'var(--crimson)':lifespanPct>0.7?'var(--amber)':'var(--text-tertiary)'};">剩${remainDays}天</span>`
    : '';

  // P2-8: 转世debuff变大变红
  const rebirthTag = s.rebirthDebuff > 0
    ? ` <span style="color:var(--crimson);font-size:12px;font-weight:600;background:rgba(192,57,43,0.15);padding:1px 6px;border-radius:3px;">转世-${Math.round(s.rebirthDebuff*100)}%</span>`
    : '';

  document.getElementById('lifespan-text').innerHTML = `${s.age} / ${s.lifespanMax} 岁${agingBadge}${rebirthTag}${remainText}`;

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

// ---- 修炼事件弹窗提示 ----

function showToast(message, type) {
  const old = document.querySelector('.cult-toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'cult-toast ' + (type || 'normal');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2400);
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
  const combatItems = Object.entries(GameState.combatItems || {}).filter(([_,c]) => c > 0);
  const materials = Object.entries(GameState.materials || {}).filter(([_,c]) => c > 0);
  if (breakItems.length === 0 && combatItems.length === 0 && materials.length === 0) return '<div style="text-align:center;color:var(--text-tertiary);padding:20px 0;">背包空空如也</div>';

  let html = '';

  if (breakItems.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;">丹药</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">';
    breakItems.forEach(([name, count]) => {
      const info = getItemInfo(name);
      html += `<div class="bag-slot ${info.quality}" onclick="showItemDetail('${name}',${count})">
        <div class="bag-slot-icon">${info.icon}</div>
        <div class="bag-slot-name">${info.shortName||name}</div>
        <div class="bag-slot-count">x${count}</div>
      </div>`;
    });
    html += '</div>';
  }

  if (combatItems.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;">战斗用品</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">';
    combatItems.forEach(([name, count]) => {
      const info = getItemInfo(name);
      html += `<div class="bag-slot ${info.quality}" onclick="showItemDetail('${name}',${count})">
        <div class="bag-slot-icon">${info.icon}</div>
        <div class="bag-slot-name">${info.shortName||name}</div>
        <div class="bag-slot-count">x${count}</div>
      </div>`;
    });
    html += '</div>';
  }

  if (materials.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;">材料</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
    materials.forEach(([name, count]) => {
      const info = getItemInfo(name);
      html += `<div class="bag-slot ${info.quality}" onclick="showItemDetail('${name}',${count})">
        <div class="bag-slot-icon">${info.icon}</div>
        <div class="bag-slot-name">${info.shortName||name}</div>
        <div class="bag-slot-count">x${count}</div>
      </div>`;
    });
    html += '</div>';
  }

  return html;
}

const ITEM_DB = {
  // 丹药（原著向）
  '筑基丹': { icon:'丹', shortName:'筑基丹', quality:'rare', type:'丹药', desc:'练气冲击筑基的必须丹药', shortDesc:'筑基突破用' },
  '降尘丹': { icon:'丹', shortName:'降尘丹', quality:'rare', type:'丹药', desc:'辅助结丹，突破金丹+12%成功率', shortDesc:'金丹突破辅助' },
  '结婴药液': { icon:'液', shortName:'结婴液', quality:'epic', type:'丹药', desc:'调和的药液，突破元婴+10%成功率', shortDesc:'元婴突破辅助' },
  '黄龙丹': { icon:'丹', shortName:'黄龙丹', quality:'common', type:'丹药', desc:'恢复40点修为', shortDesc:'练气期常用' },
  '金髓丸': { icon:'丹', shortName:'金髓丸', quality:'common', type:'丹药', desc:'永久体魄+1', shortDesc:'强化肉身' },
  '清灵散': { icon:'散', shortName:'清灵散', quality:'common', type:'丹药', desc:'永久神识+1', shortDesc:'清心明目' },
  '合气丹': { icon:'丹', shortName:'合气丹', quality:'uncommon', type:'丹药', desc:'恢复120点修为', shortDesc:'筑基期常用' },
  '聚灵丹': { icon:'丹', shortName:'聚灵丹', quality:'rare', type:'丹药', desc:'恢复300点修为', shortDesc:'金丹期常用' },
  '定灵丹': { icon:'丹', shortName:'定灵丹', quality:'rare', type:'丹药', desc:'永久灵力+2', shortDesc:'稳定灵力' },
  '养魂丹': { icon:'丹', shortName:'养魂丹', quality:'epic', type:'丹药', desc:'永久神识+3', shortDesc:'滋养神魂' },
  '赤阳丹': { icon:'丹', shortName:'赤阳丹', quality:'epic', type:'丹药', desc:'永久攻击+3', shortDesc:'激发战力' },
  '寿元果丹': { icon:'丹', shortName:'寿元丹', quality:'epic', type:'丹药', desc:'增加50年寿元', shortDesc:'延年益寿' },
  '螟母汁液': { icon:'液', shortName:'螟母液', quality:'legendary', type:'丹药', desc:'六维全属性+2', shortDesc:'逆天改命' },
  // 战斗用品
  '回春丹': { icon:'丹', shortName:'回春丹', quality:'common', type:'战斗', desc:'战斗中恢复30%HP', shortDesc:'战斗回血' },
  '大还丹': { icon:'丹', shortName:'大还丹', quality:'uncommon', type:'战斗', desc:'战斗中恢复50%HP', shortDesc:'战斗回血' },
  '九转丹': { icon:'丹', shortName:'九转丹', quality:'epic', type:'战斗', desc:'战斗中恢复全部HP', shortDesc:'战斗回血' },
  '金刚丸': { icon:'丸', shortName:'金刚丸', quality:'uncommon', type:'战斗', desc:'防御+50%持续3回合', shortDesc:'战斗加防' },
  '疾风散': { icon:'散', shortName:'疾风散', quality:'uncommon', type:'战斗', desc:'本回合必定先手', shortDesc:'战斗先手' },
  '狂暴丹': { icon:'丹', shortName:'狂暴丹', quality:'rare', type:'战斗', desc:'攻击+50%持续3回合', shortDesc:'战斗加攻' },
  '护魂丹': { icon:'丹', shortName:'护魂丹', quality:'epic', type:'战斗', desc:'免疫一次致命伤害', shortDesc:'战斗免死' },
  // 战斗用品Key映射（combatItems用英文id存储）
  'huiChunDan': { icon:'丹', shortName:'回春丹', quality:'common', type:'战斗', desc:'战斗中恢复30%HP', shortDesc:'战斗回血' },
  'daHuanDan': { icon:'丹', shortName:'大还丹', quality:'uncommon', type:'战斗', desc:'战斗中恢复50%HP', shortDesc:'战斗回血' },
  'jiuzhuanDan': { icon:'丹', shortName:'九转丹', quality:'epic', type:'战斗', desc:'战斗中恢复全部HP', shortDesc:'战斗回血' },
  'jingangWan': { icon:'丸', shortName:'金刚丸', quality:'uncommon', type:'战斗', desc:'防御+50%持续3回合', shortDesc:'战斗加防' },
  'jifengSan': { icon:'散', shortName:'疾风散', quality:'uncommon', type:'战斗', desc:'本回合必定先手', shortDesc:'战斗先手' },
  'baokuangDan': { icon:'丹', shortName:'狂暴丹', quality:'rare', type:'战斗', desc:'攻击+50%持续3回合', shortDesc:'战斗加攻' },
  'huhunDan': { icon:'丹', shortName:'护魂丹', quality:'epic', type:'战斗', desc:'免疫一次致命伤害', shortDesc:'战斗免死' },
  '凝元草': { icon:'草', shortName:'凝元草', quality:'common', type:'材料', desc:'炼丹基础材料', shortDesc:'常见炼丹药材' },
  '紫纹灵芝': { icon:'芝', shortName:'紫灵芝', quality:'uncommon', type:'材料', desc:'稀有炼丹材料', shortDesc:'炼制灵品丹药' },
  '功法残卷': { icon:'卷', shortName:'残卷', quality:'rare', type:'特殊', desc:'可随机领悟一门已开放的辅修功法', shortDesc:'点击领悟功法' },
  '万年玄冰': { icon:'冰', shortName:'万年冰', quality:'rare', type:'材料', desc:'极寒之地孕育的灵材', shortDesc:'灵界炼丹材料' },
  '神木心': { icon:'木', shortName:'神木心', quality:'rare', type:'材料', desc:'神木林千年之精华', shortDesc:'增加灵力' },
  '七级妖丹': { icon:'丹', shortName:'七级丹', quality:'epic', type:'材料', desc:'七阶妖兽内丹', shortDesc:'高阶炼丹材料' },
  '空间碎片': { icon:'碎', shortName:'空间片', quality:'legendary', type:'材料', desc:'跨界通道中诞生的碎片', shortDesc:'飞升级材料' },
  '开天斧碎片': { icon:'斧', shortName:'斧碎片', quality:'legendary', type:'材料', desc:'开天斧的碎片', shortDesc:'攻击+20(自动生效)' },
  '功法残页': { icon:'页', shortName:'残页', quality:'uncommon', type:'材料', desc:'古代功法的一页', shortDesc:'神识+1(自动生效)' },
  '仙丹': { icon:'丹', shortName:'仙丹', quality:'legendary', type:'丹药', desc:'仙界仙丹', shortDesc:'寿元+200(自动生效)' },
  '通天灵宝残片': { icon:'宝', shortName:'灵宝', quality:'legendary', type:'材料', desc:'上古通天灵宝碎片', shortDesc:'灵石+500攻+3灵+3' },
  '星核': { icon:'星', shortName:'星核', quality:'epic', type:'材料', desc:'星域中的星辰之核', shortDesc:'攻+5灵+5' },
  '混沌之气': { icon:'气', shortName:'混沌气', quality:'legendary', type:'材料', desc:'混沌海中吸收的能量', shortDesc:'修为大幅增长' },
  '鬼灵珠': { icon:'珠', shortName:'鬼灵珠', quality:'uncommon', type:'材料', desc:'幽冥谷的鬼灵精华', shortDesc:'灵力+1' },
  '天雷淬体': { icon:'雷', shortName:'雷淬', quality:'epic', type:'材料', desc:'天台山雷劫淬体', shortDesc:'防御+2体魄+2' },
  '月华露': { icon:'露', shortName:'月华露', quality:'common', type:'材料', desc:'月华台上凝结的灵露', shortDesc:'修为+30' },
  '仙法残页': { icon:'页', shortName:'仙法页', quality:'epic', type:'材料', desc:'万法藏书阁的仙法', shortDesc:'神识+5' },
  '灵兽卵': { icon:'卵', shortName:'灵兽卵', quality:'uncommon', type:'特殊', desc:'孵化室中的灵兽后代', shortDesc:'灵石+80' },
  '续命丹': { icon:'丹', shortName:'续命丹', quality:'uncommon', type:'丹药', desc:'延续寿元的灵丹', shortDesc:'增加寿元' },
  '妖兽幼崽': { icon:'兽', shortName:'妖兽崽', quality:'uncommon', type:'材料', desc:'战斗中缴获的妖兽幼崽', shortDesc:'可兑换灵石' },
  '灵果': { icon:'果', shortName:'灵果', quality:'common', type:'材料', desc:'山林间采摘的灵果', shortDesc:'服用+修为灵石' },
  '木灵精华': { icon:'木', shortName:'木精华', quality:'rare', type:'材料', desc:'木灵圣地千年灵木之精华', shortDesc:'灵石+300' },
};

function getItemInfo(name) {
  return ITEM_DB[name] || { icon:'物', shortName:name.length>4?name.slice(0,4):name, quality:'common', type:'物品', desc:'未知物品' };
}

function showItemDetail(name, count) {
  const info = getItemInfo(name);
  let actions = [{ label:'关闭', onclick:'closeModal()' }];
  if (count > 0 && info.type !== '材料') {
    actions.unshift({ label:'使用', onclick:`closeModal();useItem('${name}')`, primary: true });
  }
  const body = `
    <div style="text-align:center;margin-bottom:8px;">
      <div style="font-size:28px;margin-bottom:4px;">${info.icon}</div>
      <div style="font-size:16px;font-weight:500;color:var(--text-primary);">${name}</div>
      <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">${info.type} · 数量：${count}</div>
    </div>
    <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:10px;font-size:12px;color:var(--text-secondary);line-height:1.6;">${info.desc||'暂无详细信息'}</div>
  `;
  openModal(name, body, actions);
}

function useItem(name) {
  const s = GameState;
  if (!s.breakItems[name] || s.breakItems[name] <= 0) return;

  // breakthrough pills → open breakthrough
  if (['筑基丹','降尘丹','结婴药液','结丹丹','结婴丹','化神丹','炼虚丹','合体丹','大乘丹'].includes(name)) {
    openModal('提示', `${name}需在突破时使用，请点击"突破"按钮。`);
    return;
  }

  // cultivation recovery
  if (name === '黄龙丹') { s.cultivation = Math.min(s.cultivationMax, s.cultivation + 40); }
  else if (name === '合气丹') { s.cultivation = Math.min(s.cultivationMax, s.cultivation + 120); }
  else if (name === '聚灵丹') { s.cultivation = Math.min(s.cultivationMax, s.cultivation + 300); }
  // permanent stat boost
  else if (name === '定灵丹') { s.spi += 2; }
  else if (name === '养魂丹') { s.wis += 3; }
  else if (name === '赤阳丹') { s.atk += 3; }
  else if (name === '清灵散') { s.wis += 1; }
  else if (name === '金髓丸') { s.vit += 1; }
  // lifespan
  else if (name === '寿元果丹') { applyLifespan(s, 50); }
  else if (name === '续命丹') { applyLifespan(s, 30); }
  else if (name === '仙丹') { applyLifespan(s, 200); }
  // 螟母汁液
  else if (name === '螟母汁液') { s.atk += 2; s.def += 2; s.spd += 2; s.wis += 2; s.vit += 2; s.spi += 2; }
  // 灵果
  else if (name === '灵果') { s.cultivation = Math.min(s.cultivationMax, s.cultivation + 80); s.spiritStones += 30; }
  // combat items - remind
  else if (['回春丹','大还丹','九转丹','金刚丸','疾风散','狂暴丹','护魂丹'].includes(name)) {
    openModal('提示', '战斗用品请在战斗中打开物品栏使用。');
    return;
  }
  // special
  else if (name === '功法残卷') {
    openModal('提示', '功法残卷请在功法面板中领悟。');
    return;
  }
  else {
    openModal('提示', '该物品暂不支持直接使用。');
    return;
  }

  s.breakItems[name]--;
  if (s.breakItems[name] <= 0) delete s.breakItems[name];
  addLog(`使用 ${name}`, 'success');
  renderAll();
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
