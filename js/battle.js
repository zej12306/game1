/**
 * battle.js — 修仙战斗系统
 * 基于 GDD 附录二 行1666~1764
 *
 * 核心子系统：
 *   出手顺序（速度排序） / 技能资源（灵力/神识） / 闪避暴击
 *   3种伤害公式（物理/法术/神识） / 五行相克 / Buff/Debuff
 *   6层保命 / 7种陨落 / NPC·修士AI / 逃跑判定
 *
 * 依赖：DATA（js/data.js）
 * 导出：Battle 类
 */

/* ================================================================
 *  一、常量定义
 * ================================================================ */

/** 五行相克链：金克木克土克水克火克金 */
const ELEMENT_WEAKNESS = {
  金: '木', 木: '土', 土: '水',
  水: '火', 火: '金',
};

/** 五行被克（反向查找） */
const ELEMENT_STRENGTH = {};
for (const [k, v] of Object.entries(ELEMENT_WEAKNESS)) {
  ELEMENT_STRENGTH[v] = k; // v 克制 k → v 对被克方伤害 +25%
}

/** 五行克制伤害修正 */
const ELEM_COUNTER_BONUS   = 0.25; // 克制方 +25%
const ELEM_COUNTERED_PENALTY = 0.25; // 被克方 -25%

/** 战斗方类型 */
const SIDE = { PLAYER: 'player', ENEMY: 'enemy' };

/** 行动类型 */
const ACTION = {
  ATTACK:     'attack',      // 普通攻击
  SKILL:      'skill',       // 释放技能
  ITEM:       'item',        // 使用道具/符箓
  DEFEND:     'defend',      // 防御（减伤50%）
  ESCAPE:     'escape',      // 逃跑
  PASS:       'pass',        // 跳过（冻结/沉默等）
  // (AI 使用 ATTACK/SKILL/DEFEND/ESCAPE，无需特殊类型)
};

/** 伤害类型 */
const DMG_TYPE = {
  PHYSICAL: 'physical',
  MAGICAL:  'magical',
  DIVINE:   'divine',   // 神识攻击
};

/** 陨落原因 */
const DEATH_CAUSE = {
  LIFESPAN:    '寿元耗尽',
  BATTLE_LOSS: '战败无救',
  QI_DEVIATION:'走火入魔',
  TRIBULATION: '渡劫大失败',
  POSSESSION:  '夺舍失败',
  FORBIDDEN:   '禁制秒杀',
  FIVE_DECLINE:'天人五衰',
};

/** 陨落可用结局映射（按 GDD 行1764） */
const DEATH_OUTCOMES = {
  [DEATH_CAUSE.LIFESPAN]:    ['坐化', '转世', '夺舍', '兵解重修', '身外化身', '天人五衰'],
  [DEATH_CAUSE.BATTLE_LOSS]: ['坐化', '转世', '天人五衰'],
  [DEATH_CAUSE.QI_DEVIATION]:['兵解重修', '身外化身'],
  [DEATH_CAUSE.TRIBULATION]: ['坐化', '转世', '兵解重修'],
  [DEATH_CAUSE.POSSESSION]:  [], // 游戏直接结束
  [DEATH_CAUSE.FORBIDDEN]:   ['坐化'],
  [DEATH_CAUSE.FIVE_DECLINE]:['天人五衰'],
};


/* ================================================================
 *  二、工具函数
 * ================================================================ */

/** [min,max] 闭区间随机整数 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 随机小数 [0,1) */
function roll() { return Math.random(); }

/** Clamp */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** 概率判定（输入小数 0~1） */
function chance(p) { return Math.random() < p; }

/** 保证最小伤害 */
function minDmg(val) { return Math.max(1, Math.floor(val)); }


/* ================================================================
 *  三、战斗单元包装
 * ================================================================ */

/**
 * 将角色/怪物统一包装为 BattleUnit
 * @param {Object} raw    - 原始对象（Player 或 DATA.MONSTERS 条目）
 * @param {string} side   - 'player' | 'enemy'
 * @param {string} [name] - 自定义名称（怪物名）
 * @param {string} [element] - 主属性（金/木/水/火/土/无）
 */
