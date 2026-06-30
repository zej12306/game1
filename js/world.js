/**
 * world.js — 世界系统（时间·地图·交易）
 * 基于 GDD 行1181~1281 设计，覆盖⑭时间、⑮地图、⑯交易三大系统。
 *
 * 依赖：DATA（data.js）
 * 导出：World 类
 */

import { DATA } from './data.js';

/* ================================================================
 *  零、内部工具
 * ================================================================ */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function pickWeighted(weightMap) {
  const entries = Object.entries(weightMap);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

/* ================================================================
 *  一、时间系统 ⑭
 * ================================================================ */

/** 月份→季节 */
const MONTH_SEASON = {
  1:'冬',  2:'冬',  3:'春',  4:'春',  5:'春',
  6:'夏',  7:'夏',  8:'夏',  9:'秋', 10:'秋',
  11:'秋', 12:'冬',
};

/**
 * 天气组（GDD §⑭ 季节与天气联动）
 * 每个季节→{天气类型: 概率%}
 */
const SEASON_WEATHER = {
  春: { 晴:35, 阴:25, 雨:25, 雷雨:10, 潮汐:5 },
  夏: { 晴:45, 阴:15, 雨:15, 雷雨:20, 潮汐:5 },
  秋: { 晴:40, 阴:20, 雨:20, 雷雨:8, 雪:8, 暴雪:2, 潮汐:2 },
  冬: { 晴:30, 阴:15, 雨:5, 雷雨:2, 雪:30, 暴雪:15, 潮汐:3 },
};

/** 天气效果（对修炼/探索的修正） */
const WEATHER_EFFECT = {
  晴:   { cultivate: 0,     explore: 0,   combatBonus: 0 },
  阴:   { cultivate: -0.05, explore: 0,   combatBonus: 0 },
  雨:   { cultivate: 0.05,  explore: -0.10, combatBonus: -0.05 },
  雷雨:  { cultivate: 0.10, explore: -0.20, combatBonus: 0.05, rareEvent: true },
  雪:   { cultivate: 0,     explore: -0.15, combatBonus: -0.10 },
  暴雪:  { cultivate: 0.05, explore: -0.30, combatBonus: -0.15, rare: true },
  潮汐:  { cultivate: 0.15, explore: 0,    combatBonus: 0.05,  rareEvent: true },
};

/** GDD §⑭ 寿元全表 */
const LIFESPAN_TABLE = {
  凡人: { min:80, max:100 },   练气: { min:150, max:150 },
  筑基: { min:300, max:300 },   金丹: { min:600, max:600 },
  元婴: { min:1500, max:1500 }, 化神: { min:3000, max:3000 },
  炼虚: { min:5000, max:5000 }, 合体: { min:10000, max:10000 },
  大乘: { min:20000, max:20000 },渡劫: { min:30000, max:30000 },
  真仙: { min:100000, max:100000 },金仙: { min:500000, max:500000 },
  太乙: { min:2000000, max:2000000 },大罗: { min:10000000, max:10000000 },
  道祖: { min:Infinity, max:Infinity },
};

/** 延寿手段 */
const LIFESPAN_EXTEND = {
  延寿丹:    { years: 50, note: '首次有效' },
  突破大境界:{ bonus: 1.0, note: '大幅提升至新境界寿元' },
  突破大成功:{ bonus: 0.10, note: '寿元上限+10%' },
  长春功:    { perLevel: 5, note: '每级+5年' },
};

/** 周期性大事件（GDD §⑭） */
const PERIODIC_EVENTS = {
  yearly: [
    { month:1, day:1, name:'新年', effect:'全属+5%持续3天', durationDays:3 },
    { month:6, day:21, name:'夏至灵气潮汐', effect:'修炼+20%持续7天', durationDays:7 },
    { month:12,day:31,name:'年末结算', effect:'盘点一年收获', record:true },
  ],
  decade: [
    { everyYears:10, name:'天南城大型拍卖会', note:'天级功法+古宝' },
    { everyYears:10, name:'各宗门大比', note:'元婴以下参加', participation:true },
  ],
  longTerm: [
    { everyYears:30,  name:'血色禁地开启', note:'筑基~金丹·限30天', durationDays:30 },
    { everyYears:50,  name:'小寰天秘境开启', note:'金丹~元婴' },
    { everyYears:100, name:'虚天殿开启', note:'元婴~化神·限90天', durationDays:90 },
    { everyYears:100, name:'星宫秘藏开放' },
    { everyYears:500, name:'灵界·广灵洞天开启', realm:'灵界' },
    { everyYears:1000,name:'灵界·血神秘境开启', realm:'灵界' },
  ],
  irregular: [
    '昆吾山封印松动', '天降陨铁', '异火出世',
    '古魔复苏', '源初秘境入口现世',
  ],
};


/* ================================================================
 *  二、地图系统 ⑮
 * ================================================================ */

/** 三界 */
const REALMS_MAP = ['人界', '灵界', '仙界'];

/**
 * 区域解锁顺序（按境界，GDD §⑮）
 * key: 区域名, unlockRealm, unlockSubStage, parentRealm
 */
const REGIONS = {
  // ── 人界 ──
  青云山:  { unlockRealm:'凡人',  unlockSubStage:0, realm:'人界', travelCost:0,   desc:'起始点' },
  太南谷:  { unlockRealm:'凡人',  unlockSubStage:0, realm:'人界', travelCost:1,   desc:'初级修炼地' },
  天南城:  { unlockRealm:'凡人',  unlockSubStage:2, realm:'人界', travelCost:2,   desc:'人界最大交易中心' },
  黑风林:  { unlockRealm:'练气',  unlockSubStage:0, realm:'人界', travelCost:3,   desc:'练气试炼地', danger:1 },
  黄枫谷:  { unlockRealm:'练气',  unlockSubStage:1, realm:'人界', travelCost:4,   desc:'七大派之一·宗门可加入' },
  落云宗:  { unlockRealm:'练气',  unlockSubStage:1, realm:'人界', travelCost:4,   desc:'宗门', isSect:true },
  灵兽山:  { unlockRealm:'练气',  unlockSubStage:2, realm:'人界', travelCost:5,   desc:'灵兽圣地' },
  血禁山脉:{ unlockRealm:'筑基',  unlockSubStage:0, realm:'人界', travelCost:6,   desc:'血色禁地入口', danger:3 },
  天星城:  { unlockRealm:'金丹',  unlockSubStage:0, realm:'人界', travelCost:8,   desc:'乱星海主城·需传送阵', hasTeleport:true },
  魁星岛:  { unlockRealm:'金丹',  unlockSubStage:1, realm:'人界', travelCost:6,   desc:'乱星海岛屿', danger:2 },
  海族海域:{ unlockRealm:'金丹',  unlockSubStage:2, realm:'人界', travelCost:8,   desc:'海族领域', danger:3 },
  妖兽群岛:{ unlockRealm:'元婴',  unlockSubStage:0, realm:'人界', travelCost:10,  desc:'灵兽遍布', danger:4 },
  陨铁岛:  { unlockRealm:'元婴',  unlockSubStage:0, realm:'人界', travelCost:12,  desc:'材料丰富', danger:3 },
  魔岛:    { unlockRealm:'元婴',  unlockSubStage:1, realm:'人界', travelCost:14,  desc:'魔修聚集', danger:5 },
  小寰天:  { unlockRealm:'元婴',  unlockSubStage:2, realm:'人界', travelCost:10,  desc:'秘境入口·每50年开启', isSecretRealm:true },
  虚天殿:  { unlockRealm:'元婴',  unlockSubStage:3, realm:'人界', travelCost:12,  desc:'秘境入口·每100年开启', isSecretRealm:true, hasTeleport:true },
  星宫:    { unlockRealm:'化神',  unlockSubStage:0, realm:'人界', travelCost:10,  desc:'星宫秘藏', danger:4 },
  大晋皇都:{ unlockRealm:'化神',  unlockSubStage:0, realm:'人界', travelCost:15,  desc:'大晋帝国中心·需传送阵', hasTeleport:true },
  天罗国:  { unlockRealm:'化神',  unlockSubStage:0, realm:'人界', travelCost:18,  desc:'海外诸国', danger:3 },
  慕兰草原:{ unlockRealm:'化神',  unlockSubStage:1, realm:'人界', travelCost:20,  desc:'慕兰部落', danger:4 },
  北凉国:  { unlockRealm:'化神',  unlockSubStage:1, realm:'人界', travelCost:22,  desc:'北凉诸国', danger:3 },
  大晋古战场:{ unlockRealm:'化神', unlockSubStage:2, realm:'人界', travelCost:15,  desc:'上古遗迹', danger:5 },
  万年灵木禁地:{ unlockRealm:'化神',unlockSubStage:2, realm:'人界', travelCost:12, desc:'禁地', danger:5, isForbidden:true },
  昆吾山:  { unlockRealm:'化神',  unlockSubStage:3, realm:'人界', travelCost:25,  desc:'封印松动·不定期事件', danger:5, isForbidden:true },
  堕落魔渊:{ unlockRealm:'化神',  unlockSubStage:3, realm:'人界', travelCost:30,  desc:'飞升灵界入口·化神圆满可进入', isAscensionGate:true, ascensionTarget:'灵界' },

  // ── 灵界 ──
  灵界边境:{ unlockRealm:'炼虚',  unlockSubStage:0, realm:'灵界', travelCost:0,   desc:'飞升着陆点' },
  广灵洞天:{ unlockRealm:'炼虚',  unlockSubStage:0, realm:'灵界', travelCost:5,   desc:'秘境·每500年开启', isSecretRealm:true },
  血神禁地:{ unlockRealm:'合体',  unlockSubStage:0, realm:'灵界', travelCost:8,   desc:'秘境·每1000年开启', isSecretRealm:true, danger:4 },
  灵渊:    { unlockRealm:'炼虚',  unlockSubStage:1, realm:'灵界', travelCost:10,  desc:'修炼圣地', danger:2 },
  天渊城:  { unlockRealm:'炼虚',  unlockSubStage:2, realm:'灵界', travelCost:12,  desc:'灵界主城', hasTeleport:true },
  万妖谷:  { unlockRealm:'合体',  unlockSubStage:0, realm:'灵界', travelCost:15,  desc:'妖族领地', danger:4 },
  魔金山脉:{ unlockRealm:'合体',  unlockSubStage:1, realm:'灵界', travelCost:12,  desc:'矿产丰富', danger:3 },
  冰魄道:  { unlockRealm:'合体',  unlockSubStage:2, realm:'灵界', travelCost:14,  desc:'冰系修炼圣地', danger:3 },
  雷霆大陆:{ unlockRealm:'大乘',  unlockSubStage:0, realm:'灵界', travelCost:20,  desc:'雷系修炼圣地', danger:4 },
  灵王宫:  { unlockRealm:'大乘',  unlockSubStage:2, realm:'灵界', travelCost:18,  desc:'灵界权力中心', danger:4 },
  飞升台:  { unlockRealm:'大乘',  unlockSubStage:3, realm:'灵界', travelCost:25,  desc:'飞升仙界入口', isAscensionGate:true, ascensionTarget:'仙界' },

  // ── 仙界 ──
  仙界边境:{ unlockRealm:'真仙',  unlockSubStage:0, realm:'仙界', travelCost:0,   desc:'飞升着陆点' },
  九元观:  { unlockRealm:'真仙',  unlockSubStage:0, realm:'仙界', travelCost:10,  desc:'仙家宗门' },
  星宫仙域:{ unlockRealm:'金仙',  unlockSubStage:0, realm:'仙界', travelCost:15,  desc:'星宫在仙界的势力', hasTeleport:true },
  清元仙域:{ unlockRealm:'金仙',  unlockSubStage:1, realm:'仙界', travelCost:12,  desc:'练气飞升地' },
  道山:    { unlockRealm:'太乙',  unlockSubStage:0, realm:'仙界', travelCost:18,  desc:'道祖传承', danger:4 },
  仙界拍卖行:{ unlockRealm:'金仙', unlockSubStage:0, realm:'仙界', travelCost:5, desc:'仙界交易中心', hasTeleport:true },
  混沌海:  { unlockRealm:'太乙',  unlockSubStage:2, realm:'仙界', travelCost:30,  desc:'宇宙边缘', danger:5 },
  法则源地:{ unlockRealm:'大罗',  unlockSubStage:1, realm:'仙界', travelCost:40,  desc:'位面法则之源', danger:5, isForbidden:true },
  道祖殿:  { unlockRealm:'道祖',  unlockSubStage:0, realm:'仙界', travelCost:50,  desc:'终极目标', isForbidden:true },
};

/** 区域之间的距离表（基准天数，无传送阵时） */
const DISTANCE_TABLE = {
  // 人界
  '青云山→太南谷':1,    '青云山→天南城':2,    '青云山→黑风林':3,
  '太南谷→天南城':1,    '太南谷→黑风林':2,    '太南谷→黄枫谷':3,
  '天南城→黄枫谷':2,    '天南城→落云宗':2,    '天南城→灵兽山':3,
  '黄枫谷→灵兽山':1,    '黄枫谷→血禁山脉':3,  '灵兽山→血禁山脉':2,
  '天南城→天星城':15,   '天星城→魁星岛':3,   '天星城→海族海域':5,
  '魁星岛→妖兽群岛':4,  '魁星岛→陨铁岛':5,   '海族海域→魔岛':6,
  '天星城→虚天殿':3,    '天星城→小寰天':5,   '天星城→星宫':2,
  '天南城→大晋皇都':20, '大晋皇都→天罗国':5,  '大晋皇都→慕兰草原':6,
  '大晋皇都→北凉国':8,  '大晋皇都→大晋古战场':4, '大晋古战场→万年灵木禁地':2,
  '大晋皇都→昆吾山':12, '天南城→堕落魔渊':18, '星宫→大晋皇都':10,

  // 灵界
  '灵界边境→天渊城':3,  '灵界边境→广灵洞天':2, '天渊城→灵渊':4,
  '天渊城→万妖谷':6,    '天渊城→魔金山脉':4,  '灵渊→冰魄道':3,
  '魔金山脉→雷霆大陆':5,'灵界边境→血神禁地':8, '天渊城→灵王宫':8,
  '灵王宫→飞升台':3,

  // 仙界
  '仙界边境→九元观':3,   '仙界边境→仙界拍卖行':2, '九元观→清元仙域':5,
  '清元仙域→星宫仙域':4, '星宫仙域→道山':6,    '星宫仙域→混沌海':10,
  '道山→法则源地':5,     '法则源地→道祖殿':3,
};

/** 传送阵网络（有传送阵的区域之间可瞬间到达） */
const TELEPORT_NETWORK = {
  人界: [
    ['天南城', '天星城', 200],    // 消耗200灵石
    ['天南城', '大晋皇都', 300],
    ['天星城', '虚天殿', 150],
    ['大晋皇都', '天星城', 300],
  ],
  灵界: [
    ['灵界边境', '天渊城', 2],     // 灵晶
    ['天渊城', '灵王宫', 5],
  ],
  仙界: [
    ['仙界边境', '仙界拍卖行', 0], // 免费
    ['仙界拍卖行', '星宫仙域', 10],
  ],
};

/** 区域间路径查找（BFS） */
function findPath(from, to, realm) {
  if (from === to) return { distance: 0, segments: [], teleport: false };

  // 先检查直连+传送阵
  const net = TELEPORT_NETWORK[realm] || [];
  for (const [a, b, cost] of net) {
    if ((a === from && b === to) || (b === from && a === to)) {
      return { distance: 0, segments: [{ from, to, mode: '传送阵', cost }], teleport: true };
    }
  }

  // 查距离表
  const key1 = `${from}→${to}`;
  const key2 = `${to}→${from}`;
  const dist = DISTANCE_TABLE[key1] || DISTANCE_TABLE[key2];
  if (dist !== undefined) {
    return {
      distance: dist,
      segments: [{ from, to, mode: '赶路', days: dist }],
      teleport: false,
    };
  }

  return null; // 需中转
}


/* ================================================================
 *  三、交易系统 ⑯
 * ================================================================ */

/** 拍卖会NPC竞价者5种（GDD §⑯） */
const BIDDER_TYPES = {
  宗门长老: {
    label: '宗门长老', financeMul: { min:1.5, max:2.0 },
    preference: '功法', behavior: 'cutOff', // 截胡型
    desc: '财力雄厚，偏好功法类拍品',
  },
  富家散修: {
    label: '富家散修', financeMul: { min:1.0, max:1.5 },
    preference: '法宝', behavior: 'followThrough', // 跟价到底
    desc: '偏好法宝，跟价到底',
  },
  神秘人: {
    label: '神秘人', financeMul: { min:2.0, max:4.0 },
    preference: 'special', behavior: 'intimidate', // +50%气势压制
    desc: '财力深不可测，特殊物品竞价凶猛',
  },
  商会代表: {
    label: '商会代表', financeMul: { min:1.2, max:2.5 },
    preference: '材料', behavior: 'calculated', // 冷静计算
    desc: '偏好材料，冷静计算性价比',
  },
  新手修士: {
    label: '新手修士', financeMul: { min:0.3, max:0.8 },
    preference: null, behavior: 'impulsive', // 热血上头
    desc: '财力有限，偶尔情绪化抬价',
  },
};

/** 抬价技巧 */
const BID_TACTICS = {
  狮子开口:   { label:'狮子开口', effect:'+100%吓退概率', failRisk:0.30 },
  尾随战术:   { label:'尾随战术', effect:'最低加幅',       failRisk:0.05 },
  虚张声势:   { label:'虚张声势', effect:'匿名自抬',       failRisk:0.25 },
  沉默到底:   { label:'沉默到底', effect:'最后5秒出价',    failRisk:0.15 },
  心理底线:   { label:'心理底线', effect:'系统自动停',      failRisk:0 },
};

/** 拍卖后续事件 */
const AUCTION_AFTER_EVENTS = [
  '尾随劫杀', '买家联络', '仇家记恨',
  '捡漏通报', '压轴流拍',
];

/** 黑市数据（GDD §⑯） */
const BLACK_MARKETS = {
  天南★:       { safety:50,  itemCap:'法宝',       buyMultiplier:1.3, sellMultiplier:0.6,  discoverExplore:8,  realm:'人界' },
  乱星海★★:    { safety:40,  itemCap:'古宝',       buyMultiplier:1.4, sellMultiplier:0.55, discoverExplore:10, realm:'人界' },
  大晋★★★:    { safety:30,  itemCap:'玄天碎片',    buyMultiplier:1.5, sellMultiplier:0.5,  discoverExplore:12, realm:'人界' },
  灵界★★★★:   { safety:20,  itemCap:'通天灵宝',   buyMultiplier:1.6, sellMultiplier:0.45, discoverExplore:15, realm:'灵界' },
  仙界★★★★★★★:{ safety:10,  itemCap:'先天灵宝',  buyMultiplier:1.7, sellMultiplier:0.4,  discoverExplore:20, realm:'仙界' },
};

/** 黑市发现途径 */
const BLACK_MARKET_DISCOVERY = {
  探索:     { baseChance: 8, label:'城镇探索' },
  酒馆打听: { baseChance:15, cost:50, timeCost:1, label:'酒馆打听(50灵石+1天)' },
  NPC引荐:  { needAffection:30, label:'NPC引荐(好感≥30)' },
  暗号接头: { label:'暗号接头', special:true },
};

/** 黑市熟客度 */
const BLACK_MARKET_VIP = [
  { threshold:100,  perk:'9折' },
  { threshold:300,  perk:'优质货源' },
  { threshold:500,  perk:'VIP房间' },
  { threshold:1000, perk:'黑市拍卖会' },
  { threshold:2000, perk:'禁忌情报' },
];

/** 被劫后选项 */
const ROBBERY_OPTIONS = {
  A: { label:'交出50%灵石保命', cost:'灵石×50%', survive:1.0 },
  B: { label:'反抗',            cost:null,       survive:0.5 },
  C: { label:'隐匿符',          cost:'消耗隐匿符',survive:0.85 },
  D: { label:'遁术逃跑',        cost:'灵力',      survive:0.7 },
};

/** 物价浮动因子 */
const PRICE_FACTORS = {
  拍卖会: -0.10,  // 供过于求
  秘境:   0.30,   // 探险需求
  季节:   0.20,   // 季节波动幅度
  战争:   0.50,   // 战时溢价
  灵气潮汐:[0.10, 0.20], // 随机10~20%
};


/* ================================================================
 *  四、World 类
 * ================================================================ */

class World {
  /**
   * @param {Object} [opts]
   * @param {number} [opts.startYear] - 起始年份（默认1）
   * @param {number} [opts.startMonth] - 起始月份（默认1）
   * @param {number} [opts.startDay] - 起始日（默认1）
   */
  constructor(opts = {}) {
    // ── 时间状态 ──
    this.year   = opts.startYear  || 1;
    this.month  = opts.startMonth || 1;
    this.day    = opts.startDay   || 1;
    this.totalDays = 0; // 游戏总流逝天数

    // 天气
    this.season  = MONTH_SEASON[this.month] || '春';
    this.weather = '晴'; // 当前天气
    this.weatherDaysLeft = 0; // 当前天气剩余天数
    this._lastWeatherMonth = this.month; // 上次更新天气的月份

    // ── 地图状态 ──
    this.currentRealm = '人界';    // 当前所在界
    this.currentRegion = '青云山'; // 当前所在区域
    this.unlockedRegions = new Set(['青云山', '太南谷']); // 已解锁区域
    this.regionExploration = {};   // { regionName: 探索度% }
    this.regionBookmarks = [];     // 收藏标记

    // ── 交易状态 ──
    // 黑市熟客度 { marketName: loyaltyScore }
    this.blackMarketLoyalty = {};
    // 已发现的黑市
    this.blackMarketDiscovered = {};
    // 灵石庄存款
    this.bankDeposit = { 灵石:0, 灵晶:0, 仙灵石:0 };
    // 当前活跃拍卖
    this.activeAuction = null;
    // 价格修正缓存（物品→浮动因子）
    this.priceModifiers = {};
    // 拍卖冷却
    this.auctionCooldown = 0;

    // ── 大事件追踪 ──
    this.eventHistory = []; // [{ year, month, day, event }]
    this.activeEvents = []; // 当前激活的限时事件

    // ── 初始化 ──
    this._rollWeather();
  }

  // ============================================================
  //  时间系统
  // ============================================================

  /** 获取当前日期字符串 */
  get dateString() {
    return `${this.year}年${this.month}月${this.day}日`;
  }

  /** 获取当前季节 */
  get currentSeason() {
    return MONTH_SEASON[this.month] || '春';
  }

  /**
   * 推进时间（核心结算）
   * GDD §⑭ 8步结算流程：
   * ①天数推进 → ②寿元扣除 → ③灵力自然恢复 → ④丹毒自然消退
   * → ⑤限时效果检查 → ⑥季节/天气更新（跨月时）
   * → ⑦特殊日期检查 → ⑧寿元濒死检查
   *
   * @param {number} days - 推进天数
   * @param {Object} player - 玩家对象（含 age/lifespan/realm 等字段）
   * @returns {Object} 结算报告 { ... }
   */
  advanceTime(days, player) {
    const report = {
      daysPassed: days,
      monthChanged: false,
      yearChanged: false,
      weatherChanged: false,
      seasonChanged: false,
      events: [],
      warnings: [],
      deathWarning: null,
    };

    // ── ① 天数推进 ──
    const oldMonth = this.month;
    const oldYear = this.year;
    this.totalDays += days;
    this.day += days;

    // 简化处理：每30天一月
    while (this.day > 30) {
      this.day -= 30;
      this.month++;
      if (this.month > 12) {
        this.month = 1;
        this.year++;
        report.yearChanged = true;
      }
      report.monthChanged = true;
    }

    // ── ② 寿元扣除（age += N/360 年）──
    if (player && typeof player.lifespan === 'number') {
      const ageGain = days / 360;
      player.lifespan = Math.max(0, player.lifespan - ageGain);
    }

    // ── ③ 灵力自然恢复（由外部处理，这里只标记）──
    // ── ④ 丹毒自然消退（标记）──

    // ── ⑤ 限时效果检查（标记，由外部 activeBuffs 处理）──

    // ── ⑥ 季节/天气更新 ──
    const newMonth = this.month;
    const newSeason = MONTH_SEASON[newMonth];
    if (newSeason !== this.season) {
      this.season = newSeason;
      report.seasonChanged = true;
    }
    if (newMonth !== this._lastWeatherMonth) {
      this._rollWeather();
      this._lastWeatherMonth = newMonth;
      report.weatherChanged = true;
    }

    // ── ⑦ 特殊日期检查 ──
    report.events = this._checkSpecialDates();

    // ── ⑧ 寿元濒死检查 ──
    if (player && player.lifespan !== undefined) {
      const realmLifespan = this.getRealmLifespan(player.realm || '凡人');
      if (realmLifespan > 0) {
        const ratio = player.lifespan / realmLifespan;
        if (ratio <= 0) {
          report.deathWarning = '寿元归零，触发陨落事件！';
        } else if (ratio <= 0.10) {
          report.deathWarning = `寿元仅余${Math.floor(player.lifespan)}年，不足境界上限10%！`;
        } else if (ratio <= 0.20) {
          report.warnings.push(`寿元不足20%，当前${Math.floor(player.lifespan)}年/境界上限${realmLifespan}年`);
        }
      }
    }

    return report;
  }

  /** 获取某境界的寿元上限 */
  getRealmLifespan(realmName) {
    const entry = LIFESPAN_TABLE[realmName];
    return entry ? entry.max : 100;
  }

  /** 随机生成天气 */
  _rollWeather() {
    const probMap = SEASON_WEATHER[this.season] || SEASON_WEATHER['春'];
    this.weather = pickWeighted(probMap);
    // 天气持续 1~7 天
    this.weatherDaysLeft = randInt(1, 7);
  }

  /** 获取当前天气效果 */
  getWeatherEffect() {
    return WEATHER_EFFECT[this.weather] || { cultivate:0, explore:0, combatBonus:0 };
  }

  /** 检查特殊日期事件 */
  _checkSpecialDates() {
    const triggered = [];

    // 年度事件
    for (const ev of PERIODIC_EVENTS.yearly) {
      if (ev.month === this.month && ev.day === this.day) {
        triggered.push({ type:'yearly', name:ev.name, effect:ev.effect, durationDays:ev.durationDays || 0 });
      }
    }

    // 十年事件
    if (this.year % 10 === 0 && this.month === 1 && this.day === 1) {
      for (const ev of PERIODIC_EVENTS.decade) {
        triggered.push({ type:'decade', name:ev.name, note:ev.note });
      }
    }

    // 长期事件
    for (const ev of PERIODIC_EVENTS.longTerm) {
      if (this.year % ev.everyYears === 0 && this.month === 1 && this.day === 1) {
        const realmOk = !ev.realm || this.currentRealm === ev.realm;
        if (realmOk) {
          triggered.push({
            type: 'longTerm',
            name: ev.name,
            note: ev.note || '',
            durationDays: ev.durationDays || 0,
          });
        }
      }
    }

    // 不定期事件（概率触发）
    if (this.day === 1 && Math.random() < 0.02) {
      const pick = PERIODIC_EVENTS.irregular[Math.floor(Math.random() * PERIODIC_EVENTS.irregular.length)];
      triggered.push({ type:'irregular', name:pick });
    }

    // 拍品会冷却递减
    if (this.auctionCooldown > 0) {
      this.auctionCooldown = Math.max(0, this.auctionCooldown - 1);
    }

    return triggered;
  }

  // ============================================================
  //  地图系统
  // ============================================================

  /** 获取所有区域列表 */
  getAllRegions(realm) {
    if (!realm) realm = this.currentRealm;
    return Object.entries(REGIONS)
      .filter(([, r]) => r.realm === realm)
      .map(([name, data]) => ({ name, ...data }));
  }

  /** 获取已解锁区域 */
  getUnlockedRegions(realm) {
    if (!realm) realm = this.currentRealm;
    return [...this.unlockedRegions].filter(name => {
      const r = REGIONS[name];
      return r && r.realm === realm;
    });
  }

  /**
   * 检查某区域是否可解锁
   * @param {string} regionName
   * @param {Object} player - 包含 realm/realmIndex/subStage/subStageIndex
   * @returns {{ unlocked: boolean, reason?: string }}
   */
  canUnlockRegion(regionName, player) {
    if (this.unlockedRegions.has(regionName)) {
      return { unlocked: true };
    }

    const region = REGIONS[regionName];
    if (!region) {
      return { unlocked: false, reason: '区域不存在' };
    }

    // 检查界域
    if (region.realm !== this.currentRealm) {
      return { unlocked: false, reason: '不在当前界域' };
    }

    // 检查境界
    const realmOrder = ['凡人','练气','筑基','金丹','元婴','化神','炼虚','合体','大乘','渡劫','真仙','金仙','太乙','大罗','道祖'];
    const playerIdx = realmOrder.indexOf(player.realm || '凡人');
    const reqIdx = realmOrder.indexOf(region.unlockRealm || '凡人');

    if (playerIdx < reqIdx) {
      return { unlocked: false, reason: `需要达到${region.unlockRealm}` };
    }
    if (playerIdx === reqIdx && (player.subStageIndex || 0) < (region.unlockSubStage || 0)) {
      return { unlocked: false, reason: `需要达到${region.unlockRealm}${['初期','中期','后期','圆满'][region.unlockSubStage || 0]}` };
    }

    // 特殊：秘境需事件触发
    if (region.isSecretRealm) {
      return { unlocked: false, reason: '需秘境事件开启' };
    }

    // 特殊：飞升门需飞升
    if (region.isAscensionGate) {
      return { unlocked: false, reason: '需触发飞升事件' };
    }

    return { unlocked: true };
  }

  /** 解锁区域 */
  unlockRegion(regionName) {
    if (REGIONS[regionName]) {
      this.unlockedRegions.add(regionName);
      if (!this.regionExploration[regionName]) {
        this.regionExploration[regionName] = 0;
      }
      return true;
    }
    return false;
  }

  /** 增加区域探索度 */
  addExploration(regionName, amount) {
    if (!this.regionExploration[regionName]) {
      this.regionExploration[regionName] = 0;
    }
    this.regionExploration[regionName] = Math.min(100, this.regionExploration[regionName] + amount);
    return this.regionExploration[regionName];
  }

  /**
   * 移动至目标区域
   * @param {string} targetRegion
   * @param {Object} player
   * @param {string} [method='步行'] - 赶路方式
   * @returns {{ success:boolean, travelDays:number, cost:Object|null, route:Array }}
   */
  travelTo(targetRegion, player, method = '步行') {
    if (targetRegion === this.currentRegion) {
      return { success: true, travelDays: 0, cost: null, route: [] };
    }

    const region = REGIONS[targetRegion];
    if (!region) {
      return { success: false, reason: '区域不存在' };
    }

    const can = this.canUnlockRegion(targetRegion, player);
    if (!can.unlocked) {
      return { success: false, reason: can.reason };
    }

    const path = findPath(this.currentRegion, targetRegion, this.currentRealm);

    if (!path) {
      return { success: false, reason: '无可用路径' };
    }

    let totalDays = path.distance;
    let totalCost = 0;

    if (path.teleport) {
      totalCost += path.segments[0].cost || 0;
    }

    // 应用赶路方式速度倍率
    const travelData = DATA.TRAVEL || {};
    const methods = (travelData.methods || {})[this.currentRealm] || {};
    const methodData = methods[method] || methods['步行'] || { speed:1 };
    const speedMul = methodData.speed || 1;
    totalDays = Math.max(1, Math.ceil(totalDays / speedMul));

    // 执行移动
    this.currentRegion = targetRegion;

    return {
      success: true,
      travelDays: totalDays,
      cost: totalCost > 0 ? { 灵石: totalCost } : null,
      route: path.segments,
    };
  }

  /**
   * 通过传送阵移动
   * @returns {Object}
   */
  teleportTo(targetRegion, player) {
    const path = findPath(this.currentRegion, targetRegion, this.currentRealm);
    if (!path || !path.teleport) {
      return { success: false, reason: '两地无传送阵连接' };
    }
    return this.travelTo(targetRegion, player, '传送阵');
  }

  /** 飞升至新界 */
  ascendTo(realm) {
    this.currentRealm = realm;
    // 自动解锁新界的初始区域
    const starterRegions = Object.entries(REGIONS)
      .filter(([, r]) => r.realm === realm && r.travelCost === 0);
    starterRegions.forEach(([name]) => this.unlockedRegions.add(name));

    if (starterRegions.length > 0) {
      this.currentRegion = starterRegions[0][0];
    }
  }

  /** 获取区域详情 */
  getRegionInfo(regionName) {
    const r = REGIONS[regionName];
    if (!r) return null;
    return {
      name: regionName,
      ...r,
      unlocked: this.unlockedRegions.has(regionName),
      exploration: this.regionExploration[regionName] || 0,
      current: this.currentRegion === regionName,
    };
  }

  /** 计算两区域距离 */
  getDistance(from, to) {
    const path = findPath(from, to, this.currentRealm);
    if (!path) return Infinity;
    return path.distance;
  }

  // ============================================================
  //  交易系统
  // ============================================================

  /** 获取坊市商品列表 */
  getShopItems(shopName) {
    const shops = DATA.SHOPS || {};
    return shops[shopName] || [];
  }

  /** 获取当前区域所有可用商店 */
  getAvailableShops() {
    const shopMap = {
      青云山: ['青云山杂货铺'],
      天南城: ['天南城丹药铺','天南城法器阁','天南城符箓店','天南城功法阁','天南城杂货铺','天南城百宝楼'],
      黄枫谷: ['黄枫谷丹药铺','黄枫谷法器阁','黄枫谷符箓店','黄枫谷杂货铺'],
      天星城: ['天星城丹药铺','天星城法器阁','天星城符箓店','天星城功法阁','天星城杂货铺','天星城百宝楼'],
      大晋皇都:['大晋皇都丹药铺','大晋皇都法器阁','大晋皇都符箓店','大晋皇都功法阁','大晋皇都杂货铺'],
    };
    return shopMap[this.currentRegion] || ['青云山杂货铺'];
  }

  /**
   * 计算物价浮动后的实际价格
   * @param {number} basePrice - 基础售价
   * @param {string} [source] - 购买来源（坊市/拍卖会/黑市/黑市出售）
   * @returns {number}
   */
  getActualPrice(basePrice, source = '坊市') {
    let modifier = 0;

    // 基础浮动（季节/事件）
    modifier += this._getBasePriceFluctuation();

    // 来源加成
    if (source === '拍卖会') modifier += PRICE_FACTORS['拍卖会'] || 0;
    if (source === '黑市') modifier += 0.30; // 黑市买入溢价
    if (source === '黑市出售') modifier -= 0.40; // 黑市出售折价

    return Math.max(1, Math.round(basePrice * (1 + modifier)));
  }

  /** 基准物价波动 */
  _getBasePriceFluctuation() {
    let mod = 0;

    // 季节性波动 ±20%
    const seasonMod = (Math.sin((this.month - 1) * Math.PI / 6)) * (PRICE_FACTORS['季节'] || 0.20);
    mod += seasonMod;

    // 灵气潮汐（夏至前后+10~20%）
    if (this.month === 6 || this.month === 7) {
      mod += randInt(10, 20) / 100;
    }

    // 战争事件（随机，低概率）
    if (Math.random() < 0.01) {
      mod += PRICE_FACTORS['战争'] || 0.50;
    }

    return clamp(mod, -0.30, 0.80);
  }

  // ── 拍卖会 ──

  /**
   * 生成一场拍卖会
   * @param {string} [location] - 拍品会地点
   * @returns {Object}
   */
  generateAuction(location = null) {
    if (this.auctionCooldown > 0) {
      return { success: false, reason: `距离下次拍卖还需${this.auctionCooldown}天` };
    }

    const city = location || (this.currentRealm === '人界' ? '天南城' : '天渊城');

    // 生成 5~12 件拍品
    const count = randInt(5, 12);
    const lots = [];
    const allShops = DATA.SHOPS || {};
    const shopKeys = Object.keys(allShops).filter(k => k.startsWith(city));

    for (let i = 0; i < count; i++) {
      const shopItems = shopKeys.length > 0 ? allShops[shopKeys[i % shopKeys.length]] : [];
      if (shopItems.length === 0) continue;
      const item = shopItems[randInt(0, shopItems.length - 1)];
      lots.push({
        id: i + 1,
        ...item,
        startPrice: Math.round(item.price * 0.5),
        reservePrice: item.price,
      });
    }

    // 生成 3~5 个NPC竞价者
    const bidderCount = randInt(3, 5);
    const types = Object.keys(BIDDER_TYPES);
    const bidders = [];
    for (let i = 0; i < bidderCount; i++) {
      const type = types[i % types.length];
      const tpl = BIDDER_TYPES[type];
      bidders.push({
        ...tpl,
        name: `${tpl.label}${String.fromCharCode(65 + i)}`, // 宗门长老A/B/C
        finance: randInt(500, 50000),
        currentBid: 0,
      });
    }

    this.activeAuction = {
      city,
      year: this.year,
      lots,
      bidders,
      currentLot: 0,
      state: 'ready', // ready|bidding|sold|ended
    };

    this.auctionCooldown = 3650; // 10年冷却
    return this.activeAuction;
  }

  /** 获取当前拍卖会 */
  getActiveAuction() {
    return this.activeAuction;
  }

  /**
   * NPC竞价模拟
   * @param {Object} lot - 当前拍品
   * @param {number} currentPrice - 当前最高价
   * @returns {Object|null} { bidder, newPrice } 或 null（无人加价）
   */
  simulateNPCBid(lot, currentPrice) {
    if (!this.activeAuction) return null;

    const bidders = this.activeAuction.bidders;
    const candidates = [];

    for (const bidder of bidders) {
      const maxBid = Math.floor(bidder.finance * (bidder.financeMul.max + bidder.financeMul.min) / 2);
      if (maxBid <= currentPrice) continue;

      // 行为模式影响出价概率
      let bidChance = 0.5;
      switch (bidder.behavior) {
        case 'cutOff':      bidChance = currentPrice < lot.price * 0.7 ? 0.8 : 0.3; break;
        case 'followThrough': bidChance = 0.7; break;
        case 'intimidate':  bidChance = 0.6; break;
        case 'calculated':   bidChance = currentPrice < lot.price * 1.2 ? 0.6 : 0.2; break;
        case 'impulsive':   bidChance = currentPrice < lot.price * 0.5 ? 0.9 : 0.3; break;
      }

      if (Math.random() < bidChance) {
        const increment = Math.max(1, Math.floor(currentPrice * randInt(5, 20) / 100));
        candidates.push({
          bidder,
          newPrice: Math.min(maxBid, currentPrice + increment),
        });
      }
    }

    if (candidates.length === 0) return null;

    // 最高出价者获胜
    candidates.sort((a, b) => b.newPrice - a.newPrice);
    return candidates[0];
  }

  /** 执行抬价技巧 */
  useBidTactic(tacticName, currentPrice) {
    const tactic = BID_TACTICS[tacticName];
    if (!tactic) return { success: false, reason: '无效技巧' };

    const roll = Math.random();
    if (roll < tactic.failRisk) {
      return { success: false, reason: `${tactic.label} 失败！` };
    }

    switch (tacticName) {
      case '狮子开口':
        return { success: true, effect: '吓退全部NPC', newPrice: Math.floor(currentPrice * 2) };
      case '尾随战术':
        return { success: true, effect: '最低加幅', newPrice: currentPrice + Math.max(1, Math.floor(currentPrice * 0.02)) };
      case '虚张声势':
        return { success: true, effect: 'NPC不敢跟价', newPrice: currentPrice };
      case '沉默到底':
        return { success: true, effect: '最后出价', newPrice: currentPrice + Math.max(1, Math.floor(currentPrice * 0.03)) };
      case '心理底线':
        return { success: true, effect: '理智止盈，停止加价', stop: true };
      default:
        return { success: false, reason: '未知技巧' };
    }
  }

  /** 拍品会结束→随机后续事件 */
  getAuctionAfterEvent() {
    return AUCTION_AFTER_EVENTS[randInt(0, AUCTION_AFTER_EVENTS.length - 1)];
  }

  // ── 黑市 ──

  /**
   * 尝试发现黑市
   * @param {'探索'|'酒馆打听'|'NPC引荐'|'暗号接头'} method
   * @param {Object} [opts] - { npcAffection } 等
   * @returns {{ discovered: boolean, market?: string, msg: string }}
   */
  discoverBlackMarket(method, opts = {}) {
    const discovery = BLACK_MARKET_DISCOVERY[method];
    if (!discovery) return { discovered: false, msg: '无效发现方式' };

    let chance = discovery.baseChance || 0;

    if (method === 'NPC引荐') {
      if ((opts.npcAffection || 0) < discovery.needAffection) {
        return { discovered: false, msg: `NPC好感度不足（需≥${discovery.needAffection}）` };
      }
      chance = 60; // NPC引荐成功率高
    }

    if (method === '暗号接头') {
      chance = 80; // 知道暗号基本必进
    }

    if (method === '酒馆打听') {
      chance = discovery.baseChance;
    }

    const roll = Math.random() * 100;
    if (roll > chance) {
      return { discovered: false, msg: '未发现黑市' };
    }

    // 确定发现哪个黑市
    const realmMarkets = Object.entries(BLACK_MARKETS)
      .filter(([, m]) => m.realm === this.currentRealm);
    if (realmMarkets.length === 0) {
      return { discovered: false, msg: '当前界域无黑市' };
    }

    const [marketName] = realmMarkets[0]; // 暂取第一个，后续可扩展
    this.blackMarketDiscovered[marketName] = true;
    if (!this.blackMarketLoyalty[marketName]) {
      this.blackMarketLoyalty[marketName] = 0;
    }

    return { discovered: true, market: marketName, msg: `发现黑市：${marketName}` };
  }

  /** 获取当前界域已发现的黑市 */
  getDiscoveredBlackMarkets() {
    return Object.keys(this.blackMarketDiscovered)
      .filter(m => this.blackMarketDiscovered[m])
      .filter(m => {
        const bm = BLACK_MARKETS[m];
        return bm && bm.realm === this.currentRealm;
      });
  }

  /** 获取黑市详情 */
  getBlackMarketInfo(marketName) {
    const bm = BLACK_MARKETS[marketName];
    if (!bm) return null;

    const loyalty = this.blackMarketLoyalty[marketName] || 0;
    const currentVIP = [...BLACK_MARKET_VIP]
      .filter(v => loyalty >= v.threshold)
      .pop();

    return {
      name: marketName,
      ...bm,
      discovered: !!this.blackMarketDiscovered[marketName],
      loyalty,
      vipPerk: currentVIP ? currentVIP.perk : '无',
      nextVIP: BLACK_MARKET_VIP.find(v => v.threshold > loyalty),
    };
  }

  /** 黑市交易安全判定 */
  blackMarketSafetyCheck(marketName) {
    const bm = BLACK_MARKETS[marketName];
    if (!bm) return { safe: true };

    const roll = Math.random() * 100;
    if (roll > bm.safety) {
      // 被劫
      const robbery = ROBBERY_OPTIONS;
      return { safe: false, event:'被劫', options: robbery };
    }
    return { safe: true };
  }

  /** 增加黑市熟客度 */
  addBlackMarketLoyalty(marketName, amount) {
    if (!this.blackMarketLoyalty[marketName]) {
      this.blackMarketLoyalty[marketName] = 0;
    }
    this.blackMarketLoyalty[marketName] += amount;
    return this.blackMarketLoyalty[marketName];
  }

  /** 获取黑市购买折扣 */
  getBlackMarketDiscount(marketName) {
    const loyalty = this.blackMarketLoyalty[marketName] || 0;
    if (loyalty >= 100) return 0.9;  // 9折
    if (loyalty >= 2000) return 0.75; // VIP MAX
    return 1.0;
  }

  // ── 灵石庄 ──

  /**
   * 灵石庄存款
   * @param {number} amount - 灵石数量
   * @param {string} [currency='灵石']
   * @returns {Object}
   */
  bankDepositAction(amount, currency = '灵石') {
    const rates = DATA.ECONOMY?.currencyRates || { 灵石:1, 灵晶:1000, 仙灵石:1000000 };
    const rate = rates[currency] || 1;
    const baseValue = amount * rate;

    // 跨域手续费
    let fee = 0;
    const bankData = DATA.ECONOMY?.bank || {};
    if (this.currentRealm !== '人界' && currency === '灵石') {
      fee = Math.floor(baseValue * (bankData.crossRealmFee || 0.01));
    }

    this.bankDeposit[currency] = (this.bankDeposit[currency] || 0) + amount;
    const netDeposit = amount - (fee / rate);

    return {
      success: true,
      deposit: amount,
      currency,
      fee: fee > 0 ? { value: fee, unit: '灵石' } : null,
      netDeposit,
      total: this.bankDeposit[currency],
    };
  }

  /**
   * 灵石庄取款
   * @param {number} amount
   * @param {string} [currency='灵石']
   * @returns {Object}
   */
  bankWithdrawAction(amount, currency = '灵石') {
    const current = this.bankDeposit[currency] || 0;
    if (current < amount) {
      return { success: false, reason: `存款不足，当前${currency}存款：${current}` };
    }

    this.bankDeposit[currency] -= amount;
    return {
      success: true,
      withdraw: amount,
      currency,
      remaining: this.bankDeposit[currency],
    };
  }

  /** 灵石庄年度计息 */
  bankAnnualInterest() {
    const bankData = DATA.ECONOMY?.bank || {};
    const rate = bankData.annualInterest || 0.03;

    for (const [currency, amount] of Object.entries(this.bankDeposit)) {
      if (amount > 0) {
        this.bankDeposit[currency] = Math.floor(amount * (1 + rate));
      }
    }

    return this.bankDeposit;
  }

  /** 灵石庄倒闭概率检查 */
  bankBankruptcyCheck() {
    const bankData = DATA.ECONOMY?.bank || {};
    const rate = bankData.bankruptcyRate || 0.001;
    if (Math.random() < rate) {
      this.bankDeposit = { 灵石:0, 灵晶:0, 仙灵石:0 };
      return { bankrupt: true, msg: '灵石庄倒闭！所有存款化为乌有！' };
    }
    return { bankrupt: false };
  }

  /** 大额限额 = 境界系数 × 1万 */
  getCarryLimit(player) {
    const realmOrder = ['凡人','练气','筑基','金丹','元婴','化神','炼虚','合体','大乘','渡劫','真仙','金仙','太乙','大罗','道祖'];
    const idx = realmOrder.indexOf(player.realm || '凡人');
    const coeff = idx < 0 ? 1 : Math.max(1, idx + 1);
    return coeff * 10000;
  }

  // ============================================================
  //  世界快照 — 序列化
  // ============================================================

  toJSON() {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      totalDays: this.totalDays,
      season: this.season,
      weather: this.weather,
      currentRealm: this.currentRealm,
      currentRegion: this.currentRegion,
      unlockedRegions: [...this.unlockedRegions],
      regionExploration: { ...this.regionExploration },
      regionBookmarks: [...this.regionBookmarks],
      blackMarketDiscovered: { ...this.blackMarketDiscovered },
      blackMarketLoyalty: { ...this.blackMarketLoyalty },
      bankDeposit: { ...this.bankDeposit },
      eventHistory: [...this.eventHistory.slice(-50)], // 保留最近50条
    };
  }

  static fromJSON(data) {
    const w = new World({
      startYear: data.year,
      startMonth: data.month,
      startDay: data.day,
    });
    w.totalDays = data.totalDays || 0;
    w.season = data.season || '春';
    w.weather = data.weather || '晴';
    w.currentRealm = data.currentRealm || '人界';
    w.currentRegion = data.currentRegion || '青云山';
    w.unlockedRegions = new Set(data.unlockedRegions || ['青云山', '太南谷']);
    w.regionExploration = data.regionExploration || {};
    w.regionBookmarks = data.regionBookmarks || [];
    w.blackMarketDiscovered = data.blackMarketDiscovered || {};
    w.blackMarketLoyalty = data.blackMarketLoyalty || {};
    w.bankDeposit = data.bankDeposit || { 灵石:0, 灵晶:0, 仙灵石:0 };
    w.eventHistory = data.eventHistory || [];
    return w;
  }
}


/* ================================================================
 *  五、导出
 * ================================================================ */

export { World };

// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.World = World;
  window.SEASON_WEATHER = SEASON_WEATHER;
  window.REGIONS_WORLD = REGIONS;
}

// 导出常量供外部调试/UI使用
export {
  SEASON_WEATHER,
  WEATHER_EFFECT,
  LIFESPAN_TABLE,
  LIFESPAN_EXTEND,
  PERIODIC_EVENTS,
  REGIONS,
  DISTANCE_TABLE,
  TELEPORT_NETWORK,
  BIDDER_TYPES,
  BID_TACTICS,
  BLACK_MARKETS,
  BLACK_MARKET_VIP,
  BLACK_MARKET_DISCOVERY,
  PRICE_FACTORS,
};
