/**
 * player.js — 修仙角色核心模块
 * 基于 GDD 行38~311 设计，覆盖灵根、境界突破、属性三大系统。
 *
 * 导出：Player 类、createCharacter() 工厂函数
 */

/* ================================================================
 *  一、常量定义
 * ================================================================ */

/** 五行 */
const ELEMENTS = ['金', '木', '水', '火', '土'];

/** 变异标签（后天触发，初始为 null） */
const MUTATION_LABELS = ['雷', '冰', '风'];

/**
 * 灵根类型定义
 * name       - 中文名
 * rarity     - 稀有度标签
 * cultivate  - 修炼倍率
 * breakthroughBonus - 突破成功率加成
 */
const ROOT_TYPES = {
  FALSE:    { name: '伪灵根', rarity: '最差', cultivate: 0.5,  breakthroughBonus: -0.20 },
  MIXED:    { name: '杂灵根', rarity: '普通', cultivate: 1.0,  breakthroughBonus:  0.00 },
  DUAL:     { name: '双灵根', rarity: '较好', cultivate: 1.8,  breakthroughBonus:  0.12 },
  HEAVENLY: { name: '天灵根', rarity: '顶级', cultivate: 3.0,  breakthroughBonus:  0.20 },
  MUTANT:   { name: '变异灵根', rarity: '特殊', cultivate: 3.5, breakthroughBonus:  0.22 },
};

/** 15 大境界 */
const REALMS = [
  '凡人', '练气', '筑基', '金丹', '元婴',
  '化神', '炼虚', '合体', '大乘', '渡劫',
  '真仙', '金仙', '太乙', '大罗', '道祖',
];

/** 小阶段（索引 0~3） */
const SUB_STAGES = ['初期', '中期', '后期', '圆满'];

/**
 * 大境界基础属性表
 * 格式：{ hp, mp, atk, def, sp }
 */
const REALM_BASE_STATS = {
  凡人:  { hp: 100,        mp: 50,         atk: 10,         def: 5,          sp: 10 },
  练气:  { hp: 200,        mp: 150,        atk: 25,         def: 12,         sp: 30 },
  筑基:  { hp: 500,        mp: 400,        atk: 60,         def: 30,         sp: 80 },
  金丹:  { hp: 1500,       mp: 1200,       atk: 180,        def: 90,         sp: 200 },
  元婴:  { hp: 4000,       mp: 3500,       atk: 500,        def: 250,        sp: 500 },
  化神:  { hp: 10000,      mp: 9000,       atk: 1200,       def: 600,        sp: 1200 },
  炼虚:  { hp: 30000,      mp: 25000,      atk: 3000,       def: 1500,       sp: 3000 },
  合体:  { hp: 80000,      mp: 70000,      atk: 8000,       def: 4000,       sp: 8000 },
  大乘:  { hp: 200000,     mp: 180000,     atk: 20000,      def: 10000,      sp: 20000 },
  渡劫:  { hp: 500000,     mp: 450000,     atk: 50000,      def: 25000,      sp: 50000 },
  真仙:  { hp: 2000000,    mp: 1800000,    atk: 200000,     def: 100000,     sp: 200000 },
  金仙:  { hp: 10000000,   mp: 9000000,    atk: 1000000,    def: 500000,     sp: 1000000 },
  太乙:  { hp: 50000000,   mp: 45000000,   atk: 5000000,    def: 2500000,    sp: 5000000 },
  大罗:  { hp: 200000000,  mp: 180000000,  atk: 20000000,   def: 10000000,   sp: 20000000 },
  道祖:  { hp: 1000000000, mp: 900000000,  atk: 100000000,  def: 50000000,   sp: 100000000 },
};

/**
 * 大境界默认寿元（年）
 * 非 GDD 硬数据，基于修仙常识设定。可由后续系统覆盖。
 */
const REALM_LIFESPAN = {
  凡人: 100,   练气: 150,  筑基: 200,   金丹: 300,  元婴: 500,
  化神: 800,   炼虚: 1500, 合体: 3000,  大乘: 5000,  渡劫: 8000,
  真仙: 20000, 金仙: 50000, 太乙: 100000, 大罗: 200000, 道祖: Infinity,
};

/**
 * 大境界突破灵石消耗与推荐丹药
 * 丹药加成取自 GDD 区间取中值。
 */
