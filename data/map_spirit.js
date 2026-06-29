// ==========================================
//  data/map_spirit.js — 灵界地图
// ==========================================

const SPIRIT_MAP = {
  plane: 'spirit',
  regions: [

    // ===== 冰封大陆（炼虚解锁）=====
    {
      id: 'sp_ice', name: '冰封大陆', areaName: '极北寒域', realmRequired: '炼虚',
      nodes: [
        { id:'si_city',name:'极寒城',type:'city',
          events:{explore:0.05,special:0.08,fight:0.05,loot:0.30,nothing:0.42,secret:0.10},
          nodeSpecial:{name:'寒晶',rate:0.08,effect:()=>{GameState.spiritStones+=150;addLog('极寒城中购入一枚寒晶，灵石+150','loot');}}},
        { id:'si_icefield',name:'冰原',type:'wild',
          events:{explore:0.18,special:0.10,fight:0.12,loot:0.20,nothing:0.30,secret:0.10},
          nodeSpecial:{name:'万年玄冰',rate:0.06,effect:()=>{GameState.breakItems['万年玄冰']=(GameState.breakItems['万年玄冰']||0)+1;addLog('冰原中发现万年玄冰！','loot');}}},
        { id:'si_cave',name:'寒窟',type:'secret',
          events:{explore:0.10,special:0.15,fight:0.10,loot:0.25,nothing:0.30,secret:0.10},
          nodeSpecial:{name:'冰魄',rate:0.05,effect:()=>{GameState.spi+=2;GameState.def+=1;addLog('寒窟深处炼化冰魄，灵力+2，防御+1！','success');}}},
        { id:'si_iceling',name:'冰灵宗',type:'guild',
          events:{explore:0.08,special:0.10,fight:0.05,loot:0.25,nothing:0.42,secret:0.10},
          cultivationBonus:0.12},
        { id:'si_glacier',name:'万年冰川',type:'wild',huntNode:true,
          events:{explore:0.15,special:0.12,fight:0.10,loot:0.20,nothing:0.33,secret:0.10},
          nodeSpecial:{name:'冰凤羽',rate:0.04,effect:()=>{GameState.atk+=3;GameState.spd+=2;addLog('冰川中发现冰凤遗羽，攻击+3，速度+2！','crit');}}},
      ],
    },

    // ===== 天渊城（炼虚解锁）=====
    {
      id: 'sp_tianyuan', name: '天渊城', areaName: '灵界中枢', realmRequired: '炼虚',
      nodes: [
        { id:'st_palace',name:'天渊殿',type:'city',
          events:{explore:0.08,special:0.12,fight:0.03,loot:0.28,nothing:0.39,secret:0.10},
          nodeSpecial:{name:'灵界任务',rate:0.10,effect:()=>{GameState.spiritStones+=200;addLog('天渊殿领取灵界任务酬劳，灵石+200','loot');}}},
        { id:'st_market',name:'天渊坊市',type:'market',
          events:{explore:0.05,special:0.12,fight:0.03,loot:0.32,nothing:0.38,secret:0.10},
          nodeSpecial:{name:'灵材交易',rate:0.08,effect:()=>{GameState.spiritStones+=250;addLog('天渊坊市倒卖灵材，灵石+250','loot');}}},
        { id:'st_vein',name:'灵脉区',type:'cave',huntNode:true,
          events:{explore:0.05,special:0.08,fight:0.02,loot:0.20,nothing:0.55,secret:0.10},
          cultivationBonus:0.20},
        { id:'st_portal',name:'传送阵',type:'special',
          events:{explore:0.05,special:0.15,fight:0.05,loot:0.25,nothing:0.40,secret:0.10},
          nodeSpecial:{name:'传送符',rate:0.06,effect:()=>{GameState.spiritStones+=180;addLog('传送阵处获得传送符，灵石+180','loot');}}},
        { id:'st_library',name:'天渊藏经阁',type:'library',
          events:{explore:0.05,special:0.15,fight:0.02,loot:0.30,nothing:0.38,secret:0.10},
          nodeSpecial:{name:'灵文古卷',rate:0.08,effect:()=>{GameState.wis+=2;addLog('藏经阁翻阅灵文古卷，神识+2！','success');}}},
      ],
    },

    // ===== 木族领地（合体解锁）=====
    {
      id: 'sp_wood', name: '木族领地', areaName: '万木之域', realmRequired: '合体',
      nodes: [
        { id:'sw_city',name:'万木城',type:'city',
          events:{explore:0.05,special:0.10,fight:0.03,loot:0.30,nothing:0.42,secret:0.10}},
        { id:'sw_forest',name:'神木林',type:'wild',huntNode:true,
          events:{explore:0.20,special:0.12,fight:0.10,loot:0.20,nothing:0.28,secret:0.10},
          nodeSpecial:{name:'神木心',rate:0.05,effect:()=>{GameState.spi+=2;addLog('神木林中感悟自然，灵力+2！','success');}},
          secretNode:{id:'sw_forest_deep',name:'神木林深处',rate:0.02}},
        { id:'sw_sanctuary',name:'木灵圣地',type:'secret',
          events:{explore:0.10,special:0.18,fight:0.08,loot:0.24,nothing:0.30,secret:0.10},
          nodeSpecial:{name:'木灵精华',rate:0.05,effect:()=>{GameState.spiritStones+=300;GameState.breakItems['木灵精华']=(GameState.breakItems['木灵精华']||0)+1;addLog('木灵圣地中获得木灵精华！','crit');}}},
        { id:'sw_elder',name:'木族长老殿',type:'guild',
          events:{explore:0.08,special:0.12,fight:0.05,loot:0.25,nothing:0.40,secret:0.10},
          cultivationBonus:0.15},
      ],
    },

    // ===== 血光圣殿（合体解锁）=====
    {
      id: 'sp_blood', name: '血光圣殿', areaName: '血域深渊', realmRequired: '合体',
      nodes: [
        { id:'sb_pool',name:'血池',type:'cave',
          events:{explore:0.05,special:0.10,fight:0.08,loot:0.20,nothing:0.47,secret:0.10},
          cultivationBonus:0.25},
        { id:'sb_tower',name:'血炼塔',type:'special',
          events:{explore:0.10,special:0.12,fight:0.22,loot:0.20,nothing:0.26,secret:0.10},
          nodeSpecial:{name:'血炼真经',rate:0.05,effect:()=>{GameState.atk+=3;GameState.vit+=2;addLog('血炼塔中获得血炼真经，攻击+3，体魄+2！','crit');}}},
        { id:'sb_hall',name:'圣殿大厅',type:'guild',
          events:{explore:0.08,special:0.10,fight:0.08,loot:0.25,nothing:0.39,secret:0.10}},
        { id:'sb_forbid',name:'地下禁地',type:'secret',
          events:{explore:0.10,special:0.20,fight:0.15,loot:0.22,nothing:0.23,secret:0.10},
          nodeSpecial:{name:'血魔之心',rate:0.04,effect:()=>{GameState.spiritStones+=500;GameState.atk+=2;addLog('地下禁地夺取血魔之心，灵石+500，攻击+2！','crit');}}},
        { id:'sb_prison',name:'血狱',type:'secret',huntNode:true,
          events:{explore:0.08,special:0.15,fight:0.25,loot:0.20,nothing:0.22,secret:0.10}},
      ],
    },

    // ===== 雷鸣大陆（大乘解锁）=====
    {
      id: 'sp_thunder', name: '雷鸣大陆', areaName: '万雷之域', realmRequired: '大乘',
      nodes: [
        { id:'sr_city',name:'雷帝城',type:'city',
          events:{explore:0.05,special:0.10,fight:0.05,loot:0.30,nothing:0.40,secret:0.10},
          nodeSpecial:{name:'雷帝令',rate:0.06,effect:()=>{GameState.spiritStones+=300;addLog('雷帝城获得雷帝令，灵石+300','loot');}}},
        { id:'sr_pool',name:'雷池',type:'special',
          events:{explore:0.10,special:0.18,fight:0.10,loot:0.22,nothing:0.30,secret:0.10},
          nodeSpecial:{name:'雷劫淬体',rate:0.04,effect:()=>{GameState.spd+=3;GameState.atk+=2;addLog('雷池淬体，速度+3，攻击+2！','crit');}}},
        { id:'sr_valley',name:'雷鸣峡谷',type:'wild',huntNode:true,
          events:{explore:0.18,special:0.10,fight:0.18,loot:0.18,nothing:0.26,secret:0.10},
          secretNode:{id:'sr_valley_deep',name:'雷鸣峡谷深处',rate:0.02}},
        { id:'sr_thunderling',name:'雷灵宗',type:'guild',
          events:{explore:0.08,special:0.12,fight:0.08,loot:0.22,nothing:0.40,secret:0.10},
          cultivationBonus:0.18},
        { id:'sr_palace',name:'雷帝宫',type:'secret',
          events:{explore:0.05,special:0.22,fight:0.12,loot:0.23,nothing:0.28,secret:0.10},
          nodeSpecial:{name:'雷帝印',rate:0.03,effect:()=>{GameState.atk+=5;GameState.spi+=5;addLog('雷帝宫获得雷帝印，攻击+5，灵力+5！','crit');}}},
      ],
    },

    // ===== 飞灵族圣地（大乘解锁）=====
    {
      id: 'sp_flying', name: '飞灵族圣地', areaName: '远古灵域', realmRequired: '大乘',
      nodes: [
        { id:'sf_city',name:'飞灵城',type:'city',
          events:{explore:0.05,special:0.12,fight:0.03,loot:0.30,nothing:0.40,secret:0.10}},
        { id:'sf_elder',name:'灵族长老会',type:'guild',
          events:{explore:0.08,special:0.15,fight:0.05,loot:0.25,nothing:0.37,secret:0.10},
          cultivationBonus:0.20},
        { id:'sf_cross',name:'跨界通道',type:'special',
          events:{explore:0.05,special:0.20,fight:0.08,loot:0.20,nothing:0.37,secret:0.10},
          nodeSpecial:{name:'空间碎片',rate:0.03,effect:()=>{GameState.breakItems['空间碎片']=(GameState.breakItems['空间碎片']||0)+1;addLog('跨界通道中发现空间碎片！','crit');}}},
        { id:'sf_altar',name:'万灵祭坛',type:'secret',
          events:{explore:0.10,special:0.20,fight:0.12,loot:0.23,nothing:0.25,secret:0.10},
          nodeSpecial:{name:'万灵祝福',rate:0.05,effect:()=>{GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+GameState.cultivationMax*0.2);addLog('万灵祭坛获得远古祝福，修为大涨！','crit');}}},
        { id:'sf_temple',name:'飞灵圣殿',type:'secret',huntNode:true,
          events:{explore:0.08,special:0.18,fight:0.08,loot:0.26,nothing:0.30,secret:0.10}},
      ],
    },

    // ===== 灵墟古迹（隐藏，合体+）=====
    {
      id: 'sp_ruins',
      name: '灵墟古迹',
      areaName: '上古灵界遗迹',
      realmRequired: '合体',
      isHidden: true,
      discoverChance: 0.03,

      nodes: [
        { id:'rl_ruin',name:'上古灵墟',type:'secret',huntNode:true,
          events:{explore:0.10,special:0.25,fight:0.15,loot:0.22,nothing:0.18,secret:0.10},
          nodeSpecial:{name:'真灵之血',rate:0.03,effect:()=>{GameState.atk+=5;GameState.vit+=5;GameState.spiritStones+=800;addLog('灵墟古迹中获得真灵之血！攻击+5，体魄+5，灵石+800','crit');}}},
        { id:'rl_altar',name:'祭灵坛',type:'special',
          events:{explore:0.05,special:0.22,fight:0.10,loot:0.25,nothing:0.28,secret:0.10},
          nodeSpecial:{name:'灵界法则',rate:0.06,effect:()=>{GameState.wis+=3;GameState.spi+=3;addLog('祭灵坛领悟灵界法则，神识+3，灵力+3！','success');}}},
        { id:'rl_vault',name:'灵藏库',type:'market',
          events:{explore:0.05,special:0.15,fight:0.05,loot:0.38,nothing:0.27,secret:0.10},
          nodeSpecial:{name:'上古灵石',rate:0.08,effect:()=>{GameState.spiritStones+=600;addLog('灵藏库中发现上古灵石，灵石+600！','loot');}}},
      ],
    },
  ],
};

