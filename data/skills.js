// ==========================================
//  data/skills.js — 功法系统 (14主修 + 63辅修) + 灵根系统
// ==========================================

const QUALITY_MAP = { common: '凡品', uncommon: '灵品', rare: '地品', epic: '天品', legendary: '仙品' };
const QUALITY_COLOR = { common: '#aaa', uncommon: '#4a8fcf', rare: '#b066ff', epic: '#c9a96e', legendary: '#c0392b' };
const QUALITY_MAXLV = { common: 5, uncommon: 6, rare: 7, epic: 9, legendary: 12 };
const QUALITY_MULT = { common: 1.0, uncommon: 1.5, rare: 2.0, epic: 3.0, legendary: 5.0 };

const ELEMENTS = ['金','木','水','火','土','雷','冰','风'];
const ELEMENT_ATTR = { 金:'atk', 火:'atk', 雷:'spd', 木:'spi', 水:'wis', 土:'def', 冰:'def', 风:'spd' };
const ELEMENT_COLOR = { 金:'#e8c84a', 木:'#5b8c5a', 水:'#4a8fcf', 火:'#c0392b', 土:'#ba7517', 雷:'#b066ff', 冰:'#7ec8e3', 风:'#9fd5b3' };

// ===== 主修心法 =====
const MAIN_SKILLS = [
  { id:'qingyuan',name:'青元功',quality:'common',region:'yue_huangfeng',category:'balanced',daysPerLv:30, element:'木',
    growth:{atk:1,def:1,spd:1,wis:1,vit:1,spi:1}, effect:null },
  { id:'panshi',name:'磐石功',quality:'common',region:'yuanwu',category:'balanced',daysPerLv:30, element:'土',
    growth:{atk:1,def:2,spd:0,wis:1,vit:2,spi:0}, effect:null },
  { id:'liushui',name:'流水诀',quality:'common',region:'starsea',category:'balanced',daysPerLv:28, element:'水',
    growth:{atk:1,def:1,spd:2,wis:1,vit:0,spi:1}, effect:null },
  { id:'hunyuan',name:'混元功',quality:'common',region:'yue_huangfeng',category:'balanced',daysPerLv:32, element:'金',
    growth:{atk:2,def:0,spd:1,wis:1,vit:1,spi:1}, effect:'wild', source:'散修传承·探索掉落' },
  { id:'yuehua',name:'月华心经',quality:'uncommon',region:'yue_yanmoon',category:'wis',daysPerLv:35, element:'水',
    growth:{atk:0,def:0,spd:1,wis:2,vit:1,spi:2}, effect:'breakthrough', effectVal:0.03 },
  { id:'qingxu',name:'清虚诀',quality:'uncommon',region:'yue_qingxu',category:'spi',daysPerLv:35, element:'木',
    growth:{atk:1,def:0,spd:1,wis:1,vit:1,spi:2}, effect:'cultivation', effectVal:0.10 },
  { id:'giant_sword',name:'巨剑诀',quality:'uncommon',region:'yue_giant',category:'atk',daysPerLv:35, element:'金',
    growth:{atk:3,def:2,spd:0,wis:0,vit:1,spi:0}, effect:'fight', effectVal:0.05 },
  { id:'tianque',name:'天阙心法',quality:'uncommon',region:'yue_skyhold',category:'vit',daysPerLv:35, element:'土',
    growth:{atk:1,def:2,spd:0,wis:0,vit:3,spi:0}, effect:null },
  { id:'beast_heart',name:'灵兽诀',quality:'uncommon',region:'yue_beast',category:'spd',daysPerLv:33, element:'风',
    growth:{atk:1,def:1,spd:3,wis:1,vit:0,spi:0}, effect:'explore', effectVal:0.05 },
  { id:'blade_heart',name:'化刀心经',quality:'uncommon',region:'yue_blade',category:'atk',daysPerLv:35, element:'金',
    growth:{atk:4,def:0,spd:2,wis:0,vit:0,spi:0}, effect:'fight', effectVal:0.08 },
  { id:'nether_sutra',name:'幽冥经',quality:'rare',region:'west',category:'spi',daysPerLv:40, element:'水',
    growth:{atk:1,def:0,spd:1,wis:2,vit:0,spi:4}, effect:'cultivation', effectVal:0.12 },
  { id:'blood_dharma',name:'血炼大法',quality:'rare',region:'west',category:'atk',daysPerLv:38, element:'火',
    growth:{atk:5,def:0,spd:1,wis:0,vit:1,spi:1}, effect:'fight', effectVal:0.10, penalty:0.01 },
  { id:'vajra_heart',name:'金刚心法',quality:'rare',region:'west',category:'def',daysPerLv:40, element:'土',
    growth:{atk:1,def:4,spd:0,wis:1,vit:2,spi:0}, effect:null },
  { id:'yuling_sutra',name:'御灵真解',quality:'rare',region:'west',category:'wis',daysPerLv:38, element:'木',
    growth:{atk:1,def:1,spd:1,wis:4,vit:0,spi:1}, effect:'explore', effectVal:0.08 },
  { id:'taiyi_true',name:'太一真解',quality:'epic',region:'dajin',category:'balanced',daysPerLv:45, element:'金',
    growth:{atk:2,def:2,spd:2,wis:2,vit:2,spi:2}, effect:'breakthrough', effectVal:0.05 },
  { id:'demon_lord',name:'魔元功',quality:'epic',region:'dajin',category:'atk',daysPerLv:42, element:'火',
    growth:{atk:4,def:4,spd:1,wis:0,vit:2,spi:0}, effect:'fight', effectVal:0.12 },
  { id:'kunwu_remnant',name:'昆吾残卷',quality:'legendary',region:'kunwu',category:'balanced',daysPerLv:50, element:'雷',
    growth:{atk:3,def:3,spd:3,wis:3,vit:3,spi:3}, effect:'all', effectVal:0.10 },
  { id:'samsara_sutra',name:'轮回经',quality:'legendary',region:'dajin',category:'wis',daysPerLv:48, element:'冰',
    growth:{atk:2,def:2,spd:2,wis:8,vit:2,spi:3}, effect:'destiny', effectVal:1 },
];