function makeBattleUnit(raw, side, name, element) {
  return {
    raw,                                  // 原始引用
    side,
    name:   name   || raw.name || '无名',
    element: element || raw.element || '无',

    // 战斗属性（从原始对象读取，若不存在则用 DATA 格式）
    hpMax:   raw.hpMax   ?? raw.hp  ?? 100,
    mpMax:   raw.mpMax   ?? raw.mp  ?? 50,
    atk:     raw.atk     ?? 10,
    def:     raw.def     ?? 5,
    sp:      raw.sp      ?? 10,          // 神识
    speed:   raw.speed   ?? raw.sp ?? 10, // 速度（出手排序用）
    luck:    raw.luck    ?? 10,
    spIntensity: raw.spIntensity ?? (raw.sp ?? 10), // 神识强度（用于神识伤害）
    spResist:    raw.spResist    ?? (raw.def ?? 5),  // 神识抗性
    magicResist: raw.magicResist ?? (raw.def ?? 5),  // 灵力抗性
    realm:   raw.realm   || '练气',

    // 当前战斗状态
    hp:       raw.hpMax   ?? raw.hp  ?? 100,
    mp:       raw.mpMax   ?? raw.mp  ?? 50,
    spCur:    raw.sp      ?? 10,

    // Buff / Debuff 槽
    buffs:   [],   // { name, effectKey, value, duration, stack, maxStack }
    debuffs: [],

    // 战斗临时标记
    isDefending:  false,    // 本回合防御中
    isDead:       false,
    isFrozen:     false,    // 冰冻/麻痹跳过
    isSilenced:   false,    // 沉默（禁用技能）
    isConfused:   false,    // 混乱（20%打自己）
    isStunned:    false,    // 眩晕（跳过回合）

    // 宠物/傀儡关联
    pet:    raw.pet    || null,
    puppet: raw.puppet || null,

    // AI 用
    ai:     side === 'enemy' ? {
      skillPool:    raw.skills ? [raw.skills] : [],
      aggressiveness: raw.aggressiveness ?? 0.5,
      escapeThreshold: raw.escapeThreshold ?? 0.3, // HP 低于此比例考虑逃跑
    } : null,

    // 战败时保命消耗追踪
    lifesavingUsed: [],

    // 掉落（仅敌方）
    drop:   raw.drop  || null,
    expReward: raw.expReward || raw.xpReward || 0,
    stoneReward: raw.stoneReward || 0,
    realmOrder: raw.realmOrder || 1,
  };
}


/* ================================================================
 *  四、元素相克计算
 * ================================================================ */

/**
 * 计算元素克制修正
 * @param {string} atkElem - 攻击方元素
 * @param {string} defElem - 防御方元素
 * @returns {number} 伤害倍率修正（默认 1.0）
 */
function elemBonus(atkElem, defElem) {
  if (atkElem === '无' || defElem === '无') return 1.0;
  // 攻击方克制防御方 → +25%
  if (ELEMENT_WEAKNESS[atkElem] === defElem) return 1 + ELEM_COUNTER_BONUS;
  // 攻击方被防御方克制 → -25%
  if (ELEMENT_WEAKNESS[defElem] === atkElem) return 1 - ELEM_COUNTERED_PENALTY;
  return 1.0;
}


/* ================================================================
 *  五、Battle 类
 * ================================================================ */

class Battle {
  /**
   * @param {Object} DATA - 全局数据常量（js/data.js 导出）
   */
  constructor(DATA) {
    this.D = DATA;

    /** @type {Object|null} 当前战斗状态 */
    this.state = null;

    /** @type {number} 当前回合数 */
    this.round = 0;

    /** @type {Array} 战斗日志 */
    this.log = [];
  }

  // ==================== 初始化 ====================

  /**
   * 初始化一场战斗
   * @param {Object}  player  - Player 实例
   * @param {Array}   enemies - 怪物数组（DATA.MONSTERS 条目 或 自定义对象）
   * @param {Object}  [opts]
   * @param {string}  [opts.terrainElement] - 场地元素加成
   * @param {boolean} [opts.ambush]        - 是否被伏击（敌方先手）
   * @returns {Object} battleState
   */
  init(player, enemies, opts = {}) {
    this.round = 0;
    this.log   = [];

    const playerUnit = makeBattleUnit(player, SIDE.PLAYER);
    // 同步 Player 当前状态
    playerUnit.hp    = player.hpMax;
    playerUnit.mp    = player.mpMax;
    playerUnit.atk   = player.atk;
    playerUnit.def   = player.def;
    playerUnit.sp    = player.sp;
    playerUnit.speed = player.sp;
    playerUnit.luck  = player.luck;
    playerUnit.spIntensity = player.sp;
    playerUnit.spResist    = Math.floor(player.def * 0.5);
    playerUnit.magicResist = Math.floor(player.def * 0.3);

    const enemyUnits = enemies.map((e, i) =>
      makeBattleUnit(e, SIDE.ENEMY, e.name || `敌人${i + 1}`, e.element || '无')
    );

    this.state = {
      player:    playerUnit,
      enemies:   enemyUnits,
      allies:    [playerUnit],          // 友方单位（含灵兽/傀儡）
      order:     [],
      phase:     'active',             // active | victory | defeat | escaped
      ambush:    opts.ambush || false,
      terrainElement: opts.terrainElement || null,
      turnLog:   [],
    };

    this._log(`战斗开始！遭遇 ${enemyUnits.map(e => e.name).join('、')}`);
    return this.state;
  }

  // ==================== 出手顺序 ====================

  /**
   * 计算本回合出手顺序
   * 规则：速度高优先 → 速度相同进攻方优先 → 仍相同随机
   */
  getTurnOrder() {
    const all = [...this.state.allies, ...this.state.enemies]
      .filter(u => !u.isDead);

    all.sort((a, b) => {
      // 速度高的优先
      if (b.speed !== a.speed) return b.speed - a.speed;
      // 速度相同：进攻方优先
      if (a.side !== b.side) {
        return this.state.ambush
          ? (a.side === SIDE.ENEMY ? -1 : 1)  // 伏击：敌方先
          : (a.side === SIDE.PLAYER ? -1 : 1); // 默认：玩家先
      }
      // 同方速度相同随机
      return Math.random() - 0.5 > 0 ? 1 : -1;
    });

    this.state.order = all;
    return all;
  }

