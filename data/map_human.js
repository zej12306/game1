// ==========================================
//  data/map_human.js — 人界地图
// ==========================================

const HUMAN_MAP = {
  plane: 'human',
  regions: [

    // ===== 越国七派（练气解锁）=====
    {
      id: 'yue_huangfeng',
      name: '黄枫谷',
      areaName: '越国·云梦山',
      realmRequired: '练气',
      nodes: [
        { id: 'hf_main', name: '宗门大殿', type: 'guild',
          events: { explore: 0.10, special: 0.05, fight: 0.05, loot: 0.25, nothing: 0.45, secret: 0.10 } },
        { id: 'hf_library', name: '藏经阁', type: 'library',
          events: { explore: 0.05, special: 0.08, fight: 0.02, loot: 0.30, nothing: 0.40, secret: 0.15 } },
        { id: 'hf_alchemy', name: '炼丹房', type: 'alchemy',
          events: { explore: 0.05, special: 0.05, fight: 0.01, loot: 0.35, nothing: 0.44, secret: 0.10 } },
        { id: 'hf_backhill', name: '后山', type: 'wild',
          events: { explore: 0.15, special: 0.08, fight: 0.12, loot: 0.25, nothing: 0.30, secret: 0.10 },
          nodeSpecial: { name: '凝元草', rate: 0.10, effect: () => { GameState.breakItems['凝元草']=(GameState.breakItems['凝元草']||0)+1; addLog('后山中发现一株凝元草！','loot'); }}},
        { id: 'hf_cave', name: '洞府', type: 'cave',
          events: { explore: 0.05, special: 0.05, fight: 0.03, loot: 0.20, nothing: 0.57, secret: 0.10 },
          cultivationBonus: 0.10 },
      ],
    },
    {
      id: 'yue_yanmoon',
      name: '掩月宗',
      areaName: '越国·月华峰',
      realmRequired: '练气',
      nodes: [
        { id: 'ym_main', name: '掩月大殿', type: 'guild',
          events: { explore: 0.10, special: 0.08, fight: 0.05, loot: 0.22, nothing: 0.45, secret: 0.10 } },
        { id: 'ym_platform', name: '望月台', type: 'wild',
          events: { explore: 0.20, special: 0.10, fight: 0.08, loot: 0.20, nothing: 0.32, secret: 0.10 },
          nodeSpecial: { name: '月华露', rate: 0.08, effect: () => { GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+30); addLog('月华台上收集月华露，修为+30','success'); }}},
        { id: 'ym_herbgarden', name: '药园', type: 'wild',
          events: { explore: 0.05, special: 0.05, fight: 0.05, loot: 0.35, nothing: 0.40, secret: 0.10 } },
        { id: 'ym_secret', name: '禁地', type: 'secret',
          events: { explore: 0.10, special: 0.15, fight: 0.10, loot: 0.25, nothing: 0.30, secret: 0.10 } },
      ],
    },
    {
      id: 'yue_qingxu',
      name: '清虚门',
      areaName: '越国·翠微峰',
      realmRequired: '练气',
      nodes: [
        { id: 'qx_main', name: '清虚殿', type: 'guild',
          events: { explore: 0.10, special: 0.08, fight: 0.05, loot: 0.22, nothing: 0.45, secret: 0.10 } },
        { id: 'qx_meditation', name: '静修洞', type: 'cave',
          events: { explore: 0.05, special: 0.05, fight: 0.02, loot: 0.15, nothing: 0.63, secret: 0.10 },
          cultivationBonus: 0.12 },
        { id: 'qx_pond', name: '灵泉', type: 'wild',
          events: { explore: 0.10, special: 0.10, fight: 0.05, loot: 0.25, nothing: 0.40, secret: 0.10 },
          nodeSpecial: { name: '灵泉水', rate: 0.12, effect: () => { GameState.spiritStones+=30; addLog('灵泉边捡到灵石碎片，+30','loot'); }}},
      ],
    },
    {
      id: 'yue_giant',
      name: '巨剑门',
      areaName: '越国·擎天峰',
      realmRequired: '练气',
      nodes: [
        { id: 'gj_main', name: '巨剑殿', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.10, loot: 0.20, nothing: 0.40, secret: 0.10 } },
        { id: 'gj_forge', name: '剑炉', type: 'special',
          events: { explore: 0.05, special: 0.12, fight: 0.05, loot: 0.28, nothing: 0.40, secret: 0.10 },
          nodeSpecial: { name: '残剑', rate: 0.10, effect: () => { GameState.atk+=1; addLog('剑炉中捡到一把残剑，攻击+1','loot'); }}},
        { id: 'gj_arena', name: '试剑台', type: 'special',
          events: { explore: 0.10, special: 0.10, fight: 0.20, loot: 0.15, nothing: 0.35, secret: 0.10 } },
      ],
    },
    {
      id: 'yue_skyhold',
      name: '天阙堡',
      areaName: '越国·九龙岭',
      realmRequired: '练气',
{ id: 'tq_main', name: '天阙宫', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.05, loot: 0.20, nothing: 0.45, secret: 0.10 } },
        { id: 'tq_cliff', name: '九龙崖', type: 'wild',
          events: { explore: 0.15, special: 0.10, fight: 0.10, loot: 0.20, nothing: 0.35, secret: 0.10 } },
        { id: 'tq_tower', name: '藏宝塔', type: 'special',
          events: { explore: 0.05, special: 0.15, fight: 0.03, loot: 0.32, nothing: 0.35, secret: 0.10 } },
      ],
    },
    {
      id: 'yue_beast',
      name: '灵兽山',
      areaName: '越国·万兽谷',
      realmRequired: '练气',
{ id: 'ls_main', name: '灵兽殿', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.05, loot: 0.22, nothing: 0.43, secret: 0.10 } },
        { id: 'ls_valley', name: '万兽谷', type: 'wild',
          events: { explore: 0.20, special: 0.08, fight: 0.18, loot: 0.15, nothing: 0.29, secret: 0.10 } },
        { id: 'ls_egg', name: '孵化室', type: 'special',
          events: { explore: 0.05, special: 0.20, fight: 0.05, loot: 0.20, nothing: 0.40, secret: 0.10 },
          nodeSpecial: { name: '灵兽卵', rate: 0.05, effect: () => { GameState.spiritStones+=80; addLog('孵化室中发现一枚灵兽卵，灵石+80！','crit'); }}},
      ],
    },
    {
      id: 'yue_blade',
      name: '化刀坞',
      areaName: '越国·断刃崖',
      realmRequired: '练气',
{ id: 'hd_main', name: '化刀殿', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.10, loot: 0.20, nothing: 0.40, secret: 0.10 } },
        { id: 'hd_cliff', name: '断刃崖', type: 'wild',
          events: { explore: 0.15, special: 0.12, fight: 0.10, loot: 0.20, nothing: 0.33, secret: 0.10 } },
      ],
    },

    // ===== 元武国（筑基解锁）=====
    {
      id: 'yuanwu',
      name: '元武国',
      areaName: '中部大陆',
      realmRequired: '筑基',
      nodes: [
        { id: 'yw_royal', name: '元武皇城', type: 'city',
          events: { explore: 0.05, special: 0.10, fight: 0.03, loot: 0.30, nothing: 0.42, secret: 0.10 } },
        { id: 'yw_skill', name: '功法阁', type: 'library',
          events: { explore: 0.05, special: 0.12, fight: 0.02, loot: 0.28, nothing: 0.43, secret: 0.10 },
          nodeSpecial: { name: '功法残页', rate: 0.10, effect: () => { GameState.wis+=1; addLog('功法阁中翻阅典籍，神识+1',''); }}},
        { id: 'yw_arena', name: '角斗场', type: 'special',
          events: { explore: 0.10, special: 0.08, fight: 0.25, loot: 0.15, nothing: 0.32, secret: 0.10 } },
        { id: 'yw_blackmarket', name: '黑市', type: 'market',
          events: { explore: 0.05, special: 0.15, fight: 0.08, loot: 0.30, nothing: 0.32, secret: 0.10 } },
      ],
    },

    // ===== 极西之地（金丹解锁）=====
    {
      id: 'west',
      name: '极西之地',
      areaName: '极西',
      realmRequired: '金丹',
      nodes: [
        { id: 'wx_qianzhu', name: '千竹教', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.08, loot: 0.25, nothing: 0.37, secret: 0.10 } },
        { id: 'wx_yuling', name: '御灵宗', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.08, loot: 0.25, nothing: 0.37, secret: 0.10 } },
        { id: 'wx_ghost', name: '幽冥谷', type: 'wild',
          events: { explore: 0.18, special: 0.12, fight: 0.15, loot: 0.18, nothing: 0.27, secret: 0.10 },
          nodeSpecial: { name: '鬼灵珠', rate: 0.06, effect: () => { GameState.spi+=1; addLog('幽冥谷吸鬼灵之气，灵力+1','success'); }}},
        { id: 'wx_blood', name: '血炼渊', type: 'secret',
          events: { explore: 0.10, special: 0.18, fight: 0.15, loot: 0.22, nothing: 0.25, secret: 0.10 } },
      ],
    },

    // ===== 乱星海（金丹解锁）=====
    {
      id: 'starsea',
      name: '乱星海',
      areaName: '无尽海',
      realmRequired: '金丹',
      nodes: [
        { id: 'ss_kuixing', name: '魁星岛', type: 'city',
          events: { explore: 0.05, special: 0.10, fight: 0.05, loot: 0.28, nothing: 0.42, secret: 0.10 } },
        { id: 'ss_outer', name: '外星海', type: 'wild',
          events: { explore: 0.20, special: 0.10, fight: 0.20, loot: 0.18, nothing: 0.22, secret: 0.10 } },
        { id: 'ss_xutian', name: '虚天殿海域', type: 'secret',
          events: { explore: 0.10, special: 0.20, fight: 0.12, loot: 0.23, nothing: 0.25, secret: 0.10 } },
        { id: 'ss_miaoyin', name: '妙音门', type: 'special',
          events: { explore: 0.08, special: 0.15, fight: 0.08, loot: 0.22, nothing: 0.37, secret: 0.10 } },
      ],
    },

    // ===== 天南大陆（元婴解锁）=====
    {
      id: 'tiannan',
      name: '天南大陆',
      areaName: '天南通衢',
      realmRequired: '元婴',
      nodes: [
        { id: 'tn_royal', name: '越国皇城', type: 'city',
          events: { explore: 0.05, special: 0.10, fight: 0.03, loot: 0.30, nothing: 0.42, secret: 0.10 } },
        { id: 'tn_grass', name: '幕兰草原', type: 'wild',
          events: { explore: 0.20, special: 0.10, fight: 0.15, loot: 0.20, nothing: 0.25, secret: 0.10 } },
        { id: 'tn_alliance', name: '九国盟', type: 'guild',
          events: { explore: 0.08, special: 0.12, fight: 0.05, loot: 0.25, nothing: 0.40, secret: 0.10 } },
        { id: 'tn_beast', name: '妖兽山脉', type: 'wild',
          events: { explore: 0.15, special: 0.12, fight: 0.25, loot: 0.18, nothing: 0.20, secret: 0.10 },
          nodeSpecial: { name: '七级妖丹', rate: 0.04, effect: () => { GameState.breakItems['七级妖丹']=(GameState.breakItems['七级妖丹']||0)+1; addLog('击杀妖兽获得七级妖丹！','crit'); }},
          secretNode: { id: 'tn_beast_deep', name: '妖兽山脉深处', rate: 0.01 } },
        { id: 'tn_luoyun', name: '落云宗', type: 'guild',
          events: { explore: 0.10, special: 0.10, fight: 0.05, loot: 0.25, nothing: 0.40, secret: 0.10 } },
      ],
    },

    // ===== 大晋（化神解锁）=====
    {
      id: 'dajin',
      name: '大晋',
      areaName: '北疆大国',
      realmRequired: '化神',
      nodes: [
        { id: 'dj_taiyi', name: '太一门', type: 'guild',
          events: { explore: 0.05, special: 0.12, fight: 0.03, loot: 0.28, nothing: 0.42, secret: 0.10 } },
        { id: 'dj_devils', name: '魔道六宗', type: 'special',
          events: { explore: 0.10, special: 0.15, fight: 0.20, loot: 0.20, nothing: 0.25, secret: 0.10 } },
        { id: 'dj_capital', name: '京城万宝楼', type: 'market',
          events: { explore: 0.05, special: 0.18, fight: 0.02, loot: 0.35, nothing: 0.30, secret: 0.10 } },
        { id: 'dj_tiatai', name: '天台山', type: 'special',
          events: { explore: 0.10, special: 0.20, fight: 0.08, loot: 0.22, nothing: 0.30, secret: 0.10 },
          cultivationBonus: 0.15, // tribulation bonus
          nodeSpecial: { name: '天雷淬体', rate: 0.05, effect: () => { GameState.def+=2; GameState.vit+=2; addLog('天台山上天雷淬体，防御+2，体魄+2！','crit'); }}},
        { id: 'dj_xutian', name: '虚天殿', type: 'secret',
          events: { explore: 0.10, special: 0.25, fight: 0.12, loot: 0.23, nothing: 0.20, secret: 0.10 } },
        { id: 'dj_battlefield', name: '正魔战场', type: 'special',
          events: { explore: 0.10, special: 0.12, fight: 0.30, loot: 0.20, nothing: 0.18, secret: 0.10 } },
      ],
    },

    // ===== 昆吾山（隐藏，元婴+）=====
    {
      id: 'kunwu',
      name: '昆吾山',
      areaName: '上古遗迹',
      realmRequired: '元婴',
      isHidden: true,
      discoverChance: 0.02,
      nodes: [
        { id: 'kw_ruin', name: '上古遗迹', type: 'secret',
          events: { explore: 0.10, special: 0.25, fight: 0.18, loot: 0.22, nothing: 0.15, secret: 0.10 },
          nodeSpecial: { name: '通天灵宝残片', rate: 0.03, effect: () => { GameState.spiritStones+=500; GameState.atk+=3; GameState.spi+=3; addLog('发现通天灵宝残片！灵石+500，攻击+3，灵力+3','crit'); }}},
      ],
    },
  ],
};

