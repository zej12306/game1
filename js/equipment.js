/**
 * 凡人修仙传·模拟器 — 法宝 & 背包系统
 * 依赖：DATA (from data.js)
 * 导出：Equipment, Inventory
 */

const { DATA } = require('./data.js');

// ============================================================
// 常量定义
// ============================================================

/** 8种法宝类型 */
const EQUIP_TYPES = {
  攻击型:  { slug: 'attack',  desc: '飞剑/金环/雷锤' },
  防御型:  { slug: 'defense', desc: '宝甲/古盾/金钟' },
  辅助型:  { slug: 'support', desc: '聚灵盘/回春佩' },
  飞行型:  { slug: 'flight',  desc: '飞行舟/遁天梭' },
  空间型:  { slug: 'space',   desc: '乾坤袋/虚天鼎' },
  阵法型:  { slug: 'array',   desc: '阵旗/阵盘' },
  神识型:  { slug: 'spirit',  desc: '天罗镜/养魂木簪' },
  特殊型:  { slug: 'special', desc: '掌天瓶等' }
};

/** 8种背包物品类别 */
const ITEM_CATEGORIES = {
  材料: { stackable: true,  weightId: null,  desc: '灵草/矿石/兽骨·可堆叠' },
  丹药: { stackable: true,  weightId: '丹药', desc: '培元丹/聚气散·可堆叠' },
  法宝: { stackable: false, weightId: null,  desc: '单独·不可堆叠' },
  功法: { stackable: false, weightId: null,  desc: '不可堆叠·学到后消失' },
  符箓: { stackable: true,  weightId: '符箓', desc: '火球符/金刚符·可堆叠' },
  灵石: { stackable: true,  weightId: '灵石', desc: '不占负重' },
  杂物: { stackable: true,  weightId: null,  desc: '视情况可堆叠' },
  绿液: { stackable: true,  weightId: null,  desc: '不占负重·单独存放' }
};

// ============================================================
// 36 个法宝事件池
// ============================================================

const EQUIPMENT_EVENTS = {
  /** 探索触发（18个） */
  explore: [
    { id: 'ancient_cave',      name: '古修洞府',   effect: '触发一次遗迹探索·可能发现法宝' },
    { id: 'broken_sword',      name: '残剑插山',   effect: '拔出判定·成功得随机古宝·失败受伤' },
    { id: 'underground_sword', name: '地下剑鸣',   effect: '挖掘·高概率获得灵器级飞剑' },
    { id: 'auction_invite',    name: '拍卖会请柬', effect: '获得拍卖会入场资格一次' },
    { id: 'master_recruit',    name: '炼器宗师收徒', effect: '炼器术+3级或得稀有图纸' },
    { id: 'meteor_iron',       name: '天降陨铁',   effect: '获得一块顶级炼器材料' },
    { id: 'ancient_battlefield',name:'古战场遗迹',  effect: '探索·概率获得古宝碎片/随机法宝' },
    { id: 'sea_volcano',       name: '海底火山',   effect: '采集·得火属性炼器材料+可能遭遇妖兽' },
    { id: 'spirit_cry',        name: '器灵求救',   effect: '帮助器灵·成功=古宝认主·失败=神识受损' },
    { id: 'wanbaolou',         name: '万宝楼拍卖会',effect:'特殊拍卖会·可竞拍古宝~通天灵宝' },
    { id: 'ancient_teleport',  name: '上古传送阵', effect: '传送到随机隐藏地图·必有法宝线索' },
    { id: 'yao_craft',         name: '妖族炼器',   effect: '与妖族交换炼器术·习得异火炼器法' },
    { id: 'thunder_ash',       name: '雷劫余烬',   effect: '获得雷劫淬炼材料·提升法宝品质' },
    { id: 'secret_wall',       name: '秘境石壁',   effect: '石壁刻有炼器心得·炼器术+2级' },
    { id: 'wandering_seller',  name: '游方修士兜售',effect:'随机出售法宝·可能捡漏或被骗' },
    { id: 'weapon_move',       name: '本命法宝异动',effect:'本命法宝自主反应·可能提前成长一次' },
    { id: 'enemy_chase',       name: '仇家追来',   effect: '战斗或交出法宝·胜则得对方法宝' },
    { id: 'yingli_island',     name: '婴鲤岛',     effect: '海外寻宝·可能发现通天灵宝线索' }
  ],

  /** 温养/炼制触发（10个） */
  nurture: [
    { id: 'resonance_trig',    name: '法宝共鸣',   effect: '同属性法宝间产生·临时属性小幅提升' },
    { id: 'fire_rampage',      name: '异火暴动',   effect: '炼制中断·如不压制全毁' },
    { id: 'spirit_awaken',     name: '器灵初醒',   effect: '炼制/温养中器灵觉醒·法宝品质提升' },
    { id: 'material_short',    name: '材料不够',   effect: '炼制中材料不足·可临时替代或延期' },
    { id: 'tribulation_sense', name: '天劫感应',   effect: '温养引发天劫关注·提前渡劫或放弃' },
    { id: 'heartblood',        name: '心血来潮',   effect: '突然领悟·温养成长值+10~25%' },
    { id: 'twin_sword',        name: '双剑合璧',   effect: '两件剑类法宝融合效果翻倍·仅一次机会' },
    { id: 'unseal_ancient',    name: '古宝解封',   effect: '温养中古宝封印自动松动一层' },
    { id: 'weapon_devour',     name: '法宝吞噬',   effect: '一件法宝吞噬另一件·继承30%属性' },
    { id: 'craft_explode',     name: '炼制大爆',   effect: '炼制失败·材料全毁+炼器台损坏' }
  ],

  /** 日常交互（8个） */
  daily: [
    { id: 'borrow_weapon',     name: '同门借宝',   effect: 'NPC借用法宝·还或不还影响好感' },
    { id: 'ban_weapon',        name: '法宝禁用',   effect: '某些区域法宝功能被封印·需用肉身' },
    { id: 'black_market',      name: '黑市寻宝',   effect: '非法交易·可能买到禁器或被骗' },
    { id: 'sword_tournament',  name: '论剑大会',   effect: '法宝比试·胜者得对手法宝一件' },
    { id: 'weapon_eyed',       name: '法宝被觊觎', effect: '高阶修士盯上你的法宝·可能被追杀' },
    { id: 'spirit_tide',       name: '灵气潮汐',   effect: '所有法宝温养速度翻倍×持续7天' },
    { id: 'craft_tournament',  name: '炼器大赛',   effect: '宗门炼器比赛·奖励稀有图纸或材料' },
    { id: 'weapon_night',      name: '法宝通灵夜', effect: '满月之夜·法宝自主交流·概率产生共鸣组合' }
  ]
};