  // ==================== 闪避 / 暴击 ====================

  /**
   * 闪避判定
   * 公式：闪避率 = 神识 × 0.15% + 身法功法加成
   * 上限 50%
   * @param {Object} unit - 被攻击单位
   * @param {number} [bodyBonus] - 身法功法加成（小数）
   */
  rollDodge(unit, bodyBonus = 0) {
    let rate = unit.sp * 0.0015 + bodyBonus;
    // 检查 Buff 加成
    const speedBuff = unit.buffs.find(b => b.effectKey === 'dodge');
    if (speedBuff) rate += speedBuff.value;
    rate = clamp(rate, 0, 0.50);

    const dodged = chance(rate);
    if (dodged) this._log(`${unit.name} 闪避了攻击！`);
    return { dodged, rate };
  }

  /**
   * 暴击判定
   * 公式：暴击率 = 机缘 × 0.2% + 功法加成
   * 成功 → 1.5 倍伤害
   * 上限 50%
   * @param {Object} unit  - 攻击单位
   * @param {number} [artBonus] - 功法暴击加成（小数）
   */
  rollCrit(unit, artBonus = 0) {
    let rate = unit.luck * 0.002 + artBonus;
    const critBuff = unit.buffs.find(b => b.effectKey === 'crit');
    if (critBuff) rate += critBuff.value;
    rate = clamp(rate, 0, 0.50);

    const critted = chance(rate);
    if (critted) this._log(`${unit.name} 暴击！伤害 ×1.5`);
    return { critted, rate };
  }

  // ==================== 伤害公式（3种） ====================

  /**
   * 物理伤害
   * 公式：攻击方攻击 × 技能倍率 - 防御方防御 × 0.5
   */
  calcPhysicalDamage(attacker, defender, skillMultiplier = 1.0) {
    const raw = attacker.atk * skillMultiplier - defender.def * 0.5;
    return minDmg(raw);
  }

  /**
   * 法术伤害
   * 公式：攻击方灵力 × 技能倍率 - 防御方灵力抗性 × 0.3
   */
  calcMagicalDamage(attacker, defender, skillMultiplier = 1.0) {
    const raw = attacker.mp * skillMultiplier - defender.magicResist * 0.3;
    return minDmg(raw);
  }

  /**
   * 神识伤害
   * 公式：攻击方神识强度 × 技能倍率 - 防御方神识抗性 × 0.5
   */
  calcDivineDamage(attacker, defender, skillMultiplier = 1.0) {
    const raw = attacker.spIntensity * skillMultiplier - defender.spResist * 0.5;
    return minDmg(raw);
  }

  /**
   * 统一伤害计算入口
   * @param {Object} attacker
   * @param {Object} defender
   * @param {string} dmgType  - 'physical'|'magical'|'divine'
   * @param {number} multiplier - 技能倍率
   * @returns {{ baseDmg: number, finalDmg: number, critted: boolean, elemMod: number }}
   */
  calcDamage(attacker, defender, dmgType, multiplier = 1.0) {
    let baseDmg = 0;
    switch (dmgType) {
      case DMG_TYPE.PHYSICAL:
        baseDmg = this.calcPhysicalDamage(attacker, defender, multiplier);
        break;
      case DMG_TYPE.MAGICAL:
        baseDmg = this.calcMagicalDamage(attacker, defender, multiplier);
        break;
      case DMG_TYPE.DIVINE:
        baseDmg = this.calcDivineDamage(attacker, defender, multiplier);
        break;
      default:
        baseDmg = this.calcPhysicalDamage(attacker, defender, multiplier);
    }

    // 五行克制修正
    const elemMod = elemBonus(attacker.element, defender.element);

    // 暴击判定
    const { critted } = this.rollCrit(attacker);

    // 防御方处于防御状态 → 减伤 50%
    const defendMod = defender.isDefending ? 0.5 : 1.0;

    // Buff / Debuff 修正
    const atkBuffMod = this._getAtkMod(attacker);
    const defDebuffMod = this._getDefMod(defender);

    let finalDmg = baseDmg * elemMod * defendMod * atkBuffMod * defDebuffMod;
    if (critted) finalDmg *= 1.5;

    finalDmg = minDmg(finalDmg);

    if (defender.isDefending) {
      this._log(`${defender.name} 处于防御状态，伤害减半`);
    }

    return { baseDmg, finalDmg, critted, elemMod };
  }

  // ---- 内部修正检索 ----

  /** 攻击方加成（攻击+% Buff） */
  _getAtkMod(unit) {
    let mod = 1.0;
    for (const b of unit.buffs) {
      if (b.effectKey === 'atk') mod += b.value;
    }
    for (const d of unit.debuffs) {
      if (d.effectKey === 'atk_down') mod += d.value; // 负值
    }
    return mod;
  }