// ===== 探索事件表 =====

function getExploreResult(node) {
  const events = node.events;
  const roll = Math.random();
  let cum = 0;

  // 节点专属事件
  if (node.nodeSpecial && roll < (node.nodeSpecial.rate || 0.05)) {
    node.nodeSpecial.effect();
    return { type: 'special', text: '' };
  }

  // 秘境入口
  cum += events.secret || 0;
  if (roll < cum) {
    if (node.secretNode && Math.random() < (node.secretNode.rate || 0.02)) {
      const stones = 100 + Math.floor(Math.random() * 200);
      GameState.spiritStones += stones;
      const mat = ['天灵果','赤精芝','百玉露','龙鳞果'][Math.floor(Math.random() * 4)];
      GameState.breakItems[mat] = (GameState.breakItems[mat] || 0) + 1;
      return { type: 'secretFound', text: `发现隐藏区域：${node.secretNode.name}！灵石+${stones}，${mat}x1`, secretId: node.secretNode.id };
    }
    const reward = Math.random();
    if (reward < 0.4) {
      const stones = 80 + Math.floor(Math.random() * 120) * (1 + getRealmIdx());
      GameState.spiritStones += stones;
      return { type: 'loot', text: `秘境中收获灵石 +${stones}` };
    } else if (reward < 0.7) {
      const items = ['筑基丹','聚灵丹','定灵丹','寿元果丹','天元果','五色灵芝','功法残卷'];
      const item = items[Math.floor(Math.random() * items.length)];
      GameState.breakItems[item] = (GameState.breakItems[item] || 0) + 1;
      return { type: 'loot', text: `秘境中获得 ${item} x1` };
    } else {
      GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 80 * (1 + getRealmIdx()));
      return { type: 'explore', text: '秘境中修炼了一番，修为大增' };
    }
  }

  // 战斗
  cum += events.fight || 0;
  if (roll < cum) {
    const fightRoll = Math.random();
    if (fightRoll < 0.70) {
      const stones = 30 + Math.floor(Math.random() * 50) * (1 + getRealmIdx());
      GameState.spiritStones += stones;
      return { type: 'fight', text: `战斗中胜利，缴获灵石 +${stones}` };
    } else if (fightRoll < 0.90) {
      GameState.cultivation = Math.floor(GameState.cultivation * 0.85);
      return { type: 'fight', text: '战斗中受伤，修为略有损失', cls: 'danger' };
    } else {
      const stones = 100 + Math.floor(Math.random() * 200);
      GameState.spiritStones += stones;
      const items = ['筑基丹','黄龙丹'];
      const item = items[Math.floor(Math.random() * items.length)];
      GameState.breakItems[item] = (GameState.breakItems[item] || 0) + 1;
      return { type: 'fight', text: `大获全胜！灵石+${stones}，${item} x1`, cls: 'success' };
    }
  }

  // 物品
  cum += events.loot || 0;
  if (roll < cum) {
    const stones = 10 + Math.floor(Math.random() * 40) * (1 + getRealmIdx());
    GameState.spiritStones += stones;
    return { type: 'loot', text: `发现灵石 +${stones}` };
  }

  // 奇遇
  cum += events.explore || 0;
  if (roll < cum) {
    if (Math.random() < 0.3 && GameState.origin) {
      GameState.wis += 1;
      return { type: 'originEvent', text: '前世的记忆碎片融入心海，神识+1' };
    }
    GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 25 * (1 + getRealmIdx()));
    return { type: 'explore', text: '偶有感悟，修为略有精进' };
  }

  // 负面
  if (Math.random() < 0.03) {
    const loss = Math.floor(GameState.spiritStones * 0.05);
    GameState.spiritStones = Math.max(0, GameState.spiritStones - loss);
    return { type: 'danger', text: `遭遇毒雾，损失灵石 -${loss}`, cls: 'danger' };
  }

  // 无事
  return { type: 'nothing', text: '探索了一番，无所收获' };
}

