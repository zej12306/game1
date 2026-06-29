// ---- 地图系统 ----

let mapVisible = false;

function toggleMap() {
  mapVisible = !mapVisible;
  document.getElementById('log-panel').style.display = mapVisible ? 'none' : '';
  document.getElementById('map-panel').style.display = mapVisible ? '' : 'none';
  if (mapVisible) renderMap();
}

function renderMap() {
  const s = GameState;
  const map = getCurrentMap();
  const regions = map.data.regions;
  const positions = map.positions;
  const connections = map.connections;
  const W = 560, H = 400; // map dimensions
  const pad = 30;

  let html = `<span class="map-back" onclick="toggleMap()">← 返回修炼</span>`;
  html += `<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;">${GameState.plane==='spirit'?'灵界':GameState.plane==='immortal'?'仙界':'人界'}</div>`;

  // SVG-like positioned map
  html += `<div id="map-container" style="height:${H}px;">`;

  // region nodes
  regions.forEach(region => {
    const pos = positions[region.id];
    if (!pos) return;
    const fullMap = getSubSkillEffectVal('fullMap') > 0;
    const locked = !canAccessRegion(region) || (region.isHidden && !fullMap && !s.discoveredRegions[region.id]);
    const isCurrent = region.id === s.currentRegion;
    const x = pos.x/100 * (W - pad*2) + pad;
    const y = pos.y/100 * (H - pad*2) + pad;

    html += `<div class="map-node-visual" style="left:${x}px;top:${y}px;" onclick="${locked ? '' : `selectRegion('${region.id}')`}">
      <div class="map-node-dot ${isCurrent?'active':''} ${locked?'locked':''}"></div>
      <div class="map-node-name ${isCurrent?'active':''} ${locked?'locked':''}">${region.name}${locked ? ' · '+region.realmRequired : ''}</div>
    </div>`;
  });

  html += `</div>`;

  // detail panel for selected region
  const selRegion = map.data.regions.find(r => r.id === s.currentRegion);
  if (selRegion) {
    const isCurrent = selRegion.id === s.currentRegion;
    html += `<div class="map-node-detail">
      <div style="font-size:13px;font-weight:500;">${selRegion.name}<span style="font-size:10px;color:var(--text-tertiary);margin-left:6px;">${selRegion.areaName}</span></div>
      <div style="margin-top:6px;">`;
    selRegion.nodes.forEach(node => {
      const isHere = isCurrent && node.id === s.currentNode;
      html += `<span class="map-mini-node ${isHere?'current':''}" onclick="exploreNode('${selRegion.id}','${node.id}')">${node.name}${node.cultivationBonus?' +'+(node.cultivationBonus*100)+'%':''}</span>`;
    });
    html += `</div></div>`;

    // legacy stash
    if (s.legacyStash && !s.legacyStash.claimed && s.currentRegion === 'yue_huangfeng') {
      html += `<div class="map-node-detail" style="border-color:var(--gold);cursor:pointer;margin-top:6px;" onclick="claimLegacy()">
        <div style="color:var(--gold);font-weight:500;">因果传承</div>
        <div style="font-size:11px;color:var(--text-secondary);">前世遗留：${s.legacyStash.stones}灵石 + ${s.legacyStash.item||'无'} — 点击领取</div>
      </div>`;
    }
  }

  document.getElementById('map-content').innerHTML = html;
}

function findPath(from, to) {
  const cmap = getCurrentMap();
  const connections = cmap.connections;
  const visited = new Set([from]);
  const queue = [[from]];
  while (queue.length > 0) {
    const path = queue.shift();
    const last = path[path.length - 1];
    if (last === to) return path;
    connections.forEach(([a,b,days]) => {
      if (a === last && !visited.has(b)) {
        visited.add(b);
        queue.push([...path, b]);
      } else if (b === last && !visited.has(a)) {
        visited.add(a);
        queue.push([...path, a]);
      }
    });
  }
  return null;
}