  /** 防御方减益（防御-% Debuff） */
  _getDefMod(unit) {
    let mod = 1.0;
    for (const b of unit.buffs) {
      if (b.effectKey === 'def') mod += b.value;
    }
    for (const d of unit.debuffs) {
      if (d.effectKey === 'pierce') mod -= d.value; // 破甲
    }
    return Math.max(0.1, mod);
  }

  // ==================== 执行行动 ====================

  /**
   * 执行一个单位的行动
   * @param {Object} unit    - 行动单位
   * @param {Object} action  - { type, skill, target, item }
   * @returns {Object} 行动结果
   */
  executeAction(unit, action) {
    if (unit.isDead) return { success: false, reason: 'unit_dead' };

    // 状态检查：眩晕/冰冻/麻痹 → 跳过
    if (unit.isStunned || unit.isFrozen) {
      this._log(`${unit.name} 被控，跳过本回合`);
      this._tickControls(unit);
      return { success: true, skipped: true, reason: 'controlled' };
    }

    // 混乱判定：20% 概率打自己
    if (unit.isConfused && chance(0.20)) {
      this._log(`${unit.name} 陷入混乱，攻击了自己！`);
      return this._executeAttack(unit, unit, DMG_TYPE.PHYSICAL, 0.5);
    }

    switch (action.type) {
      case ACTION.ATTACK:
        return this._executeAttack(unit, action.target, DMG_TYPE.PHYSICAL, 1.0);

      case ACTION.SKILL:
        return this._executeSkill(unit, action.target, action.skill);

      case ACTION.ITEM:
        return this._executeItem(unit, action.item);

      case ACTION.DEFEND:
        unit.isDefending = true;
        this._log(`${unit.name} 进入防御姿态（本回合减伤50%）`);
        return { success: true, action: 'defend' };

      case ACTION.ESCAPE:
        return this._executeEscape(unit);

      // AI 行动已映射到 ATTACK/SKILL/DEFEND/ESCAPE

      default:
        return { success: false, reason: 'unknown_action' };
    }
  }

  // ---- 普通攻击 ----

  _executeAttack(attacker, defender, dmgType, multiplier) {
    // 闪避判定
    const { dodged } = this.rollDodge(defender);
    if (dodged) {
      return { success: true, dodged: true, finalDmg: 0 };
    }

    const { finalDmg, critted } = this.calcDamage(attacker, defender, dmgType, multiplier);
    this._applyDamage(defender, finalDmg, attacker);

    return {
      success: true,
      dodged: false,
      critted,
      finalDmg,
      defenderKilled: defender.isDead,
    };
  }

  // ---- 技能释放 ----

  _executeSkill(caster, target, skill) {
    // 沉默判定
    if (caster.isSilenced) {
      this._log(`${caster.name} 被沉默，无法释放技能`);
      return { success: false, reason: 'silenced' };
    }

    // 灵力/神识消耗检查
    if (skill.mpCost && caster.mp < skill.mpCost) {
      this._log(`${caster.name} 灵力不足，无法释放 ${skill.name}`);
      return { success: false, reason: 'no_mp' };
    }
    if (skill.spCost && caster.spCur < skill.spCost) {
      this._log(`${caster.name} 神识不足，无法释放 ${skill.name}`);
      return { success: false, reason: 'no_sp' };
    }

    // 扣除资源
    if (skill.mpCost) caster.mp -= skill.mpCost;
    if (skill.spCost) caster.spCur -= skill.spCost;

    this._log(`${caster.name} 释放 ${skill.name}！`);

    // 确定伤害类型
    const dmgType = skill.dmgType || DMG_TYPE.PHYSICAL;

    // 群体技能
    if (skill.aoe) {
      const targets = caster.side === SIDE.PLAYER
        ? this.state.enemies.filter(e => !e.isDead)
        : this.state.allies.filter(a => !a.isDead);

      const results = targets.map(t => {
        const { dodged } = this.rollDodge(t);
        if (dodged) return { target: t.name, dodged: true, finalDmg: 0 };
        const { finalDmg, critted } = this.calcDamage(caster, t, dmgType, skill.multiplier || 1.0);
        this._applyDamage(t, finalDmg, caster);
        return { target: t.name, dodged: false, critted, finalDmg, killed: t.isDead };
      });

      // 附加 Buff/Debuff（群）
      if (skill.applyBuff) targets.forEach(t => this._attachBuff(t, skill.applyBuff));
      if (skill.applyDebuff) targets.forEach(t => this._attachDebuff(t, skill.applyDebuff));

      return { success: true, aoe: true, results };
    }

    // 单体技能
    // 闪避
    if (!skill.unavoidable) {
      const { dodged } = this.rollDodge(target);
      if (dodged) return { success: true, dodged: true, finalDmg: 0 };
    }

    const { finalDmg, critted } = this.calcDamage(caster, target, dmgType, skill.multiplier || 1.0);
    this._applyDamage(target, finalDmg, caster);

    // 附加 Buff/Debuff
    if (skill.applyBuff)   this._attachBuff(target, skill.applyBuff);
    if (skill.applyDebuff) this._attachDebuff(target, skill.applyDebuff);

    return {
      success: true,
      dodged: false,
      critted,
      finalDmg,
      defenderKilled: target.isDead,
    };
  }

