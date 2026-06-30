/**
 * 凡人修仙传·模拟器 — ④修炼 ⑤神识 ⑥炼体 系统
 * 依赖：DATA（全局常量模块）
 * 导出：Cultivation 类
 *
 * 数据来源：temp_gdd.md 行312~506
 */

// ============================================================
// 内部纯数据（不依赖 DATA 运行时值的表直接放这里）
// ============================================================

/** 各操作在各境界的耗时（天） */
const TIME_COST_TABLE = {
  打坐:     { 凡人:1,  练气:3,  筑基:7,  金丹:15, 元婴:30, 化神:60 },
  闭关:     { 凡人:7,  练气:15, 筑基:30, 金丹:90, 元婴:180,化神:365 },
  探索:     { 凡人:1,  练气:1,  筑基:3,  金丹:5,  元婴:7,  化神:10 },
  炼丹:     { 凡人:null,练气:3, 筑基:5,  金丹:10, 元婴:15, 化神:30 },
  祭炼法宝: { 凡人:null,练气:7, 筑基:15, 金丹:30, 元婴:60, 化神:120 },
  休养恢复: { 凡人:1,  练气:1,  筑基:2,  金丹:3,  元婴:5,  化神:7 },
  赶路切换: { 凡人:1,  练气:1,  筑基:1,  金丹:2,  元婴:3,  化神:5 }
};

/** 聚灵阵配置 */
const SPIRIT_ARRAY_TABLE = [
  { name:'初级聚灵阵', cost:200,   bonus:0.50, duration:90,  unlock:'练气' },
  { name:'中级聚灵阵', cost:800,   bonus:0.80, duration:180, unlock:'筑基' },
  { name:'高级聚灵阵', cost:3000,  bonus:1.20, duration:365, unlock:'金丹' },
  { name:'顶级聚灵阵', cost:10000, bonus:2.00, duration:730, unlock:'元婴' }
];

/** 修炼地点 */
const LOCATION_TABLE = [
  { name:'普通洞府', bonus:0,    unlock:'初始',     switchDays:0 },
  { name:'灵脉洞府', bonus:0.30, unlock:'500灵石',  switchDays:1 },
  { name:'地下灵脉', bonus:0.60, unlock:'探索发现', switchDays:3 },
  { name:'福地秘境', bonus:1.00, unlock:'特殊任务', switchDays:5 },
  { name:'宗门静室', bonus:0.40, unlock:'加入宗门', switchDays:1 }
];

/** 赶路方式（倍率） */
const TRAVEL_METHODS = {
  人界: [
    { name:'步行',       speed:1,    cost:null },
    { name:'骑马',       speed:2,    cost:null },
    { name:'御器飞行',   speed:5,    cost:null },
    { name:'御剑飞行',   speed:10,   cost:null },
    { name:'传送阵',     speed:50,   cost:'灵石' },
    { name:'血遁秘术',   speed:20,   cost:'气血' }
  ],
  灵界: [
    { name:'普通遁光',   speed:10,   cost:null },
    { name:'空间瞬移',   speed:50,   cost:null },
    { name:'大型传送阵', speed:200,  cost:'灵石' },
    { name:'破空符',     speed:100,  cost:'符箓' },
    { name:'撕裂虚空',   speed:500,  cost:null, risk:'迷路' }
  ],
  仙界: [
    { name:'仙遁术',     speed:100,  cost:null },
    { name:'界域传送阵', speed:1000, cost:'仙灵石' },
    { name:'空间法则',   speed:5000, cost:null },
    { name:'挪移仙符',   speed:3000, cost:'仙符' },
    { name:'时空穿梭',   speed:10000,cost:'寿元' },
    { name:'言出法随',   speed:Infinity, cost:null }
  ]
};

// ============================================================
// ⑤ 神识系统 内部数据
// ============================================================

/** 神识独立等级 */
const DIVINE_SENSE_LEVELS = [
  { name:'开识',     min:10,     max:50,    realm:'凡人~练气初期',     unlocks:['基础探查'] },
  { name:'凝识',     min:50,     max:200,   realm:'练气中期~筑基初期', unlocks:['深度探查','冥想淬炼'] },
  { name:'化识',     min:200,    max:800,   realm:'筑基中期~金丹初期', unlocks:['大范围扫描','神识攻击'] },
  { name:'神识如丝', min:800,    max:3000,  realm:'金丹中期~元婴初期', unlocks:['魂海探索','神识化形'] },
  { name:'神识化海', min:3000,   max:10000, realm:'元婴中期~化神',     unlocks:['神识冲穴','分神术'] },
  { name:'神识领域', min:10000,  max:50000, realm:'炼虚~合体',         unlocks:['领域展开','多人压制'] },
  { name:'神识通玄', min:50000,  max:200000,realm:'大乘~渡劫',         unlocks:['跨界探查','一念万里'] },
  { name:'神识造化', min:200000, max:1000000,realm:'真仙~金仙',        unlocks:['神识创造','模拟推演'] },
  { name:'神识混沌', min:1000000,max:Infinity,realm:'太乙以上',        unlocks:['窥探天机','法则推演'] }
];

