/**
 * 凡人修仙传·模拟器 — 炼丹 & 制符系统
 * 来源：temp_gdd.md ⑩⑪ + 用户补充数据
 * 依赖：DATA（js/data.js）
 * 导出：Crafting 类
 * 丹方总计：67（人界48+1飞升丹 + 灵界10 + 仙界8）
 */

// ============================================================
// 静态配置数据
// ============================================================

/* 丹术等级 */
const ALCHEMY_TIERS = [
  { title: '学徒',    levels: [1,5],   bonus: 2,   unlock: '凡人~练气', upgradeReq: 5 },
  { title: '丹师',    levels: [6,10],  bonus: 2,   unlock: '筑基',      upgradeReq: 10 },
  { title: '大师',    levels: [11,15], bonus: 2,   unlock: '金丹',      upgradeReq: 20 },
  { title: '宗师',    levels: [16,20], bonus: 2,   unlock: '元婴',      upgradeReq: 40 },
  { title: '大宗师',  levels: [21,25], bonus: 3,   unlock: '化神',      upgradeReq: 80 },
  { title: '丹王',    levels: [26,30], bonus: 3,   unlock: '灵界',      upgradeReq: 150 },
  { title: '丹圣',    levels: [31,40], bonus: 4,   unlock: '仙界',      upgradeReq: 300 }
];

/* 丹炉品阶 */
const FURNACES = {
  '普通药鼎':   { tier: 0, bonus: 0,   rank: '凡器',       desc: '入门药鼎' },
  '黄铜丹炉':   { tier: 1, bonus: 5,   rank: '法器',       desc: '基础丹炉' },
  '玄铁丹炉':   { tier: 2, bonus: 10,  rank: '灵器',       desc: '精良丹炉' },
  '紫金炉':     { tier: 3, bonus: 15,  rank: '法宝',       desc: '上品丹炉' },
  '地火炉':     { tier: 4, bonus: 22,  rank: '古宝',       desc: '引地火炼丹' },
  '天火鼎':     { tier: 5, bonus: 30,  rank: '玄天',       desc: '引天火炼丹' },
  '乾坤炉':     { tier: 6, bonus: 40,  rank: '通天灵宝',   desc: '乾坤之力炼丹' },
  '造化神炉':   { tier: 7, bonus: 60,  rank: '先天灵宝',   desc: '必出极品·概率大成功×2' }
};

/* 异火体系 */
const STRANGE_FLAMES = {
  '地脉之火':   { star: 1,  bonus: 5,   supremeBonus: 0,   desc: '地火秘境收服',             special: null },
  '兽炎':       { star: 2,  bonus: 8,   supremeBonus: 0,   desc: '击杀火妖王',               special: '炼丹成功率+10%' },
  '骨灵冷火':   { star: 3,  bonus: 12,  supremeBonus: 10,  desc: '古战场深处',               special: '阴丹+20%' },
  '紫晶焰':     { star: 4,  bonus: 15,  supremeBonus: 12,  desc: '火山深处',                 special: '炼丹时间-20%' },
  '九幽魔焰':   { star: 5,  bonus: 20,  supremeBonus: 15,  desc: '魔渊最深处',               special: '魔道丹药+30%,正道-20%' },
  '太阳真火':   { star: 6,  bonus: 25,  supremeBonus: 20,  desc: '大能传承或仙界',           special: '光明/雷属丹药+30%' },
  '混沌圣焰':   { star: 7,  bonus: 35,  supremeBonus: 30,  desc: '道祖级传承',               special: '必出上品以上' }
};

/* 丹药品质倍率 */
const QUALITY_MULTIPLIERS = {
  '废丹': 0,
  '下品': 0.8,
  '中品': 1.0,
  '上品': 1.3,
  '极品': 1.8,
  '圣品': 3.0
};

// 品质判定阈值（基础成功率中用来划分品质的百分比区间）
const QUALITY_THRESHOLDS = [
  { name: '圣品', min: 98 },
  { name: '极品', min: 85 },
  { name: '上品', min: 65 },
  { name: '中品', min: 40 },
  { name: '下品', min: 15 },
  { name: '废丹', min: 0 }
];

/* 制符术等级 */
const TALISMAN_TIERS = [
  { title: '符徒',   levels: [1,3],   bonus: 3, unlock: '灵符', upgradeReq: 5 },
  { title: '符师',   levels: [4,6],   bonus: 3, unlock: '宝符', upgradeReq: 10 },
  { title: '符大师', levels: [7,10],  bonus: 4, unlock: '古符', upgradeReq: 20 },
  { title: '符宗师', levels: [11,15], bonus: 4, unlock: '天符', upgradeReq: 40 },
  { title: '符圣',   levels: [16,20], bonus: 5, unlock: '仙符', upgradeReq: 80 },
  { title: '符祖',   levels: [21,30], bonus: 5, unlock: '—',   upgradeReq: 200 }
];

// ============================================================
// 66 丹方完整数据
// ============================================================