  // ---- 使用物品 ----

  _executeItem(unit, item) {
    if (!item) return { success: false, reason: 'no_item' };

    this._log(`${unit.name} 使用了 ${item.name}`);

    if (item.healHP) {
      unit.hp = Math.min(unit.hpMax, unit.hp + item.healHP);
      this._log(`${unit.name} 恢复 ${item.healHP} HP`);
    }
    if (item.healMP) {
      unit.mp = Math.min(unit.mpMax, unit.mp + item.healMP);
      this._log(`${unit.name} 恢复 ${item.healMP} MP`);
    }
    if (item.buff) this._attachBuff(unit, item.buff);
    if (item.clearDebuff) {
      unit.debuffs = [];
      this._log(`${unit.name} 清除全部负面状态`);
    }

    return { success: true, action: 'item', item: item.name };
  }

  // ---- 逃跑 ----

  _executeEscape(unit) {
    // 逃跑概率 = 机缘 × 0.3% + 身法加成
    let escapeRate = unit.luck * 0.003;
    const bodyBuff = unit.buffs.find(b => b.effectKey === 'escape');
    if (bodyBuff) escapeRate += bodyBuff.value;
    escapeRate = clamp(escapeRate, 0.05, 0.80);

    const escaped = chance(escapeRate);

    if (escaped) {
      this._log(`${unit.name} 逃跑成功！`);
      if (unit.side === SIDE.PLAYER) {
        this.state.phase = 'escaped';
      } else {
        // 敌方逃跑 = 移除
        unit.isDead = true;
        this.state.enemies = this.state.enemies.filter(e => e !== unit);
      }
    } else {
      this._log(`${unit.name} 逃跑失败！`);
    }

    return { success: true, escaped, escapeRate };
  }

  // ---- 伤害结算 ----

  _applyDamage(target, dmg, attacker) {
    target.hp = Math.max(0, target.hp - dmg);
    this._log(`${target.name} 受到 ${dmg} 点伤害（剩余 HP: ${target.hp}/${target.hpMax}）`);

    if (target.hp <= 0) {
      // 先走 6 层保命
      const saved = this._checkLifesaving(target, attacker);
      if (!saved) {
        // 真死了
        target.isDead = true;
        if (target.side === SIDE.PLAYER) {
          this._handlePlayerDeath(target);
        }
        this._log(`${target.name} 被击败！`);
      }
    }
  }

  // ==================== AI 系统 ====================

  /**
   * 修士/怪物 AI 决策
   * @param {Object} unit - 敌方单位
   * @returns {Object} action
   */
  aiDecide(unit) {
    if (unit.side !== SIDE.ENEMY || !unit.ai) return { type: ACTION.PASS };

    const ai = unit.ai;
    const hpRatio = unit.hp / unit.hpMax;
    const player = this.state.player;

    // 1. HP 极低 → 逃跑
    if (hpRatio < ai.escapeThreshold && chance(0.6)) {
      return { type: ACTION.ESCAPE };
    }

    // 2. HP 低且有回血技能 → 加血
    if (hpRatio < 0.35 && ai.skillPool.length > 0) {
      const healSkill = ai.skillPool.find(s => s.healHP || s.type === 'heal');
      if (healSkill && unit.mp >= (healSkill.mpCost || 0)) {
        return { type: ACTION.SKILL, target: unit, skill: healSkill };
      }
    }

    // 3. MP 足够且有强力技能 → 使用技能
    if (ai.skillPool.length > 0 && chance(ai.aggressiveness)) {
      const dmgSkills = ai.skillPool.filter(s => s.damage || s.multiplier);
      if (dmgSkills.length > 0) {
        const skill = dmgSkills[randInt(0, dmgSkills.length - 1)];
        if (unit.mp >= (skill.mpCost || 0)) {
          return { type: ACTION.SKILL, target: player, skill };
        }
      }
    }

    // 4. 概率防御（HP < 50% 时）
    if (hpRatio < 0.5 && chance(0.25)) {
      return { type: ACTION.DEFEND };
    }

    // 5. 默认：普通攻击玩家
    return { type: ACTION.ATTACK, target: player };
  }

  /**
   * 让所有敌方单位自动决策并执行
   * @returns {Array} 执行结果列表
   */
  executeAllAI() {
    const results = [];
    for (const enemy of this.state.enemies) {
      if (enemy.isDead) continue;
      const action = this.aiDecide(enemy);
      const result = this.executeAction(enemy, action);
      results.push({ unit: enemy.name, action, result });
    }
    return results;
  }

  // ==================== Buff / Debuff ====================

  /**
   * 附加 Buff
   * @param {Object} unit
   * @param {{ name, effectKey, value, duration, maxStack }} buffDef
   */
  _attachBuff(unit, buffDef) {
    if (!buffDef) return;

    const existing = unit.buffs.find(b => b.name === buffDef.name);
    if (existing) {
      // 刷新持续回合 / 叠层
      existing.duration = buffDef.duration || 3;
      const maxStack = buffDef.maxStack || 1;
      if (existing.stack < maxStack) {
        existing.stack++;
      }
    } else {
      unit.buffs.push({
        name:      buffDef.name,
        effectKey: buffDef.effectKey || 'general',
        value:     buffDef.value || 0,
        duration:  buffDef.duration || 3,
        stack:     1,
        maxStack:  buffDef.maxStack || 1,
      });
    }
    this._log(`${unit.name} 获得 Buff: ${buffDef.name}`);
  }