const BREAKTHROUGH_COST = {
  凡人: { spiritStones: 0,     pill: null,      pillBonus: 0    },
  练气: { spiritStones: 50,    pill: null,      pillBonus: 0    },
  筑基: { spiritStones: 200,   pill: '筑基丹',   pillBonus: 0.15 },
  金丹: { spiritStones: 800,   pill: '结金丹',   pillBonus: 0.20 },
  元婴: { spiritStones: 3000,  pill: '化婴丹',   pillBonus: 0.20 },
  化神: { spiritStones: 10000, pill: '炼神丹',   pillBonus: 0.20 },
  炼虚: { spiritStones: 50000,  pill: '虚灵丹', pillBonus: 0.20 },
  合体: { spiritStones: 200000, pill: '合和丹', pillBonus: 0.20 },
  大乘: { spiritStones: 500000, pill: '渡厄丹', pillBonus: 0.20 },
  渡劫: { spiritStones: 1000000,pill: '渡劫圣丹',pillBonus: 0.20 },
  真仙: { spiritStones: 0,     pill: null,      pillBonus: 0    }, // 灵晶体系
  金仙: { spiritStones: 0,     pill: null,      pillBonus: 0    },
  太乙: { spiritStones: 0,     pill: null,      pillBonus: 0    },
  大罗: { spiritStones: 0,     pill: null,      pillBonus: 0    },
  道祖: { spiritStones: 0,     pill: '道祖丹',   pillBonus: 0    },
};

/** 飞升灵石消耗 */
const ASCENSION_COST = {
  灵界: 50000,   // 化神→炼虚
  仙界: 5000000, // 渡劫→真仙
};

/** 飞升丹药 */
const ASCENSION_PILL = {
  灵界: '飞升丹',
  仙界: '飞仙丹',
};


/* ================================================================
 *  二、灵根系统
 * ================================================================ */

/**
 * 随机生成五行百分比，总和 100%
 * @returns {Object} { 金, 木, 水, 火, 土 }
 */
function generateElementPercents() {
  // Dirichlet 分布简化：随机 5 个数 → 归一化
  const raw = ELEMENTS.map(() => Math.random());
  const sum = raw.reduce((a, b) => a + b, 0);
  const percents = {};
  // 取整，最后一位用差值补齐，保证总和=100
  let accum = 0;
  ELEMENTS.forEach((el, i) => {
    if (i === 4) {
      percents[el] = 100 - accum;
    } else {
      const v = Math.round((raw[i] / sum) * 100);
      percents[el] = Math.max(1, v); // 每项至少 1%
      accum += percents[el];
    }
  });
  // 如果前四项之和已超 100，重置为均匀
  if (accum >= 100) {
    ELEMENTS.forEach((el, i) => {
      percents[el] = i === 4 ? 100 - 80 : 20;
    });
  }
  return percents;
}

/**
 * 根据五行百分比判定灵根类型
 * @param {Object} percents - { 金, 木, 水, 火, 土 }
 * @returns {{ type: string, detail: Object }}
 */
function determineRootType(percents) {
  const vals = Object.values(percents);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const sum = vals.reduce((a, b) => a + b, 0);

  // 变异灵根：后天触发，初始不会生成，保留空位
  // 天灵根：单一属性 ≥90%，其余合计 ≤10%
  if (max >= 90 && (sum - max) <= 10) {
    return { type: 'HEAVENLY', detail: ROOT_TYPES.HEAVENLY };
  }

  // 伪灵根：五属性皆有且平均，无任一 >30%
  if (max <= 30) {
    return { type: 'FALSE', detail: ROOT_TYPES.FALSE };
  }

  // 双灵根：两个主属性 30~45%，其余合计 ≤40%
  const sorted = ELEMENTS.map(el => ({ el, v: percents[el] }))
    .sort((a, b) => b.v - a.v);
  const topTwoSum = sorted[0].v + sorted[1].v;
  const restSum = sorted[2].v + sorted[3].v + sorted[4].v;
  if (
    sorted[0].v >= 30 && sorted[0].v <= 45 &&
    sorted[1].v >= 30 && sorted[1].v <= 45 &&
    restSum <= 40
  ) {
    return { type: 'DUAL', detail: ROOT_TYPES.DUAL };
  }

  // 其他均为杂灵根
  return { type: 'MIXED', detail: ROOT_TYPES.MIXED };
}


