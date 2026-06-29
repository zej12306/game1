// ---- 功法系统 ----

// ===== 功法效果辅助函数 =====

/** 获取当前主修心法效果 */
function getMainSkillEffect() {
  const ms = getMainSkill(GameState.mainSkill);
  if (!ms || !ms.effect || ms.level <= 0) return null;
  return { type: ms.effect, val: (ms.effectVal || 0) * ms.level, penalty: ms.penalty || 0 };
}

/** 汇总所有辅修功法的 effect 值 */
function getSubSkillEffects() {
  const ef = {};
  (GameState.subSkills||[]).forEach(ss => {
    const s = getSubSkill(ss.id);
    if (!s) return;
    if (s.effect) {
      const v = (s.effectVal || 1) * ss.level;
      ef[s.effect] = (ef[s.effect] || 0) + v;
    }
    if (s.subEffect) { ef[s.subEffect] = (ef[s.subEffect] || 0) + (s.subEffectVal || 1) * ss.level; }
  });
  return ef;
}

/** 获取某类功法的额外加成（如炼药术的 herbFind） */
function getSubSkillEffectVal(effectKey) {
  return getSubSkillEffects()[effectKey] || 0;
}

/** 获取当前境界在所有境界列表中的索引（跨位面搜索） */
function getRealmIndex(name) {
  return REALMS.findIndex(r => r.name === name);
}

// ===== 主修功法等级递进 =====

/** 主修功法下一层需要的天数（逐层递增 30%） */
function getMainSkillDays(ms) {
  return Math.floor(ms.daysPerLv * (1 + 0.3 * (ms.level - 1)));
}

/** 主修功法下一层需要的灵石 */
function getMainSkillCost(ms) {
  const qMult = QUALITY_MULT[ms.quality] || 1;
  return Math.floor(ms.level * qMult * 5);
}

/** 主修功法修炼失败概率（悟性瓶颈） */
function getMainSkillFailChance(ms) {
  const wis = getEffectiveWis();
  return Math.max(0, (ms.level - 2) * 0.08 - wis * 0.012);
}

/** 检测功法组合是否解锁 */
function checkCombo(skillId) {
  const skill = getSubSkill(skillId);
  if (!skill || !skill.isCombo) return true; // not combo, always unlocked
  const combo = skill.combo || ['千影剑','破甲刺','铁翼斩'];
  const owned = (GameState.subSkills||[]).map(ss => getSubSkill(ss.id)?.name);
  return combo.every(cn => owned.includes(cn) || cn === skill.name);
}

/** 尝试掉落功法（探索/战后调用） */
function trySkillDrop(source) {
  const s = GameState;
  const regionSkills = SUB_SKILLS.filter(sk => sk.isDrop && sk.region === s.currentRegion);
  if (regionSkills.length === 0) return;

  let chance = 0.03;
  if (s.spiritRoot) chance += 0.01;
  chance += getSubSkillEffectVal('herbFind') * 0.2;
  chance += getSubSkillEffectVal('equipFind') * 0.2;

  if (Math.random() >= chance) return;

  const pool = regionSkills.filter(sk => sk.region === s.currentRegion);
  if (pool.length === 0) return;

  const pick = pool[Math.floor(Math.random() * pool.length)];

  // unique check
  if (pick.isUnique && (s._droppedUnique||{})[pick.id]) return;

  showSkillDropModal(pick, source);
}

