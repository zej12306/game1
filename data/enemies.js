// ==========================================
//  data/enemies.js — 妖兽/敌人图鉴 + 战斗系统
// ==========================================

// 敌人档位 = 境界索引
const ENEMY_TIERS = [
  { realm:'练气', hpBase:60, atkMin:4, atkMax:8, defMin:2, defMax:5, spdMin:2, spdMax:6, reward:20 },
  { realm:'筑基', hpBase:180, atkMin:10, atkMax:20, defMin:6, defMax:14, spdMin:5, spdMax:12, reward:60 },
  { realm:'金丹', hpBase:400, atkMin:22, atkMax:40, defMin:14, defMax:28, spdMin:10, spdMax:22, reward:150 },
  { realm:'元婴', hpBase:900, atkMin:45, atkMax:75, defMin:28, defMax:50, spdMin:20, spdMax:40, reward:350 },
  { realm:'化神', hpBase:1800, atkMin:80, atkMax:130, defMin:50, defMax:85, spdMin:35, spdMax:60, reward:700 },
  { realm:'炼虚', hpBase:4000, atkMin:160, atkMax:280, defMin:100, defMax:180, spdMin:70, spdMax:120, reward:1500 },
  { realm:'合体', hpBase:9000, atkMin:320, atkMax:550, defMin:200, defMax:350, spdMin:140, spdMax:220, reward:3000 },
  { realm:'大乘', hpBase:20000, atkMin:650, atkMax:1000, defMin:400, defMax:650, spdMin:260, spdMax:380, reward:6000 },
  { realm:'真仙', hpBase:50000, atkMin:1400, atkMax:2200, defMin:900, defMax:1400, spdMin:500, spdMax:700, reward:15000 },
  { realm:'金仙', hpBase:120000, atkMin:3000, atkMax:4500, defMin:2000, defMax:2800, spdMin:900, spdMax:1200, reward:35000 },
  { realm:'太乙', hpBase:300000, atkMin:6500, atkMax:9000, defMin:4500, defMax:6000, spdMin:1800, spdMax:2400, reward:80000 },
  { realm:'大罗', hpBase:800000, atkMin:15000, atkMax:20000, defMin:10000, defMax:13000, spdMin:3500, spdMax:4500, reward:200000 },
  { realm:'道祖', hpBase:2000000, atkMin:35000, atkMax:50000, defMin:22000, defMax:28000, spdMin:7000, spdMax:9000, reward:500000 },
];

// 技能库
const ENEMY_SKILLS = {
  // 通用
  bite: { name:'撕咬', dmgMult:1.2, desc:'用利齿撕扯敌人', type:'atk' },
  claw: { name:'利爪', dmgMult:1.1, desc:'锋利爪子划破空气', type:'atk', critBonus:0.10 },
  slam: { name:'撞击', dmgMult:1.3, desc:'蛮力撞击', type:'atk' },
  poison: { name:'毒液', dmgMult:0.8, desc:'喷射毒液，持续3回合', type:'atk', dot:3, dotDmg:5 },
  venom_bite: { name:'毒牙', dmgMult:0.9, desc:'带毒咬击', type:'atk', dot:2, dotDmg:8 },
  howl: { name:'嚎叫', dmgMult:0, desc:'威慑敌人，降低攻击力', type:'debuff', debuff:'atk', debuffVal:0.15 },
  tail_swipe: { name:'扫尾', dmgMult:1.0, desc:'巨尾横扫，概率击晕', type:'atk', stunChance:0.20 },
  charge: { name:'冲锋', dmgMult:1.5, desc:'全力冲锋，但自身防御降低', type:'atk', selfDebuff:'def', selfDebuffVal:0.2 },
  regenerate: { name:'再生', dmgMult:0, desc:'恢复自身HP', type:'heal', healPct:0.20 },
  thorn_armor: { name:'荆棘甲', dmgMult:0, desc:'反弹下次受击伤害30%', type:'buff', reflectDmg:0.30 },
  fire_breath: { name:'烈焰吐息', dmgMult:1.4, desc:'火焰灼烧', type:'atk', element:'火', dot:2, dotDmg:10 },
  ice_spear: { name:'冰锥术', dmgMult:1.3, desc:'凝冰为锥', type:'atk', element:'冰', slow:0.20 },
  thunder_strike: { name:'雷击', dmgMult:1.5, desc:'天雷轰顶', type:'atk', element:'雷', stunChance:0.15 },
  soul_drain: { name:'噬魂', dmgMult:1.0, desc:'吸取对方灵魂恢复自身', type:'atk', lifesteal:0.30 },
  mind_crush: { name:'神识压制', dmgMult:1.1, desc:'精神攻击，降低神识', type:'atk', debuff:'wis', debuffVal:0.10 },
  shadow_strike: { name:'暗影袭', dmgMult:1.6, desc:'暗影中一击致命', type:'atk', critBonus:0.25 },
  earth_quake: { name:'地震', dmgMult:1.3, desc:'震荡大地', type:'atk', element:'土', areaEffect:true },
  wind_slash: { name:'风刃', dmgMult:1.2, desc:'风元素利刃', type:'atk', element:'风', critBonus:0.08 },
  blood_frenzy: { name:'血怒', dmgMult:0, desc:'损失HP换取攻击翻倍', type:'buff', selfBuff:'atk', selfBuffVal:1.0, selfHpCost:0.10 },
  crystal_shell: { name:'晶化', dmgMult:0, desc:'防御翻倍1回合', type:'buff', selfBuff:'def', selfBuffVal:1.0 },
  death_curse: { name:'死亡诅咒', dmgMult:0, desc:'死亡时对玩家造成大额伤害', type:'passive', onDeathDmg:50 },
};

