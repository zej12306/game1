/**
 * exploration.js — 修仙探索与秘境副本系统
 * 基于 GDD 行1117~1180 设计。
 *
 * ⑫ 探索系统：45区域 / ~90节点 / 6类事件池 / 每节点最多3次 / 概率抽取
 * ⑬ 秘境副本系统：10秘境 / 多层 / CD / 专属事件池
 *
 * 不含事件文本，只做系统框架 + 事件总线调度。
 * 依赖：DATA（DATA.EXPLORATION）
 * 导出：Exploration 类
 */

import { DATA } from './data.js';

/* ================================================================
 *  一、事件池补充（DATA 中已有4个，补充危险与渡劫）
 * ================================================================ */

/** ⑤ 危险节点事件池（概率加权，总计100） */
const DANGER_EVENT_POOL = {
  魔气侵蚀: 30, 古魔残魂: 20, 封印松动: 15,
  煞气爆发: 15, 古修遗宝: 10, 空间裂缝: 10,
};

/** ⑥ 飞升渡劫事件池（顺序链） */
const TRIBULATION_CHAIN = [
  '天雷降临',
  '心魔骤起',
  '灵力枯竭',
  '天降甘霖',
];

/** 所有事件池索引 */
const POOL_KEYS = ['wild', 'secret', 'town', 'faction', 'danger', 'tribulation'];

const POOLS = {
  wild:        DATA.EXPLORATION.wildEventPool,
  secret:      DATA.EXPLORATION.secretEventPool,
  town:        DATA.EXPLORATION.townEventPool,
  faction:     DATA.EXPLORATION.factionEventPool,
  danger:      DANGER_EVENT_POOL,
  tribulation: null, // 链式，不按权重抽
};


/* ================================================================
 *  二、区域与节点定义（45区域，约86节点）
 * ================================================================ */

/**
 * 节点定义
 * @typedef  {Object} NodeDef
 * @property {string} id        - 唯一标识
 * @property {string} name      - 中文名
 * @property {string} poolKey   - 事件池 key
 */

/**
 * 区域定义
 * @typedef  {Object} AreaDef
 * @property {string}  id       - 唯一标识
 * @property {string}  name     - 中文名
 * @property {string}  world    - '人界'|'灵界'|'仙界'
 * @property {number}  realmMin - 最低推荐境界索引（REALMS 索引）
 * @property {NodeDef[]} nodes  - 子节点列表（空数组=扁平区域）
 */