function showSkillDropModal(skill, source) {
  const s = GameState;
  const bonusSlots = s.spiritRoot?.bonusSlots || 0;
  const extraSlots = Math.floor(getSubSkillEffectVal('extraSlot'));
  const maxSlots = Math.max(2, Math.floor(s.wis / 5)) + bonusSlots + extraSlots;
  const hasRoom = (s.subSkills||[]).length < maxSlots;
  const alreadyOwned = (s.subSkills||[]).find(ss => ss.id === skill.id);

  const body = `
    <div style="text-align:center;">
      <div style="font-size:14px;color:var(--gold);margin-bottom:4px;">发现功法残卷</div>
      <div style="font-size:18px;font-weight:500;margin-bottom:4px;">${skill.name}</div>
      <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px;">
        ${QUALITY_MAP[skill.quality]} · ${skill.element||'无'} ${({atk:'攻',def:'防',spd:'速',wis:'识',vit:'体',spi:'spi',special:'特'}[skill.category])}
        ${skill.effect ? ' · ' + skill.effect : ''}
      </div>
      ${source ? `<div style="font-size:10px;color:var(--text-tertiary);margin-bottom:8px;">来源：${source}</div>` : ''}
    </div>
    <div style="font-size:11px;color:var(--amber);text-align:center;margin-bottom:8px;">
      ${alreadyOwned ? '已学习此功法' : hasRoom ? `${(s.subSkills||[]).length+1}/${maxSlots}槽位` : '槽位已满，将暂存背包'}
    </div>
  `;

  const actions = [];
  if (!alreadyOwned && hasRoom) {
    actions.push({ label: '学习', onclick: `closeModal();learnSubSkill('${skill.id}')`, primary: true });
  } else if (!alreadyOwned && !hasRoom) {
    actions.push({ label: '存入背包', onclick: `closeModal();stashSkill('${skill.id}')` });
  }
  actions.push({ label: '忽略', onclick: 'closeModal()' });
  openModal('功法残卷', body, actions);
}

// 功法暂存背包
GameState.stashedSkills = GameState.stashedSkills || [];
function stashSkill(skillId) {
  GameState.stashedSkills = GameState.stashedSkills || [];
  if (GameState.stashedSkills.includes(skillId)) return;
  GameState.stashedSkills.push(skillId);
  const sk = getSubSkill(skillId);
  // 印记唯一掉落
  if (sk && sk.isUnique) {
    GameState._droppedUnique = GameState._droppedUnique || {};
    GameState._droppedUnique[skillId] = true;
  }
  addLog(`功法残卷「${sk?.name||skillId}」已存入背包（功法面板查看）`, 'loot');
  renderAll();
}

// 印记唯一掉落
GameState._droppedUnique = GameState._droppedUnique || {};

let skillsVisible = false;

function checkHiddenRegionDiscovery() {
  const s = GameState;
  const cmap = getCurrentMap();
  cmap.data.regions.forEach(region => {
    if (!region.isHidden) return;
    if (!region.discoverChance) return;
    if (s.discoveredRegions[region.id]) return;
    // 检查当前区域是否与该隐藏区域相邻
    const isConnected = cmap.connections.some(([a,b]) =>
      (a === s.currentRegion && b === region.id) || (b === s.currentRegion && a === region.id)
    );
    if (!isConnected) return;
    if (Math.random() < region.discoverChance) {
      s.discoveredRegions[region.id] = true;
      addLog(`探索中发现了隐藏区域：${region.name}！`, 'crit');
      openModal('发现秘境！', `在${getRegion(s.currentRegion)?.name||'此处'}探索中，偶然发现了隐藏区域——${region.name}！`, [
        { label: '稍后再去', onclick: 'closeModal()' },
        { label: '立即前往', onclick: `closeModal();selectRegion('${region.id}')`, primary: true },
      ]);
    }
  });
}

function toggleSkills() {
  if (mapVisible) { mapVisible = false; document.getElementById('map-panel').style.display = 'none'; }
  skillsVisible = !skillsVisible;
  document.getElementById('log-panel').style.display = skillsVisible ? 'none' : '';
  document.getElementById('skills-panel').style.display = skillsVisible ? '' : 'none';
  if (skillsVisible) renderSkills();
}