/* ================================================================
 *  三、属性系统
 * ================================================================ */

/**
 * 根据灵根类型生成悟性和机缘初始值
 */
function generateWisdomLuck(rootType) {
  const ranges = {
    FALSE:    { wis: [20, 40],  luck: [10, 30] },
    MIXED:    { wis: [30, 60],  luck: [20, 50] },
    DUAL:     { wis: [50, 80],  luck: [40, 70] },
    HEAVENLY: { wis: [70, 100], luck: [60, 90] },
    MUTANT:   { wis: [80, 110], luck: [70, 100] },
  };
  const r = ranges[rootType] || ranges.MIXED;
  return {
    悟性: randInt(r.wis[0], r.wis[1]),
    机缘: randInt(r.luck[0], r.luck[1]),
  };
}

/** [min, max] 闭区间随机整数 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 通用 Clamp */
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}


/* ================================================================
 *  四、Player 类
 * ================================================================ */

class Player {
  /**
   * @param {string} name - 角色名
   * @param {Object} [opts] - 可选覆盖
   */
  constructor(name, opts = {}) {
    this.name = name;

    // ── 灵根 ──
    this.elements = opts.elements || generateElementPercents();
    const rootResult = determineRootType(this.elements);
    this.rootType     = rootResult.type;       // 'FALSE'|'MIXED'|'DUAL'|'HEAVENLY'|'MUTANT'
    this.rootDetail   = rootResult.detail;
    this.cultivateMul = this.rootDetail.cultivate;
    this.mutationLabel = opts.mutationLabel || null; // 后天变异标签（雷/冰/风），初始 null

    // ── 境界 ──
    this.realmIndex    = opts.realmIndex    || 0;     // REALMS 索引（0=凡人）
    this.subStageIndex = opts.subStageIndex || 0;     // 0-3
    this.cultivation   = opts.cultivation   || 0;     // 当前修为值

    // ── 灵石 ──
    this.spiritStones = opts.spiritStones || 0;

    // ── 名望 ──
    this.righteousFame = opts.righteousFame || 0;  // 正道名望 -100~100
    this.demonicFame   = opts.demonicFame   || 0;  // 魔道名望 -100~100

    // ── 8 属性 ──
    this.hpMax   = opts.hpMax   || 0;
    this.mpMax   = opts.mpMax   || 0;
    this.atk     = opts.atk     || 0;
    this.def     = opts.def     || 0;
    this.sp      = opts.sp      || 0;   // 神识
    this.wisdom  = opts.wisdom  || 0;   // 悟性
    this.luck    = opts.luck    || 0;   // 机缘
    this.lifespan = opts.lifespan|| 0;  // 寿元（剩余年）

    // 首次创建时，自动生成 WIS/LUCK/寿元 并初始化战斗属性
    if (!opts.hpMax) {
      const wl = generateWisdomLuck(this.rootType);
      this.wisdom = wl.悟性;
      this.luck   = wl.机缘;
      this.refreshStats(); // 同步境界基础属性
      this.lifespan = this.getRealmLifespan();
    }
  }

  // ────────────── 便捷访问 ──────────────

  get realm()      { return REALMS[this.realmIndex]; }
  get subStage()   { return SUB_STAGES[this.subStageIndex]; }
  get fullTitle()  { return this.realm + this.subStage; }

  /** 灵根中文名 */
  get rootName() {
    let base = this.rootDetail.name;
    if (this.mutationLabel) base += `·${this.mutationLabel}`;
    return base;
  }

  // ────────────── 属性计算 ──────────────

  /**
   * 获取当前大境界基础属性
   */
  getRealmBaseStats() {
    return REALM_BASE_STATS[this.realm] || REALM_BASE_STATS['凡人'];
  }

  /** 获取当前大境界默认寿元 */
  getRealmLifespan() {
    return REALM_LIFESPAN[this.realm] || 100;
  }

  /**
   * 当前属性 = 大境界基础值 × (1 + 0.25 × 小阶段索引)
   */
  computeBaseStat(baseVal) {
    return Math.floor(baseVal * (1 + 0.25 * this.subStageIndex));
  }