// ===== 灵界探索事件表 =====

function SPIRIT_getExploreResult(node) {
  const events = node.events;
  const roll = Math.random();
  let cum = 0;

  // 节点专属事件
  if (node.nodeSpecial && roll < (node.nodeSpecial.rate || 0.05)) {
    node.nodeSpecial.effect();
    return { type: 'special', text: '' };
  }

  // 秘境
  cum += events.secret || 0;
  if (roll < cum) {
    if (node.secretNode && Math.random() < (node.secretNode.rate || 0.02)) {
      const stones = 300 + Math.floor(Math.random() * 400);
      GameState.spiritStones += stones;
      const mat = ['天元果','五色灵芝','玄玉花','血晶藕'][Math.floor(Math.random() * 4)];
      GameState.breakItems[mat] = (GameState.breakItems[mat] || 0) + 1;
      return { type: 'secretFound', text: `发现隐藏区域：${node.secretNode.name}！灵石+${stones}，${mat}x1`, secretId: node.secretNode.id };
    }
    const reward = Math.random();
    if (reward < 0.35) {
      const stones = 200 + Math.floor(Math.random() * 400) * (1 + getRealmIdx());
      GameState.spiritStones += stones;
      return { type: 'loot', text: `秘境中收获灵石 +${stones}` };
    } else if (reward < 0.65) {
      const items = ['聚灵丹','定灵丹','赤阳丹','万年玄冰','神木心','灵界宝图','上古灵药','木灵精华'];
      const item = items[Math.floor(Math.random() * items.length)];
      GameState.breakItems[item] = (GameState.breakItems[item] || 0) + 1;
      return { type: 'loot', text: `秘境中获得 ${item} x1` };
    } else {
      GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 200 * (1 + getRealmIdx()));
      return { type: 'explore', text: '秘境中修炼了一番，修为大增' };
    }
  }

  // 战斗
  cum += events.fight || 0;
  if (roll < cum) {
    const fightRoll = Math.random();
    if (fightRoll < 0.65) {
      const stones = 100 + Math.floor(Math.random() * 200) * (1 + getRealmIdx());
      GameState.spiritStones += stones;
      return { type: 'fight', text: `战斗中胜利，缴获灵石 +${stones}` };
    } else if (fightRoll < 0.88) {
      GameState.cultivation = Math.floor(GameState.cultivation * 0.85);
      return { type: 'fight', text: '战斗中受伤，修为略有损失', cls: 'danger' };
    } else {
      const stones = 300 + Math.floor(Math.random() * 600);
      GameState.spiritStones += stones;
      const items = ['聚灵丹','养魂丹','赤阳丹'];
      const item = items[Math.floor(Math.random() * items.length)];
      GameState.breakItems[item] = (GameState.breakItems[item] || 0) + 1;
      return { type: 'fight', text: `大获全胜！灵石+${stones}，${item} x1`, cls: 'success' };
    }
  }

  // 物品
  cum += events.loot || 0;
  if (roll < cum) {
    const stones = 40 + Math.floor(Math.random() * 120) * (1 + getRealmIdx());
    GameState.spiritStones += stones;
    return { type: 'loot', text: `发现灵界灵石 +${stones}` };
  }

  // 奇遇
  cum += events.explore || 0;
  if (roll < cum) {
    if (Math.random() < 0.25 && GameState.origin) {
      GameState.wis += 1;
      return { type: 'originEvent', text: '前世的记忆碎片融入心海，神识+1' };
    }
    GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 80 * (1 + getRealmIdx()));
    return { type: 'explore', text: '偶有感悟，修为精进' };
  }

  // 负面
  if (Math.random() < 0.04) {
    const loss = Math.floor(GameState.spiritStones * SPIRIT_STONES.source.explore.lossRatio.spirit);
    GameState.spiritStones = Math.max(0, GameState.spiritStones - loss);
    return { type: 'danger', text: `灵气风暴席卷，损失灵石 -${loss}`, cls: 'danger' };
  }

  return { type: 'nothing', text: '探索了一番，灵气稀薄无所收获' };
}