function selectRegion(regionId) {
  const s = GameState;
  if (s.currentRegion === regionId) { renderMap(); return; }

  const cmap = getCurrentMap();
  const conn = cmap.connections.find(([a,b]) => (a===s.currentRegion&&b===regionId)||(b===s.currentRegion&&a===regionId));
  if (conn) {
    const days = conn[2];
    const name = cmap.data.regions.find(r=>r.id===regionId)?.name;
    openModal('移动', `前往${name}需要${days}天。确定吗？`, [
      { label: '取消', onclick: 'closeModal()' },
      { label: '出发', onclick: `closeModal();travelTo('${regionId}')`, primary: true },
    ]);
    return;
  }

  // 间接路径：BFS找最短路线
  if (!canAccessRegion(cmap.data.regions.find(r=>r.id===regionId))) { openModal('未解锁','境界不足'); return; }

  const path = findPath(s.currentRegion, regionId);
  if (!path || path.length < 2) { openModal('无法到达','没有通往该区域的道路。'); return; }

  let totalDays = 0;
  const stops = [];
  for (let i = 0; i < path.length - 1; i++) {
    const c = cmap.connections.find(([a,b,d]) => (a===path[i]&&b===path[i+1])||(b===path[i]&&a===path[i+1]));
    if (c) { totalDays += c[2]; stops.push(cmap.data.regions.find(r=>r.id===path[i+1])?.name); }
  }

  const name = cmap.data.regions.find(r=>r.id===regionId)?.name;
  openModal('长途跋涉', `前往${name}，途经${stops.slice(0,-1).join('→')}，共${totalDays}天。确定吗？`, [
    { label: '取消', onclick: 'closeModal()' },
    { label: '出发', onclick: `closeModal();chainTravel('${regionId}',[${path.map(p=>`'${p}'`).join(',')}])`, primary: true },
  ]);
}

function chainTravel(targetId, path) {
  const s = GameState;
  if (path.length < 2) return;
  const cmap = getCurrentMap();
  let totalDays = 0;
  const events = [];

  for (let i = 0; i < path.length - 1; i++) {
    const conn = cmap.connections.find(([a,b]) => (a===path[i]&&b===path[i+1])||(b===path[i]&&a===path[i+1]));
    if (conn) totalDays += conn[2];
  }

  advanceTime(totalDays);

  // 长途旅行事件概率翻倍
  if (Math.random() < SPIRIT_STONES.source.longTravel.eventChance) {
    const ev = Math.random();
    if (ev < 0.3) { const loss=Math.min(s.spiritStones,Math.floor(Math.random()*(SPIRIT_STONES.source.longTravel.robMax-SPIRIT_STONES.source.longTravel.robMin+1))+SPIRIT_STONES.source.longTravel.robMin); s.spiritStones-=loss; events.push(`途中遭遇劫修！灵石-${loss}`); }
    else if (ev < 0.6) { s.spiritStones+=SPIRIT_STONES.source.longTravel.herbGain; events.push(`途中发现灵药，灵石+${SPIRIT_STONES.source.longTravel.herbGain}`); }
    else { s.cultivation=Math.floor(s.cultivation*0.9); events.push('途中遭遇妖兽，轻伤'); }
  }

  const destRegion = cmap.data.regions.find(r=>r.id===targetId);
  s.currentRegion = targetId;
  s.currentNode = destRegion ? destRegion.nodes[0].id : '';

  addLog(`长途跋涉${totalDays}天，抵达${destRegion?.name||'?'}`, '');
  events.forEach(e => addLog(e, e.includes('-')?'danger':e.includes('+')?'loot':''));
  if (checkDeath()) return;

  renderAll();
  renderMap();
}