/* 凡人~练气期（12种） */
const PILLS_MORTAL_QI = [
  { id: '培元丹',   realm: '凡人', materials: { 灵草: 2 },                   effect: { type: '修为', value: 20 },      toxicity: 1 },
  { id: '聚气散',   realm: '凡人', materials: { 灵草: 3, 兽丹: 1 },          effect: { type: '修为', value: 50 },      toxicity: 2 },
  { id: '金创药',   realm: '凡人', materials: { 灵草: 1 },                   effect: { type: '恢复气血', value: 0.3 },  toxicity: 1 },
  { id: '止血散',   realm: '凡人', materials: { 灵草: 1 },                   effect: { type: '恢复气血', value: 0.15, combat: true }, toxicity: 1 },
  { id: '回灵丹',   realm: '凡人', materials: { 灵草: 2, 寒玉芝: 1 },        effect: { type: '恢复灵力', value: 0.4 },  toxicity: 2 },
  { id: '清心丸',   realm: '凡人', materials: { 灵草: 1 },                   effect: { type: '驱散', value: '中毒/混乱' }, toxicity: 1 },
  { id: '辟谷丹',   realm: '凡人', materials: { 灵草: 1 },                   effect: { type: '辟谷', value: 30 },       toxicity: 0 },
  { id: '轻身丹',   realm: '凡人', materials: { 灵草: 2, 风铃草: 1 },        effect: { type: '赶路加速', value: 20, duration: 15 }, toxicity: 1 },
  { id: '解毒散',   realm: '凡人', materials: { 灵草: 1, 解毒草: 1 },        effect: { type: '解毒', value: '蛇毒/普通毒' }, toxicity: 1 },
  { id: '壮骨丸',   realm: '凡人', materials: { 灵草: 2, 兽骨: 1 },          effect: { type: '炼体', value: 10 },       toxicity: 1 },
  { id: '明目丹',   realm: '凡人', materials: { 灵草: 1, 清目花: 1 },        effect: { type: '探查加成', value: 5, duration: 7 }, toxicity: 1 },
  { id: '养气丸',   realm: '凡人', materials: { 灵草: 3 },                   effect: { type: '灵力上限', value: 5, maxUses: 5 }, toxicity: 2 }
];

/* 筑基期（12种） */
const PILLS_FOUNDATION = [
  { id: '筑基丹',   realm: '筑基', materials: { 灵草: 5, 紫芝: 2, 兽丹: 3 },              effect: { type: '突破加成', value: 15 },       toxicity: 5 },
  { id: '凝神丹',   realm: '筑基', materials: { 灵草: 3, 紫芝: 1 },                        effect: { type: '神识上限', value: 10 },       toxicity: 3 },
  { id: '生骨丹',   realm: '筑基', materials: { 灵草: 4, 兽骨: 2 },                        effect: { type: '恢复气血', value: 0.6, regen: true }, toxicity: 3 },
  { id: '复灵膏',   realm: '筑基', materials: { 灵草: 3, 兽丹: 2 },                        effect: { type: '恢复灵力', value: 0.6 },      toxicity: 3 },
  { id: '炼体散',   realm: '筑基', materials: { 灵草: 3, 兽丹: 3, 铁精: 1 },               effect: { type: '炼体', value: 50 },           toxicity: 5 },
  { id: '隐息丹',   realm: '筑基', materials: { 灵草: 2, 影花草: 1 },                      effect: { type: '隐藏气息', value: 20, duration: 30 }, toxicity: 2 },
  { id: '迷魂丹',   realm: '筑基', materials: { 毒草: 2, 迷幻菇: 1 },                      effect: { type: '混乱', value: 2, external: true }, toxicity: 0 },
  { id: '破瘴丹',   realm: '筑基', materials: { 灵草: 2, 阳花草: 1 },                      effect: { type: '免疫瘴气', value: 30 },       toxicity: 2 },
  { id: '蓄力丹',   realm: '筑基', materials: { 灵草: 3, 兽丹: 2 },                        effect: { type: '攻击加成', value: 20, combatTurns: 3 }, toxicity: 3 },
  { id: '铁骨丸',   realm: '筑基', materials: { 灵草: 4, 铁精: 2, 兽骨: 3 },               effect: { type: '炼体', value: 80, limit: '铁骨以下' }, toxicity: 5 },
  { id: '定风丹',   realm: '筑基', materials: { 灵草: 2, 风灵花: 1 },                      effect: { type: '免疫吹飞', value: 3 },        toxicity: 2 },
  { id: '通脉丹',   realm: '筑基', materials: { 灵草: 5, 灵泉水: 1 },                      effect: { type: '灵力上限', value: 20, maxUses: 3 }, toxicity: 6 }
];

/* 金丹期（10种） */
const PILLS_GOLDEN = [
  { id: '凝碧丹',   realm: '金丹', materials: { 紫芝: 3, 寒玉芝: 2, 兽丹: 5 },             effect: { type: '修为', value: 500 },          toxicity: 8 },
  { id: '结金丹',   realm: '金丹', materials: { 紫芝: 5, 兽丹: 8, 妖丹: 1 },               effect: { type: '突破加成', value: 20 },       toxicity: 10 },
  { id: '增元丹',   realm: '金丹', materials: { 紫芝: 4, 妖丹: 1, 玉髓: 1 },               effect: { type: '修为', value: 300, bonus: { 灵力上限: 30 } }, toxicity: 8 },
  { id: '护脉丹',   realm: '金丹', materials: { 灵草: 5, 软玉膏: 1 },                      effect: { type: '突破保护', value: true, once: true }, toxicity: 5 },
  { id: '破障丹',   realm: '金丹', materials: { 紫芝: 3, 雷击木: 1, 妖丹: 2 },             effect: { type: '破小瓶颈', value: 30 },       toxicity: 8 },
  { id: '聚神丹',   realm: '金丹', materials: { 紫芝: 2, 养魂木叶: 1 },                    effect: { type: '神识上限', value: 20 },       toxicity: 6 },
  { id: '蛟血丹',   realm: '金丹', materials: { 妖丹: 2, 蛟龙血: 1 },                      effect: { type: '炼体', value: 300, bonus: { 气血上限: 50 } }, toxicity: 10 },
  { id: '腾云丹',   realm: '金丹', materials: { 灵草: 5, 云鹤羽: 3 },                      effect: { type: '飞行速度', value: 50, duration: 30 }, toxicity: 5 },
  { id: '破甲丹',   realm: '金丹', materials: { 毒草: 3, 尖刺果: 2 },                      effect: { type: '破甲', value: 3, external: true }, toxicity: 6 },
  { id: '护心丹',   realm: '金丹', materials: { 灵草: 5, 万年灵芝: 1 },                    effect: { type: '濒死恢复', value: 0.3, once: true }, toxicity: 5 }
];