// ===== 辅修功法 =====
const SUB_SKILLS = [
  // ===== 攻击 (12) =====
  { id:'fire_palm',name:'火云掌',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'火',bonus:{atk:3},region:'yue_giant',source:'巨剑门藏经阁' },
  { id:'ice_finger',name:'寒冰指',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'冰',bonus:{atk:3},region:'yue_skyhold',source:'天阙堡藏经阁' },
  { id:'wind_blade',name:'风刃术',quality:'common',category:'atk',maxLv:5,daysPerLv:18,element:'风',bonus:{atk:2,spd:1},region:'yue_qingxu',source:'清虚门藏经阁' },
  { id:'stone_fist',name:'碎石拳',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'土',bonus:{atk:3},region:'yue_huangfeng',source:'黄枫谷后山·掉落',isDrop:true },
  { id:'flame_slash',name:'烈焰斩',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'火',bonus:{atk:5},region:'west',source:'鬼灵门任务' },
  { id:'armor_pierce',name:'破甲刺',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:22,element:'金',bonus:{atk:4},region:'starsea',source:'乱星海·外星海掉落',isDrop:true,effect:'penetrate' },
  { id:'thousand_blade',name:'千影剑',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'金',bonus:{atk:5},region:'yue_blade',source:'化刀坞·金丹解锁',realmReq:'金丹' },
  { id:'burn_heaven',name:'焚天诀',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'火',bonus:{atk:6},region:'tiannan',source:'妖兽山脉掉落',isDrop:true,effect:'crit',effectVal:0.03 },
  { id:'blood_sword',name:'血杀剑',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'火',bonus:{atk:6},region:'dajin',source:'正魔战场掉落',isDrop:true,effect:'lifesteal',effectVal:0.02 },
  { id:'nether_slash',name:'幽冥斩',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'水',bonus:{atk:6,wis:1},region:'dajin',source:'魔道六宗' },
  { id:'ten_thousand_sword',name:'万剑归宗',quality:'epic',category:'atk',maxLv:9,daysPerLv:32,element:'金',bonus:{atk:8},region:'kunwu',source:'三地组合解锁',isCombo:true },
  { id:'sword_immortal',name:'诛仙剑意',quality:'legendary',category:'atk',maxLv:12,daysPerLv:40,element:'雷',bonus:{atk:12},region:'kunwu',source:'渡劫奇遇+昆吾山',effect:'doubleCult',isUnique:true },

  // ===== 防御 (10) =====
  { id:'ice_shield',name:'冰魄盾',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'冰',bonus:{def:3},region:'yue_skyhold',source:'天阙堡' },
  { id:'iron_cloth',name:'铁布衫',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'土',bonus:{def:2,vit:1},region:'yuanwu',source:'元武国功法阁' },
  { id:'golden_bell',name:'金钟罩',quality:'common',category:'def',maxLv:5,daysPerLv:22,element:'金',bonus:{def:3},region:'dajin',source:'万宝楼' },
  { id:'spirit_shield',name:'灵光盾',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'水',bonus:{def:3},region:'starsea',source:'魁星岛坊市' },
  { id:'tortoise_armor',name:'玄武甲',quality:'uncommon',category:'def',maxLv:6,daysPerLv:25,element:'土',bonus:{def:5},region:'west',source:'千竹教' },
  { id:'indestructible',name:'不灭金身',quality:'uncommon',category:'def',maxLv:6,daysPerLv:25,element:'土',bonus:{def:5},region:'yue_qingxu',source:'清虚门',effect:'lifespan',effectVal:0.03 },
  { id:'rock_body',name:'磐石体',quality:'uncommon',category:'def',maxLv:6,daysPerLv:24,element:'土',bonus:{def:5},region:'starsea',source:'虚天殿入口' },
  { id:'celestial_guard',name:'天罡护体',quality:'rare',category:'def',maxLv:7,daysPerLv:30,element:'金',bonus:{def:7},region:'starsea',source:'虚天殿海域',isDrop:true },
  { id:'diamond_body',name:'金刚不坏',quality:'rare',category:'def',maxLv:7,daysPerLv:30,element:'土',bonus:{def:8,vit:2},region:'kunwu',source:'昆吾山外围' },
  { id:'taiyi_guard',name:'太一护法',quality:'epic',category:'def',maxLv:9,daysPerLv:35,element:'金',bonus:{def:10},region:'dajin',source:'太一门',effect:'tribulation_shield',effectVal:1 },

  // ===== 速度 (8) =====
  { id:'gale_step',name:'疾风步',quality:'common',category:'spd',maxLv:5,daysPerLv:18,element:'风',bonus:{spd:3},region:'yue_huangfeng',source:'黄枫谷' },
  { id:'shadow_hide',name:'影遁术',quality:'common',category:'spd',maxLv:5,daysPerLv:18,element:'水',bonus:{spd:3},region:'west',source:'鬼灵门' },
  { id:'water_walk',name:'水上漂',quality:'common',category:'spd',maxLv:5,daysPerLv:16,element:'水',bonus:{spd:2},region:'yue_qingxu',source:'清虚门',effect:'exploreEff',effectVal:0.02 },
  { id:'thunder_step',name:'风雷步',quality:'uncommon',category:'spd',maxLv:6,daysPerLv:22,element:'雷',bonus:{spd:5},region:'yue_beast',source:'灵兽山' },
  { id:'flash_step',name:'瞬身术',quality:'uncommon',category:'spd',maxLv:6,daysPerLv:22,element:'风',bonus:{spd:5},region:'starsea',source:'妙音门' },
  { id:'phantom_step',name:'幻影步',quality:'uncommon',category:'spd',maxLv:6,daysPerLv:20,element:'风',bonus:{spd:4},region:'dajin',source:'正魔战场掉落',isDrop:true,effect:'initiative',effectVal:0.05 },
  { id:'void_step',name:'破虚步',quality:'rare',category:'spd',maxLv:7,daysPerLv:26,element:'风',bonus:{spd:6},region:'dajin',source:'虚天殿',isDrop:true,effect:'extraSlot' },
  { id:'shrink_earth',name:'缩地成寸',quality:'epic',category:'spd',maxLv:9,daysPerLv:30,element:'土',bonus:{spd:9},region:'kunwu',source:'昆吾山秘境' },

  // ===== 神识 (9) =====
  { id:'mind_art',name:'神识术',quality:'common',category:'wis',maxLv:5,daysPerLv:22,element:'木',bonus:{wis:3},region:'yue_yanmoon',source:'掩月宗' },
  { id:'mind_read',name:'读心术',quality:'common',category:'wis',maxLv:5,daysPerLv:22,element:'水',bonus:{wis:3},region:'yuanwu',source:'元武国黑市' },
  { id:'meditation',name:'冥想心法',quality:'common',category:'wis',maxLv:5,daysPerLv:20,element:'木',bonus:{wis:3},region:'starsea',source:'魁星岛·静室' },
  { id:'spirit_eye',name:'灵瞳诀',quality:'uncommon',category:'wis',maxLv:6,daysPerLv:25,element:'木',bonus:{wis:5},region:'west',source:'御灵宗' },
  { id:'soul_control',name:'御魂术',quality:'uncommon',category:'wis',maxLv:6,daysPerLv:25,element:'水',bonus:{wis:5},region:'west',source:'鬼灵门' },
  { id:'illusion_heart',name:'幻心术',quality:'uncommon',category:'wis',maxLv:6,daysPerLv:24,element:'冰',bonus:{wis:5},region:'yue_yanmoon',source:'掩月宗·禁地' },
  { id:'heaven_eye',name:'天眼通',quality:'rare',category:'wis',maxLv:7,daysPerLv:30,element:'雷',bonus:{wis:7},region:'dajin',source:'天台山',effect:'secretFind',effectVal:0.05 },
  { id:'grand_derive',name:'大衍诀',quality:'epic',category:'wis',maxLv:9,daysPerLv:35,element:'木',bonus:{wis:9},region:'tiannan',source:'幕兰草原奇遇',effect:'breakthrough',effectVal:0.05 },
  { id:'samsara_eye',name:'轮回眼',quality:'legendary',category:'wis',maxLv:12,daysPerLv:40,element:'冰',bonus:{wis:12},region:'dajin',source:'大能转世命定',effect:'fullMap',isUnique:true },

  // ===== 体魄 (7) =====
  { id:'iron_bone',name:'铁骨功',quality:'common',category:'vit',maxLv:5,daysPerLv:22,element:'土',bonus:{vit:3},region:'yue_skyhold',source:'天阙堡' },
  { id:'bear_strength',name:'熊罴劲',quality:'common',category:'vit',maxLv:5,daysPerLv:22,element:'土',bonus:{vit:3},region:'yue_beast',source:'灵兽山' },
  { id:'body_temper',name:'淬体术',quality:'common',category:'vit',maxLv:5,daysPerLv:20,element:'火',bonus:{vit:3},region:'yuanwu',source:'元武国角斗场' },
  { id:'gold_jade_body',name:'金肌玉骨',quality:'uncommon',category:'vit',maxLv:6,daysPerLv:25,element:'金',bonus:{vit:5},region:'tiannan',source:'妖兽山脉深处',isDrop:true },
  { id:'immortal_body',name:'不坏金身',quality:'uncommon',category:'vit',maxLv:6,daysPerLv:25,element:'土',bonus:{vit:5},region:'yuanwu',source:'角斗场连胜' },
  { id:'blood_rebirth',name:'滴血重生',quality:'rare',category:'vit',maxLv:7,daysPerLv:30,element:'水',bonus:{vit:7},region:'west',source:'血炼渊',effect:'deathResist',effectVal:0.03 },
  { id:'nine_sun_body',name:'九阳炼体',quality:'epic',category:'vit',maxLv:9,daysPerLv:35,element:'火',bonus:{vit:10},region:'dajin',source:'战场深处',isDrop:true,effect:'lifespanBig',effectVal:50 },

  // ===== 灵力 (8) =====
  { id:'condense_yuan',name:'凝元功',quality:'common',category:'spi',maxLv:5,daysPerLv:20,element:'木',bonus:{spi:3},region:'yue_huangfeng',source:'黄枫谷' },
  { id:'gather_qi',name:'聚灵术',quality:'common',category:'spi',maxLv:5,daysPerLv:20,element:'木',bonus:{spi:3},region:'yue_qingxu',source:'清虚门' },
  { id:'spirit_spring',name:'灵泉引',quality:'common',category:'spi',maxLv:5,daysPerLv:18,element:'水',bonus:{spi:2},region:'yue_yanmoon',source:'掩月宗·药园',effect:'cultivation',effectVal:0.03 },
  { id:'qi_gather',name:'采气诀',quality:'uncommon',category:'spi',maxLv:6,daysPerLv:24,element:'金',bonus:{spi:5},region:'starsea',source:'魁星岛' },
  { id:'star_art',name:'星辰诀',quality:'uncommon',category:'spi',maxLv:6,daysPerLv:24,element:'金',bonus:{spi:5},region:'west',source:'天煞宗' },
  { id:'thunder_draw',name:'天雷引',quality:'rare',category:'spi',maxLv:7,daysPerLv:28,element:'雷',bonus:{spi:7},region:'dajin',source:'天台山',effect:'tribulation',effectVal:0.03 },
  { id:'chaos_draw',name:'混沌引',quality:'epic',category:'spi',maxLv:9,daysPerLv:32,element:'雷',bonus:{spi:9},region:'kunwu',source:'昆吾山深处',effect:'cultivation',effectVal:0.10 },
  { id:'void_prime',name:'太虚元气',quality:'legendary',category:'spi',maxLv:12,daysPerLv:40,element:'水',bonus:{spi:15},region:'kunwu',source:'道祖命定',isUnique:true },

  // ===== 特殊 (9) =====
  { id:'herb_mastery',name:'炼药术',quality:'common',category:'special',maxLv:5,daysPerLv:18,element:'木',bonus:{},region:'starsea',source:'魁星岛坊市',effect:'herbFind',effectVal:0.10 },
  { id:'forge_mastery',name:'炼器术',quality:'common',category:'special',maxLv:5,daysPerLv:18,element:'金',bonus:{},region:'yuanwu',source:'元武国功法阁',effect:'equipFind',effectVal:0.10 },
  { id:'spirit_gather',name:'采灵术',quality:'common',category:'special',maxLv:5,daysPerLv:18,element:'木',bonus:{},region:'yue_huangfeng',source:'后山奇遇',effect:'stoneGain',effectVal:0.08 },
  { id:'beast_pact',name:'妖兽契约',quality:'uncommon',category:'special',maxLv:6,daysPerLv:22,element:'木',bonus:{},region:'yue_beast',source:'灵兽山·万兽谷',effect:'capture',effectVal:0.15 },
  { id:'hide_art',name:'隐匿术',quality:'uncommon',category:'special',maxLv:6,daysPerLv:20,element:'水',bonus:{},region:'west',source:'鬼灵门',effect:'dangerDown',effectVal:0.05 },
  { id:'talisman_art',name:'符箓术',quality:'uncommon',category:'special',maxLv:6,daysPerLv:22,element:'火',bonus:{},region:'dajin',source:'万宝楼',effect:'fightDmg',effectVal:0.05 },
  { id:'life_death_note',name:'生死符',quality:'rare',category:'special',maxLv:7,daysPerLv:26,element:'冰',bonus:{},region:'west',source:'血炼渊',effect:'instantKill',effectVal:0.03 },
  { id:'heaven_snatch',name:'夺天术',quality:'epic',category:'special',maxLv:9,daysPerLv:30,element:'雷',bonus:{},region:'dajin',source:'万宝楼',effect:'critCult',effectVal:0.05,subEffect:'cultivation',subEffectVal:0.05 },
  { id:'swallow_heaven',name:'吞天功',quality:'epic',category:'special',maxLv:9,daysPerLv:32,element:'火',bonus:{atk:1,def:1,spd:1,wis:1,vit:1,spi:1},region:'starsea',source:'虚天殿1%掉落',isUnique:true,isDrop:true,effect:'doubleLoot',effectVal:0.03 },

  // ===== 额外功法 (补齐每元素15部) =====
  // 金 +5
  { id:'gold_needle',name:'金针术',quality:'common',category:'atk',maxLv:5,daysPerLv:18,element:'金',bonus:{atk:3},region:'yue_huangfeng',source:'黄枫谷·藏经阁' },
  { id:'iron_wing',name:'铁翼斩',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:22,element:'金',bonus:{atk:5},region:'yuanwu',source:'元武国·功法阁' },
  { id:'diamond_fist',name:'金刚拳',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'金',bonus:{atk:3},region:'yue_giant',source:'巨剑门·试剑台' },
  { id:'gold_armor',name:'金甲术',quality:'uncommon',category:'def',maxLv:6,daysPerLv:24,element:'金',bonus:{def:5},region:'dajin',source:'太一门' },
  { id:'spear_rain',name:'枪雨诀',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:22,element:'金',bonus:{atk:4,spd:1},region:'yuanwu',source:'元武国·角斗场' },

  // 木 +5
  { id:'vine_bind',name:'藤缚术',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'木',bonus:{atk:2,wis:1},region:'yue_huangfeng',source:'黄枫谷·后山' },
  { id:'wood_armor',name:'木甲术',quality:'common',category:'def',maxLv:5,daysPerLv:18,element:'木',bonus:{def:3},region:'yue_yanmoon',source:'掩月宗·药园' },
  { id:'thorn_whip',name:'荆棘鞭',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'木',bonus:{atk:5},region:'tiannan',source:'幕兰草原' },
  { id:'bloom_heal',name:'花开愈',quality:'uncommon',category:'def',maxLv:6,daysPerLv:22,element:'木',bonus:{def:3,wis:2},region:'sp_wood',source:'木族圣地' },
  { id:'forest_song',name:'万木颂',quality:'uncommon',category:'spi',maxLv:6,daysPerLv:22,element:'木',bonus:{spi:5},region:'sp_wood',source:'神木林·灵界' },

  // 水 +6
  { id:'water_wall',name:'水壁术',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'水',bonus:{def:3},region:'starsea',source:'魁星岛' },
  { id:'mist_veil',name:'雾隐术',quality:'common',category:'spd',maxLv:5,daysPerLv:18,element:'水',bonus:{spd:3},region:'starsea',source:'乱星海外海' },
  { id:'wave_crash',name:'浪涛击',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'水',bonus:{atk:5},region:'starsea',source:'虚天殿海域' },
  { id:'spring_pulse',name:'泉涌诀',quality:'uncommon',category:'spi',maxLv:6,daysPerLv:22,element:'水',bonus:{spi:5},region:'sp_ice',source:'冰灵宗' },
  { id:'deep_chill',name:'深寒术',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:22,element:'水',bonus:{atk:5},region:'sp_ice',source:'冰封大陆' },
  { id:'tide_bless',name:'潮汐赐福',quality:'uncommon',category:'spi',maxLv:6,daysPerLv:24,element:'水',bonus:{spi:5},region:'starsea',source:'妙音门' },

  // 火 +7
  { id:'spark_shot',name:'星火弹',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'火',bonus:{atk:3},region:'yue_huangfeng',source:'黄枫谷·炼丹房' },
  { id:'blaze_wall',name:'火墙术',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'火',bonus:{def:3},region:'west',source:'天煞宗' },
  { id:'meteor_rain',name:'流星火雨',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'火',bonus:{atk:5},region:'dajin',source:'正魔战场掉落',isDrop:true },
  { id:'phoenix_wing',name:'凤翼斩',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:22,element:'火',bonus:{atk:5},region:'dajin',source:'太一门' },
  { id:'lava_body',name:'熔岩体',quality:'uncommon',category:'vit',maxLv:6,daysPerLv:24,element:'火',bonus:{vit:5},region:'west',source:'千竹教' },
  { id:'inferno_blade',name:'地狱火刃',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'火',bonus:{atk:7},region:'sp_blood',source:'血光圣殿·灵界',isDrop:true },
  { id:'sun_essence',name:'太阳真火',quality:'epic',category:'atk',maxLv:9,daysPerLv:30,element:'火',bonus:{atk:9},region:'im_golden',source:'金阙仙宫·仙界' },

  // 土 +5
  { id:'rock_shell',name:'岩壳术',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'土',bonus:{def:3},region:'yue_skyhold',source:'天阙堡' },
  { id:'sand_blast',name:'飞沙走石',quality:'common',category:'atk',maxLv:5,daysPerLv:18,element:'土',bonus:{atk:2,spd:1},region:'yuanwu',source:'元武国' },
  { id:'mountain_grip',name:'山岳擒拿',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'土',bonus:{atk:5},region:'dajin',source:'正魔战场' },
  { id:'bunker',name:'地堡术',quality:'uncommon',category:'def',maxLv:6,daysPerLv:22,element:'土',bonus:{def:6},region:'tiannan',source:'九国盟' },
  { id:'quicksand',name:'流沙陷',quality:'uncommon',category:'spd',maxLv:6,daysPerLv:20,element:'土',bonus:{spd:5},region:'tiannan',source:'妖兽山脉·掉落',isDrop:true },

  // 雷 +10
  { id:'lightning_bolt',name:'雷电术',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'雷',bonus:{atk:3},region:'yue_huangfeng',source:'黄枫谷·后山掉落',isDrop:true },
  { id:'spark_step',name:'电光步',quality:'common',category:'spd',maxLv:5,daysPerLv:18,element:'雷',bonus:{spd:3},region:'yue_beast',source:'灵兽山' },
  { id:'thunder_shield',name:'雷电盾',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'雷',bonus:{def:3},region:'west',source:'千竹教' },
  { id:'storm_fury',name:'雷霆之怒',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'雷',bonus:{atk:5},region:'dajin',source:'天台山' },
  { id:'chain_lightning',name:'连锁闪电',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:22,element:'雷',bonus:{atk:5},region:'tiannan',source:'幕兰草原·掉落',isDrop:true },
  { id:'thunder_blood',name:'雷血淬炼',quality:'uncommon',category:'vit',maxLv:6,daysPerLv:24,element:'雷',bonus:{vit:5},region:'sp_thunder',source:'雷灵宗' },
  { id:'storm_eye',name:'风暴之眼',quality:'rare',category:'wis',maxLv:7,daysPerLv:28,element:'雷',bonus:{wis:6,spi:1},region:'sp_thunder',source:'雷鸣峡谷·灵界' },
  { id:'sky_judgment',name:'天罚',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'雷',bonus:{atk:8},region:'im_taiyi',source:'太乙道场·仙界' },
  { id:'thunder_domain',name:'雷域',quality:'epic',category:'atk',maxLv:9,daysPerLv:30,element:'雷',bonus:{atk:10},region:'im_daluo',source:'大罗天域·仙界' },
  { id:'void_lightning',name:'虚空雷劫',quality:'legendary',category:'atk',maxLv:12,daysPerLv:36,element:'雷',bonus:{atk:14},region:'im_daozu',source:'道祖圣境',isUnique:true },

  // 冰 +10
  { id:'frost_armor',name:'冰霜甲',quality:'common',category:'def',maxLv:5,daysPerLv:20,element:'冰',bonus:{def:3},region:'yue_yanmoon',source:'掩月宗' },
  { id:'hail_storm',name:'冰雹术',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'冰',bonus:{atk:3},region:'yue_skyhold',source:'天阙堡·掉落',isDrop:true },
  { id:'freeze_slash',name:'冰刃斩',quality:'common',category:'atk',maxLv:5,daysPerLv:18,element:'冰',bonus:{atk:2,spd:1},region:'west',source:'鬼灵门' },
  { id:'blizzard',name:'暴风雪',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'冰',bonus:{atk:5},region:'sp_ice',source:'冰封大陆' },
  { id:'permafrost',name:'永冻领域',quality:'uncommon',category:'def',maxLv:6,daysPerLv:22,element:'冰',bonus:{def:5},region:'sp_ice',source:'冰灵宗' },
  { id:'ice_pulse',name:'寒冰脉动',quality:'uncommon',category:'spi',maxLv:6,daysPerLv:24,element:'冰',bonus:{spi:5},region:'sp_ice',source:'冰原掉落',isDrop:true },
  { id:'frozen_soul',name:'冰封灵魂',quality:'rare',category:'wis',maxLv:7,daysPerLv:28,element:'冰',bonus:{wis:7},region:'sp_blood',source:'血光圣殿·禁地' },
  { id:'absolute_zero',name:'绝对零度',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'冰',bonus:{atk:8},region:'im_golden',source:'金阙仙宫·掉落',isDrop:true },
  { id:'glacial_dragon',name:'冰龙咆哮',quality:'epic',category:'atk',maxLv:9,daysPerLv:30,element:'冰',bonus:{atk:10},region:'im_taiyi',source:'太乙道场' },
  { id:'eternal_winter',name:'永冬',quality:'legendary',category:'atk',maxLv:12,daysPerLv:36,element:'冰',bonus:{atk:14},region:'im_daluo',source:'大罗天域·混沌海',isUnique:true },

  // 风 +10
  { id:'gust_claw',name:'疾风爪',quality:'common',category:'atk',maxLv:5,daysPerLv:20,element:'风',bonus:{atk:3},region:'yue_beast',source:'灵兽山·掉落',isDrop:true },
  { id:'wind_barrier',name:'风之障壁',quality:'common',category:'def',maxLv:5,daysPerLv:18,element:'风',bonus:{def:2,spd:1},region:'yue_qingxu',source:'清虚门' },
  { id:'whirlwind',name:'旋风术',quality:'common',category:'spd',maxLv:5,daysPerLv:18,element:'风',bonus:{spd:3},region:'yue_huangfeng',source:'黄枫谷' },
  { id:'feather_fall',name:'羽落术',quality:'uncommon',category:'spd',maxLv:6,daysPerLv:22,element:'风',bonus:{spd:5},region:'starsea',source:'魁星岛' },
  { id:'sky_dance',name:'天舞步',quality:'uncommon',category:'spd',maxLv:6,daysPerLv:20,element:'风',bonus:{spd:4,wis:1},region:'tiannan',source:'幕兰草原' },
  { id:'hurricane',name:'飓风斩',quality:'uncommon',category:'atk',maxLv:6,daysPerLv:24,element:'风',bonus:{atk:5},region:'dajin',source:'正魔战场' },
  { id:'wind_walk',name:'风行者',quality:'rare',category:'spd',maxLv:7,daysPerLv:26,element:'风',bonus:{spd:8},region:'sp_flying',source:'飞灵族圣地' },
  { id:'typhoon_fist',name:'台风拳',quality:'rare',category:'atk',maxLv:7,daysPerLv:28,element:'风',bonus:{atk:7},region:'sp_flying',source:'飞灵族·掉落',isDrop:true },
  { id:'sky_rend',name:'裂空斩',quality:'epic',category:'atk',maxLv:9,daysPerLv:30,element:'风',bonus:{atk:10},region:'im_taiyi',source:'星域·仙界' },
  { id:'void_gale',name:'虚空风暴',quality:'legendary',category:'spd',maxLv:12,daysPerLv:36,element:'风',bonus:{spd:14},region:'im_daluo',source:'混沌海·仙界',isUnique:true },
];

