// ---- 战斗系统 ----

function startCombat(enemy) {
  const player = getPlayerCombatStats();
  GameState._combatState = {
    enemy: { ...enemy, currentHp: enemy.hp, cd: {}, buffs: {}, dots: [], buffAtk: 0, buffDef: 0 },
    player: { ...player, currentHp: player.maxHp, cd: {}, buffs: {}, dots: [] },
    turn: 0,
    log: [`遭遇 ${enemy.name}！` + (enemy.desc ? ' ' + enemy.desc : '')],
    roundLog: [],
    ended: false,
  };
  showCombatUI();
}

function showCombatUI() {
  if (!GameState._combatState) return;
  const e = GameState._combatState.enemy;
  const p = GameState._combatState.player;
  const ePct = Math.max(0, (e.currentHp / e.hp * 100)).toFixed(0);
  const pPct = Math.max(0, (p.currentHp / p.maxHp * 100)).toFixed(0);

  const subSkills = (GameState.subSkills||[]).map(ss => getSubSkill(ss.id)).filter(s => s && s.category === 'atk');

  // 按品质排序传奇>史诗>稀有>灵品>凡品
  const qualityOrder = { legendary:5, epic:4, rare:3, uncommon:2, common:1 };
  subSkills.sort((a,b) => (qualityOrder[b.quality]||0) - (qualityOrder[a.quality]||0));

  const atkSkills = subSkills.slice(0, 6);
  const qCD = { common:2, uncommon:3, rare:4, epic:5, legendary:6 };

  // 分两行
  const row1 = atkSkills.slice(0,3);
  const row2 = atkSkills.slice(3,6);

  let body = `
    <div class="combat-info">${e.name} · 攻${e.atk} 防${e.def} 速${e.spd}</div>
    <div class="combat-bar"><div class="combat-bar-fill enemy" style="width:${ePct}%"></div></div>
    <div style="font-size:10px;color:var(--text-tertiary);text-align:right;margin-bottom:8px;">${e.currentHp}/${e.hp}</div>
    <hr style="border-color:rgba(255,255,255,0.05);margin:6px 0;">
    <div class="combat-info">你 · HP ${p.currentHp}/${p.maxHp}</div>
    <div class="combat-bar"><div class="combat-bar-fill player" style="width:${pPct}%"></div></div>
    <div style="font-size:11px;color:var(--text-tertiary);margin:6px 0;">第${GameState._combatState.turn+1}回合 · 选择行动：</div>
    <div class="combat-action-grid">
      <button class="combat-action-btn" onclick="doCombatAction('attack')">普攻</button>
      ${row1.map(s => {
        const cdLeft = GameState._combatState.player.cd['skill_'+s.id] || 0;
        return `<button class="combat-action-btn ${cdLeft>0?'cd':''}" onclick="${cdLeft>0?'':'doCombatAction(\'skill\',\'${s.id}\')'}">${s.name}${cdLeft>0?' CD'+cdLeft:''}</button>`;
      }).join('')}
      <button class="combat-action-btn" onclick="doCombatAction('defend')">防御</button>
      <button class="combat-action-btn" onclick="doCombatAction('flee')">逃跑 ${getFleeChance()}%</button>
      ${Object.keys(GameState.combatItems||{}).some(k => (GameState.combatItems[k]||0) > 0) ? `<button class="combat-action-btn" onclick="showCombatItems()">物品</button>` : ''}
      ${row2.length > 0 ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:4px;grid-column:1/-1;">${row2.map(s => {
        const cdLeft = GameState._combatState.player.cd['skill_'+s.id] || 0;
        return `<button class="combat-action-btn ${cdLeft>0?'cd':''}" onclick="${cdLeft>0?'':'doCombatAction(\'skill\',\'${s.id}\')'}">${s.name}${cdLeft>0?' CD'+cdLeft:''}</button>`;
      }).join('')}</div>` : ''}
    </div>
    <div class="combat-log">${GameState._combatState.roundLog.slice(-4).join('<br>')}</div>
  `;

  document.getElementById('modal-title').textContent = '⚔ 战斗';
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-actions').innerHTML = '';
  document.getElementById('modal-overlay').classList.add('active');
}

function showCombatItems() {
  const cs = GameState._combatState;
  if (!cs) return;
  const items = GameState.combatItems || {};
  const available = Object.entries(items).filter(([_,c]) => c > 0);
  if (available.length === 0) return;

  let html = '<div style="font-size:13px;color:var(--gold);margin-bottom:8px;">选择使用的物品（消耗1回合）：</div>';
  available.forEach(([id, count]) => {
    const item = COMBAT_ITEMS[id];
    if (!item) return;
    html += `<button class="skill-row" style="margin:3px 0;width:100%;text-align:left;cursor:pointer;"
      onclick="doCombatAction('item','${id}')">${item.name} ×${count} — ${item.desc}</button>`;
  });
  html += `<button class="skill-btn" style="margin-top:6px;width:100%;" onclick="showCombatUI()">← 返回</button>`;

  document.getElementById('modal-body').innerHTML = html;
}

function getFleeChance() {
  const cs = GameState._combatState;
  if (!cs) return 0;
  const diff = cs.player.spd - cs.enemy.spd;
  return Math.max(0, Math.min(100, Math.floor(50 + diff * 10)));
}

function doCombatAction(action, skillId) {
  const cs = GameState._combatState;
  if (!cs || cs.ended) return;
  cs.turn++;
  cs.roundLog = [];

  // 先手判定（initiative/幻影步加成 / 疾风散必定先手）
  const p = cs.player;
  const initBonus = getSubSkillEffectVal('initiative');
  const playerFirst = p.buffs.firstStrike || cs.player.spd + initBonus * 10 > cs.enemy.spd || (cs.player.spd === cs.enemy.spd && Math.random() > 0.5);
  // 疾风散仅生效一次就清除
  if (p.buffs.firstStrike) p.buffs.firstStrike = false;
  const first = playerFirst ? 'player' : 'enemy';
  const second = playerFirst ? 'enemy' : 'player';

  // first turn
  if (first === 'player') playerTurn(action, skillId);
  else enemyTurn();
  if (checkCombatEnd()) return;

  // second turn
  if (second === 'player') playerTurn(action, skillId);
  else enemyTurn();
  if (checkCombatEnd()) return;

  // tick dots
  tickDots();
  // tick player buffs
  if (cs.player.buffs.atkTurns > 0) cs.player.buffs.atkTurns--;
  if (cs.player.buffs.defTurns > 0) cs.player.buffs.defTurns--;
  if (cs.player.buffs.atkTurns <= 0) cs.player.buffs.atkBoost = 0;
  if (cs.player.buffs.defTurns <= 0) cs.player.buffs.defBoost = 0;
  // reduce CDs
  [cs.player.cd, cs.enemy.cd].forEach(cd => {
    Object.keys(cd).forEach(k => { if(cd[k]>0) cd[k]--; });
  });

  showCombatUI();
}

function playerTurn(action, skillId) {
  const cs = GameState._combatState;
  const p = cs.player;
  const e = cs.enemy;
  if (action === 'flee') {
    const fleeRate = getFleeChance() / 100;
    if (Math.random() < fleeRate) {
      cs.roundLog.push('逃跑成功！');
      cs.ended = true; cs.result = 'flee';
    } else {
      cs.roundLog.push('逃跑失败！');
      // 敌人趁机攻击
      const chaseDmg = Math.floor((e.atk * (1 + (e.buffAtk||0)) * 0.8) - p.def * (p.buffs.defense?2:1) * 0.5);
      p.currentHp -= Math.max(1, chaseDmg);
      cs.roundLog.push(`${e.name} 追击造成 ${Math.max(1, chaseDmg)} 伤害`);
    }
    return;
  }
  if (action === 'defend') {
    p.buffs.defense = true;
    cs.roundLog.push('进入防御姿态');
    return;
  }
  if (action === 'item' && skillId) {
    const item = COMBAT_ITEMS[skillId];
    if (!item || !GameState.combatItems[skillId] || GameState.combatItems[skillId] <= 0) return;
    GameState.combatItems[skillId]--;
    if (item.effect === 'heal') {
      const healAmt = Math.floor(p.maxHp * item.val);
      p.currentHp = Math.min(p.maxHp, p.currentHp + healAmt);
      cs.roundLog.push(`使用 ${item.name}，恢复 ${healAmt} HP`);
    } else if (item.effect === 'buff') {
      if (item.stat === 'atk') { p.buffs.atkBoost = item.val; p.buffs.atkTurns = item.turns; }
      else if (item.stat === 'def') { p.buffs.defBoost = item.val; p.buffs.defTurns = item.turns; }
      cs.roundLog.push(`使用 ${item.name}，${item.stat==='atk'?'攻击':'防御'}+${Math.round(item.val*100)}%（${item.turns}回合）`);
    } else if (item.effect === 'firstStrike') {
      p.buffs.firstStrike = true;
      cs.roundLog.push(`使用 ${item.name}，本回合必定先手！`);
    } else if (item.effect === 'deathSave') {
      p.buffs.deathSave = true;
      cs.roundLog.push(`使用 ${item.name}，神魂护体！`);
    }
    return;
  }
  // attack
  const atkBuff = (p.buffs.atkBoost && p.buffs.atkTurns > 0) ? p.buffs.atkBoost : 0;
  let dmg = Math.floor((p.atk * (1 + atkBuff) - e.def * (1 + (e.buffDef||0))) * (0.85 + Math.random() * 0.3));
  if (dmg < 1) dmg = 1;

  // 主修心法 fight/all 加成
  const msEff = getMainSkillEffect();
  if (msEff && (msEff.type === 'fight' || msEff.type === 'all')) {
    dmg = Math.floor(dmg * (1 + msEff.val));
  }

  let crit = false;
  const qCD = { common:2, uncommon:3, rare:4, epic:5, legendary:6 };

  if (action === 'skill' && skillId) {
    const skill = getSubSkill(skillId);
    if (skill) {
      dmg = Math.floor(dmg * 1.5);
      p.cd['skill_'+skillId] = qCD[skill.quality] || 3;
      cs.roundLog.push(`释放 ${skill.name}！`);

      // penetrate 效果
      const subEff = getSubSkillEffects();
      if (subEff.penetrate && Math.random() < subEff.penetrate) {
        dmg = Math.floor(dmg * 1.5);
        cs.roundLog.push(`破甲！无视防御`);
      }
      // crit 效果（焚天诀）
      if (subEff.crit && Math.random() < subEff.crit) {
        dmg = Math.floor(dmg * 2);
        crit = true;
        cs.roundLog.push(`功法暴击！`);
      }
      // lifesteal 效果（血杀剑）
      if (subEff.lifesteal) {
        const heal = Math.floor(dmg * subEff.lifesteal);
        p.currentHp = Math.min(p.maxHp, p.currentHp + heal);
        cs.roundLog.push(`吸血恢复 ${heal} HP`);
      }
      // doubleCult 效果（诛仙剑意）
      if (subEff.doubleCult > 0) {
        GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + Math.floor(GameState.cultivationMax * 0.05));
      }
      // instantKill 效果（生死符）
      if (subEff.instantKill > 0 && e.currentHp < e.hp * 0.2 && Math.random() < subEff.instantKill) {
        dmg = e.currentHp;
        cs.roundLog.push(`生死符·即死！`);
      }
    }
  }
  // fightDmg 效果（符箓术）通用加成
  const subEff2 = getSubSkillEffects();
  if (subEff2.fightDmg) {
    const bonus = Math.floor(dmg * subEff2.fightDmg);
    dmg += bonus;
  }

  if (Math.random() < 0.05 + (p.wis * 0.01)) { dmg = Math.floor(dmg * 1.5); crit = true; }
  e.currentHp -= dmg;
  if (action === 'skill' && skillId) {
    const skill = getSubSkill(skillId);
    cs.roundLog.push(`${skill?.name||'技能'}造成 ${dmg} 伤害${crit?' 暴击！':''}`);
  } else {
    cs.roundLog.push(`普攻造成 ${dmg} 伤害${crit?' 暴击！':''}`);
  }
}

function enemyTurn() {
  const cs = GameState._combatState;
  const e = cs.enemy;
  const p = cs.player;
  const skills = e.skills || ['bite'];
  const skill = ENEMY_SKILLS[skills[Math.floor(Math.random()*skills.length)]] || ENEMY_SKILLS.bite;

  const defBuff = p.buffs.defBoost && p.buffs.defTurns > 0 ? p.buffs.defBoost : 0;
  let dmg = Math.floor((skill.dmgMult > 0 ? e.atk * (1 + (e.buffAtk||0)) * skill.dmgMult : 0) - p.def * (1 + defBuff) * (p.buffs.defense?2:1));
  if (dmg < 1 && skill.dmgMult > 0) dmg = 1;

  if (skill.type === 'heal') {
    e.currentHp = Math.min(e.hp, e.currentHp + Math.floor(e.hp * (skill.healPct||0.2)));
    cs.roundLog.push(`${e.name} 使用【${skill.name}】恢复HP！`);
  } else if (skill.type === 'buff') {
    if (skill.selfBuff === 'atk') e.buffAtk = (skill.selfBuffVal||0);
    if (skill.selfBuff === 'def') e.buffDef = (skill.selfBuffVal||0);
    cs.roundLog.push(`${e.name} 使用【${skill.name}】！`);
  } else {
    if (Math.random() < (skill.critBonus || 0)) dmg = Math.floor(dmg * 1.5);
    if (skill.dot) p.dots = p.dots || [];
    if (skill.dot) p.dots.push({ dmg: skill.dotDmg||5, turns: skill.dot||2 });
    p.currentHp -= dmg;
    cs.roundLog.push(`${e.name} 使用【${skill.name}】造成 ${dmg} 伤害`);
    // 重伤折寿
    if (dmg > p.maxHp * 0.30 && Math.random() < 0.15) {
      const lsLoss = Math.max(1, Math.floor(dmg / 10));
      applyLifespan(GameState, -lsLoss);
      cs.roundLog.push(`伤势过重，寿元 -${lsLoss}年`);
    }
  }
  p.buffs.defense = false;
}

function tickDots() {
  const cs = GameState._combatState;
  (cs.player.dots||[]).forEach(d => { cs.player.currentHp -= d.dmg; d.turns--; });
  cs.player.dots = (cs.player.dots||[]).filter(d => d.turns > 0);
}

function checkCombatEnd() {
  const cs = GameState._combatState;
  const e = cs.enemy;
  if (e.currentHp <= 0) {
    const stones = getEnemyReward(e);

    // 吞天功 doubleLoot 效果
    const dlBonus = getSubSkillEffectVal('doubleLoot');
    const finalStones = Math.floor(stones * (1 + dlBonus));

    // 妖兽契约 capture 效果
    const capChance = getSubSkillEffectVal('capture');
    if (capChance > 0 && Math.random() < capChance) {
      GameState.breakItems['妖兽幼崽'] = (GameState.breakItems['妖兽幼崽']||0) + 1;
      addLog(`妖兽契约发动！捕获 ${e.name} 幼崽`, 'crit');
    }

    GameState.spiritStones += finalStones;
    // 战斗修为
    const cultReward = Math.floor((ENEMY_TIERS[e.tier].cultReward || 0) * (e._cultMult || 1));
    GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + cultReward);
    cs.ended = true; cs.result = cs.player.currentHp > cs.player.maxHp*0.7 ? 'perfect' : cs.player.currentHp > cs.player.maxHp*0.3 ? 'close' : 'hard';
    const dlText = dlBonus > 0 ? `（吞天功+${Math.round(dlBonus*100)}%）` : '';
    addLog(`战胜 ${e.name}！灵石+${finalStones}${dlText}${cultReward>0?` 修为+${cultReward}`:''}`, 'success');
    // 阶级声望
    const cmbRenown = gainCombatRenown(e.tier);
    if (cmbRenown.gained > 0) addLog(`声望 +${cmbRenown.gained}`, '');
    if (cmbRenown.rankedUp) addLog(`声望升阶！晋升为「${cmbRenown.newRank.name}」`, 'crit');
    // 战斗消耗时间：1~3天
    advanceTime(Math.floor(Math.random() * 3) + 1);
    // 战斗消耗品掉落
    dropCombatItems(e);
    // 战后功法掉落
    trySkillDrop(`${e.name}掉落`);
    closeModal();
    renderAll();
    return true;
  }
  if (cs.player.currentHp <= 0) {
    // 护魂丹：免疫一次致命伤害
    if (cs.player.buffs.deathSave) {
      cs.player.currentHp = 1;
      cs.player.buffs.deathSave = false;
      cs.roundLog.push('护魂丹发动！抵挡了一次致命伤害');
      showCombatUI();
      return;
    }
    // 神识逃生概率：基础10% + 神识×2%（上限50%）
    const escapeChance = Math.min(0.5, 0.10 + getEffectiveWis() * 0.02);
    if (Math.random() < escapeChance) {
      // 重伤逃生
      GameState.cultivation = Math.floor(GameState.cultivation * 0.8);
      GameState.spiritStones = Math.floor(GameState.spiritStones * SPIRIT_STONES.source.flee.lossRatio);
      addLog(`被 ${e.name} 重伤！拼死逃脱（神识+${Math.round(escapeChance*100)}%逃生率），修为-20%，灵石-50%`, 'danger');
      advanceTime(Math.floor(Math.random() * 3) + 1);
      cs.ended = true;
      closeModal();
      renderAll();
    } else {
      // 战死
      cs.ended = true;
      closeModal();
      addLog(`被 ${e.name} 击杀！`, 'danger');
      triggerDeath('妖兽击杀');
    }
    return true;
  }
  return false;
}

function getEnemyReward(enemy) {
  const tier = ENEMY_TIERS[enemy.tier] || ENEMY_TIERS[0];
  const base = tier.reward;
  const mult = enemy._rewardMult || 1;
  return Math.floor(base * mult * (SPIRIT_STONES.source.combat.randomMin + Math.random() * (SPIRIT_STONES.source.combat.randomMax - SPIRIT_STONES.source.combat.randomMin)));
}

function dropCombatItems(enemy) {
  const tier = COMBAT_ITEM_DROP[enemy.tier] || COMBAT_ITEM_DROP[0];
  const rollCount = Math.floor(Math.random() * tier.countMax) + 1;
  let dropped = [];
  for (let i = 0; i < rollCount; i++) {
    const totalW = tier.items.reduce((s, t) => s + t.weight, 0);
    let roll = Math.random() * totalW;
    for (const entry of tier.items) {
      roll -= entry.weight;
      if (roll <= 0) {
        if (entry.weight > 0) dropped.push(entry.id);
        break;
      }
    }
  }
  dropped.forEach(id => {
    GameState.combatItems[id] = (GameState.combatItems[id] || 0) + 1;
  });
  if (dropped.length > 0) {
    const names = [...new Set(dropped)].map(id => COMBAT_ITEMS[id]?.name || id);
    addLog(`掉落战斗物品：${names.join('、')}`, 'loot');
  }
}