  /**
   * 刷新战斗属性（境界变化时调用）
   */
  refreshStats() {
    const b = this.getRealmBaseStats();
    this.hpMax = this.computeBaseStat(b.hp);
    this.mpMax = this.computeBaseStat(b.mp);
    this.atk   = this.computeBaseStat(b.atk);
    this.def   = this.computeBaseStat(b.def);
    this.sp    = this.computeBaseStat(b.sp);
    // 寿元在突破时单独处理
  }

  // ────────────── 衍生属性 ──────────────

  /** 修炼速度 */
  get cultivateSpeed() {
    // 基础速度 = 1（可后续由功法等系统调整）
    const base = 1;
    return base * this.cultivateMul * (1 + this.wisdom * 0.005);
  }

  /** 灵力恢复 / 回合 */
  get mpRegen() {
    const realmBase = Math.floor(this.mpMax * 0.05); // 境界基础恢复 = MP上限 5%
    return Math.floor(realmBase * (1 + this.sp * 0.002));
  }

  /** 暴击率 (小数) */
  get critRate() {
    return clamp(this.luck * 0.002, 0, 0.5);
  }

  /** 闪避率 (小数) */
  get dodgeRate() {
    return clamp(this.sp * 0.0015, 0, 0.5);
  }

  /** 负重上限 */
  get carryWeight() {
    const coeff = this.realmIndex === 0 ? 0.2 : this.realmIndex; // 凡人 0.2
    return this.realmIndex === 14 ? Infinity : coeff * 50;
  }

  // ────────────── 修为获取 ──────────────

  /**
   * 修炼：增加修为值
   * @param {number} amount - 基础修为量
   */
  cultivate(amount) {
    const gained = Math.floor(amount * this.cultivateSpeed);
    this.cultivation += gained;
    return gained;
  }

  // ────────────── 境界突破 ──────────────

  /**
   * 获取当前境界突破所需修为
   * GDD 表：每个境界的四个小阶段修为门槛
   */
  getCultivationRequirement() {
    const table = {
      凡人: [0, 30, 70, 120],
      练气: [150, 350, 600, 900],
      筑基: [1000, 2200, 3800, 5800],
      金丹: [6000, 12000, 20000, 30000],
      元婴: [30000, 60000, 100000, 150000],
      化神: [150000, 300000, 500000, 800000],
      炼虚: [800000, 1500000, 2500000, 4000000],
      合体: [4000000, 8000000, 13000000, 20000000],
      大乘: [20000000, 35000000, 55000000, 80000000],
      渡劫: [80000000, 120000000, 180000000, 250000000],
      真仙: [250000000, 500000000, 900000000, 1500000000],
      金仙: [1500000000, 3000000000, 5500000000, 9000000000],
      太乙: [9000000000, 18000000000, 30000000000, 50000000000],
      大罗: [50000000000, 100000000000, 200000000000, 400000000000],
      道祖: [400000000000, 1000000000000],
    };
    const arr = table[this.realm];
    if (!arr) return Infinity;
    return arr[this.subStageIndex] || arr[arr.length - 1];
  }

  /**
   * 计算突破成功率
   * 基础 20% + 灵根加成 + 丹药加成 + 悟性×0.2% + 机缘×0.15% + 功法加成 + 神识加成
   * 保底 5%，上限 85%
   *
   * @param {Object} [bonuses={}] - 外部加成
   * @param {boolean} [bonuses.hasPill] - 是否使用对应突破丹
   * @param {number}  [bonuses.manualBonus] - 功法加成 (0~0.15)
   * @param {number}  [bonuses.spBonus] - 神识额外加成 (0/0.05/0.10)
   * @returns {number} 成功率 (0~1)
   */
  calculateBreakthroughRate(bonuses = {}) {
    const base = 0.20;

    // 灵根加成
    const rootBonus = this.rootDetail.breakthroughBonus;

    // 丹药加成
    const costInfo = BREAKTHROUGH_COST[this.realm];
    const pillBonus = bonuses.hasPill ? (costInfo ? costInfo.pillBonus : 0) : 0;

    // 悟性加成 (上限 20%)
    const wisBonus = Math.min(this.wisdom * 0.002, 0.20);

    // 机缘加成 (上限 15%)
    const luckBonus = Math.min(this.luck * 0.0015, 0.15);

    // 功法加成 (外部传入)
    const manualBonus = bonuses.manualBonus || 0;

    // 神识加成
    const spBonus = bonuses.spBonus || 0;

    const total = base + rootBonus + pillBonus + wisBonus + luckBonus + manualBonus + spBonus;
    return clamp(total, 0.05, 0.85);
  }