/* 元婴期（8种） */
const PILLS_NASCENT = [
  { id: '化婴丹',   realm: '元婴', materials: { 紫芝: 10, 妖丹: 3, 万年灵乳: 1 },          effect: { type: '突破加成', value: 20 },       toxicity: 20 },
  { id: '炼神丹',   realm: '元婴', materials: { 妖丹: 2, 万年灵乳: 2, 养魂木汁: 1 },       effect: { type: '神识上限', value: 50 },       toxicity: 15 },
  { id: '天元丹',   realm: '元婴', materials: { 紫芝: 8, 妖丹: 5, 地髓: 1 },               effect: { type: '修为', value: 2000 },         toxicity: 18 },
  { id: '太清丹',   realm: '元婴', materials: { 万年灵乳: 3, 妖丹: 3, 玉髓: 3 },           effect: { type: '灵力上限', value: 100 },      toxicity: 20 },
  { id: '金刚丹',   realm: '元婴', materials: { 妖丹: 3, 金刚石: 1, 龙鳞: 1 },             effect: { type: '炼体', value: 800, bonus: { 防御加成: 10 } }, toxicity: 25 },
  { id: '破界丹',   realm: '元婴', materials: { 妖丹: 4, 虚空石: 1 },                      effect: { type: '无视防御', value: 1, external: true }, toxicity: 15 },
  { id: '祛毒丹',   realm: '元婴', materials: { 万年灵芝: 2, 解毒草: 5, 灵泉水: 5 },       effect: { type: '解毒全', value: true, bonus: { 丹毒: -50 } }, toxicity: 3 },
  { id: '裂魂丹',   realm: '元婴', materials: { 养魂木汁: 3, 妖丹: 5, 九幽草: 1 },         effect: { type: '神识攻击', value: 50, combatTurns: 3, penalty: '虚弱7天' }, toxicity: 25 }
];

/* 化神期（7种） */
const PILLS_SPIRIT = [
  { id: '化神丹',         realm: '化神', materials: { 妖丹: 5, 万年灵乳: 5, 麒麟角: 1 },         effect: { type: '突破加成', value: 25 },                        toxicity: 40 },
  { id: '混元丹',         realm: '化神', materials: { 妖丹: 5, 万年灵乳: 3, 五行草: 5 },          effect: { type: '修为', value: 8000 },                          toxicity: 35 },
  { id: '天魂丹',         realm: '化神', materials: { 万年灵乳: 5, 养魂木枝: 1, 魂晶: 1 },       effect: { type: '神识上限', value: 150 },                       toxicity: 30 },
  { id: '九转丹',         realm: '化神', materials: { 混元丹: 1, 妖丹: 10, 龙血: 1 },            effect: { type: '修为', value: 20000, stackable: true },        toxicity: 50 },
  { id: '破障丹(化神)',   realm: '化神', materials: { 麒麟角: 1, 凤羽: 1, 万年灵乳: 10 },       effect: { type: '破小瓶颈', value: 40 },                        toxicity: 35 },
  { id: '涅槃丹',         realm: '化神', materials: { 凤凰血: 1, 麒麟角: 1, 万年灵乳: 10 },      effect: { type: '濒死恢复', value: 1.0, cooldown: 60 },         toxicity: 20 },
  { id: '飞升丹(人界版)', realm: '化神', materials: { 麒麟角: 1, 凤羽: 1, 万年灵乳: 10 },       effect: { type: '飞升加成', value: 15, bonus: { 天雷减伤: 20 } }, toxicity: 40, craftDays: 45, craftRate: 15, alchemyLevelReq: 20, furnaceReq: '紫金炉' }
];

/* 灵界篇（10种） */
const PILLS_SPIRIT_REALM = [
  { id: '虚灵丹',         realm: '炼虚', materials: { 灵界灵草: 10, 妖丹: 10, 虚空晶: 1 },            effect: { type: '突破加成', value: 25 },                toxicity: 80,  craftDays: 60,  craftRate: 25, alchemyLevelReq: 21 },
  { id: '合和丹',         realm: '合体', materials: { 灵界灵草: 20, 妖丹: 20, 龙血: 1 },              effect: { type: '突破加成', value: 20 },                toxicity: 80,  craftDays: 90,  craftRate: 18, alchemyLevelReq: 23 },
  { id: '渡厄丹',         realm: '大乘', materials: { 灵界灵草: 30, 妖丹: 30, 真龙鳞: 1 },            effect: { type: '突破加成', value: 20 },                toxicity: 100, craftDays: 120, craftRate: 15, alchemyLevelReq: 25 },
  { id: '渡劫圣丹',       realm: '渡劫', materials: { 灵界灵草: 50, 妖丹: 50, 真灵之血: 1 },          effect: { type: '突破加成', value: 15 },                toxicity: 120, craftDays: 180, craftRate: 10, alchemyLevelReq: 27 },
  { id: '万年灵乳(炼)',   realm: '灵界', materials: { 万年灵乳原液: 3, 灵泉水: 10 },                  effect: { type: '灵力全满', value: true },              toxicity: 20,  craftDays: 30,  craftRate: 50, alchemyLevelReq: 22 },
  { id: '养魂丹(灵界)',   realm: '灵界', materials: { 养魂木枝: 3, 魂晶: 5, 灵晶: 20 },               effect: { type: '神识上限', value: 200 },               toxicity: 80,  craftDays: 60,  craftRate: 35, alchemyLevelReq: 24 },
  { id: '太一丹(灵界)',   realm: '灵界', materials: { 灵界灵草: 30, 妖丹: 20, 灵晶: 30 },             effect: { type: '修为', value: 100000 },                toxicity: 100, craftDays: 90,  craftRate: 30, alchemyLevelReq: 25 },
  { id: '九转金丹(灵界)', realm: '灵界', materials: { 妖丹: 50, 真灵之血: 3, 灵晶: 100 },             effect: { type: '全属加成', value: 30, duration: 30 }, toxicity: 60,  craftDays: 180, craftRate: 10, alchemyLevelReq: 27 },
  { id: '破界丹(灵界)',   realm: '灵界', materials: { 虚空晶: 10, 空晶: 5, 灵晶: 50 },                effect: { type: '传送安全', value: 50 },                 toxicity: 40,  craftDays: 60,  craftRate: 25, alchemyLevelReq: 24 },
  { id: '飞升丹(灵界版)', realm: '灵界', materials: { 真灵之血: 5, 混沌石: 1, 灵晶: 200 },            effect: { type: '飞升加成', value: 15, bonus: { 天雷减伤: 20 } }, toxicity: 100, craftDays: 365, craftRate: 15, alchemyLevelReq: 29 }
];