// ===== 灵根系统 =====

const SPIRIT_ROOTS = [
  { id:'mixed5',name:'伪灵根',elements:4,eff:0.70,weight:32,bonusSlots:2, desc:'金木水火土'},
  { id:'triple',name:'三灵根',elements:3,eff:0.85,weight:28, desc:''},
  { id:'double',name:'双灵根',elements:2,eff:1.00,weight:20,desc:'',bonusLv:2 },
  { id:'single',name:'单灵根',elements:1,eff:1.25,weight:12,desc:'',doubleEff:true },
  { id:'heavenly',name:'天灵根',elements:1,eff:1.80,weight:5,desc:'',breakthroughBonus:0.10,doubleEff:true },
  { id:'variant',name:'异灵根',elements:1,eff:1.50,weight:3,desc:'',variantOnly:true,doubleEff:true },
];

function rollSpiritRoot() {
  const pool = []; SPIRIT_ROOTS.forEach(r => { for(let i=0;i<r.weight;i++) pool.push(r); });
  const root = pool[Math.floor(Math.random()*pool.length)];
  let elements = [];
  if (root.elements === 1) {
    if (root.variantOnly) {
      elements = [['雷','冰','风'][Math.floor(Math.random()*3)]];
    } else {
      elements = [ELEMENTS[Math.floor(Math.random()*5)]];
    }
  } else {
    const pool2 = [...ELEMENTS.slice(0,5)];
    for (let i = 0; i < root.elements; i++) {
      const idx = Math.floor(Math.random()*pool2.length);
      elements.push(pool2.splice(idx,1)[0]);
    }
  }
  return { id: root.id, name: root.name, elements, eff: root.eff, bonusSlots: root.bonusSlots||0, bonusLv: root.bonusLv||0, doubleEff: !!root.doubleEff, breakthroughBonus: root.breakthroughBonus||0 };
}

