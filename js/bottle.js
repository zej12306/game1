/**
 * bottle.js — ㉑掌天瓶 核心金手指模块
 * 基于 GDD 行1559~1653 设计，覆盖 4步任务链、7级功能解锁、
 * 灵田仓库、绿液20用途、器灵绿儿、30特殊事件。
 *
 * 依赖：DATA（全局常量模块）
 * 导出：Bottle 类
 */

/* ================================================================
 *  一、常量定义
 * ================================================================ */

/** 任务链 4 步 */
const QUEST_CHAIN = [
  {
    step: 1,
    name: '避雨入洞',
    desc: '青云山采药时突降大雨，避雨时发现被藤蔓遮掩的山洞。',
    action: 'explore',      // 探索触发
    result: '发现山洞入口',
  },
  {
    step: 2,
    name: '岔路迷宫',
    desc: '洞内岔路错综，需连续正确选择3次方向（神识≥30可感知正确路径）。走错则遭遇蝙蝠战斗（练气级）。',
    condition: { sp: 30 },  // 神识 ≥30
    choicesNeeded: 3,        // 需答对3次
    failBattle: { name: '蝙蝠', realm: '练气', hp: 150, atk: 20 },
    result: '到达洞底石室',
  },
  {
    step: 3,
    name: '三问考验',
    desc: '骸骨前三问：修行之本在于何？·瓶中物可活人亦可？·修行路上最该舍者何？',
    questions: [
      { q: '修行之本在于何？', answer: '心',   penalty: '修为-10%' },
      { q: '瓶中物，可活人亦可……？', answer: '杀人', penalty: '气血-10%' },
      { q: '修行路上，最该舍者何？', answer: '执念', penalty: '寿元-10%' },
    ],
    result: '三问全对，获得掌天瓶',
  },
  {
    step: 4,
    name: '传承获得',
    desc: '骸骨化为飞灰，获得掌天瓶 + 散修药师炼药心得（炼丹经验+500）。三日后凝聚第一滴绿液。',
    rewards: { alchemyExp: 500, firstDropDays: 3 },
    result: '掌天瓶入手',
  },
];

/**
 * 7 级功能解锁表（按修为境界）
 * key = 境界名
 */
const UNLOCK_TABLE = {
  练气: {
    condenseDays: 30,        // 凝聚天数/滴
    maxStorage: 10,          // 存储上限（滴）
    greenYears: 50,          // 绿液年份
    fields: 0,               // 灵田块数
    timeAccel: 1,            // 时间加速比
    features: ['基础催熟(+50年)'],
  },
  筑基: {
    condenseDays: 25,
    maxStorage: 20,
    greenYears: 50,
    fields: 0,
    timeAccel: 1,
    features: ['主动凝聚(10天+40%灵力)', '基础催熟(+50年)'],
  },
  金丹: {
    condenseDays: 20,
    maxStorage: 50,
    greenYears: 50,
    fields: 1,               // 1块灵田 / 9株
    timeAccel: 1,
    features: ['基础催熟(+50年)', '灵田(1块/9株)'],
  },
  元婴: {
    condenseDays: 15,
    maxStorage: 100,
    greenYears: 200,
    fields: 3,
    timeAccel: 2,
    features: ['绿液+200年份', '灵田(3块)'],
  },
  化神: {
    condenseDays: 10,
    maxStorage: 200,
    greenYears: 800,
    fields: 5,
    timeAccel: 3,
    features: ['绿液+800年份', '涂抹法宝(0.5%+1品阶)', '灵田(5块)'],
  },
  灵界: {
    condenseDays: 7,
    maxStorage: 500,
    greenYears: 1500,
    fields: 10,              // 绿儿管理
    timeAccel: 4,
    features: ['绿液+1500年份', '灵田10块(绿儿管)', '器灵苏醒'],
  },
  大罗: {
    condenseDays: 0,         // 瞬凝
    maxStorage: Infinity,
    greenYears: 10000,
    fields: Infinity,
    timeAccel: 10,           // 可调
    features: ['瞬凝·无限', '绿液+万年', '法则催熟', '无限灵田'],
  },
};

/** 境界 → 解锁表的顺序映射 */
const REALM_ORDER = ['练气', '筑基', '金丹', '元婴', '化神', '灵界', '大罗'];

/**
 * 绿液 20 种用途
 * id / name / cost(滴) / effect / require (最低解锁境界)
 */