/** @type {AreaDef[]} */
const AREAS = [
  // ═══════════ 人界 24 区域 ═══════════
  { id: 'a01', name: '青云山',     world: '人界', realmMin: 0, nodes: [
    { id:'a01_n1', name:'山脚密林',   poolKey:'wild' },
    { id:'a01_n2', name:'半山灵石矿', poolKey:'wild' },
    { id:'a01_n3', name:'山顶古洞',   poolKey:'secret' },
  ]},
  { id: 'a02', name: '天南城',     world: '人界', realmMin: 0, nodes: [
    { id:'a02_n1', name:'坊市街',     poolKey:'town' },
    { id:'a02_n2', name:'酒馆',       poolKey:'town' },
    { id:'a02_n3', name:'拍卖行',     poolKey:'town' },
    { id:'a02_n4', name:'城门广场',   poolKey:'town' },
  ]},
  { id: 'a03', name: '黄枫谷',     world: '人界', realmMin: 1, nodes: [
    { id:'a03_n1', name:'藏经阁',     poolKey:'faction' },
    { id:'a03_n2', name:'灵药园',     poolKey:'faction' },
    { id:'a03_n3', name:'演武场',     poolKey:'faction' },
  ]},
  { id: 'a04', name: '天星城',     world: '人界', realmMin: 2, nodes: [
    { id:'a04_n1', name:'坊市',       poolKey:'town' },
    { id:'a04_n2', name:'百宝楼',     poolKey:'town' },
    { id:'a04_n3', name:'码头',       poolKey:'town' },
    { id:'a04_n4', name:'城西废弃地', poolKey:'danger' },
  ]},
  { id: 'a05', name: '大晋皇都',   world: '人界', realmMin: 3, nodes: [
    { id:'a05_n1', name:'坊市',       poolKey:'town' },
    { id:'a05_n2', name:'皇宫外围',   poolKey:'town' },
    { id:'a05_n3', name:'地下黑市',   poolKey:'danger' },
  ]},
  { id: 'a06', name: '灵兽山',     world: '人界', realmMin: 1, nodes: [
    { id:'a06_n1', name:'外围密林',   poolKey:'wild' },
    { id:'a06_n2', name:'兽王洞',     poolKey:'danger' },
  ]},
  { id: 'a07', name: '越国边境',   world: '人界', realmMin: 0, nodes: [] },
  { id: 'a08', name: '乱星海',     world: '人界', realmMin: 2, nodes: [
    { id:'a08_n1', name:'外围海域',   poolKey:'wild' },
    { id:'a08_n2', name:'星宫遗址',   poolKey:'secret' },
    { id:'a08_n3', name:'深海漩涡',   poolKey:'danger' },
    { id:'a08_n4', name:'星宫核心',   poolKey:'secret' },
  ]},
  { id: 'a09', name: '虚天殿外围', world: '人界', realmMin: 3, nodes: [
    { id:'a09_n1', name:'外殿入口',   poolKey:'secret' },
    { id:'a09_n2', name:'冰火道外',   poolKey:'danger' },
    { id:'a09_n3', name:'偏殿废墟',   poolKey:'secret' },
  ]},
  { id: 'a10', name: '血色禁地入口', world: '人界', realmMin: 2, nodes: [
    { id:'a10_n1', name:'禁地外围',   poolKey:'wild' },
    { id:'a10_n2', name:'血雾林',     poolKey:'danger' },
  ]},
  { id: 'a11', name: '昆吾山脉',   world: '人界', realmMin: 3, nodes: [
    { id:'a11_n1', name:'外围',       poolKey:'wild' },
    { id:'a11_n2', name:'封印核心',   poolKey:'secret' },
    { id:'a11_n3', name:'魔窟入口',   poolKey:'danger' },
  ]},
  { id: 'a12', name: '落日森林',   world: '人界', realmMin: 0, nodes: [
    { id:'a12_n1', name:'外围林区',   poolKey:'wild' },
    { id:'a12_n2', name:'森林深处',   poolKey:'wild' },
  ]},
  { id: 'a13', name: '无忧谷',     world: '人界', realmMin: 1, nodes: [] },
  { id: 'a14', name: '魔道六宗',   world: '人界', realmMin: 2, nodes: [
    { id:'a14_n1', name:'外围据点',   poolKey:'danger' },
    { id:'a14_n2', name:'六宗战场',   poolKey:'danger' },
  ]},
  { id: 'a15', name: '金光城',     world: '人界', realmMin: 2, nodes: [] },
  { id: 'a16', name: '东海之滨',   world: '人界', realmMin: 1, nodes: [
    { id:'a16_n1', name:'沙滩',       poolKey:'wild' },
    { id:'a16_n2', name:'深海边缘',   poolKey:'wild' },
  ]},
  { id: 'a17', name: '苍龙山脉',   world: '人界', realmMin: 2, nodes: [
    { id:'a17_n1', name:'龙脊峰',     poolKey:'wild' },
    { id:'a17_n2', name:'古龙巢',     poolKey:'secret' },
  ]},
  { id: 'a18', name: '飞仙谷',     world: '人界', realmMin: 3, nodes: [] },
  { id: 'a19', name: '幽冥鬼域',   world: '人界', realmMin: 3, nodes: [
    { id:'a19_n1', name:'外围墓地',   poolKey:'danger' },
    { id:'a19_n2', name:'鬼王殿',     poolKey:'danger' },
    { id:'a19_n3', name:'幽冥裂隙',   poolKey:'danger' },
  ]},
  { id: 'a20', name: '天柱峰',     world: '人界', realmMin: 4, nodes: [
    { id:'a20_n1', name:'半山平台',   poolKey:'wild' },
    { id:'a20_n2', name:'峰顶渡劫台', poolKey:'tribulation' },
  ]},
  { id: 'a21', name: '紫霞山',     world: '人界', realmMin: 1, nodes: [] },
  { id: 'a22', name: '西荒沙漠',   world: '人界', realmMin: 2, nodes: [
    { id:'a22_n1', name:'外围绿洲',   poolKey:'wild' },
    { id:'a22_n2', name:'沙暴中心',   poolKey:'danger' },
  ]},
  { id: 'a23', name: '南疆荒原',   world: '人界', realmMin: 2, nodes: [] },
  { id: 'a24', name: '极北冰原',   world: '人界', realmMin: 3, nodes: [
    { id:'a24_n1', name:'冰原外围',   poolKey:'wild' },
    { id:'a24_n2', name:'极寒中心',   poolKey:'danger' },
  ]},

  // ═══════════ 灵界 12 区域 ═══════════
  { id: 'a25', name: '灵界主城',   world: '灵界', realmMin: 6, nodes: [
    { id:'a25_n1', name:'主坊市',     poolKey:'town' },
    { id:'a25_n2', name:'飞升殿',     poolKey:'faction' },
    { id:'a25_n3', name:'任务殿',     poolKey:'faction' },
  ]},
  { id: 'a26', name: '万古魔域',   world: '灵界', realmMin: 7, nodes: [
    { id:'a26_n1', name:'外围',       poolKey:'danger' },
    { id:'a26_n2', name:'魔域深处',   poolKey:'danger' },
    { id:'a26_n3', name:'古魔殿',     poolKey:'secret' },
  ]},
  { id: 'a27', name: '广灵洞天外', world: '灵界', realmMin: 7, nodes: [
    { id:'a27_n1', name:'洞天入口',   poolKey:'secret' },
    { id:'a27_n2', name:'外围密林',   poolKey:'wild' },
  ]},
  { id: 'a28', name: '雷鸣山脉',   world: '灵界', realmMin: 7, nodes: [
    { id:'a28_n1', name:'雷暴区',     poolKey:'danger' },
    { id:'a28_n2', name:'天雷竹林',   poolKey:'wild' },
    { id:'a28_n3', name:'雷劫古地',   poolKey:'danger' },
  ]},
  { id: 'a29', name: '迷雾海',     world: '灵界', realmMin: 7, nodes: [
    { id:'a29_n1', name:'迷雾外海',   poolKey:'wild' },
    { id:'a29_n2', name:'海心漩涡',   poolKey:'secret' },
  ]},
  { id: 'a30', name: '远古战场遗址', world: '灵界', realmMin: 7, nodes: [
    { id:'a30_n1', name:'战场外围',   poolKey:'danger' },
    { id:'a30_n2', name:'将灵墓地',   poolKey:'danger' },
  ]},
  { id: 'a31', name: '血色秘境入口', world: '灵界', realmMin: 8, nodes: [
    { id:'a31_n1', name:'秘境入口',   poolKey:'secret' },
    { id:'a31_n2', name:'血晶矿洞',   poolKey:'danger' },
  ]},
  { id: 'a32', name: '灵界商盟',   world: '灵界', realmMin: 6, nodes: [] },
  { id: 'a33', name: '虚空裂缝',   world: '灵界', realmMin: 8, nodes: [
    { id:'a33_n1', name:'裂缝边缘',   poolKey:'danger' },
    { id:'a33_n2', name:'虚空深处',   poolKey:'danger' },
  ]},
  { id: 'a34', name: '星海秘境',   world: '灵界', realmMin: 7, nodes: [
    { id:'a34_n1', name:'星海入口',   poolKey:'secret' },
    { id:'a34_n2', name:'星辰阵',     poolKey:'secret' },
  ]},
  { id: 'a35', name: '广寒仙域',   world: '灵界', realmMin: 8, nodes: [] },
  { id: 'a36', name: '无边沙漠',   world: '灵界', realmMin: 6, nodes: [] },

  // ═══════════ 仙界 9 区域 ═══════════
  { id: 'a37', name: '飞升池',     world: '仙界', realmMin: 10, nodes: [] },
  { id: 'a38', name: '金源仙域',   world: '仙界', realmMin: 10, nodes: [
    { id:'a38_n1', name:'金源矿脉',   poolKey:'wild' },
    { id:'a38_n2', name:'金源仙宫',   poolKey:'danger' },
    { id:'a38_n3', name:'本源矿脉',   poolKey:'secret' },
  ]},
  { id: 'a39', name: '北寒仙域',   world: '仙界', realmMin: 10, nodes: [
    { id:'a39_n1', name:'冰晶平原',   poolKey:'wild' },
    { id:'a39_n2', name:'北寒仙宫',   poolKey:'danger' },
  ]},
  { id: 'a40', name: '天庭城',     world: '仙界', realmMin: 11, nodes: [
    { id:'a40_n1', name:'南天门',     poolKey:'faction' },
    { id:'a40_n2', name:'仙坊',       poolKey:'town' },
    { id:'a40_n3', name:'凌霄殿外',   poolKey:'faction' },
  ]},
  { id: 'a41', name: '源初秘境入口', world: '仙界', realmMin: 12, nodes: [
    { id:'a41_n1', name:'秘境入口',   poolKey:'secret' },
    { id:'a41_n2', name:'混沌边缘',   poolKey:'danger' },
  ]},
  { id: 'a42', name: '混沌外域',   world: '仙界', realmMin: 13, nodes: [
    { id:'a42_n1', name:'外域边缘',   poolKey:'danger' },
    { id:'a42_n2', name:'混沌深渊',   poolKey:'danger' },
    { id:'a42_n3', name:'古神遗迹',   poolKey:'secret' },
  ]},
  { id: 'a43', name: '灰域',       world: '仙界', realmMin: 13, nodes: [
    { id:'a43_n1', name:'灰域入口',   poolKey:'danger' },
    { id:'a43_n2', name:'时空扭曲区', poolKey:'danger' },
  ]},
  { id: 'a44', name: '轮回殿外',   world: '仙界', realmMin: 13, nodes: [
    { id:'a44_n1', name:'轮回殿入口', poolKey:'secret' },
    { id:'a44_n2', name:'轮回桥',     poolKey:'danger' },
  ]},
  { id: 'a45', name: '仙帝城',     world: '仙界', realmMin: 12, nodes: [] },
];

