// ==========================================
//  data/rank.js — 阶级系统：修仙界社会地位
// ==========================================
//  阶级 ≠ 境界。金丹散修还是散修，筑基长老仍是长老。
//  声望（renown）驱动阶级升降，与境界无关但境界可加速声望获取。

const RANK_TIERS = [
  // ===== 人界 =====
  { plane: 'human', level: 0,  id: 'mortal',     name: '凡人',      renownMin: 0,     bonus: { spiritStones: 0,   exploreLoot: 1.00, recipeTier: 1, shopDiscount: 0,    cauldronMax: 'xia'   }, desc: '未入修仙之门的普通人' },
  { plane: 'human', level: 1,  id: 'wanderer',   name: '散修',      renownMin: 100,   bonus: { spiritStones: 10,  exploreLoot: 1.00, recipeTier: 1, shopDiscount: 0,    cauldronMax: 'xia'   }, desc: '无门无派的自由修行者' },
  { plane: 'human', level: 2,  id: 'outer',      name: '外门弟子',  renownMin: 300,   bonus: { spiritStones: 25,  exploreLoot: 1.05, recipeTier: 1, shopDiscount: 0.05, cauldronMax: 'zhong' }, desc: '宗门最低阶的正式弟子' },
  { plane: 'human', level: 3,  id: 'inner',      name: '内门弟子',  renownMin: 800,   bonus: { spiritStones: 50,  exploreLoot: 1.10, recipeTier: 2, shopDiscount: 0.10, cauldronMax: 'zhong' }, desc: '得到宗门认可的核心力量' },
  { plane: 'human', level: 4,  id: 'core',       name: '核心弟子',  renownMin: 2000,  bonus: { spiritStones: 100, exploreLoot: 1.15, recipeTier: 2, shopDiscount: 0.15, cauldronMax: 'shang' }, desc: '宗门重点培养的精英' },
  { plane: 'human', level: 5,  id: 'steward',    name: '执事',      renownMin: 5000,  bonus: { spiritStones: 200, exploreLoot: 1.20, recipeTier: 3, shopDiscount: 0.20, cauldronMax: 'shang' }, desc: '分管宗门事务的中层' },
  { plane: 'human', level: 6,  id: 'elder',      name: '长老',      renownMin: 12000, bonus: { spiritStones: 500, exploreLoot: 1.30, recipeTier: 3, shopDiscount: 0.25, cauldronMax: 'ji'    }, desc: '宗门决策层的掌权者' },
  { plane: 'human', level: 7,  id: 'master',     name: '宗主',      renownMin: 25000, bonus: { spiritStones: 1000,exploreLoot: 1.40, recipeTier: 4, shopDiscount: 0.30, cauldronMax: 'ji'    }, desc: '一宗之主，位面一方巨擘' },
  { plane: 'human', level: 8,  id: 'overlord',   name: '人界霸主',  renownMin: 50000, bonus: { spiritStones: 3000,exploreLoot: 1.50, recipeTier: 5, shopDiscount: 0.40, cauldronMax: 'ji'    }, desc: '人界最顶尖的存在' },

  // ===== 灵界 =====
  { plane: 'spirit',level: 0,  id: 's_ascended', name: '飞升者',    renownMin: 0,     bonus: { spiritStones: 500, exploreLoot: 1.00, recipeTier: 3, shopDiscount: 0,    cauldronMax: 'shang' }, desc: '刚从人界飞升的外来者' },
  { plane: 'spirit',level: 1,  id: 's_visitor',  name: '域外来客',  renownMin: 3000,  bonus: { spiritStones: 800, exploreLoot: 1.05, recipeTier: 3, shopDiscount: 0.05, cauldronMax: 'shang' }, desc: '灵界已听闻你的到来' },
  { plane: 'spirit',level: 2,  id: 's_wanderer', name: '灵界散仙',  renownMin: 8000,  bonus: { spiritStones: 1500,exploreLoot: 1.10, recipeTier: 4, shopDiscount: 0.10, cauldronMax: 'ji'    }, desc: '在灵界站稳脚跟的修士' },
  { plane: 'spirit',level: 3,  id: 's_power',    name: '一方豪强',  renownMin: 20000, bonus: { spiritStones: 3000,exploreLoot: 1.15, recipeTier: 4, shopDiscount: 0.15, cauldronMax: 'ji'    }, desc: '统御一片灵域的强者' },
  { plane: 'spirit',level: 4,  id: 's_overlord', name: '灵界霸主',  renownMin: 50000, bonus: { spiritStones: 5000,exploreLoot: 1.25, recipeTier: 5, shopDiscount: 0.20, cauldronMax: 'ji'    }, desc: '灵界屈指可数的顶尖存在' },
  { plane: 'spirit',level: 5,  id: 's_lord',     name: '界主',      renownMin: 100000,bonus: { spiritStones: 10000,exploreLoot:1.35, recipeTier: 5, shopDiscount: 0.30, cauldronMax: 'ji'    }, desc: '一界之尊，万族敬仰' },

  // ===== 仙界 =====
  { plane: 'immortal',level:0, id: 'i_new',      name: '新晋仙人',  renownMin: 0,     bonus: { spiritStones: 2000, exploreLoot:1.00, recipeTier: 4, shopDiscount: 0,    cauldronMax: 'ji'    }, desc: '初入仙界的无名之辈' },
  { plane: 'immortal',level:1, id: 'i_true',      name: '真仙',      renownMin: 10000, bonus: { spiritStones: 5000, exploreLoot:1.10, recipeTier: 5, shopDiscount: 0.10, cauldronMax: 'ji'    }, desc: '得到仙界承认的仙人' },
  { plane: 'immortal',level:2, id: 'i_golden',    name: '金仙',      renownMin: 30000, bonus: { spiritStones: 10000,exploreLoot:1.15, recipeTier: 5, shopDiscount: 0.15, cauldronMax: 'ji'    }, desc: '仙界中坚力量' },
  { plane: 'immortal',level:3, id: 'i_dao_lord',  name: '道君',      renownMin: 80000, bonus: { spiritStones: 20000,exploreLoot:1.20, recipeTier: 5, shopDiscount: 0.20, cauldronMax: 'ji'    }, desc: '掌握一方道统的大能' },
  { plane: 'immortal',level:4, id: 'i_king',      name: '仙王',      renownMin: 200000,bonus:{ spiritStones: 50000,exploreLoot:1.30, recipeTier: 5, shopDiscount: 0.25, cauldronMax: 'ji'    }, desc: '仙界顶尖强者' },
  { plane: 'immortal',level:5, id: 'i_ancestor',  name: '道祖',      renownMin: 500000,bonus:{ spiritStones: 100000,exploreLoot:1.50,recipeTier: 5, shopDiscount: 0.35, cauldronMax: 'ji'    }, desc: '万界共尊的道之始祖' },
];