// ===== 灵界辅助函数 =====

function SPIRIT_getRegion(id) {
  return SPIRIT_MAP.regions.find(r => r.id === id);
}

function SPIRIT_getNode(regionId, nodeId) {
  const region = SPIRIT_getRegion(regionId);
  if (!region) return null;
  return region.nodes.find(n => n.id === nodeId);
}

function SPIRIT_canAccessRegion(region) {
  if (!region) return false;
  const realmIdx = REALMS.findIndex(r => r.name === region.realmRequired && r.plane === 'spirit');
  const currentIdx = REALMS.findIndex(r => r.name === GameState.realm && r.plane === GameState.plane);
  return currentIdx >= realmIdx;
}

function SPIRIT_getUnlockedRegions() {
  return SPIRIT_MAP.regions.filter(r => !r.isHidden && SPIRIT_canAccessRegion(r));
}

// ===== 灵界坐标与路径 =====

const SPIRIT_POSITIONS = {
  sp_ice: {x:12,y:20}, sp_tianyuan: {x:42,y:38}, sp_wood: {x:28,y:65},
  sp_blood: {x:65,y:28}, sp_thunder: {x:55,y:62}, sp_flying: {x:82,y:48},
  sp_ruins: {x:45,y:15},
};

const SPIRIT_CONNECTIONS = [
  ['sp_ice','sp_tianyuan',5], ['sp_tianyuan','sp_wood',6], ['sp_tianyuan','sp_blood',5],
  ['sp_wood','sp_blood',7], ['sp_blood','sp_thunder',6], ['sp_wood','sp_thunder',5],
  ['sp_thunder','sp_flying',4], ['sp_tianyuan','sp_flying',8],
  ['sp_tianyuan','sp_ruins',4], ['sp_wood','sp_ruins',6],
];
