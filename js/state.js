// ==========================================
//  GameState - Single Source of Truth
// ==========================================

const GameState = {
  _version: 1,

  // 境界
  realm: '练气',
  subLevel: 1,
  maxSubLevel: 9,
  cultivation: 0,
  cultivationMax: 100,

  // 寿命
  totalDays: 0,
  age: 18,
  lifespanMax: 100,

  // 属性六维
  atk: 3,
  def: 3,
  spd: 3,
  wis: 3,
  vit: 3,
  spi: 3,

  // 资源
  spiritStones: SPIRIT_STONES.starting,

  // 位面
  plane: 'human',

  // 地图位置
  currentRegion: 'yue_huangfeng',
  currentNode: 'hf_main',
  lastExplored: {},
  lastExploreDay: {},
  discoveredRegions: {},  // 已发现的隐藏区域 { regionId: true }

  // 功法
  mainSkill: 'qingyuan',
  subSkills: [],
  skillProgress: {},

  // 日志
  logs: [],

  // 心魔（突破拖延）
  delayDays: 0,

  // 背包
  breakItems: {},
  combatItems: {},        // 战斗消耗品 { itemId: count }

  // 转世机制
  rebirthDebuff: 0,       // 累计寿元惩罚 (0.0-1.0)
  takeOverFailCount: 0,   // 夺舍失败次数
  legacyStash: null,      // 因果传承 { stones, item, nodeName }

  // 身世与叙事
  origin: null,           // { id, name, rarity }
  narrativeDay: 0,        // 叙事事件计数器
  narrativeTriggered: [], // 已触发事件ID
  lastRandomNarrative: 0, // 上次随机事件触发天数

  // 灵根
  spiritRoot: null,

  // 炼丹
  materials: {},          // { materialId: count }
  cauldron: 'xia',        // 当前丹炉id
  pendingPillEffect: null, // { type, val, etc } 待使用的丹药效果

  // 战斗状态
  _combatState: null,

  // 前世记录
  pastLives: [],

  // 阶级系统（修仙界社会地位）
  planeRank: 'human',       // 阶级对应的位面
  renown: 0,                // 声望值
};