/** 神识功能耗时表（天） */
const DIVINE_SENSE_TIME_TABLE = {
  基础探查:  { 凡人:1, 练气:1, 筑基:2, 金丹:3, 元婴:5, 化神:7 },
  深度探查:  { 凡人:null,练气:3,筑基:5, 金丹:7, 元婴:10,化神:15 },
  大范围扫描:{ 凡人:null,练气:null,筑基:7,金丹:10,元婴:15,化神:30 },
  冥想淬炼:  { 凡人:1, 练气:2, 筑基:3, 金丹:5, 元婴:10,化神:15 },
  魂海探索:  { 凡人:null,练气:null,筑基:7,金丹:10,元婴:20,化神:30 },
  神识冲穴:  { 凡人:null,练气:null,筑基:null,金丹:15,元婴:30,化神:45 },
  修养恢复:  { 凡人:1, 练气:1, 筑基:2, 金丹:3, 元婴:5, 化神:7 }
};

/** 探查失败惩罚池 */
const PROBE_FAILURE_POOL = [
  { id:1, name:'神识反噬',        effect:'神识扣30%', state:'神识紊乱',  stateDays:3, stateDesc:'修炼速度减半' },
  { id:2, name:'惊动妖兽',        effect:'强制战斗',   state:null,      stateDays:0, stateDesc:'敌人先手攻击' },
  { id:3, name:'触发禁制',        effect:'气血-20%',   state:'残魂攻击', stateDays:0, stateDesc:'触发小战斗' },
  { id:4, name:'迷失方向',        effect:'额外+5天',   state:null,      stateDays:5, stateDesc:'额外消耗5天返回' },
  { id:5, name:'魂兽入侵',        effect:'上限-5',     state:'神识上限永久减损', stateDays:0, stateDesc:'神识上限永久-5' },
  { id:6, name:'被追踪',          effect:'位置暴露',   state:'被伏击标记', stateDays:0, stateDesc:'下次探索该区域遭遇伏击' }
];

/** 神识拼斗策略 */
const COMBAT_STRATEGIES = {
  平刺: { mpCost:0.05, power:0.8,  desc:'消耗5%神识，强度x0.8' },
  重击: { mpCost:0.15, power:1.5,  desc:'消耗15%神识，强度x1.5' },
  魂刺: { mpCost:0.02, power:3.0,  permanent:true,  desc:'永久消耗2%神识上限，强度x3.0' },
  壁垒: { mpCost:0.03, damageReduction:0.70, desc:'消耗3%神识，减伤70%' },
  缠绕: { mpCost:0.08, drainDouble:true,     desc:'消耗8%神识，令对方消耗翻倍' },
  震慑: { mpCost:0.10, stun:true,            desc:'消耗10%神识，令对方无法行动' },
  撤逃: { retain:0.50, desc:'保留50%神识逃跑' }
};

/** AI类型 */
const COMBAT_AI_TYPES = {
  妖兽魂体: { style:'猛攻',   desc:'偏好重击和魂刺' },
  上古残魂: { style:'技巧',   desc:'灵活切换攻防' },
  敌对修士: { style:'策略',   desc:'根据战况调整' },
  秘境禁制: { style:'反伤',   desc:'防御时反弹伤害' }
};

// ============================================================
// ⑥ 炼体系统 内部数据
// ============================================================

/** 炼体境界 */
const BODY_REALMS = [
  // idx=数组下标  fidx=GDD公式索引(铜皮=0 铁骨=1 银髓=2 金身=3 玉骨=4 圣体=5 梵圣=6)
  { name:'凡体',     idx:0, fidx:-1, bodyMulti:1.0,  unlockRealm:'初始', hpBonus:0,    defBonus:0,    damageReduction:0 },
  { name:'铜皮',     idx:1, fidx:0,  bodyMulti:1.5,  unlockRealm:'练气', hpBonus:0.50, defBonus:0.50, damageReduction:0 },
  { name:'铁骨',     idx:2, fidx:1,  bodyMulti:2.0,  unlockRealm:'筑基', hpBonus:1.00, defBonus:1.00, damageReduction:0 },
  { name:'银髓',     idx:3, fidx:2,  bodyMulti:3.0,  unlockRealm:'金丹', hpBonus:2.00, defBonus:2.00, damageReduction:0.10 },
  { name:'金身',     idx:4, fidx:3,  bodyMulti:5.0,  unlockRealm:'元婴', hpBonus:4.00, defBonus:4.00, damageReduction:0.20 },
  { name:'玉骨',     idx:5, fidx:4,  bodyMulti:8.0,  unlockRealm:'化神', hpBonus:7.00, defBonus:7.00, damageReduction:0.30 },
  { name:'圣体',     idx:6, fidx:5,  bodyMulti:15.0, unlockRealm:'炼虚', hpBonus:14.00,defBonus:14.00,damageReduction:0.40 },
  { name:'梵圣真身', idx:7, fidx:6,  bodyMulti:30.0, unlockRealm:'合体', hpBonus:29.00,defBonus:29.00,damageReduction:0.50 }
];

/** 各境界升级基础值 */
const BODY_BASE_VALUES = {
  铜皮:10, 铁骨:80, 银髓:600, 金身:4000, 玉骨:25000, 圣体:150000, 梵圣真身:1000000
};