function renderSkills() {
  const s = GameState;
  const ms = getMainSkill(s.mainSkill);
  const subCount = (s.subSkills||[]).length;
  const bonusSlots = s.spiritRoot?.bonusSlots || 0;
  const extraSlots = Math.floor(getSubSkillEffectVal('extraSlot'));
  const maxSlots = Math.max(2, Math.floor(s.wis / 5)) + bonusSlots + extraSlots;

  let html = `<span class="map-back" onclick="toggleSkills()">← 返回修炼</span>`;

  if (ms) {
    const mult = QUALITY_MULT[ms.quality]||1;
    const prog = s.skillProgress?.main || 0;
    const pct = Math.min(100,(prog/ms.daysPerLv*100)).toFixed(0);
    const growthText = Object.entries(ms.growth).filter(([_,v])=>v>0).map(([k,v])=>`${({atk:'攻',def:'防',spd:'速',wis:'识',vit:'体',spi:'灵'}[k])}+${Math.floor(v*mult)}`).join(' ');

    html += `<div class="card" style="margin-bottom:10px;">
      <div style="font-size:11px;color:var(--text-tertiary);letter-spacing:1px;">主修心法</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
        <span style="font-size:16px;font-weight:500;">${ms.name}</span><span class="skill-quality q-${ms.quality}">${QUALITY_MAP[ms.quality]}</span>
      </div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:6px;">第${ms.level}层 / ${QUALITY_MAXLV[ms.quality]}层</div>
      <div class="realm-bar"><div class="realm-bar-fill" style="width:${pct}%;background:var(--gold);"></div></div>
      <div style="font-size:10px;color:var(--text-tertiary);text-align:right;margin:2px 0 6px;">${prog}/${ms.daysPerLv}天</div>
      <div style="font-size:10px;color:var(--text-tertiary);margin-bottom:4px;">下一层：${growthText}</div>
      ${(() => {
        const nextDays = getMainSkillDays(ms);
        const nextCost = getMainSkillCost(ms);
        const failPct = getMainSkillFailChance(ms);
        const info = [];
        if (nextDays !== ms.daysPerLv) info.push(`${nextDays}天`);
        info.push(`${nextCost}灵石`);
        if (failPct > 0) info.push(`失败率${Math.round(failPct*100)}%`);
        return `<div style="font-size:10px;color:var(--text-tertiary);margin-bottom:4px;">晋升需求：${info.join(' · ')}</div>`;
      })()}
      ${ms.effect ? `<div style="font-size:10px;color:var(--gold);margin-bottom:6px;">
        ${({breakthrough:'突破成功率+',cultivation:'修炼速度+',fight:'战斗伤害+',explore:'探索掉落+',all:'全效果+',destiny:'免死·'}[ms.effect]||ms.effect)}
        ${ms.effectVal ? Math.round(ms.effectVal * ms.level * 100) + '%（当前）' : (ms.effect==='destiny'?'1次':'')}
      </div>` : ''}
      <div style="display:flex;gap:6px;">
        <button class="skill-btn primary" onclick="trainMainSkill()">晋升(${getMainSkillDays(ms)}天 · ${getMainSkillCost(ms)}石)</button>
        <button class="skill-btn danger" onclick="forgetMainSkill()">散功</button>
      </div>
    </div>`;
  }

  const available = getAvailableMainSkills(s.currentRegion).filter(sk => sk.id !== s.mainSkill);
  if(available.length>0) {
    html += `<div class="card" style="margin-bottom:10px;"><div style="font-size:11px;color:var(--text-tertiary);letter-spacing:1px;margin-bottom:6px;">当前位置可学心法</div>`;
    available.forEach(sk => {
      html += `<div class="skill-row" onclick="learnMainSkill('${sk.id}')">
        <div><span style="font-size:13px;">${sk.name}</span><span class="skill-quality q-${sk.quality}">${QUALITY_MAP[sk.quality]}</span>
          <span style="font-size:10px;color:var(--text-tertiary);margin-left:4px;">${sk.category==='balanced'?'均衡':({atk:'攻击',def:'防御',spd:'速度',wis:'神识',vit:'体魄',spi:'灵力'}[sk.category]||'')}</span></div>
        <span style="font-size:10px;color:var(--text-tertiary);">${sk.source||'可学'}</span></div>`;
    });
    html += `</div>`;
  }

  html += `<div class="card" style="margin-bottom:10px;">
    <div style="font-size:11px;color:var(--text-tertiary);letter-spacing:1px;margin-bottom:4px;">辅修功法 · ${subCount}/${maxSlots} 槽位</div>`;
  (s.subSkills||[]).forEach(ss => {
    const skill = getSubSkill(ss.id); if(!skill) return;
    const affinity = s.spiritRoot && isAffinityMatch(skill, s.spiritRoot);
    const doubleEff = s.spiritRoot?.doubleEff || false;
    const trainDays = affinity ? (doubleEff ? Math.floor(skill.daysPerLv * 0.5) : Math.floor(skill.daysPerLv * 0.7)) : skill.daysPerLv;
    html += `<div class="skill-row">
      <div><span style="font-size:13px;">${skill.name}</span>
        <span class="skill-tag tag-${skill.category==='special'?'special':({atk:'atk',def:'def',spd:'spd',wis:'wis',vit:'vit',spi:'spi'}[skill.category])}">${({atk:'攻',def:'防',spd:'速',wis:'识',vit:'体',spi:'spi',special:'特'}[skill.category])}</span>
        ${skill.element?`<span style="font-size:10px;padding:1px 4px;border-radius:2px;background:rgba(201,169,110,0.1);color:${ELEMENT_COLOR[skill.element]||'#c9a96e'};margin-left:4px;">${skill.element}${affinity?' 共鸣':''}</span>`:''}
        ${skill.effect ? `<span style="font-size:10px;color:var(--gold);margin-left:4px;">${skill.effect}</span>` : ''}
        <span style="font-size:10px;color:var(--text-tertiary);margin-left:4px;">Lv.${ss.level}/${skill.maxLv}</span></div>
      <div style="display:flex;gap:4px;">
        <button class="skill-btn primary" onclick="trainSubSkill('${ss.id}')">${trainDays}天</button>
        <button class="skill-btn" onclick="forgetSubSkill('${ss.id}')">遗忘</button></div></div>`;
  });
  const regionSkills = getSkillsByRegion(s.currentRegion).filter(sk => !(s.subSkills||[]).find(ss => ss.id===sk.id))
    .filter(sk => {
      if (!sk.element || sk.category === 'special') return true;
      if (!s.spiritRoot) return true;
      return s.spiritRoot.elements.includes(sk.element);
    });
  if(subCount<maxSlots && regionSkills.length>0) {
    html += `<div style="font-size:11px;color:var(--text-tertiary);margin:8px 0 4px;">可学功法：</div>`;
    // 按灵根匹配度排序（共鸣优先），再去重取前8个
    const sortedSkills = [...regionSkills].sort((a,b) => {
      const aAff = s.spiritRoot && isAffinityMatch(a, s.spiritRoot) ? 1 : 0;
      const bAff = s.spiritRoot && isAffinityMatch(b, s.spiritRoot) ? 1 : 0;
      return bAff - aAff || QUALITY_MULT[b.quality] - QUALITY_MULT[a.quality];
    });
    sortedSkills.slice(0,8).forEach(sk => {
      const aff = s.spiritRoot && isAffinityMatch(sk, s.spiritRoot);
      const realmReqText = sk.realmReq
        ? `<span style="font-size:10px;color:var(--amber);margin-left:4px;">需${sk.realmReq}</span>`
        : '';
      const comboText = sk.isCombo
        ? `<span style="font-size:10px;color:var(--text-tertiary);margin-left:4px;">组合解锁</span>`
        : '';
      html += `<div class="skill-row" onclick="learnSubSkill('${sk.id}')">
        <div><span style="font-size:12px;">${sk.name}</span><span class="skill-quality q-${sk.quality}">${QUALITY_MAP[sk.quality]}</span>
          ${sk.element?`<span style="font-size:10px;padding:1px 4px;border-radius:2px;background:rgba(201,169,110,0.1);color:${ELEMENT_COLOR[sk.element]||'#c9a96e'};margin-left:4px;">${sk.element}${aff?' 共鸣':''}</span>`:''}
          <span class="skill-tag tag-${sk.category==='special'?'special':({atk:'atk',def:'def',spd:'spd',wis:'wis',vit:'vit',spi:'spi'}[sk.category])}">${({atk:'攻',def:'防',spd:'速',wis:'识',vit:'体',spi:'spi',special:'特'}[sk.category])}</span>
          ${realmReqText}${comboText}</div>
        <span style="font-size:10px;color:var(--text-tertiary);">${sk.source}</span></div>`;
    });
  }
  // 暂存功法
  const stashed = GameState.stashedSkills || [];
  if (stashed.length > 0) {
    html += `<div style="font-size:11px;color:var(--text-tertiary);margin:8px 0 4px;">背包功法残卷：</div>`;
    stashed.forEach(skId => {
      const sk = getSubSkill(skId);
      if (!sk) return;
      html += `<div class="skill-row" onclick="learnSubSkill('${sk.id}')">
        <div><span style="font-size:12px;">${sk.name}</span><span class="skill-quality q-${sk.quality}">${QUALITY_MAP[sk.quality]}</span>
          <span style="font-size:10px;color:var(--text-tertiary);">点击学习</span></div></div>`;
    });
  }
  html += `</div>`;
  const bonus = getSkillAttrBonus();
  const bonusText = Object.entries(bonus).filter(([_,v])=>v>0).map(([k,v])=>`${({atk:'攻',def:'防',spd:'速',wis:'识',vit:'体',spi:'灵'}[k])}+${v}`).join(' ');
  html += `<div style="font-size:10px;color:var(--text-tertiary);text-align:right;">功法加成：${bonusText||'无'}</div>`;
  document.getElementById('skills-content').innerHTML = html;
}