function getRealmIdx() {
  const name = GameState.realm;
  const idx = REALMS.findIndex(r => r.name === name && r.plane === GameState.plane);
  return idx >= 0 ? idx : 0;
}

// ===== 辅助函数 =====

const MAP_POSITIONS = {
  yue_huangfeng: { x: 18, y: 42 },
  yue_yanmoon: { x: 8, y: 55 },
  yue_qingxu: { x: 28, y: 35 },
  yue_giant: { x: 22, y: 52 },
  yue_skyhold: { x: 14, y: 68 },
  yue_beast: { x: 32, y: 50 },
  yue_blade: { x: 25, y: 68 },
  yuanwu: { x: 42, y: 42 },
  west: { x: 10, y: 18 },
  starsea: { x: 78, y: 65 },
  tiannan: { x: 58, y: 30 },
  dajin: { x: 55, y: 8 },
  kunwu: { x: 40, y: 15 },
};

const MAP_CONNECTIONS = [
  ['yue_huangfeng','yue_yanmoon',2], ['yue_huangfeng','yue_qingxu',2],
  ['yue_yanmoon','yue_qingxu',2], ['yue_qingxu','yue_giant',2],
  ['yue_giant','yue_skyhold',2], ['yue_skyhold','yue_beast',2],
  ['yue_beast','yue_blade',2],
  ['yue_huangfeng','yuanwu',3], ['yue_yanmoon','yuanwu',3], ['yue_qingxu','yuanwu',3],
  ['yuanwu','west',5], ['yuanwu','starsea',8], ['west','starsea',8],
  ['yuanwu','tiannan',12], ['starsea','tiannan',12], ['west','tiannan',10],
  ['tiannan','dajin',15], ['tiannan','kunwu',5], ['dajin','kunwu',8],
];

function getRegion(id) {
  return HUMAN_MAP.regions.find(r => r.id === id);
}

function getNode(regionId, nodeId) {
  const region = getRegion(regionId);
  if (!region) return null;
  return region.nodes.find(n => n.id === nodeId);
}

function canAccessRegion(region) {
  if (!region) return false;
  const plane = region.realmRequired ? (GameState.plane === 'immortal' ? 'immortal' : GameState.plane === 'spirit' ? 'spirit' : 'human') : 'human';
  const realmIdx = REALMS.findIndex(r => r.name === region.realmRequired && r.plane === plane);
  const currentIdx = REALMS.findIndex(r => r.name === GameState.realm && r.plane === GameState.plane);
  return currentIdx >= realmIdx;
}

function getUnlockedRegions() {
  return HUMAN_MAP.regions.filter(r => !r.isHidden && canAccessRegion(r));
}