// 声望获取源（各类操作获得声望）
const RENOWN_SOURCES = {
  breakthrough:      { base: 80,   desc: '境界突破',        scale: 'realmOrder' },  // 按境界等级缩放
  subBreakthrough:   { base: 15,   desc: '小境界突破',      scale: 'fixed' },
  killEnemy:         { base: 20,   desc: '击杀妖兽',        scale: 'enemyTier' },   // 按妖兽等阶缩放
  explore:           { base: 3,    desc: '探索',            scale: 'fixed' },
  craftPill:         { base: 10,   desc: '成功炼丹',        scale: 'pillTier' },    // 按丹药品级缩放
  trainSkill:        { base: 8,    desc: '修习功法',        scale: 'skillQuality' }, // 按功法品质缩放
  ascend:            { base: 500,  desc: '飞升',            scale: 'fixed' },
  narrative:         { base: 15,   desc: '叙事事件',        scale: 'fixed' },
  buyItem:           { base: 1,    desc: '坊市交易(每100灵石)', scale: 'fixed' },
};

// ===== 辅助函数 =====

/**
 * 获取当前位面的阶级列表
 */
function getPlaneRanks(plane) {
  return RANK_TIERS.filter(r => r.plane === plane);
}

/**
 * 根据声望值获取当前阶级
 */
function getRankByRenown(plane, renown) {
  const ranks = getPlaneRanks(plane).sort((a, b) => b.renownMin - a.renownMin);
  return ranks.find(r => renown >= r.renownMin) || ranks[ranks.length - 1];
}

/**
 * 获取当前阶级的完整数据
 */
function getCurrentRank() {
  const s = GameState;
  if (!s.planeRank) {
    // 向后兼容：重新计算
    s.planeRank = s.plane || 'human';
    s.renown = s.renown || 0;
  }
  return getRankByRenown(s.planeRank, s.renown);
}

/**
 * 获取与当前声望对应的下一阶级
 */
function getNextRank() {
  const ranks = getPlaneRanks(GameState.planeRank).sort((a, b) => a.renownMin - b.renownMin);
  const current = getCurrentRank();
  const idx = ranks.findIndex(r => r.id === current.id);
  return idx < ranks.length - 1 ? ranks[idx + 1] : null;
}

/**
 * 计算声望获取量（含各种加成）
 */
function calcRenownGain(sourceKey, scaleParam) {
  const source = RENOWN_SOURCES[sourceKey];
  if (!source) return 0;
  let gain = source.base;

  // 缩放逻辑
  if (source.scale === 'realmOrder') {
    const realm = getRealmData(GameState.realm, GameState.plane);
    gain *= (1 + realm.planeOrder * 0.5);
  } else if (source.scale === 'enemyTier') {
    gain *= (1 + (scaleParam || 0) * 0.3);
  } else if (source.scale === 'pillTier') {
    gain *= (1 + (scaleParam || 1) * 0.4);
  } else if (source.scale === 'skillQuality') {
    const qMult = { common: 1.0, uncommon: 1.5, rare: 2.0, epic: 3.0, legendary: 5.0 };
    gain *= (qMult[scaleParam] || 1.0);
  }

  // 身世加成：稀有身世声望获取 +10%~+30%
  if (GameState.origin) {
    const rarityMult = { common: 1.0, uncommon: 1.05, rare: 1.10, epic: 1.20, legendary: 1.30 };
    gain *= (rarityMult[GameState.origin.rarity] || 1.0);
  }

  return Math.floor(gain);
}

/**
 * 增加声望并检查是否升阶
 * @returns {{ gained: number, rankedUp: boolean, newRank: object|null }}
 */
function addRenown(sourceKey, scaleParam) {
  const gain = calcRenownGain(sourceKey, scaleParam);
  if (gain <= 0) return { gained: 0, rankedUp: false, newRank: null };

  const oldRank = getCurrentRank();
  GameState.renown += gain;

  // 跨位面子系统：renown 属于当前planeRank
  const newRank = getCurrentRank();

  if (newRank && oldRank && newRank.id !== oldRank.id) {
    onRankUp(oldRank, newRank);
    return { gained: gain, rankedUp: true, newRank, oldRank };
  }

  return { gained: gain, rankedUp: false, newRank: null };
}

/**
 * 飞升时重置阶级系统
 */
function resetRankForPlane(newPlane) {
  GameState.planeRank = newPlane;
  GameState.renown = 0;
}

/**
 * 获取阶级带来的各项加成数值
 */
function getRankBonus() {
  return getCurrentRank()?.bonus || RANK_TIERS[0].bonus;
}