/** 炼体方式（12种） */
const BODY_TEMPER_METHODS = [
  { id:1,  name:'药浴炼体', days:7,   gainMin:0.05, gainMax:0.10, condition:'消耗药材',           risk:null },
  { id:2,  name:'雷击炼体', days:15,  gainMin:0.15, gainMax:0.25, condition:'雷雨天气/雷暴区域',   risk:'失败扣气血30%' },
  { id:3,  name:'重力修炼', days:10,  gainMin:0.08, gainMax:0.15, condition:'消耗灵石',             risk:'低' },
  { id:4,  name:'战斗淬炼', days:0,   gainMin:0.01, gainMax:0.05, condition:'战斗胜利',             risk:null },
  { id:5,  name:'月华炼体', days:1,   gainMin:0.02, gainMax:0.05, condition:'夜晚+满月(每月15)',   risk:null },
  { id:6,  name:'煞气炼体', days:10,  gainMin:0.15, gainMax:0.25, condition:'古战场/万人坑',        risk:'煞气入体危险' },
  { id:7,  name:'地煞炼体', days:15,  gainMin:0.10, gainMax:0.18, condition:'地脉深处',             risk:'低概率地火爆发' },
  { id:8,  name:'天罡炼体', days:7,   gainMin:0.08, gainMax:0.15, condition:'山巅+晴夜+星辰',      risk:'无但条件苛刻' },
  { id:9,  name:'万毒炼体', days:10,  gainMin:0.20, gainMax:0.35, condition:'背包≥3种毒物材料',    risk:'中毒扣血7天' },
  { id:10, name:'阴阳交汇', days:3,   gainMin:0.25, gainMax:0.40, condition:'昼夜交替+特殊地点',    risk:'极低概率走火' },
  { id:11, name:'血祭炼体', days:0,   gainMin:0.30, gainMax:0.50, condition:'消耗10%寿元上限',      risk:'永久扣寿元' },
  { id:12, name:'灵压淬体', days:5,   gainMin:0.10, gainMax:0.20, condition:'高阶存在威压下修炼',   risk:'需找到高阶配合' }
];

/** 凡人界可用境界顺序 */
const HUMAN_REALMS = ['凡人','练气','筑基','金丹','元婴','化神'];


// ============================================================
// Cultivation 类
// ============================================================

class Cultivation {

  /**
   * @param {object} DATA - 全局数值常量模块
   */
  constructor(DATA) {
    this.DATA = DATA;

    // ---- 运行时状态 ----
    this._spiritArray = null;        // { level, bonus, remainingDays }
    this._location = '普通洞府';     // 当前修炼地点名
    this._locationBonus = 0;         // 地点加成
  }

  // ==========================================================
  // ④ 修炼系统
  // ==========================================================

  /** 获取某项操作在当前境界的耗时（天） */
  getTimeCost(action, realm) {
    const t = TIME_COST_TABLE[action];
    if (!t) throw new Error(`未知操作: ${action}`);
    const days = t[realm];
    if (days === null || days === undefined) throw new Error(`境界 ${realm} 不支持操作 ${action}`);
    return days;
  }

  /**
   * 打坐（主动修炼）
   * @param {string} realm - 当前境界
   * @param {number} [customDays] - 可选自定义天数，不传则用默认
   * @returns {{ days:number, multiplier:number, desc:string }}
   */
  meditate(realm, customDays) {
    const baseDays = this.getTimeCost('打坐', realm);
    const days = customDays || baseDays;
    return {
      days,
      multiplier: 3.0,
      desc: `打坐修炼${days}天，速度是挂机的3倍，消耗灵力`
    };
  }

  /**
   * 闭关
   * @param {string} realm
   * @param {number} [customDays]
   * @returns {{ days:number, multiplier:number, desc:string }}
   */
  closedDoor(realm, customDays) {
    const baseDays = this.getTimeCost('闭关', realm);
    const days = customDays || baseDays;
    return {
      days,
      multiplier: 3.0 * 1.17, // 打坐基础 × 闭关加成
      desc: `闭关${days}天，额外1.17倍闭关加成`
    };
  }

  /**
   * 吐纳（自动挂机）
   * @returns {{ days:0, multiplier:number, desc:string }}
   */
  breathe() {
    return {
      days: 0,
      multiplier: 1.0,
      desc: '吐纳挂机，不消耗天数，速度慢但稳定'
    };
  }