  /**
   * 小境界突破（初期→中期→后期→圆满）
   * 条件：修为达标 + 灵力全满
   */
  breakthroughSubStage() {
    const req = this.getCultivationRequirement();
    if (this.cultivation < req) {
      return { success: false, reason: '修为不足' };
    }
    if (this.subStageIndex >= 3) {
      return { success: false, reason: '已到圆满，需大境界突破' };
    }

    this.subStageIndex++;
    this.refreshStats();
    return { success: true, newStage: this.fullTitle };
  }

  /**
   * 大境界突破（圆满 → 下一大境界初期）
   * 条件：修为达标 + 灵力全满 + 灵石足够
   *
   * @param {Object} [bonuses] - 同 calculateBreakthroughRate
   * @returns {{ success: boolean, result: string, msg: string }}
   */
  breakthroughRealm(bonuses = {}) {
    if (this.realmIndex >= 14) {
      return { success: false, result: 'error', msg: '已达终极境界' };
    }
    if (this.subStageIndex < 3) {
      return { success: false, result: 'error', msg: '需先达到当前境界圆满' };
    }

    const req = this.getCultivationRequirement();
    if (this.cultivation < req) {
      return { success: false, result: 'error', msg: '修为不足' };
    }

    // 检查灵石
    const costInfo = BREAKTHROUGH_COST[this.realm];
    if (costInfo && this.spiritStones < costInfo.spiritStones) {
      return { success: false, result: 'error', msg: `灵石不足，需要 ${costInfo.spiritStones}` };
    }

    // 扣除灵石
    this.spiritStones -= costInfo ? costInfo.spiritStones : 0;

    // 计算成功率
    const rate = this.calculateBreakthroughRate(bonuses);
    const roll = Math.random();

    // 大成功判定 (5%)
    if (roll < 0.05) {
      this._advanceRealm();
      // 全属性永久 +5%
      this.hpMax = Math.floor(this.hpMax * 1.05);
      this.mpMax = Math.floor(this.mpMax * 1.05);
      this.atk   = Math.floor(this.atk   * 1.05);
      this.def   = Math.floor(this.def   * 1.05);
      this.sp    = Math.floor(this.sp    * 1.05);
      return { success: true, result: '大成功', msg: '突破大成功！全属性永久+5%' };
    }

    // 成功
    if (roll < 0.05 + rate) {
      this._advanceRealm();
      return { success: true, result: '成功', msg: `突破至 ${this.fullTitle}` };
    }

    // 走火入魔判定
    if (rate < 0.40 && Math.random() < 0.20) {
      return this._qiDeviation();
    }

    // 普通失败
    this.mpMax = 0; // 灵力清空
    const penalty = Math.floor(req * 0.08);
    this.cultivation = Math.max(0, this.cultivation - penalty);
    return { success: false, result: '失败', msg: `突破失败，灵力清空，修为扣 ${penalty}` };
  }

  /** 内部：晋升到下一大境界 */
  _advanceRealm() {
    this.realmIndex++;
    this.subStageIndex = 0;
    this.refreshStats();
    // 寿元更新为新高境界默认值（不叠加旧寿元）
    const newLifespan = this.getRealmLifespan();
    this.lifespan = newLifespan;
  }

  /** 走火入魔 */
  _qiDeviation() {
    this.cultivation = Math.floor(this.cultivation * 0.7); // 修为 -30%
    if (this.subStageIndex > 0) this.subStageIndex--;      // 掉 1 小阶
    this.lifespan = Math.max(0, this.lifespan - 10);       // 寿元扣 10 年
    this.refreshStats();                                   // 先刷新（小阶已变）
    this.hpMax = Math.floor(this.hpMax * 0.5);             // 气血降为 50%
    return { success: false, result: '走火入魔', msg: '走火入魔！修为-30%/掉1阶/气血减半/寿元-10年' };
  }

  // ────────────── 飞升渡劫 ──────────────