// ============================================================
// 韩立 · 青竹蜂云剑特殊规则
// ============================================================

const HANLI_SWORD = {
  baseName: '青竹蜂云剑',
  // 每把剑的品阶成长线
  growthPath: [
    { level: 1, rank: '法器', unlock: '筑基',   atkPerSword: 15 },
    { level: 2, rank: '灵器', unlock: '金丹',   atkPerSword: 35 },
    { level: 3, rank: '法宝', unlock: '元婴',   atkPerSword: 65 },
    { level: 4, rank: '古宝', unlock: '化神',   atkPerSword: 120 },
    { level: 5, rank: '玄天之宝', unlock: '炼虚', atkPerSword: 300 },
    { level: 6, rank: '通天灵宝', unlock: '大乘', atkPerSword: 800 }
  ],
  // 剑阵效果（基于持有数量）
  formation: [
    { range: [1, 3],    name: '单体攻击',   multiplier: 1.0, desc: '每次攻击单把剑结算' },
    { range: [4, 9],    name: '小型剑阵',   multiplier: 1.5, desc: '4~9把可布小型剑阵' },
    { range: [10, 36],  name: '中型剑阵',   multiplier: 3.0, desc: '10~36把·剑阵威力显著' },
    { range: [37, 71],  name: '大型剑阵',   multiplier: 5.0, desc: '37~71把·剑势浩大' },
    { range: [72, 72],  name: '大庚剑阵',   multiplier: 8.0, desc: '72把完整·群攻神威' }
  ]
};

// ============================================================
// 法宝共鸣组合
// ============================================================

const RESONANCE_COMBOS = [
  {
    name: '剑气护体',
    items: ['青竹蜂云剑', '虚天鼎'],
    effect: { def: '+10%' },
    desc: '青竹蜂云剑+虚天鼎→剑气护体'
  },
  {
    name: '大庚剑阵',
    items: ['青竹蜂云剑', '青竹蜂云剑', '青竹蜂云剑'], // 72把
    trigger: (slots) => slots.filter(s => s && s.name === '青竹蜂云剑').length >= 72,
    effect: { formation: '大庚剑阵', atkMultiplier: 8 },
    desc: '72口青竹蜂云剑→大庚剑阵'
  },
  {
    name: '五行轮转',
    items: [], // 任意5件同属性古宝
    trigger: (slots) => {
      const attrCount = {};
      let combo = false;
      slots.filter(Boolean).filter(s => s.rank === '古宝').forEach(s => {
        if (s.element) attrCount[s.element] = (attrCount[s.element] || 0) + 1;
      });
      return Object.values(attrCount).some(c => c >= 5);
    },
    effect: { allStats: '+15%', element: '五行' },
    desc: '五件同属性古宝→五行轮转大阵'
  }
];

// ============================================================
// ======================== Equipment =========================
// ============================================================

class Equipment {
  /**
   * @param {object} player - 玩家对象 { realm, subStage }（至少含境界信息）
   */
  constructor(player) {
    this.player = player;
    this._data = DATA.EQUIPMENT;
    this._rankChain = this._data.rankChain;           // 8品阶
    this._subRanks = this._data.subRanks;             // 下/中/上/极品

    /** @type {Array<object|null>} 当前装备栏 */
    this.equipped = [];

    /** @type {object|null} 本命法宝 */
    this.lifeWeapon = null;

    /** @type {number} 第二本命法宝开启境界后可用 */
    this.secondLifeWeapon = null;

    /** @type {Array<object>} 持有的储物法宝 */
    this.storageItems = [];

    /** @type {object} 当前栏位上限 */
    this._updateSlots();
  }