  /**
   * 计算修炼收益
   * @param {string} realm   当前境界
   * @param {string} method  修炼方式 '打坐'|'闭关'|'吐纳'
   * @param {number} days    修炼天数
   * @param {object} playerState { mp, spiritRoot }
   * @returns {{ cultivationGain:number, mpCost:number }}
   */
  calcCultivationGain(realm, method, days, playerState) {
    let baseMultiplier = 1.0;
    let mpCostPerDay = 0;

    switch (method) {
      case '打坐':
        baseMultiplier = 3.0;
        mpCostPerDay = 5; // 每秒灵力消耗简化
        break;
      case '闭关':
        baseMultiplier = 3.0 * 1.17;
        mpCostPerDay = 5;
        break;
      case '吐纳':
        baseMultiplier = 1.0;
        mpCostPerDay = 0;
        break;
      default:
        throw new Error(`未知修炼方式: ${method}`);
    }

    // 灵根速度加成
    let rootMultiplier = 1.0;
    if (playerState.spiritRoot && this.DATA.SPIRIT_ROOT) {
      const root = this.DATA.SPIRIT_ROOT.types[playerState.spiritRoot];
      if (root) rootMultiplier = root.speedMulti;
    }

    // 聚灵阵加成
    let arrayBonus = 0;
    if (this._spiritArray && this._spiritArray.remainingDays > 0) {
      arrayBonus = this._spiritArray.bonus;
    }

    // 地点加成
    const locationBonus = this._locationBonus;

    const totalMultiplier = baseMultiplier * rootMultiplier * (1 + arrayBonus + locationBonus);
    const cultivationGain = days * totalMultiplier; // 每天获取的修为基数（具体数值由外部乘数决定）
    const mpCost = days * mpCostPerDay;

    // 检查灵力是否足够
    const actualDays = (mpCostPerDay > 0 && playerState.mp < mpCost)
      ? Math.floor(playerState.mp / mpCostPerDay)
      : days;

    return {
      cultivationGain: actualDays * totalMultiplier,
      mpCost: actualDays * mpCostPerDay,
      actualDays,
      totalMultiplier,
      breakdown: {
        baseMultiplier,
        rootMultiplier,
        arrayBonus,
        locationBonus
      }
    };
  }

  // ---- 聚灵阵 ----

  /** 获取聚灵阵列表 */
  getSpiritArrays() {
    return SPIRIT_ARRAY_TABLE.map((a, i) => ({ ...a, level: i }));
  }

  /**
   * 激活聚灵阵
   * @param {number} level 0~3
   * @param {number} currentRealmIndex 境界索引
   * @returns {{ success:boolean, config:object|null, msg:string }}
   */
  activateSpiritArray(level, currentRealmIndex) {
    if (level < 0 || level >= SPIRIT_ARRAY_TABLE.length) {
      return { success: false, config: null, msg: `无效聚灵阵级别: ${level}` };
    }
    const config = SPIRIT_ARRAY_TABLE[level];
    const realmOrder = ['凡人','练气','筑基','金丹','元婴','化神'];
    const requiredIdx = realmOrder.indexOf(config.unlock);
    if (currentRealmIndex < requiredIdx) {
      return { success: false, config, msg: `需要${config.unlock}期才能激活` };
    }
    this._spiritArray = {
      level,
      bonus: config.bonus,
      remainingDays: config.duration
    };
    return {
      success: true,
      config,
      msg: `${config.name}已激活，持续${config.duration}天，加成+${(config.bonus*100).toFixed(0)}%`
    };
  }

  /** 推进聚灵阵天数 */
  tickSpiritArray(days) {
    if (!this._spiritArray || this._spiritArray.remainingDays <= 0) {
      this._spiritArray = null;
      return;
    }
    this._spiritArray.remainingDays -= days;
    if (this._spiritArray.remainingDays <= 0) {
      this._spiritArray = null;
    }
  }

  /** 获取当前聚灵阵状态 */
  getSpiritArrayStatus() {
    if (!this._spiritArray) return null;
    return { ...this._spiritArray };
  }

  // ---- 修炼地点 ----

  /** 获取所有修炼地点 */
  getLocations() {
    return LOCATION_TABLE;
  }

  /**
   * 切换修炼地点
   * @param {string} locationName
   * @param {object} playerState { spiritStone, etc. }
   * @returns {{ success:boolean, switchDays:number, msg:string }}
   */
  setLocation(locationName, playerState) {
    const loc = LOCATION_TABLE.find(l => l.name === locationName);
    if (!loc) return { success: false, switchDays: 0, msg: `未知修炼地点: ${locationName}` };

    // 检查解锁条件
    if (loc.unlock === '500灵石') {
      if ((playerState.spiritStone || 0) < 500) {
        return { success: false, switchDays: 0, msg: '灵石不足500，无法开辟灵脉洞府' };
      }
    }

    const oldLocation = this._location;
    this._location = loc.name;
    this._locationBonus = loc.bonus;

    return {
      success: true,
      switchDays: loc.switchDays,
      msg: loc.switchDays > 0
        ? `从${oldLocation}切换至${loc.name}，耗时${loc.switchDays}天`
        : `当前位于${loc.name}`
    };
  }

  getLocationStatus() {
    return { name: this._location, bonus: this._locationBonus };
  }

  // ---- 赶路 ----

  /**
   * 获取某界域所有赶路方式
   * @param {string} realmCategory '人界'|'灵界'|'仙界'
   */
  getTravelMethods(realmCategory) {
    return TRAVEL_METHODS[realmCategory] || [];
  }