  /**
   * 飞升渡劫事件
   * 触发条件：化神圆满（→灵界）或 渡劫圆满（→仙界）
   *
   * @param {'灵界'|'仙界'} target - 飞升目标
   * @param {Object} preparations - 准备行动结果
   * @param {boolean} preparations.bodyFortified - 加固肉身
   * @param {boolean} preparations.artifactReady - 防御法宝就绪
   * @param {boolean} preparations.pillReady    - 渡劫丹就绪
   * @returns {Object} 结果
   */
  ascensionTribulation(target, preparations = {}) {
    const isValid =
      (target === '灵界' && this.realm === '化神' && this.subStage === '圆满') ||
      (target === '仙界' && this.realm === '渡劫' && this.subStage === '圆满');

    if (!isValid) {
      return { success: false, msg: '当前境界无法飞升' };
    }

    // 检查灵石
    const cost = ASCENSION_COST[target];
    if (this.spiritStones < cost) {
      return { success: false, msg: `灵石不足，飞升需要 ${cost}` };
    }
    this.spiritStones -= cost;

    // 基础成功率 + 准备加成
    let rate = 0.30;
    if (preparations.bodyFortified) rate += 0.15;
    if (preparations.artifactReady)  rate += 0.15;
    if (preparations.pillReady)      rate += 0.20;
    rate = clamp(rate, 0.10, 0.90);

    const roll = Math.random();

    if (roll < rate) {
      // —— 飞升成功 ——
      const nextRealmIndex = target === '灵界' ? 6 : 10; // 炼虚 / 真仙
      this.realmIndex = nextRealmIndex;
      this.subStageIndex = 0;
      this.refreshStats();

      // 灵石兑换（1000:1）
      const exchangeRate = 1000;
      this.spiritStones = Math.floor(this.spiritStones / exchangeRate);

      // 天降甘霖：全属性大幅提升（+30%）
      this.hpMax = Math.floor(this.hpMax * 1.30);
      this.mpMax = Math.floor(this.mpMax * 1.30);
      this.atk   = Math.floor(this.atk   * 1.30);
      this.def   = Math.floor(this.def   * 1.30);
      this.sp    = Math.floor(this.sp    * 1.30);
      this.lifespan = this.getRealmLifespan();

      return {
        success: true,
        msg: `渡劫成功！飞升至${target === '灵界' ? '灵界' : '仙界'}，肉身重塑，全属性+30%`,
        newRealm: this.fullTitle,
      };
    }

    // —— 飞升失败 ——
    this.cultivation = Math.floor(this.cultivation * 0.50); // 修为扣 50%
    this.lifespan = Math.max(0, this.lifespan - 50);        // 寿元扣 50 年

    // 大失败判定（10% 概率陨落）
    if (Math.random() < 0.10) {
      return {
        success: false,
        result: '大失败',
        msg: '天劫之下形神俱灭！触发陨落事件',
        killed: true,
      };
    }

    return {
      success: false,
      msg: '渡劫失败！修为扣50%，寿元扣50年，可重新准备',
    };
  }

  // ────────────── 陨落事件 ──────────────

  /**
   * 处理陨落（寿元归零或大失败时调用）
   * @param {'坐化'|'转世'|'夺舍'|'兵解重修'|'身外化身'|'天人五衰'} choice
   * @param {Object} [extra] - 额外参数（夺舍目标等）
   * @returns {{ gameOver: boolean, inherit: Object }}
   */
  handleFalling(choice, extra = {}) {
    const result = { gameOver: false, inherit: {} };

    switch (choice) {
      case '坐化':
        result.gameOver = true;
        result.inherit = null; // 全部消失
        break;

      case '转世':
        if (this.sp < 500) return { gameOver: true, msg: '神识不足500，无法转世' };
        result.inherit = { sp: Math.floor(this.sp * 0.10) };
        result.gameOver = false;
        result.newCharacter = true; // 从凡人重新开始，仅保留神识×10%
        break;

      case '夺舍':
        if (this.sp < 1000) return { gameOver: true, msg: '神识不足1000，无法夺舍' };
        result.inherit = {
          items: true,       // 背包保留
          spiritStones: true, // 灵石保留
          skills: true,      // 功法保留
          sp: extra.spResult || this.sp, // 神识拼斗结果
        };
        result.gameOver = false;
        break;

      case '兵解重修':
        result.inherit = {
          itemsLoseHalf: true,        // 背包/法宝/灵兽消失50%
          spiritStonesRatio: 0.50,    // 灵石保留50%
          skillsLoseLevel: true,      // 功法保留但需重修等级
          spRatio: 0.50,              // 神识保留50%
        };
        result.newRealm = '元婴'; // 掉到元婴
        result.newRoute = '鬼修';
        result.gameOver = false;
        break;

      case '身外化身':
        result.inherit = {
          allKeep: true,              // 全部保留
          realmDrop: 2,               // 境界掉 2 大境界
          skillsDrop: true,           // 功法等级相应下降
          spKeep: true,               // 神识全部保留
        };
        result.gameOver = false;
        break;

      case '天人五衰':
        if (this.realmIndex < 13) { // 大罗以下不能选
          return { gameOver: true, msg: '非大罗以上，无法触发天人五衰' };
        }
        result.gameOver = true;
        result.inherit = null; // 全部消失，彻底消散
        break;

      default:
        return { gameOver: true, msg: '无效选择' };
    }

    return result;
  }

