// ==========================================
//  data/spiritStones.js — 灵石经济系统集中配置
// ==========================================
//  版本: v1.0 | 2026-06-30
//  目的: 灵石相关所有数值的单一配置源
//        方便调平衡 → 改这一个文件即可
// ==========================================

const SPIRIT_STONES = {

  // ===== 初始值 =====
  starting: 10,               // 新游戏初始灵石 | 走身世时会覆盖

  // ===== 位面缩放 =====
  // 所有灵石产出/消耗乘以此系数
  // 人界灵界仙界的购买力不在一个数量级
  planeMultiplier: {
    human:    1,
    spirit:   10,
    immortal: 100,
  },

  // ==========================================
  //  来源 (Source)
  // ==========================================
  source: {

    // -- 战斗 --
    combat: {
      // 战斗奖励 → 在 ENEMY_TIERS (data/enemies.js) 中定义，此处只记录缩放规则
      // tier 0=练气 reward 20, tier 1=筑基 60, tier 2=金丹 150,
      // tier 3=元婴 350,   tier 4=化神 700, tier 5=炼虚 1500,
      // tier 6=合体 3000,  tier 7=大乘 6000, tier 8=真仙 15000,
      // tier 9=金仙 35000, tier 10=太乙 80000, tier 11=大罗 200000,
      // tier 12=道祖 500000
      // 缩放: base * (0.7~1.3随机) * planeMultiplier → 见 getEnemyReward()
      randomMin: 0.7,
      randomMax: 1.3,
    },

    // -- 妖兽契约掉落 --
    capture: {
      itemName: '妖兽幼崽',     // 捕获物品名
      defaultCount: 1,
    },

    // -- 战斗逃生 --
    flee: {
      // 战败逃生 → 灵石损失比例
      lossRatio: 0.5,           // 留50%
    },

    // -- 修炼·采灵术 (特殊功法) --
    cultivation: {
      // 采灵术每级每天获取基础值 → 公式: days × stoneGainVal × multPerLevel
      stoneGainPerLevel: 5,     // 采灵术每层每天获得灵石基数
    },

    // -- 地图探索·天眼通 --
    explore: {
      secretFindGain: 50,       // 天眼通窥见秘境获得灵石
      lossRatio: {              // 探索负面事件损失比例
        human: 0.05,
        spirit: 0.08,
        immortal: 0.1,
      },
    },

    // -- 地图旅行 --
    travel: {
      eventChance: 0.03,         // 3% 触发随机事件
      robMin:   20,              // 劫修抢走最少
      robMax:   30,              // 劫修抢走最多
      herbGain: 30,              // 偶遇灵药获得
    },

    // -- 长途旅行 --
    longTravel: {
      eventChance: 0.06,         // 6% 触发随机事件
      robMin:   20,
      robMax:   30,
      herbGain: 50,
    },

    // -- 因果传承 --
    legacy: {
      ratio: 0.1,                // 前世灵石的10%遗留
    },

    // -- 夺舍 --
    possess: {
      keepAllStones: true,       // 成功夺舍保留全部灵石（取决于tier.keepStones）
    },
  },

  // ==========================================
  //  消耗 (Sink)
  // ==========================================
  sink: {

    // -- 丹炉价格 --
    // 定义在 CAULDRONS (data/alchemy.js) 中，此处为参考文档
    cauldronPrices: {
      xia:   50,                 // 下品丹炉（黄铜）
      zhong: 300,                // 中品丹炉（精铁法阵）
      shang: 1500,               // 上品丹炉（寒铁地火）
      ji:    5000,               // 极品丹炉（陨铁）
    },

    // -- 主修功法 --
    mainSkill: {
      // 公式: 灵石 = level × qualityMult × costFactor
      costFactor: 5,
    },

    // -- 材料采买 --
    // 定义在 ALCHEMY_MATERIALS (data/alchemy.js) 中，此处为参考文档
    materialTierPrices: {
      1: { min: 2,  max: 5,  note: '凡间灵药' },
      2: { min: 15, max: 35, note: '数百年灵药' },
      3: { min: 45, max: 60, note: '千年灵药' },
      4: { min: 150,max: 200,note: '数千年灵药' },
      5: { min: 600,max: 800,note: '万年仙药' },
    },
  },

  // ==========================================
  //  外部数据系统中的灵石值（仅文档）
  //  —— 这些值在各自数据文件中定义，此处只为审查便利
  // ==========================================
  documentedExternal: {
    // 身世初始灵石 (data/origins.js)
    origins: {
      散修后人:    10,
      农户子弟:    20,
      商贾之子:    50,
      猎户之后:    15,
      没落修仙家族: 30,
      道观弃徒:    20,
      药农传人:    25,
      外门弟子:    100,
      天灵根觉醒:   50,
      大能转世:    200,
    },

    // 阶级灵石奖励 (data/rank.js)
    rankBonuses: {
      凡人:     0,
      散修:     10,
      外门弟子: 25,
      内门弟子: 50,
      核心弟子: 100,
      执事:     200,
      长老:     500,
      宗主:     1000,
      人界霸主: 3000,
      飞升者:   500,
      // ... 其余见 RANK_TIERS
    },
  },

  // ==========================================
  //  辅助函数
  // ==========================================

  /**
   * 获取当前位面的灵石缩放系数
   */
  getPlaneMult: function() {
    return this.planeMultiplier[GameState.plane] || 1;
  },
};

// ==========================================
//  NPC/事件 的灵石值 → 这些是通用随机事件的数值
//  直接放在全局，方便 narrtive.js / origins.js 引用
// ==========================================

const SPIRIT_NPC = {

  // 随机叙事事件中的灵石值（data/origins.js → RANDOM_EVENTS）
  randomEvents: {
    采药老人:  15,
    溪边灵石:  25,
    平安符:    10,
    山洪损:    { ratio: 0.1 },          // 损失10%
    劫修拦路:  30,
    炼丹交易:  50,
    同路人:    10,
    积德行善:  5,
  },

  // 命定事件中的灵石值（data/origins.js → ORIGINS → destined events）
  destinedEvents: {
    灵果:      30,
    续命丹:    { cost: 30, item: '续命丹' },
    农舍洞府:  { random: [20, 50] },     // 随机 20 或 50
    密室遗物:  100,
    道观师弟:  30,
    紫纹灵芝:  { pick: 40, wait: 60 },
    秘境探险:  200,
    大能储物戒: 500,
  },
};