// 节点计数
const totalNodes = AREAS.reduce((sum, a) => sum + a.nodes.length, 0);
// ≈86，符合"约90个"的GDD设定


/* ================================================================
 *  三、秘境副本数据（10秘境 / 多层 / CD / 推荐境界 / 专属事件层池）
 * ================================================================ */

/**
 * @typedef  {Object} RealmLayerDef
 * @property {number} layer    - 层号 1-based
 * @property {string} poolKey  - 该层事件池 key
 * @property {number|null} bossChance - BOSS事件触发概率（null=无BOSS）
 */

/**
 * @typedef  {Object} SecretRealmDef
 * @property {string}  key        - 内部 key
 * @property {string}  name       - 中文名
 * @property {string}  world      - 所属界
 * @property {number}  cdDays     - 冷却天数（0=随时/需钥匙触发）
 * @property {string}  recommend  - 推荐境界文本
 * @property {number}  realmMin   - 最低境界索引
 * @property {number}  realmMax   - 最高推荐境界索引
 * @property {string}  trigger    - 'cd'|'key'|'event' 触发方式
 * @property {RealmLayerDef[]} layers - 层定义
 */

/** @type {SecretRealmDef[]} */
const SECRET_REALM_DEFS = [
  // ═══ 人界 5 秘境 ═══
  {
    key: '血色禁地', name: '血色禁地', world: '人界',
    cdDays: 30, recommend: '筑基~金丹', realmMin: 2, realmMax: 3,
    trigger: 'cd',
    layers: [
      { layer: 1, poolKey: 'wild',     bossChance: null },
      { layer: 2, poolKey: 'secret',   bossChance: null },
      { layer: 3, poolKey: 'danger',   bossChance: 0.30 },
    ],
  },
  {
    key: '小寰天秘境', name: '小寰天秘境', world: '人界',
    cdDays: 50, recommend: '金丹~元婴', realmMin: 3, realmMax: 4,
    trigger: 'cd',
    layers: [
      { layer: 1, poolKey: 'wild',     bossChance: null },
      { layer: 2, poolKey: 'secret',   bossChance: null },
      { layer: 3, poolKey: 'secret',   bossChance: null },
      { layer: 4, poolKey: 'danger',   bossChance: null },
      { layer: 5, poolKey: 'secret',   bossChance: 0.25 },
    ],
  },
  {
    key: '虚天殿', name: '虚天殿', world: '人界',
    cdDays: 100, recommend: '元婴~化神', realmMin: 4, realmMax: 5,
    trigger: 'cd',
    layers: [
      { layer: 1, poolKey: 'secret',   bossChance: null },  // 外殿
      { layer: 2, poolKey: 'danger',   bossChance: null },  // 内殿
      { layer: 3, poolKey: 'secret',   bossChance: null },  // 偏殿
      { layer: 4, poolKey: 'danger',   bossChance: null },  // 冰火道
      { layer: 5, poolKey: 'wild',     bossChance: null },  //
      { layer: 6, poolKey: 'secret',   bossChance: null },  // 虚天鼎室
      { layer: 7, poolKey: 'danger',   bossChance: 0.20 },  // 出口BOSS
    ],
  },
  {
    key: '昆吾山封印', name: '昆吾山封印', world: '人界',
    cdDays: 0, recommend: '元婴~化神', realmMin: 4, realmMax: 5,
    trigger: 'key',
    layers: [
      { layer: 1, poolKey: 'danger',   bossChance: null },  // 外围
      { layer: 2, poolKey: 'secret',   bossChance: null },  // 封印核心
      { layer: 3, poolKey: 'danger',   bossChance: null },  // 魔窟
      { layer: 4, poolKey: 'danger',   bossChance: 0.30 },  // 深渊BOSS
    ],
  },
  {
    key: '星宫秘境', name: '星宫秘境', world: '人界',
    cdDays: 0, recommend: '金丹~元婴', realmMin: 3, realmMax: 4,
    trigger: 'event',
    layers: [
      { layer: 1, poolKey: 'secret',   bossChance: null },
      { layer: 2, poolKey: 'wild',     bossChance: null },
      { layer: 3, poolKey: 'secret',   bossChance: 0.25 },
    ],
  },

  // ═══ 灵界 3 秘境 ═══
  {
    key: '广灵洞天', name: '广灵洞天', world: '灵界',
    cdDays: 500, recommend: '炼虚~合体', realmMin: 6, realmMax: 7,
    trigger: 'key',
    layers: [
      { layer: 1, poolKey: 'wild',     bossChance: null },
      { layer: 2, poolKey: 'secret',   bossChance: null },
      { layer: 3, poolKey: 'danger',   bossChance: null },
      { layer: 4, poolKey: 'secret',   bossChance: null },
      { layer: 5, poolKey: 'danger',   bossChance: 0.20 },
    ],
  },
  {
    key: '雷鸣秘境', name: '雷鸣秘境', world: '灵界',
    cdDays: 200, recommend: '合体~大乘', realmMin: 7, realmMax: 8,
    trigger: 'cd',
    layers: [
      { layer: 1, poolKey: 'danger',   bossChance: null },
      { layer: 2, poolKey: 'wild',     bossChance: null },
      { layer: 3, poolKey: 'danger',   bossChance: null },
      { layer: 4, poolKey: 'secret',   bossChance: 0.25 },
    ],
  },
  {
    key: '血神秘境', name: '血神秘境', world: '灵界',
    cdDays: 1000, recommend: '大乘~渡劫', realmMin: 8, realmMax: 9,
    trigger: 'event',
    layers: [
      { layer: 1, poolKey: 'danger',   bossChance: null },
      { layer: 2, poolKey: 'secret',   bossChance: null },
      { layer: 3, poolKey: 'danger',   bossChance: null },
      { layer: 4, poolKey: 'secret',   bossChance: null },
      { layer: 5, poolKey: 'danger',   bossChance: null },
      { layer: 6, poolKey: 'danger',   bossChance: 0.20 },
    ],
  },

  // ═══ 仙界 2 秘境 ═══
  {
    key: '源初秘境', name: '源初秘境', world: '仙界',
    cdDays: 10000, recommend: '真仙~大罗', realmMin: 10, realmMax: 13,
    trigger: 'cd',
    layers: [
      { layer: 1, poolKey: 'wild',     bossChance: null },
      { layer: 2, poolKey: 'secret',   bossChance: null },
      { layer: 3, poolKey: 'danger',   bossChance: null },
      { layer: 4, poolKey: 'secret',   bossChance: null },
      { layer: 5, poolKey: 'danger',   bossChance: null },
      { layer: 6, poolKey: 'secret',   bossChance: null },
      { layer: 7, poolKey: 'danger',   bossChance: null },
      { layer: 8, poolKey: 'secret',   bossChance: null },
      { layer: 9, poolKey: 'danger',   bossChance: 0.15 },
    ],
  },
  {
    key: '轮回秘境', name: '轮回秘境', world: '仙界',
    cdDays: 0, recommend: '大罗~道祖', realmMin: 13, realmMax: 14,
    trigger: 'event',
    layers: [
      { layer: 1, poolKey: 'danger',   bossChance: null },
      { layer: 2, poolKey: 'secret',   bossChance: null },
      { layer: 3, poolKey: 'danger',   bossChance: null },
      { layer: 4, poolKey: 'secret',   bossChance: null },
      { layer: 5, poolKey: 'danger',   bossChance: null },
      { layer: 6, poolKey: 'danger',   bossChance: 0.15 },
    ],
  },
];


