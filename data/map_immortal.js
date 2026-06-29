// ==========================================
//  data/map_immortal.js — 仙界地图
// ==========================================

const IMMORTAL_MAP = {
  plane: 'immortal',
  regions: [

    // ===== 飞升台（真仙解锁）=====
    {
      id: 'im_ascend', name: '飞升台', areaName: '仙界入口', realmRequired: '真仙',
      nodes: [
        { id:'ia_hall',name:'飞升殿',type:'city',
          events:{explore:0.05,special:0.10,fight:0.03,loot:0.30,nothing:0.42,secret:0.10},
          nodeSpecial:{name:'飞升贺礼',rate:0.12,effect:()=>{GameState.spiritStones+=500;addLog('飞升殿收到仙界贺礼，灵石+500','loot');}}},
        { id:'ia_guide',name:'接引仙使',type:'guild',
          events:{explore:0.08,special:0.15,fight:0.05,loot:0.25,nothing:0.37,secret:0.10},
          nodeSpecial:{name:'仙界指引',rate:0.10,effect:()=>{GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+300);addLog('接引仙使传道，修为+300','success');}}},
        { id:'ia_spring',name:'仙灵泉',type:'cave',
          events:{explore:0.05,special:0.08,fight:0.02,loot:0.20,nothing:0.55,secret:0.10},
          cultivationBonus:0.30},
        { id:'ia_market',name:'仙坊',type:'market',
          events:{explore:0.05,special:0.12,fight:0.03,loot:0.32,nothing:0.38,secret:0.10},
          nodeSpecial:{name:'仙石交易',rate:0.08,effect:()=>{GameState.spiritStones+=400;addLog('仙坊中出售灵材，灵石+400','loot');}}},
      ],
    },

    // ===== 金阙仙宫（金仙解锁）=====
    {
      id: 'im_golden', name: '金阙仙宫', areaName: '东方仙域', realmRequired: '金仙',
      nodes: [
        { id:'ig_palace',name:'金阙殿',type:'city',
          events:{explore:0.05,special:0.12,fight:0.03,loot:0.30,nothing:0.40,secret:0.10},
          nodeSpecial:{name:'金仙赏赐',rate:0.10,effect:()=>{GameState.spiritStones+=600;addLog('金阙殿得金仙赏赐，灵石+600','loot');}}},
        { id:'ig_pill',name:'仙丹阁',type:'special',
          events:{explore:0.05,special:0.15,fight:0.02,loot:0.33,nothing:0.35,secret:0.10},
          nodeSpecial:{name:'仙丹',rate:0.06,effect:()=>{GameState.lifespanMax+=200;addLog('仙丹阁中获赐仙丹，寿元+200！','crit');}}},
        { id:'ig_debate',name:'论道台',type:'library',
          events:{explore:0.10,special:0.15,fight:0.03,loot:0.25,nothing:0.37,secret:0.10},
          nodeSpecial:{name:'金仙心得',rate:0.08,effect:()=>{GameState.wis+=3;addLog('论道台上聆听金仙论道，神识+3！','success');}}},
        { id:'ig_guard',name:'金甲卫营',type:'special',
          events:{explore:0.10,special:0.10,fight:0.22,loot:0.20,nothing:0.28,secret:0.10},
          nodeSpecial:{name:'金甲碎片',rate:0.06,effect:()=>{GameState.def+=3;addLog('金甲卫营获得金甲碎片，防御+3','success');}}},
        { id:'ig_orchard',name:'仙界果园',type:'wild',
          events:{explore:0.12,special:0.10,fight:0.05,loot:0.28,nothing:0.35,secret:0.10},
          nodeSpecial:{name:'仙桃',rate:0.08,effect:()=>{GameState.lifespanMax+=100;GameState.vit+=2;addLog('仙界果园中吃到仙桃，寿元+100，体魄+2！','success');}}},
      ],
    },

    // ===== 太乙道场（太乙解锁）=====
    {
      id: 'im_taiyi', name: '太乙道场', areaName: '中央仙域', realmRequired: '太乙',
      nodes: [
        { id:'it_hall',name:'太乙殿',type:'guild',
          events:{explore:0.08,special:0.15,fight:0.05,loot:0.25,nothing:0.37,secret:0.10},
          nodeSpecial:{name:'太乙真意',rate:0.08,effect:()=>{GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+GameState.cultivationMax*0.1);addLog('太乙殿领悟太乙真意，修为增长！','crit');}}},
        { id:'it_star',name:'星域',type:'wild',
          events:{explore:0.20,special:0.15,fight:0.12,loot:0.20,nothing:0.23,secret:0.10},
          nodeSpecial:{name:'星核',rate:0.04,effect:()=>{GameState.atk+=5;GameState.spi+=5;addLog('星域中获得星核，攻击+5，灵力+5！','crit');}}},
        { id:'it_cliff',name:'悟道崖',type:'cave',
          events:{explore:0.05,special:0.15,fight:0.03,loot:0.20,nothing:0.47,secret:0.10},
          cultivationBonus:0.40},
        { id:'it_rift',name:'时空裂隙',type:'secret',
          events:{explore:0.10,special:0.22,fight:0.12,loot:0.23,nothing:0.23,secret:0.10},
          nodeSpecial:{name:'时空感悟',rate:0.05,effect:()=>{GameState.spd+=3;GameState.wis+=3;addLog('时空裂隙中感悟时空法则，速度+3，神识+3！','success');}}},
        { id:'it_forge',name:'仙器阁',type:'special',
          events:{explore:0.05,special:0.18,fight:0.03,loot:0.30,nothing:0.34,secret:0.10},
          nodeSpecial:{name:'仙器碎片',rate:0.06,effect:()=>{GameState.atk+=4;addLog('仙器阁中捡到仙器碎片，攻击+4！','loot');}}},
      ],
    },

    // ===== 大罗天域（大罗解锁）=====
    {
      id: 'im_daluo', name: '大罗天域', areaName: '无上仙域', realmRequired: '大罗',
      nodes: [
        { id:'id_palace',name:'大罗宫',type:'city',
          events:{explore:0.05,special:0.15,fight:0.03,loot:0.30,nothing:0.37,secret:0.10},
          nodeSpecial:{name:'大罗赐福',rate:0.08,effect:()=>{GameState.spiritStones+=1000;addLog('大罗宫得大罗金仙赐福，灵石+1000！','crit');}}},
        { id:'id_chaos',name:'混沌海',type:'wild',
          events:{explore:0.20,special:0.18,fight:0.15,loot:0.18,nothing:0.19,secret:0.10},
          nodeSpecial:{name:'混沌之气',rate:0.03,effect:()=>{GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+GameState.cultivationMax*0.5);addLog('混沌海中吸收混沌之气，修为大幅增长！','crit');}},
          secretNode:{id:'id_chaos_deep',name:'混沌海深处',rate:0.01}},
        { id:'id_trial',name:'仙帝试炼',type:'special',
          events:{explore:0.08,special:0.12,fight:0.28,loot:0.22,nothing:0.20,secret:0.10},
          nodeSpecial:{name:'试炼证明',rate:0.05,effect:()=>{GameState.atk+=5;GameState.def+=5;GameState.vit+=3;addLog('通过仙帝试炼，攻击+5，防御+5，体魄+3！','crit');}}},
        { id:'id_library',name:'万法藏书阁',type:'library',
          events:{explore:0.05,special:0.20,fight:0.02,loot:0.28,nothing:0.35,secret:0.10},
          nodeSpecial:{name:'仙法残页',rate:0.08,effect:()=>{GameState.wis+=5;addLog('万法藏书阁中翻阅仙法，神识+5！','success');}}},
        { id:'id_mountain',name:'不周山',type:'wild',
          events:{explore:0.15,special:0.12,fight:0.18,loot:0.18,nothing:0.27,secret:0.10},
          nodeSpecial:{name:'不周石',rate:0.05,effect:()=>{GameState.atk+=3;GameState.def+=3;addLog('不周山上采集不周石，攻击+3，防御+3！','success');}}},
      ],
    },

    // ===== 道祖圣境（道祖解锁）=====
    {
      id: 'im_daozu', name: '道祖圣境', areaName: '万物归墟', realmRequired: '道祖',
      nodes: [
        { id:'iz_altar',name:'天道祭坛',type:'special',
          events:{explore:0.05,special:0.25,fight:0.05,loot:0.25,nothing:0.30,secret:0.10},
          nodeSpecial:{name:'天道感悟',rate:0.08,effect:()=>{GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+GameState.cultivationMax*0.3);GameState.wis+=5;addLog('天道祭坛感悟天道，修为大涨，神识+5！','crit');}}},
        { id:'iz_axe',name:'开天斧',type:'secret',
          events:{explore:0.05,special:0.30,fight:0.15,loot:0.25,nothing:0.15,secret:0.10},
          nodeSpecial:{name:'开天斧碎片',rate:0.02,effect:()=>{GameState.atk+=20;addLog('获得开天斧碎片！攻击+20！','crit');}}},
        { id:'iz_end',name:'时空尽头',type:'secret',
          events:{explore:0.10,special:0.25,fight:0.15,loot:0.22,nothing:0.18,secret:0.10},
          nodeSpecial:{name:'时空之核',rate:0.03,effect:()=>{GameState.spd+=5;GameState.spi+=5;addLog('时空尽头获得时空之核，速度+5，灵力+5！','crit');}}},
        { id:'iz_void',name:'万物归墟',type:'special',
          events:{explore:0.05,special:0.30,fight:0.10,loot:0.25,nothing:0.20,secret:0.10},
          nodeSpecial:{name:'归墟精华',rate:0.04,effect:()=>{GameState.atk+=10;GameState.def+=10;addLog('万物归墟中凝聚归墟精华，攻击+10，防御+10！','crit');}}},
        { id:'iz_throne',name:'道祖王座',type:'special',
          events:{explore:0.05,special:0.22,fight:0.08,loot:0.28,nothing:0.27,secret:0.10},
          nodeSpecial:{name:'道祖传承',rate:0.03,effect:()=>{GameState.cultivation=GameState.cultivationMax;addLog('道祖王座获得完整传承，修为圆满！','crit');}}},
      ],
    },

    // ===== 开天秘境（隐藏，太乙+）=====
    {
      id: 'im_genesis',
      name: '开天秘境',
      areaName: '混沌初开',
      realmRequired: '太乙',
      isHidden: true,
      discoverChance: 0.03,

      nodes: [
        { id:'gs_cradle',name:'混沌摇篮',type:'secret',
          events:{explore:0.10,special:0.28,fight:0.12,loot:0.25,nothing:0.15,secret:0.10},
          nodeSpecial:{name:'混沌本源',rate:0.02,effect:()=>{GameState.atk+=15;GameState.spi+=15;GameState.cultivation=Math.min(GameState.cultivationMax,GameState.cultivation+GameState.cultivationMax*0.5);addLog('混沌摇篮中获得混沌本源！攻击+15，灵力+15，修为大涨！','crit');}}},
        { id:'gs_void',name:'虚无之渊',type:'secret',
          events:{explore:0.12,special:0.22,fight:0.18,loot:0.22,nothing:0.16,secret:0.10},
          nodeSpecial:{name:'虚无之晶',rate:0.04,effect:()=>{GameState.def+=8;GameState.vit+=8;addLog('虚无之渊中获得虚无之晶，防御+8，体魄+8！','crit');}}},
        { id:'gs_start',name:'万界起点',type:'special',
          events:{explore:0.05,special:0.30,fight:0.05,loot:0.30,nothing:0.20,secret:0.10},
          nodeSpecial:{name:'创世印记',rate:0.02,effect:()=>{GameState.spiritStones+=5000;addLog('万界起点发现创世印记，灵石+5000！','crit');}}},
      ],
    },
  ],
};