  /**
   * 计算赶路天数
   * @param {number} distance      基准距离
   * @param {string} methodName    赶路方式名
   * @param {string} realmCategory '人界'|'灵界'|'仙界'
   * @returns {{ days:number, method:object|null, msg:string }}
   */
  travel(distance, methodName, realmCategory) {
    const methods = TRAVEL_METHODS[realmCategory];
    if (!methods) return { days: Infinity, method: null, msg: `未知界域: ${realmCategory}` };

    const method = methods.find(m => m.name === methodName);
    if (!method) return { days: Infinity, method: null, msg: `未知赶路方式: ${methodName}` };

    const days = Math.ceil(distance / method.speed);

    let msg = `${methodName}赶路，距离${distance}，速度x${method.speed === Infinity ? '∞' : method.speed}`;
    if (method.cost) msg += `，消耗${method.cost}`;
    if (method.risk) msg += `，风险:${method.risk}`;
    msg += `，需${days}天`;

    return { days, method: { ...method }, msg };
  }

  /**
   * 自动选择最优赶路方式
   * @param {number} distance
   * @param {string} realmCategory
   * @param {object} playerState { realm, method 偏好 }
   */
  autoTravel(distance, realmCategory, playerState) {
    const methods = TRAVEL_METHODS[realmCategory];
    if (!methods || methods.length === 0) {
      return { days: distance, method: { name:'步行', speed:1 }, msg: '无可用赶路方式，步行' };
    }
    // 选最快可用
    const best = methods[methods.length - 1]; // 最后一个最快
    return this.travel(distance, best.name, realmCategory);
  }

  // ==========================================================
  // ⑤ 神识系统
  // ==========================================================

  /** 获取神识等级（根据强度值） */
  getDivineSenseLevel(strength) {
    for (let i = DIVINE_SENSE_LEVELS.length - 1; i >= 0; i--) {
      if (strength >= DIVINE_SENSE_LEVELS[i].min) {
        return { ...DIVINE_SENSE_LEVELS[i], levelIndex: i };
      }
    }
    return { ...DIVINE_SENSE_LEVELS[0], levelIndex: 0 };
  }

  /** 获取所有神识等级 */
  getDivineSenseLevels() {
    return DIVINE_SENSE_LEVELS;
  }

  /**
   * 神识淬炼
   * @param {string} method  '冥想淬炼'|'魂海探索'|'神识冲穴'|'修养恢复'
   * @param {string} realm   当前修为境界
   * @returns {{ days:number, gain:number, msg:string }}
   */
  temperDivineSense(method, realm) {
    const timeTable = DIVINE_SENSE_TIME_TABLE[method];
    if (!timeTable) throw new Error(`未知神识淬炼方式: ${method}`);

    const days = timeTable[realm];
    if (days === null || days === undefined) {
      throw new Error(`境界 ${realm} 不支持神识淬炼方式: ${method}`);
    }

    // 淬炼收益估算（每次淬炼获得的经验值）
    const gainMap = {
      冥想淬炼: { base:15, scale:1.0 },
      魂海探索: { base:40, scale:1.5 },
      神识冲穴: { base:80, scale:2.0 },
      修养恢复: { base:5,  scale:0.5 }
    };
    const g = gainMap[method];

    const realmIdx = HUMAN_REALMS.indexOf(realm);
    const gain = g.base * (1 + realmIdx * g.scale);

    return {
      days,
      gain: Math.round(gain),
      method,
      msg: `${method}${days}天，预计获得神识经验+${Math.round(gain)}`
    };
  }

  /**
   * 探查操作（含失败判定）
   * @param {string} action    '基础探查'|'深度探查'|'大范围扫描'
   * @param {string} realm     当前修为境界
   * @param {number} successRate 成功率 0~1
   * @returns {{ days:number, success:boolean, penalty:object|null }}
   */
  probe(action, realm, successRate) {
    const timeTable = DIVINE_SENSE_TIME_TABLE[action];
    if (!timeTable) throw new Error(`未知探查操作: ${action}`);

    const days = timeTable[realm];
    if (days === null || days === undefined) {
      throw new Error(`境界 ${realm} 不支持探查操作: ${action}`);
    }

    const roll = Math.random();
    const success = roll < successRate;

    if (success) {
      return { days, success: true, penalty: null, msg: `${action}成功，耗时${days}天` };
    }

    // 随机惩罚
    const penaltyIdx = Math.floor(Math.random() * PROBE_FAILURE_POOL.length);
    const penalty = { ...PROBE_FAILURE_POOL[penaltyIdx] };

    return {
      days: days + penalty.stateDays,
      success: false,
      penalty,
      msg: `${action}失败！${penalty.name}：${penalty.effect}，${penalty.stateDesc}`
    };
  }

  /** 获取探查失败惩罚池（只读） */
  getProbeFailurePool() {
    return PROBE_FAILURE_POOL;
  }

  // ---- 神识拼斗 ----

  /** 获取可用策略列表 */
  getCombatStrategies() {
    return Object.entries(COMBAT_STRATEGIES).map(([k, v]) => ({ name: k, ...v }));
  }

  /** 获取AI类型 */
  getCombatAITypes() {
    return COMBAT_AI_TYPES;
  }