// 战斗消耗品
const COMBAT_ITEMS = {
  huiChunDan: { name:'回春丹', effect:'heal', val:0.3, desc:'恢复30%最大HP', price: 30 },
  daHuanDan: { name:'大还丹', effect:'heal', val:0.5, desc:'恢复50%最大HP', price: 80 },
};

// 战斗消耗品掉落表（按敌档位）
const COMBAT_ITEM_DROP = [
  { items: [{ id:'huiChunDan', weight:60 }, { id:'daHuanDan', weight:0 }], countMax:2 },
  { items: [{ id:'huiChunDan', weight:50 }, { id:'daHuanDan', weight:5 }], countMax:2 },
  { items: [{ id:'huiChunDan', weight:40 }, { id:'daHuanDan', weight:10 }], countMax:2 },
  { items: [{ id:'huiChunDan', weight:35 }, { id:'daHuanDan', weight:15 }], countMax:3 },
  { items: [{ id:'huiChunDan', weight:30 }, { id:'daHuanDan', weight:20 }], countMax:3 },
  { items: [{ id:'huiChunDan', weight:25 }, { id:'daHuanDan', weight:25 }], countMax:3 },
  { items: [{ id:'huiChunDan', weight:20 }, { id:'daHuanDan', weight:30 }], countMax:3 },
  { items: [{ id:'huiChunDan', weight:15 }, { id:'daHuanDan', weight:30 }], countMax:4 },
  { items: [{ id:'huiChunDan', weight:15 }, { id:'daHuanDan', weight:30 }], countMax:4 },
  { items: [{ id:'huiChunDan', weight:15 }, { id:'daHuanDan', weight:30 }], countMax:4 },
  { items: [{ id:'huiChunDan', weight:15 }, { id:'daHuanDan', weight:30 }], countMax:4 },
  { items: [{ id:'huiChunDan', weight:15 }, { id:'daHuanDan', weight:30 }], countMax:4 },
  { items: [{ id:'huiChunDan', weight:15 }, { id:'daHuanDan', weight:30 }], countMax:4 },
];