  // ────────────── 名望 ──────────────

  /**
   * 修改正道/魔道名望
   * @param {number} righteousDelta - 正道名望变化
   * @param {number} demonicDelta   - 魔道名望变化
   */
  modifyFame(righteousDelta, demonicDelta) {
    this.righteousFame = clamp(this.righteousFame + righteousDelta, -100, 100);
    this.demonicFame   = clamp(this.demonicFame   + demonicDelta,   -100, 100);
  }

  /**
   * 杀死目标后的名望结算
   * @param {'righteous'|'demonic'|'neutral'} targetFaction
   */
  onKillFame(targetFaction) {
    const map = {
      righteous: { r: -15, d: 5 },
      demonic:   { r: 5,  d: -15 },
      neutral:   { r: -5,  d: -5 },
    };
    const delta = map[targetFaction] || { r: 0, d: 0 };
    this.modifyFame(delta.r, delta.d);
  }

  // ────────────── 序列化 ──────────────

  toJSON() {
    return {
      name:           this.name,
      elements:       this.elements,
      rootType:       this.rootType,
      mutationLabel:  this.mutationLabel,
      realmIndex:     this.realmIndex,
      subStageIndex:  this.subStageIndex,
      cultivation:    this.cultivation,
      spiritStones:   this.spiritStones,
      righteousFame:  this.righteousFame,
      demonicFame:    this.demonicFame,
      hpMax:          this.hpMax,
      mpMax:          this.mpMax,
      atk:            this.atk,
      def:            this.def,
      sp:             this.sp,
      wisdom:         this.wisdom,
      luck:           this.luck,
      lifespan:       this.lifespan,
    };
  }

  static fromJSON(data) {
    return new Player(data.name, {
      elements:       data.elements,
      mutationLabel:  data.mutationLabel,
      realmIndex:     data.realmIndex,
      subStageIndex:  data.subStageIndex,
      cultivation:    data.cultivation,
      spiritStones:   data.spiritStones,
      righteousFame:  data.righteousFame,
      demonicFame:    data.demonicFame,
      hpMax:          data.hpMax,
      mpMax:          data.mpMax,
      atk:            data.atk,
      def:            data.def,
      sp:             data.sp,
      wisdom:         data.wisdom,
      luck:           data.luck,
      lifespan:       data.lifespan,
    });
  }
}


/* ================================================================
 *  五、工厂函数
 * ================================================================ */

/**
 * 创建一个新角色
 * @param {string} name - 角色名
 * @returns {Player}
 */
function createCharacter(name) {
  return new Player(name);
}


/* ================================================================
 *  六、导出
 * ================================================================ */

// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Player = Player;
  window.createCharacter = createCharacter;
  window.ELEMENTS = ELEMENTS;
  window.REALMS = REALMS;
  window.SUB_STAGES = SUB_STAGES;
  window.ROOT_TYPES = ROOT_TYPES;
  window.REALM_BASE_STATS = REALM_BASE_STATS;
  window.REALM_LIFESPAN = REALM_LIFESPAN;
  window.BREAKTHROUGH_COST = BREAKTHROUGH_COST;
  window.MUTATION_LABELS = MUTATION_LABELS;
}