  // ──────────────── 栏位管理 ────────────────

  /** 根据当前境界刷新栏位上限 */
  _updateSlots() {
    const realm = this.player.realm || '凡人';
    const slots = this._data.equipmentSlots[realm];
    if (!slots) throw new Error(`未知境界: ${realm}`);
    this.maxLifeWeapons = slots.本命;
    this.maxEquipped = slots.装备;
    this.maxStorageItems = slots.储物;
  }

  /** 返回当前栏位状态 { 本命: [cur, max], 装备: [cur, max], 储物: [cur, max] } */
  getSlots() {
    return {
      本命: { used: (this.lifeWeapon ? 1 : 0) + (this.secondLifeWeapon ? 1 : 0), max: this.maxLifeWeapons },
      装备: { used: this.equipped.filter(Boolean).length, max: this.maxEquipped },
      储物: { used: this.storageItems.length, max: this.maxStorageItems }
    };
  }

  /**
   * 装备一件法宝
   * @param {object} item 法宝对象
   * @returns {{ success: boolean, message: string }}
   */
  equip(item) {
    if (this.equipped.filter(Boolean).length >= this.maxEquipped) {
      return { success: false, message: `装备栏已满(${this.maxEquipped})` };
    }
    for (let i = 0; i < this.maxEquipped; i++) {
      if (!this.equipped[i]) {
        this.equipped[i] = item;
        return { success: true, message: `${item.name} 已装备到栏位${i + 1}` };
      }
    }
    return { success: false, message: '装备失败' };
  }

  /**
   * 卸下一件法宝
   * @param {number|string} slot - 栏位号(1-based) 或法宝名称
   */
  unequip(slot) {
    if (typeof slot === 'number') {
      const idx = slot - 1;
      if (idx < 0 || idx >= this.maxEquipped || !this.equipped[idx]) {
        return { success: false, message: '该栏位无装备' };
      }
      const item = this.equipped[idx];
      this.equipped[idx] = null;
      return { success: true, message: `${item.name} 已卸下`, item };
    }
    // 按名称找
    const idx = this.equipped.findIndex(e => e && e.name === slot);
    if (idx === -1) return { success: false, message: `未装备 ${slot}` };
    const item = this.equipped[idx];
    this.equipped[idx] = null;
    return { success: true, message: `${item.name} 已卸下`, item };
  }

  /** 获取所有装备属性的总和 */
  getEquippedStats() {
    const stats = { atk: 0, def: 0, sp: 0, mpMax: 0, mpRec: 0, speed: 0, dmgRed: 0, crit: 0 };
    this.equipped.filter(Boolean).forEach(item => {
      Object.keys(stats).forEach(k => {
        if (item[k] != null) stats[k] += item[k];
      });
    });
    return stats;
  }

  // ──────────────── 品阶工具 ────────────────

  /** 获取品阶在链中的索引 */
  getRankIndex(rank) {
    const idx = this._rankChain.indexOf(rank);
    return idx >= 0 ? idx : -1;
  }

  /** 获取子品阶索引 (下=0, 中=1, 上=2, 极=3) */
  getSubRankIndex(sub) {
    return this._subRanks.indexOf(sub);
  }

  /** 比较两件法宝品阶高下：正数=item1高 */
  compareRank(item1, item2) {
    const r1 = this._rankChain.indexOf(item1.rank);
    const r2 = this._rankChain.indexOf(item2.rank);
    if (r1 !== r2) return r1 - r2;
    const s1 = item1.sub ? this._subRanks.indexOf(item1.sub) : 0;
    const s2 = item2.sub ? this._subRanks.indexOf(item2.sub) : 0;
    return s1 - s2;
  }

  // ──────────────── 本命法宝 ────────────────

  /**
   * 绑定本命法宝
   * @param {object} item 法宝对象
   */
  bindLifeWeapon(item) {
    if (this.lifeWeapon && this.maxLifeWeapons < 2) {
      return { success: false, message: '已有本命法宝，更换代价极大。确定要换？(调用 forceBindLifeWeapon)' };
    }
    if (!this.lifeWeapon) {
      this.lifeWeapon = { ...item, growth: 0, proficiency: 0 };
      return { success: true, message: `${item.name} 已成为本命法宝` };
    }
    if (this.maxLifeWeapons >= 2 && !this.secondLifeWeapon) {
      this.secondLifeWeapon = { ...item, growth: 0, proficiency: 0 };
      return { success: true, message: `${item.name} 成为第二本命法宝` };
    }
    return { success: false, message: '本命法宝栏位已满' };
  }

  /** 强制更换本命法宝（代价：S级惩罚） */
  forceBindLifeWeapon(item) {
    const old = this.lifeWeapon;
    this.lifeWeapon = { ...item, growth: 0, proficiency: 0 };
    return {
      success: true,
      message: `强制更换本命法宝：${old.name} → ${item.name}`,
      penalty: { hpLoss: '30%最大气血', spiritDmg: '神识重创', oldLost: old }
    };
  }