const GREEN_LIQUID_USES = [
  { id: 1,  name: '催熟灵草',      cost: 1,    effect: '1滴+对应年份',                require: '练气',  category: '种植' },
  { id: 2,  name: '催熟灵果树',    cost: 5,    effect: '年份翻倍',                     require: '练气',  category: '种植' },
  { id: 3,  name: '灌溉灵田',      cost: 1,    effect: '1滴/块·肥沃+10%/7天',          require: '金丹',  category: '种植' },
  { id: 4,  name: '炼丹辅料',      cost: 1,    effect: '品质+1档',                     require: '练气',  category: '炼丹' },
  { id: 5,  name: '涂抹法宝',      cost: 3,    effect: '0.5%概率+1品阶',               require: '化神',  category: '炼器' },
  { id: 6,  name: '疗伤',          cost: 1,    effect: '恢复30%HP+解毒',               require: '练气',  category: '恢复' },
  { id: 7,  name: '灵力速充',      cost: 1,    effect: '恢复50%灵力',                  require: '练气',  category: '恢复' },
  { id: 8,  name: '灵兽喂养',      cost: 1,    effect: '成长+15%·忠诚+3',              require: '筑基',  category: '灵兽' },
  { id: 9,  name: '口服修炼',      cost: 1,    effect: '稀释·修为+50·丹毒1·冷却7天',   require: '筑基',  category: '修炼' },
  { id: 10, name: '提升突破率',    cost: 3,    effect: '+5%突破成功率',                 require: '金丹',  category: '修炼' },
  { id: 11, name: '破解禁制',      cost: 5,    effect: '古宝级禁制50%成功率',           require: '元婴',  category: '探索' },
  { id: 12, name: '器灵化形',      cost: 10,   effect: '绿儿出战3回合',                 require: '灵界',  category: '战斗' },
  { id: 13, name: '修复法宝',      cost: null, effect: '5~50滴·按损坏程度',             require: '金丹',  category: '炼器' },
  { id: 14, name: '炼制灵乳',      cost: 10,   effect: '回蓝圣品(需材料)',              require: '金丹',  category: '炼丹' },
  { id: 15, name: '魂体温养',      cost: 3,    effect: '神识+5(临时)',                  require: '元婴',  category: '神识' },
  { id: 16, name: '植物复活',      cost: 5,    effect: '救活枯死灵草',                  require: '金丹',  category: '种植' },
  { id: 17, name: '改造灵田',      cost: 20,   effect: '改变灵田属性偏向',              require: '元婴',  category: '种植' },
  { id: 18, name: '灵田扩容',      cost: 10,   effect: '每块灵田+10滴绿液扩容',         require: '金丹',  category: '种植' },
  { id: 19, name: '法则催熟',      cost: 100,  effect: '法则感悟+1%·完全体解锁',        require: '大罗',  category: '法则' },
  { id: 20, name: '创造灵宝',      cost: 1000, effect: '+法则碎片·唯一·完全体解锁',     require: '大罗',  category: '终极' },
];

/**
 * 器灵·绿儿 好感事件
 */
const LUER_FAVOR_EVENTS = {
  chat:    { val: 3,  desc: '陪绿儿聊天' },
  feed:    { val: 3,  desc: '喂魂晶' },
  novelty: { val: 2,  desc: '带绿儿看新奇事物' },
  neglect: { val: -3, desc: '长时间不理绿儿（随机-3~-5）' },
  abuse:   { val: -5, desc: '滥用药液' },
};

/** 绿儿记忆碎片 */
const LUER_MEMORIES = [
  { id: 1, trigger: '好感≥20',  content: '第一任主人是个很凶的大叔……' },
  { id: 2, trigger: '好感≥50',  content: '掌天瓶是一颗种子……混沌青莲的第七颗莲子。' },
  { id: 3, trigger: '好感≥80',  content: '上一任主人冲击道祖失败……他在等我。' },
];

/**
 * 30 个掌天瓶特殊事件
 * 分为 6 大类：日常(6)/战斗(5)/剧情(5)/危机(5)/奖励(5)/结局(4)
 */
