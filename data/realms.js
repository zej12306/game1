// ==========================================
//  data/realms.js — 三层位面境界数据
// ==========================================

const REALMS = [
  // ===== 人界 =====
  {
    plane: 'human',
    planeOrder: 0,
    name: '练气',
    subLevels: 9,
    lifespan: 100,
    cultivationPerDay: 5,
    breakItem: null,
    tribulation: null,
    baseSuccess: 1.0,
    failPenalty: { cultivation: 0, lifespan: 0, deathChance: 0 },
  },
  {
    plane: 'human',
    planeOrder: 1,
    name: '筑基',
    subLevels: 9,
    lifespan: 200,
    cultivationPerDay: 12,
    breakItem: '筑基丹',
    tribulation: null,
    baseSuccess: 1.0,
    failPenalty: { cultivation: 0, lifespan: 0, deathChance: 0 },
  },
  {
    plane: 'human',
    planeOrder: 2,
    name: '金丹',
    subLevels: 9,
    lifespan: 400,
    cultivationPerDay: 28,
    breakItem: null,
    tribulation: null,
    baseSuccess: 0.85, // [PLACEHOLDER] 无丹药硬需，待调
    failPenalty: { cultivation: 0, lifespan: 0, deathChance: 0 },
  },
  {
    plane: 'human',
    planeOrder: 3,
    name: '元婴',
    subLevels: 9,
    lifespan: 800,
    cultivationPerDay: 60,
    breakItem: null,
    tribulation: '四九小天劫',
    baseSuccess: 0.80,
    failPenalty: { cultivation: 0.25, lifespan: 50, deathChance: 0.03 },
  },
  {
    plane: 'human',
    planeOrder: 4,
    name: '化神',
    subLevels: 9,
    lifespan: 2000,
    cultivationPerDay: 120,
    breakItem: null,
    tribulation: '六九中天劫',
    baseSuccess: 0.70,
    failPenalty: { cultivation: 0.20, lifespan: 80, deathChance: 0.05 },
  },

  // ===== 灵界 =====
  {
    plane: 'spirit',
    planeOrder: 0,
    name: '炼虚',
    subLevels: 9,
    lifespan: 5000,
    cultivationPerDay: 300,
    breakItem: null,
    tribulation: '九九天劫',
    baseSuccess: 0.65,
    failPenalty: { cultivation: 0.30, lifespan: 200, deathChance: 0.08 },
  },
  {
    plane: 'spirit',
    planeOrder: 1,
    name: '合体',
    subLevels: 9,
    lifespan: 12000,
    cultivationPerDay: 800,
    breakItem: null,
    tribulation: '两九天劫',
    baseSuccess: 0.55,
    failPenalty: { cultivation: 0.30, lifespan: 400, deathChance: 0.10 },
  },
  {
    plane: 'spirit',
    planeOrder: 2,
    name: '大乘',
    subLevels: 9,
    lifespan: 30000,
    cultivationPerDay: 2000,
    breakItem: null,
    tribulation: '三九天劫',
    baseSuccess: 0.50,
    failPenalty: { cultivation: 0.35, lifespan: 800, deathChance: 0.12 },
  },

  // ===== 仙界 =====
  {
    plane: 'immortal',
    planeOrder: 0,
    name: '真仙',
    subLevels: 9,
    lifespan: 100000,
    cultivationPerDay: 5000,
    breakItem: null,
    tribulation: '仙劫',
    baseSuccess: 0.45,
    failPenalty: { cultivation: 0.40, lifespan: 2000, deathChance: 0.15 },
  },
  {
    plane: 'immortal',
    planeOrder: 1,
    name: '金仙',
    subLevels: 9,
    lifespan: 300000,
    cultivationPerDay: 12000,
    breakItem: null,
    tribulation: '大仙劫',
    baseSuccess: 0.40,
    failPenalty: { cultivation: 0.40, lifespan: 5000, deathChance: 0.18 },
  },
  {
    plane: 'immortal',
    planeOrder: 2,
    name: '太乙',
    subLevels: 9,
    lifespan: 1000000,
    cultivationPerDay: 30000,
    breakItem: null,
    tribulation: '玄黄劫',
    baseSuccess: 0.35,
    failPenalty: { cultivation: 0.45, lifespan: 10000, deathChance: 0.20 },
  },
  {
    plane: 'immortal',
    planeOrder: 3,
    name: '大罗',
    subLevels: 9,
    lifespan: Infinity,
    cultivationPerDay: 80000,
    breakItem: null,
    tribulation: '混沌劫',
    baseSuccess: 0.30,
    failPenalty: { cultivation: 0.45, lifespan: 20000, deathChance: 0.25 },
  },
  {
    plane: 'immortal',
    planeOrder: 4,
    name: '道祖',
    subLevels: 1,
    lifespan: Infinity,
    cultivationPerDay: 200000,
    breakItem: null,
    tribulation: '开天劫',
    baseSuccess: 0.20,
    failPenalty: { cultivation: 0.50, lifespan: 0, deathChance: 0.30 },
  },
];

// 位面系数：影响跨位面时的修炼效率
const PLANE_MODIFIER = {
  human: 1.0,
  spirit: 5.0,
  immortal: 100.0,
};

// 位面飞升所需条件
const ASCENSION_REQUIREMENTS = {
  human: { target: '化神', subLevel: 9, days: 360, nextPlane: 'spirit', nextRealm: '炼虚' },
  spirit: { target: '大乘', subLevel: 9, days: 720, nextPlane: 'immortal', nextRealm: '真仙' },
  immortal: null, // no ascension beyond immortal
};

/**
 * 获取指定境界的完整数据
 * @param {string} name - 境界名
 * @param {string} [plane] - 位面（可选，用于跨位面查找）
 * @returns {object} realm data
 */
function getRealmData(name, plane) {
  if (plane) {
    return REALMS.find(r => r.name === name && r.plane === plane) || REALMS[0];
  }
  return REALMS.find(r => r.name === name) || REALMS[0];
}

/**
 * 获取指定位面的所有境界
 * @param {string} plane
 * @returns {array}
 */
function getPlaneRealms(plane) {
  return REALMS.filter(r => r.plane === plane);
}

/**
 * 获取某个位面中指定顺序的下一个境界（用于大境界突破）
 * @param {string} plane
 * @param {number} planeOrder
 * @returns {object|null}
 */
function getNextRealmInPlane(plane, planeOrder) {
  return REALMS.find(r => r.plane === plane && r.planeOrder === planeOrder + 1) || null;
}

/**
 * 获取某个位面的最后一个可用境界（飞升条件）
 * @param {string} plane
 * @returns {object}
 */
function getLastRealmInPlane(plane) {
  const realms = getPlaneRealms(plane);
  return realms[realms.length - 1];
}