  /**
   * 温养本命法宝
   * @param {number} meditationDays - 当前境界打坐天数
   * @returns {{ growthGain: number, profGain: number, message: string }}
   */
  nurtureLifeWeapon(meditationDays) {
    if (!this.lifeWeapon) return { success: false, message: '没有本命法宝' };
    const days = meditationDays * this._data.nurture.daysFactor;
    const [minG, maxG] = this._data.nurture.growthRange;
    const growthGain = Math.floor(Math.random() * (maxG - minG + 1) + minG);
    const [minP, maxP] = this._data.nurture.proficiencyRange;
    const profGain = Math.floor(Math.random() * (maxP - minP + 1) + minP);
    this.lifeWeapon.growth = Math.min(100, (this.lifeWeapon.growth || 0) + growthGain);
    this.lifeWeapon.proficiency = (this.lifeWeapon.proficiency || 0) + profGain;
    return {
      success: true,
      daysUsed: days,
      growthGain, profGain,
      currentGrowth: this.lifeWeapon.growth,
      currentProficiency: this.lifeWeapon.proficiency,
      message: `温养完成：成长+${growthGain}% 熟练+${profGain}`
    };
  }

  /**
   * 本命法宝尝试突破品阶
   * @returns {{ success: boolean, result: string, newSub?: string }}
   */
  breakthroughLifeWeapon() {
    if (!this.lifeWeapon) return { success: false, message: '没有本命法宝' };
    if ((this.lifeWeapon.growth || 0) < 100) {
      return { success: false, message: `成长值不足(${this.lifeWeapon.growth}%)，需要100%` };
    }
    const roll = Math.random();
    // 成功→升子品阶 / 大成功→跨品质 / 失败→归零
    if (roll < 0.70) {
      // 下→中 / 中→上 / 上→极 / 极→不升
      const curIdx = this._subRanks.indexOf(this.lifeWeapon.sub);
      if (curIdx < 3) {
        this.lifeWeapon.sub = this._subRanks[curIdx + 1];
        this.lifeWeapon.growth = 0;
        return { success: true, result: '升级', newSub: this.lifeWeapon.sub, message: `突破成功！→ ${this.lifeWeapon.sub}` };
      }
      this.lifeWeapon.growth = 0;
      return { success: true, result: '已达极品', message: '已达极品·无法再升' };
    } else if (roll < 0.85) {
      // 大成功：跨品质
      const curRankIdx = this._rankChain.indexOf(this.lifeWeapon.rank);
      if (curRankIdx < this._rankChain.length - 1) {
        this.lifeWeapon.rank = this._rankChain[curRankIdx + 1];
        this.lifeWeapon.sub = '下品';
      } else if (this.lifeWeapon.sub !== '极品') {
        const curSub = this._subRanks.indexOf(this.lifeWeapon.sub);
        this.lifeWeapon.sub = this._subRanks[Math.min(3, curSub + 2)];
      }
      this.lifeWeapon.growth = 0;
      return { success: true, result: '大成功', newRank: this.lifeWeapon.rank, newSub: this.lifeWeapon.sub, message: `大成功！跨越品质→ ${this.lifeWeapon.rank}·${this.lifeWeapon.sub}` };
    } else {
      // 失败
      this.lifeWeapon.growth = 0;
      return { success: false, result: '失败', message: '突破失败·成长值归零' };
    }
  }

  // ──────────────── 炼制系统 ────────────────

  /**
   * 炼制法宝
   * @param {string} itemName - 目标法宝名称（从catalog找）
   * @param {number} craftSkill - 炼器术等级
   * @param {boolean} hasSpecialFire - 是否拥有异火
   * @param {number} bonusDays - 额外消耗天数
   * @returns {{ success: boolean, result?: object, message: string }}
   */
  craft(itemName, craftSkill = 0, hasSpecialFire = false, bonusDays = 0) {
    // 从图谱中查找
    let blueprint = null;
    for (const rank of Object.values(this._data.catalog)) {
      const found = rank.find(i => i.name === itemName);
      if (found) { blueprint = found; break; }
    }
    if (!blueprint) return { success: false, message: `未找到 ${itemName} 的图谱` };

    // 计算成功概率
    let failRate = this._data.craftProbabilities['失败'] * 100;
    failRate = Math.max(0, failRate - craftSkill * 2);
    if (hasSpecialFire) failRate = Math.max(0, failRate - 5);

    const probabilities = {
      失败: failRate / 100,
      下品: (this._data.craftProbabilities['下品'] * 100 + craftSkill * 1) / 100,
      中品: (this._data.craftProbabilities['中品'] * 100 + craftSkill * 0.8) / 100,
      上品: (this._data.craftProbabilities['上品'] * 100 + craftSkill * 0.5) / 100,
      极品: (this._data.craftProbabilities['极品'] * 100 + craftSkill * 0.3) / 100
    };

    const roll = Math.random();
    let cumulative = 0;
    let result = '失败';
    for (const [grade, prob] of Object.entries(probabilities)) {
      cumulative += prob;
      if (roll < cumulative) { result = grade; break; }
    }

    return {
      success: result !== '失败',
      result,
      item: result !== '失败' ? { ...blueprint, sub: result === '极品' ? '极' : result === '上品' ? '上' : result === '中品' ? '中' : '下' } : null,
      days: bonusDays,
      message: result === '失败' ? '炼制失败·材料全毁' : `炼制成功！${blueprint.name}·${result}`
    };
  }