// ===== 仙界探索事件表 =====

function IMMORTAL_getExploreResult(node) {
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
      const stones = 800 + Math.floor(Math.random() * 700);
      GameState.spiritStones += stones;
      const mat = ['寿元果','天魂果','万年灵乳','伴妖草'][Math.floor(Math.random() * 4)];
      GameState.breakItems[mat] = (GameState.breakItems[mat] || 0) + 1;
      return { type: 'secretFound', text: `发现隐藏区域：${node.secretNode.name}！灵石+${stones}，${mat}x1`, secretId: node.secretNode.id };
    }
    const reward = Math.random();
    if (reward < 0.35) {
      const stones = 500 + Math.floor(Math.random() * 800) * (1 + getRealmIdx());
      GameState.spiritStones += stones;
      return { type: 'loot', text: `仙界秘境中收获灵石 +${stones}` };
    } else if (reward < 0.65) {
      const items = ['养魂丹','赤阳丹','螟母汁液','寿元果丹','仙器碎片','混沌石','创世印记'];
      const item = items[Math.floor(Math.random() * items.length)];
      GameState.breakItems[item] = (GameState.breakItems[item] || 0) + 1;
      return { type: 'loot', text: `秘境中获得 ${item} x1` };
    } else {
      GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 500 * (1 + getRealmIdx()));
      return { type: 'explore', text: '秘境中修炼了一番，修为大增' };
    }
  }

  // 战斗
  cum += events.fight || 0;
  if (roll < cum) {
    const fightRoll = Math.random();
    if (fightRoll < 0.60) {
      const stones = 300 + Math.floor(Math.random() * 400) * (1 + getRealmIdx());
      GameState.spiritStones += stones;
      return { type: 'fight', text: `战斗中胜利，缴获灵石 +${stones}` };
    } else if (fightRoll < 0.85) {
      GameState.cultivation = Math.floor(GameState.cultivation * 0.85);
      return { type: 'fight', text: '战斗中受伤，修为略有损失', cls: 'danger' };
    } else {
      const stones = 800 + Math.floor(Math.random() * 1200);
      GameState.spiritStones += stones;
      const items = ['养魂丹','螟母汁液','寿元果丹'];
      const item = items[Math.floor(Math.random() * items.length)];
      GameState.breakItems[item] = (GameState.breakItems[item] || 0) + 1;
      return { type: 'fight', text: `大获全胜！灵石+${stones}，${item} x1`, cls: 'success' };
    }
  }

  // 物品
  cum += events.loot || 0;
  if (roll < cum) {
    const stones = 100 + Math.floor(Math.random() * 300) * (1 + getRealmIdx());
    GameState.spiritStones += stones;
    return { type: 'loot', text: `发现仙界灵石 +${stones}` };
  }

  // 奇遇
  cum += events.explore || 0;
  if (roll < cum) {
    if (Math.random() < 0.2 && GameState.origin) {
      GameState.wis += 1;
      return { type: 'originEvent', text: '前世的记忆碎片融入心海，神识+1' };
    }
    GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 200 * (1 + getRealmIdx()));
    return { type: 'explore', text: '偶有感悟，修为精进' };
  }

  // 负面
  if (Math.random() < 0.03) {
    const loss = Math.floor(GameState.spiritStones * 0.1);
    GameState.spiritStones = Math.max(0, GameState.spiritStones - loss);
    return { type: 'danger', text: `天劫余波波及，损失灵石 -${loss}`, cls: 'danger' };
  }

  return { type: 'nothing', text: '探索了一番，仙气缭绕却无所收获' };
}