/* ================================================================
 *  四、简易事件总线
 * ================================================================ */

class EventBus {
  constructor() {
    /** @type {Map<string, Function[]>} */
    this._listeners = new Map();
  }

  /**
   * 注册监听
   * @param {string} event
   * @param {Function} fn
   */
  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(fn);
  }

  /**
   * 取消监听
   * @param {string} event
   * @param {Function} fn
   */
  off(event, fn) {
    const arr = this._listeners.get(event);
    if (!arr) return;
    const idx = arr.indexOf(fn);
    if (idx !== -1) arr.splice(idx, 1);
  }

  /**
   * 触发事件
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const arr = this._listeners.get(event);
    if (!arr) return;
    for (const fn of arr) {
      try { fn(data); } catch (e) { /* 静默吞错，不阻断事件链 */ }
    }
  }

  /** 清空所有监听 */
  clear() {
    this._listeners.clear();
  }
}


/* ================================================================
 *  五、概率抽取工具
 * ================================================================ */

/**
 * 按权重从事件池抽取一个事件名
 * @param {Object<string, number>} pool - { 事件名: 权重 }
 * @returns {string}
 */
function weightedPick(pool) {
  const entries = Object.entries(pool);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [name, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return name;
  }
  return entries[entries.length - 1][0]; // 浮点保底
}