  // ──────────────── 法宝融合 ────────────────

  /**
   * 融合两件同品阶法宝
   * @returns {{ success: boolean, result: string, newItem?: object, message: string }}
   */
  fusion(item1, item2) {
    if (item1.rank !== item2.rank) {
      return { success: false, message: '只能融合同品阶法宝' };
    }
    const roll = Math.random();
    const probs = this._data.fusionProbabilities; // 成功/部分融合/失败

    if (roll < probs['成功']) {
      // 两者属性相加 + 额外10% + 随机继承特效
      const merged = { ...item1 };
      merged.atk = (item1.atk || 0) + (item2.atk || 0);
      merged.def = (item1.def || 0) + (item2.def || 0);
      merged.atk = Math.floor(merged.atk * 1.1);
      merged.def = Math.floor(merged.def * 1.1);
      const specials = [(item1.special || item1.desc || ''), (item2.special || item2.desc || '')];
      merged.special = specials.filter(Boolean).join(' + ');
      merged.name = `${item1.name}+${item2.name}(融合)`;
      return { success: true, result: '成功', newItem: merged, message: '融合成功：属性相加+10%额外+继承特效' };
    } else if (roll < probs['成功'] + probs['部分融合']) {
      // 取高者 + 50%低者
      const atk1 = item1.atk || 0, atk2 = item2.atk || 0;
      const def1 = item1.def || 0, def2 = item2.def || 0;
      const hi = atk1 >= atk2 ? item1 : item2;
      const lo = atk1 >= atk2 ? item2 : item1;
      const merged = { ...hi };
      merged.atk = (hi.atk || 0) + Math.floor((lo.atk || 0) * 0.5);
      merged.def = (hi.def || 0) + Math.floor((lo.def || 0) * 0.5);
      merged.name = `${hi.name}·半融`;
      return { success: true, result: '部分融合', newItem: merged, message: '部分融合：取高者+50%低者' };
    } else {
      return { success: false, result: '失败', message: '融合失败·两件法宝全毁！', destroyed: [item1, item2] };
    }
  }

  // ──────────────── 法宝献祭 ────────────────

  /**
   * 献祭法宝换取临时增益
   * @returns {{ buff: object, message: string }}
   */
  sacrifice(item) {
    return this._sacrificeByDetail(item);
  }

  _sacrificeByDetail(item) {
    const rank = item.rank;
    let result;
    if (rank === '法器') {
      result = { hpRecover: 0.30, duration: 0, message: `献祭${item.name}·恢复30%气血` };
    } else if (rank === '灵器') {
      result = { hpRecover: 0.50, atkBonus: 0.20, duration: 3, message: `献祭${item.name}·恢复50%气血+临时攻+20%(3回合)` };
    } else if (rank === '法宝') {
      result = { hpRecover: 0.50, atkBonus: 0.30, duration: 4, message: `献祭${item.name}·恢复50%+临时攻+30%(4回合)` };
    } else if (rank === '古宝') {
      result = { fullRecover: true, immune: 2, duration: 2, message: `献祭${item.name}·满状态+免疫2回合` };
    } else if (this._rankChain.indexOf(rank) >= this._rankChain.indexOf('玄天之宝')) {
      result = { turnaround: true, message: `献祭${item.name}·逆转战局！` };
    } else {
      return { success: false, message: '该物品无法献祭' };
    }
    return { success: true, ...result, destroyed: item };
  }

  // ──────────────── 法宝封印 ────────────────

  /**
   * 给法宝添加封印层数
   */
  seal(item, layers = 1) {
    if (!item.sealLayers) item.sealLayers = 0;
    item.sealLayers = Math.min(9, item.sealLayers + layers);
    return { success: true, layers: item.sealLayers, message: `封印${item.name}·当前${item.sealLayers}/9层` };
  }

  /**
   * 解除封印
   * @param {'冲击'|'血祭'|'时间'|'符'} method
   */
  unseal(item, method = '冲击') {
    if (!item.sealLayers || item.sealLayers <= 0) {
      return { success: true, message: `${item.name} 无封印` };
    }
    switch (method) {
      case '冲击': {
        const success = Math.random() < 0.70;
        if (success) {
          item.sealLayers--;
          return { success: true, layers: item.sealLayers, message: `灵力冲击成功·封印-1·剩余${item.sealLayers}/9` };
        }
        item.sealLayers = Math.min(9, item.sealLayers + 1);
        return { success: false, layers: item.sealLayers, message: `冲击失败·封印加固·目前${item.sealLayers}/9` };
      }
      case '血祭': {
        item.sealLayers--;
        return { success: true, layers: item.sealLayers, cost: '5年寿元', message: `血祭解封1层·消耗5年寿元·剩余${item.sealLayers}/9` };
      }
      case '时间': {
        item.sealLayers--;
        return { success: true, layers: item.sealLayers, cost: '10年', message: `时间消磨·10年解封1层·剩余${item.sealLayers}/9` };
      }
      case '符': {
        item.sealLayers--;
        return { success: true, layers: item.sealLayers, message: `解封符解封1层·剩余${item.sealLayers}/9` };
      }
      default:
        return { success: false, message: '未知解封方式' };
    }
  }