function isAffinityMatch(skill, spiritRoot) {
  if (!spiritRoot || !skill || !skill.element) return false;
  return spiritRoot.elements.includes(skill.element);
}

// ===== 辅助函数 =====
function getMainSkill(id) {
  const sk = MAIN_SKILLS.find(s => s.id === id);
  if (sk && sk.level === undefined) sk.level = 1;
  return sk;
}
function getSubSkill(id) { return SUB_SKILLS.find(s => s.id === id); }
function getSkillsByRegion(regionId) { return SUB_SKILLS.filter(s => s.region === regionId && !s.isDrop); }
function getAvailableMainSkills(regionId) { return MAIN_SKILLS.filter(s => s.region === regionId && s.quality !== 'legendary'); }

function getSkillAttrBonus() {
  const s = GameState;
  let bonus = { atk: 0, def: 0, spd: 0, wis: 0, vit: 0, spi: 0 };
  if (s.mainSkill) {
    const ms = getMainSkill(s.mainSkill);
    if (ms) {
      const mult = QUALITY_MULT[ms.quality] || 1;
      Object.keys(bonus).forEach(k => bonus[k] += Math.floor((ms.growth[k] || 0) * ms.level * mult));
    }
  }
  (s.subSkills || []).forEach(ss => {
    const skill = getSubSkill(ss.id);
    if (!skill) return;
    const affinity = s.spiritRoot && isAffinityMatch(skill, s.spiritRoot);
    const baseMult = affinity ? 1.3 : 1.0;
    const doubleEff = s.spiritRoot?.doubleEff || false;
    const bonusMult = affinity && doubleEff ? 2.6 : baseMult;
    Object.keys(bonus).forEach(k => bonus[k] += Math.floor((skill.bonus[k] || 0) * ss.level * bonusMult));
  });
  return bonus;
}