function exploreNode(regionId, nodeId) {
  const s = GameState;

  // 冷却检查：同一节点需间隔3天
  const nodeKey = regionId + '|' + nodeId;
  const lastDay = s.lastExploreDay[nodeKey] || 0;
  if (s.totalDays - lastDay < 3 && lastDay > 0) {
    openModal('需要休息', `此地刚探索过（${s.totalDays - lastDay}天前），灵气尚未恢复。`);
    return;
  }

  s.currentRegion = regionId;
  s.currentNode = nodeId;
  s.lastExploreDay[nodeKey] = s.totalDays;
  const node = getNode(regionId, nodeId);
  if (!node) return;

  // exploreEff 探索耗时减免（水上漂）
  const exploreEff = getSubSkillEffectVal('exploreEff');
  const exploreDays = exploreEff > 0 && Math.random() < exploreEff ? 0 : 1;
  advanceTime(exploreDays);

  if (s.legacyStash && !s.legacyStash.claimed && regionId === 'yue_huangfeng' && nodeId === 'hf_main') {
    s.legacyStash.claimed = true;
    s.spiritStones += s.legacyStash.stones;
    if (s.legacyStash.item) s.breakItems[s.legacyStash.item] = (s.breakItems[s.legacyStash.item]||0)+1;
    addLog(`找到因果传承：灵石+${s.legacyStash.stones}`+(s.legacyStash.item?`，${s.legacyStash.item}x1`:''),'crit');
  }

  if (s.origin && Math.random() < 0.02) addLog('身世记忆浮现...','loot');

  // check for combat (dangerDown 效果)
  let fightChance = node.huntNode ? 0.40 : (node.events.fight || 0);
  const dangerDown = getSubSkillEffectVal('dangerDown');
  fightChance = Math.max(0.01, fightChance - dangerDown);
  if (Math.random() < fightChance) {
    const enemy = rollEnemy(regionId);
    addLog(`${node.name}：遭遇${enemy.name}！`, 'danger');
    renderAll();
    startCombat(enemy);
    return;
  }

  const result = getCurrentMap().exploreFn(node);
  // nodeSpecial 已自行打 log，避免重复空行
  if (result.type !== 'special' && result.type !== 'originEvent') {
    const cls = result.type==='nothing'?'':result.type==='danger'?'danger':result.type==='loot'?'loot':'';
    addLog(`${node.name}：${result.text}`, cls);
  } else if (result.type === 'originEvent') {
    addLog(`${node.name}：${result.text}`, 'success');
  }
  showExploreToast(node.name, result.text || (result.type==='special'?'灵光一闪':'一无所获'));

  // 阶级声望
  const exploreRenown = gainExploreRenown();
  if (exploreRenown.gained > 0) addLog(`探索中声望 +${exploreRenown.gained}`, '');
  if (exploreRenown.rankedUp) addLog(`声望升阶！晋升为「${exploreRenown.newRank.name}」`, 'crit');

  // 功法效果：herbFind/equipFind（炼药术/炼器术）
  const herbFind = getSubSkillEffectVal('herbFind');
  if (herbFind > 0 && Math.random() < herbFind) {
    const herb = ['凝元草','紫纹灵芝','月华露','千年人参'][Math.floor(Math.random()*4)];
    GameState.breakItems[herb] = (GameState.breakItems[herb]||0) + 1;
    addLog(`炼药术感知：发现 ${herb} x1`, 'loot');
  }
  const equipFind = getSubSkillEffectVal('equipFind');
  if (equipFind > 0 && Math.random() < equipFind) {
    GameState.atk += 1;
    addLog('炼器术感知：发现法器残片，攻击+1', 'loot');
  }
  const secretFind = getSubSkillEffectVal('secretFind');
  if (secretFind > 0 && Math.random() < secretFind) {
    GameState.spiritStones += SPIRIT_STONES.source.explore.secretFindGain;
    addLog(`天眼通窥见秘境，灵石+${SPIRIT_STONES.source.explore.secretFindGain}`, 'crit');
  }

  // 功法掉落
  trySkillDrop(node.name);

  // 材料掉落（炼丹）
  const matDrop = tryMaterialDrop(node.name);
  if (matDrop) addLog(`探索中获得 ${matDrop} ×1`, 'loot');

  // 隐藏区域发现检查：相邻隐藏区域有概率被发现
  checkHiddenRegionDiscovery();

  if (checkDeath()) return;
  renderAll();
  renderMap();
}

function travelTo(regionId) {
  const s = GameState;
  const cmap = getCurrentMap();
  const region = cmap.data.regions.find(r => r.id === regionId);
  if (!region) return;
  const conn = cmap.connections.find(([a,b]) => (a===s.currentRegion&&b===regionId)||(b===s.currentRegion&&a===regionId));
  const days = conn ? conn[2] : 0;
  if (days <= 0) return;
  advanceTime(days);

  if (Math.random() < SPIRIT_STONES.source.travel.eventChance) {
    const ev = Math.random();
    if (ev < 0.3) { const loss = Math.min(s.spiritStones,Math.floor(Math.random()*(SPIRIT_STONES.source.travel.robMax-SPIRIT_STONES.source.travel.robMin+1))+SPIRIT_STONES.source.travel.robMin); s.spiritStones-=loss; addLog(`途中遭遇劫修！灵石-${loss}`,'danger'); }
    else if (ev < 0.6) { s.spiritStones+=SPIRIT_STONES.source.travel.herbGain; addLog(`途中发现灵药，灵石+${SPIRIT_STONES.source.travel.herbGain}`,'loot'); }
    else { s.cultivation=Math.floor(s.cultivation*0.9); addLog('途中遭遇妖兽，轻伤','danger'); }
  }

  s.currentRegion = regionId;
  s.currentNode = region.nodes[0].id;
  addLog(`抵达${region.name}（${days}天）`,'');
  if (checkDeath()) return;
  renderAll();
  renderMap();
}

function claimLegacy() {
  const s = GameState;
  if (!s.legacyStash || s.legacyStash.claimed) return;
  s.legacyStash.claimed = true;
  s.spiritStones += s.legacyStash.stones;
  if (s.legacyStash.item) {
    s.breakItems[s.legacyStash.item] = (s.breakItems[s.legacyStash.item] || 0) + 1;
  }
  addLog(`领取因果传承：灵石+${s.legacyStash.stones}` + (s.legacyStash.item ? `，${s.legacyStash.item}x1` : ''), 'crit');
  renderAll();
  renderMap();
}

function showExploreToast(name, text) {
  const el = document.createElement('div');
  el.className = 'explore-toast';
  el.textContent = `${name} · ${text}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