function trainMainSkill() {
  const ms = getMainSkill(GameState.mainSkill);
  if(!ms||ms.level>=QUALITY_MAXLV[ms.quality]){openModal('已满','已达最高层');return;}

  const days = getMainSkillDays(ms);
  const cost = getMainSkillCost(ms);
  const failChance = getMainSkillFailChance(ms);

  if (GameState.spiritStones < cost) {
    openModal('灵石不足', `修炼${ms.name}第${ms.level+1}层需 ${cost} 灵石（当前 ${GameState.spiritStones}）。`);
    return;
  }

  GameState.spiritStones -= cost;
  const spent = cost;

  // 悟性瓶颈
  if (failChance > 0 && Math.random() < failChance) {
    advanceTime(days);
    addLog(`修炼${ms.name}第${ms.level+1}层失败，${days}天白费（灵石 -${spent}）`, 'danger');
    showToast('悟性不足，修炼失败', 'danger');
    renderAll(); renderSkills();
    return;
  }

  GameState.skillProgress=GameState.skillProgress||{};
  GameState.skillProgress.main=(GameState.skillProgress.main||0)+days;
  ms.level++; GameState.skillProgress.main=0;
  advanceTime(days);
  addLog(`修炼${ms.name}至第${ms.level}层（${days}天·灵石 -${spent}）`,'success');
  const skillRenown = gainSkillRenown(ms.quality);
  if (skillRenown.gained > 0) addLog(`功法声望 +${skillRenown.gained}`, '');
  if (skillRenown.rankedUp) addLog(`声望升阶！晋升为「${skillRenown.newRank.name}」`, 'crit');
  renderAll(); renderSkills();
}
function forgetMainSkill(){
  openModal('确认散功','散功将清空当前心法所有层数，修为-20%，寿元-5年。',[
    {label:'取消',onclick:'closeModal()'},{label:'散功',onclick:'closeModal();doForgetMain()',primary:true}]);
}
function doForgetMain(){
  const ms=getMainSkill(GameState.mainSkill); if(!ms)return;
  ms.level=1; GameState.cultivation=Math.floor(GameState.cultivation*0.8); applyLifespan(GameState,-5);
  GameState.skillProgress.main=0;
  addLog(`散功${ms.name}，修为-20%，寿元-5年`,'danger'); renderAll(); renderSkills();
}
function learnMainSkill(skillId){
  const sk=getMainSkill(skillId); if(!sk)return;
  // 灵根元素限制（主修心法）
  if (GameState.spiritRoot && sk.element) {
    if (!GameState.spiritRoot.elements.includes(sk.element)) {
      openModal('灵根不符', `你的灵根[${GameState.spiritRoot.elements.join('·')}]无法修习${sk.element}属性心法「${sk.name}」。`);
      return;
    }
  }
  const bonusLv = GameState.spiritRoot?.bonusLv || 0;
  sk.level = 1 + bonusLv;
  GameState.mainSkill=skillId; GameState.skillProgress=GameState.skillProgress||{}; GameState.skillProgress.main=0;
  addLog(`开始修习主修心法：${sk.name}${bonusLv?' (灵根加成，起始第'+(1+bonusLv)+'层)':''}`,'success'); renderAll(); renderSkills();
}
function trainSubSkill(id){
  const ss=(GameState.subSkills||[]).find(s=>s.id===id); const skill=getSubSkill(id);
  if(!ss||!skill||ss.level>=skill.maxLv){openModal('已满','已到最高层');return;}
  const affinity = GameState.spiritRoot && isAffinityMatch(skill, GameState.spiritRoot);
  const doubleEff = GameState.spiritRoot?.doubleEff || false;
  const days = affinity ? (doubleEff ? Math.floor(skill.daysPerLv * 0.5) : Math.floor(skill.daysPerLv * 0.7)) : skill.daysPerLv;
  ss.level++; GameState.skillProgress=GameState.skillProgress||{}; GameState.skillProgress.sub=GameState.skillProgress.sub||{};
  GameState.skillProgress.sub[id]=0; advanceTime(days);
  addLog(`修炼${skill.name}至第${ss.level}层${affinity?' (灵根共鸣！'+(doubleEff?'-50%天数)':'-30%天数)'):''}`,'success');
  const subRenown = gainSkillRenown(skill.quality);
  if (subRenown.gained > 0) addLog(`功法声望 +${subRenown.gained}`, '');
  if (subRenown.rankedUp) addLog(`声望升阶！晋升为「${subRenown.newRank.name}」`, 'crit');
  renderAll(); renderSkills();
}
function learnSubSkill(id){
  const skill=getSubSkill(id); if(!skill)return;

  // 境界限制
  if (skill.realmReq) {
    const curIdx = getRealmIndex(GameState.realm);
    const reqIdx = getRealmIndex(skill.realmReq);
    if (curIdx < reqIdx) {
      openModal('境界不足', `${skill.name}需要${skill.realmReq}境界才能修习。`);
      return;
    }
  }

  // 组合功法检测
  if (skill.isCombo && !checkCombo(id)) {
    const combo = skill.combo || ['千影剑','破甲刺','铁翼斩'];
    openModal('组合未解锁', `${skill.name}需要同时持有：${combo.join('、')}`);
    return;
  }

  // 灵根元素限制
  if (GameState.spiritRoot && skill.element && skill.category !== 'special') {
    if (!GameState.spiritRoot.elements.includes(skill.element)) {
      openModal('灵根不符', `你的灵根[${GameState.spiritRoot.elements.join('·')}]无法修习${skill.element}属性功法。`);
      return;
    }
  }

  const bonusSlots = GameState.spiritRoot?.bonusSlots || 0;
  const bonusLv = GameState.spiritRoot?.bonusLv || 0;
  const extraSlots = Math.floor(getSubSkillEffectVal('extraSlot'));
  const currentSlots = (GameState.subSkills||[]).length;
  const maxSlots=Math.max(2,Math.floor(getEffectiveWis()/5),currentSlots)+bonusSlots+extraSlots;
  if((GameState.subSkills||[]).length>=maxSlots){openModal('槽位不足','神识不够或灵根限制');return;}
  GameState.subSkills=GameState.subSkills||[]; GameState.subSkills.push({id,level:1+bonusLv});

  // 印记唯一掉落
  if (skill.isUnique) {
    GameState._droppedUnique = GameState._droppedUnique || {};
    GameState._droppedUnique[skill.id] = true;
  }

  addLog(`学习辅修：${skill.name}${bonusLv?' (灵根加成，起始第'+(1+bonusLv)+'层)':''}`,'success'); renderAll(); renderSkills();
}
function forgetSubSkill(id){
  const idx=(GameState.subSkills||[]).findIndex(s=>s.id===id); if(idx<0)return;
  const skill=getSubSkill(id); GameState.subSkills.splice(idx,1);
  addLog(`遗忘辅修：${skill?.name||id}`,''); renderAll(); renderSkills();
}

