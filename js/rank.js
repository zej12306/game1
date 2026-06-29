// ==========================================
//  js/rank.js — 阶级系统逻辑：声望、升阶、联动
// ==========================================

/**
 * 初始化阶级系统（新游戏时调用）
 */
function initRank() {
  const s = GameState;
  s.planeRank = s.plane || 'human';
  s.renown = 0;

  // 身世影响初始声望
  if (s.origin) {
    const rarityBonus = { common: 0, uncommon: 30, rare: 80, epic: 200, legendary: 500 };
    s.renown += (rarityBonus[s.origin.rarity] || 0);
  }

  // 重新投胎：如果有前世记录，给予少量传承声望
  if (s.pastLives.length > 0) {
    s.renown += Math.floor(s.pastLives.length * 20);
  }
}

/**
 * 处理阶级升阶事件
 */
function onRankUp(oldRank, newRank) {
  const s = GameState;

  // 升阶奖励：灵石
  const stoneReward = newRank.bonus.spiritStones - (oldRank.bonus.spiritStones || 0);
  if (stoneReward > 0) {
    s.spiritStones += stoneReward;
  }

  // 升阶奖励：自动解锁更好丹炉
  const cauldronOrder = ['xia', 'zhong', 'shang', 'ji'];
  const currCauldronIdx = cauldronOrder.indexOf(s.cauldron);
  const maxCauldronIdx = cauldronOrder.indexOf(newRank.bonus.cauldronMax);
  if (maxCauldronIdx > currCauldronIdx) {
    s.cauldron = cauldronOrder[Math.min(maxCauldronIdx, currCauldronIdx + 1)];
  }

  // 寿命奖励（高阶阶级解锁延寿资源）
  const lifespanRewards = {
    core: 30, steward: 60, elder: 150, master: 400, overlord: 1000,
    s_visitor: 100, s_wanderer: 200, s_power: 500, s_overlord: 1000, s_lord: 3000,
    i_true: 500, i_golden: 1000, i_dao_lord: 3000, i_king: 8000, i_ancestor: 20000,
  };
  const lsReward = lifespanRewards[newRank.id];
  if (lsReward) {
    applyLifespan(s, lsReward);
    addLog(`晋升【${newRank.name}】！寿元 +${lsReward}年`, 'crit');
  }
}

/**
 * 修炼中获取声望（闭关天数越多，偶然声望越多）
 * @param {number} days 修炼天数
 */
function gainCultivationRenown(days) {
  // 每修炼10天有概率获得1次声望
  const rolls = Math.floor(days / 10);
  let totalRenown = 0;
  for (let i = 0; i < rolls; i++) {
    if (Math.random() < 0.3) {
      const result = addRenown('breakthrough'); // 复用突破源（基础值小）
      if (result.gained > 0) totalRenown += result.gained;
    }
  }
  // 闭关修炼(>=30天)额外声望
  if (days >= 30) {
    const result = addRenown('explore', days / 30);
    if (result.gained > 0) totalRenown += result.gained;
  }
  return totalRenown;
}

/**
 * 突破时获取声望（大突破+小突破）
 */
function gainBreakthroughRenown(isMajor) {
  if (isMajor) {
    const realm = getRealmData(GameState.realm, GameState.plane);
    return addRenown('breakthrough', realm.planeOrder);
  } else {
    return addRenown('subBreakthrough');
  }
}

/**
 * 战斗后声望获取
 */
function gainCombatRenown(enemyTier) {
  return addRenown('killEnemy', enemyTier);
}

/**
 * 炼丹成功后声望获取
 */
function gainAlchemyRenown(recipeTier) {
  return addRenown('craftPill', recipeTier);
}

/**
 * 探索后声望获取
 */
function gainExploreRenown() {
  return addRenown('explore');
}

/**
 * 功法修炼后声望获取
 */
function gainSkillRenown(skillQuality) {
  return addRenown('trainSkill', skillQuality);
}

/**
 * 飞升时声望处理
 */
function handleAscendRenown() {
  const result = addRenown('ascend');
  // 飞升后重置为新位面阶级
  const s = GameState;
  const req = ASCENSION_REQUIREMENTS[s.plane];
  if (req) {
    resetRankForPlane(req.nextPlane);
  }
  return result;
}

/**
 * 获取阶级的探索掉落倍率
 */
function getRankLootMult() {
  return getRankBonus().exploreLoot || 1.0;
}

/**
 * 获取阶级的商店折扣
 */
function getRankDiscount() {
  return getRankBonus().shopDiscount || 0;
}