const SPECIAL_EVENTS = {
  日常: [
    { id: 'daily-1',  name: '绿液溢出',       desc: '瓶中绿液突然溢出几滴',                  effect: '绿液+1~3滴',          probability: 0.05 },
    { id: 'daily-2',  name: '瓶身微热',       desc: '瓶身微微发热，指引附近灵脉方向',         effect: '发现灵脉线索',         probability: 0.04 },
    { id: 'daily-3',  name: '小动物靠近',     desc: '小灵兽被绿液气息吸引靠近',              effect: '随机小灵兽亲近',       probability: 0.06 },
    { id: 'daily-4',  name: '瓶中异香',       desc: '瓶中散发奇异香气，修炼速度+20%(临时)',  effect: '修炼速度+20%/1天',      probability: 0.03 },
    { id: 'daily-5',  name: '绿液变色',       desc: '绿液颜色变为深翠，年份效果翻倍(下滴)',   effect: '下滴绿液年份x2',       probability: 0.02 },
    { id: 'daily-6',  name: '月华共鸣',       desc: '满月之夜瓶身共鸣，额外凝聚2滴',          effect: '+2滴绿液',              probability: 0.08, condition: '满月' },
  ],
  战斗: [
    { id: 'battle-1', name: '绿液护主',       desc: 'HP<20%时自动消耗3滴恢复25%HP',          effect: '回25%HP·耗3滴',        probability: 0.30, condition: 'HP<20%' },
    { id: 'battle-2', name: '瓶中反击',       desc: '敌人神识攻击时瓶身反噬对方神识',         effect: '反噬对方神识伤害',     probability: 0.15, condition: '受到神识攻击' },
    { id: 'battle-3', name: '法宝吞噬',       desc: '0.5%概率吞噬敌方法宝',                   effect: '夺取对方法宝',          probability: 0.005 },
    { id: 'battle-4', name: '绿液炸弹',       desc: '范围伤害+缠绕效果',                      effect: 'AoE伤害+缠绕2回合',     probability: 0.08, condition: '主动使用' },
    { id: 'battle-5', name: '器灵参战',       desc: '绿儿好感≥60时可参战',                   effect: '绿儿出场战斗',          probability: 0,    condition: '好感≥60' },
  ],
  剧情: [
    { id: 'story-1', name: '原主人影像',     desc: '元婴期后瓶身共鸣触发，获得修炼心得',      effect: '获得心得·悟性+1',      probability: 0,    condition: '元婴↑+瓶身共鸣' },
    { id: 'story-2', name: '被认出',          desc: '某位老修士认出掌天瓶',                    effect: '触发隐藏对话线',       probability: 0.03 },
    { id: 'story-3', name: '瓶灵吃醋',       desc: '绿儿对其他器灵/法宝产生醋意',             effect: '绿儿好感临时-5',       probability: 0.05, condition: '绿儿苏醒后' },
    { id: 'story-4', name: '月光共鸣',       desc: '特殊月相下瓶身与天地共鸣',                effect: '随机奖励·绿液+5',      probability: 0.02 },
    { id: 'story-5', name: '碎片感应',       desc: '靠近碎片100里内自动指引方向',             effect: '碎片方位标记',          probability: 0,    condition: '碎片<100里' },
  ],
  危机: [
    { id: 'crisis-1', name: '魔气入侵',     desc: '魔气污染绿液，需净化10天',                  effect: '绿液被污染·净化10天',  probability: 0.03 },
    { id: 'crisis-2', name: '瓶被夺',        desc: '强敌抢夺掌天瓶，触发夺回任务链',           effect: '失去掌天瓶·夺回任务',  probability: 0.01, condition: '暴露宝瓶' },
    { id: 'crisis-3', name: '瓶身再裂',     desc: '挡天劫时瓶身出现裂纹，绿儿沉睡30天',       effect: '绿儿沉睡30天·需温养',   probability: 0,    condition: '天劫挡劫' },
    { id: 'crisis-4', name: '绿液反噬',     desc: '口服绿液过度，丹毒+50',                    effect: '丹毒+50',               probability: 0.10, condition: '口服冷却期内使用' },
    { id: 'crisis-5', name: '器灵叛逃',     desc: '好感<10时绿儿可能离开',                    effect: '绿儿消失',              probability: 0,    condition: '好感<10' },
  ],
  奖励: [
    { id: 'reward-1', name: '灵源树',        desc: '种植1000株后，灵田浓度永久x1.5',           effect: '灵田浓度x1.5',          probability: 0,    condition: '累计种植≥1000' },
    { id: 'reward-2', name: '绿晶石',        desc: '满上限30天不用绿液，法宝进化+10%',         effect: '法宝进化+10%',          probability: 0,    condition: '30天不用绿液' },
    { id: 'reward-3', name: '掌天诀',        desc: '领悟被动技能·灵力恢复+20%',                effect: '灵力恢复+20%',          probability: 0,    condition: '累计使用100滴' },
    { id: 'reward-4', name: '灵泉眼',        desc: '灵田自动灌溉，无需手动浇水',                effect: '灵田自动灌溉',          probability: 0,    condition: '灵田≥5块+使用≥50滴' },
    { id: 'reward-5', name: '时空秘境',      desc: '时间x10修炼圣地',                          effect: '开辟时空秘境',          probability: 0,    condition: '灵界·好感≥80' },
  ],
  结局: [
    { id: 'ending-1', name: '绿儿化人',      desc: '完全炼化+好感100→绿儿化为追随者',         effect: '追随者+1',              probability: 0,    condition: '好感100+完全炼化' },
    { id: 'ending-2', name: '青莲召唤',      desc: '感受混沌青莲召唤→终极任务开启',            effect: '终极任务·青莲',        probability: 0,    condition: '大罗·记忆碎片3' },
    { id: 'ending-3', name: '瓶子碎大道成', desc: '舍弃瓶子融入法则→证道',                     effect: '证道结局',              probability: 0,    condition: '道祖' },
    { id: 'ending-4', name: '掌天瓶传承',    desc: '传给有缘人→第二粒莲子彩蛋',                effect: '传承结局·彩蛋',        probability: 0,    condition: '主动选择' },
  ],
};

/** 事件分类及其权重（用于随机选取事件类） */
const EVENT_CATEGORY_WEIGHTS = { 日常: 40, 战斗: 15, 剧情: 20, 危机: 10, 奖励: 10, 结局: 5 };


/* ================================================================
 *  二、Bottle 类
 * ================================================================ */

class Bottle {
  /**
   * @param {object} DATA - 全局常量模块（境界/属性等）
   */
  constructor(DATA) {
    this.DATA = DATA;

    /* ── 获取状态 ── */
    this.questStep = 0;           // 0=未触发, 1~4=任务步骤
    this.obtained = false;        // 是否已获得
    this.obtainDay = null;        // 获得日期（游戏日）

    /* ── 绿液 ── */
    this.liquid = 0;              // 当前绿液滴数
    this.condenseTimer = 0;       // 凝聚计时器（天）
    this.liquidColor = '翠绿';    // 绿液颜色（事件可改变）

    /* ── 灵田 ── */
    this.fields = 0;              // 已开辟灵田块数
    this.fieldSlots = 9;          // 每块田种植槽数（首块=9）
    this.warehouse = {};          // 灵田专属仓库 { itemName: qty }
    this.warehouseCapacity = 0;   // 当前仓库容量
    this.totalPlanted = 0;        // 累计种植数（用于灵源树事件）

    /* ── 器灵 ── */
    this.luerAwake = false;       // 绿儿是否苏醒
    this.luerFavor = 0;           // 好感度 0~100
    this.luerMemories = [];       // 已解锁记忆碎片ID
    this.luerSleepDays = 0;       // 沉睡剩余天数

    /* ── 特殊状态 ── */
    this.cracked = false;         // 瓶身是否开裂
    this.corrupted = false;       // 绿液是否被魔气污染
    this.corruptionDays = 0;      // 净化剩余天数
    this.lastUsedDay = 0;         // 最后一次使用绿液的游戏日
    this.oralCooldown = 0;        // 口服冷却剩余天数
    this.totalUsed = 0;           // 累计使用绿液滴数

    /* ── 事件追踪 ── */
    this.triggeredEvents = new Set();  // 已触发事件ID（防止重复）
    this.eventCooldowns = {};          // 事件冷却 { eventId: remainingDays }

    /* ── 被动技能 ── */
    this.passiveSkills = [];           // ['掌天诀'等]
  }