  /**
   * 附加 Debuff
   */
  _attachDebuff(unit, debuffDef) {
    if (!debuffDef) return;

    // 特殊处理：部分 Debuff 有状态标记
    if (debuffDef.effectKey === 'freeze') unit.isFrozen = true;
    if (debuffDef.effectKey === 'silence') unit.isSilenced = true;
    if (debuffDef.effectKey === 'confuse') unit.isConfused = true;
    if (debuffDef.effectKey === 'stun')   unit.isStunned = true;

    const existing = unit.debuffs.find(d => d.name === debuffDef.name);
    if (existing) {
      existing.duration = debuffDef.duration || 3;
      const maxStack = debuffDef.maxStack || 1;
      if (existing.stack < maxStack) existing.stack++;
    } else {
      unit.debuffs.push({
        name:      debuffDef.name,
        effectKey: debuffDef.effectKey || 'general',
        value:     debuffDef.value || 0,
        duration:  debuffDef.duration || 3,
        stack:     1,
        maxStack:  debuffDef.maxStack || 1,
        dot:       debuffDef.dot || 0,      // 每回合扣血百分比
        mpDrain:   debuffDef.mpDrain || 0,   // 每回合扣蓝百分比
      });
    }
    this._log(`${unit.name} 被施加 ${debuffDef.name}`);
  }

  /**
   * 回合结束时 Tick 所有 Buff/Debuff
   *   - 剩余回合 -1
   *   - 归零自动移除
   *   - DOT 伤害结算
   */
  tickBuffs(unit) {
    // Buff 倒计时
    unit.buffs = unit.buffs.filter(b => {
      b.duration--;
      if (b.duration <= 0) {
        this._log(`${unit.name} 的 ${b.name} 效果消失`);
        return false;
      }
      return true;
    });

    // Debuff 倒计时 + DOT
    unit.debuffs = unit.debuffs.filter(d => {
      d.duration--;

      // DOT 伤害
      if (d.dot > 0 && unit.hp > 0) {
        const dotDmg = Math.floor(unit.hpMax * d.dot * d.stack);
        unit.hp = Math.max(0, unit.hp - dotDmg);
        this._log(`${unit.name} 受到 ${d.name} 持续伤害 ${dotDmg} 点`);
      }

      // MP 流失
      if (d.mpDrain > 0 && unit.mp > 0) {
        const mpLoss = Math.floor(unit.mpMax * d.mpDrain * d.stack);
        unit.mp = Math.max(0, unit.mp - mpLoss);
      }

      if (d.duration <= 0) {
        // 清除状态标记
        this._clearDebuffFlags(unit, d);
        this._log(`${unit.name} 的 ${d.name} 状态解除`);
        return false;
      }
      return true;
    });

    // DOT 致死 → 触发保命检查
    if (unit.hp <= 0 && !unit.isDead) {
      const saved = this._checkLifesaving(unit, null);
      if (!saved) {
        unit.isDead = true;
        if (unit.side === SIDE.PLAYER) {
          this._handlePlayerDeath(unit);
        }
      }
    }
  }

  /** 清除 Debuff 对应的状态标记 */
  _clearDebuffFlags(unit, debuff) {
    if (debuff.effectKey === 'freeze' && !unit.debuffs.some(d => d !== debuff && d.effectKey === 'freeze'))
      unit.isFrozen = false;
    if (debuff.effectKey === 'silence' && !unit.debuffs.some(d => d !== debuff && d.effectKey === 'silence'))
      unit.isSilenced = false;
    if (debuff.effectKey === 'confuse' && !unit.debuffs.some(d => d !== debuff && d.effectKey === 'confuse'))
      unit.isConfused = false;
    if (debuff.effectKey === 'stun' && !unit.debuffs.some(d => d !== debuff && d.effectKey === 'stun'))
      unit.isStunned = false;
  }

  /** 重置控制状态（被控跳过后清除） */
  _tickControls(unit) {
    // 单回合控制 → 下回合自动恢复
    unit.isFrozen   = false;
    unit.isStunned  = false;
  }

  // ==================== 6 层保命 ====================