  /**
   * 神识拼斗单回合
   * @param {object} player   { divineSense, divineSenseMax }
   * @param {object} enemy    { name, divineSense, aiType }
   * @param {string} playerStrategy 策略名
   * @returns {{ playerHp:number, enemyHp:number, log:string, playerAlive:boolean, enemyAlive:boolean }}
   */
  divineSenseCombatRound(player, enemy, playerStrategy) {
    const pStrat = COMBAT_STRATEGIES[playerStrategy];
    if (!pStrat) throw new Error(`未知策略: ${playerStrategy}`);

    // 玩家行动
    let pCost, pDamage, log = '';

    if (playerStrategy === '撤逃') {
      const retained = Math.floor(player.divineSense * pStrat.retain);
      player.divineSense = retained;
      return {
        playerHp: player.divineSense, enemyHp: enemy.divineSense,
        log: `玩家撤退，保留${retained}神识`,
        playerAlive: true, enemyAlive: true, fled: true
      };
    }

    if (pStrat.permanent) {
      pCost = Math.floor(player.divineSenseMax * pStrat.mpCost);
      player.divineSenseMax -= pCost;
      player.divineSense = Math.min(player.divineSense, player.divineSenseMax);
    } else {
      pCost = Math.floor(player.divineSense * pStrat.mpCost);
      player.divineSense -= pCost;
    }

    if (pStrat.power) {
      pDamage = Math.floor(player.divineSense * pStrat.power);
    } else if (pStrat.damageReduction) {
      pDamage = 0; // 壁垒不攻击
    } else if (pStrat.drainDouble) {
      pDamage = 0; // 缠绕不直接攻击
    }

    log += `玩家使用"${playerStrategy}"`;

    // AI行动
    const ai = COMBAT_AI_TYPES[enemy.aiType] || COMBAT_AI_TYPES['妖兽魂体'];
    let aiStrategy;
    if (ai.style === '猛攻') {
      aiStrategy = Math.random() < 0.5 ? '重击' : '魂刺';
    } else if (ai.style === '技巧') {
      const r = Math.random();
      aiStrategy = r < 0.4 ? '平刺' : r < 0.7 ? '壁垒' : '重击';
    } else if (ai.style === '策略') {
      const r = Math.random();
      aiStrategy = r < 0.3 ? '平刺' : r < 0.5 ? '壁垒' : r < 0.8 ? '缠绕' : '震慑';
    } else { // 反伤
      aiStrategy = '壁垒';
    }

    const aiStrat = COMBAT_STRATEGIES[aiStrategy];
    let aiCost = Math.floor(enemy.divineSense * aiStrat.mpCost);
    enemy.divineSense -= aiCost;
    let aiDamage = 0;
    if (aiStrat.power) {
      aiDamage = Math.floor(enemy.divineSense * aiStrat.power);
    }
    log += `，${enemy.aiType}使用"${aiStrategy}"`;

    // 计算伤害
    if (pStrat.stun) {
      // 震慑令对方无法行动
      aiDamage = 0;
    }
    if (aiStrat.stun) {
      pDamage = 0;
    }

    // 应用减伤
    let playerDamageTaken = aiDamage;
    if (pStrat.damageReduction) {
      playerDamageTaken = Math.floor(aiDamage * (1 - pStrat.damageReduction));
    }

    let enemyDamageTaken = pDamage;
    if (aiStrat.damageReduction) {
      // 反伤
      enemyDamageTaken = Math.floor(pDamage * (1 - aiStrat.damageReduction));
      if (ai.style === '反伤') {
        playerDamageTaken += Math.floor(pDamage * 0.5); // 反弹50%
      }
    }

    if (pStrat.drainDouble) {
      // 缠绕：对方消耗翻倍
      aiCost = Math.floor(aiCost * 2);
      enemy.divineSense -= aiCost; // 额外扣除
    }

    player.divineSense -= playerDamageTaken;
    enemy.divineSense -= enemyDamageTaken;

    log += ` | 玩家-${playerDamageTaken}，敌人-${enemyDamageTaken}`;

    const playerAlive = player.divineSense > 0;
    const enemyAlive = enemy.divineSense > 0;

    if (!playerAlive) log += '，玩家神识枯竭';
    if (!enemyAlive) log += '，敌人神识枯竭';

    return {
      playerHp: Math.max(0, player.divineSense),
      enemyHp: Math.max(0, enemy.divineSense),
      log,
      playerAlive,
      enemyAlive
    };
  }

  /**
   * 神识拼斗完整流程
   * @param {object} player   { divineSense, divineSenseMax }
   * @param {object} enemy    { name, divineSense, aiType }
   * @param {string[]} strategies  每回合策略数组
   * @returns {{ victory:boolean, rounds:object[], reward:object|null }}
   */
  divineSenseCombat(player, enemy, strategies) {
    const p = { divineSense: player.divineSense, divineSenseMax: player.divineSenseMax };
    const e = { ...enemy };
    const rounds = [];
    let victory = false;

    for (let i = 0; i < strategies.length; i++) {
      const result = this.divineSenseCombatRound(p, e, strategies[i]);
      result.round = i + 1;
      rounds.push(result);

      if (result.fled) {
        victory = false;
        break;
      }

      if (!result.playerAlive) {
        victory = false;
        break;
      }

      if (!result.enemyAlive) {
        victory = true;
        break;
      }
    }

    // 未分出胜负（回合用尽，按剩余比例判）
    if (rounds.length > 0 && rounds[rounds.length - 1].playerAlive && rounds[rounds.length - 1].enemyAlive) {
      victory = p.divineSense >= e.divineSense;
    }

    const reward = victory ? {
      senseUp: 5 + Math.floor(Math.random() * 11), // 5~15
      description: '神识上限+5~15 + 对方遗留物品'
    } : {
      senseState: '神识受创',
      stateDays: 5,
      description: '神识清空+神识受创状态5天'
    };

    return { victory, rounds, playerFinal: p, enemyFinal: e, reward };
  }