  // ============================================================
  //  获取方式：4 步任务链
  // ============================================================

  /** 获取任务链完整数据 */
  getQuestChain() {
    return QUEST_CHAIN;
  }

  /** 获取当前任务步骤详情 */
  getCurrentQuestStep() {
    if (this.obtained) return null;
    if (this.questStep === 0) return { step: 0, name: '未触发', desc: '在青云山采药时可随机触发。' };
    return QUEST_CHAIN[this.questStep - 1];
  }

  /**
   * 推进任务链
   * @param {object} playerState - 玩家状态 { realm, sp, hp, mp, lifespan, cultivation }
   * @param {object} [answers] - 第3步的答案 { q1, q2, q3 }
   * @param {string} [action] - 'explore'|'navigate'|'answer'
   * @returns {{ success: boolean, step: number, msg: string, battle: object|null, penalty: object|null }}
   */
  advanceQuest(playerState, answers, action) {
    if (this.obtained) return { success: false, step: 0, msg: '已获得掌天瓶' };

    const nextStep = this.questStep + 1;
    if (nextStep > 4) return { success: false, step: 0, msg: '任务已完成' };

    // 第1步：探索触发
    if (nextStep === 1) {
      if (action !== 'explore') return { success: false, step: 0, msg: '需在青云山采药时探索触发' };
      // 随机触发（机缘影响概率）
      const luckBonus = (playerState.luck || 10) * 0.001;
      const triggerRate = 0.10 + luckBonus; // 基础10% + 机缘加成
      if (Math.random() > triggerRate) {
        return { success: false, step: 0, msg: '未发现异常' };
      }
      this.questStep = 1;
      return { success: true, step: 1, msg: QUEST_CHAIN[0].desc, battle: null };
    }

    // 第2步：迷宫
    if (nextStep === 2) {
      const sp = playerState.sp || 0;
      const canSense = sp >= 30;
      // 概率计算：有神识感知→80%选对，无感知→33%选对
      const passRate = canSense ? 0.80 : 0.33;
      const passed = Math.random() < passRate;

      if (!passed) {
        return {
          success: false,
          step: 1,
          msg: '走错岔路！遭遇蝙蝠战斗',
          battle: { ...QUEST_CHAIN[1].failBattle },
          penalty: null,
        };
      }

      // 需要连续3次选择正确
      // 简化：每次 navigate 调用算1次，需累计3次成功
      if (!this._mazeProgress) this._mazeProgress = 0;
      this._mazeProgress++;
      if (this._mazeProgress < 3) {
        return { success: true, step: 1, msg: `选择正确（${this._mazeProgress}/3）`, partial: true };
      }
      this._mazeProgress = 0;
      this.questStep = 2;
      return { success: true, step: 2, msg: '通过迷宫，到达洞底石室' };
    }

    // 第3步：三问
    if (nextStep === 3) {
      if (!answers) return { success: false, step: 2, msg: '请回答骸骨三问' };

      const questions = QUEST_CHAIN[2].questions;
      const penalties = [];
      let allCorrect = true;

      for (let i = 0; i < questions.length; i++) {
        const key = `q${i + 1}`;
        if (answers[key] !== questions[i].answer) {
          allCorrect = false;
          penalties.push(questions[i].penalty);
        }
      }

      if (!allCorrect) {
        return {
          success: false, step: 2, msg: `回答错误！惩罚：${penalties.join('、')}`,
          penalty: { type: '三问失败', effects: penalties },
        };
      }

      this.questStep = 3;
      return { success: true, step: 3, msg: '三问全对！骸骨化为飞灰……' };
    }

    // 第4步：获得掌天瓶
    if (nextStep === 4) {
      this.questStep = 4;
      this.obtained = true;
      this.obtainDay = 0; // 由外部设置游戏日
      this.liquid = 0;
      // 三日后凝聚第一滴（由 tick 处理）
      this.condenseTimer = 3;
      return {
        success: true,
        step: 4,
        msg: '获得掌天瓶！散修药师炼药心得（炼丹经验+500）。三日后凝聚第一滴绿液。',
        rewards: { alchemyExp: 500 },
      };
    }

    return { success: false, step: 0, msg: '未知状态' };
  }

  // ============================================================
  //  功能解锁（按境界）
  // ============================================================

  /** 获取全部解锁表 */
  getUnlockTable() {
    return UNLOCK_TABLE;
  }