// ===== 妖兽图鉴 =====
const ENEMIES = [
  // ===== 一阶·练气 =====
  { id:'green_fang_wolf',name:'青牙狼',tier:0,region:'yue_huangfeng',hp:70,atk:7,def:4,spd:5,
    skills:['bite','claw'], desc:'越国山林中常见的妖狼，青色的獠牙是其标志。' },
  { id:'iron_boar',name:'铁鬃野猪',tier:0,region:'yue_qingxu',hp:90,atk:6,def:6,spd:3,
    skills:['slam','charge'], desc:'皮糙肉厚的野猪，冲撞力惊人。' },
  { id:'poison_snake',name:'翠毒蛇',tier:0,region:'yue_huangfeng',hp:45,atk:8,def:2,spd:7,
    skills:['venom_bite','poison'], desc:'翠绿色的毒蛇，毒性可麻痹练气修士。' },
  { id:'shadow_monkey',name:'影猴',tier:0,region:'yue_yanmoon',hp:55,atk:6,def:3,spd:8,
    skills:['claw','shadow_strike'], desc:'行动敏捷的猴形妖兽，善隐匿偷袭。' },
  { id:'wind_hawk',name:'风隼',tier:0,region:'yue_giant',hp:50,atk:7,def:2,spd:9,
    skills:['claw','wind_slash'], desc:'高空盘旋的猛禽，俯冲攻击迅猛。' },

  // ===== 二阶·筑基 =====
  { id:'flame_wolf',name:'赤焰狼',tier:1,region:'yuanwu',hp:200,atk:18,def:10,spd:10,
    skills:['bite','fire_breath'], desc:'口中可喷吐烈焰的巨狼。' },
  { id:'crystal_lizard',name:'晶甲蜥',tier:1,region:'yuanwu',hp:250,atk:12,def:16,spd:6,
    skills:['tail_swipe','crystal_shell'], desc:'全身覆盖水晶般的鳞甲，防御极强。' },
  { id:'mist_serpent',name:'雾蟒',tier:1,region:'yue_huangfeng',hp:180,atk:15,def:8,spd:11,
    skills:['venom_bite','shadow_strike'], desc:'瘴气中诞生的巨蟒，擅长伏击。' },
  { id:'thunder_bat',name:'雷蝠',tier:1,region:'yue_skyhold',hp:140,atk:20,def:6,spd:12,
    skills:['claw','thunder_strike'], desc:'栖息在雷雨云的蝙蝠，可释放微弱雷电。' },
  { id:'blood_leech',name:'血蛭王',tier:1,region:'yuanwu',hp:220,atk:10,def:5,spd:4,
    skills:['soul_drain','regenerate'], desc:'巨大的吸血妖蛭，生命力顽强。' },

  // ===== 三阶·金丹 =====
  { id:'lava_golem',name:'熔岩巨像',tier:2,region:'west',hp:480,atk:35,def:22,spd:8,
    skills:['slam','fire_breath','earth_quake'], desc:'岩浆中诞生的石巨人。' },
  { id:'ice_phantom',name:'冰魄幽灵',tier:2,region:'west',hp:320,atk:30,def:12,spd:20,
    skills:['ice_spear','soul_drain','shadow_strike'], desc:'极寒之地的幽灵，可冻结灵魂。' },
  { id:'storm_roc',name:'暴风鹏',tier:2,region:'starsea',hp:380,atk:38,def:15,spd:22,
    skills:['claw','wind_slash','thunder_strike'], desc:'双翼掀起风暴的巨鹏。' },
  { id:'coral_giant',name:'珊瑚巨人',tier:2,region:'starsea',hp:550,atk:25,def:28,spd:10,
    skills:['slam','thorn_armor','regenerate'], desc:'乱星海底的珊瑚精怪。' },
  { id:'ghost_cultivator',name:'鬼修',tier:2,region:'west',hp:350,atk:32,def:14,spd:18,
    skills:['mind_crush','soul_drain','death_curse'], desc:'陨落修士的怨魂。死亡时释放诅咒。' },

  // ===== 四阶·元婴 =====
  { id:'nine_tailed_fox',name:'九尾妖狐',tier:3,region:'tiannan',hp:1000,atk:65,def:35,spd:40,
    skills:['claw','mind_crush','shadow_strike','howl'], desc:'修行千年的妖狐，魅惑众生。' },
  { id:'ancient_treant',name:'千年树妖',tier:3,region:'tiannan',hp:1500,atk:48,def:55,spd:15,
    skills:['slam','regenerate','thorn_armor','crystal_shell'], desc:'万年古树化形的树妖。' },
  { id:'hell_python',name:'地狱蟒',tier:3,region:'tiannan',hp:1200,atk:72,def:30,spd:28,
    skills:['venom_bite','tail_swipe','poison','fire_breath'], desc:'蟒中王者，身长百丈。' },
  { id:'sky_sword_eagle',name:'斩天雕',tier:3,region:'tiannan',hp:850,atk:80,def:25,spd:45,
    skills:['claw','wind_slash','thunder_strike','blood_frenzy'], desc:'双翼如刀刃的巨雕。' },

  // ===== 五阶·化神 =====
  { id:'demon_general',name:'魔将',tier:4,region:'dajin',hp:2200,atk:120,def:75,spd:50,
    skills:['slam','fire_breath','soul_drain','blood_frenzy','death_curse'], desc:'魔道六宗的护法魔将。' },
  { id:'true_dragon_young',name:'幼年真龙',tier:4,region:'dajin',hp:2800,atk:110,def:80,spd:55,
    skills:['claw','fire_breath','thunder_strike','tail_swipe','regenerate'], desc:'龙族幼体，血脉中蕴含毁天灭地之力。' },
  { id:'void_devourer',name:'虚空吞噬者',tier:4,region:'kunwu',hp:2000,atk:130,def:55,spd:40,
    skills:['soul_drain','mind_crush','shadow_strike','death_curse','ice_spear'], desc:'昆吾山虚空中诞生的怪物。' },
  { id:'immortal_corpse',name:'仙尸',tier:4,region:'dajin',hp:3500,atk:105,def:85,spd:30,
    skills:['regenerate','crystal_shell','earth_quake','death_curse'], desc:'上古陨落仙人的尸体傀儡。' },

  // ===== 六阶·灵界 =====
  { id:'ice_titan',name:'冰霜泰坦',tier:5,region:'sp_ice',hp:5000,atk:250,def:160,spd:100,
    skills:['slam','ice_spear','crystal_shell','howl'], desc:'冰封大陆的远古守护者。' },
  { id:'blood_demon',name:'血魔',tier:6,region:'sp_blood',hp:10000,atk:500,def:300,spd:180,
    skills:['soul_drain','blood_frenzy','poison','death_curse'], desc:'血光圣殿中诞生的血魔。' },
  { id:'thunder_beast',name:'雷兽',tier:7,region:'sp_thunder',hp:18000,atk:900,def:550,spd:300,
    skills:['thunder_strike','charge','claw','regenerate'], desc:'雷鸣大陆的雷属性凶兽。' },
  { id:'spirit_dragon',name:'灵龙',tier:7,region:'sp_flying',hp:22000,atk:850,def:600,spd:350,
    skills:['fire_breath','wind_slash','regenerate','tail_swipe','thunder_strike'], desc:'飞灵族圣地的守护灵龙。' },

  // ===== 七阶·仙界 =====
  { id:'golden_warrior',name:'金甲仙卫',tier:9,region:'im_golden',hp:150000,atk:4000,def:2500,spd:1000,
    skills:['slam','fire_breath','crystal_shell','blood_frenzy'], desc:'金阙仙宫的金甲守卫。' },
  { id:'star_beast',name:'星兽',tier:10,region:'im_taiyi',hp:350000,atk:8500,def:5500,spd:2000,
    skills:['mind_crush','regenerate','thunder_strike','earth_quake','death_curse'], desc:'星域中游荡的星际巨兽。' },
  { id:'chaos_lord',name:'混沌之主',tier:11,region:'im_daluo',hp:900000,atk:18000,def:12000,spd:4000,
    skills:['soul_drain','blood_frenzy','ice_spear','fire_breath','shadow_strike','regenerate'], desc:'混沌海中诞生的无上存在。' },
  { id:'dao_guardian',name:'道之守护者',tier:12,region:'im_daozu',hp:2500000,atk:45000,def:26000,spd:8000,
    skills:['thunder_strike','earth_quake','crystal_shell','regenerate','death_curse','blood_frenzy'], desc:'守护天道祭坛的终极存在。' },
];