  // ──────────────── 法宝共鸣 ────────────────

  /**
   * 检查当前装备栏是否有共鸣组合
   * @returns {Array<{ name: string, effect: object, desc: string }>}
   */
  checkResonance() {
    const activeItems = this.equipped.filter(Boolean);
    const active = [];

    for (const combo of RESONANCE_COMBOS) {
      if (combo.trigger) {
        if (combo.trigger(activeItems)) active.push(combo);
      } else if (combo.items && combo.items.length > 0) {
        // 简单名称匹配
        const names = activeItems.map(i => i.name);
        const allMatch = combo.items.every(req => names.includes(req));
        if (allMatch) active.push(combo);
      }
    }
    return active;
  }

  // ──────────────── 法宝自爆 ────────────────

  /**
   * 自爆法宝
   * @param {object} item 法宝对象
   * @param {boolean} isLifeWeapon 是否为本命法宝
   * @returns {{ damage: number, backlash: object, areaDamage: boolean, message: string }}
   */
  selfDestruct(item, isLifeWeapon = false) {
    const multiplier = isLifeWeapon ? this._data.selfDestruct.本命 : this._data.selfDestruct.normal;
    const baseAtk = item.atk || 10;
    const damage = baseAtk * multiplier;

    // 反噬
    const backlash = {
      hpLoss: Math.floor(this._data.selfDestructBacklash * 100) + '%气血',
      message: isLifeWeapon ? '本命自爆·神识永久-50%！' : '法宝自爆·气血反噬30%'
    };

    if (isLifeWeapon && this.lifeWeapon && this.lifeWeapon.name === item.name) {
      this.lifeWeapon = null;
    } else {
      const idx = this.equipped.findIndex(e => e === item);
      if (idx >= 0) this.equipped[idx] = null;
    }

    return {
      damage,
      backlash,
      areaDamage: true,
      message: `${item.name} 自爆！造成${damage}范围伤害（不分敌我）`
    };
  }

  // ──────────────── 韩立剑系统 ────────────────

  /**
   * 获取当前韩立剑的剑阵配置
   * @returns {{ count: number, formation?: object, swords: object[] }}
   */
  getHanLiSwordStatus() {
    const swords = this.equipped
      .filter(Boolean)
      .filter(s => s.name === '青竹蜂云剑' || s.name.includes('青竹蜂云剑'));
    const count = swords.length;

    let formation = null;
    for (const f of HANLI_SWORD.formation) {
      if (count >= f.range[0] && count <= f.range[1]) {
        formation = f;
        break;
      }
    }

    // 计算每把剑的实际等级
    const swordDetails = swords.map(s => ({
      name: s.name,
      level: s.hanliLevel || 1,
      rank: s.rank,
      atk: s.atk || 0
    }));

    return {
      count,
      formation: formation ? { name: formation.name, multiplier: formation.multiplier, desc: formation.desc } : null,
      swords: swordDetails,
      totalAtk: formation ? swordDetails.reduce((sum, s) => sum + s.atk, 0) * formation.multiplier : swordDetails.reduce((sum, s) => sum + s.atk, 0)
    };
  }

  /**
   * 韩立剑升级（单独炼制）
   * @param {object} sword - 单把剑对象
   * @param {string} newRealm - 玩家当前境界
   */
  upgradeHanLiSword(sword, newRealm) {
    const currentLevel = sword.hanliLevel || 1;
    for (let i = currentLevel; i < HANLI_SWORD.growthPath.length; i++) {
      const step = HANLI_SWORD.growthPath[i];
      if (step.unlock === newRealm || i > currentLevel) {
        sword.hanliLevel = step.level;
        sword.rank = step.rank;
        sword.atk = step.atkPerSword;
        return { success: true, message: `${sword.name} 升至 Lv${step.level}(${step.rank}) 攻击力${step.atkPerSword}` };
      }
    }
    return { success: false, message: '已达最高等级或境界不足' };
  }

  /** 计算炼制72把韩立剑的目标进度 */
  getHanLiProgress() {
    const total = 72;
    const current = this.equipped.filter(Boolean).filter(s => s.name === '青竹蜂云剑' || s.name.includes('青竹蜂云剑')).length;
    return { current, total, percent: Math.round(current / total * 100) };
  }

  // ──────────────── 事件系统 ────────────────