  /**
   * 获取当前境界的解锁数据
   * @param {string} realm - 当前修为境界名
   * @returns {object|null}
   */
  getCurrentUnlock(realm) {
    // 找到 ≤ 当前境界的最高解锁等级
    const idx = REALM_ORDER.indexOf(realm);
    if (idx < 0) return UNLOCK_TABLE['练气']; // 凡人期不可用
    const available = REALM_ORDER.slice(0, idx + 1);
    const lastAvailable = available[available.length - 1];
    return UNLOCK_TABLE[lastAvailable] || null;
  }

  /**
   * 获取当前境界绿液凝聚所需天数
   * @param {string} realm
   */
  getCondenseDays(realm) {
    const unlock = this.getCurrentUnlock(realm);
    if (!unlock) return Infinity;
    if (unlock.condenseDays === 0) return 0; // 瞬凝
    return unlock.condenseDays;
  }

  /** 获取存储上限 */
  getMaxStorage(realm) {
    const unlock = this.getCurrentUnlock(realm);
    return unlock ? unlock.maxStorage : 0;
  }

  /** 获取绿液当前年份效果 */
  getGreenYears(realm) {
    const unlock = this.getCurrentUnlock(realm);
    return unlock ? unlock.greenYears : 0;
  }

  /** 获取最大灵田块数 */
  getMaxFields(realm) {
    const unlock = this.getCurrentUnlock(realm);
    return unlock ? unlock.fields : 0;
  }

  /** 获取时间加速比 */
  getTimeAccel(realm) {
    const unlock = this.getCurrentUnlock(realm);
    return unlock ? unlock.timeAccel : 1;
  }

  /** 获取当前解锁的功能列表 */
  getFeatures(realm) {
    const unlock = this.getCurrentUnlock(realm);
    return unlock ? unlock.features : [];
  }

  // ============================================================
  //  绿液凝聚
  // ============================================================

  /**
   * 主动凝聚绿液（筑基期解锁）
   * @param {string} realm
   * @param {object} playerState { mp, mpMax }
   * @returns {{ success: boolean, msg: string }}
   */
  activeCondense(realm, playerState) {
    const unlock = this.getCurrentUnlock(realm);
    if (!unlock || !unlock.features.includes('主动凝聚(10天+40%灵力)')) {
      return { success: false, msg: '当前境界未解锁主动凝聚' };
    }
    const cost = Math.floor((playerState.mpMax || 0) * 0.40);
    if ((playerState.mp || 0) < cost) {
      return { success: false, msg: `灵力不足，需要${cost}灵力` };
    }

    // 10天凝聚1滴
    this.liquid++;
    this.condenseTimer = 10;
    return { success: true, msg: '主动凝聚成功！消耗10天+40%灵力，获得1滴绿液', mpCost: cost, daysCost: 10 };
  }

  /**
   * 检查是否达到存储上限
   * @param {string} realm
   * @returns {boolean}
   */
  isStorageFull(realm) {
    const max = this.getMaxStorage(realm);
    return this.liquid >= max;
  }

  // ============================================================
  //  灵田专属仓库
  // ============================================================

  /**
   * 更新仓库容量（灵田块数变动时调用）
   */
  _updateWarehouseCapacity() {
    this.warehouseCapacity = this.fields * 50;
  }

  /**
   * 开辟灵田
   * @param {string} realm
   * @param {number} [count=1]
   * @returns {{ success: boolean, msg: string, fields: number }}
   */
  expandField(realm, count = 1) {
    const maxFields = this.getMaxFields(realm);
    if (this.fields + count > maxFields) {
      return { success: false, msg: `最多开辟${maxFields}块灵田，当前已有${this.fields}块` };
    }
    this.fields += count;
    this._updateWarehouseCapacity();
    return { success: true, msg: `开辟${count}块灵田，当前共${this.fields}块`, fields: this.fields };
  }

  /**
   * 存入仓库
   * @param {string} itemName
   * @param {number} qty
   * @returns {{ success: boolean, msg: string, stored: number, overflow: number }}
   */
  depositToWarehouse(itemName, qty) {
    if (!this.obtained) return { success: false, msg: '尚未获得掌天瓶' };

    const used = Object.values(this.warehouse).reduce((a, b) => a + b, 0);
    const available = this.warehouseCapacity - used;
    const stored = Math.min(qty, available);
    const overflow = qty - stored;

    this.warehouse[itemName] = (this.warehouse[itemName] || 0) + stored;

    let msg = `存入${itemName}×${stored}`;
    if (overflow > 0) msg += `，仓库已满！${overflow}单位滞留在灵田`;
    if (this.luerAwake) msg = '【绿儿】' + msg;

    this.totalPlanted += stored;

    return { success: stored > 0, msg, stored, overflow };
  }

  /**
   * 从仓库提取
   * @param {string} itemName
   * @param {number} qty
   * @returns {{ success: boolean, msg: string, taken: number }}
   */
  withdrawFromWarehouse(itemName, qty) {
    const current = this.warehouse[itemName] || 0;
    const taken = Math.min(qty, current);
    this.warehouse[itemName] = current - taken;
    if (this.warehouse[itemName] <= 0) delete this.warehouse[itemName];
    return {
      success: taken > 0,
      msg: taken > 0 ? `提取${itemName}×${taken}` : `仓库中无${itemName}`,
      taken,
    };
  }

