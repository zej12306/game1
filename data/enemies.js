// ==========================================
//  data/enemies.js — 妖兽/敌人图鉴 + 战斗系统
// ==========================================

// 敌人档位 = 境界索引
const ENEMY_TIERS = [
  { realm:'练气', hpBase:60, atkMin:4, atkMax:8, defMin:2, defMax:5, spdMin:2, spdMax:6, reward:20, cultReward:8 },
  { realm:'筑基', hpBase:180, atkMin:10, atkMax:20, defMin:6, defMax:14, spdMin:5, spdMax:12, reward:60, cultReward:20 },
  { realm:'金丹', hpBase:400, atkMin:22, atkMax:40, defMin:14, defMax:28, spdMin:10, spdMax:22, reward:150, cultReward:45 },
  { realm:'元婴', hpBase:900, atkMin:45, atkMax:75, defMin:28, defMax:50, spdMin:20, spdMax:40, reward:350, cultReward:90 },
  { realm:'化神', hpBase:1800, atkMin:80, atkMax:130, defMin:50, defMax:85, spdMin:35, spdMax:60, reward:700, cultReward:160 },
  { realm:'炼虚', hpBase:4000, atkMin:160, atkMax:280, defMin:100, defMax:180, spdMin:70, spdMax:120, reward:1500, cultReward:280 },
  { realm:'合体', hpBase:9000, atkMin:320, atkMax:550, defMin:200, defMax:350, spdMin:140, spdMax:220, reward:3000, cultReward:500 },
  { realm:'大乘', hpBase:20000, atkMin:650, atkMax:1000, defMin:400, defMax:650, spdMin:260, spdMax:380, reward:6000, cultReward:900 },
  { realm:'真仙', hpBase:50000, atkMin:1400, atkMax:2200, defMin:900, defMax:1400, spdMin:500, spdMax:700, reward:15000, cultReward:1600 },
  { realm:'金仙', hpBase:120000, atkMin:3000, atkMax:4500, defMin:2000, defMax:2800, spdMin:900, spdMax:1200, reward:35000, cultReward:2800 },
  { realm:'太乙', hpBase:300000, atkMin:6500, atkMax:9000, defMin:4500, defMax:6000, spdMin:1800, spdMax:2400, reward:80000, cultReward:5000 },
  { realm:'大罗', hpBase:800000, atkMin:15000, atkMax:20000, defMin:10000, defMax:13000, spdMin:3500, spdMax:4500, reward:200000, cultReward:9000 },
  { realm:'道祖', hpBase:2000000, atkMin:35000, atkMax:50000, defMin:22000, defMax:28000, spdMin:7000, spdMax:9000, reward:500000, cultReward:16000 },
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

// 妖兽阶段（普通/精英/王级）
const ENEMY_PHASES = [
  { name:'',    label:'',     rate:70, hpMult:1.0, atkMult:1.0, defMult:1.0, spdMult:1.0, rewardMult:1.0, cultMult:1.0, skillBonus:0 },
  { name:'·精英', label:'精英', rate:22, hpMult:1.8, atkMult:1.3, defMult:1.3, spdMult:1.1, rewardMult:1.8, cultMult:1.5, skillBonus:1 },
  { name:'·王级', label:'王级', rate:8,  hpMult:3.0, atkMult:1.6, defMult:1.6, spdMult:1.2, rewardMult:3.0, cultMult:2.5, skillBonus:2 },
];

// 战斗消耗品
const COMBAT_ITEMS = {
  huiChunDan:    { name:'回春丹', effect:'heal', val:0.3, desc:'恢复30%最大HP', price: 30 },
  daHuanDan:     { name:'大还丹', effect:'heal', val:0.5, desc:'恢复50%最大HP', price: 80 },
  jiuzhuanDan:   { name:'九转丹', effect:'heal', val:1.0, desc:'恢复全部HP', price: 200 },
  jingangWan:    { name:'金刚丸', effect:'buff', stat:'def', val:0.5, turns:3, desc:'防御+50%（3回合）', price: 50 },
  jifengSan:     { name:'疾风散', effect:'firstStrike', desc:'本回合必定先手', price: 40 },
  baokuangDan:   { name:'狂暴丹', effect:'buff', stat:'atk', val:0.5, turns:3, desc:'攻击+50%（3回合）', price: 80 },
  huhunDan:      { name:'护魂丹', effect:'deathSave', desc:'免疫一次致命伤害', price: 150 },
};

// 战斗消耗品掉落表（按敌档位 0-12）
// tier 0-1: 只掉回春丹、疾风散
// tier 2-3: 回春丹+大还丹+金刚丸
// tier 4-5: 大还丹+狂暴丹
// tier 6-7: 大还丹+狂暴丹+九转丹
// tier 8+: 全部都有概率
const COMBAT_ITEM_DROP = [
  { items: [{ id:'huiChunDan', weight:50 }, { id:'jifengSan', weight:10 }], countMax:2 },
  { items: [{ id:'huiChunDan', weight:45 }, { id:'daHuanDan', weight:5 }, { id:'jifengSan', weight:10 }], countMax:2 },
  { items: [{ id:'huiChunDan', weight:40 }, { id:'daHuanDan', weight:10 }, { id:'jingangWan', weight:10 }], countMax:2 },
  { items: [{ id:'huiChunDan', weight:30 }, { id:'daHuanDan', weight:15 }, { id:'jingangWan', weight:15 }], countMax:3 },
  { items: [{ id:'huiChunDan', weight:25 }, { id:'daHuanDan', weight:20 }, { id:'baokuangDan', weight:10 }], countMax:3 },
  { items: [{ id:'huiChunDan', weight:20 }, { id:'daHuanDan', weight:25 }, { id:'baokuangDan', weight:15 }], countMax:3 },
  { items: [{ id:'daHuanDan', weight:25 }, { id:'baokuangDan', weight:20 }, { id:'jiuzhuanDan', weight:5 }], countMax:3 },
  { items: [{ id:'daHuanDan', weight:25 }, { id:'baokuangDan', weight:20 }, { id:'jiuzhuanDan', weight:10 }], countMax:4 },
  { items: [{ id:'daHuanDan', weight:20 }, { id:'baokuangDan', weight:25 }, { id:'jiuzhuanDan', weight:15 }, { id:'huhunDan', weight:5 }], countMax:4 },
  { items: [{ id:'daHuanDan', weight:20 }, { id:'baokuangDan', weight:20 }, { id:'jiuzhuanDan', weight:15 }, { id:'huhunDan', weight:8 }], countMax:4 },
  { items: [{ id:'daHuanDan', weight:18 }, { id:'baokuangDan', weight:18 }, { id:'jiuzhuanDan', weight:18 }, { id:'huhunDan', weight:10 }], countMax:4 },
  { items: [{ id:'daHuanDan', weight:15 }, { id:'baokuangDan', weight:15 }, { id:'jiuzhuanDan', weight:15 }, { id:'huhunDan', weight:15 }], countMax:5 },
  { items: [{ id:'daHuanDan', weight:15 }, { id:'baokuangDan', weight:15 }, { id:'jiuzhuanDan', weight:15 }, { id:'huhunDan', weight:15 }], countMax:5 },
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
  { id:'iron_scorpion',name:'铁尾蝎',tier:0,region:'yue_skyhold',hp:65,atk:8,def:4,spd:4,
    skills:['bite','poison'], desc:'天阙堡岩壁中藏身的毒蝎，尾刺含剧毒。' },

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
  { id:'deep_siren',name:'深海女妖',tier:2,region:'starsea',hp:360,atk:40,def:16,spd:24,
    skills:['mind_crush','howl','soul_drain'], desc:'乱星海深渊中的人鱼妖物，歌声摄人心魄。' },
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
  { id:'kunwu_beast',name:'昆吾山魈',tier:4,region:'kunwu',hp:2500,atk:115,def:70,spd:45,
    skills:['slam','howl','shadow_strike','blood_frenzy'], desc:'昆吾山深处的山精，力大无穷。' },
  { id:'ancient_sword_spirit',name:'古剑之灵',tier:4,region:'kunwu',hp:1800,atk:140,def:45,spd:60,
    skills:['wind_slash','shadow_strike','thunder_strike','crystal_shell'], desc:'昆吾山古战场残剑灵气所化，剑意凌厉。' },
  { id:'immortal_corpse',name:'仙尸',tier:4,region:'dajin',hp:3500,atk:105,def:85,spd:30,
    skills:['regenerate','crystal_shell','earth_quake','death_curse'], desc:'上古陨落仙人的尸体傀儡。' },

  // ===== 六阶·灵界 =====
  // -- 冰封大陆（炼虚） --
  { id:'ice_titan',name:'冰霜泰坦',tier:5,region:'sp_ice',hp:5000,atk:250,def:160,spd:100,
    skills:['slam','ice_spear','crystal_shell','howl'], desc:'冰封大陆的远古守护者。' },
  { id:'snow_ape',name:'极地雪猿',tier:5,region:'sp_ice',hp:4200,atk:240,def:170,spd:85,
    skills:['slam','ice_spear','crystal_shell'], desc:'冰原上咆哮的巨猿，一拳可碎冰山。' },
  { id:'frost_wraith',name:'寒冰精魄',tier:5,region:'sp_ice',hp:3500,atk:230,def:120,spd:130,
    skills:['ice_spear','mind_crush','shadow_strike'], desc:'万年寒冰中凝结的灵体，触碰即冻。' },
  // -- 天渊城（炼虚） --
  { id:'abyss_beast',name:'天渊妖兽',tier:5,region:'sp_tianyuan',hp:4600,atk:260,def:150,spd:95,
    skills:['claw','shadow_strike','regenerate'], desc:'天渊城周边荒原上的掠食妖兽。' },
  { id:'guardian_golem',name:'城卫傀儡',tier:5,region:'sp_tianyuan',hp:5200,atk:220,def:200,spd:70,
    skills:['slam','crystal_shell','earth_quake'], desc:'天渊城的上古守城机关傀儡。' },
  { id:'void_bat',name:'深渊魔蝠',tier:5,region:'sp_tianyuan',hp:3800,atk:280,def:120,spd:115,
    skills:['soul_drain','shadow_strike','poison'], desc:'天渊裂隙中涌出的黑暗蝠群。' },
  // -- 木族领地（合体） --
  { id:'ancient_tree_spirit',name:'万年树精',tier:6,region:'sp_wood',hp:10500,atk:380,def:360,spd:120,
    skills:['regenerate','thorn_armor','crystal_shell','earth_quake'], desc:'木族圣地的万年古树化形，根须遮天。' },
  { id:'poison_flower',name:'毒花妖',tier:6,region:'sp_wood',hp:7500,atk:450,def:200,spd:180,
    skills:['poison','venom_bite','wind_slash'], desc:'色彩妖艳的巨型妖花，花粉致命。' },
  { id:'wood_spirit_king',name:'木灵王',tier:6,region:'sp_wood',hp:11500,atk:420,def:300,spd:155,
    skills:['regenerate','mind_crush','thorn_armor'], desc:'木族领地核心的木灵之王，统御万木。' },
  { id:'thorn_beast',name:'荆棘巨兽',tier:6,region:'sp_wood',hp:9800,atk:500,def:280,spd:140,
    skills:['thorn_armor','slam','blood_frenzy'], desc:'浑身覆盖荆棘的巨兽，越战越狂。' },
  // -- 血光圣殿（合体） --
  { id:'blood_demon',name:'血魔',tier:6,region:'sp_blood',hp:10000,atk:500,def:300,spd:180,
    skills:['soul_drain','blood_frenzy','poison','death_curse'], desc:'血光圣殿中诞生的血魔。' },
  { id:'blood_bat',name:'血翼蝠王',tier:6,region:'sp_blood',hp:8000,atk:480,def:240,spd:210,
    skills:['soul_drain','shadow_strike','blood_frenzy'], desc:'血域深渊的蝠群之王，以鲜血为食。' },
  { id:'blood_wraith',name:'血池亡魂',tier:6,region:'sp_blood',hp:7000,atk:520,def:180,spd:190,
    skills:['mind_crush','soul_drain','death_curse'], desc:'血池中万千亡魂凝聚的恐怖存在。' },
  // -- 雷鸣大陆（大乘） --
  { id:'thunder_beast',name:'雷兽',tier:7,region:'sp_thunder',hp:18000,atk:900,def:550,spd:300,
    skills:['thunder_strike','charge','claw','regenerate'], desc:'雷鸣大陆的雷属性凶兽。' },
  { id:'thunder_roc',name:'雷鹏',tier:7,region:'sp_thunder',hp:17000,atk:880,def:480,spd:360,
    skills:['thunder_strike','wind_slash','charge'], desc:'翼展遮天，每一次振翅都伴随雷霆万钧。' },
  { id:'thunder_spirit',name:'雷元精魄',tier:7,region:'sp_thunder',hp:15000,atk:980,def:420,spd:280,
    skills:['thunder_strike','crystal_shell','mind_crush'], desc:'万雷之中凝结的纯粹雷电灵体。' },
  // -- 飞灵族圣地（大乘） --
  { id:'spirit_dragon',name:'灵龙',tier:7,region:'sp_flying',hp:22000,atk:850,def:600,spd:350,
    skills:['fire_breath','wind_slash','regenerate','tail_swipe','thunder_strike'], desc:'飞灵族圣地的守护灵龙。' },
  { id:'flying_eagle',name:'飞灵战鹰',tier:7,region:'sp_flying',hp:19000,atk:820,def:520,spd:400,
    skills:['claw','wind_slash','shadow_strike','blood_frenzy'], desc:'飞灵族驯养的远古战鹰，俯冲一击可碎山岳。' },
  { id:'ancient_wyvern',name:'远古翼龙',tier:7,region:'sp_flying',hp:21000,atk:920,def:550,spd:320,
    skills:['fire_breath','tail_swipe','thunder_strike','regenerate'], desc:'飞灵族圣地深处的太古翼龙化石复生。' },

  // ===== 七阶·仙界 =====
  // -- 飞升台（真仙） --
  { id:'ascension_spirit',name:'飞升劫灵',tier:8,region:'im_ascend',hp:50000,atk:1600,def:1000,spd:550,
    skills:['thunder_strike','mind_crush','soul_drain'], desc:'仙界飞升台上凝聚的天劫灵体，专噬初入仙界者。' },
  { id:'gate_guardian',name:'仙门守卫',tier:8,region:'im_ascend',hp:58000,atk:1450,def:1250,spd:480,
    skills:['slam','fire_breath','crystal_shell'], desc:'仙界入口的守门仙卫，忠心耿耿。' },
  { id:'celestial_beast',name:'仙界妖兽',tier:8,region:'im_ascend',hp:44000,atk:1700,def:850,spd:620,
    skills:['claw','wind_slash','howl','death_curse'], desc:'仙界的原生妖兽，虽只是真仙境却凶悍异常。' },
  // -- 金阙仙宫（金仙） --
  { id:'golden_warrior',name:'金甲仙卫',tier:9,region:'im_golden',hp:150000,atk:4000,def:2500,spd:1000,
    skills:['slam','fire_breath','crystal_shell','blood_frenzy'], desc:'金阙仙宫的金甲守卫。' },
  { id:'golden_general',name:'金阙神将',tier:9,region:'im_golden',hp:170000,atk:4300,def:2700,spd:1100,
    skills:['slam','fire_breath','thunder_strike','blood_frenzy'], desc:'金阙仙宫的镇宫神将，一锤定乾坤。' },
  { id:'palace_beast',name:'仙宫侍兽',tier:9,region:'im_golden',hp:135000,atk:3900,def:2200,spd:1350,
    skills:['claw','shadow_strike','regenerate'], desc:'仙宫中豢养的仙兽，忠诚而凶猛。' },
  // -- 太乙道场（太乙） --
  { id:'star_beast',name:'星兽',tier:10,region:'im_taiyi',hp:350000,atk:8500,def:5500,spd:2000,
    skills:['mind_crush','regenerate','thunder_strike','earth_quake','death_curse'], desc:'星域中游荡的星际巨兽。' },
  { id:'taiyi_beast',name:'太乙仙兽',tier:10,region:'im_taiyi',hp:400000,atk:8200,def:6000,spd:2200,
    skills:['mind_crush','regenerate','crystal_shell','death_curse'], desc:'太乙道场中修行的仙兽，已通人言。' },
  { id:'void_walker',name:'虚空行者',tier:10,region:'im_taiyi',hp:330000,atk:9200,def:5000,spd:2500,
    skills:['shadow_strike','soul_drain','blood_frenzy','ice_spear'], desc:'道场虚空间穿梭的远古行者。' },
  // -- 大罗天域（大罗） --
  { id:'chaos_lord',name:'混沌之主',tier:11,region:'im_daluo',hp:900000,atk:18000,def:12000,spd:4000,
    skills:['soul_drain','blood_frenzy','ice_spear','fire_breath','shadow_strike','regenerate'], desc:'混沌海中诞生的无上存在。' },
  { id:'daluo_shadow',name:'大罗仙尊残影',tier:11,region:'im_daluo',hp:980000,atk:19500,def:12800,spd:4300,
    skills:['thunder_strike','mind_crush','crystal_shell','regenerate','death_curse'], desc:'陨落的大罗仙尊残留的战斗意志。' },
  { id:'buzhou_god',name:'不周山神',tier:11,region:'im_daluo',hp:1050000,atk:17500,def:14500,spd:3500,
    skills:['earth_quake','slam','crystal_shell','thorn_armor','regenerate'], desc:'大罗天域边界不周山的山岳神灵。' },
  // -- 道祖圣境（道祖） --
  { id:'dao_guardian',name:'道之守护者',tier:12,region:'im_daozu',hp:2500000,atk:45000,def:26000,spd:8000,
    skills:['thunder_strike','earth_quake','crystal_shell','regenerate','death_curse','blood_frenzy'], desc:'守护天道祭坛的终极存在。' },
  { id:'dao_avatar',name:'天道化身',tier:12,region:'im_daozu',hp:2900000,atk:49000,def:27500,spd:8800,
    skills:['mind_crush','thunder_strike','crystal_shell','blood_frenzy','regenerate'], desc:'天道法则的具象化身，一念万物生灭。' },
  { id:'return_void_lord',name:'归墟之主',tier:12,region:'im_daozu',hp:3100000,atk:43000,def:29000,spd:7500,
    skills:['soul_drain','shadow_strike','earth_quake','death_curse','ice_spear'], desc:'万物归墟的掌控者，诸天万界的终结。' },
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
  let enemy;
  if (pool.length === 0) {
    // fallback: generic enemy from tier
    const region = getCurrentMap().data.regions.find(r => r.id === regionId);
    if (region) {
      const tierIdx = REALMS.findIndex(r => r.name === region.realmRequired);
      const tier = ENEMY_TIERS[Math.max(0, tierIdx)] || ENEMY_TIERS[0];
      enemy = {
        id: 'generic', name: '妖兽', tier: Math.max(0, tierIdx),
        hp: tier.hpBase, atk: tier.atkMin, def: tier.defMin, spd: tier.spdMin,
        skills: ['bite'], desc: '未知妖兽', generic: true,
      };
    } else {
      enemy = ENEMIES[0];
    }
  } else {
    enemy = pool[Math.floor(Math.random() * pool.length)];
  }

  // 阶段抽取
  const phaseRoll = Math.random() * 100;
  let phaseIdx = 0, cumulative = 0;
  for (let i = 0; i < ENEMY_PHASES.length; i++) {
    cumulative += ENEMY_PHASES[i].rate;
    if (phaseRoll < cumulative) { phaseIdx = i; break; }
  }
  const phase = ENEMY_PHASES[phaseIdx];

  // 应用阶段倍率
  const p = phase;
  const boosted = { ...enemy,
    phase: phaseIdx,
    name: enemy.name + p.name,
    hp: Math.floor(enemy.hp * p.hpMult),
    atk: Math.floor(enemy.atk * p.atkMult),
    def: Math.floor(enemy.def * p.defMult),
    spd: Math.floor(enemy.spd * p.spdMult),
    _rewardMult: p.rewardMult,
    _cultMult: p.cultMult,
    skills: p.skillBonus > 0
      ? enemy.skills.concat(ALL_SKILL_KEYS.filter(k => !enemy.skills.includes(k)).slice(0, p.skillBonus))
      : [...enemy.skills],
  };
  // 确保技能不超过4个（随机取p.skillBonus个额外技能）
  const baseSkills = enemy.skills.length;
  const extraSkills = ALL_SKILL_KEYS.filter(k => !enemy.skills.includes(k)).sort(()=>Math.random()-0.5).slice(0, p.skillBonus);
  boosted.skills = [...enemy.skills, ...extraSkills];
  return boosted;
}

// 所有技能键名列表（用于阶段额外技能随机）
const ALL_SKILL_KEYS = Object.keys(ENEMY_SKILLS);

function getPlayerCombatStats() {
  const s = GameState;
  const bonus = getSkillAttrBonus();
  const realm = getRealmData(s.realm, s.plane);
  const hpBonus = [0,100,300,600,1000,2000,2000,2000,5000,5000,5000,5000,5000][REALMS.findIndex(r=>r.name===s.realm&&r.plane===s.plane)]||0;
  return {
    hp: 100 + (getEffectiveVit() + (bonus.vit||0))*15 + (s.def + (bonus.def||0))*5 + hpBonus,
    maxHp: 100 + (getEffectiveVit() + (bonus.vit||0))*15 + (s.def + (bonus.def||0))*5 + hpBonus,
    atk: s.atk + (bonus.atk||0),
    def: s.def + (bonus.def||0),
    spd: s.spd + (bonus.spd||0),
    wis: getEffectiveWis() + (bonus.wis||0),
  };
}