  /**
   * 检查并触发保命手段（HP 归零时）
   * 顺序：
   *   ① 涅槃 Buff → 消耗恢复 50% HP
   *   ② 背包有涅槃丹/轮回替身符 → 消耗，满状态复活
   *   ③ 掌天瓶绿液 ≥3 滴 → 消耗 3 滴，恢复 25% HP
   *   ④ 梵圣真魔功·肉身重生 → 30% 概率恢复 30% HP
   *   ⑤ 灵兽挡刀 → 灵兽承受，完整度 -30%
   *   ⑥ 全无 → 战败
   *
   * @param {Object} unit     - 濒死单位
   * @param {Object} attacker - 攻击者（可为 null）
   * @returns {boolean} 是否被救回
   */
  _checkLifesaving(unit, attacker) {
    // ① 涅槃 Buff
    const nirvanaBuff = unit.buffs.find(b => b.effectKey === 'nirvana');
    if (nirvanaBuff) {
      unit.hp = Math.floor(unit.hpMax * 0.50);
      unit.buffs = unit.buffs.filter(b => b !== nirvanaBuff);
      unit.lifesavingUsed.push('涅槃Buff');
      this._log(`★★★ ${unit.name} 涅槃重生！恢复 50% HP ★★★`);
      return true;
    }

    // ② 背包涅槃丹/轮回替身符
    if (unit.raw && unit.raw.inventory) {
      const pill = unit.raw.inventory.find(i => i.name === '涅槃丹' || i.name === '轮回替身符');
      if (pill) {
        unit.raw.inventory = unit.raw.inventory.filter(i => i !== pill);
        unit.hp = unit.hpMax;
        unit.mp = unit.mpMax;
        unit.lifesavingUsed.push(pill.name);
        this._log(`★★★ ${unit.name} 使用 ${pill.name} 满状态复活！★★★`);
        return true;
      }
    }

    // ③ 掌天瓶绿液 ≥3 滴
    if (unit.raw && unit.raw.greenLiquid !== undefined && unit.raw.greenLiquid >= 3) {
      unit.raw.greenLiquid -= 3;
      unit.hp = Math.floor(unit.hpMax * 0.25);
      unit.lifesavingUsed.push('掌天瓶绿液×3');
      this._log(`★★★ ${unit.name} 消耗 3 滴绿液恢复 25% HP ★★★`);
      return true;
    }

    // ④ 梵圣真魔功·肉身重生 30%
    const bodyRebirth = unit.buffs.find(b => b.effectKey === 'bodyRebirth');
    if (bodyRebirth && chance(0.30)) {
      unit.hp = Math.floor(unit.hpMax * 0.30);
      unit.lifesavingUsed.push('肉身重生');
      this._log(`★★★ ${unit.name} 肉身重生！恢复 30% HP ★★★`);
      return true;
    }

    // ⑤ 灵兽挡刀
    if (unit.pet && !unit.pet.isDead) {
      unit.pet.integrity = (unit.pet.integrity || 100) - 30;
      if (unit.pet.integrity <= 0) {
        unit.pet.isDead = true;
        this._log(`💔 ${unit.pet.name} 为 ${unit.name} 挡刀而濒死`);
      } else {
        this._log(`🐾 ${unit.pet.name} 为 ${unit.name} 挡下致命一击（完整度-30%）`);
      }
      unit.hp = 1; // 存活但只剩 1 HP
      unit.lifesavingUsed.push('灵兽挡刀');
      return true;
    }

    // ⑥ 全无 → 战败
    this._log(`☠ ${unit.name} 所有保命手段用尽，战败！`);
    return false;
  }

  // ==================== 战败处理 ====================

  /**
   * 玩家战败处理
   *   灵石 -10% / 传送回城 / 重伤Debuff / 灵兽傀儡濒死
   */
  _handlePlayerDeath(unit) {
    const player = unit.raw;
    if (!player) return;

    this.state.phase = 'defeat';

    // 灵石扣除 10%
    const lost = Math.floor((player.spiritStones || 0) * 0.10);
    player.spiritStones = (player.spiritStones || 0) - lost;
    this._log(`💰 灵石扣除 ${lost}（剩余 ${player.spiritStones}）`);

    // 重伤 Debuff：修炼速度 -50%，持续 3 天
    this._log(`💀 重伤：修炼速度-50%，持续3天`);

    // 灵兽/傀儡濒死
    if (player.pet) {
      player.pet.hp = 1;
      player.pet.isDying = true;
      this._log(`🐾 灵兽 ${player.pet.name} 濒死`);
    }
    if (player.puppet) {
      player.puppet.hp = 1;
      player.puppet.isDying = true;
      this._log(`🤖 傀儡濒死`);
    }

    // 寿元归零 → 强制陨落
    if (player.lifespan !== undefined && player.lifespan <= 0) {
      this._log(`⏳ 寿元归零，强制触发陨落事件`);
      return this._triggerFalling(unit, DEATH_CAUSE.LIFESPAN);
    }

    return this._triggerFalling(unit, DEATH_CAUSE.BATTLE_LOSS);
  }

  /**
   * 触发陨落事件
   * @returns {{ deathCause: string, outcomes: string[] }}
   */
  _triggerFalling(unit, cause) {
    const outcomes = DEATH_OUTCOMES[cause] || [];
    this._log(`☠ 陨落原因: ${cause}，可选结局: ${outcomes.join(' / ')}`);
    return { deathCause: cause, outcomes };
  }

  // ==================== 回合流程 ====================