/* 仙界篇（8种） */
const PILLS_IMMORTAL = [
  { id: '飞仙丹',         realm: '真仙', materials: { 仙灵草: 10, 仙兽血: 5, 仙灵石: 100 },                  effect: { type: '飞升加成', value: 20, bonus: { 天雷减伤: 20 } }, toxicity: 200, craftDays: 365,  craftRate: 8,  alchemyLevelReq: 30 },
  { id: '鸿蒙丹',         realm: '真仙', materials: { 仙灵草: 50, 仙兽丹: 20, 仙灵石: 500 },                   effect: { type: '修为', value: 100000000 },                     toxicity: 500, craftDays: 365,  craftRate: 12, alchemyLevelReq: 32 },
  { id: '悟道丹',         realm: '金仙', materials: { 仙灵草: 30, 本源结晶: 3, 仙灵石: 1000 },                 effect: { type: '法则感悟', value: 10 },                        toxicity: 300, craftDays: 365,  craftRate: 8,  alchemyLevelReq: 34 },
  { id: '九转金丹(仙界)', realm: '仙界', materials: { 仙兽丹: 50, 本源结晶: 5, 仙灵石: 5000 },                 effect: { type: '全属加成', value: 50, duration: 365 },        toxicity: 200, craftDays: 730,  craftRate: 3,  alchemyLevelReq: 36 },
  { id: '混沌丹',         realm: '大罗', materials: { 混沌之气: 10, 本源结晶: 10, 仙灵石: 10000 },             effect: { type: '突破加成', value: 20 },                        toxicity: 500, craftDays: 730,  craftRate: 3,  alchemyLevelReq: 38 },
  { id: '轮回丹',         realm: '大罗', materials: { 轮回石: 3, 混沌石: 1, 仙灵石: 50000 },                   effect: { type: '濒死复活', value: true, once: true, combatAuto: true }, toxicity: 100, craftDays: 365, craftRate: 5, alchemyLevelReq: 37 },
  { id: '破障丹(仙界)',   realm: '仙界', materials: { 仙灵草: 50, 法则碎片: 3, 仙灵石: 20000 },                effect: { type: '驱散全负面', value: true, immune: 3 },        toxicity: 300, craftDays: 365,  craftRate: 8,  alchemyLevelReq: 35 },
  { id: '道祖丹',         realm: '道祖', materials: { 混沌至宝碎片: 3, 本源法则: 5, 仙灵石: 1000000 },         effect: { type: '道祖突破', value: true, failBonus: 2 },       toxicity: 1000, craftDays: 1000, craftRate: 1, alchemyLevelReq: 40, retainOnFail: true }
];

/* 合并全部67丹方 */
const ALL_PILLS = [
  ...PILLS_MORTAL_QI,
  ...PILLS_FOUNDATION,
  ...PILLS_GOLDEN,
  ...PILLS_NASCENT,
  ...PILLS_SPIRIT,
  ...PILLS_SPIRIT_REALM,
  ...PILLS_IMMORTAL
];

// ============================================================
// 34 符箓完整数据
// ============================================================