/** [0, 1) 随机 */
function rand() {
  return Math.random();
}


/* ================================================================
 *  六、Exploration 类
 * ================================================================ */

class Exploration {
  constructor() {
    /** @type {EventBus} 内置事件总线 */
    this.bus = new EventBus();

    /**
     * 节点探索次数记录：{ nodeId: count }
     * 每节点最多 DATA.EXPLORATION.maxExploresPerNode（默认3次）
     */
    this.nodeExploreCount = {};

    /**
     * 秘境 CD 记录：{ realmKey: lastEnterDay }
     * day 来自外部游戏日历传入
     */
    this.realmCD = {};

    /**
     * 秘境当前进度：{ realmKey: { currentLayer, active, dungeonSeed } }
     */
    this.realmProgress = {};

    /**
     * 渡劫链进度：{ nodeId: stepIndex }
     * 供 tribulation 事件池顺序推进
     */
    this.tribulationProgress = {};
  }

  // ────────────── 区域 / 节点查询 ──────────────

  /** 获取全部区域 */
  getAllAreas() { return AREAS; }

  /**
   * 按 world 筛选区域
   * @param {'人界'|'灵界'|'仙界'} world
   * @returns {AreaDef[]}
   */
  getAreasByWorld(world) {
    return AREAS.filter(a => a.world === world);
  }

  /**
   * 按 id 查区域
   * @param {string} areaId
   * @returns {AreaDef|undefined}
   */
  getArea(areaId) {
    return AREAS.find(a => a.id === areaId);
  }

  /**
   * 按 id 查节点
   * @param {string} nodeId
   * @returns {{ area: AreaDef, node: NodeDef }|null}
   */
  getNodeById(nodeId) {
    for (const area of AREAS) {
      const node = area.nodes.find(n => n.id === nodeId);
      if (node) return { area, node };
    }
    return null;
  }

