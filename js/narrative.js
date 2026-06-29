// ---- 叙事事件系统 ----

function checkNarrative() {
  const s = GameState;
  if (!s.origin) return;

  // destined event
  const ev = getDestinedEvent(s.origin.id);
  if (ev && s.narrativeDay >= ev.day && !s.narrativeTriggered.includes('destined')) {
    s.narrativeTriggered.push('destined');
    showNarrative(ev);
    return;
  }

  // random events every 80-150 days
  const sinceLast = s.narrativeDay - s.lastRandomNarrative;
  if (sinceLast >= 80 + Math.floor(Math.random() * 70)) {
    const rnd = rollRandomEvent(s.narrativeTriggered, s.plane);
    if (rnd && s.narrativeDay >= rnd.dayMin) {
      s.narrativeTriggered.push(rnd.id);
      s.lastRandomNarrative = s.narrativeDay;
      showRandomEvent(rnd);
    }
  }
}

let _pendingEffect = null;

function showNarrative(ev) {
  showToast(ev.text.slice(0, 30) + '…', 'crit');
  // 功法/地图面板打开时自动切回日志，确保事件可见
  if (typeof skillsVisible !== 'undefined' && skillsVisible) { skillsVisible = false; document.getElementById('skills-panel').style.display = 'none'; }
  if (typeof mapVisible !== 'undefined' && mapVisible) { mapVisible = false; document.getElementById('map-panel').style.display = 'none'; }
  document.getElementById('log-panel').style.display = '';
  const body = `
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:14px;">第${ev.day}天 · ${ev.text}</div>
    <div style="display:flex;gap:8px;">${ev.choices.map((c,i) =>
      `<button style="flex:1;padding:10px 12px;border:1px solid ${i===0?'var(--gold)':'rgba(255,255,255,0.12)'};border-radius:var(--radius-sm);background:${i===0?'rgba(201,169,110,0.1)':'var(--bg-surface)'};color:var(--text-primary);font-size:12px;cursor:pointer;font-family:var(--font-sans);" onclick="_pendingEffect=${i};closeModal();_runEvent()">${c.text}</button>`
    ).join('')}</div>
  `;
  _pendingEvent = ev;
  openModal(`命定事件 · ${GameState.origin.name}`, body, []);
}

let _pendingEvent = null;

function _runEvent() {
  if (!_pendingEvent || _pendingEffect === null) return;
  _pendingEvent.choices[_pendingEffect].effect();
  _pendingEvent = null; _pendingEffect = null;
}

function _runRandomEvent() {
  if (_pendingRandEvent) { _pendingRandEvent.effect(); _pendingRandEvent = null; }
}

let _pendingRandEvent = null;

function showRandomEvent(ev) {
  showToast('奇遇：' + ev.text.slice(0, 24) + '…', 'loot');
  if (typeof skillsVisible !== 'undefined' && skillsVisible) { skillsVisible = false; document.getElementById('skills-panel').style.display = 'none'; }
  if (typeof mapVisible !== 'undefined' && mapVisible) { mapVisible = false; document.getElementById('map-panel').style.display = 'none'; }
  document.getElementById('log-panel').style.display = '';
  _pendingRandEvent = ev;
  const body = `<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:14px;">第${GameState.narrativeDay}天 · ${ev.text}</div>`;
  openModal('奇遇', body, [{ label: '继续', onclick: 'closeModal();_runRandomEvent()' }]);
}

// ---- 身世卡牌 ----

function showOriginCard(origin, callback) {
  const rarityMap = { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗', legendary: '传说' };
  const rarityColor = { legendary: 'var(--gold)', epic: '#b066ff', rare: 'var(--azure)', uncommon: 'var(--jade)', common: 'var(--text-secondary)' };

  const body = `
    <div style="text-align:center;margin-bottom:12px;">
      <div style="font-size:11px;color:${rarityColor[origin.rarity]};letter-spacing:2px;">${rarityMap[origin.rarity]}</div>
      <div style="font-family:var(--font-display);font-size:22px;font-weight:500;color:var(--gold);margin:4px 0;">${origin.name}</div>
    </div>
    <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:10px 14px;font-size:12px;color:var(--text-secondary);line-height:1.7;margin-bottom:12px;">${origin.desc}</div>
    <div style="font-size:11px;color:var(--text-tertiary);text-align:center;">
      初始灵石：${origin.bonus.spiritStones}
      ${Object.keys(origin.bonus.items).length > 0 ? ' | 初始物品：' + Object.entries(origin.bonus.items).map(([n,c]) => n+' x'+c).join(', ') : ''}
    </div>
  `;

  _originCallback = callback;
  openModal('', body, [{ label: '踏上修仙之路', onclick: 'closeModal();_runOriginCallback()', primary: true }]);
}
let _originCallback = null;
function _runOriginCallback() { if (_originCallback) { _originCallback(); _originCallback = null; } }