// ===== 区域索引 =====
const ENEMY_BY_REGION = {};
ENEMIES.forEach(e => {
  if (!ENEMY_BY_REGION[e.region]) ENEMY_BY_REGION[e.region] = [];
  ENEMY_BY_REGION[e.region].push(e);
});

// ===== 辅助函数 =====
function getEnemiesForRegion(regionId) {
  return ENEMY_BY_REGION[regionId] || [];
}

function rollEnemy(regionId) {
  const pool = getEnemiesForRegion(regionId);
  if (pool.length === 0) {
    // fallback: generic enemy from tier
    const region = getCurrentMap().data.regions.find(r => r.id === regionId);
    if (region) {
      const tierIdx = REALMS.findIndex(r => r.name === region.realmRequired);
      const tier = ENEMY_TIERS[Math.max(0, tierIdx)] || ENEMY_TIERS[0];
      return {
        id: 'generic', name: '妖兽', tier: Math.max(0, tierIdx),
        hp: tier.hpBase, atk: tier.atkMin, def: tier.defMin, spd: tier.spdMin,
        skills: ['bite'], desc: '未知妖兽', generic: true,
      };
    }
    return ENEMIES[0];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function getPlayerCombatStats() {
  const s = GameState;
  const bonus = getSkillAttrBonus();
  const realm = getRealmData(s.realm, s.plane);
  const hpBonus = [0,100,300,600,1000,2000,2000,2000,5000,5000,5000,5000,5000][REALMS.findIndex(r=>r.name===s.realm&&r.plane===s.plane)]||0;
  return {
    hp: 100 + (s.vit + (bonus.vit||0))*15 + (s.def + (bonus.def||0))*5 + hpBonus,
    maxHp: 100 + (s.vit + (bonus.vit||0))*15 + (s.def + (bonus.def||0))*5 + hpBonus,
    atk: s.atk + (bonus.atk||0),
    def: s.def + (bonus.def||0),
    spd: s.spd + (bonus.spd||0),
    wis: s.wis + (bonus.wis||0),
  };
}
