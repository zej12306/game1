/**
 * 凡人修仙传·模拟器 — 全部数值常量
 * 来源：temp_gdd.md v1.0
 * 导出：var DATA = { ... }
 */
var DATA = {

  // ============================================================
  // 一、境界属性基础值
  // ============================================================
  REALMS: {
    // 大境界基础属性 { HP, MP, ATK, DEF, SP }
    baseStats: {
      凡人:  { HP: 100,       MP: 50,       ATK: 10,    DEF: 5,     SP: 10 },
      练气:  { HP: 200,       MP: 150,      ATK: 25,    DEF: 12,    SP: 30 },
      筑基:  { HP: 500,       MP: 400,      ATK: 60,    DEF: 30,    SP: 80 },
      金丹:  { HP: 1500,      MP: 1200,     ATK: 180,   DEF: 90,    SP: 200 },
      元婴:  { HP: 4000,      MP: 3500,     ATK: 500,   DEF: 250,   SP: 500 },
      化神:  { HP: 10000,     MP: 9000,     ATK: 1200,  DEF: 600,   SP: 1200 },
      炼虚:  { HP: 30000,     MP: 25000,    ATK: 3000,  DEF: 1500,  SP: 3000 },
      合体:  { HP: 80000,     MP: 70000,    ATK: 8000,  DEF: 4000,  SP: 8000 },
      大乘:  { HP: 200000,    MP: 180000,   ATK: 20000, DEF: 10000, SP: 20000 },
      渡劫:  { HP: 500000,    MP: 450000,   ATK: 50000, DEF: 25000, SP: 50000 },
      真仙:  { HP: 2000000,   MP: 1800000,  ATK: 200000, DEF: 100000, SP: 200000 },
      金仙:  { HP: 10000000,  MP: 9000000,  ATK: 1000000, DEF: 500000, SP: 1000000 },
      太乙:  { HP: 50000000,  MP: 45000000, ATK: 5000000, DEF: 2500000, SP: 5000000 },
      大罗:  { HP: 200000000, MP: 180000000, ATK: 20000000, DEF: 10000000, SP: 20000000 },
      道祖:  { HP: 1000000000, MP: 900000000, ATK: 100000000, DEF: 50000000, SP: 100000000 }
    },
    // 小阶段系数（初期=0, 中期=1, 后期=2, 圆满=3）
    subStageIndex: { 初期: 0, 中期: 1, 后期: 2, 圆满: 3 },
    subStageMultiplier: 0.25, // 每小阶段 +25%
    // 大境界突破属性增幅倍率
    breakthroughMultiplier: {
      '凡人→练气': 2.0,   '练气→筑基': 2.5,  '筑基→金丹': 3.0,
      '金丹→元婴': 3.0,   '元婴→化神': 3.5,  '化神→炼虚': 4.0,
      '炼虚→合体': 4.0,   '合体→大乘': 4.5,  '大乘→渡劫': 5.0,
      '渡劫→真仙': 6.0,   '真仙→金仙': 6.0,  '金仙→太乙': 7.0,
      '太乙→大罗': 8.0,   '大罗→道祖': 10.0
    },
    // 寿元（年）
    lifespan: {
      凡人: 80,    练气: 150,  筑基: 300,  金丹: 600,  元婴: 1500,
      化神: 3000,  炼虚: 5000, 合体: 10000, 大乘: 20000, 渡劫: 30000,
      真仙: 100000, 金仙: 500000, 太乙: 2000000, 大罗: 10000000, 道祖: Infinity
    }
  },

  // ============================================================
  // 二、突破修为需求
  // ============================================================
  BREAKTHROUGH: {
    // 各境界小阶段修为需求 { 初期, 中期, 后期, 圆满, 突破消耗灵石, 推荐丹药 }
    requirements: {
      凡人: { early: 0,     mid: 30,   late: 70,   complete: 120,  spiritStone: 0,    pill: null },
      练气: { early: 150,   mid: 350,  late: 600,  complete: 900,  spiritStone: 50,   pill: null },
      筑基: { early: 1000,  mid: 2200, late: 3800, complete: 5800, spiritStone: 200,  pill: '筑基丹' },
      金丹: { early: 6000,  mid: 12000,late: 20000,complete: 30000,spiritStone: 800,  pill: '结金丹' },
      元婴: { early: 30000, mid: 60000,late: 100000,complete: 150000,spiritStone: 3000, pill: '化婴丹' },
      化神: { early: 150000,mid: 300000,late: 500000,complete: 800000,spiritStone: 10000, pill: '炼神丹' },
      炼虚: { early: 800000,mid: 1500000,late: 2500000,complete: 4000000,spiritStone: 50000, pill: '虚灵丹' },
      合体: { early: 4000000,mid: 8000000,late: 13000000,complete: 20000000,spiritStone: 200000, pill: '合和丹' },
      大乘: { early: 20000000,mid: 35000000,late: 55000000,complete: 80000000,spiritStone: 500000, pill: '渡厄丹' },
      渡劫: { early: 80000000,mid: 120000000,late: 180000000,complete: 250000000,spiritStone: 1000000, pill: '渡劫圣丹' },
      真仙: { early: 250000000,mid: 500000000,late: 900000000,complete: 1500000000,spiritStone: 0, pill: null, currency: '灵晶' },
      金仙: { early: 1500000000,mid: 3000000000,late: 5500000000,complete: 9000000000,spiritStone: 0, pill: null, currency: '灵晶' },
      太乙: { early: 9000000000,mid: 18000000000,late: 30000000000,complete: 50000000000,spiritStone: 0, pill: null, currency: '灵晶' },
      大罗: { early: 50000000000,mid: 100000000000,late: 200000000000,complete: 400000000000,spiritStone: 0, pill: null, currency: '灵晶' },
      道祖: { early: 400000000000,mid: Infinity,late: Infinity,complete: Infinity,spiritStone: 0, pill: '道祖丹' }
    },
    // 飞升消耗
    ascension: {
      '飞升灵界': { spiritStone: 50000,  pill: '飞升丹' },
      '飞升仙界': { spiritStone: 5000000, pill: '飞仙丹' }
    },
    // 突破成功率公式参数
    successRate: {
      base: 20,       // 基础成功率 20%
      cap: 85,        // 上限 85%
      floor: 5,       // 保底 5%
      madnessThreshold: 40, // 成功率<40%时额外20%概率走火
      // 各项加成上限
      wisdomCap: 20,  // 悟性加成上限
      luckCap: 15,    // 机缘加成上限
      // 灵根加成
      rootBonus: { 伪灵根: -15, 杂灵根: 0, 双灵根: 12, 天灵根: 20, 变异灵根: 22 }
    }
  },

  // ============================================================
  // 三、灵根系统
  // ============================================================
  SPIRIT_ROOT: {
    types: {
      伪灵根: { rarity: '最差',  speedMulti: 0.5,  breakBonus: -20, desc: '五属性皆有且平均，无任一>30%' },
      杂灵根: { rarity: '普通',  speedMulti: 1.0,  breakBonus: 0,   desc: '三至四个属性各占10~30%，无突出属性' },
      双灵根: { rarity: '较好',  speedMulti: 1.8,  breakBonus: 12,  desc: '两个主属性30~45%，其余合计≤40%' },
      天灵根: { rarity: '顶级',  speedMulti: 3.0,  breakBonus: 20,  desc: '单一属性≥90%，其余合计≤10%' },
      变异灵根:{ rarity: '特殊', speedMulti: 3.5,  breakBonus: 22,  desc: '天灵根基础上附加雷/冰/风标签' }
    }
  },

  // ============================================================
  // 四、修炼系统
  // ============================================================
  CULTIVATION: {
    // 各境界单次操作耗时（天）
    operationDays: {
      凡人: { 打坐: 1,  闭关: 7,  探索: 1, 炼丹: 0,  祭炼法宝: 0,  休养: 1,  赶路: 1 },
      练气: { 打坐: 3,  闭关: 15, 探索: 1, 炼丹: 3,  祭炼法宝: 7,  休养: 1,  赶路: 1 },
      筑基: { 打坐: 7,  闭关: 30, 探索: 3, 炼丹: 5,  祭炼法宝: 15, 休养: 2,  赶路: 1 },
      金丹: { 打坐: 15, 闭关: 90, 探索: 5, 炼丹: 10, 祭炼法宝: 30, 休养: 3,  赶路: 2 },
      元婴: { 打坐: 30, 闭关: 180,探索: 7, 炼丹: 15, 祭炼法宝: 60, 休养: 5,  赶路: 3 },
      化神: { 打坐: 60, 闭关: 365,探索: 10,炼丹: 30, 祭炼法宝: 120,休养: 7,  赶路: 5 }
    },
    // 闭关加成
    seclusionBonus: 1.17,
    // 打坐vs挂机速度比
    activePassiveRatio: 3,
    // 聚灵阵
    spiritArray: [
      { level: '初级', cost: 200,   bonus: 0.5,  duration: 90,  unlock: '练气' },
      { level: '中级', cost: 800,   bonus: 0.8,  duration: 180, unlock: '筑基' },
      { level: '高级', cost: 3000,  bonus: 1.2,  duration: 365, unlock: '金丹' },
      { level: '顶级', cost: 10000, bonus: 2.0,  duration: 730, unlock: '元婴' }
    ],
    // 修炼地点
    locations: {
      '普通洞府': { bonus: 0,    unlock: '初始',     travelDays: 0 },
      '灵脉洞府': { bonus: 0.3,  unlock: '500灵石', travelDays: 1 },
      '地下灵脉': { bonus: 0.6,  unlock: '探索发现', travelDays: 3 },
      '福地秘境': { bonus: 1.0,  unlock: '特殊任务', travelDays: 5 },
      '宗门静室': { bonus: 0.4,  unlock: '加入宗门', travelDays: 1 }
    }
  },

  // ============================================================
  // 五、修炼速度公式
  // ============================================================
  FORMULAS: {
    cultivationSpeed: '基础速度 × 灵根倍率 × (1 + 悟性×0.005) × 功法加成 × 状态加成',
    spiritRecovery:   '境界基础恢复 × (1 + 神识×0.002)',
    critRate:         '机缘×0.2% + 功法加成',
    dodgeRate:        '神识×0.15% + 身法功法加成',
    carryLimit:       '境界系数×50',
    // 属性计算
    attrFormula:      '大境界基础值 × (1 + 0.25 × 小阶段索引)',
    // 伤害公式
    physicalDamage:   '攻击方攻击 × 技能倍率 - 防御方防御 × 0.5',
    magicDamage:      '攻击方灵力 × 技能倍率 - 防御方灵力抗性 × 0.3',
    spiritDamage:     '攻击方神识强度 × 技能倍率 - 防御方神识抗性 × 0.5',
    // 属性克制
    typeAdvantage:    { weak: -0.25, strong: 0.25 },
    // Buff叠层公式
    buffStack:        '基础值 × (1 + 0.8 × (N-1))'
  },

  // ============================================================
  // 六、神识系统
  // ============================================================
  SPIRIT_SENSE: {
    levels: {
      开识:   { correspond: '凡人~练气初', range: [10, 50],      features: ['基础探查'] },
      凝识:   { correspond: '练气中~筑基初', range: [50, 200],    features: ['深度探查','冥想淬炼'] },
      化识:   { correspond: '筑基中~金丹初', range: [200, 800],   features: ['大范围扫描','神识攻击'] },
      神识如丝:{ correspond: '金丹中~元婴初', range: [800, 3000],  features: ['魂海探索','神识化形'] },
      神识化海:{ correspond: '元婴中~化神',   range: [3000, 10000],features: ['神识冲穴','分神术'] },
      神识领域:{ correspond: '炼虚~合体',     range: [10000, 50000],features: ['领域展开','多人压制'] },
      神识通玄:{ correspond: '大乘~渡劫',     range: [50000, 200000],features: ['跨界探查','一念万里'] },
      神识造化:{ correspond: '真仙~金仙',     range: [200000, 1000000],features: ['神识创造','模拟推演'] },
      神识混沌:{ correspond: '太乙以上',      range: [1000000, Infinity],features: ['窥探天机','法则推演'] }
    },
    // 神识操作耗时（天）
    operationDays: {
      凡人: { 基础探查:1, 深度探查:0, 大范围扫描:0, 冥想淬炼:1, 魂海探索:0, 神识冲穴:0, 修养恢复:1 },
      练气: { 基础探查:1, 深度探查:3, 大范围扫描:0, 冥想淬炼:2, 魂海探索:0, 神识冲穴:0, 修养恢复:1 },
      筑基: { 基础探查:2, 深度探查:5, 大范围扫描:7, 冥想淬炼:3, 魂海探索:7, 神识冲穴:0, 修养恢复:2 },
      金丹: { 基础探查:3, 深度探查:7, 大范围扫描:10,冥想淬炼:5, 魂海探索:10,神识冲穴:15,修养恢复:3 },
      元婴: { 基础探查:5, 深度探查:10,大范围扫描:15,冥想淬炼:10,魂海探索:20,神识冲穴:30,修养恢复:5 },
      化神: { 基础探查:7, 深度探查:15,大范围扫描:30,冥想淬炼:15,魂海探索:30,神识冲穴:45,修养恢复:7 }
    },
    // 神识拼斗策略
    combatStyles: {
      平刺: { costPct: 5,  power: 0.8 },
      重击: { costPct: 15, power: 1.5 },
      魂刺: { costPct: 2,  power: 3.0, costPermanent: true },
      壁垒: { costPct: 3,  reduction: 0.7 },
      缠绕: { costPct: 8,  doubleCost: true },
      震慑: { costPct: 10, stun: true },
      撤逃: { retain: 0.5 }
    },
    // 探查失败惩罚
    probeFailPenalties: [
      '神识反噬：神识扣30%，紊乱3天(修炼速度减半)',
      '惊动妖兽：强制进入战斗，敌人先手',
      '触发禁制：气血扣20%，残魂攻击',
      '迷失方向：额外消耗5天返回',
      '魂兽入侵：神识上限永久-5',
      '被追踪：下次探索该区域遭遇伏击'
    ]
  },

  // ============================================================
  // 七、炼体系统
  // ============================================================
  BODY_REFINING: {
    realms: [
      { name: '凡体',      mult: 1.0,  unlock: '初始', hpBonus: 0,    defBonus: 0,    dmgReduction: 0 },
      { name: '铜皮',      mult: 1.5,  unlock: '练气', hpBonus: 0.5,  defBonus: 0.5,  dmgReduction: 0 },
      { name: '铁骨',      mult: 2.0,  unlock: '筑基', hpBonus: 1.0,  defBonus: 1.0,  dmgReduction: 0 },
      { name: '银髓',      mult: 3.0,  unlock: '金丹', hpBonus: 2.0,  defBonus: 2.0,  dmgReduction: 0.10 },
      { name: '金身',      mult: 5.0,  unlock: '元婴', hpBonus: 4.0,  defBonus: 4.0,  dmgReduction: 0.20 },
      { name: '玉骨',      mult: 8.0,  unlock: '化神', hpBonus: 7.0,  defBonus: 7.0,  dmgReduction: 0.30 },
      { name: '圣体',      mult: 15,   unlock: '炼虚', hpBonus: 14.0, defBonus: 14.0, dmgReduction: 0.40 },
      { name: '梵圣真身',  mult: 30,   unlock: '合体', hpBonus: 29.0, defBonus: 29.0, dmgReduction: 0.50 }
    ],
    // 等级上限
    maxLevel: 10,
    // 各境界基础炼体值
    baseValues: { 铜皮: 10, 铁骨: 80, 银髓: 600, 金身: 4000, 玉骨: 25000, 圣体: 150000, 梵圣真身: 1000000 },
    // 境界系数
    realmCoefficients: [1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4],
    // 突破瓶颈倍率
    bottleneckMultiplier: 1.5,
    // 炼体方式
    methods: {
      药浴炼体: { days: 7,   gain: [5, 10],   condition: '消耗药材',       risk: null },
      雷击炼体: { days: 15,  gain: [15, 25],  condition: '雷雨天气/雷暴区域', risk: '失败扣气血30%' },
      重力修炼: { days: 10,  gain: [8, 15],   condition: '消耗灵石',       risk: '低' },
      战斗淬炼: { days: 0,   gain: [1, 5],    condition: '战斗胜利',       risk: null },
      月华炼体: { days: 1,   gain: [2, 5],    condition: '夜晚+满月',      risk: null },
      煞气炼体: { days: 10,  gain: [15, 25],  condition: '古战场/万人坑',   risk: '煞气入体危险' },
      地煞炼体: { days: 15,  gain: [10, 18],  condition: '地脉深处',       risk: '低概率地火爆发' },
      天罡炼体: { days: 7,   gain: [8, 15],   condition: '山巅+晴夜+星辰',  risk: '条件苛刻' },
      万毒炼体: { days: 10,  gain: [20, 35],  condition: '背包≥3种毒物',    risk: '中毒扣血7天' },
      阴阳交汇: { days: 3,   gain: [25, 40],  condition: '昼夜交替+特殊地点', risk: '极低概率走火' },
      血祭炼体: { days: 0,   gain: [30, 50],  condition: '消耗10%寿元上限',  risk: '永久扣寿元' },
      灵压淬体: { days: 5,   gain: [10, 20],  condition: '高阶存在威压',    risk: '需找到高阶配合' }
    }
  },

  // ============================================================
  // 八、功法系统
  // ============================================================
  SKILLS: {
    // 各品阶总价值
    rankValue: { 黄: 35, 玄: 70, 地: 140, 天: 250, 灵: 500, 仙: 1000, 神: 2000 },
    // 主修功法（完整数据）
    mainSkills: [
      { name: '掩月基础功', rank: '黄', value: 35,  cultivation: 20,  special1: '灵力恢复+12%', special2: '气血+10%',          faction: '黄枫谷' },
      { name: '妙音天诀',   rank: '玄', value: 70,  cultivation: 38,  special1: '交易价格+10%', special2: '魅力+15',          faction: '妙音门' },
      { name: '落云剑诀',   rank: '地', value: 140, cultivation: 55,  special1: '攻击+18%',    special2: '剑气积累+剑阵',     faction: '落云宗' },
      { name: '不动金钟',   rank: '地', value: 140, cultivation: 50,  special1: '防御+20%+减伤8%', special2: '气血+25%',     faction: '天阙堡' },
      { name: '万兽诀',     rank: '地', value: 140, cultivation: 50,  special1: '灵兽成长+25%', special2: '多控+1+全属+8%',  faction: '灵兽山' },
      { name: '天煞魔功',   rank: '地', value: 140, cultivation: 55,  special1: '攻击+20%',    special2: '击杀回血8%+魔道+12%', faction: '天煞宗' },
      { name: '御鬼诀',     rank: '地', value: 140, cultivation: 50,  special1: '鬼物操控+2',   special2: '鬼物属+12%+召唤CD-1', faction: '鬼灵门' },
      { name: '合欢诀',     rank: '地', value: 140, cultivation: 50,  special1: '双修收益+60%', special2: '魅力+18+灵力+15%', faction: '合欢宗' },
      { name: '玄阴魔功',   rank: '地', value: 140, cultivation: 55,  special1: '冰伤+22%',    special2: '灵力+18%+冰抗+25%', faction: '极阴岛' },
      { name: '九转归元诀', rank: '地', value: 140, cultivation: 55,  special1: '突破+灵力上限+10%', special2: '瓶颈-10%+灵力恢复+15%', faction: '虚天殿' },
      { name: '梵圣真魔功(残)',rank:'地',value: 140, cultivation: 40, special1: '炼体+30%',     special2: '气血+35%+防御+18%', faction: '大晋古战场' },
      { name: '掩月天诀',   rank: '天', value: 250, cultivation: 90,  special1: '夜间+40%',    special2: '灵力恢复x2+灵力+25%', faction: '掩月宗' },
      { name: '天魔解体大法',rank: '天', value: 250, cultivation: 75,  special1: '解体攻防x3/3回合', special2: '攻击+18%+气血+30%', faction: '天魔宗' },
      { name: '星辰引',     rank: '天', value: 250, cultivation: 110, special1: '星辰伤害+35%', special2: '灵力+28%+夜间+15%', faction: '星宫' },
      { name: '天道正法',   rank: '天', value: 250, cultivation: 120, special1: '对魔道+18%',   special2: '全属+10%+心魔-25%', faction: '天道盟' },
      { name: '三转重元功', rank: '天', value: 250, cultivation: 30,  special1: '每转灵力+15%(3转)', special2: '二转突破+8%+走火归零', faction: '独立·悟性≥70' },
      { name: '青元剑诀',   rank: '天', value: 250, cultivation: 90,  special1: '攻击+15%+剑气×10', special2: '大庚剑阵',       faction: '虚天殿·韩立' },
      { name: '万古长青诀', rank: '天', value: 250, cultivation: 70,  special1: '寿元+120年',   special2: '气血+35%+炼体+12%', faction: '万年灵木禁地' },
      { name: '混沌真解(人界)',rank:'天',value: 250, cultivation: 110, special1: '全属+8%',     special2: '悟性+10+机缘+10',  faction: '三石碑拼凑' },
      { name: '太初剑经',   rank: '天', value: 250, cultivation: 110, special1: '攻击+35%',    special2: '剑气上限x2+首击x3', faction: '远古战场剑冢' },
      { name: '广灵道经',   rank: '灵', value: 500, cultivation: 200, special1: '法则感悟+5%', special2: '全属+15%+突破+8%', faction: '广灵洞天' },
      { name: '梵圣真魔功(完整)',rank:'灵',value: 500, cultivation: 70, special1: '炼体+50%', special2: '气血+80%+防御+40%+法相', faction: '广灵洞天' },
      { name: '混沌真解(灵界)',rank:'灵',value: 500, cultivation: 200, special1: '集人界篇+40%', special2: '全属+12%+灵力消耗-12%', faction: '万古魔域' },
      { name: '混沌造化诀', rank: '仙', value: 1000,cultivation: 400, special1: '全属+25%+法则+12%', special2: '突破+10%',   faction: '源初秘境' },
      { name: '鸿蒙道典',   rank: '仙', value: 1000,cultivation: 380, special1: '法则+6%/级',  special2: '突破+12%+法术减伤', faction: '天庭禁书区' },
      { name: '青莲造化诀', rank: '神', value: 2000,cultivation: 800, special1: '全属+50%+法则+25%', special2: '突破+20%+掌天瓶完全体', faction: '掌天瓶完全炼化' }
    ],
    // 独立功法
    independentSkills: [
      { name: '太虚炼神诀', rank: '玄', type: '辅修·神识', effect: '神识+8%/级',          location: '大晋古战场地宫' },
      { name: '天罡罩',     rank: '玄', type: '防御·招式', effect: '减伤70%/2回合·冷却5',   location: '天南禁地藏经洞' },
      { name: '碎星指',     rank: '玄', type: '攻击·招式', effect: '单体2.5倍破甲50%',      location: '乱星海海底遗迹' },
      { name: '万毒心经',   rank: '玄', type: '辅修·毒术', effect: '毒伤+50%+炼毒不伤',      location: '慕兰草原毒修遗迹' },
      { name: '草木逢春诀', rank: '玄', type: '辅修·治疗', effect: '战斗每回合回5%HP',        location: '万年灵木禁地' },
      { name: '虚空步',     rank: '玄', type: '身法·闪避', effect: '闪避+25%+完全闪避概率',    location: '陨铁岛空间裂缝' },
      { name: '搬山诀',     rank: '玄', type: '辅修·力量', effect: '负重x3+炼体+10%',         location: '昆吾山外围矿洞' },
      { name: '融灵诀',     rank: '玄', type: '辅修·灵兽', effect: '灵兽成长+30%+出战+1',     location: '灵兽山外围密道' },
      { name: '锻体诀',     rank: '黄', type: '辅修·炼体', effect: '炼体速度+15%',           location: '各处山洞遗迹' },
      { name: '五禽戏',     rank: '黄', type: '辅修·养生', effect: '寿元+10+全属+3%',        location: '青云山七玄门' },
      { name: '天听术',     rank: '黄', type: '辅修·感知', effect: '探索发现范围+20%',        location: '黑风林隐藏树洞' },
      { name: '敛息术',     rank: '黄', type: '辅修·隐匿', effect: '探索安全+20%+避开妖兽',    location: '散修联盟任务' },
      { name: '缩地成寸',   rank: '黄', type: '身法·赶路', effect: '赶路x2+战斗先手',         location: '天南城奇遇' },
      { name: '破阵诀',     rank: '黄', type: '辅修·阵法', effect: '破阵效率+40%',           location: '清虚门废弃讲堂' },
      { name: '金钟罩残篇', rank: '黄', type: '防御·减伤', effect: '减伤+15%炼体联动',        location: '天阙堡外门' },
      { name: '雷音吼',     rank: '黄', type: '攻击·招式', effect: '无视防御+概率眩晕',        location: '雷鸣山脉山脚洞穴' },
      { name: '血炼术',     rank: '黄', type: '辅修·血道', effect: '气血代替灵石催动法宝',      location: '魔岛血修洞府' }
    ],
    // 功法等级
    skillMaxLevel: 10,
    skillPerLevelBonus: 5, // 每级+5%效果
    // 装备栏位（按境界）
    equipSlots: {
      凡人:     { active: 1, passive: 1 },
      练气:     { active: 2, passive: 1 },
      筑基:     { active: 2, passive: 2 },
      金丹:     { active: 3, passive: 2 },
      元婴:     { active: 4, passive: 3 },
      化神:     { active: 4, passive: 3 },
      炼虚:     { active: 5, passive: 4 },
      合体:     { active: 5, passive: 4 },
      大乘:     { active: 5, passive: 4 },
      渡劫:     { active: 5, passive: 4 },
      真仙:     { active: 6, passive: 5 },
      金仙:     { active: 6, passive: 5 },
      太乙:     { active: 6, passive: 5 },
      大罗:     { active: 6, passive: 5 },
      道祖:     { active: Infinity, passive: Infinity }
    },
    // 叛宗功法保留率
    defectionRetention: { 黄: 0.90, 玄: 0.70, 地: 0.50, 天: 0.30, 镇派: 0.10 },
    // 主修切换耗时
    switchDays: 10
  },

  // ============================================================
  // 九、法宝系统
  // ============================================================
  EQUIPMENT: {
    // 法宝品阶链
    rankChain: ['法器', '灵器', '法宝', '古宝', '玄天之宝', '通天灵宝', '先天灵宝', '混沌至宝'],
    subRanks: ['下品', '中品', '上品', '极品'],
    // 攻击型法宝基础攻击力范围
    atkRanges: {
      法器:       { 下品: [5, 10],    中品: [12, 18],   上品: [20, 28],    极品: [30, 40],    unlock: '练气' },
      灵器:       { 下品: [20, 40],   中品: [45, 70],   上品: [75, 110],   极品: [120, 180],  unlock: '筑基' },
      法宝:       { 下品: [80, 150],  中品: [180, 280], 上品: [300, 450],  极品: [500, 700],  unlock: '金丹' },
      古宝:       { 下品: [300, 600], 中品: [700, 1200],上品: [1300, 2000],极品: [2500, 4000],unlock: '元婴' },
      玄天之宝:   { 下品: [2000, 4000],中品: [5000, 8000],上品: [10000, 15000],极品: [20000, 30000], unlock: '化神' },
      通天灵宝:   { 下品: [10000, 30000],中品: [40000, 80000],上品: [100000, 200000],极品: [300000, 500000], unlock: '炼虚' },
      先天灵宝:   { 下品: [200000, 500000],中品: [600000, 1200000],上品: [1500000, 3000000],极品: [5000000, 10000000], unlock: '大乘' },
      混沌至宝:   { 下品: [10000000, Infinity],unlock: '道祖' }
    },
    // 法宝栏位
    equipmentSlots: {
      练气: { 本命: 1, 装备: 1, 储物: 3 },
      筑基: { 本命: 1, 装备: 2, 储物: 5 },
      金丹: { 本命: 1, 装备: 3, 储物: 8 },
      元婴: { 本命: 1, 装备: 4, 储物: 12 },
      化神: { 本命: 1, 装备: 5, 储物: 18 },
      炼虚: { 本命: 1, 装备: 6, 储物: 25 },
      合体: { 本命: 1, 装备: 7, 储物: 35 },
      大乘: { 本命: 1, 装备: 8, 储物: 50 },
      渡劫: { 本命: 1, 装备: 9, 储物: 50 },
      真仙: { 本命: 2, 装备: 10, 储物: 100 },
      金仙: { 本命: 2, 装备: 12, 储物: 200 },
      太乙: { 本命: 3, 装备: 15, 储物: 500 },
      大罗: { 本命: 3, 装备: 20, 储物: 1000 },
      道祖: { 本命: Infinity, 装备: Infinity, 储物: Infinity }
    },
    // 炼制概率
    craftProbabilities: { 失败: 0.30, 下品: 0.40, 中品: 0.20, 上品: 0.08, 极品: 0.02 },
    // 融合概率
    fusionProbabilities: { 成功: 0.40, 部分融合: 0.35, 失败: 0.25 },
    // 法宝献祭
    sacrifice: {
      法器:   '回30%HP',
      灵器:   '回50%HP + 临时攻+20%',
      古宝:   '满状态+免疫2回合',
      玄天以上:'逆转战局'
    },
    // 法宝自爆
    selfDestruct: { normal: 5, 本命: 10 }, // ×法宝攻击
    selfDestructBacklash: 0.30, // 反噬气血30%
    lifeWeaponBacklash: 0.50,   // 本命自爆神识永久-50%
    // 温养系数
    nurture: { daysFactor: 0.5, growthRange: [5, 15], proficiencyRange: [1, 3] },
    // 完整法宝图鉴（按品阶分组）
    catalog: {
      法器: [
        { name:'基础飞剑',  atk:10,  sub:'下', price:100,  desc:'各派弟子标配' },
        { name:'青锋匕',    atk:18,  sub:'上', price:400,  desc:'七玄门旧物' },
        { name:'铁木盾',    def:12,  sub:'中', price:150,  desc:'黄枫谷外门' },
        { name:'金丝甲',    def:8,   sub:'下', price:80,   desc:'散修常用' },
        { name:'聚灵玉佩',  mpRec:2, sub:'中', price:120,  desc:'通用' },
        { name:'灵兽环',    loyalty:10,sub:'下',price:200,desc:'灵兽山' },
        { name:'青元配套飞剑',atk:15, sub:'极', price:0,   desc:'韩立筑基期·剧情' },
        { name:'天遁舟',    fly:3,   sub:'上', price:500,  desc:'韩立代步' },
        { name:'火符剑',    atk:12,  sub:'下', price:150,  desc:'散修常用·灼烧' },
        { name:'冰锥符器',  atk:10,  sub:'下', price:120,  desc:'散修常用·冰冻' },
        { name:'金刚符甲',  def:10,  sub:'下', price:80,   desc:'通用消耗·1次' },
        { name:'追风靴',    speed:2, sub:'下', price:100,  desc:'通用' },
        { name:'养气玉佩',  mpMax:10,sub:'中', price:250,  desc:'通用' },
        { name:'墨玉含章',  type:'剧情', sub:'唯一', price:0, desc:'墨大夫' },
        { name:'舍利子仿品',sp:5,   sub:'中', price:300,  desc:'散修' }
      ],
      灵器: [
        { name:'玄铁飞剑',  atk:35,  sub:'下', price:500,  desc:'各派精英' },
        { name:'赤鳞盾',    def:28,  sub:'中', price:800,  desc:'血色禁地' },
        { name:'凝光甲',    def:20,  sub:'上', price:2000, desc:'乱星海·避水' },
        { name:'锁魂链',    spAtk:20,sub:'下', price:600,  desc:'鬼灵门·主动CD5' },
        { name:'金童御兽环',pet:1,  sub:'中', price:1000, desc:'御灵宗' },
        { name:'雷火符剑',  atk:60,  sub:'上', price:2500, desc:'天南符派·主动CD6' },
        { name:'小乾坤罩',  dmgRed:30,sub:'极',price:4000,desc:'掩月宗·主动CD10' },
        { name:'阴沉竹剑',  atk:30,  sub:'下', price:500,  desc:'散修·雷' },
        { name:'寒冰尺',    atk:28,  sub:'中', price:900,  desc:'极阴岛·冰冻' },
        { name:'金环',      atk:32,  sub:'中', price:850,  desc:'天南散修' },
        { name:'银鳞甲',    def:22,  sub:'中', price:1200, desc:'海族' },
        { name:'碧玉簪',    sp:8,    sub:'下', price:600,  desc:'妙音门' },
        { name:'四方盾',    def:25,  sub:'中', price:1100, desc:'星宫' },
        { name:'辟火珠',    fireRes:50,sub:'下',price:500,desc:'拍卖会·火抗+50%' },
        { name:'辟水珠',    water:1, sub:'下', price:500,  desc:'拍卖会·水下' },
        { name:'摄魂铃',    confuse:20,sub:'中',price:1000,desc:'魔道·混乱概率20%' },
        { name:'五行盘',    cult:10, sub:'上', price:3000, desc:'星宫·修炼+10%' },
        { name:'传送符器',  teleport:3,sub:'上',price:3500,desc:'天南禁地·3次' }
      ],
      法宝: [
        { name:'青竹蜂云剑',atk:60,  sub:'成长',price:0,  desc:'韩立本命·可成长' },
        { name:'紫云嶂',    def:55,  sub:'中', price:6000, desc:'乱星海散修' },
        { name:'天遁神舟',  fly:10,  sub:'上', price:12000,desc:'天星城拍卖' },
        { name:'蛟龙剪',    atk:120, sub:'上', price:15000,desc:'海族妖修·破甲50%' },
        { name:'冰魄玄珠',  ice:30,  sub:'中', price:8000, desc:'极阴岛·冰系+30%' },
        { name:'血魔幡',    lifesteal:15,sub:'下',price:3000,desc:'魔道散修·击杀回血15%' },
        { name:'裂魂钟',    spDmg:2, sub:'中', price:7000, desc:'鬼灵门长老·主动CD8' },
        { name:'金蚨子母刀',atk:0,   sub:'中', price:9000, desc:'天煞宗·子母攻击' },
        { name:'五行环',    ele:15,  sub:'上', price:12000,desc:'星宫长老·五行+15%' },
        { name:'混天绫',    bind:3,  sub:'中', price:6000, desc:'掩月宗·主动CD8' },
        { name:'玄铁重尺',  atk:80,  sub:'下', price:3500, desc:'散修' },
        { name:'云烟扇',    windAoE:50,sub:'下',price:3000,desc:'散修·风系群攻' },
        { name:'锁妖塔(仿)',seal:1,  sub:'上', price:15000,desc:'灵兽山·镇压妖兽' },
        { name:'紫电锤',    atk:90,  sub:'中', price:8000, desc:'落云宗·麻痹·主动CD5' },
        { name:'金光罩',    dmgRed:40,sub:'上',price:10000,desc:'天阙堡·主动CD12' },
        { name:'百毒珠',    poisonRes:80,sub:'下',price:4000,desc:'慕兰草原·毒抗+80%' },
        { name:'化血刀',    atk:70,  sub:'中', price:7500, desc:'天煞宗·吸血' },
        { name:'落魂钟',    aoe:1,   sub:'上', price:12000,desc:'鬼灵门·声波群攻·主动CD7' },
        { name:'七星剑',    atk:0,   sub:'中', price:9000, desc:'星宫·剑阵7把·主动CD10' },
        { name:'乾天符宝(仿)',atk:150,sub:'极',price:30000,desc:'百巧院·5次' },
        { name:'月华轮',    atk:0,   sub:'中', price:7000, desc:'掩月宗圣女·月夜+50%·主动CD3' },
        { name:'金沙钵',    trap:3,  sub:'下', price:4000, desc:'散修·困敌3回合' }
      ],
      古宝: [
        { name:'虚天鼎',    dmgRed:50,sub:'极',price:0,desc:'虚天殿·韩立核心·主动CD10' },
        { name:'天帆',      sp:50,   sub:'上', price:0,  desc:'广灵洞天·神识+50%·主动CD20' },
        { name:'九宫天乾符',atk:300, sub:'极', price:0,  desc:'昆吾山·3次' },
        { name:'天雷竹剑',  atk:200, sub:'中', price:0,  desc:'雷鸣山脉·雷系·麻痹' },
        { name:'冰魄天戈',  atk:250, sub:'上', price:0,  desc:'北凉国·冰系·冰冻' },
        { name:'锁魂塔',    seal:1,  sub:'中', price:0,  desc:'万年灵木禁地' },
        { name:'破界珠',    barrier:1,sub:'下',price:0,  desc:'堕落魔渊·1次' },
        { name:'银月狐簪',  illusion:50,sub:'中',price:0,desc:'银月赠送·幻术+50%' },
        { name:'万妖令',    command:1,sub:'中',price:0,  desc:'万妖山脉·号令低阶妖兽' },
        { name:'炼魂镜',    spSeal:1, sub:'上',price:0,  desc:'虚天殿偏殿·主动CD12' },
        { name:'七彩琉璃盏',def:80,  sub:'中', price:0,  desc:'虚天殿·美幻' },
        { name:'天罗伞',    def:60,  sub:'下', price:0,  desc:'天南禁地·古修' },
        { name:'阴阳环',    heal:1,  sub:'中', price:0,  desc:'大晋古战场·道门' },
        { name:'星辰石',    star:30, sub:'上', price:0,  desc:'星宫·星辰之力+30%' },
        { name:'五龙玺',    summon:1,sub:'极',price:0,  desc:'大晋皇室·1次' },
        { name:'戮魂针',    spDmg:1, sub:'下', price:0,  desc:'暗月杀手·暗器' },
        { name:'金蛟剪(真)',atk:350, sub:'上', price:0,  desc:'昆吾山古魔·主动CD10' },
        { name:'血魂珠',    absorb:1,sub:'中', price:0,  desc:'血神秘境·主动CD8' },
        { name:'造化丹炉',  pill:20,  sub:'中', price:0,  desc:'百巧院·炼丹+20%' },
        { name:'虚空石坠',  space:20, sub:'上', price:0,  desc:'灵界虚空·空间法则+20%' },
        { name:'天机令',    div:1,   sub:'中', price:0,  desc:'天机阁·推演' },
        { name:'玄天令',    clue:1,  sub:'下', price:0,  desc:'广灵洞天·通天灵宝线索' }
      ],
      玄天之宝: [
        { name:'玄天斩灵剑',atk:500,  sub:'上', desc:'广灵洞天·韩立·破界·主动CD15' },
        { name:'天澜圣旗',  def:70,  sub:'中', desc:'灵界古战场·人族·减伤70%' },
        { name:'虚天残镜',  space:30,sub:'下', desc:'虚天殿隐藏层·空间+30%' },
        { name:'五行灵山',  def:100, sub:'上', desc:'灵界各家族·镇族' },
        { name:'混沌珠',    cult:100,sub:'极', desc:'广灵洞天·修炼+100%+法则+10%' },
        { name:'辟天尺',    atk:800, sub:'上', desc:'灵界虚空·主动CD12' },
        { name:'两界牌',    warp:3,  sub:'中', desc:'人族边境·跨界传送3次' },
        { name:'万龙甲',    def:500, sub:'中', desc:'万妖山脉·真龙族·龙息' },
        { name:'噬金壶',    breed:3, sub:'下', desc:'灵界虫谷·孵化速度x3·主动CD10' },
        { name:'真灵骨',    power:50,sub:'上', desc:'真灵秘境·真灵之力+50%·1次' },
        { name:'天凤火羽',  fire:100,sub:'中', desc:'天凤族圣物·火系+100%' },
        { name:'玄武玄甲',  def:800, sub:'上', desc:'玄武族圣物·反伤' }
      ],
      通天灵宝: [
        { name:'天凤羽扇',  atk:2000, sub:'中', desc:'天凤族至宝·焚天·主动CD10' },
        { name:'戮仙剑',    atk:5000, sub:'上', desc:'远古战场·无视防·主动CD15' },
        { name:'玄武盾',    def:2000, sub:'中', desc:'玄武族至宝·减伤90%·主动CD20' },
        { name:'乾坤塔',    time:5,  sub:'极', desc:'广灵洞天·时间流速x5' },
        { name:'真灵天书',  all:50,  sub:'极', desc:'真灵秘境·全属+50%' },
        { name:'万灵血珠',  heal:1,  sub:'中', desc:'血神秘境·治疗恢复' },
        { name:'破界梭',    warp:1,  sub:'上', desc:'灵界虚空·主动CD7天' },
        { name:'九天雷珠',  atk:10000,sub:'上',desc:'雷鸣山脉·雷系·主动' },
        { name:'麒麟印',    all:30,  sub:'中', desc:'麒麟族至宝·镇压+全属+30%' },
        { name:'八荒鼎',    craft:50,sub:'下', desc:'丹圣谷·炼丹炼器+50%' },
        { name:'时空珠',    law:30,  sub:'极', desc:'灰域·时间空间法则+30%' },
        { name:'鸿蒙珠',    cult:5,  sub:'上', desc:'源初秘境·修炼速度x5' }
      ],
      先天灵宝: [
        { name:'混沌钟',    atk:10000,def:5000,sub:'中',desc:'源初秘境·领域·主动CD30' },
        { name:'开天斧',    atk:30000,sub:'上', desc:'混沌外域·破法则·主动CD100' },
        { name:'轮回镜',    revive:1, sub:'极', desc:'轮回殿·复活1次/万年·主动' },
        { name:'造化玉碟',  craft:1,  sub:'极', desc:'天庭·推演炼制万物·主动' },
        { name:'天道剑',    atk:50000,sub:'上', desc:'天帝·天道法则' },
        { name:'不朽树',    life:1,   sub:'中', desc:'源初秘境·不死' },
        { name:'混沌珠帘',  immune:1, sub:'上', desc:'混沌外域·万法不侵' },
        { name:'彼岸花',    transcend:1,sub:'极',desc:'轮回殿·超脱轮回' }
      ],
      混沌至宝: [
        { name:'混沌青莲',    all:200, desc:'源初秘境最深·全属+200%+创世·主动CD万年' },
        { name:'掌天瓶(完全体)', desc:'韩立唯一·催熟+空间+时间+法则·主动·消耗绿液' },
        { name:'开天珠',      desc:'混沌外域深处·开天辟地之力·1次' }
      ]
    }
  },

  // ============================================================
  // 十、背包与负重
  // ============================================================
  INVENTORY: {
    // 物品重量
    weight: {
      丹药: 0.1, 灵草: 0.3, 矿石: 0.8, 兽骨: 1,
      灵石: 0,   符箓: 0.05, 法器: 2, 灵器: 3, 法宝: 5,
      古宝: 8,   玄天之宝: 15, 通天灵宝以上: 20
    },
    // 各境界负重上限
    carryLimit: {
      凡人: 10, 练气: 25, 筑基: 50, 金丹: 100, 元婴: 200,
      化神: 350, 炼虚: 600, 合体: 1000, 大乘: 2000, 渡劫: 3500,
      真仙: 10000, 金仙: 50000, 太乙: 200000, 大罗: 1000000, 道祖: Infinity
    },
    // 超重惩罚
    overweight: {
      normal:     [0, 1.0],      // 无影响
      light:      [1.0, 1.2],   // 移速-20% 闪避-10%
      moderate:   [1.2, 1.5],   // 移速-40% 闪避-20% 防御-10%
      heavy:      [1.5, 2.0],   // 移速-60% 全属-20%
      extreme:    [2.0, 3.0],   // 无法战斗 只能缓慢移动
      immobilized:[3.0, Infinity] // 无法移动
    },
    // 储物法宝
    storageItems: [
      { name:'小型储物袋',  rank:'法器',     capacity:20,   weight:0.5, special:null,          price:50,   source:'商店' },
      { name:'中型储物袋',  rank:'法器·极',  capacity:50,   weight:0.5, special:null,          price:150,  source:'商店' },
      { name:'大型储物袋',  rank:'灵器',     capacity:100,  weight:1,   special:null,          price:500,  source:'商店' },
      { name:'乾坤袋',      rank:'灵器·极',  capacity:200,  weight:1,   special:'免神识探查',    price:2000, source:'拍卖会' },
      { name:'须弥环',      rank:'法宝',     capacity:500,  weight:2,   special:'取物半回合',    price:0,    source:'秘境掉落' },
      { name:'洞天珠',      rank:'古宝',     capacity:2000, weight:3,   special:'可存活物',      price:0,    source:'遗迹探索' },
      { name:'小世界珠',    rank:'玄天之宝', capacity:10000,weight:5,   special:'内有灵田',      price:0,    source:'化神·大机缘' },
      { name:'洞天法宝',    rank:'通天灵宝', capacity:100000,weight:8,  special:null,          price:0,    source:'炼虚↑' },
      { name:'掌天瓶内部空间',rank:'特殊',   capacity:Infinity,weight:0,special:'纯储物·无灵田', price:0,    source:'掌天瓶' },
      { name:'随身秘境',    rank:'先天灵宝', capacity:100000,weight:10, special:'可种植/放生灵',  price:0,    source:'大罗' }
    ]
  },

  // ============================================================
  // 十一、丹药系统（66种）
  // ============================================================
  PILLS: {
    // 丹术等级
    alchemyLevels: [
      { range: [1, 5],   title: '学徒',   bonusPerLv: 2,  pills: '凡人~练气', upgradesNeeded: 5 },
      { range: [6, 10],  title: '丹师',   bonusPerLv: 2,  pills: '筑基',       upgradesNeeded: 10 },
      { range: [11, 15], title: '大师',   bonusPerLv: 2,  pills: '金丹',       upgradesNeeded: 20 },
      { range: [16, 20], title: '宗师',   bonusPerLv: 2,  pills: '元婴',       upgradesNeeded: 40 },
      { range: [21, 25], title: '大宗师', bonusPerLv: 3,  pills: '化神',       upgradesNeeded: 80 },
      { range: [26, 30], title: '丹王',   bonusPerLv: 3,  pills: '灵界',       upgradesNeeded: 150 },
      { range: [31, 40], title: '丹圣',   bonusPerLv: 4,  pills: '仙界',       upgradesNeeded: 300 }
    ],
    // 丹炉品阶
    furnaces: [
      { name: '普通药鼎',   bonus: 0,   rank: '凡器' },
      { name: '黄铜丹炉',   bonus: 5,   rank: '法器' },
      { name: '玄铁丹炉',   bonus: 10,  rank: '灵器' },
      { name: '紫金炉',     bonus: 15,  rank: '法宝' },
      { name: '地火炉',     bonus: 22,  rank: '古宝' },
      { name: '天火鼎',     bonus: 30,  rank: '玄天' },
      { name: '乾坤炉',     bonus: 40,  rank: '通天灵宝' },
      { name: '造化神炉',   bonus: 60,  rank: '先天灵宝', special: '必定极品·概率大成功x2' }
    ],
    // 异火
    flames: [
      { name: '地脉之火',   stars: 1,  bonus: 5,  special: null,            location: '地火秘境' },
      { name: '兽炎',       stars: 2,  bonus: 8,  special: '炼丹+10%',      location: '击杀火妖王' },
      { name: '骨灵冷火',   stars: 3,  bonus: 12, special: '极品+10%·阴丹+20%', location: '古战场深处' },
      { name: '紫晶焰',     stars: 4,  bonus: 15, special: '极品+12%·时间-20%', location: '火山深处' },
      { name: '九幽魔焰',   stars: 5,  bonus: 20, special: '极品+15%·魔道+30%', location: '魔渊最深处' },
      { name: '太阳真火',   stars: 6,  bonus: 25, special: '极品+20%·光明雷属+30%', location: '大能传承/仙界' },
      { name: '混沌圣焰',   stars: 7,  bonus: 35, special: '极品+30%·必上品以上', location: '道祖级' }
    ],
    // 丹药品质系数
    qualityMultipliers: { 废丹: 0, 下品: 0.8, 中品: 1.0, 上品: 1.3, 极品: 1.8, 圣品: 3.0 },
    // 丹毒系统
    toxin: {
      maxFormula: '境界系数×50',  // 凡人50→道祖无限
      clearRates: { natural: 1,  force: [20, 50], 解毒丹: 30, 洗骨花: 100, 突破: '清零' }
    },
    // ---- 凡人~练气期（12种） ----
    mortalPills: [
      { name:'培元丹',  materials:'灵草×2',              effect:'修为+20',            toxin:1 },
      { name:'聚气散',  materials:'灵草×3+兽丹×1',        effect:'修为+50',            toxin:2 },
      { name:'金创药',  materials:'灵草×1',               effect:'恢复30%气血',        toxin:1 },
      { name:'止血散',  materials:'灵草×1',               effect:'恢复15%气血·战斗中可用', toxin:1 },
      { name:'回灵丹',  materials:'灵草×2+寒玉芝×1',       effect:'恢复40%灵力',        toxin:2 },
      { name:'清心丸',  materials:'灵草×1',               effect:'解除普通中毒/混乱',    toxin:1 },
      { name:'辟谷丹',  materials:'灵草×1',               effect:'30天不进食',         toxin:0 },
      { name:'轻身丹',  materials:'灵草×2+风铃草×1',       effect:'赶路+20%持续15天',    toxin:1 },
      { name:'解毒散',  materials:'灵草×1+解毒草×1',        effect:'解除蛇毒/普通毒',     toxin:1 },
      { name:'壮骨丸',  materials:'灵草×2+兽骨×1',         effect:'炼体值+10',          toxin:1 },
      { name:'明目丹',  materials:'灵草×1+清目花×1',        effect:'探查成功率+5%持续7天', toxin:1 },
      { name:'养气丸',  materials:'灵草×3',               effect:'灵力上限永久+5(限服5次)',toxin:2 }
    ],
    // ---- 筑基期（12种） ----
    foundationPills: [
      { name:'筑基丹',  materials:'灵草×5+紫芝×2+兽丹×3',       effect:'筑基突破+15%',             toxin:5 },
      { name:'凝神丹',  materials:'灵草×3+紫芝×1',               effect:'神识+10上限',               toxin:3 },
      { name:'生骨丹',  materials:'灵草×4+兽骨×2',               effect:'恢复60%气血+断肢重生',       toxin:3 },
      { name:'复灵膏',  materials:'灵草×3+兽丹×2',               effect:'恢复60%灵力',               toxin:3 },
      { name:'炼体散',  materials:'灵草×3+兽丹×3+铁精×1',         effect:'炼体值+50',                toxin:5 },
      { name:'隐息丹',  materials:'灵草×2+影花草×1',              effect:'隐藏气息30天·安全+20%',     toxin:2 },
      { name:'迷魂丹',  materials:'毒草×2+迷幻菇×1',              effect:'战斗中使对方混乱2回合',       toxin:0 },
      { name:'破瘴丹',  materials:'灵草×2+阳花草×1',              effect:'免疫瘴气/毒雾30天',          toxin:2 },
      { name:'蓄力丹',  materials:'灵草×3+兽丹×2',               effect:'战斗攻击+20%持续3回合',      toxin:3 },
      { name:'铁骨丸',  materials:'灵草×4+铁精×2+兽骨×3',          effect:'炼体值+80(限铁骨以下)',      toxin:5 },
      { name:'定风丹',  materials:'灵草×2+风灵花×1',              effect:'免疫吹飞/击退3次战斗',        toxin:2 },
      { name:'通脉丹',  materials:'灵草×5+灵泉水×1',              effect:'灵力上限永久+20(限服3次)',    toxin:6 }
    ],
    // ---- 金丹期（10种） ----
    goldenPills: [
      { name:'凝碧丹',     materials:'紫芝×3+寒玉芝×2+兽丹×5',    effect:'修为+500',                   toxin:8 },
      { name:'结金丹',     materials:'紫芝×5+兽丹×8+妖丹×1',       effect:'结丹+20%',                   toxin:10 },
      { name:'增元丹',     materials:'紫芝×4+妖丹×1+玉髓×1',        effect:'修为+300+灵力上限+30',        toxin:8 },
      { name:'护脉丹',     materials:'灵草×5+软玉膏×1',            effect:'下次突破失败不扣修为(一次性)',  toxin:5 },
      { name:'破障丹(金丹)',materials:'紫芝×3+雷击木×1+妖丹×2',      effect:'金丹内破小瓶颈+30%',          toxin:8 },
      { name:'聚神丹',     materials:'紫芝×2+养魂木叶×1',           effect:'神识+20上限',                toxin:6 },
      { name:'蛟血丹',     materials:'妖丹×2+蛟龙血×1',             effect:'炼体值+300+气血上限+50',      toxin:10 },
      { name:'腾云丹',     materials:'灵草×5+云鹤羽×3',             effect:'飞行速度+50%持续30天',        toxin:5 },
      { name:'破甲丹',     materials:'毒草×3+尖刺果×2',             effect:'战斗中破甲3回合',             toxin:6 },
      { name:'护心丹',     materials:'灵草×5+万年灵芝×1',            effect:'濒死自动恢复30%HP(一次性)',   toxin:5 }
    ],
    // ---- 元婴期（8种） ----
    nascentPills: [
      { name:'化婴丹',     materials:'紫芝×10+妖丹×3+万年灵乳×1',                 effect:'化婴+20%',                      toxin:20 },
      { name:'炼神丹',     materials:'妖丹×2+万年灵乳×2+养魂木汁×1',                 effect:'神识+50上限',                    toxin:15 },
      { name:'天元丹',     materials:'紫芝×8+妖丹×5+地髓×1',                       effect:'修为+2000',                      toxin:18 },
      { name:'太清丹',     materials:'万年灵乳×3+妖丹×3+玉髓×3',                     effect:'灵力上限永久+100',                toxin:20 },
      { name:'金刚丹',     materials:'妖丹×3+金刚石×1+龙鳞×1',                      effect:'炼体值+800+防御+10%永久',         toxin:25 },
      { name:'破界丹(元婴)',materials:'妖丹×4+虚空石×1',                           effect:'战斗中无视防御1回合',              toxin:15 },
      { name:'祛毒丹(元婴)',materials:'万年灵芝×2+解毒草×5+灵泉水×5',                  effect:'解除一切毒素+丹毒-50',             toxin:3 },
      { name:'裂魂丹',     materials:'养魂木汁×3+妖丹×5+九幽草×1',                    effect:'神识攻击+50%持续3回合(战后虚弱7天)', toxin:25 }
    ],
    // ---- 化神期（6种） ----
    spiritPills: [
      { name:'化神丹',      materials:'妖丹×5+万年灵乳×5+麒麟角×1',           effect:'化神+25%',                     toxin:40 },
      { name:'混元丹',      materials:'妖丹×5+万年灵乳×3+五行草各1',            effect:'修为+8000',                    toxin:35 },
      { name:'天魂丹',      materials:'万年灵乳×5+养魂木枝×1+魂晶×1',            effect:'神识+150上限',                  toxin:30 },
      { name:'九转丹(1转)',  materials:'混元丹×1+妖丹×10+龙血×1',               effect:'修为+2万·每转递增',             toxin:50 },
      { name:'破障丹(化神)',  materials:'麒麟角×1+凤羽×1+万年灵乳×10',            effect:'化神内破小瓶颈+40%',            toxin:35 },
      { name:'涅槃丹',      materials:'凤凰血×1+麒麟角×1+万年灵乳×10',           effect:'濒死恢复100%·冷却60天',         toxin:20 }
    ],
    // ---- 灵界篇（10种） ----
    spiritRealmPills: [
      { name:'虚灵丹',      materials:'灵界灵草×10+妖丹×10+虚空晶×1',           effect:'炼虚突破+20%',            toxin:50 },
      { name:'合和丹',      materials:'灵界灵草×15+妖丹×15+真龙鳞×1',            effect:'合体突破+20%',            toxin:60 },
      { name:'渡厄丹',      materials:'灵界灵草×20+妖丹×20+魂晶×3',              effect:'大乘突破+20%',            toxin:70 },
      { name:'渡劫圣丹',    materials:'灵界灵草×30+妖丹×30+麒麟角×2',             effect:'渡劫突破+25%',            toxin:80 },
      { name:'万年灵乳(炼)', materials:'万年灵乳×5+灵泉水×20',                    effect:'灵力全满+上限永久+200',    toxin:15 },
      { name:'养魂丹',      materials:'养魂木枝×3+魂晶×2+妖丹×10',               effect:'神识+300上限',             toxin:40 },
      { name:'太一丹',      materials:'灵界灵草×20+妖丹×15+真灵之血×1',            effect:'修为+5万',                 toxin:45 },
      { name:'九转金丹(灵界)',materials:'太一丹×1+妖丹×20+真龙血×1',               effect:'修为+15万·每转递增',        toxin:60 },
      { name:'破界丹(灵界)', materials:'灵界灵草×15+虚空晶×3+混沌石×1',            effect:'战斗中无视防御2回合',        toxin:30 },
      { name:'飞升丹',      materials:'灵界灵草×25+妖丹×25+真灵之血×2',            effect:'飞升灵界突破+25%',          toxin:50 }
    ],
    // ---- 仙界篇（8种） ----
    immortalPills: [
      { name:'飞仙丹',       effect:'飞升仙界+25%',          toxin:60 },
      { name:'鸿蒙丹',       effect:'修为+50万',              toxin:80 },
      { name:'悟道丹',       effect:'悟性永久+5(限服3次)',    toxin:30 },
      { name:'九转金丹(仙界)',effect:'修为+200万·每转递增',    toxin:100 },
      { name:'混沌丹',       effect:'修为+100万+全属+5%',     toxin:80 },
      { name:'轮回丹',       effect:'濒死满状态复活(一次性)',  toxin:50 },
      { name:'破障丹(仙界)', effect:'仙界内破小瓶颈+50%',     toxin:60 },
      { name:'道祖丹',       effect:'道祖突破条件之一+30%',   toxin:150 }
    ],
    // 所有丹药定价参考（按品阶分组，灵石）
    prices: {
      凡人练气: { 培元丹:15, 聚气散:45, 金创药:8, 止血散:6, 回灵丹:30, 清心丸:8, 辟谷丹:10, 轻身丹:25, 解毒散:12, 壮骨丸:22, 明目丹:18, 养气丸:25 },
      筑基:     { 筑基丹:200, 凝神丹:80, 生骨丹:50, 复灵膏:45, 炼体散:80, 隐息丹:40, 迷魂丹:60, 破瘴丹:35, 蓄力丹:50, 铁骨丸:100, 定风丹:35, 通脉丹:120 },
      金丹:     { 凝碧丹:350, 结金丹:800, 增元丹:550, 护脉丹:200, 破障丹:600, 聚神丹:250, 蛟血丹:750, 腾云丹:200, 破甲丹:200, 护心丹:500 },
      元婴:     { 化婴丹:3500, 炼神丹:2000, 天元丹:2500, 太清丹:4000, 金刚丹:5000, 破界丹:3500, 祛毒丹:1500, 裂魂丹:5000 }
    }
  },

  // ============================================================
  // 十二、符箓系统（34种）
  // ============================================================
  TALISMANS: {
    ranks: {
      灵符: { unlocked: '练气', successesNeeded: 5,  bonusPerLv: 3 },
      宝符: { unlocked: '筑基', successesNeeded: 10, bonusPerLv: 3 },
      古符: { unlocked: '金丹', successesNeeded: 20, bonusPerLv: 4 },
      天符: { unlocked: '元婴', successesNeeded: 40, bonusPerLv: 4 },
      仙符: { unlocked: '化神', successesNeeded: 80, bonusPerLv: 5 }
    },
    list: {
      灵符: [
        { name:'火球符', effect:'单体50火伤害',              cost:10 },
        { name:'冰刺符', effect:'单体40冰伤+概率冰冻',        cost:12 },
        { name:'金甲符', effect:'防御+20%持续3回合',           cost:10 },
        { name:'轻身符', effect:'赶路+30%持续7天',            cost:8 },
        { name:'遁地符', effect:'探索从战斗中撤离',           cost:15 },
        { name:'清水符', effect:'生成净水·解渴浇灌',           cost:3 },
        { name:'明目符', effect:'探查+10%持续3天',            cost:8 },
        { name:'聚灵符', effect:'修炼+15%持续3天',            cost:12 }
      ],
      宝符: [
        { name:'烈焰符', effect:'群体80火伤害',               cost:50 },
        { name:'玄冰符', effect:'单体100冰+冻结1回合',         cost:55 },
        { name:'金刚符', effect:'减伤40%持续3回合',            cost:45 },
        { name:'神行符', effect:'赶路x2持续7天',              cost:40 },
        { name:'隐匿符', effect:'隐藏气息15天·安全+30%',       cost:60 },
        { name:'雷暴符', effect:'单体150雷+麻痹',             cost:70 },
        { name:'回春符', effect:'战斗中恢复25%HP',            cost:50 },
        { name:'破禁符', effect:'破除低级禁制/阵法',           cost:80 }
      ],
      古符: [
        { name:'天火符',       effect:'群体300火+灼烧3回合',        cost:300 },
        { name:'玄天护体符',   effect:'无敌1回合(极限防御)',        cost:400 },
        { name:'乾坤遁符',     effect:'传送到已探索地点',           cost:500 },
        { name:'天雷符',       effect:'单体500雷+麻痹2回合',        cost:450 },
        { name:'化灵符',       effect:'战斗中灵力全满(一次性)',      cost:350 },
        { name:'摄魂符',       effect:'使对方混乱2回合',            cost:400 },
        { name:'土遁符',       effect:'致命危险自动传送回城',        cost:600 },
        { name:'万象符',       effect:'变化成见过的生物7天',         cost:550 }
      ],
      天符: [
        { name:'焚天符',       effect:'群体2000火+概率毁法宝',       cost:3000 },
        { name:'不动明王符',   effect:'减伤90%/5回合+反伤30%',       cost:3500 },
        { name:'破界传送符',   effect:'跨界传送(无视界域)',           cost:8000 },
        { name:'九天神雷符',   effect:'单体5000雷+对魔道x2',         cost:5000 },
        { name:'时间停滞符',   effect:'对方跳过1回合',              cost:10000 },
        { name:'回天符',       effect:'恢复100%HP+驱散全debuff',     cost:4000 }
      ],
      仙符: [
        { name:'灭世符',        effect:'群体5万伤害(可灭小城)',       cost:50000 },
        { name:'太虚护神符',    effect:'免疫神识攻击30天',           cost:80000 },
        { name:'轮回替身符',    effect:'代替死亡一次·无损复活',       cost:200000 },
        { name:'开天符',        effect:'撕裂虚空·开辟临时通道',       cost:500000 }
      ]
    },
    // 耐久度
    durability: { 天符: 3, 仙符: 5 }
  },

  // ============================================================
  // 十三、探索系统
  // ============================================================
  EXPLORATION: {
    // 每节点最多探索次数
    maxExploresPerNode: 3,
    // 普通野外事件概率
    wildEventPool: {
      采集灵草: 30, 遭遇妖兽: 20, 废弃洞府: 12, 灵泉眼: 8,
      矿石露头: 10, 遇到散修: 8,  陷阱: 5,     特殊天象: 5, 空手而归: 2
    },
    // 秘境事件概率
    secretEventPool: {
      禁制挡路: 25, 宝物出现: 20, 妖兽守护: 15, 传承试炼: 10,
      迷宫岔路: 10, 前人遗骸: 8,  传送陷阱: 5,  秘境崩塌: 5, 隐秘通道: 2
    },
    // 城镇事件概率
    townEventPool: {
      坊市摊位: 25, 酒馆情报: 15, 告示板任务: 15, 遇到熟人: 12,
      黑市入口: 10, 拍卖会: 8,   被人跟踪: 5,    街头比试: 5,
      秘闻: 3,     天降机缘: 2
    },
    // 宗门事件概率
    factionEventPool: {
      宗门任务: 25, 藏经阁: 20, 同门切磋: 15, 长老讲道: 12,
      灵药园: 10,   宗门仓库: 8, 同门求助: 5,  宗门大比: 3, 内奸事件: 2
    },
    // 秘境列表
    secretRealms: {
      人界: [
        { name:'血色禁地',   cd: 30,  recommend: '筑基~金丹', layers: 3,  rewards: '稀有灵药、结丹契机' },
        { name:'小寰天秘境', cd: 50,  recommend: '金丹~元婴', layers: 5,  rewards: '古宝、万年灵药' },
        { name:'虚天殿',     cd: 100, recommend: '元婴~化神', layers: 7,  rewards: '虚天鼎、玄天之宝' },
        { name:'昆吾山封印', cd: 0,   recommend: '元婴~化神', layers: 4,  rewards: '封印古宝、魔道传承' },
        { name:'星宫秘境',   cd: 0,   recommend: '金丹~元婴', layers: 3,  rewards: '星辰功法、星石' }
      ],
      灵界: [
        { name:'广灵洞天',   cd: 500, recommend: '炼虚~合体', layers: 5,  rewards: '通天灵宝、古修传承' },
        { name:'雷鸣秘境',   cd: 200, recommend: '合体~大乘', layers: 4,  rewards: '天雷竹、雷属性至宝' },
        { name:'血神秘境',   cd: 1000,recommend: '大乘~渡劫', layers: 6,  rewards: '真灵之血、血脉进化' }
      ],
      仙界: [
        { name:'源初秘境',   cd: 10000, recommend: '真仙~大罗', layers: 9,  rewards: '混沌至宝、本源法则' },
        { name:'轮回秘境',   cd: 0,     recommend: '大罗~道祖', layers: 6,  rewards: '轮回法则、大轮回术' }
      ]
    }
  },

  // ============================================================
  // 十四、地形/赶路 — 距离与速度
  // ============================================================
  TRAVEL: {
    // 赶路方式速度倍率
    methods: {
      人界: {
        步行:         { speed: 1,   cost: null },
        骑马:         { speed: 2,   cost: null },
        御器飞行:     { speed: 5,   cost: '灵力' },
        御剑飞行:     { speed: 10,  cost: '灵力' },
        传送阵:       { speed: 50,  cost: '200灵石' },
        血遁秘术:     { speed: 20,  cost: '消耗气血' }
      },
      灵界: {
        普通遁光:     { speed: 10,  cost: '灵力' },
        空间瞬移:     { speed: 50,  cost: '灵力' },
        大型传送阵:   { speed: 200, cost: '灵晶' },
        破空符:       { speed: 100, cost: '消耗符箓' },
        撕裂虚空:     { speed: 500, cost: '有迷路风险' }
      },
      仙界: {
        仙遁术:       { speed: 100,   cost: '灵力' },
        界域传送阵:   { speed: 1000,  cost: '仙灵石' },
        空间法则:     { speed: 5000,  cost: '耗法则' },
        挪移仙符:     { speed: 3000,  cost: '消耗符箓' },
        时空穿梭:     { speed: 10000, cost: '消耗寿元' },
        言出法随:     { speed: Infinity, cost: '道祖专属' }
      }
    },
    // 公式: 实际天数 = 基准距离 ÷ 速度倍率
    formula: '基准距离 / 速度倍率'
  },

  // ============================================================
  // 十五、交易系统 — 商店列表
  // ============================================================
  SHOPS: {
    // 青云山·杂货铺
    '青云山杂货铺': [
      { name: '灵草',       price: 5 },
      { name: '解毒草',     price: 8 },
      { name: '兽骨',       price: 8 },
      { name: '符纸(普)十张', price: 1 },
      { name: '朱砂',       price: 1 },
      { name: '疗伤绷带',   price: 5 }
    ],
    // 天南城店铺
    '天南城丹药铺': [
      { name: '培元丹',  price: 15 }, { name: '聚气散', price: 45 }, { name: '金创药', price: 8 },
      { name: '止血散',  price: 6 },  { name: '回灵丹', price: 30 }, { name: '清心丸', price: 8 },
      { name: '辟谷丹',  price: 10 }, { name: '轻身丹', price: 25 }, { name: '解毒散', price: 12 },
      { name: '壮骨丸',  price: 22 }, { name: '明目丹', price: 18 }, { name: '养气丸', price: 25 }
    ],
    '天南城法器阁': [
      { name: '基础飞剑', price: 100 }, { name: '青锋匕', price: 400 }, { name: '铁木盾', price: 150 },
      { name: '金丝甲',   price: 80 },  { name: '聚灵玉佩', price: 120 }, { name: '追风靴', price: 100 },
      { name: '火符剑',   price: 150 }, { name: '冰锥符器', price: 120 }, { name: '养气玉佩', price: 250 }
    ],
    '天南城符箓店': [
      { name: '火球符', price: 10 }, { name: '冰刺符', price: 12 }, { name: '金甲符', price: 10 },
      { name: '轻身符', price: 8 },  { name: '遁地符', price: 15 }, { name: '清水符', price: 3 },
      { name: '明目符', price: 8 },  { name: '聚灵符', price: 12 }
    ],
    '天南城功法阁': [
      { name: '引气诀(无+35%)',   price: 200 }, { name: '长春功(木+25%寿)', price: 250 },
      { name: '火鸦诀(火+25%炼)', price: 250 }, { name: '金锋诀(金+25%攻)', price: 250 },
      { name: '润土诀(土+25%防)', price: 250 }, { name: '柔水诀(水+25%灵)', price: 250 },
      { name: '疾风步(风+20%闪)', price: 300 }, { name: '碎岩劲(土金+20%破)', price: 300 }
    ],
    '天南城杂货铺': [
      { name: '灵草', price: 5 }, { name: '解毒草', price: 8 }, { name: '风铃草', price: 8 },
      { name: '清目花', price: 6 }, { name: '影花草', price: 12 }, { name: '阳花草', price: 10 },
      { name: '迷幻菇', price: 15 }, { name: '尖刺果', price: 10 }, { name: '灵泉水', price: 8 },
      { name: '兽骨', price: 8 }, { name: '符纸(普)十张', price: 1 }, { name: '朱砂', price: 1 }
    ],
    '天南城百宝楼': [
      { name: '灵兽环', price: 200 }, { name: '舍利子仿品', price: 300 },
      { name: '锁魂链', price: 600 }, { name: '阴沉竹剑', price: 500 },
      { name: '小乾坤罩', price: 4000, note: '展示' }, { name: '玄铁飞剑', price: 500 }, { name: '金环', price: 850 }
    ],
    // 黄枫谷店铺
    '黄枫谷丹药铺': [
      { name: '培元丹', price: 15 }, { name: '聚气散', price: 45 }, { name: '金创药', price: 8 },
      { name: '回灵丹', price: 30 }, { name: '壮骨丸', price: 22 },
      { name: '筑基丹', price: 200, note: '限购1' }, { name: '凝神丹', price: 80 }
    ],
    '黄枫谷法器阁': [
      { name: '基础飞剑', price: 100 }, { name: '铁木盾', price: 150 },
      { name: '金丝甲', price: 80 }, { name: '青锋匕', price: 400 }
    ],
    '黄枫谷符箓店': [
      { name: '火球符', price: 10 }, { name: '冰刺符', price: 12 },
      { name: '金甲符', price: 10 }, { name: '轻身符', price: 8 }
    ],
    '黄枫谷杂货铺': [
      { name: '灵草', price: 5 }, { name: '兽骨', price: 8 }, { name: '符纸(普)十张', price: 1 }, { name: '铁精', price: 25, note: '限量' }
    ],
    // 天星城店铺
    '天星城丹药铺': [
      { name: '凝碧丹', price: 350 }, { name: '结金丹', price: 800, note: '限购1' },
      { name: '增元丹', price: 550 }, { name: '护脉丹', price: 200 }, { name: '破障丹(金丹)', price: 600 },
      { name: '聚神丹', price: 250 }, { name: '蛟血丹', price: 750 }, { name: '腾云丹', price: 200 }, { name: '护心丹', price: 500 }
    ],
    '天星城法器阁': [
      { name: '玄铁飞剑', price: 500 }, { name: '赤鳞盾', price: 800 }, { name: '凝光甲', price: 2000 },
      { name: '雷火符剑', price: 2500 }, { name: '紫云嶂', price: 6000 }, { name: '云烟扇', price: 3000 },
      { name: '玄铁重尺', price: 3500 }, { name: '五行盘', price: 3000 }
    ],
    '天星城符箓店': [
      { name: '火球符', price: 10 }, { name: '冰刺符', price: 12 }, { name: '金甲符', price: 10 },
      { name: '轻身符', price: 8 }, { name: '遁地符', price: 15 }, { name: '清水符', price: 3 },
      { name: '明目符', price: 8 }, { name: '聚灵符', price: 12 }, { name: '烈焰符', price: 50 },
      { name: '玄冰符', price: 55 }, { name: '金刚符', price: 45 },
      { name: '天火符', price: 300, note: '限量' }, { name: '玄天护体符', price: 400, note: '限量' }
    ],
    '天星城功法阁': [
      { name: '青木诀(玄·木)', price: 500 }, { name: '烈焰功(玄·火)', price: 550 },
      { name: '厚土诀(玄·土)', price: 500 }, { name: '惊浪诀(玄·水)', price: 550 },
      { name: '锐金功(玄·金)', price: 500 }, { name: '御风诀(玄·风)', price: 500 }
    ],
    '天星城杂货铺': [
      { name: '寒玉芝', price: 20 }, { name: '紫芝', price: 30 }, { name: '玉髓', price: 80 },
      { name: '兽丹', price: 20 }, { name: '妖丹', price: 300 }, { name: '符纸(中)', price: 5 }
    ],
    '天星城百宝楼': [
      { name: '天遁神舟', price: 12000, note: '展示' }, { name: '蛟龙剪', price: 15000 },
      { name: '冰魄玄珠', price: 8000 }, { name: '七星剑(成套)', price: 9000 },
      { name: '五行环', price: 12000 }, { name: '金蚨子母刀', price: 9000 }
    ],
    // 大晋皇都店铺
    '大晋皇都丹药铺': [
      { name: '化婴丹', price: 3500, note: '限购1' }, { name: '炼神丹', price: 2000 },
      { name: '天元丹', price: 2500 }, { name: '太清丹', price: 4000 }, { name: '金刚丹', price: 5000 },
      { name: '破界丹(元婴)', price: 3500 }, { name: '祛毒丹', price: 1500 }, { name: '裂魂丹', price: 5000 }
    ],
    '大晋皇都法器阁': [
      { name: '金光罩', price: 10000 }, { name: '落魂钟', price: 12000 }, { name: '月华轮', price: 7000 },
      { name: '混天绫', price: 6000 }, { name: '紫电锤', price: 8000 }, { name: '百毒珠', price: 4000 },
      { name: '化血刀', price: 7500 }, { name: '乾天符宝', price: 30000 }
    ],
    '大晋皇都符箓店': [
      { name: '烈焰符', price: 50 }, { name: '玄冰符', price: 55 }, { name: '金刚符', price: 45 },
      { name: '神行符', price: 40 }, { name: '隐匿符', price: 60 }, { name: '雷暴符', price: 70 },
      { name: '回春符', price: 50 }, { name: '破禁符', price: 80 },
      { name: '天火符', price: 300 }, { name: '玄天护体符', price: 400 }, { name: '乾坤遁符', price: 500 },
      { name: '天雷符', price: 450 }, { name: '化灵符', price: 350 }, { name: '摄魂符', price: 400 },
      { name: '土遁符', price: 600 }, { name: '万象符', price: 550 },
      { name: '焚天符', price: 3000 }, { name: '不动明王符', price: 3500, note: '限购1' }
    ],
    '大晋皇都功法阁': [
      { name: '大衍诀残篇(天)', price: 5000 }, { name: '梵圣真魔功残(地)', price: 3000 },
      { name: '天罗遁术(天·风)', price: 10000 }, { name: '玄天造化功(天·无)', price: 15000 }
    ],
    '大晋皇都杂货铺': [
      { name: '雷击木', price: 150 }, { name: '养魂木叶', price: 100 }, { name: '金刚石', price: 300 },
      { name: '万年灵芝', price: 250 }, { name: '虚空石', price: 500 }, { name: '云鹤羽', price: 40 }, { name: '魂晶', price: 600 }
    ]
  },

  // ============================================================
  // 十六、材料统一定价
  // ============================================================
  MATERIALS: {
    // 人界基础材料
    basic: {
      灵草: 5, 解毒草: 8, 风铃草: 8, 清目花: 6, 影花草: 12, 阳花草: 10,
      迷幻菇: 15, 尖刺果: 10, 灵泉水: 8
    },
    // 人界中级材料
    medium: {
      寒玉芝: 20, 紫芝: 30, 铁精: 25, 兽骨: 8, 兽丹: 20, 妖丹: 300,
      符纸普: 1, 符纸中: 5, 朱砂: 1
    },
    // 人界高级材料
    advanced: {
      玉髓: 80, 雷击木: 150, 养魂木叶: 100, 养魂木枝: 500,
      软玉膏: 60, 金刚石: 300, 万年灵芝: 250, 虚空石: 500, 云鹤羽: 40
    },
    // 人界稀有材料
    rare: {
      龙鳞: 800, 蛟龙血: 400, 麒麟角: 2000, 凤羽: 1500,
      凤凰血: 3000, 万年灵乳原液: 500, 魂晶: 600
    },
    // 灵界材料（灵晶计价）
    spiritRealm: {
      灵界灵草: 0.5, 虚空晶: 2, 空晶: 3, 真龙鳞: 5,
      真灵之血: 10, 混沌石: 50, 法则碎片: 100
    }
  },

  // ============================================================
  // 十七、战斗系统
  // ============================================================
  COMBAT: {
    // 暴击倍率
    critMultiplier: 1.5,
    // 伤害公式参数
    damageParams: {
      physicalDefFactor: 0.5,
      magicResistFactor: 0.3,
      spiritResistFactor: 0.5
    },
    // 战斗丹药
    battlePills: {
      金创药:   { effect: '恢复30%气血', available: '战斗中' },
      止血散:   { effect: '恢复15%气血', available: '战斗中' },
      蓄力丹:   { effect: '攻击+20%持续3回合' },
      破甲丹:   { effect: '破甲3回合' },
      护心丹:   { effect: '濒死自动恢复30%HP(一次性)' },
      裂魂丹:   { effect: '神识攻击+50%持续3回合(战后虚弱7天)' },
      涅槃丹:   { effect: '濒死恢复100%·冷却60天' }
    },
    // 保命手段检查顺序
    deathSaveOrder: [
      { condition: '涅槃Buff',       effect: '消耗恢复50%HP继续战斗' },
      { condition: '涅槃丹/轮回替身符',effect: '消耗，满状态复活继续' },
      { condition: '掌天瓶绿液≥3滴',  effect: '消耗3滴，恢复25%HP' },
      { condition: '梵圣真魔功·肉身重生', effect: '30%概率恢复30%HP' },
      { condition: '灵兽主动挡刀',     effect: '灵兽完整度/HP-30%' }
    ],
    // 战败惩罚
    defeat: {
      spiritStoneLoss: 0.10,   // 扣除携带灵石的10%
      arrival: '最近安全城镇',
      debuff: '重伤(修炼速度-50%持续3天)',
      pets: '出战灵兽全部濒死'
    }
  },

  // ============================================================
  // 十八、灵兽系统
  // ============================================================
  PETS: {
    // 群居公式 N^0.6
    swarmFormula: '单体属性 × N^0.6',
    swarmExamples: {
      1: 1.0, 10: 3.98, 100: 15.85, 500: 41.54, 1000: 63.10, 5000: 158.49, 9999: 251.19
    },
    // 各境界最高控制数量
    controlLimit: {
      筑基: 10, 金丹: 50, 元婴: 200, 化神: 500, 炼虚: 2000, 合体: 5000, 大乘: 9999
    },
    // 品阶对照
    ranks: {
      1: '练气', 2: '筑基', 3: '筑基', 4: '金丹', 5: '金丹',
      6: '元婴~化神', 7: '元婴~化神', 8: '炼虚~合体', 9: '大乘~渡劫'
    },
    // 核心灵兽
    core: [
      { name:'噬金虫',   rank:9, type:'群居',   desc:'吞噬万物·可进化·繁殖需金属矿石' },
      { name:'啼魂兽',   rank:7, type:'单养',   desc:'克阴魂鬼物·神识辅助' },
      { name:'六翼霜蚣', rank:7, type:'坐骑',   desc:'冰属性·飞行坐骑·极寒之地获取' },
      { name:'银翅夜鹏', rank:6, type:'坐骑',   desc:'速度型飞行·夜间加成·拍卖会获取' },
      { name:'金童',     rank:9, type:'单养',   desc:'防御极高·后期进化·灵界获取' },
      { name:'豹麟兽',   rank:5, type:'坐骑',   desc:'陆地坐骑·速度快·慕兰草原' }
    ],
    // 养成操作
    feeding: { 1: 5, 9: 2000 }, // 口粮灵石/日
    train: { days: 3, growthRange: [5, 10] },
    battle: { growthRange: [10, 20], loyaltyGain: 2 },
    heal: { days: 2 },
    breed: { days: 7 },
    evolve: { days: [7, 30] }
  },

  // ============================================================
  // 十九、宗门系统
  // ============================================================
  FACTIONS: {
    renjie: {
      正道七宗: ['掩月宗','落云宗','黄枫谷','天阙堡','清虚门','百巧院','灵兽山'],
      魔道六宗: ['天煞宗','鬼灵门','御灵宗','合欢宗','天魔宗','阴罗宗'],
      乱星海:   ['星宫','天星城','妙音门','极阴岛','执法殿'],
      大晋:     ['皇室','天道盟','万宝楼','向之礼联盟','散修联盟'],
      独立:     ['七玄门','暗月','血禁守门人']
    }
  },

  // ============================================================
  // 二十、NPC好感度系统
  // ============================================================
  NPC: {
    favorStages: [
      { range: [0, 20],   title: '陌生', discount: 1.0,  unlocks: '基础对话+原价交易' },
      { range: [21, 40],  title: '认识', discount: 0.95, unlocks: '简单任务+9.5折+查看信息' },
      { range: [41, 60],  title: '友善', discount: 0.90, unlocks: '高难任务+9折+情报共享+邀请探索' },
      { range: [61, 80],  title: '信任', discount: 0.80, unlocks: '私密任务+8折+赠送+结盟' },
      { range: [81, 95],  title: '亲密', discount: 0.70, unlocks: '传承任务+7折+双修+调用资源' },
      { range: [96, 100], title: '至交', discount: 0.60, unlocks: '全部传承+6折+舍命相救+专属信物' }
    ],
    // 好感增减
    favorChanges: {
      送礼:   [2, 50],
      完成任务:[10, 30],
      聊天:   [1, 3],
      援护:   [5, 15],
      同行:   [3, 10],
      救命之恩:[30, 50],
      赠送灵兽法宝:[20, 50],
      坑NPC:  [-50, -10],
      杀亲友: [-50, -1]
    },
    // 双修条件
    dualCultivation: {
      minFavor: 80,
      maxLevelDiff: 1,
      普通: { days: 7,  speed: 30,  favorGain: 2 },
      深层: { days: 15, speed: 80,  favorGain: 5, mpBonus: 5 },
      功法: { days: 30, speed: 150, favorGain: 10, breakBonus: 3 },
      元阴元阳: { firstTime: true, mpBonus: 10 }
    }
  },

  // ============================================================
  // 二十一、掌天瓶系统
  // ============================================================
  SKY_BOTTLE: {
    // 功能按境界解锁
    features: {
      练气: { greenDrop: 30, storage: 10, features: ['基础催熟(+50年)'], fields: 0, timeAccel: 1 },
      筑基: { greenDrop: 25, storage: 20, features: ['主动凝聚(10天+40%灵力)'], fields: 0, timeAccel: 1 },
      金丹: { greenDrop: 20, storage: 50, features: [], fields: 1, timeAccel: 1 },
      元婴: { greenDrop: 15, storage: 100, features: ['绿液+200年份'], fields: 3, timeAccel: 2 },
      化神: { greenDrop: 10, storage: 200, features: ['绿液+800年份·涂法宝0.5%+1'], fields: 5, timeAccel: 3 },
      灵界: { greenDrop: 7,  storage: 500, features: ['绿液+1500年份'], fields: 10, timeAccel: 4 },
      大罗:  { greenDrop: 0,  storage: Infinity, features: ['绿液+万年·法则催熟'], fields: Infinity, timeAccel: 10 }
    },
    // 绿液用途（20种）
    greenLiquidUses: [
      { name: '催熟灵草',       cost: 1,  effect: '+对应年份' },
      { name: '催熟灵果树',     cost: 5,  effect: '年份翻倍' },
      { name: '灌溉灵田',       cost: 1,  effect: '肥沃+10%/7天' },
      { name: '炼丹辅料',       cost: 1,  effect: '品质+1档' },
      { name: '涂抹法宝',       cost: 3,  effect: '0.5%+1品阶' },
      { name: '疗伤',           cost: 1,  effect: '恢复30%HP+解毒' },
      { name: '灵力速充',       cost: 1,  effect: '恢复50%灵力' },
      { name: '灵兽喂养',       cost: 1,  effect: '成长+15%·忠诚+3' },
      { name: '口服修炼',       cost: 1,  effect: '修为+50·丹毒1·冷却7天' },
      { name: '提升突破率',     cost: 3,  effect: '+5%' },
      { name: '破解禁制',       cost: 5,  effect: '古宝级50%' },
      { name: '器灵化形',       cost: 10, effect: '绿儿出战3回合' },
      { name: '修复法宝',       cost: [5, 50], effect: '按损坏程度' },
      { name: '炼制灵乳',       cost: 10, effect: '回蓝圣品' },
      { name: '魂体温养',       cost: 3,  effect: '神识+5临时' },
      { name: '植物复活',       cost: 5,  effect: '救活枯死' },
      { name: '改造灵田',       cost: 20, effect: '改变属性偏向' },
      { name: '灵田扩容',       cost: 10, effect: '每块' },
      { name: '法则催熟',       cost: 100,effect: '法则感悟+1%·完全体解锁' },
      { name: '创造灵宝',       cost: 1000,effect: '唯一·完全体' }
    ],
    // 仓库容量
    storageCapacity: '灵田块数 × 50'
  },

  // ============================================================
  // 二十二、时间与天气
  // ============================================================
  TIME: {
    // 季节天气概率(%)
    seasons: {
      春: { 晴:35, 阴:25, 雨:25, 雷雨:10, 潮汐:5 },
      夏: { 晴:45, 阴:15, 雨:15, 雷雨:20, 潮汐:5 },
      秋: { 晴:40, 阴:20, 雨:20, 雷雨:8, 雪:8, 暴雪:2, 潮汐:2 },
      冬: { 晴:30, 阴:15, 雨:5, 雷雨:2, 雪:30, 暴雪:15, 潮汐:3 }
    },
    // 周期性大事件
    events: {
      每年:  ['1/1新年(全属+5%持续3天)', '夏至灵气潮汐(修炼+20%持续7天)', '12月年末结算'],
      每10年:['天南城大型拍卖会', '各宗门大比(元婴以下参加)'],
      每30年:['血色禁地开启(筑基~金丹·限30天)'],
      每50年:['小寰天秘境开启(金丹~元婴)'],
      每100年:['虚天殿开启(元婴~化神·限90天)', '星宫秘藏开放'],
      每500年:['灵界·广灵洞天开启'],
      每1000年:['灵界·血神秘境开启'],
      不定期:['昆吾山封印松动', '天降陨铁', '异火出世', '古魔复苏', '源初秘境入口现世']
    }
  },

  // ============================================================
  // 二十三、Currency/Pricing
  // ============================================================
  ECONOMY: {
    currencyRates: { 灵石: 1, 灵晶: 1000, 仙灵石: 1000000 },
    // 灵石庄
    bank: {
      depositFree: true,
      crossRealmFee: 0.01,
      annualInterest: 0.03,
      bankruptcyRate: 0.001
    },
    // 物价浮动
    priceFluctuation: {
      拍卖会: -0.10, 秘境: 0.30, 季节: 0.20, 战争: 0.50, 灵气潮汐: [0.10, 0.20]
    },
    // 黑市
    blackMarket: {
      '天南★': { safety: 50, itemCap: '法宝' },
      '乱星海★★': { safety: 40, itemCap: '古宝' },
      '大晋★★★': { safety: 30, itemCap: '玄天碎片' },
      '灵界★★★★': { safety: 20, itemCap: '通天灵宝' },
      '仙界★★★★★★★': { safety: 10, itemCap: '先天灵宝' }
    },
    // 黑市熟客度
    vipLevels: { 100: '9折', 300: '优质货源', 500: 'VIP房间', 1000: '黑市拍卖会', 2000: '禁忌情报' }
  },

  // ============================================================
  // 二十四、名望系统
  // ============================================================
  REPUTATION: {
    range: [-100, 100],
    正道: { high: 50, bonus: '正道NPC好感+10·可进正道禁地', low: -50, penalty: '被正道通缉' },
    魔道: { high: 50, bonus: '魔道好感+10·黑市折扣',       low: -50, penalty: '被魔道追杀' },
    击杀: { 正道: -15, 魔道: +5, 魔道2: -15, 正道2: +5, 中立: -5 }
  },

  // ============================================================
  // 二十五、门派职位晋升
  // ============================================================
  RANKS: {
    subStageNames: ['初期', '中期', '后期', '圆满']
  },

  // ============================================================
  // 二十六、飞升渡劫
  // ============================================================
  ASCENSION: {
    preparationActions: 3,
    // 渡劫流程
    加固肉身: { cost: '消耗灵石', effect: '提升成功率' },
    准备防御法宝: { cost: '需背包有法宝', effect: '挡天雷' },
    炼制渡劫丹: { cost: '炼丹系统', effect: '提升成功率' },
    // 渡劫判定
    天雷降临: { hpLoss: 0.50 },
    // 失败惩罚
    fail: { cultivationLoss: 0.50, lifespanLoss: 50 }
  },

  // ============================================================
  // 二十七、陨落系统
  // ============================================================
  DEATH: {
    options: {
      坐化:     { req: null,        inherit: { bag: 0,  法宝: 0,  灵兽: 0,  灵石: 0,  功法: 0,  神识: 0 } },
      转世:     { req: '神识≥500',   inherit: { bag: 0,  法宝: 0,  灵兽: 0,  灵石: 0,  功法: 0,  神识: 0.10 } },
      夺舍:     { req: '神识≥1000',  inherit: { bag: 1,  法宝: 0,  灵兽: 0,  灵石: 1,  功法: 1,  神识: 1 } },
      兵解重修: { req: null,        inherit: { bag: 0.5, 法宝: 0.5, 灵兽: 0.5, 灵石: 0.5, 功法: 1, 神识: 0.5 } },
      身外化身: { req: '材料+古宝级容器', inherit: { bag: 1, 法宝: 1, 灵兽: 1, 灵石: 1, 功法: 1, 神识: 1 } },
      天人五衰: { req: '大罗以上寿元尽',  inherit: { bag: 0, 法宝: 0, 灵兽: 0, 灵石: 0, 功法: 0, 神识: 0 } }
    }
  },

  // ============================================================
  // 二十八、怪物图鉴（165种）
  // ============================================================
  MONSTERS: {
    // -- 人界·天南·青云山 --
    山野狼:       { realm:'凡人后', hp:30,  atk:8,  def:3,  skills:'撕咬1.2x', drop:'狼皮60%', note:null },
    毒腹蛇:       { realm:'凡人后', hp:20,  atk:10, def:2,  skills:'毒牙(中毒2回)', drop:'蛇胆40%', note:null },
    黑纹豹:       { realm:'练气初', hp:60,  atk:15, def:5,  skills:'扑击1.5x·撕咬', drop:'豹骨50%', note:null },
    百年山魈:     { realm:'练气中', hp:80,  atk:18, def:6,  skills:'石投·冲撞1.3x', drop:'山魈皮30%·兽丹10%', note:null },
    墨大夫_BOSS:  { realm:'练气后', hp:150, atk:25, def:10, skills:'毒术·金针1.8x', drop:'墨玉含章(剧情)+修为+50', note:'BOSS' },

    // -- 人界·天南·黑风林 --
    黑风狼:       { realm:'练气中', hp:70,  atk:20, def:4,  skills:'疾速撕咬1.3x', drop:'狼牙×2', note:null },
    毒纹蛛:       { realm:'练气后', hp:50,  atk:22, def:3,  skills:'蛛网(缠绕)+毒液', drop:'蛛丝×3', note:null },
    风吼蝠:       { realm:'练气后', hp:40,  atk:18, def:2,  skills:'音波攻击(无视50%防)', drop:'蝠翼', note:null },
    黑风鹫_精英:  { realm:'筑基初', hp:200, atk:35, def:8,  skills:'俯冲2.0x', drop:'鹫爪·兽丹20%', note:'精英' },

    // -- 人界·天南·黄枫谷周边 --
    石甲龟:       { realm:'练气后', hp:120, atk:12, def:15, skills:'缩壳(防x2)', drop:'龟甲', note:null },
    青木蟒:       { realm:'筑基初', hp:180, atk:30, def:10, skills:'绞杀·毒牙', drop:'蟒皮·毒囊', note:null },
    赤腹蝎:       { realm:'筑基初', hp:100, atk:35, def:5,  skills:'毒尾刺2.0x(中毒3回)', drop:'蝎尾·毒液', note:null },
    傀儡守卫_精英:{ realm:'筑基中', hp:300, atk:40, def:20, skills:'纯物理', drop:'铁精×3', note:'精英' },

    // -- 人界·天南·血禁山脉/血色禁地 --
    血纹蟒:       { realm:'筑基中', hp:250, atk:45, def:12, skills:'血焰吐息(火伤+灼烧)', drop:'蟒血·鳞片', note:null },
    毒血蝎:       { realm:'筑基中', hp:150, atk:50, def:8,  skills:'毒尾2.2x', drop:'蝎毒晶', note:null },
    血蝙蝠_群:    { realm:'筑基初', hp:'80×N',atk:'25×N',def:3, skills:'吸血(恢复30%)', drop:'蝠血', note:'群居' },
    石灵_精英:    { realm:'筑基后', hp:500, atk:30, def:35, skills:'石肤·重击2.0x', drop:'石心·土灵晶', note:'精英' },
    嗜金蚁_精英群:{ realm:'筑基中', hp:'100×N',atk:'20×N',def:5,skills:'噬咬(破甲)', drop:'蚁酸·甲壳', note:'精英·群居' },
    鬼面蜈蚣_精英:{ realm:'筑基后', hp:350, atk:55, def:12, skills:'毒雾(范围)+缠绕', drop:'蜈蚣毒囊', note:'精英' },
    守护灵兽_BOSS: { realm:'金丹初', hp:800, atk:80, def:25, skills:'灵气弹·藤蔓·守护咆哮', drop:'稀有灵药+修为+300', note:'BOSS' },

    // -- 人界·天南·落云宗周边 --
    铁羽鹰:       { realm:'筑基中', hp:200, atk:50, def:10, skills:'俯冲2.0x', drop:'铁羽×5', note:null },
    云纹鹿:       { realm:'筑基初', hp:150, atk:20, def:8,  skills:'无攻击性(可捕捉)', drop:'鹿茸(药材)', note:null },
    巡逻傀儡:     { realm:'筑基中', hp:250, atk:35, def:25, skills:'纯物理', drop:'傀儡零件', note:null },

    // -- 人界·天南·天南禁地 --
    禁制守卫_傀儡:{ realm:'金丹初', hp:600, atk:70, def:30, skills:'剑气斩1.8x', drop:'玄铁·灵石', note:null },
    机关石兽:     { realm:'金丹中', hp:800, atk:60, def:40, skills:'冲撞·石弹', drop:'石心·古法残片', note:null },
    传送阵守护灵_BOSS:{ realm:'金丹后',hp:1200,atk:100,def:35,skills:'空间切割2.5x·传送禁锢', drop:'传送令符+修为+500', note:'BOSS' },

    // -- 人界·天南·灵兽山 --
    妖化灵猴:     { realm:'筑基后', hp:220, atk:50, def:10, skills:'灵猴拳1.5x', drop:'猴儿酒(特殊)', note:null },
    金毛狈:       { realm:'金丹初', hp:400, atk:75, def:18, skills:'狡诈(概率闪避)', drop:'狈皮·妖丹15%', note:null },
    驯兽师_NPC:   { realm:'金丹中', hp:500, atk:60, def:20, skills:'御兽(召唤1只)·鞭笞', drop:'灵石+御兽法诀', note:'NPC战' },

    // -- 人界·乱星海·天星城周边海域 --
    锯齿鲨:       { realm:'金丹初', hp:500, atk:80, def:15, skills:'噬咬2.0x', drop:'鲨鳍·兽丹20%', note:null },
    电光水母:     { realm:'金丹初', hp:300, atk:90, def:5,  skills:'电击(麻痹1回)+群伤', drop:'水母晶核', note:null },
    巨钳蟹:       { realm:'金丹中', hp:600, atk:70, def:30, skills:'巨钳2.0x', drop:'蟹壳(炼器)', note:null },
    蛟_精英:      { realm:'金丹后', hp:1000,atk:120,def:25,skills:'水龙弹2.5x·召唤水兽', drop:'蛟鳞×3·妖丹40%', note:'精英' },

    // -- 人界·乱星海·魁星岛 --
    石傀:         { realm:'金丹初', hp:700, atk:50, def:35, skills:'重拳1.5x', drop:'灵石矿碎片', note:null },
    矿洞毒蛛:     { realm:'金丹中', hp:400, atk:85, def:10, skills:'毒丝(缠绕+中毒)', drop:'毒丝×5', note:null },

    // -- 人界·乱星海·小寰天秘境 --
    藤妖:         { realm:'金丹中', hp:600, atk:70, def:20, skills:'藤鞭2.0x(缠绕)', drop:'灵木芯', note:null },
    幻雾蝶:       { realm:'金丹中', hp:250, atk:60, def:8,  skills:'幻雾(混乱1回)', drop:'幻蝶鳞粉', note:null },
    秘境石人_精英:{ realm:'金丹后', hp:1200,atk:80, def:50, skills:'地裂震·巨石投', drop:'土元晶·石心', note:'精英' },
    万载灵药守护兽_BOSS:{ realm:'元婴初',hp:2500,atk:150,def:40,skills:'灵气风暴3.0x·生命恢复', drop:'万年灵药+修为+1200', note:'BOSS' },

    // -- 人界·乱星海·虚天殿 --
    冰妖:         { realm:'元婴初', hp:1500,atk:130,def:30,skills:'冰锥术2.0x(冰冻)', drop:'冰晶核', note:null },
    火妖:         { realm:'元婴初', hp:1200,atk:150,def:20,skills:'火球术2.5x(灼烧)', drop:'火晶核', note:null },
    金甲傀儡_精英:{ realm:'元婴中', hp:2500,atk:120,def:60,skills:'金剑斩2.5x', drop:'金精×3', note:'精英' },
    冰火双煞_精英双:{ realm:'元婴中',hp:'1800×2',atk:'160×2',def:25,skills:'冰火合击3.5x', drop:'冰火晶·妖丹60%', note:'精英·双' },
    虚天鼎守护灵_BOSS:{ realm:'元婴后',hp:5000,atk:200,def:50,skills:'空间镇压·灵气风暴·鼎镇4.0x', drop:'虚天鼎(古宝)+修为+3000', note:'BOSS' },

    // -- 人界·乱星海·妖兽群岛 --
    铁背龟:       { realm:'金丹后', hp:1500,atk:60, def:55,skills:'缩壳(防x3)', drop:'龟甲(炼器)·妖丹25%', note:null },
    血瞳猿:       { realm:'元婴初', hp:1800,atk:160,def:20,skills:'狂暴(攻+50%防-30%)·巨石', drop:'猿心血·妖丹30%', note:null },
    金翅鹏_精英:  { realm:'元婴中', hp:2000,atk:180,def:25,skills:'俯冲3.0x·撕裂', drop:'金羽×5·妖丹50%', note:'精英' },
    妖王_BOSS:    { realm:'元婴后', hp:5000,atk:250,def:55,skills:'妖气弹·妖化·领域压制', drop:'妖王丹+修为+2000', note:'BOSS' },

    // -- 人界·乱星海·陨铁岛 --
    铁甲蟹:       { realm:'金丹后', hp:1000,atk:80, def:40,skills:'钳击1.8x', drop:'铁甲壳·蟹黄(炼丹)', note:null },
    陨铁矿傀儡_精英:{ realm:'元婴初',hp:3000,atk:100,def:70,skills:'铁拳2.0x·冲撞', drop:'陨铁精矿×3', note:'精英' },

    // -- 人界·乱星海·魔岛 --
    魔化骨兵:     { realm:'元婴初', hp:1500,atk:140,def:15,skills:'骨矛2.0x', drop:'骨粉(制符)·魔气结晶', note:null },
    血修_NPC:     { realm:'元婴中', hp:2000,atk:170,def:20,skills:'血术(吸血)·血爆3.0x(自损)', drop:'灵石+血道功法碎片', note:'NPC战' },
    魔岛岛主_BOSS:{ realm:'元婴后', hp:4000,atk:220,def:40,skills:'魔气灌体·血魔大法', drop:'魔道功法+灵石+修为+1500', note:'BOSS' },

    // -- 人界·乱星海·海族海域 --
    巡海夜叉:     { realm:'金丹中', hp:700, atk:100,def:20,skills:'三叉戟2.0x', drop:'夜叉鳞', note:null },
    蟹将:         { realm:'金丹后', hp:1200,atk:90, def:40,skills:'横扫1.8x', drop:'蟹将甲壳', note:null },
    海族祭祀_精英:{ realm:'金丹后', hp:900, atk:130,def:15,skills:'水法·治疗', drop:'海族法珠', note:'精英' },

    // -- 人界·大晋·古战场 --
    阴魂:         { realm:'元婴初', hp:800, atk:120,def:10,skills:'阴气侵蚀(神识伤害)', drop:'魂晶碎片', note:null },
    骷髅战将:     { realm:'元婴中', hp:2000,atk:150,def:30,skills:'骨刀2.0x', drop:'古战骨', note:null },
    古战魂_精英:  { realm:'元婴后', hp:3000,atk:200,def:20,skills:'战意爆发3.0x·横扫', drop:'战魂晶·古宝残片15%', note:'精英' },
    远古将军_BOSS:{ realm:'化神初', hp:6000,atk:280,def:50,skills:'军阵·破军斩4.0x', drop:'古宝+功法残篇+修为+3000', note:'BOSS' },

    // -- 人界·大晋·昆吾山 --
    魔化巨蝠:     { realm:'元婴中', hp:1800,atk:160,def:15,skills:'音波·吸血', drop:'蝠翼·魔气石', note:null },
    封印守卫_傀儡:{ realm:'元婴后', hp:3000,atk:130,def:65,skills:'镇魔法阵(禁锢)', drop:'古傀儡核心', note:null },
    魔化妖将_精英:{ realm:'化神初', hp:4000,atk:250,def:35,skills:'魔刃斩3.0x·魔气爆发', drop:'魔晶·妖丹70%', note:'精英' },
    古魔分身_BOSS:{ realm:'化神中', hp:10000,atk:350,def:70,skills:'魔焰滔天·天魔乱舞·魔域', drop:'封印碎片+修为+5000+梵圣真魔功残', note:'BOSS' },

    // -- 人界·大晋·万年灵木禁地 --
    千年藤妖:     { realm:'元婴后', hp:2500,atk:140,def:30,skills:'藤鞭群攻·缠绕', drop:'灵木液', note:null },
    万年木灵_精英:{ realm:'化神初', hp:5000,atk:200,def:40,skills:'木灵盾(回血)·根须缠绕', drop:'万年木心', note:'精英' },
    木灵守护者_BOSS:{ realm:'化神中',hp:12000,atk:300,def:60,skills:'万木大阵·生命汲取·灵木斩4.0x', drop:'万古长青诀+修为+5000', note:'BOSS' },

    // -- 人界·大晋·慕兰草原 --
    疾风狼:       { realm:'元婴中', hp:1500,atk:170,def:15,skills:'风刃2.0x·狼群(增援)', drop:'狼牙·兽丹20%', note:null },
    草原巨蜥:     { realm:'元婴后', hp:3500,atk:150,def:40,skills:'尾扫·毒牙2.0x', drop:'蜥皮(炼器)·毒囊', note:null },
    慕兰勇士_NPC: { realm:'元婴后', hp:2500,atk:200,def:25,skills:'骑射·弯刀2.5x', drop:'灵石+慕兰图腾(特殊)', note:'NPC战' },

    // -- 人界·大晋·北凉国 --
    冰原熊:       { realm:'元婴后', hp:4000,atk:220,def:40,skills:'拍击2.0x·冰息(冰冻)', drop:'熊胆(炼丹)·兽丹20%', note:null },
    雪女_精英:    { realm:'化神初', hp:3000,atk:240,def:20,skills:'冰风暴(群攻+冰冻)·冰锥3.0x', drop:'冰晶核·千年玄冰', note:'精英' },

    // -- 人界·堕落魔渊 --
    低阶心魔:     { realm:'化神初', hp:2000,atk:200,def:15,skills:'心魔侵蚀(神识伤害+混乱)', drop:'心魔碎片', note:null },
    魔界甲士:     { realm:'化神中', hp:5000,atk:280,def:45,skills:'魔枪2.5x·魔甲术', drop:'魔甲碎片·魔晶石', note:null },
    深渊魔将_精英:{ realm:'化神后', hp:8000,atk:350,def:50,skills:'魔焰斩3.5x·召唤魔物', drop:'魔将核心+修为+1000', note:'精英' },
    古魔使徒_BOSS:{ realm:'炼虚初', hp:20000,atk:450,def:80,skills:'魔域降临·大魔神通', drop:'界面碎片+修为+10000', note:'BOSS' },

    // -- 灵界·飞升台 --
    虚空兽:       { realm:'化神后', hp:8000,atk:400,def:60,skills:'空间撕裂3.0x(无视50%防)', drop:'虚空晶碎片·灵晶×10', note:null },
    灵界接引者_NPC:{ realm:'炼虚初', hp:null, note:'友方NPC·提供灵界情报' },

    // -- 灵界·人族边境城 --
    流窜匪修_NPC: { realm:'炼虚初', hp:6000,atk:350,def:40,skills:'刀法·暗器·逃跑(HP<30%)', drop:'灵石×200·随机物品', note:'NPC战' },
    异族密探_NPC: { realm:'炼虚中', hp:8000,atk:400,def:35,skills:'隐匿刺2.5x·毒药', drop:'异族情报·灵石×500', note:'NPC战' },

    // -- 灵界·天渊城 --
    异族先锋:     { realm:'炼虚中', hp:10000,atk:500,def:50,skills:'异术·冲锋2.0x', drop:'异族符文·灵晶×20', note:null },
    角蚩族战士:   { realm:'炼虚后', hp:15000,atk:600,def:70,skills:'魔化·角击2.5x', drop:'角蚩角(炼器)·灵晶×30', note:null },
    战场督军_精英:{ realm:'合体初', hp:30000,atk:800,def:100,skills:'战吼(全属+20%)·军阵斩3.0x', drop:'督军令牌·灵晶×100', note:'精英' },
    天渊巨兽_BOSS:{ realm:'合体中', hp:80000,atk:1200,def:200,skills:'攻城撞击4.0x·范围践踏·怒吼(恐惧)', drop:'巨兽之核+灵晶×500+修为+3万', note:'BOSS' },

    // -- 灵界·万妖山脉 --
    巡山小妖:     { realm:'炼虚后', hp:10000,atk:450,def:40,skills:'妖爪1.8x·逃回喊人', drop:'妖兽血·灵晶×10', note:null },
    化形妖修_NPC: { realm:'合体初', hp:20000,atk:700,def:80,skills:'妖术·本命法宝·可劝退', drop:'妖丹·灵晶×50·妖族功法残篇', note:'NPC战' },
    碧鳞蟒:       { realm:'合体中', hp:30000,atk:650,def:60,skills:'蛇毒·绞杀·碧鳞盾', drop:'碧鳞片·蛇毒囊·妖丹40%', note:null },
    金翅大鹏_精英:{ realm:'合体后', hp:40000,atk:1000,def:50,skills:'俯冲4.0x·风刃群攻·极速(2动)', drop:'金羽×5·鹏血·妖丹60%', note:'精英' },
    真龙族守卫_精英:{ realm:'合体后',hp:60000,atk:900,def:150,skills:'龙威(-20%攻)·龙息3.5x·摆尾', drop:'龙鳞·龙血·灵晶×200', note:'精英' },
    万妖之王_BOSS:{ realm:'大乘初', hp:150000,atk:1500,def:250,skills:'万妖领域·真灵之身·天妖灭世5.0x', drop:'真灵之血+万妖令+修为+8万', note:'BOSS' },

    // -- 灵界·浮灵秘境 --
    浮游灵石:     { realm:'合体初', hp:10000,atk:300,def:20,skills:'灵压爆破(自爆·范围)', drop:'浮灵石碎片·灵晶×30', note:null },
    空晶兽_精英: { realm:'合体后', hp:50000,atk:800,def:60,skills:'空间跳跃(闪避)·空刃3.5x', drop:'空晶·灵晶×100', note:'精英' },
    秘境核心守护_BOSS:{ realm:'大乘初', hp:null, note:'非战斗·破解阵法三关·传承+修为+5万', skills:'阵法' },

    // -- 灵界·地下灵渊 --
    暗噬虫_群:    { realm:'合体中', hp:'5000×N',atk:'400×N',def:20,skills:'噬灵(扣灵力)·分裂', drop:'暗噬虫甲壳·灵晶×5', note:'群居' },
    地煞灵:       { realm:'合体后', hp:40000,atk:700,def:100,skills:'煞气侵蚀(中毒+减修)', drop:'地煞结晶·灵晶×50', note:null },
    万年石灵_精英:{ realm:'大乘初', hp:100000,atk:600,def:300,skills:'地动山摇·石化射线·重生', drop:'万年石心·大地灵晶', note:'精英' },
    深渊触手_BOSS:{ realm:'大乘中', hp:200000,atk:1500,def:150,skills:'触须群攻·缠绕·深渊吞噬5.0x', drop:'深渊核心+修为+10万', note:'BOSS' },

    // -- 灵界·远古战场遗址 --
    游荡残魂:     { realm:'合体中', hp:20000,atk:600,def:20,skills:'神识侵蚀·附身(混乱)', drop:'魂晶碎片·远古记忆碎片', note:null },
    不灭战意_精英:{ realm:'合体后', hp:60000,atk:1000,def:60,skills:'战意爆发4.0x·军阵幻影', drop:'战意结晶·古宝残片20%', note:'精英' },
    远古将灵_BOSS:{ realm:'大乘中', hp:150000,atk:1800,def:200,skills:'不灭战魂·古战技·英灵召唤', drop:'大衍神诀线索+修为+8万', note:'BOSS' },

    // -- 灵界·血色秘境 --
    血灵蝠_群:    { realm:'合体中', hp:'8000×N',atk:'500×N',def:15,skills:'吸血(恢复30%)', drop:'蝠血精华·灵晶×10', note:'群居' },
    血晶傀儡:     { realm:'合体后', hp:50000,atk:700,def:80,skills:'血晶刺2.5x·血盾(-50%)', drop:'血晶石·灵晶×50', note:null },
    血魔分身_精英:{ realm:'大乘初', hp:100000,atk:1200,def:100,skills:'血海大法·血爆术·吸血化身', drop:'血魔精血+修为+5万', note:'精英' },
    血神守护_BOSS:{ realm:'大乘后', hp:250000,atk:2000,def:250,skills:'血神领域·血祭·真灵血咒', drop:'真灵之血+血神秘典+修为+15万', note:'BOSS' },

    // -- 灵界·雷鸣山脉 --
    雷灵兽:       { realm:'大乘初', hp:80000,atk:1200,def:80,skills:'雷击3.0x·雷遁(闪避)', drop:'雷兽丹·雷鸣石', note:null },
    天雷竹守卫_精英:{ realm:'大乘中',hp:120000,atk:1500,def:150,skills:'雷阵·万雷引4.0x·麻痹', drop:'天雷竹汁·雷晶', note:'精英' },
    雷劫古兽_BOSS:{ realm:'大乘后', hp:300000,atk:2500,def:300,skills:'天雷劫·雷暴领域·狂雷天降5.0x', drop:'雷劫珠+修为+12万', note:'BOSS' },

    // -- 灵界·迷雾海 --
    迷雾幻灵:     { realm:'大乘初', hp:50000,atk:800,def:30,skills:'幻术(混乱)·匿形', drop:'迷雾精华·灵晶×30', note:null },
    深海巨章_精英:{ realm:'大乘中', hp:150000,atk:1100,def:120,skills:'触手群·墨雾(+50%闪避)·吞噬', drop:'章鱼灵核·深海珍珠', note:'精英' },
    海市蜃楼_BOSS:{ realm:'渡劫初', hp:null, note:'非战斗·破幻三关(神识判定)·破妄之眼线索+修为+5万', skills:'幻术' },

    // -- 灵界·万古魔域 --
    魔化骨龙:     { realm:'大乘中', hp:120000,atk:1500,def:150,skills:'龙息(魔焰)·骨尾横扫', drop:'龙骨·魔晶石·灵晶×100', note:null },
    古魔护卫_精英:{ realm:'大乘后', hp:180000,atk:2000,def:200,skills:'魔气爆发·魔刃斩4.0x', drop:'古魔令牌·魔核70%', note:'精英' },
    魔域统领_精英:{ realm:'渡劫初', hp:300000,atk:2800,def:250,skills:'魔域·魔兵召唤·统领技(全属+30%)', drop:'统领魔核+修为+10万', note:'精英' },
    古魔真身_BOSS:{ realm:'渡劫中', hp:500000,atk:4000,def:500,skills:'灭世魔域·大魔神通·魔界之门', drop:'混沌真解(灵界篇)+修为+25万', note:'BOSS' },

    // -- 灵界·广灵洞天 --
    传承幻象_剑:  { realm:'大乘中', hp:100000,atk:1800,def:50,skills:'剑气·剑阵·万剑归宗4.0x', drop:'剑道感悟(无掉落)', note:'试炼' },
    传承幻象_体:  { realm:'大乘后', hp:200000,atk:1200,def:200,skills:'不灭金身·拳破万法', drop:'炼体感悟(无掉落)', note:'试炼' },
    传承幻象_法:  { realm:'渡劫初', hp:150000,atk:2500,def:100,skills:'万法归宗·五行大术·禁咒5.0x', drop:'法道感悟(无掉落)', note:'试炼' },
    广灵道尊残魂_BOSS:{ realm:'渡劫后',hp:null, note:'三项试炼(战斗+悟性+心性)·广灵道经+修为+20万', skills:'试炼' },

    // -- 仙界·飞升池 --
    接引仙官_NPC: { realm:'真仙中', hp:null, note:'友方NPC·引导赠基础仙术·基础仙诀·仙灵石×100' },

    // -- 仙界·金源仙域 --
    金甲守卫:     { realm:'真仙初', hp:150000,atk:3000,def:300,skills:'金刃术2.0x·金甲术(+50%防)', drop:'仙灵石×30·金精石', note:null },
    金源兽:       { realm:'真仙中', hp:300000,atk:5000,def:400,skills:'金之本源炮4.0x·金化射线', drop:'金之本源碎片·仙灵石×100', note:null },
    本源矿脉守护_精英:{ realm:'真仙后',hp:600000,atk:7000,def:600,skills:'金源领域·万刃风暴5.0x', drop:'金之本源晶+仙灵石×300', note:'精英' },
    金源仙帝化身_BOSS:{ realm:'金仙初',hp:1500000,atk:15000,def:1000,skills:'金之法则·斩道6.0x·仙域镇压', drop:'金源仙诀+仙灵石×1000+修为+30万', note:'BOSS' },

    // -- 仙界·北寒仙域 --
    冰晶兽:       { realm:'真仙中', hp:400000,atk:4500,def:350,skills:'冰锥术·冰封(冰冻3回)', drop:'冰晶核·仙灵石×50', note:null },
    极寒冰魄_精英:{ realm:'真仙后', hp:700000,atk:8000,def:500,skills:'绝对零度5.0x·冰甲术', drop:'冰魄精华·仙灵石×200', note:'精英' },
    北寒仙帝_BOSS:{ realm:'金仙中', hp:2000000,atk:20000,def:1500,skills:'冰封天地·雪葬·北寒法则', drop:'北寒真经+修为+50万', note:'BOSS' },

    // -- 仙界·天庭城 --
    天兵守卫:     { realm:'真仙中', hp:200000,atk:3500,def:200,skills:'天兵战阵(群体)', drop:'仙灵石×20·天兵令', note:null },
    执法仙官_NPC: { realm:'金仙初', hp:1000000,atk:10000,def:800,skills:'天规(禁术)·执法剑5.0x', drop:'仙灵石×500(击杀全仙界通缉)', note:'NPC' },
    天帝_BOSS:    { realm:'大罗初', hp:20000000,atk:100000,def:20000,skills:'天帝威压·天道法则·万仙朝宗', drop:'天帝传承+修为+500万(可选)', note:'BOSS·终局' },

    // -- 仙界·源初秘境 --
    混沌兽_普通:  { realm:'金仙中', hp:800000,atk:10000,def:200,skills:'混沌吐息3.0x·混沌隐身', drop:'混沌之气·仙灵石×100', note:null },
    本源守护者_精英:{ realm:'金仙后',hp:1500000,atk:15000,def:500,skills:'本源之力5.0x·本源复苏(回血)', drop:'本源结晶·仙灵石×500', note:'精英' },
    混沌古兽_精英:{ realm:'太乙初', hp:5000000,atk:30000,def:800,skills:'混沌吞天6.0x·混沌风暴', drop:'混沌至宝碎片·仙灵石×2000', note:'精英' },
    源初之灵_BOSS:{ realm:'太乙后', hp:20000000,atk:50000,def:3000,skills:'本源创造·混沌归元·万物同化', drop:'混沌造化诀+修为+200万', note:'BOSS' },

    // -- 仙界·混沌外域 --
    虚空吞噬者:   { realm:'太乙中', hp:3000000,atk:20000,def:400,skills:'虚空吞噬(无视50%血)·空间扭曲', drop:'虚空结晶·仙灵石×300', note:null },
    古神残念_精英:{ realm:'太乙后', hp:8000000,atk:40000,def:1500,skills:'古神领域·混沌法则·创世术(回血)', drop:'古神印记+混沌石+仙灵石×1000', note:'精英' },
    混沌古神_BOSS:{ realm:'大罗中', hp:50000000,atk:100000,def:5000,skills:'混沌创世·法则崩坏·古神真身', drop:'混沌法则感悟+修为+500万', note:'BOSS' },

    // -- 仙界·灰域 --
    时痕兽:       { realm:'太乙后', hp:5000000,atk:30000,def:1000,skills:'时间减速(-50%速)·时空斩5.0x', drop:'时间碎片·仙灵石×500', note:null },
    时空畸变体_精英:{ realm:'大罗初',hp:12000000,atk:60000,def:2000,skills:'时间倒流(回血)·空间切割·因果混乱', drop:'时空核心+修为+200万', note:'精英' },
    迷失者_BOSS:  { realm:'大罗中', hp:30000000,atk:80000,def:3000,skills:'时空乱流·因果逆转·绝望领域', drop:'时空法则碎片+修为+300万', note:'可选BOSS' },

    // -- 仙界·轮回殿 --
    轮回守卫:     { realm:'大罗中', hp:10000000,atk:50000,def:2000,skills:'轮回之力(扣10%当前HP)·轮回印记', drop:'仙灵石×1000', note:null },
    轮回使_精英:  { realm:'大罗后', hp:30000000,atk:80000,def:3000,skills:'六道轮回(随机Debuff)·因果报应', drop:'轮回法则碎片+修为+300万', note:'精英' },
    轮回殿主_BOSS:{ realm:'道祖初', hp:100000000,atk:200000,def:10000,skills:'大轮回术·六道·因果抹杀·轮回转生(复活1次)', drop:'大轮回术(可学)+修为+1000万+轮回殿传承', note:'BOSS·终局' }
  },

  // ============================================================
  // 二十九、Buff/Debuff系统
  // ============================================================
  BUFFS: {
    // 增益Buff（12种）
    positive: [
      { name:'护体灵光',    effect:'防御+30%',     duration:3, stackable:true },
      { name:'剑气附体',    effect:'攻击+25%',     duration:5, stackable:true, maxStack:2 },
      { name:'灵力涌动',    effect:'灵力恢复x2',   duration:3, stackable:false },
      { name:'金刚罩',      effect:'减伤50%',      duration:2, note:'不可攻击', stackable:false },
      { name:'嗜血',        effect:'攻击回10%HP',  duration:4, stackable:false },
      { name:'神速',        effect:'闪避+30%/出手x1.5', duration:3, stackable:false },
      { name:'狂化',        effect:'攻击+50%/防御-30%', duration:3, stackable:false },
      { name:'灵域',        effect:'全属+15%',     duration:5, stackable:false },
      { name:'涅槃',        effect:'濒死恢复50%HP', duration:1, stackable:false },
      { name:'法相天地',    effect:'攻防+80%',     duration:3, note:'每轮回5%灵力', stackable:false }
    ],
    // 减益Debuff（12种）
    negative: [
      { name:'灼烧', effect:'每轮回5%HP', duration:3, maxStack:3 },
      { name:'冰冻', effect:'速度-50%/概率跳回', duration:2 },
      { name:'麻痹', effect:'30%概率跳回', duration:2 },
      { name:'中毒', effect:'每轮回8%HP+10%', duration:4, maxStack:2 },
      { name:'破甲', effect:'防御-40%', duration:3 },
      { name:'沉默', effect:'无法用技能', duration:2 },
      { name:'混乱', effect:'20%打自己', duration:2 },
      { name:'虚弱', effect:'攻击-30%', duration:3 },
      { name:'噬灵', effect:'每轮回15%灵', duration:3 },
      { name:'标记', effect:'受伤+25%', duration:5 },
      { name:'缠绕', effect:'无法闪避/速归零', duration:2 },
      { name:'心魔', effect:'突破-20%', note:'战后持续' }
    ]
  }

};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DATA };
}

// 浏览器全局暴露（兼容普通 script 标签加载）
if (typeof window !== 'undefined') {
  window.DATA = DATA;
}