  /**
   * 获取节点已探索次数
   * @param {string} nodeId
   * @returns {number}
   */
  getNodeExploreCount(nodeId) {
    return this.nodeExploreCount[nodeId] || 0;
  }

  /**
   * 检查节点是否还可探索
   * @param {string} nodeId
   * @returns {boolean}
   */
  canExploreNode(nodeId) {
    const max = DATA.EXPLORATION.maxExploresPerNode;
    return (this.nodeExploreCount[nodeId] || 0) < max;
  }

  /**
   * 重置节点探索次数（可用于刷新/新轮回等）
   * @param {string} [nodeId] - 不传则重置全部
   */
  resetExploreCount(nodeId) {
    if (nodeId) {
      this.nodeExploreCount[nodeId] = 0;
    } else {
      this.nodeExploreCount = {};
    }
  }

  // ────────────── 探索核心 ──────────────

  /**
   * 从指定事件池抽取一个事件
   * @param {string} poolKey - 'wild'|'secret'|'town'|'faction'|'danger'
   * @returns {string} 事件名
   */
  pickEvent(poolKey) {
    const pool = POOLS[poolKey];
    if (!pool) return '空手而归';
    return weightedPick(pool);
  }

  /**
   * 探索一个节点
   * 流程：检查次数 → 检查境界 → 从事件池抽事件 → 触发事件总线 → 返回事件数据
   *
   * @param {string} nodeId   - 节点 ID
   * @param {Object} player   - Player 实例（需有 realmIndex）
   * @param {number} [day]    - 当前游戏日（用于渡劫链）
   * @returns {Object} 探索结果
   */
  exploreNode(nodeId, player, day = 0) {
    const result = this.getNodeById(nodeId);
    if (!result) {
      return { success: false, reason: '节点不存在', event: null };
    }

    const { area, node } = result;

    // 检查探索次数
    if (!this.canExploreNode(nodeId)) {
      this.bus.emit('explore:limit', { nodeId, node, area,
        remaining: 0, max: DATA.EXPLORATION.maxExploresPerNode });
      return { success: false, reason: '该节点探索次数已用完', event: null };
    }

    // 检查境界准入
    if (player.realmIndex < area.realmMin) {
      return { success: false, reason: `境界不足，需要至少 ${area.realmMin}`, event: null };
    }

    // 次数 +1
    this.nodeExploreCount[nodeId] = (this.nodeExploreCount[nodeId] || 0) + 1;
    const remaining = DATA.EXPLORATION.maxExploresPerNode - this.nodeExploreCount[nodeId];

    // ── 事件抽取 ──
    let event;
    let tribulationStep = null;

    if (node.poolKey === 'tribulation') {
      // 渡劫链：顺序推进
      const prog = this.tribulationProgress[nodeId] || 0;
      const chainIdx = Math.min(prog, TRIBULATION_CHAIN.length - 1);
      event = TRIBULATION_CHAIN[chainIdx];
      tribulationStep = { index: chainIdx, total: TRIBULATION_CHAIN.length, event };
      // 仅在非最终步时推进
      if (prog < TRIBULATION_CHAIN.length - 1) {
        this.tribulationProgress[nodeId] = prog + 1;
      }
    } else {
      event = this.pickEvent(node.poolKey);
    }

    // ── 触发事件总线 ──
    /** @type {ExploreEventData} */
    const eventData = {
      nodeId,
      nodeName: node.name,
      areaId: area.id,
      areaName: area.name,
      world: area.world,
      poolKey: node.poolKey,
      event,
      remaining,
      day,
    };
    if (tribulationStep) eventData.tribulationStep = tribulationStep;

    this.bus.emit('explore:event', eventData);

    return {
      success: true,
      event,
      node: { id: nodeId, name: node.name },
      area: { id: area.id, name: area.name, world: area.world },
      poolKey: node.poolKey,
      remaining,
      tribulationStep,
    };
  }

  /**
   * 批量探索（同一节点多次）
   * @param {string} nodeId
   * @param {Object} player
   * @param {number} [count] - 探索次数（默认用完剩余）
   * @param {number} [day]
   * @returns {Object[]} 各次结果
   */
  exploreNodeBatch(nodeId, player, count = Infinity, day = 0) {
    const max = DATA.EXPLORATION.maxExploresPerNode;
    const used = this.nodeExploreCount[nodeId] || 0;
    const remaining = max - used;
    const times = Math.min(count, remaining);
    const results = [];
    for (let i = 0; i < times; i++) {
      results.push(this.exploreNode(nodeId, player, day));
    }
    return results;
  }

  // ────────────── 秘境副本 ──────────────

  /** 获取全部秘境定义 */
  getAllSecretRealms() { return SECRET_REALM_DEFS; }

  /**
   * 按 key 查秘境
   * @param {string} realmKey
   * @returns {SecretRealmDef|undefined}
   */
  getSecretRealm(realmKey) {
    return SECRET_REALM_DEFS.find(r => r.key === realmKey);
  }