  // ==========================================================
  // ⑥ 炼体系统
  // ==========================================================

  /** 获取所有炼体境界 */
  getBodyRealms() {
    return BODY_REALMS;
  }

  /**
   * 获取炼体境界数据
   * @param {number} realmIndex 0~7
   */
  getBodyRealm(realmIndex) {
    if (realmIndex < 0 || realmIndex >= BODY_REALMS.length) {
      throw new Error(`炼体境界索引越界: ${realmIndex}`);
    }
    return { ...BODY_REALMS[realmIndex] };
  }

  /**
   * 计算升到指定等级所需炼体值
   * 公式：Lv(N) = 基础值 × 三角数(N) × 境界系数
   * 三角数(N) = N×(N+1)÷2
   * 境界系数 = 1 + 0.4 × 炼体大境界索引
   *
   * @param {string} realmName 炼体境界名（铜皮/铁骨/银髓/金身/玉骨/圣体/梵圣真身）
   * @param {number} level 1~10
   * @returns {{ thisLevel:number, cumulative:number, breakthrough:number }}
   */
  calcBodyExpNeeded(realmName, level) {
    if (level < 1 || level > 10) throw new Error(`炼体等级 1~10，当前: ${level}`);
    const base = BODY_BASE_VALUES[realmName];
    if (base === undefined) throw new Error(`未知炼体境界: ${realmName}`);

    const realm = BODY_REALMS.find(r => r.name === realmName);
    if (!realm) throw new Error(`未找到炼体境界: ${realmName}`);

    const triangular = (level * (level + 1)) / 2;
    const coefficient = 1 + 0.4 * realm.fidx;  // GDD公式索引（铜皮=0）
    const thisLevel = Math.round(base * triangular * coefficient);

    // 累计所有等级
    let cumulative = 0;
    for (let lv = 1; lv <= level; lv++) {
      const tri = (lv * (lv + 1)) / 2;
      cumulative += Math.round(base * tri * coefficient);
    }

    // 突破瓶颈 = Lv10 累计 × 1.5
    const breakthrough = level === 10 ? Math.round(cumulative * 1.5) : 0;

    return { thisLevel, cumulative, breakthrough };
  }

  /**
   * 获取某个炼体境界的完整升级表（Lv1~10 + 突破）
   * @param {string} realmName
   * @returns {object[]}
   */
  getBodyRealmLevelTable(realmName) {
    const table = [];
    let totalCumulative = 0;
    for (let lv = 1; lv <= 10; lv++) {
      const result = this.calcBodyExpNeeded(realmName, lv);
      table.push({
        level: lv,
        thisLevel: result.thisLevel,
        cumulative: result.cumulative
      });
      totalCumulative = result.cumulative;
    }
    const breakthrough = Math.round(totalCumulative * 1.5);
    return { realm: realmName, levels: table, breakthrough };
  }

  /** 获取全部炼体方式 */
  getBodyTemperMethods() {
    return BODY_TEMPER_METHODS;
  }

  /**
   * 炼体操作
   * @param {number} methodId  方式ID 1~12
   * @param {object} playerState  { bodyRealm, bodyLevel, bodyExp, bodyRealmCumulative(bodyRealmName) }
   * @param {object} conditions  检查条件 { hasHerbs, isThunderWeather, isNight, isFullMoon, ... }
   * @returns {{ success:boolean, days:number, gainPercent:number, msg:string, risk:object|null }}
   */
  temperBody(methodId, playerState, conditions) {
    const method = BODY_TEMPER_METHODS.find(m => m.id === methodId);
    if (!method) return { success: false, days: 0, gainPercent: 0, msg: `未知炼体方式ID: ${methodId}`, risk: null };

    // 检查条件
    if (method.condition) {
      const condResult = this._checkBodyTemperCondition(method, conditions);
      if (!condResult.pass) {
        return { success: false, days: 0, gainPercent: 0, msg: condResult.msg, risk: null };
      }
    }

    // 风险判定
    const riskResult = this._checkBodyTemperRisk(method);

    // 随机收益百分比
    const gainPercent = method.gainMin + Math.random() * (method.gainMax - method.gainMin);

    // 实际获得炼体经验 = 当前境界总需求 × 百分比
    const realmTotal = this.calcBodyExpNeeded(playerState.bodyRealm, 10).cumulative;
    const gainExp = Math.round(realmTotal * gainPercent);

    return {
      success: !riskResult.failed,
      days: method.days,
      gainPercent,
      gainExp,
      method: method.name,
      msg: riskResult.failed
        ? `${method.name}失败！${riskResult.msg}`
        : `${method.name}完成，获得炼体经验+${gainExp}（${(gainPercent*100).toFixed(1)}%）`,
      risk: riskResult
    };
  }