  /** 随机触发一个探索类事件 */
  triggerExploreEvent() {
    const pool = EQUIPMENT_EVENTS.explore;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** 随机触发一个温养/炼制类事件 */
  triggerNurtureEvent() {
    const pool = EQUIPMENT_EVENTS.nurture;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** 随机触发一个日常交互类事件 */
  triggerDailyEvent() {
    const pool = EQUIPMENT_EVENTS.daily;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * 按类型触发事件
   * @param {'explore'|'nurture'|'daily'|'random'} type
   */
  triggerEvent(type = 'random') {
    if (type === 'random') {
      const all = [...EQUIPMENT_EVENTS.explore, ...EQUIPMENT_EVENTS.nurture, ...EQUIPMENT_EVENTS.daily];
      return all[Math.floor(Math.random() * all.length)];
    }
    return EQUIPMENT_EVENTS[type][Math.floor(Math.random() * EQUIPMENT_EVENTS[type].length)];
  }

  /** 列出所有事件 */
  static getAllEvents() { return EQUIPMENT_EVENTS; }

  // ──────────────── 储物法宝 ────────────────

  /** 装载一个储物法宝 */
  addStorageItem(item) {
    if (this.storageItems.length >= this.maxStorageItems) {
      return { success: false, message: `储物法宝栏位已满(${this.maxStorageItems})` };
    }
    this.storageItems.push(item);
    return { success: true, message: `${item.name} 已装载` };
  }

  /** 获取当前储物总容量 */
  getTotalStorageCapacity() {
    return this.storageItems.reduce((sum, s) => sum + (s.capacity || 0), 0);
  }

  /** 获取储物法宝总自重 */
  getStorageSelfWeight() {
    return this.storageItems.reduce((sum, s) => sum + (s.weight || 0), 0);
  }
}

// ============================================================
// ======================== Inventory =========================
// ============================================================

class Inventory {
  /**
   * @param {object} player - 玩家对象 { realm }
   * @param {Equipment|null} equipment - 装备系统实例（读取储物法宝信息）
   */
  constructor(player, equipment = null) {
    this.player = player;
    this._equipment = equipment;
    this._data = DATA.INVENTORY;

    /**
     * 物品清单
     * 结构: Map<category, Array<{ name, qty, weight, data }>>
     */
    this.items = new Map();
    for (const cat of Object.keys(ITEM_CATEGORIES)) {
      this.items.set(cat, []);
    }

    /** 绿液单独计数 */
    this.greenLiquid = 0;

    /** 灵石数量 */
    this.spiritStones = 0;
  }

  // ──────────────── 物品操作 ────────────────

  /**
   * 添加物品
   * @param {string} category - 物品类别 (材料/丹药/法宝/功法/符箓/灵石/杂物/绿液)
   * @param {string} name - 物品名称
   * @param {number} qty - 数量
   * @param {object|null} data - 附加数据(法宝专用)
   */
  addItem(category, name, qty = 1, data = null) {
    if (!ITEM_CATEGORIES[category]) {
      return { success: false, message: `未知物品类别: ${category}` };
    }

    // 灵石和绿液特殊处理
    if (category === '灵石') {
      this.spiritStones += qty;
      return { success: true, message: `灵石 +${qty} (共 ${this.spiritStones})` };
    }
    if (category === '绿液') {
      this.greenLiquid += qty;
      return { success: true, message: `绿液 +${qty} (共 ${this.greenLiquid})` };
    }

    const list = this.items.get(category);

    // 可堆叠
    if (ITEM_CATEGORIES[category].stackable) {
      const existing = list.find(i => i.name === name);
      if (existing) {
        existing.qty += qty;
        return { success: true, message: `${name} 已堆叠 (×${existing.qty})` };
      }
    }

    list.push({ name, qty, weight: this._getItemWeight(category, name), data });
    return { success: true, message: `获得 ${name}${qty > 1 ? ` ×${qty}` : ''}` };
  }

  /**
   * 移除物品
   */
  removeItem(category, name, qty = 1) {
    if (!this.items.has(category)) {
      return { success: false, message: `无此类别: ${category}` };
    }

    if (category === '灵石') {
      if (this.spiritStones < qty) return { success: false, message: `灵石不足(${this.spiritStones})` };
      this.spiritStones -= qty;
      return { success: true, message: `灵石 -${qty} (剩 ${this.spiritStones})` };
    }

    if (category === '绿液') {
      if (this.greenLiquid < qty) return { success: false, message: `绿液不足(${this.greenLiquid})` };
      this.greenLiquid -= qty;
      return { success: true, message: `绿液 -${qty} (剩 ${this.greenLiquid})` };
    }

    const list = this.items.get(category);
    const idx = list.findIndex(i => i.name === name);
    if (idx === -1) return { success: false, message: `没有 ${name}` };

    const entry = list[idx];
    if (entry.qty < qty) return { success: false, message: `${name} 不足 (×${entry.qty})` };
    entry.qty -= qty;
    if (entry.qty <= 0) list.splice(idx, 1);
    return { success: true, message: `${name} -${qty}` };
  }

  /**
   * 获取物品列表
   * @param {string|null} category - 指定类别或全部
   * @returns {Array}
   */
  getItems(category = null) {
    if (category) {
      if (category === '灵石') return [{ name: '灵石', qty: this.spiritStones }];
      if (category === '绿液') return [{ name: '绿液', qty: this.greenLiquid }];
      return this.items.get(category) || [];
    }
    // 全部
    const all = [];
    for (const [cat, list] of this.items) {
      if (list.length > 0) all.push(...list.map(i => ({ ...i, category: cat })));
    }
    if (this.spiritStones > 0) all.push({ name: '灵石', qty: this.spiritStones, category: '灵石', weight: 0 });
    if (this.greenLiquid > 0) all.push({ name: '绿液', qty: this.greenLiquid, category: '绿液', weight: 0 });
    return all;
  }

  // ──────────────── 重量 & 负重 ────────────────

  _getItemWeight(category, name) {
    const w = this._data.weight;
    if (category === '丹药') return w.丹药 * 1;
    if (category === '符箓') return w.符箓 * 1;
    if (category === '灵石' || category === '绿液') return 0;
    if (category === '材料') {
      if (name.includes('灵草') || name.includes('芝') || name.includes('花') || name.includes('菇')) return 0.3;
      if (name.includes('矿') || name.includes('石') || name.includes('铁') || name.includes('玉')) return 0.8;
      if (name.includes('骨') || name.includes('兽')) return 1;
      return 0.5; // 默认材料
    }
    if (category === '法宝') {
      // 按实际情况，这里简化：从catalog中查找重量
      // 默认按品阶
      return w.法宝 || 5;
    }
    if (category === '杂物') return 1;
    return 1;
  }

  /** 计算所有背包物品总重量（不含储物法宝内的） */
  getTotalWeight() {
    let total = 0;
    for (const [cat, list] of this.items) {
      if (cat === '灵石' || cat === '绿液') continue;
      for (const entry of list) {
        const w = entry.weight || this._getItemWeight(cat, entry.name);
        total += w * (entry.qty || 1);
      }
    }
    // 储物法宝自重
    if (this._equipment) {
      total += this._equipment.getStorageSelfWeight();
    }
    return total;
  }

  /** 获取当前境界负重上限 */
  getCarryLimit() {
    const realm = this.player.realm || '凡人';
    return this._data.carryLimit[realm] || 10;
  }

  /** 获取负重比率 (当前/上限) */
  getWeightRatio() {
    const limit = this.getCarryLimit();
    if (limit === Infinity) return 0;
    return this.getTotalWeight() / limit;
  }

  /** 获取超重惩罚等级和具体效果 */
  getOverweightPenalty() {
    const ratio = this.getWeightRatio();
    const tiers = this._data.overweight;
    for (const [level, [min, max]] of Object.entries(tiers)) {
      if (ratio >= min && ratio < max) {
        return this._penaltyDetail(level, ratio);
      }
    }
    return { level: 'unknown', ratio, effects: [], message: '未知状态' };
  }

  _penaltyDetail(level, ratio) {
    const details = {
      normal:      { effects: [],                        message: '无影响' },
      light:       { effects: ['移速-20%', '闪避-10%'],  message: `轻度超重(${(ratio*100).toFixed(1)}%)：移速-20% 闪避-10%` },
      moderate:    { effects: ['移速-40%', '闪避-20%', '防御-10%'], message: `中度超重(${(ratio*100).toFixed(1)}%)：移速-40% 闪避-20% 防御-10%` },
      heavy:       { effects: ['移速-60%', '全属性-20%'], message: `重度超重(${(ratio*100).toFixed(1)}%)：移速-60% 全属性-20%` },
      extreme:     { effects: ['无法战斗', '只能缓慢移动'], message: `极度超重(${(ratio*100).toFixed(1)}%)：无法战斗·只能缓慢移动` },
      immobilized: { effects: ['无法移动'],               message: `负重超标300%+(${(ratio*100).toFixed(1)}%)：无法移动！` }
    };
    return { level, ratio, ...details[level] };
  }

  /** 储物法宝可用容量 */
  getStorageAvailable() {
    if (!this._equipment) return 0;
    return this._equipment.getTotalStorageCapacity();
  }

  // ──────────────── 查询 ────────────────

  /** 按名称查找物品 */
  findItem(name) {
    for (const [cat, list] of this.items) {
      const found = list.find(i => i.name === name);
      if (found) return { ...found, category: cat };
    }
    return null;
  }

  /** 检查是否有某物品 */
  has(name, qty = 1) {
    const item = this.findItem(name);
    return item && item.qty >= qty;
  }

  /** 背包概要 */
  summary() {
    const weight = this.getTotalWeight();
    const limit = this.getCarryLimit();
    const ratio = this.getWeightRatio();
    const penalty = this.getOverweightPenalty();
    const storage = this.getStorageAvailable();

    return {
      itemCount: this.getItems().length,
      totalWeight: weight,
      carryLimit: limit,
      ratio: ratio,
      penalty: penalty,
      storageCapacity: storage,
      spiritStones: this.spiritStones,
      greenLiquid: this.greenLiquid
    };
  }
}

// ============================================================
// 导出
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Equipment, Inventory };
}
// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Equipment = Equipment;
  window.Inventory = Inventory;
}