  /**
   * 按世界筛选秘境
   * @param {'人界'|'灵界'|'仙界'} world
   * @returns {SecretRealmDef[]}
   */
  getSecretRealmsByWorld(world) {
    return SECRET_REALM_DEFS.filter(r => r.world === world);
  }

  /**
   * 检查秘境 CD 是否已过
   * @param {string} realmKey
   * @param {number} currentDay - 当前游戏日
   * @returns {boolean}
   */
  isRealmCDReady(realmKey, currentDay) {
    const realm = this.getSecretRealm(realmKey);
    if (!realm) return false;
    if (realm.cdDays === 0) return true; // 钥匙/事件触发，无CD
    const lastEnter = this.realmCD[realmKey] || -Infinity;
    return (currentDay - lastEnter) >= realm.cdDays;
  }

  /**
   * 获取秘境剩余 CD 天数
   * @param {string} realmKey
   * @param {number} currentDay
   * @returns {number} 剩余天数（0=已就绪）
   */
  getRealmCDRemaining(realmKey, currentDay) {
    const realm = this.getSecretRealm(realmKey);
    if (!realm || realm.cdDays === 0) return 0;
    const lastEnter = this.realmCD[realmKey] || -Infinity;
    const elapsed = currentDay - lastEnter;
    return Math.max(0, realm.cdDays - elapsed);
  }

  /**
   * 进入秘境
   * @param {string} realmKey
   * @param {Object} player - Player 实例
   * @param {number} currentDay
   * @returns {Object}
   */
  enterSecretRealm(realmKey, player, currentDay) {
    const realm = this.getSecretRealm(realmKey);
    if (!realm) {
      return { success: false, reason: '秘境不存在' };
    }

    // 检查境界
    if (player.realmIndex < realm.realmMin) {
      return { success: false, reason: `境界不足，推荐: ${realm.recommend}` };
    }

    // 检查 CD
    if (!this.isRealmCDReady(realmKey, currentDay)) {
      const remaining = this.getRealmCDRemaining(realmKey, currentDay);
      return { success: false, reason: `CD中，剩余 ${remaining} 天` };
    }

    // 检查是否已在副本中
    if (this.realmProgress[realmKey] && this.realmProgress[realmKey].active) {
      return { success: false, reason: '已在副本中，请先完成或退出' };
    }

    // CD 为 0 但需钥匙/事件触发时，由外部 Game 层判定后调用 forceEnter
    if (realm.trigger !== 'cd' && realm.cdDays === 0) {
      // 不在此处强制检查，由高层逻辑处理
    }

    // 记录进入时间
    this.realmCD[realmKey] = currentDay;

    // 初始化进度
    this.realmProgress[realmKey] = {
      currentLayer: 1,
      active: true,
      enteredDay: currentDay,
    };

    this.bus.emit('realm:enter', {
      realmKey,
      realmName: realm.name,
      world: realm.world,
      totalLayers: realm.layers.length,
      day: currentDay,
    });

    return {
      success: true,
      realm: { key: realmKey, name: realm.name, world: realm.world },
      currentLayer: 1,
      totalLayers: realm.layers.length,
      cdDays: realm.cdDays,
    };
  }

  /**
   * 强制进入（跳过 CD / 触发条件，用于钥匙/事件触发）
   * @param {string} realmKey
   * @param {Object} player
   * @param {number} currentDay
   * @returns {Object}
   */
  forceEnterRealm(realmKey, player, currentDay) {
    const realm = this.getSecretRealm(realmKey);
    if (!realm) return { success: false, reason: '秘境不存在' };

    // 清除 CD 限制
    this.realmCD[realmKey] = -Infinity;
    return this.enterSecretRealm(realmKey, player, currentDay);
  }

  /**
   * 探索秘境当前层
   * @param {string} realmKey
   * @param {Object} player
   * @param {number} [currentDay]
   * @returns {Object}
   */
  exploreRealmLayer(realmKey, player, currentDay = 0) {
    const realm = this.getSecretRealm(realmKey);
    if (!realm) return { success: false, reason: '秘境不存在' };

    const progress = this.realmProgress[realmKey];
    if (!progress || !progress.active) {
      return { success: false, reason: '未进入该秘境' };
    }

    const layerIdx = progress.currentLayer - 1;
    if (layerIdx >= realm.layers.length) {
      return { success: false, reason: '已通关所有层' };
    }

    const layerDef = realm.layers[layerIdx];
    const event = this.pickEvent(layerDef.poolKey);

    // BOSS判定
    let isBoss = false;
    if (layerDef.bossChance && rand() < layerDef.bossChance) {
      isBoss = true;
    }

    // 推进层数
    progress.currentLayer++;

    // 判断是否通关
    const isLastLayer = progress.currentLayer > realm.layers.length;
    if (isLastLayer) {
      progress.active = false;
    }

    /** @type {RealmLayerEventData} */
    const eventData = {
      realmKey,
      realmName: realm.name,
      world: realm.world,
      layer: layerIdx + 1,
      totalLayers: realm.layers.length,
      poolKey: layerDef.poolKey,
      event,
      isBoss,
      isLastLayer,
      day: currentDay,
    };

    this.bus.emit(isBoss ? 'realm:boss' : 'realm:layer', eventData);

    if (isLastLayer) {
      this.bus.emit('realm:complete', {
        realmKey,
        realmName: realm.name,
        totalLayers: realm.layers.length,
        day: currentDay,
      });
    }

    return {
      success: true,
      event,
      layer: layerIdx + 1,
      totalLayers: realm.layers.length,
      poolKey: layerDef.poolKey,
      isBoss,
      completed: isLastLayer,
    };
  }