  /** 获取仓库快照 */
  getWarehouseState() {
    const used = Object.values(this.warehouse).reduce((a, b) => a + b, 0);
    return {
      capacity: this.warehouseCapacity,
      used,
      items: { ...this.warehouse },
      isFull: used >= this.warehouseCapacity,
    };
  }

  // ============================================================
  //  绿液 20 种用途
  // ============================================================

  /** 获取全部20种用途 */
  getGreenLiquidUses() {
    return GREEN_LIQUID_USES;
  }

  /**
   * 获取当前境界可用的用途列表
   * @param {string} realm
   */
  getAvailableUses(realm) {
    const idx = REALM_ORDER.indexOf(realm);
    const availableRealms = idx >= 0 ? REALM_ORDER.slice(0, idx + 1) : [];
    return GREEN_LIQUID_USES.filter(u => availableRealms.includes(u.require) || u.require === '练气');
  }

  /**
   * 使用绿液
   * @param {number} useId - 用途ID (1~20)
   * @param {string} realm
   * @param {object} [extra] - 额外参数（如目标灵草/法宝等）
   * @returns {{ success: boolean, msg: string, cost: number, effect: string }}
   */
  useGreenLiquid(useId, realm, extra = {}) {
    if (!this.obtained) return { success: false, msg: '尚未获得掌天瓶', cost: 0, effect: '' };
    if (this.corrupted) return { success: false, msg: '绿液被魔气污染，需先净化', cost: 0, effect: '' };

    const use = GREEN_LIQUID_USES.find(u => u.id === useId);
    if (!use) return { success: false, msg: `未知用途ID: ${useId}`, cost: 0, effect: '' };

    // 检查境界解锁
    const idx = REALM_ORDER.indexOf(realm);
    const reqIdx = REALM_ORDER.indexOf(use.require);
    if (idx < reqIdx && use.require !== '练气') {
      return { success: false, msg: `需要${use.require}期才能使用`, cost: 0, effect: '' };
    }

    // 检查绿液数量
    let cost = use.cost;
    if (cost === null) {
      // 修复法宝：动态消耗
      cost = extra.customCost || 5;
    }
    if (this.liquid < cost) {
      return { success: false, msg: `绿液不足，需要${cost}滴，当前${this.liquid}滴`, cost: 0, effect: '' };
    }

    // 口服冷却检查
    if (useId === 9 && this.oralCooldown > 0) {
      // 可能触发绿液反噬
      if (Math.random() < 0.10) {
        this.corrupted = true;
        return { success: false, msg: '绿液反噬！丹毒+50', cost, effect: '丹毒+50' };
      }
      return { success: false, msg: `口服冷却中，剩余${this.oralCooldown}天`, cost: 0, effect: '' };
    }

    // 消耗绿液
    this.liquid -= cost;
    this.totalUsed += cost;
    this.lastUsedDay = 0; // 由 tick 维护

    // 口服设置冷却
    if (useId === 9) this.oralCooldown = 7;

    return { success: true, msg: `使用【${use.name}】消耗${cost}滴绿液`, cost, effect: use.effect };
  }

  // ============================================================
  //  器灵·绿儿
  // ============================================================

  /**
   * 唤醒绿儿（飞升灵界后自动触发）
   * @returns {{ success: boolean, msg: string }}
   */
  awakenLuer() {
    if (this.luerAwake) return { success: false, msg: '绿儿已经苏醒' };
    if (!this.obtained) return { success: false, msg: '尚未获得掌天瓶' };
    this.luerAwake = true;
    this.luerFavor = 30; // 初始好感
    return { success: true, msg: '翠绿色光点凝聚成小女孩虚影——绿儿苏醒了！' };
  }

  /** 绿儿是否苏醒 */
  isLuerAwake() { return this.luerAwake && this.luerSleepDays <= 0; }

  /** 绿儿是否沉睡中 */
  isLuerSleeping() { return this.luerAwake && this.luerSleepDays > 0; }

  /**
   * 修改绿儿好感
   * @param {'chat'|'feed'|'novelty'|'neglect'|'abuse'} eventType
   * @returns {{ favor: number, delta: number }}
   */
  modifyLuerFavor(eventType) {
    if (!this.luerAwake || this.luerSleepDays > 0) return { favor: this.luerFavor, delta: 0 };

    const evt = LUER_FAVOR_EVENTS[eventType];
    if (!evt) return { favor: this.luerFavor, delta: 0 };

    let delta = evt.val;
    if (eventType === 'neglect') {
      delta = -(3 + Math.floor(Math.random() * 3)); // -3~-5
    }
    this.luerFavor = Math.max(0, Math.min(100, this.luerFavor + delta));

    // 检查记忆碎片解锁
    this._checkMemories();

    return { favor: this.luerFavor, delta };
  }

  /** 检查并解锁记忆碎片 */
  _checkMemories() {
    for (const mem of LUER_MEMORIES) {
      if (this.luerMemories.includes(mem.id)) continue;
      const threshold = parseInt(mem.trigger.match(/\d+/)?.[0]) || 0;
      if (this.luerFavor >= threshold) {
        this.luerMemories.push(mem.id);
      }
    }
  }