// ===== 仙界辅助函数 =====

function IMMORTAL_getRegion(id) {
  return IMMORTAL_MAP.regions.find(r => r.id === id);
}

function IMMORTAL_getNode(regionId, nodeId) {
  const region = IMMORTAL_getRegion(regionId);
  if (!region) return null;
  return region.nodes.find(n => n.id === nodeId);
}

function IMMORTAL_canAccessRegion(region) {
  if (!region) return false;
  const realmIdx = REALMS.findIndex(r => r.name === region.realmRequired && r.plane === 'immortal');
  const currentIdx = REALMS.findIndex(r => r.name === GameState.realm && r.plane === GameState.plane);
  return currentIdx >= realmIdx;
}

function IMMORTAL_getUnlockedRegions() {
  return IMMORTAL_MAP.regions.filter(r => !r.isHidden && IMMORTAL_canAccessRegion(r));
}

// ===== 仙界坐标与路径 =====

const IMMORTAL_POSITIONS = {
  im_ascend: {x:50,y:82}, im_golden: {x:22,y:55}, im_taiyi: {x:48,y:45},
  im_daluo: {x:48,y:22}, im_daozu: {x:78,y:15},
  im_genesis: {x:15,y:18},
};

const IMMORTAL_CONNECTIONS = [
  ['im_ascend','im_golden',10], ['im_golden','im_taiyi',8], ['im_taiyi','im_daluo',12],
  ['im_daluo','im_daozu',15], ['im_golden','im_daluo',15],
  ['im_taiyi','im_genesis',8], ['im_daluo','im_genesis',10],
];