  /**
   * 执行完整一回合
   *   1. 确定出手顺序
   *   2. 每个单位依次行动（玩家需外部提供 action，敌方可自动 AI）
   *   3. 回合结束 → Tick Buff/Debuff
   *   4. 检查战斗结束
   *
   * @param {Object} [playerAction] - 玩家本回合行动 { type, skill?, target?, item? }
   * @returns {Object} 回合结果
   */
  doRound(playerAction) {
    this.round++;
    this.state.turnLog = [];
    this._log(`===== 第 ${this.round} 回合 =====`);

    // 1. 出手顺序
    const order = this.getTurnOrder();

    // 2. 单位行动
    for (const unit of order) {
      if (unit.isDead) continue;

      // 重置防御标记
      unit.isDefending = false;

      let action;
      if (unit.side === SIDE.PLAYER) {
        action = playerAction || { type: ACTION.ATTACK, target: this.state.enemies.find(e => !e.isDead) };
      } else {
        action = this.aiDecide(unit);
      }

      const result = this.executeAction(unit, action);
      this.state.turnLog.push({ unit: unit.name, side: unit.side, action, result });

      // 每行动后检查战斗结束
      if (this.state.phase !== 'active') break;
    }

    // 3. 回合结束 → Buff/Debuff 倒计时
    for (const unit of [...this.state.allies, ...this.state.enemies]) {
      if (!unit.isDead) this.tickBuffs(unit);
    }

    // 灵力自然恢复
    for (const unit of [...this.state.allies, ...this.state.enemies]) {
      if (!unit.isDead) {
        const regen = Math.floor(unit.mpMax * 0.05);
        unit.mp = Math.min(unit.mpMax, unit.mp + regen);
      }
    }

    // 4. 检查战斗结束
    const endResult = this.checkEnd();

    return {
      round: this.round,
      phase: this.state.phase,
      turnLog: this.state.turnLog,
      endResult,
    };
  }

  /**
   * 战斗结束检查
   *   敌方全灭 → 胜利
   *   玩家死亡 → 失败（触发陨落）
   */
  checkEnd() {
    // 胜利判定
    const aliveEnemies = this.state.enemies.filter(e => !e.isDead);
    if (aliveEnemies.length === 0) {
      this.state.phase = 'victory';
      const rewards = this._calcRewards();
      this._log(`🏆 战斗胜利！获得修为 ${rewards.exp} / 灵石 ${rewards.stones}`);
      return { ended: true, result: 'victory', rewards };
    }

    // 失败判定
    if (this.state.player.isDead) {
      this.state.phase = 'defeat';
      return { ended: true, result: 'defeat', deathCause: this.state.player.lifesavingUsed.length === 0
        ? DEATH_CAUSE.BATTLE_LOSS : null };
    }

    return { ended: false, result: 'ongoing' };
  }

  // ==================== 战斗奖励 ====================

  /**
   * 计算胜利奖励
   *   修为 + 灵石 + 掉落物品（按敌人品阶）
   */
  _calcRewards() {
    let totalExp   = 0;
    let totalStones = 0;
    const drops     = [];

    for (const enemy of this.state.enemies) {
      // 基础修为 = HP/10
      totalExp += Math.floor(enemy.hpMax / 10) + (enemy.expReward || 0);
      totalStones += enemy.stoneReward || Math.floor(enemy.hpMax / 20);

      // 掉落
      if (enemy.drop) {
        const dropRate = parseFloat(enemy.drop.match(/(\d+)%/)?.[1]) || 50;
        if (chance(dropRate / 100)) {
          const itemName = enemy.drop.replace(/\d+%/, '').trim();
          drops.push(itemName);
        }
      }
    }

    return { exp: totalExp, stones: totalStones, drops };
  }

  // ==================== 快捷接口 ====================

  /**
   * 获取当前存活敌人列表
   */
  getAliveEnemies() {
    return this.state ? this.state.enemies.filter(e => !e.isDead) : [];
  }

  /**
   * 获取玩家战斗单元
   */
  getPlayerUnit() {
    return this.state ? this.state.player : null;
  }

  /**
   * 战斗是否已结束
   */
  isEnded() {
    return this.state && this.state.phase !== 'active';
  }

  /**
   * 获取战斗摘要
   */
  getSummary() {
    if (!this.state) return null;
    return {
      phase:    this.state.phase,
      round:    this.round,
      playerHP: this.state.player.hp,
      playerMP: this.state.player.mp,
      enemies:  this.state.enemies.map(e => ({
        name: e.name, hp: e.hp, hpMax: e.hpMax, isDead: e.isDead,
      })),
    };
  }

  // ==================== 日志 ====================

  _log(msg) {
    this.log.push(`[回合${this.round}] ${msg}`);
  }

  /** 获取完整战斗日志 */
  getLog() { return [...this.log]; }

  /** 清空日志 */
  clearLog() { this.log = []; }

  /** 获取最近 N 条日志 */
  recentLog(n = 10) {
    return this.log.slice(-n);
  }
}


/* ================================================================
 *  六、导出
 * ================================================================ */


// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Battle = Battle;
  window.DEATH_CAUSE = DEATH_CAUSE;
  window.DEATH_OUTCOMES = DEATH_OUTCOMES;
}

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Battle, DEATH_CAUSE, DEATH_OUTCOMES, DMG_TYPE, ACTION, SIDE, ELEMENT_WEAKNESS, ELEMENT_STRENGTH };
}