  /** 获取绿儿状态 */
  getLuerState() {
    return {
      awake: this.luerAwake,
      sleeping: this.luerSleepDays > 0,
      sleepDays: this.luerSleepDays,
      favor: this.luerFavor,
      memories: [...this.luerMemories],
      canBattle: this.luerFavor >= 60 && this.luerAwake && this.luerSleepDays <= 0,
    };
  }

  /**
   * 绿儿战斗技能：生命祝福
   * 全队回20%HP，消耗10滴绿液
   * @returns {{ success: boolean, msg: string, healPercent: number }}
   */
  luerLifeBlessing() {
    if (!this.luerAwake || this.luerSleepDays > 0) {
      return { success: false, msg: '绿儿无法出战', healPercent: 0 };
    }
    if (this.liquid < 10) {
      return { success: false, msg: '绿液不足10滴', healPercent: 0 };
    }
    this.liquid -= 10;
    return { success: true, msg: '绿儿施展生命祝福！全队恢复20%HP', healPercent: 0.20 };
  }

  /**
   * 绿儿自动管理（每日调用）
   * @returns {string[]} 当日消息列表
   */
  luerDailyManage() {
    if (!this.isLuerAwake()) return [];
    const msgs = [];

    // 仓库满提示
    const ws = this.getWarehouseState();
    if (ws.isFull) {
      msgs.push('【绿儿】主人！仓库满了！');
    }

    // 绿液满提示
    // （由外部传入当前境界判断）
    return msgs;
  }

  /**
   * 绿儿危险预警
   * @param {number} distance - 敌人距离（里）
   * @returns {string|null}
   */
  luerDangerAlert(distance) {
    if (!this.isLuerAwake()) return null;
    if (distance <= 100) {
      return `【绿儿】主人小心！${distance}里内有敌意气息！`;
    }
    return null;
  }

  // ============================================================
  //  30 特殊事件
  // ============================================================

  /** 获取全部特殊事件 */
  getSpecialEvents() {
    return SPECIAL_EVENTS;
  }