/* 灵符（8种·练气可用） */
const TALISMANS_SPIRIT = [
  { id: '火球符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '火伤', value: 50, target: '单体' },              price: 10 },
  { id: '冰刺符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '冰伤', value: 40, target: '单体', bonus: '概率冰冻' }, price: 12 },
  { id: '金甲符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '防御加成', value: 20, combatTurns: 3 },          price: 10 },
  { id: '轻身符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '赶路加速', value: 30, duration: 7 },             price: 8 },
  { id: '遁地符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '战斗撤离', value: true },                        price: 15 },
  { id: '清水符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '生成净水', value: true },                        price: 3 },
  { id: '明目符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '探查加成', value: 10, duration: 3 },             price: 8 },
  { id: '聚灵符',     grade: '灵符', realm: '练气', materials: { 符纸: 1, 朱砂: 1 },         effect: { type: '修炼加成', value: 15, duration: 3 },             price: 12 }
];

/* 宝符（8种·筑基可用） */
const TALISMANS_TREASURE = [
  { id: '烈焰符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '妖兽血': 1 },   effect: { type: '火伤', value: 80, target: '群体' },            price: 50 },
  { id: '玄冰符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '妖兽血': 1 },   effect: { type: '冰伤', value: 100, target: '单体', bonus: '冻结1回合' }, price: 55 },
  { id: '金刚符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '妖兽血': 1 },   effect: { type: '减伤', value: 40, combatTurns: 3 },             price: 45 },
  { id: '神行符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '妖兽血': 1 },   effect: { type: '赶路加速', value: 100, duration: 7 },           price: 40 },
  { id: '隐匿符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '影狼血': 1 },   effect: { type: '隐藏气息', value: 30, duration: 15 },           price: 60 },
  { id: '雷暴符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '雷兽血': 1 },   effect: { type: '雷伤', value: 150, target: '单体', bonus: '麻痹' }, price: 70 },
  { id: '回春符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '木灵兽血': 1 }, effect: { type: '恢复气血', value: 0.25, combat: true },        price: 50 },
  { id: '破禁符',     grade: '宝符', realm: '筑基', materials: { '中级符纸': 1, '妖血': 1, 朱砂: 2 },effect: { type: '破除禁制', value: '低级' },                     price: 80 }
];

/* 古符（8种·金丹可用） */
const TALISMANS_ANCIENT = [
  { id: '天火符',     grade: '古符', realm: '金丹', durability: 3, materials: { '高级符纸': 1, '妖王血': 1 },       effect: { type: '火伤', value: 300, target: '群体', bonus: '灼烧3回合' }, price: 300 },
  { id: '玄天护体符', grade: '古符', realm: '金丹', durability: 3, materials: { '高级符纸': 1, '龟甲妖王血': 1 },    effect: { type: '无敌', value: 1, combatTurns: 1 },                  price: 400 },
  { id: '乾坤遁符',   grade: '古符', realm: '金丹', durability: 0, materials: { '高级符纸': 1, '虚空兽血': 1 },     effect: { type: '传送', value: '已探索地点' },                       price: 500 },
  { id: '天雷符',     grade: '古符', realm: '金丹', durability: 3, materials: { '高级符纸': 1, '雷妖王血': 1 },     effect: { type: '雷伤', value: 500, target: '单体', bonus: '麻痹2回合' }, price: 450 },
  { id: '化灵符',     grade: '古符', realm: '金丹', durability: 0, materials: { '高级符纸': 1, '蛟龙血': 1 },       effect: { type: '灵力全满', value: true, once: true },              price: 350 },
  { id: '摄魂符',     grade: '古符', realm: '金丹', durability: 3, materials: { '高级符纸': 1, '阴妖王血': 1 },     effect: { type: '混乱', value: 2 },                                 price: 400 },
  { id: '土遁符',     grade: '古符', realm: '金丹', durability: 0, materials: { '高级符纸': 1, '妖王血': 1, 灵石: 100 },effect: { type: '自动传送', value: '回城' },                          price: 600 },
  { id: '万象符',     grade: '古符', realm: '金丹', durability: 3, materials: { '高级符纸': 1, '变形妖王血': 1 },   effect: { type: '变形', value: 7 },                                  price: 550 }
];

/* 天符（6种·元婴可用） */
const TALISMANS_HEAVEN = [
  { id: '焚天符',     grade: '天符', realm: '元婴', durability: 3, materials: { '玉符': 1, '精血': 1, '凤血': 1 },            effect: { type: '火伤', value: 2000, target: '群体', bonus: '概率毁法宝' }, price: 3000 },
  { id: '不动明王符', grade: '天符', realm: '元婴', durability: 3, materials: { '玉符': 1, '精血': 1, '玄武血': 1 },          effect: { type: '减伤', value: 90, combatTurns: 5, bonus: '反伤30%' }, price: 3500 },
  { id: '破界传送符', grade: '天符', realm: '元婴', durability: 3, materials: { '玉符': 1, '精血': 1, '虚空晶': 1 },          effect: { type: '跨界传送', value: true },                                price: 8000 },
  { id: '九天神雷符', grade: '天符', realm: '元婴', durability: 3, materials: { '玉符': 1, '精血': 1, '天雷竹汁': 3 },        effect: { type: '雷伤', value: 5000, target: '单体', bonus: '对魔道×2' }, price: 5000 },
  { id: '时间停滞符', grade: '天符', realm: '元婴', durability: 3, materials: { '玉符': 1, '精血': 1, '时间碎片': 1 },        effect: { type: '跳过回合', value: 1 },                                    price: 10000 },
  { id: '回天符',     grade: '天符', realm: '元婴', durability: 3, materials: { '玉符': 1, '精血': 1, '万年灵乳': 3 },        effect: { type: '恢复气血', value: 1.0, bonus: '驱散全debuff' },          price: 4000 }
];

/* 仙符（4种·化神~灵界可用） */
const TALISMANS_IMMORTAL = [
  { id: '灭世符',     grade: '仙符', realm: '化神', durability: 5, materials: { '仙玉符': 1, '法则碎片': 1, '真龙血': 1 },      effect: { type: '伤害', value: 50000, target: '群体' },        price: 50000 },
  { id: '太虚护神符', grade: '仙符', realm: '化神', durability: 5, materials: { '仙玉符': 1, '仙兽血': 1, '魂晶': 1 },          effect: { type: '免疫神识攻击', duration: 30 },                price: 80000 },
  { id: '轮回替身符', grade: '仙符', realm: '灵界', durability: 5, materials: { '仙玉符': 1, '轮回石': 1, '精血': 10 },         effect: { type: '替代死亡', value: true, once: true },         price: 200000 },
  { id: '开天符',     grade: '仙符', realm: '灵界', durability: 5, materials: { '仙玉符': 1, '法则碎片': 3, '混沌石': 1 },      effect: { type: '撕裂虚空', value: '开辟临时通道' },          price: 500000 }
];

/* 合并全部34符箓 */
const ALL_TALISMANS = [
  ...TALISMANS_SPIRIT,
  ...TALISMANS_TREASURE,
  ...TALISMANS_ANCIENT,
  ...TALISMANS_HEAVEN,
  ...TALISMANS_IMMORTAL
];

// ============================================================
// 辅助：境界排序索引
// ============================================================
const REALM_ORDER = ['凡人','练气','筑基','金丹','元婴','化神','炼虚','合体','大乘','渡劫','真仙','金仙','太乙','大罗','道祖'];

function realmIndex(realm) {
  const i = REALM_ORDER.indexOf(realm);
  return i >= 0 ? i : 999;
}

// ============================================================
// Crafting 类
// ============================================================
class Crafting {
  constructor(data) {
    /** @type {object} 引用 DATA 常量 */
    this.DATA = data;

    /* 炼丹状态 */
    this.alchemyLevel = 1;        // 丹术等级 1~40
    this.alchemySuccessCount = 0; // 当前等级累计成功次数

    /* 制符状态 */
    this.talismanLevel = 1;       // 制符术等级 1~30
    this.talismanSuccessCount = 0;// 当前等级累计成功次数
  }

  // ==========================================================
  // 静态：供外部直接读取
  // ==========================================================
  static get ALL_PILLS()        { return ALL_PILLS; }
  static get ALL_TALISMANS()    { return ALL_TALISMANS; }
  static get FURNACES()         { return FURNACES; }
  static get STRANGE_FLAMES()   { return STRANGE_FLAMES; }
  static get ALCHEMY_TIERS()    { return ALCHEMY_TIERS; }
  static get TALISMAN_TIERS()   { return TALISMAN_TIERS; }
  static get QUALITY_MULTIPLIERS() { return QUALITY_MULTIPLIERS; }

  // ==========================================================
  // 查询
  // ==========================================================

  /** 根据名称查找丹方 */
  getPillById(id) {
    return ALL_PILLS.find(p => p.id === id) || null;
  }

  /** 获取某境界可用的所有丹方（含更低境界） */
  getPillsByRealm(realm) {
    const maxIdx = realmIndex(realm);
    return ALL_PILLS.filter(p => realmIndex(p.realm) <= maxIdx);
  }

  /** 根据名称查找符箓 */
  getTalismanById(id) {
    return ALL_TALISMANS.find(t => t.id === id) || null;
  }

  /** 获取某品阶可用的所有符箓 */
  getTalismansByGrade(grade) {
    return ALL_TALISMANS.filter(t => t.grade === grade);
  }

  /** 获取当前丹术等级信息 */
  getAlchemyTierInfo() {
    for (const tier of ALCHEMY_TIERS) {
      if (this.alchemyLevel >= tier.levels[0] && this.alchemyLevel <= tier.levels[1]) {
        return {
          ...tier,
          currentLevel: this.alchemyLevel,
          nextLevelReq: this.alchemyLevel < tier.levels[1]
            ? tier.upgradeReq
            : (ALCHEMY_TIERS.find(t => t.levels[0] === tier.levels[1] + 1) || {}).upgradeReq || null,
          successCount: this.alchemySuccessCount
        };
      }
    }
    return null;
  }

  /** 获取当前制符术等级信息 */
  getTalismanTierInfo() {
    for (const tier of TALISMAN_TIERS) {
      if (this.talismanLevel >= tier.levels[0] && this.talismanLevel <= tier.levels[1]) {
        return {
          ...tier,
          currentLevel: this.talismanLevel,
          nextLevelReq: this.talismanLevel < tier.levels[1]
            ? tier.upgradeReq
            : (TALISMAN_TIERS.find(t => t.levels[0] === tier.levels[1] + 1) || {}).upgradeReq || null,
          successCount: this.talismanSuccessCount
        };
      }
    }
    return null;
  }

  // ==========================================================
  // 炼丹核心
  // ==========================================================

  /**
   * 计算炼丹成功率
   * @param {string} pillId       - 丹药ID
   * @param {string} furnaceName  - 丹炉名称（FURNACES的key）
   * @param {string} flameName    - 异火名称（STRANGE_FLAMES的key），可选
   * @param {object} player       - 玩家对象 { realm, 机缘, ... }
   * @returns {number} 成功率(0~100)
   */
  calcAlchemyRate(pillId, furnaceName, flameName, player) {
    const pill = this.getPillById(pillId);
    if (!pill) return 0;

    const tier = this.getAlchemyTierInfo();
    if (!tier) return 0;

    // 基础：丹术等级 × 每级加成
    let rate = this.alchemyLevel * tier.bonus;

    // 境界压制：丹方境界高于丹术可解锁上限 → 惩罚
    const unlockIdx = realmIndex(tier.unlock);
    const pillIdx = realmIndex(pill.realm);
    if (pillIdx > unlockIdx) {
      rate -= (pillIdx - unlockIdx) * 10;
    }

    // 丹炉加成
    const furnace = FURNACES[furnaceName];
    if (furnace) rate += furnace.bonus;

    // 异火加成
    const flame = flameName ? STRANGE_FLAMES[flameName] : null;
    if (flame) rate += flame.bonus;

    // 玩家属性加成：机缘每10点 +1%
    if (player && typeof player.机缘 === 'number') {
      rate += Math.floor(player.机缘 / 10);
    }

    // 特殊：造化神炉 + 混沌圣焰
    if (furnaceName === '造化神炉' && flameName === '混沌圣焰') {
      rate += 10; // 叠加额外加成
    }

    return Math.max(0, Math.min(100, rate));
  }

  /**
   * 判定丹药品质
   * @param {number} rate        - 成功率(0~100)
   * @param {string} furnaceName - 丹炉名称
   * @param {string} flameName   - 异火名称
   * @param {number} herbAge     - 药材年份加成（百年+1档）
   * @param {boolean} greatSuccess - 是否触发大成功
   * @returns {string} 品质名称
   */
  judgeQuality(rate, furnaceName, flameName, herbAge, greatSuccess) {
    // 大成功 → 必极品以上
    if (greatSuccess) {
      const roll = Math.random() * 100;
      return roll >= 90 ? '圣品' : '极品';
    }

    // 丹炉提升中位值
    let effectiveRate = rate;
    const furnace = FURNACES[furnaceName];
    if (furnace) {
      effectiveRate += Math.floor(furnace.bonus * 0.3);
    }

    // 异火提升上品+
    const flame = flameName ? STRANGE_FLAMES[flameName] : null;
    if (flame) {
      effectiveRate += flame.supremeBonus / 2;
    }

    // 丹术每10级保底+1档
    const tierUps = Math.floor(this.alchemyLevel / 10);
    for (let i = 0; i < tierUps; i++) {
      effectiveRate += 3;
    }

    // 药材年份加成
    if (herbAge) {
      effectiveRate += herbAge * 3;
    }

    // 异火特殊：混沌圣焰必上品以上
    if (flameName === '混沌圣焰' && effectiveRate < QUALITY_THRESHOLDS.find(q => q.name === '中品').min) {
      effectiveRate = QUALITY_THRESHOLDS.find(q => q.name === '中品').min + 1;
    }

    // 掷骰判定
    const roll = Math.random() * 100;
    // effectiveRate 作为中位偏移
    const adjustedRoll = roll + (effectiveRate - 50) * 0.3;

    for (const q of QUALITY_THRESHOLDS) {
      if (adjustedRoll >= q.min) return q.name;
    }
    return '废丹';
  }

  /**
   * 单次炼丹（完整流程）
   * @param {string} pillId
   * @param {string} furnaceName
   * @param {string} flameName
   * @param {object} player     - { realm, 机缘, inventory }
   * @param {number} herbAge    - 药材年份加成（默认0）
   * @returns {object} { success, quality, pill, rate, msg }
   */
  craftPill(pillId, furnaceName, flameName, player, herbAge = 0) {
    const pill = this.getPillById(pillId);
    if (!pill) return { success: false, msg: `未知丹方: ${pillId}` };

    // 检查材料
    if (player && player.inventory) {
      for (const [mat, qty] of Object.entries(pill.materials)) {
        if ((player.inventory[mat] || 0) < qty) {
          return { success: false, msg: `材料不足: 需要${mat}×${qty}, 当前${player.inventory[mat] || 0}` };
        }
      }
    }

    const rate = this.calcAlchemyRate(pillId, furnaceName, flameName, player);

    // 特殊：造化神炉概率大成功×2
    let greatSuccess = false;
    if (furnaceName === '造化神炉') {
      greatSuccess = Math.random() < 0.05; // 5%大成功
    }

    const roll = Math.random() * 100;
    const success = roll <= rate;

    if (!success) {
      // 失败仍消耗材料（检查模式下不扣）
      if (player && player.inventory) {
        for (const [mat, qty] of Object.entries(pill.materials)) {
          player.inventory[mat] = (player.inventory[mat] || 0) - qty;
        }
      }
      return { success: false, quality: null, pill, rate, msg: `炼丹失败！成功率${rate}%, 掷骰${roll.toFixed(1)}` };
    }

    // 成功 → 升级进度
    this.alchemySuccessCount++;
    const tier = this.getAlchemyTierInfo();
    if (tier && this.alchemySuccessCount >= tier.upgradeReq && this.alchemyLevel < 40) {
      this.alchemyLevel++;
      this.alchemySuccessCount = 0;
    }

    // 判定品质
    const quality = this.judgeQuality(rate, furnaceName, flameName, herbAge, greatSuccess);

    // 消耗材料
    if (player && player.inventory) {
      for (const [mat, qty] of Object.entries(pill.materials)) {
        player.inventory[mat] = (player.inventory[mat] || 0) - qty;
      }
    }

    // 应用效果值
    const multiplier = QUALITY_MULTIPLIERS[quality] || 1;
    const effectiveValue = typeof pill.effect.value === 'number'
      ? Math.round(pill.effect.value * multiplier)
      : pill.effect.value;

    return {
      success: true,
      quality,
      pill,
      rate,
      effectiveValue,
      multiplier,
      greatSuccess,
      msg: `炼丹成功！${quality}${pill.id}，倍率×${multiplier}，效果值${effectiveValue}`
    };
  }

  // ==========================================================
  // 丹毒系统
  // ==========================================================

  /**
   * 计算丹毒上限
   * @param {string} realm - 当前境界
   * @returns {number}
   */
  calcToxicityCap(realm) {
    const idx = realmIndex(realm);
    if (idx <= 0) return 50;
    if (idx <= 5) return idx * 300;  // 凡人50 练气300 筑基600 金丹900 元婴1200 化神1500
    return idx * 1000;               // 炼虚5000~道祖15000+
  }

  /**
   * 获取丹药丹毒值
   * @param {string} pillId
   * @returns {number}
   */
  getPillToxicity(pillId) {
    const pill = this.getPillById(pillId);
    return pill ? pill.toxicity : 0;
  }

  /**
   * 计算丹毒超标惩罚
   * @param {number} currentToxicity - 当前丹毒值
   * @param {string} realm           - 境界
   * @returns {object} { pct, speedPenalty, breakthroughPenalty, meridianDamage }
   */
  calcToxicityPenalty(currentToxicity, realm) {
    const cap = this.calcToxicityCap(realm);
    const pct = (currentToxicity / cap) * 100;

    if (pct < 100) {
      return { pct, speedPenalty: 0, breakthroughPenalty: 0, meridianDamage: false };
    }

    const excess = pct - 100;
    return {
      pct,
      speedPenalty: Math.min(10 + excess * 0.5, 20),
      breakthroughPenalty: excess >= 20 ? 15 : 0,
      meridianDamage: excess >= 30
    };
  }

  /** 自然消退（每天1点，高阶更快） */
  naturalDetox(days, realm) {
    const idx = realmIndex(realm);
    const rate = idx <= 1 ? 1 : (idx <= 5 ? 2 : 3);
    return days * rate;
  }

  // ==========================================================
  // 制符核心
  // ==========================================================

  /**
   * 计算制符成功率
   * @param {string} talismanId - 符箓ID
   * @param {object} player     - { realm, 机缘, ... }
   * @returns {number} 成功率(0~100)
   */
  calcTalismanRate(talismanId, player) {
    const talisman = this.getTalismanById(talismanId);
    if (!talisman) return 0;

    const tier = this.getTalismanTierInfo();
    if (!tier) return 0;

    let rate = this.talismanLevel * tier.bonus;

    // 品阶压制
    const gradeOrder = ['灵符','宝符','古符','天符','仙符'];
    const unlockIdx = gradeOrder.indexOf(tier.unlock);
    const gradeIdx = gradeOrder.indexOf(talisman.grade);
    if (gradeIdx > unlockIdx) {
      rate -= (gradeIdx - unlockIdx) * 12;
    }

    if (player && typeof player.机缘 === 'number') {
      rate += Math.floor(player.机缘 / 15);
    }

    return Math.max(5, Math.min(95, rate)); // 制符保底5%, 上限95%
  }

  /**
   * 单次制符（完整流程）
   * @param {string} talismanId
   * @param {object} player - { realm, inventory }
   * @returns {object} { success, talisman, rate, msg }
   */
  craftTalisman(talismanId, player) {
    const talisman = this.getTalismanById(talismanId);
    if (!talisman) return { success: false, msg: `未知符箓: ${talismanId}` };

    // 检查材料
    if (player && player.inventory) {
      for (const [mat, qty] of Object.entries(talisman.materials)) {
        if ((player.inventory[mat] || 0) < qty) {
          return { success: false, msg: `材料不足: 需要${mat}×${qty}, 当前${player.inventory[mat] || 0}` };
        }
      }
    }

    const rate = this.calcTalismanRate(talismanId, player);
    const roll = Math.random() * 100;
    const success = roll <= rate;

    if (!success) {
      if (player && player.inventory) {
        for (const [mat, qty] of Object.entries(talisman.materials)) {
          player.inventory[mat] = (player.inventory[mat] || 0) - qty;
        }
      }
      return { success: false, talisman, rate, msg: `制符失败！成功率${rate}%, 掷骰${roll.toFixed(1)}` };
    }

    // 成功 → 升级
    this.talismanSuccessCount++;
    const tier = this.getTalismanTierInfo();
    if (tier && this.talismanSuccessCount >= tier.upgradeReq && this.talismanLevel < 30) {
      this.talismanLevel++;
      this.talismanSuccessCount = 0;
    }

    // 消耗材料
    if (player && player.inventory) {
      for (const [mat, qty] of Object.entries(talisman.materials)) {
        player.inventory[mat] = (player.inventory[mat] || 0) - qty;
      }
    }

    // 耐久设定
    const durability = talisman.durability !== undefined ? talisman.durability : 999;
    // 灵符/宝符无耐久限制(999=无限)
    // 古符/天符/仙符有限制

    return {
      success: true,
      talisman,
      rate,
      durability,
      msg: `制符成功！${talisman.grade}「${talisman.id}」耐久${durability >= 999 ? '∞' : durability}`
    };
  }

  /**
   * 使用符箓（消耗耐久）
   * @param {object} talismanInstance - 符箓实例 { id, durability, ... }
   * @returns {object} { usable, remaining, msg }
   */
  useTalisman(talismanInstance) {
    if (!talismanInstance || talismanInstance.durability === undefined) {
      return { usable: false, msg: '无效符箓' };
    }

    // 无限耐久
    if (talismanInstance.durability >= 999) {
      return { usable: true, remaining: 999, msg: '符箓使用成功' };
    }

    if (talismanInstance.durability <= 0) {
      return { usable: false, remaining: 0, msg: '符箓耐久耗尽，已报废' };
    }

    talismanInstance.durability--;
    const remaining = talismanInstance.durability;

    if (remaining <= 0) {
      return { usable: true, remaining: 0, msg: '最后一次使用，符箓报废！' };
    }

    return { usable: true, remaining, msg: `符箓使用成功，剩余耐久${remaining}` };
  }

  // ==========================================================
  // 批量炼丹（用于模拟/测试）
  // ==========================================================

  /**
   * 批量炼丹
   * @param {string} pillId
   * @param {string} furnaceName
   * @param {string} flameName
   * @param {object} player
   * @param {number} herbAge
   * @param {number} count - 次数
   * @returns {object} { results[], successCount, failCount, qualityDist }
   */
  batchCraftPills(pillId, furnaceName, flameName, player, herbAge, count) {
    const results = [];
    const qualityDist = {};
    let successCount = 0, failCount = 0;

    for (let i = 0; i < count; i++) {
      const r = this.craftPill(pillId, furnaceName, flameName, player, herbAge);
      results.push(r);
      if (r.success) {
        successCount++;
        qualityDist[r.quality] = (qualityDist[r.quality] || 0) + 1;
      } else {
        failCount++;
      }
    }

    return { results, successCount, failCount, qualityDist };
  }

  // ==========================================================
  // 序列化 / 反序列化
  // ==========================================================

  /** 导出状态 */
  toJSON() {
    return {
      alchemyLevel: this.alchemyLevel,
      alchemySuccessCount: this.alchemySuccessCount,
      talismanLevel: this.talismanLevel,
      talismanSuccessCount: this.talismanSuccessCount
    };
  }

  /** 载入状态 */
  fromJSON(json) {
    if (json.alchemyLevel !== undefined) this.alchemyLevel = json.alchemyLevel;
    if (json.alchemySuccessCount !== undefined) this.alchemySuccessCount = json.alchemySuccessCount;
    if (json.talismanLevel !== undefined) this.talismanLevel = json.talismanLevel;
    if (json.talismanSuccessCount !== undefined) this.talismanSuccessCount = json.talismanSuccessCount;
    return this;
  }

  /** 重置为初始状态 */
  reset() {
    this.alchemyLevel = 1;
    this.alchemySuccessCount = 0;
    this.talismanLevel = 1;
    this.talismanSuccessCount = 0;
  }
}

// ============================================================
// 导出
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Crafting };
}
// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Crafting = Crafting;
}