  /**
   * 退出秘境（中途退出）
   * @param {string} realmKey
   * @returns {Object}
   */
  exitSecretRealm(realmKey) {
    const progress = this.realmProgress[realmKey];
    if (!progress || !progress.active) {
      return { success: false, reason: '未在副本中' };
    }

    const realm = this.getSecretRealm(realmKey);
    const layerExited = progress.currentLayer - 1;
    progress.active = false;

    this.bus.emit('realm:exit', {
      realmKey,
      realmName: realm ? realm.name : realmKey,
      layerExited,
      totalLayers: realm ? realm.layers.length : 0,
    });

    return {
      success: true,
      layerExited,
      message: `已退出 ${realm ? realm.name : realmKey}，探索至第 ${layerExited} 层`,
    };
  }

  /**
   * 检查是否正在秘境中
   * @param {string} realmKey
   * @returns {boolean}
   */
  isInRealm(realmKey) {
    const p = this.realmProgress[realmKey];
    return !!(p && p.active);
  }

  /**
   * 获取当前秘境进度
   * @param {string} realmKey
   * @returns {{ active: boolean, currentLayer: number }|null}
   */
  getRealmProgress(realmKey) {
    return this.realmProgress[realmKey] || null;
  }

  // ────────────── 渡劫链 ──────────────

  /** 重置渡劫进度 */
  resetTribulation(nodeId) {
    this.tribulationProgress[nodeId] = 0;
  }

  // ────────────── 事件总线代理 ──────────────

  on(event, fn) { this.bus.on(event, fn); }
  off(event, fn) { this.bus.off(event, fn); }
  emit(event, data) { this.bus.emit(event, data); }

  // ────────────── 序列化 ──────────────

  toJSON() {
    return {
      nodeExploreCount: { ...this.nodeExploreCount },
      realmCD: { ...this.realmCD },
      realmProgress: JSON.parse(JSON.stringify(this.realmProgress)),
      tribulationProgress: { ...this.tribulationProgress },
    };
  }

  static fromJSON(data) {
    const e = new Exploration();
    if (data) {
      e.nodeExploreCount = data.nodeExploreCount || {};
      e.realmCD = data.realmCD || {};
      e.realmProgress = data.realmProgress || {};
      e.tribulationProgress = data.tribulationProgress || {};
    }
    return e;
  }

  // ────────────── 调试 / 统计 ──────────────

  /** 统计信息 */
  getStats() {
    const nodesWithProgress = Object.keys(this.nodeExploreCount).length;
    const totalNodeCount = totalNodes;
    const activeRealms = Object.values(this.realmProgress).filter(p => p.active).length;
    return {
      totalAreas: AREAS.length,
      totalNodes: totalNodeCount,
      exploredNodes: nodesWithProgress,
      flatAreas: AREAS.filter(a => a.nodes.length === 0).length,
      activeSecretRealms: activeRealms,
      realmCDs: Object.entries(this.realmCD).map(([k, d]) => ({ key: k, lastEnter: d })),
    };
  }
}


/* ================================================================
 *  七、导出
 * ================================================================ */

export { Exploration };
// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Exploration = Exploration;
  window.EventBus_Exploration = EventBus;
  window.AREAS_EXPLORATION = AREAS;
  window.SECRET_REALM_DEFS = SECRET_REALM_DEFS;
}
export {
  AREAS,
  SECRET_REALM_DEFS,
  POOLS,
  POOL_KEYS,
  DANGER_EVENT_POOL,
  TRIBULATION_CHAIN,
  EventBus,
  weightedPick,
};

/**
 * @typedef {Object} ExploreEventData
 * @property {string} nodeId
 * @property {string} nodeName
 * @property {string} areaId
 * @property {string} areaName
 * @property {string} world
 * @property {string} poolKey
 * @property {string} event
 * @property {number} remaining
 * @property {number} day
 * @property {{ index: number, total: number, event: string }} [tribulationStep]
 */

/**
 * @typedef {Object} RealmLayerEventData
 * @property {string} realmKey
 * @property {string} realmName
 * @property {string} world
 * @property {number} layer
 * @property {number} totalLayers
 * @property {string} poolKey
 * @property {string} event
 * @property {boolean} isBoss
 * @property {boolean} isLastLayer
 * @property {number} day
 */