  /**
   * 随机触发特殊事件（每日概率）
   * @param {string} realm - 当前境界
   * @param {object} playerState - 玩家状态
   * @param {object} [conditions] - 触发条件 { isFullMoon, hpPercent, inBattle, etc. }
   * @returns {object|null} 事件对象或 null
   */
  rollSpecialEvent(realm, playerState, conditions = {}) {
    if (!this.obtained) return null;

    // 按权重选择事件类别
    const totalW = Object.values(EVENT_CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalW;
    let pickedCategory = '日常';
    for (const [cat, w] of Object.entries(EVENT_CATEGORY_WEIGHTS)) {
      roll -= w;
      if (roll <= 0) { pickedCategory = cat; break; }
    }

    const pool = SPECIAL_EVENTS[pickedCategory] || [];
    // 筛选可触发的事件
    const candidates = pool.filter(evt => {
      if (this.triggeredEvents.has(evt.id)) return false;       // 已触发（不可重复类）
      if (this.eventCooldowns[evt.id] && this.eventCooldowns[evt.id] > 0) return false;
      if (evt.probability === 0) return false;                  // 纯条件触发，不随机
      // 条件检查
      if (evt.condition) {
        if (evt.condition === '满月' && !conditions.isFullMoon) return false;
        if (evt.condition === 'HP<20%' && (conditions.hpPercent || 1) >= 0.20) return false;
        if (evt.condition === '受到神识攻击' && !conditions.underSpAttack) return false;
        if (evt.condition === '好感≥60' && this.luerFavor < 60) return false;
        if (evt.condition === '绿儿苏醒后' && !this.luerAwake) return false;
        if (evt.condition === '元婴↑+瓶身共鸣' && (!realm || REALM_ORDER.indexOf(realm) < REALM_ORDER.indexOf('元婴'))) return false;
        if (evt.condition === '好感<10' && this.luerFavor >= 10) return false;
        if (evt.condition === '口服冷却期内使用' && this.oralCooldown <= 0) return false;
      }
      return true;
    });

    if (candidates.length === 0) return null;

    // 随机选一个
    const evt = candidates[Math.floor(Math.random() * candidates.length)];

    // 概率判定
    if (Math.random() > evt.probability) return null;

    return { ...evt };
  }

  /**
   * 手动触发条件事件（用于结局/奖励类 zero-probability 事件）
   * @param {string} eventId
   * @returns {{ success: boolean, event: object|null, msg: string }}
   */
  triggerEventById(eventId) {
    for (const cat of Object.values(SPECIAL_EVENTS)) {
      const evt = cat.find(e => e.id === eventId);
      if (evt) {
        if (this.triggeredEvents.has(eventId)) {
          return { success: false, event: null, msg: '该事件已触发过' };
        }
        this.triggeredEvents.add(eventId);
        return { success: true, event: { ...evt }, msg: evt.name };
      }
    }
    return { success: false, event: null, msg: `未知事件ID: ${eventId}` };
  }

  /** 重置可重复事件的冷却（已在triggeredEvents中的日常/战斗类可重置） */
  resetRepeatableEvents(daysPassed) {
    for (const [eid, cd] of Object.entries(this.eventCooldowns)) {
      this.eventCooldowns[eid] = Math.max(0, cd - daysPassed);
    }
  }

  // ============================================================
  //  每日推进 (tick)
  // ============================================================

  /**
   * 每日更新
   * @param {number} days - 经过天数
   * @param {string} realm - 当前境界
   * @param {object} conditions - 条件 { isFullMoon, hpPercent, ... }
   * @returns {{ messages: string[], event: object|null, liquidGained: number }}
   */
  tick(days, realm, conditions = {}) {
    const messages = [];
    let event = null;
    let liquidGained = 0;

    if (!this.obtained) return { messages: [], event: null, liquidGained: 0 };

    // 腐蚀状态推进
    if (this.corrupted && this.corruptionDays > 0) {
      this.corruptionDays -= days;
      if (this.corruptionDays <= 0) {
        this.corrupted = false;
        messages.push('绿液净化完成！');
      }
    }

    // 绿儿沉睡推进
    if (this.luerSleepDays > 0) {
      this.luerSleepDays -= days;
      if (this.luerSleepDays <= 0) {
        messages.push('绿儿苏醒了！');
      }
    }

    // 口服冷却
    if (this.oralCooldown > 0) {
      this.oralCooldown = Math.max(0, this.oralCooldown - days);
    }

    // 绿液凝聚
    const condenseDays = this.getCondenseDays(realm);
    if (condenseDays === 0) {
      // 瞬凝：每天无限（大罗），设为实用上限
      if (this.liquid < 1000) this.liquid = 1000;
    } else if (condenseDays > 0 && !this.corrupted) {
      this.condenseTimer += days;
      while (this.condenseTimer >= condenseDays) {
        this.condenseTimer -= condenseDays;
        const maxStore = this.getMaxStorage(realm);
        if (this.liquid < maxStore) {
          this.liquid++;
          liquidGained++;
        }
      }
      if (liquidGained > 0) messages.push(`自然凝聚${liquidGained}滴绿液`);
    }

    // 仓库满提示
    if (this.isLuerAwake()) {
      const ws = this.getWarehouseState();
      if (ws.isFull) messages.push('【绿儿】主人！仓库满了！');
    }

    // 事件冷却推进
    this.resetRepeatableEvents(days);

    // 随机事件
    event = this.rollSpecialEvent(realm, {}, conditions);

    return { messages, event, liquidGained };
  }

  // ============================================================
  //  序列化
  // ============================================================

  toJSON() {
    return {
      questStep:        this.questStep,
      obtained:         this.obtained,
      obtainDay:        this.obtainDay,
      liquid:           this.liquid,
      condenseTimer:    this.condenseTimer,
      liquidColor:      this.liquidColor,
      fields:           this.fields,
      fieldSlots:       this.fieldSlots,
      warehouse:        this.warehouse,
      warehouseCapacity:this.warehouseCapacity,
      totalPlanted:     this.totalPlanted,
      luerAwake:        this.luerAwake,
      luerFavor:        this.luerFavor,
      luerMemories:     this.luerMemories,
      luerSleepDays:    this.luerSleepDays,
      cracked:          this.cracked,
      corrupted:        this.corrupted,
      corruptionDays:   this.corruptionDays,
      lastUsedDay:      this.lastUsedDay,
      oralCooldown:     this.oralCooldown,
      totalUsed:        this.totalUsed,
      triggeredEvents:  [...this.triggeredEvents],
      eventCooldowns:   this.eventCooldowns,
      passiveSkills:    this.passiveSkills,
    };
  }

  static fromJSON(DATA, data) {
    const b = new Bottle(DATA);
    b.questStep         = data.questStep;
    b.obtained          = data.obtained;
    b.obtainDay         = data.obtainDay;
    b.liquid            = data.liquid;
    b.condenseTimer     = data.condenseTimer;
    b.liquidColor       = data.liquidColor || '翠绿';
    b.fields            = data.fields;
    b.fieldSlots        = data.fieldSlots || 9;
    b.warehouse         = data.warehouse || {};
    b.warehouseCapacity = data.warehouseCapacity || 0;
    b.totalPlanted      = data.totalPlanted || 0;
    b.luerAwake         = data.luerAwake;
    b.luerFavor         = data.luerFavor;
    b.luerMemories      = data.luerMemories || [];
    b.luerSleepDays     = data.luerSleepDays || 0;
    b.cracked           = data.cracked || false;
    b.corrupted         = data.corrupted || false;
    b.corruptionDays    = data.corruptionDays || 0;
    b.lastUsedDay       = data.lastUsedDay || 0;
    b.oralCooldown      = data.oralCooldown || 0;
    b.totalUsed         = data.totalUsed || 0;
    b.triggeredEvents   = new Set(data.triggeredEvents || []);
    b.eventCooldowns    = data.eventCooldowns || {};
    b.passiveSkills     = data.passiveSkills || [];
    return b;
  }
}


/* ================================================================
 *  三、导出
 * ================================================================ */

// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Bottle = Bottle;
  window.QUEST_CHAIN = QUEST_CHAIN;
  window.UNLOCK_TABLE = UNLOCK_TABLE;
  window.GREEN_LIQUID_USES = GREEN_LIQUID_USES;
  window.SPECIAL_EVENTS_BOTTLE = SPECIAL_EVENTS;
}

export { Bottle };

// 同时导出常量供外部模块使用
export {
  QUEST_CHAIN,
  UNLOCK_TABLE,
  REALM_ORDER,
  GREEN_LIQUID_USES,
  SPECIAL_EVENTS,
  LUER_FAVOR_EVENTS,
  LUER_MEMORIES,
};