  /**
   * 检查炼体条件是否满足
   * @private
   */
  _checkBodyTemperCondition(method, conditions) {
    const cond = method.condition;
    // 简化条件检查
    if (cond.includes('药材')) {
      if (!conditions.hasHerbs) return { pass: false, msg: '缺少药材' };
    }
    if (cond.includes('雷雨') || cond.includes('雷暴')) {
      if (!conditions.isThunderWeather) return { pass: false, msg: '当前非雷雨天气' };
    }
    if (cond.includes('灵石')) {
      if (!conditions.hasSpiritStone) return { pass: false, msg: '灵石不足' };
    }
    if (cond.includes('战斗胜利')) {
      if (!conditions.battleWon) return { pass: false, msg: '需要战斗胜利' };
    }
    if (cond.includes('夜晚') || cond.includes('满月')) {
      if (!conditions.isNight) return { pass: false, msg: '需要夜晚' };
      if (cond.includes('满月') && !conditions.isFullMoon) return { pass: false, msg: '需要满月（每月15日）' };
    }
    if (cond.includes('古战场') || cond.includes('万人坑')) {
      if (conditions.location !== '古战场' && conditions.location !== '万人坑') {
        return { pass: false, msg: '需要在古战场/万人坑' };
      }
    }
    if (cond.includes('地脉')) {
      if (!conditions.isDeepEarth) return { pass: false, msg: '需要在地脉深处' };
    }
    if (cond.includes('山巅') || cond.includes('星辰')) {
      if (!conditions.isMountainTop) return { pass: false, msg: '需要在山巅' };
      if (!conditions.isClearNight) return { pass: false, msg: '需要晴夜' };
    }
    if (cond.includes('毒物')) {
      if ((conditions.poisonCount || 0) < 3) return { pass: false, msg: '需要至少3种毒物材料' };
    }
    if (cond.includes('昼夜交替')) {
      if (!conditions.isDawnOrDusk) return { pass: false, msg: '需要昼夜交替时刻' };
      if (!conditions.isSpecialLocation) return { pass: false, msg: '需要在特殊地点' };
    }
    if (cond.includes('寿元')) {
      // 血祭无条件门槛，只需玩家确认
    }
    if (cond.includes('高阶')) {
      if (!conditions.hasHighRealmNearby) return { pass: false, msg: '附近无高阶存在' };
    }
    return { pass: true };
  }

  /**
   * 检查炼体风险
   * @private
   */
  _checkBodyTemperRisk(method) {
    if (!method.risk) return { failed: false, msg: '' };

    const risk = method.risk;

    if (risk === '低') {
      return Math.random() < 0.05
        ? { failed: true, msg: '低概率意外' }
        : { failed: false, msg: '' };
    }

    if (risk.includes('失败扣气血30%')) {
      return Math.random() < 0.15
        ? { failed: true, msg: '雷击失败，气血-30%' }
        : { failed: false, msg: '' };
    }

    if (risk.includes('煞气入体')) {
      return Math.random() < 0.2
        ? { failed: true, msg: '煞气入体！' }
        : { failed: false, msg: '' };
    }

    if (risk.includes('地火爆发')) {
      return Math.random() < 0.08
        ? { failed: true, msg: '地火爆发！' }
        : { failed: false, msg: '' };
    }

    if (risk.includes('中毒扣血')) {
      return { failed: false, msg: '', sideEffect: '中毒扣血7天' }; // 必然中毒
    }

    if (risk.includes('走火')) {
      return Math.random() < 0.02
        ? { failed: true, msg: '走火入魔！' }
        : { failed: false, msg: '' };
    }

    if (risk.includes('永久扣寿元')) {
      return { failed: false, msg: '' }; // 必然扣，由调用方处理
    }

    if (risk.includes('高阶配合')) {
      return { failed: false, msg: '' }; // 条件已在 _checkCondition 检查
    }

    return { failed: false, msg: '' };
  }

  // ==========================================================
  // 综合辅助
  // ==========================================================

  /**
   * 时间推进（每帧/每秒调用）
   * 推进聚灵阵计时等
   * @param {number} days 经过天数
   */
  tick(days) {
    this.tickSpiritArray(days);
  }

  /** 获取完整状态快照 */
  getState() {
    return {
      spiritArray: this._spiritArray ? { ...this._spiritArray } : null,
      location: this._location,
      locationBonus: this._locationBonus
    };
  }

  /** 序列化 */
  serialize() {
    return JSON.stringify(this.getState());
  }

  /** 反序列化 */
  deserialize(json) {
    const state = JSON.parse(json);
    if (state.spiritArray) this._spiritArray = state.spiritArray;
    this._location = state.location || '普通洞府';
    this._locationBonus = state.locationBonus || 0;
  }

  /** 获取耗时表（只读） */
  getTimeCostTable() {
    return TIME_COST_TABLE;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Cultivation };
}
// 浏览器环境：挂载到 window
if (typeof window !== 'undefined') {
  window.Cultivation = Cultivation;
}
