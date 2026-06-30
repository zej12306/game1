/**
 * companions.js — 灵兽·傀儡·宗门·NPC 四合一模块
 * 基于 GDD 行1282~1558 设计。
 * 依赖：DATA（全局数值常量模块）
 * 导出：Companions 类
 */

// ============================================================
// 内部纯数据
// ============================================================

/** 群居灵兽数量→属性倍率对照（N^0.6） */
const SWARM_MULTIPLIER_TABLE = {
  1: 1.0, 10: 3.98, 100: 15.85, 500: 41.54,
  1000: 63.10, 5000: 158.49, 9999: 251.19
};

/** 各境界最高控制灵兽数量 */
const SWARM_CONTROL_LIMIT = {
  筑基: 10, 金丹: 50, 元婴: 200, 化神: 500, 炼虚: 2000, 合体: 5000, 大乘: 9999
};

/** 灵兽品阶 → 对应境界 */
const PET_RANK_REALM = {
  1: '练气', 2: '筑基', 3: '筑基', 4: '金丹', 5: '金丹',
  6: '元婴~化神', 7: '元婴~化神', 8: '炼虚~合体', 9: '大乘~渡劫'
};

/** 各品阶每日喂食灵石（插值范围） */
const PET_FEED_COST = {
  1: 5, 2: 20, 3: 50, 4: 100, 5: 200,
  6: 400, 7: 700, 8: 1200, 9: 2000
};

// ============================================================
// 傀儡系统内部常量
// ============================================================

/** 傀儡品阶定义 */
const PUPPET_TIERS = [
  { name: '初级', realm: '练气中', powerBase: 30,   craftDays: 3,  energyDays: 1,  tierPenalty: 0 },
  { name: '中级', realm: '筑基初', powerBase: 80,   craftDays: 7,  energyDays: 3,  tierPenalty: 0 },
  { name: '高级', realm: '金丹初', powerBase: 200,  craftDays: 15, energyDays: 7,  tierPenalty: 0 },
  { name: '顶级', realm: '元婴初', powerBase: 500,  craftDays: 30, energyDays: 15, tierPenalty: -0.20 },
  { name: '上古', realm: '化神初', powerBase: 1200, craftDays: 60, energyDays: 30, tierPenalty: -0.30 },
  { name: '通天', realm: '炼虚↑',  powerBase: 3000, craftDays: 120,energyDays: 60, tierPenalty: -0.40 }
];

/** 各境界出战傀儡数上限 */
const PUPPET_DEPLOY_LIMIT = {
  练气: 1, 筑基: 2, 金丹: 3, 元婴: 5, 化神: 8, 炼虚: 12,
  合体: 18, 大乘: 25, 渡劫: 30, 真仙: 40, 金仙: 50, 太乙: 60, 大罗: 80, 道祖: Infinity
};

/** 劳作产出倍率 */
const PUPPET_LABOR_RATE = { 采矿: 0.60, 采集: 0.50, 炼丹: '下品', 制符: '灵符级', 巡逻: 0.005 };

/** 强化方式 */
const PUPPET_REINFORCE = [
  { name: '更换核心', days: 7,  cost: '新材料',  effect: '提升品阶或修改技能' },
  { name: '加装装甲', days: 3,  cost: '矿石',    effect: '防御+20%' },
  { name: '升级阵法', days: 0,  cost: '材料+天数',effect: '全属性+10%' },
  { name: '镶嵌灵石', days: 0,  cost: '灵石',    effect: '自动充能' },
  { name: '魂晶附灵', days: 0,  cost: '魂晶',    effect: '产生简单灵智' }
];

/** 傀儡特殊事件 */
const PUPPET_EVENTS = [
  { id: 1, name: '产生灵智',    trigger: '战斗中', choice: ['保留', '格式化'], desc: '傀儡在战斗中产生了自主意识' },
  { id: 2, name: '矿洞坍塌',    trigger: '采矿劳作',choice: ['挖出', '放弃'],  desc: '傀儡在矿洞中被埋' },
  { id: 3, name: '修复失败',    trigger: '拾取上古傀儡',choice: ['继续修复','拆解'],desc: '修复上古傀儡失败，获得图纸' },
  { id: 4, name: '拍卖会现世',  trigger: '拍卖会',  price: 80000,  note: '拍卖会上出现上古傀儡(完整80%)' },
  { id: 5, name: '傀儡围攻',    trigger: '野外',    desc: '敌对修士派出傀儡围攻', reward: '回收残骸' },
  { id: 6, name: '核心老化',    trigger: '时间',    penalty: '全属性-30%',       fix: '更换核心' },
  { id: 7, name: '遗迹残骸',    trigger: '探索',    desc: '遗迹发现大量傀儡残骸', reward: '回收材料+概率图纸碎片' }
];

// ============================================================
// 宗门系统内部数据
// ============================================================

/** 人界25势力 */
const RENJIE_FACTIONS = {
  正道七宗: ['掩月宗','落云宗','黄枫谷','天阙堡','清虚门','百巧院','灵兽山'],
  魔道六宗: ['天煞宗','鬼灵门','御灵宗','合欢宗','天魔宗','阴罗宗'],
  乱星海: ['星宫','天星城','妙音门','极阴岛','执法殿'],
  大晋: ['皇室','天道盟','万宝楼','向之礼联盟','散修联盟'],
  独立: ['七玄门','暗月','血禁守门人']
};

/** 灵界25势力 */
const LINGJIE_FACTIONS = {
  人族九家族: ['轩辕','叶','柳','风','雷','金','冰','方','散修联盟'],
  妖族七大族: ['龙族','天凤','麒麟','玄武','白虎','鲲鹏','九尾天狐','散落妖王'],
  异族七族: ['木族','夜叉','影族','灵族','角蚩族','天晶族','巨人族'],
  组织: ['天渊城','广灵洞天','万古魔域守卫','灵界商会','地下灵渊探索会','雷鸣苦修者','迷雾灯塔','沉睡真灵','逃逸魔物','深渊原住民']
};

/** 仙界30势力 */
const XIANJIE_FACTIONS = {
  天庭: ['天帝殿','四方仙帝','执法殿','藏经阁','炼器司','丹房','仙军统帅部','巡察使'],
  八大仙域: ['金源','北寒','东华(木)','南离(火)','西极(土金)','中央(天庭直辖)','源初秘境(混沌)','混沌外域(无序)','灰域(时间乱流)'],
  十大宗门: ['剑仙阁','丹圣谷','阵仙宫','符圣宗','器皇殿','体修宗','御兽仙门','法相宗','幻心宗(神识)','时轮宗(时间)'],
  散修组织: ['散仙联盟','源初秘境探险队','混沌猎人','信息阁','时空旅者'],
  古老存在: ['轮回殿','掌天瓶原主人','古神遗族','混沌兽','陨落道祖残留','时间裂缝强者'],
  商业: ['天庭宝库','万宝楼仙界总号','混沌集市','拍卖星']
};

// ============================================================
// NPC系统内部数据
// ============================================================

/** 好感度六阶段 */
const FAVOR_STAGES = [
  { range: [0, 20],   title: '陌生', discount: 1.0,  unlocks: '基础对话+原价交易' },
  { range: [21, 40],  title: '认识', discount: 0.95, unlocks: '简单任务+9.5折+查看信息' },
  { range: [41, 60],  title: '友善', discount: 0.90, unlocks: '高难任务+9折+情报共享+邀请探索' },
  { range: [61, 80],  title: '信任', discount: 0.80, unlocks: '私密任务+8折+赠送+结盟+入私人区域' },
  { range: [81, 95],  title: '亲密', discount: 0.70, unlocks: '传承任务+7折+双修+调用资源' },
  { range: [96, 100], title: '至交', discount: 0.60, unlocks: '全部传承+6折+舍命相救+专属信物+结局选项' }
];

/** 好感增减方式 */
const FAVOR_ACTIONS = {
  送礼:       [2, 50],
  完成任务:   [10, 30],
  聊天:       [1, 3],
  援护:       [5, 15],
  同行:       [3, 10],
  救命之恩:   [30, 50],
  赠送灵兽法宝: [20, 50],
  坑NPC:      [-50, -10],
  杀亲友:     [-50, -1]
};

/** 8种关系类型 & 系数 */
const RELATION_TYPES = {
  挚友:   { coefficient: 1.0,  desc: '生死之交' },
  好友:   { coefficient: 0.7,  desc: '密切来往' },
  师徒:   { coefficient: 0.9,  desc: '传承关系' },
  道侣:   { coefficient: 1.0,  desc: '伴侣绑定' },
  同门:   { coefficient: 0.4,  desc: '同宗门' },
  熟人:   { coefficient: 0.2,  desc: '认识不深' },
  仇敌:   { coefficient: -0.8, desc: '彼此敌对' },
  势力隶属:{ coefficient: 0.3, desc: '所属势力' }
};

/** 15关键NPC数据 */
const KEY_NPCS = {
  厉飞雨: {
    realm: '练气后', location: '青云山七玄门',
    schedule: [
      { time: '常驻', location: '青云山·七玄门旧址', action: '修炼(初期任务)' },
      { time: '每月', location: '天南城·酒馆',        action: '喝酒(可触发聊天+情报)' }
    ],
    relations: { 挚友: ['玩家'], 同门: ['张铁'], 熟人: ['王老七'], 势力隶属: ['七玄门'] }
  },
  墨大夫: {
    realm: '练气后', location: '七玄门(已故)',
    schedule: [{ time: '回忆触发', location: '七玄门旧屋', action: '触发回忆剧情' }],
    relations: { 熟人: ['玩家'], 势力隶属: ['七玄门'] }
  },
  张铁: {
    realm: '练气中', location: '七玄门',
    schedule: [{ time: '常驻', location: '七玄门·练武场', action: '修炼' }],
    relations: { 同门: ['厉飞雨'], 势力隶属: ['七玄门'] }
  },
  南宫碗: {
    realm: '金丹后', location: '掩月宗',
    schedule: [
      { time: '白天',   location: '掩月宗·修炼室',  action: '修炼' },
      { time: '傍晚',   location: '后山花园',       action: '散步(可触发事件)' },
      { time: '夜晚',   location: '寝殿',           action: '休息(好感≥60可拜访)' },
      { time: '每月初一', location: '天南城坊市',   action: '采买(偶遇)' }
    ],
    relations: { 好友: ['元瑶'], 势力隶属: ['掩月宗'], 暗恋: ['玩家(好感≥60)'], 仇敌: ['极阴祖师'] }
  },
  元瑶: {
    realm: '金丹初', location: '天星城妙音门',
    schedule: [
      { time: '常驻',   location: '天星城·妙音门店铺', action: '经营' },
      { time: '每季度', location: '大晋皇都·万宝楼',   action: '进货(留30天)' },
      { time: '遇险时', location: '随机某个秘境',       action: '受困事件触发' }
    ],
    relations: { 好友: ['南宫碗'], 商业: ['万宝楼'], 势力隶属: ['妙音门'], 仇敌: ['极阴祖师'] }
  },
  紫灵: {
    realm: '筑基后', location: '极阴岛鬼灵门',
    schedule: [
      { time: '早期',   location: '极阴岛·鬼灵门', action: '修炼' },
      { time: '后期',   location: '天星城',        action: '自由行动' }
    ],
    relations: { 好友: ['元瑶(后期)'], 势力隶属: ['鬼灵门(早)'], 仇敌: ['极阴祖师'] }
  },
  银月: {
    realm: '元婴初', location: '大晋古战场',
    schedule: [
      { time: '被解救后', location: '跟随玩家', action: '辅助战斗' }
    ],
    relations: { 恩人: ['玩家(解救后)'], 势力隶属: ['天狐族'] }
  },
  向之礼: {
    realm: '化神初', location: '大晋皇都',
    schedule: [
      { time: '常驻', location: '大晋皇都·黑市', action: '交易+情报' }
    ],
    relations: { 熟人: ['散修'], 势力隶属: ['散修联盟'] }
  },
  辛如音: {
    realm: '筑基中', location: '黄枫谷外茅屋',
    schedule: [
      { time: '常驻', location: '黄枫谷外·茅屋', action: '研究阵法' }
    ],
    relations: { 熟人: ['玩家'], 势力隶属: ['天南散修'] }
  },
  李化元: {
    realm: '金丹后', location: '黄枫谷',
    schedule: [
      { time: '常驻', location: '黄枫谷·长老殿', action: '管理宗门' }
    ],
    relations: { 师徒: ['玩家(黄枫谷)'], 道侣: ['萱元'], 势力隶属: ['黄枫谷'] }
  },
  极阴祖师: {
    realm: '元婴后', location: '乱星海极阴岛',
    schedule: [
      { time: '常驻', location: '极阴岛·大殿', action: '修炼魔功' }
    ],
    relations: { 仇敌: ['元瑶','紫灵','南宫碗'], 势力隶属: ['极阴岛'] }
  },
  敖啸: {
    realm: '合体初', location: '天渊城',
    schedule: [
      { time: '常驻', location: '天渊城/万妖山脉', action: '镇守' }
    ],
    relations: { 熟人: ['玩家'], 势力隶属: ['真龙族(万妖山脉)'] }
  },
  冰魄仙子: {
    realm: '合体中', location: '天渊城',
    schedule: [
      { time: '常驻', location: '天渊城', action: '统领人族' }
    ],
    relations: { 熟人: ['玩家'], 势力隶属: ['人族(天渊城)'] }
  },
  广灵道尊残魂: {
    realm: '大乘', location: '广灵洞天',
    schedule: [
      { time: '触发条件', location: '广灵洞天', action: '传承试炼' }
    ],
    relations: { 师徒: ['玩家(通过试炼)'], 势力隶属: ['广灵洞天'] }
  },
  绿儿: {
    realm: '特殊·器灵', location: '掌天瓶内',
    schedule: [
      { time: '常驻', location: '掌天瓶内空间', action: '管理灵田' }
    ],
    relations: { 主人: ['玩家'], 前主人: ['已陨落'] }
  }
};

/** 击杀连锁规则 */
const KILL_CHAIN_RULES = [
  { relation: '挚友', favorPenalty: -50, extra: '50%概率挚友主动寻仇' },
  { relation: '师徒', favorPenalty: null,  extra: '师门悬赏令(通缉)，该师父名下弟子全部敌对' },
  { relation: '道侣', favorPenalty: null,  extra: '必定来复仇，不死不休' },
  { relation: '同门', favorPenalty: -15,   extra: '同门全员好感-15，宗门可能发悬赏' },
  { relation: '势力隶属', favorPenalty: -20, extra: '全势力好感-20，无法进入该势力区域' },
  { relation: '熟人', favorPenalty: -10,   extra: '熟人好感-10(轻微)' }
];

// ============================================================
// Companions 类
// ============================================================

class Companions {
  /**
   * @param {object} DATA - 全局数值常量模块
   */
  constructor(DATA) {
    this.DATA = DATA;

    // ---- 运行时状态 ----
    this._pets = [];          // 玩家拥有的灵兽列表
    this._puppets = [];       // 玩家拥有的傀儡列表
    this._sect = null;        // 当前所属宗门 { name, contribution, rank }
    this._sectContribution = 0;
    this._npcFavors = {};     // { npcName: number } 各NPC好感度
    this._deadNPCs = [];      // 已死亡NPC列表
  }

  // ================================================================
  // PART 1：灵兽系统
  // ================================================================

  /**
   * 计算群居灵兽总属性
   * 公式：总属性 = 单体属性 × N^0.6
   * @param {number} singleStat 单体属性值
   * @param {number} count      灵兽数量
   * @returns {{ multiplier: number, totalStat: number }}
   */
  calcSwarmStat(singleStat, count) {
    const multiplier = Math.pow(count, 0.6);
    return {
      multiplier: Math.round(multiplier * 100) / 100,
      totalStat: Math.round(singleStat * multiplier)
    };
  }

  /**
   * 获取群居倍率表（只读）
   * @param {number} [count] 可选，传入数量返回该数量倍率，不传返回全表
   */
  getSwarmMultiplier(count) {
    if (count !== undefined) {
      const exact = SWARM_MULTIPLIER_TABLE[count];
      if (exact) return exact;
      return Math.round(Math.pow(count, 0.6) * 100) / 100;
    }
    return { ...SWARM_MULTIPLIER_TABLE };
  }

  /**
   * 获取某境界下最高可控制灵兽数量
   * @param {string} realm 修为境界
   * @returns {number}
   */
  getControlLimit(realm) {
    return SWARM_CONTROL_LIMIT[realm] || 0;
  }

  /**
   * 获取灵兽品阶对应境界
   * @param {number} rank 1~9
   */
  getPetRankRealm(rank) {
    return PET_RANK_REALM[rank] || '未知';
  }

  /**
   * 获取每日喂食灵石消耗（按阶插值）
   * @param {number} rank 1~9
   * @returns {number}
   */
  getFeedCost(rank) {
    if (PET_FEED_COST[rank]) return PET_FEED_COST[rank];
    // 插值
    const keys = Object.keys(PET_FEED_COST).map(Number).sort((a, b) => a - b);
    if (rank < keys[0]) return PET_FEED_COST[keys[0]];
    if (rank > keys[keys.length - 1]) return PET_FEED_COST[keys[keys.length - 1]];
    for (let i = 0; i < keys.length - 1; i++) {
      if (rank >= keys[i] && rank <= keys[i + 1]) {
        const ratio = (rank - keys[i]) / (keys[i + 1] - keys[i]);
        return Math.round(PET_FEED_COST[keys[i]] + ratio * (PET_FEED_COST[keys[i + 1]] - PET_FEED_COST[keys[i]]));
      }
    }
    return 5;
  }

  /**
   * 获取6只核心灵兽数据
   */
  getCorePets() {
    return this.DATA.PETS.core || [];
  }

  // ---- 灵兽养成 ----

  /**
   * 喂食
   * @param {object} pet    灵兽对象 { name, rank, loyalty, growth, hp, atk, def }
   * @param {number} days   喂食天数
   * @returns {{ cost:number, msg:string }}
   */
  feedPet(pet, days) {
    const dailyCost = this.getFeedCost(pet.rank || 1);
    return {
      cost: dailyCost * days,
      msg: `喂食 ${pet.name} ×${days}天，共消耗 ${dailyCost * days} 灵石`
    };
  }

  /**
   * 训练
   * @param {object} pet
   * @returns {{ days:number, growthGain:number, msg:string }}
   */
  trainPet(pet) {
    const growthGain = 5 + Math.floor(Math.random() * 6); // 5~10%
    return {
      days: 3,
      growthGain,
      msg: `训练 ${pet.name} 3天，成长+${growthGain}%`
    };
  }

  /**
   * 战斗历练
   * @param {object} pet
   * @param {boolean} victory 是否胜利
   * @returns {{ growthGain:number, loyaltyGain:number, msg:string }}
   */
  battleExperience(pet, victory) {
    if (!victory) {
      return { growthGain: 0, loyaltyGain: 0, msg: `${pet.name} 战斗失败，无法获得历练` };
    }
    const growthGain = 10 + Math.floor(Math.random() * 11); // 10~20%
    const loyaltyGain = 2;
    return {
      growthGain,
      loyaltyGain,
      msg: `${pet.name} 战斗胜利，成长+${growthGain}%，忠诚+${loyaltyGain}`
    };
  }

  /**
   * 疗伤
   * @param {object} pet
   * @returns {{ days:number, msg:string }}
   */
  healPet(pet) {
    return {
      days: 2,
      msg: `疗伤 ${pet.name}，2天后恢复`
    };
  }

  /**
   * 配种繁殖（群居专用）
   * @returns {{ days:number, msg:string }}
   */
  breedPets() {
    return {
      days: 7,
      msg: '配种繁殖中，7天后产出后代'
    };
  }

  /**
   * 进化突破
   * @param {object} pet
   * @returns {{ days:number, msg:string }}
   */
  evolvePet(pet) {
    const days = 7 + Math.floor(Math.random() * 24); // 7~30天
    return {
      days,
      msg: `${pet.name} 尝试进化突破，预计 ${days} 天`
    };
  }

  // ---- 战斗行为 ----

  /**
   * 检查灵兽是否出战
   * @param {object} pet 需含 loyalty
   * @returns {boolean}
   */
  canDeployPet(pet) {
    return (pet.loyalty || 0) >= 50;
  }

  /**
   * 灵兽挡刀判定（HP<20%时触发）
   * @param {object} pet
   * @param {number} playerHpPercent
   * @returns {{ blocked:boolean, msg:string }}
   */
  petBodyBlock(pet, playerHpPercent) {
    if (playerHpPercent < 0.20 && (pet.loyalty || 0) >= 60) {
      return {
        blocked: true,
        msg: `${pet.name} 挡刀！替玩家承受伤害`
      };
    }
    return { blocked: false, msg: '' };
  }

  /**
   * 神识反击判定
   * @param {object} pet 需含 type/sp
   * @returns {boolean}
   */
  canSpiritCounter(pet) {
    return pet.type === '单养' && (pet.sp || 0) >= 300;
  }

  /**
   * 追击逃跑判定
   * @param {object} pet 需含 type/sp
   * @returns {boolean}
   */
  canPursue(pet) {
    return (pet.type === '坐骑' || pet.type === '单养') && (pet.spd || pet.sp || 0) >= 200;
  }

  /**
   * 濒死进化判定（HP归零时概率触发）
   * @param {object} pet
   * @returns {{ evolved:boolean, msg:string }}
   */
  checkNearDeathEvolve(pet) {
    const chance = 0.05 + ((pet.growth || 0) / 100) * 0.10; // 5% + 成长×0.10%
    if (Math.random() < chance) {
      return {
        evolved: true,
        msg: `${pet.name} 濒死进化！属性大幅提升`
      };
    }
    return { evolved: false, msg: '' };
  }

  /**
   * 挡心魔判定（突破时触发）
   * @param {object} pet
   * @returns {{ blocked:boolean, breakBonus:number }}
   */
  checkHeartGuard(pet) {
    if ((pet.loyalty || 0) >= 90) {
      return { blocked: true, breakBonus: 0.05 };
    }
    return { blocked: false, breakBonus: 0 };
  }

  /**
   * 计算虫群完整度百分比
   * @param {number} currentCount 当前存活数量
   * @param {number} maxCount     满编数量
   * @returns {{ integrity:number, display:string }}
   */
  calcSwarmIntegrity(currentCount, maxCount) {
    const integrity = Math.max(0, Math.round((currentCount / maxCount) * 100));
    return { integrity, display: `${integrity}% (${currentCount}/${maxCount})` };
  }

  // ---- 灵兽管理 ----

  /** 添加灵兽 */
  addPet(petData) {
    const pet = {
      id: this._pets.length + 1,
      ...petData,
      loyalty: petData.loyalty || 50,
      growth: petData.growth || 0,
      hp: petData.hp || petData.maxHp || 100,
      maxHp: petData.maxHp || petData.hp || 100,
      atk: petData.atk || 10,
      def: petData.def || 5,
      sp: petData.sp || 0,
      spd: petData.spd || 0,
      type: petData.type || '单养',
      rank: petData.rank || 1,
      swarmCount: petData.swarmCount || 1,
      swarmMaxCount: petData.swarmMaxCount || 1,
      alive: true
    };
    this._pets.push(pet);
    return pet;
  }

  /** 获取所有灵兽 */
  getPets() { return this._pets; }

  /** 获取存活灵兽 */
  getAlivePets() { return this._pets.filter(p => p.alive); }

  /** 获取可出战灵兽（忠诚≥50） */
  getDeployablePets() { return this.getAlivePets().filter(p => this.canDeployPet(p)); }

  // ================================================================
  // PART 2：傀儡系统
  // ================================================================

  /** 获取所有傀儡品阶 */
  getPuppetTiers() { return PUPPET_TIERS; }

  /**
   * 获取指定品阶数据
   * @param {number} tierIndex 0~5
   */
  getPuppetTier(tierIndex) {
    if (tierIndex < 0 || tierIndex >= PUPPET_TIERS.length) {
      throw new Error(`傀儡品阶越界: ${tierIndex}`);
    }
    return { ...PUPPET_TIERS[tierIndex] };
  }

  /**
   * 获取某境界可部署傀儡数上限
   * @param {string} realm
   */
  getPuppetDeployLimit(realm) {
    return PUPPET_DEPLOY_LIMIT[realm] || 0;
  }

  // ---- 制作流程 ----

  /**
   * 计算刻阵成功率
   * 公式：60% + 炼器术×2% - 品阶系数 + 神识加成(≥500时+10%)
   * @param {number} craftSkill  炼器术 (0~100)
   * @param {number} tierIndex   品阶 0~5
   * @param {number} spiritSense 神识值
   * @returns {{ successRate:number, breakdown:object }}
   */
  calcEnchantRate(craftSkill, tierIndex, spiritSense) {
    const tier = PUPPET_TIERS[tierIndex] || PUPPET_TIERS[0];
    const base = 60;
    const craftBonus = craftSkill * 2;
    const tierPenalty = tier.tierPenalty * 100;
    const spBonus = spiritSense >= 500 ? 10 : 0;

    const rate = Math.min(100, Math.max(1, base + craftBonus + tierPenalty + spBonus));

    return {
      successRate: Math.round(rate),
      breakdown: { base, craftBonus, tierPenalty, spBonus }
    };
  }

  /**
   * 制作傀儡完整流程
   * @param {number} tierIndex      品阶 0~5
   * @param {number} craftSkill     炼器术
   * @param {number} spiritSense    神识
   * @param {boolean} hasBlueprint  是否有图纸
   * @param {boolean} hasMaterials  是否有材料
   * @returns {{ success:boolean, result:string, msg:string, days:number, puppet:object|null }}
   */
  craftPuppet(tierIndex, craftSkill, spiritSense, hasBlueprint, hasMaterials) {
    if (!hasBlueprint) {
      return { success: false, result: 'error', msg: '缺少图纸', days: 0, puppet: null };
    }
    if (!hasMaterials) {
      return { success: false, result: 'error', msg: '缺少材料', days: 0, puppet: null };
    }

    const tier = PUPPET_TIERS[tierIndex];
    if (!tier) return { success: false, result: 'error', msg: '无效品阶', days: 0, puppet: null };

    // ①~③ 布置炼器台（3天+100灵石）
    const setupDays = 3;
    const setupCost = 100;

    // ④ 制作
    const craftDays = tier.craftDays;

    // ⑤ 核心刻阵
    const enchantRate = this.calcEnchantRate(craftSkill, tierIndex, spiritSense);
    const roll = Math.random() * 100;

    const totalDays = setupDays + craftDays;

    // 大失败（3%）
    if (roll < 3) {
      return {
        success: false, result: '大失败', msg: '核心刻阵大失败！全部材料报废',
        days: totalDays, puppet: null
      };
    }

    // 失败
    if (roll >= enchantRate.successRate) {
      return {
        success: false, result: '失败', msg: '核心刻阵失败！材料损耗50%',
        days: totalDays, puppet: null
      };
    }

    // 大成功（5%·额外1随机技能）
    if (roll < 5) {
      const puppet = this._createPuppetInstance(tierIndex, '战斗', true);
      return {
        success: true, result: '大成功',
        msg: `傀儡制作大成功！获得额外随机技能：${puppet.bonusSkill}`,
        days: totalDays, puppet
      };
    }

    // 普通成功
    const puppet = this._createPuppetInstance(tierIndex, '战斗', false);
    return {
      success: true, result: '成功',
      msg: `${tier.name}傀儡制作完成`,
      days: totalDays, puppet
    };
  }

  /**
   * 创建傀儡实例
   * @private
   */
  _createPuppetInstance(tierIndex, usage, superSuccess) {
    const tier = PUPPET_TIERS[tierIndex];
    const hp = tier.powerBase * 10;
    const atk = tier.powerBase * 2;
    const def = tier.powerBase;

    const puppet = {
      id: this._puppets.length + 1,
      name: tier.name + '傀儡',
      tier: tierIndex,
      tierName: tier.name,
      realm: tier.realm,
      usage: usage,
      hp: hp,
      maxHp: hp,
      atk: atk,
      def: def,
      energy: 100,
      maxEnergy: 100,
      combatMode: '均衡',
      skills: [],
      bonusSkill: superSuccess ? this._randomPuppetSkill() : null,
      sentient: false,
      armorBonus: 0,
      arrayBonus: 0,
      spiritStoneSlotted: false,
      age: 0
    };

    if (superSuccess && puppet.bonusSkill) {
      puppet.skills.push(puppet.bonusSkill);
    }

    this._puppets.push(puppet);
    return puppet;
  }

  /** 随机傀儡技能池 */
  _randomPuppetSkill() {
    const pool = ['自爆1.5x', '护主(挡刀)', '连击(概率双次攻击)', '破甲(无视30%防御)', '能量回收'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---- 三种用途 ----

  /**
   * 设置傀儡用途
   * @param {object} puppet
   * @param {'战斗'|'守家'|'采矿'|'采集'|'炼丹'|'制符'|'巡逻'} usage
   * @returns {{ success:boolean, msg:string, transportDays:number }}
   */
  setPuppetUsage(puppet, usage) {
    const valid = ['战斗', '守家', '采矿', '采集', '炼丹', '制符', '巡逻'];
    if (!valid.includes(usage)) {
      return { success: false, msg: `无效用途: ${usage}`, transportDays: 0 };
    }

    const oldUsage = puppet.usage;
    const transportDays = (oldUsage === '守家' && usage !== '守家') || (oldUsage !== '守家' && usage === '守家') ? 1 : 0;

    puppet.usage = usage;

    // 守家加成
    if (usage === '守家') {
      puppet.stealthDetectBonus = 0.10; // 发现隐藏事件概率+10%
    } else {
      puppet.stealthDetectBonus = 0;
    }

    return {
      success: true,
      msg: `傀儡已切换至"${usage}"用途`,
      transportDays
    };
  }

  /**
   * 获取劳作产出
   * @param {object} puppet
   * @param {'采矿'|'采集'|'炼丹'|'制符'|'巡逻'} laborType
   * @param {number} [baseOutput] 采矿/采集时的手动产出基准值
   * @returns {{ output:number|string, msg:string }}
   */
  calcLaborOutput(puppet, laborType, baseOutput) {
    const rate = PUPPET_LABOR_RATE[laborType];

    if (laborType === '采矿') {
      const output = Math.floor((baseOutput || 100) * rate);
      return { output, msg: `采矿产出：${output}（手动60%）` };
    }
    if (laborType === '采集') {
      const output = Math.floor((baseOutput || 50) * rate);
      return { output, msg: `采集产出：${output}（手动50%）` };
    }
    if (laborType === '炼丹') {
      return { output: rate, msg: '炼丹产出：固定下品' };
    }
    if (laborType === '制符') {
      return { output: rate, msg: '制符产出：固定灵符级' };
    }
    if (laborType === '巡逻') {
      return { output: rate, msg: '巡逻探索度 +0.5%/天' };
    }
    return { output: 0, msg: '未知劳作类型' };
  }

  /** 检查傀儡是否需要维护（每30天） */
  checkPuppetMaintenance(puppet) {
    if (puppet.age > 0 && puppet.age % 30 === 0 && puppet.usage !== '战斗') {
      return { needMaintenance: true, days: 1, msg: `${puppet.name} 需要维护1天` };
    }
    return { needMaintenance: false, days: 0, msg: '' };
  }

  // ---- 能源系统 ----

  /**
   * 手动灌注能源
   * @param {object} puppet
   * @param {string} playerRealmIndex 玩家境界在REALMS数组中的索引
   * @returns {{ days:number, msg:string }}
   */
  manualCharge(puppet, playerRealmIndex) {
    const tier = PUPPET_TIERS[puppet.tier];
    let baseDays = tier.energyDays;

    // 玩家境界每比傀儡高1品阶→耗时减半
    const playerTier = Math.floor(playerRealmIndex / 2); // 粗略映射
    const diff = playerTier - (puppet.tier + 1);
    if (diff >= 1) {
      baseDays = Math.ceil(baseDays / Math.pow(2, diff));
    }

    return {
      days: baseDays,
      msg: `手动灌注 ${puppet.name}，需${baseDays}天`
    };
  }

  /** 灵石驱动：1灵石/10灵力 */
  chargeWithStones(puppet, stoneCount) {
    const energyGain = stoneCount * 10;
    return {
      stoneCost: stoneCount,
      energyGain: Math.min(energyGain, 100 - (puppet.energy || 0)),
      msg: `消耗 ${stoneCount} 灵石，充能 ${energyGain} 灵力`
    };
  }

  // ---- 强化方式 ----

  /** 获取所有强化方式 */
  getReinforceMethods() { return PUPPET_REINFORCE; }

  /**
   * 更换核心
   * @returns {{ days:number, cost:string, effect:string }}
   */
  reinforceCore() {
    return { days: 7, cost: '新材料', effect: '提升品阶或修改技能' };
  }

  /**
   * 加装装甲
   * @returns {{ days:number, cost:string, effect:string }}
   */
  reinforceArmor(puppet) {
    puppet.armorBonus = (puppet.armorBonus || 0) + 0.20;
    return { days: 3, cost: '矿石', effect: '防御+20%' };
  }

  /**
   * 升级阵法
   * @param {number} customDays 自定义天数
   * @returns {{ days:number, cost:string, effect:string }}
   */
  reinforceArray(puppet, customDays) {
    puppet.arrayBonus = (puppet.arrayBonus || 0) + 0.10;
    return { days: customDays || 7, cost: '阵法材料', effect: '全属性+10%' };
  }

  /**
   * 镶嵌灵石
   * @returns {{ cost:string, effect:string }}
   */
  reinforceSlotStone(puppet) {
    puppet.spiritStoneSlotted = true;
    return { cost: '灵石', effect: '自动充能' };
  }

  /**
   * 魂晶附灵
   * @returns {{ cost:string, effect:string }}
   */
  reinforceSoulCrystal(puppet) {
    puppet.sentient = true;
    return { cost: '魂晶', effect: '产生简单灵智' };
  }

  // ---- 傀儡事件 ----

  /** 获取所有特殊事件 */
  getPuppetEvents() { return PUPPET_EVENTS; }

  /**
   * 触发随机傀儡事件
   * @returns {{ trigger:boolean, event:object|null }}
   */
  triggerRandomPuppetEvent() {
    // 基础触发率 8%
    if (Math.random() > 0.08) {
      return { trigger: false, event: null };
    }
    const events = PUPPET_EVENTS.filter(e => e.id !== 4); // 拍卖会不随机触发
    const event = events[Math.floor(Math.random() * events.length)];
    return { trigger: true, event: { ...event } };
  }

  /**
   * 处理傀儡事件结果
   * @param {object} puppet
   * @param {number} eventId
   * @param {string} choice 玩家选择
   */
  resolvePuppetEvent(puppet, eventId, choice) {
    switch (eventId) {
      case 1: // 产生灵智
        if (choice === '保留') {
          puppet.sentient = true;
          return { msg: '傀儡保留了自主意识，产生简单灵智' };
        }
        return { msg: '傀儡被格式化，灵智消失' };

      case 2: // 矿洞坍塌
        if (choice === '挖出') {
          puppet.hp = Math.floor(puppet.maxHp * 0.3);
          return { msg: '傀儡被挖出，但受损严重（HP降至30%）' };
        }
        return { msg: '放弃了傀儡', lost: true };

      case 3: // 修复失败
        if (choice === '继续修复') {
          return { msg: '继续修复中...', keepTrying: true };
        }
        return { msg: '拆解获得图纸碎片', gainedBlueprint: true };

      case 6: // 核心老化
        puppet.atk = Math.floor(puppet.atk * 0.7);
        puppet.def = Math.floor(puppet.def * 0.7);
        return { msg: '傀儡核心老化，全属性-30%，需更换核心' };

      default:
        return { msg: '事件已处理' };
    }
  }

  // ---- 傀儡管理 ----

  addPuppet(puppetData) {
    const puppet = {
      id: this._puppets.length + 1,
      ...puppetData,
      tier: puppetData.tier || 0,
      energy: puppetData.energy || 100,
      maxEnergy: puppetData.maxEnergy || 100,
      alive: true,
      skills: puppetData.skills || [],
      sentient: puppetData.sentient || false,
      armorBonus: puppetData.armorBonus || 0,
      arrayBonus: puppetData.arrayBonus || 0,
      spiritStoneSlotted: puppetData.spiritStoneSlotted || false,
      age: 0
    };
    this._puppets.push(puppet);
    return puppet;
  }

  getPuppets() { return this._puppets; }

  /** 获取指定用途的傀儡 */
  getPuppetsByUsage(usage) {
    return this._puppets.filter(p => p.usage === usage);
  }

  /** 傀儡时间推进 */
  tickPuppets(days) {
    this._puppets.forEach(p => {
      p.age += days;
      // 灵石驱动自动充能
      if (p.spiritStoneSlotted) {
        p.energy = Math.min(p.maxEnergy, p.energy + days * 5);
      }
    });
  }

  // ================================================================
  // PART 3：宗门系统
  // ================================================================

  /** 获取人界所有势力 */
  getRenjieFactions() { return RENJIE_FACTIONS; }

  /** 获取灵界所有势力 */
  getLingjieFactions() { return LINGJIE_FACTIONS; }

  /** 获取仙界所有势力 */
  getXianjieFactions() { return XIANJIE_FACTIONS; }

  /**
   * 获取某界域所有宗门名称汇总
   * @param {'人界'|'灵界'|'仙界'|'all'} realm
   * @returns {string[]}
   */
  getAllFactionNames(realm) {
    const collect = (obj) => {
      const names = [];
      Object.values(obj).forEach(arr => {
        if (Array.isArray(arr)) names.push(...arr);
      });
      return names;
    };

    switch (realm) {
      case '人界': return collect(RENJIE_FACTIONS);
      case '灵界': return collect(LINGJIE_FACTIONS);
      case '仙界': return collect(XIANJIE_FACTIONS);
      case 'all':
        return [...collect(RENJIE_FACTIONS), ...collect(LINGJIE_FACTIONS), ...collect(XIANJIE_FACTIONS)];
      default:
        return collect(RENJIE_FACTIONS);
    }
  }

  /**
   * 查找宗门所属界域
   * @param {string} factionName
   * @returns {string|null} '人界'|'灵界'|'仙界'|null
   */
  findFactionRealm(factionName) {
    const search = (obj) => {
      for (const [group, names] of Object.entries(obj)) {
        if (Array.isArray(names) && names.includes(factionName)) return group;
      }
      return null;
    };
    return search(RENJIE_FACTIONS) || search(LINGJIE_FACTIONS) || search(XIANJIE_FACTIONS) || null;
  }

  /**
   * 加入宗门
   * @param {string} factionName
   * @param {string} realm 界域 '人界'|'灵界'|'仙界'
   * @returns {{ success:boolean, msg:string }}
   */
  joinSect(factionName, realm) {
    if (this._sect) {
      return { success: false, msg: `已加入 ${this._sect.name}，需先脱离` };
    }

    const allNames = this.getAllFactionNames(realm);
    if (!allNames.includes(factionName)) {
      return { success: false, msg: `${realm} 中不存在宗门: ${factionName}` };
    }

    this._sect = { name: factionName, realm };
    this._sectContribution = 0;
    return { success: true, msg: `已加入 ${factionName}` };
  }

  /**
   * 增加宗门贡献
   * @param {number} amount
   * @returns {{ newTotal:number, msg:string }}
   */
  addContribution(amount) {
    if (!this._sect) return { newTotal: 0, msg: '未加入任何宗门' };
    this._sectContribution += amount;
    return {
      newTotal: this._sectContribution,
      msg: `${this._sect.name} 贡献 +${amount}，当前累计 ${this._sectContribution}`
    };
  }

  /**
   * 叛宗
   * @param {object} [playerState] 玩家状态 { righteousFame, demonicFame }
   * @returns {{ success:boolean, consequence:object, msg:string }}
   */
  betraySect(playerState) {
    if (!this._sect) return { success: false, consequence: null, msg: '未加入任何宗门' };

    const oldSect = this._sect.name;
    const consequence = {
      sect: oldSect,
      hostility: true,
      contributionLost: this._sectContribution,
      fameChange: {},
      debuff: '叛宗者(旧宗门全员好感-30，无法进入旧宗门区域)'
    };

    // 名望惩罚
    if (playerState) {
      const group = this.findFactionRealm(oldSect);
      if (group) {
        if (group.includes('魔道') || group.includes('魔')) {
          consequence.fameChange = { righteous: 5, demonic: -15 };
        } else {
          consequence.fameChange = { righteous: -15, demonic: 5 };
        }
      }
    }

    this._sect = null;
    this._sectContribution = 0;

    return {
      success: true,
      consequence,
      msg: `已叛离 ${oldSect}，贡献清零，旧宗门全部好感-30`
    };
  }

  /** 获取当前宗门状态 */
  getSectStatus() {
    return {
      name: this._sect ? this._sect.name : null,
      realm: this._sect ? this._sect.realm : null,
      contribution: this._sectContribution
    };
  }

  // ================================================================
  // PART 4：NPC系统
  // ================================================================

  /** 获取好感度六阶段定义 */
  getFavorStages() { return FAVOR_STAGES; }

  /**
   * 根据好感度值获取当前阶段
   * @param {number} favor 0~100
   * @returns {object} { title, discount, unlocks, range }
   */
  getFavorStage(favor) {
    const val = Math.max(0, Math.min(100, favor));
    for (let i = FAVOR_STAGES.length - 1; i >= 0; i--) {
      if (val >= FAVOR_STAGES[i].range[0]) {
        return { ...FAVOR_STAGES[i], index: i };
      }
    }
    return { ...FAVOR_STAGES[0], index: 0 };
  }

  /** 获取所有好感增减方式 */
  getFavorActions() { return FAVOR_ACTIONS; }

  /**
   * 修改NPC好感度
   * @param {string} npcName
   * @param {number} delta 变化值（正=增加，负=减少）
   * @returns {{ newFavor:number, stage:object, msg:string }}
   */
  modifyFavor(npcName, delta) {
    if (this._deadNPCs.includes(npcName)) {
      return { newFavor: 0, stage: null, msg: `${npcName} 已死亡` };
    }

    if (!this._npcFavors[npcName]) {
      this._npcFavors[npcName] = 0;
    }

    const oldFavor = this._npcFavors[npcName];
    this._npcFavors[npcName] = Math.max(0, Math.min(100, oldFavor + delta));
    const newFavor = this._npcFavors[npcName];
    const oldStage = this.getFavorStage(oldFavor);
    const newStage = this.getFavorStage(newFavor);

    let msg = `${npcName} 好感度 ${oldFavor}→${newFavor}`;
    if (oldStage.title !== newStage.title) {
      msg += `（${oldStage.title}→${newStage.title}）`;
    }

    return { newFavor, stage: newStage, msg };
  }

  /**
   * 获取NPC当前好感度
   * @param {string} npcName
   */
  getFavor(npcName) {
    return this._npcFavors[npcName] || 0;
  }

  /**
   * 获取所有NPC好感度一览
   */
  getAllFavors() {
    return { ...this._npcFavors };
  }

  // ---- 双修系统 ----

  /**
   * 检查双修条件
   * @param {string} npcName
   * @param {number} playerRealmIndex 玩家大境界索引
   * @param {number} npcRealmIndex    NPC大境界索引
   * @returns {{ allowed:boolean, reason:string }}
   */
  canDualCultivate(npcName, playerRealmIndex, npcRealmIndex) {
    const favor = this.getFavor(npcName);
    if (favor < 80) {
      return { allowed: false, reason: `好感度不足（${favor}/80）` };
    }
    const diff = Math.abs(playerRealmIndex - npcRealmIndex);
    if (diff > 1) {
      return { allowed: false, reason: `境界差过大（${diff}阶>1阶）` };
    }
    return { allowed: true, reason: '' };
  }

  /**
   * 双修
   * @param {'普通'|'深层'|'功法'} type
   * @returns {{ days:number, speedMultiplier:number, favorGain:number, bonus:object, msg:string }}
   */
  dualCultivate(type) {
    const data = this.DATA.NPC.dualCultivation[type];
    if (!data) throw new Error(`未知双修类型: ${type}`);

    const result = {
      days: data.days,
      speedMultiplier: data.speed,
      favorGain: data.favorGain || 0,
      bonus: {}
    };

    if (data.mpBonus) result.bonus.mpBonus = data.mpBonus;
    if (data.breakBonus) result.bonus.breakBonus = data.breakBonus;
    if (data.firstTime) result.bonus.firstTimeMpBonus = 10;

    let msg = `${type}双修${data.days}天，修速×${data.speed}`;
    if (data.favorGain) msg += `，好感+${data.favorGain}`;
    if (data.mpBonus) msg += `，灵力上限+${data.mpBonus}`;
    if (data.breakBonus) msg += `，突破+${data.breakBonus}%`;

    result.msg = msg;
    return result;
  }

  /**
   * 双修风险判定
   * @param {boolean} isRighteousFaction 是否正道宗门
   * @returns {{ risk:string|null }}
   */
  dualCultivateRisk(isRighteousFaction) {
    // 被撞见概率 8%
    if (Math.random() < 0.08) {
      if (isRighteousFaction) {
        return { risk: '被撞见', penalty: '正道名望-10' };
      }
      return { risk: '被撞见', penalty: '无特殊惩罚(魔道)' };
    }
    // 对方翻脸概率 3%
    if (Math.random() < 0.03) {
      return { risk: '对方翻脸', penalty: '虚弱7天' };
    }
    return { risk: null };
  }

  // ---- 关系网络 ----

  /** 获取8种关系类型 */
  getRelationTypes() { return RELATION_TYPES; }

  /**
   * 关系传播计算
   * 公式：对A的行为 → 影响B的好感度 = 行为值 × 关系系数 × 0.5
   *
   * @param {string} targetNPC   行为直接目标NPC名
   * @param {number} actionValue 好感变化值
   * @returns {object[]} 受影响的其他NPC [{ npc, favorDelta, reason }]
   */
  propagateFavor(targetNPC, actionValue) {
    const npcData = KEY_NPCS[targetNPC];
    if (!npcData || !npcData.relations) return [];

    const results = [];

    for (const [relType, npcs] of Object.entries(npcData.relations)) {
      const relation = RELATION_TYPES[relType];
      if (!relation) continue;
      const coeff = relation.coefficient;
      const delta = Math.round(actionValue * coeff * 0.5);

      if (delta === 0) continue;

      npcs.forEach(npc => {
        // 过滤掉带条件的（如"玩家(好感≥60)"）
        const cleanName = npc.replace(/\(.*\)/, '').trim();
        if (cleanName === '玩家' || this._deadNPCs.includes(cleanName)) return;

        results.push({
          npc: cleanName,
          favorDelta: delta,
          reason: `${targetNPC}(${relType}·系数${coeff}) → ${cleanName}`
        });
      });
    }

    return results;
  }

  /**
   * 应用关系传播（批量修改好感度）
   * @param {string} targetNPC
   * @param {number} actionValue
   * @returns {{ propagated:object[], logs:string[] }}
   */
  applyPropagateFavor(targetNPC, actionValue) {
    const propagated = this.propagateFavor(targetNPC, actionValue);
    const logs = [];

    propagated.forEach(p => {
      const result = this.modifyFavor(p.npc, p.favorDelta);
      logs.push(result.msg);
    });

    return { propagated, logs };
  }

  // ---- 击杀连锁 ----

  /**
   * 获取击杀连锁规则
   */
  getKillChainRules() { return KILL_CHAIN_RULES; }

  /**
   * 执行击杀连锁
   * @param {string} killedNPC 被击杀NPC名
   * @param {string} killerFaction 击杀者所属势力（玩家宗门）
   * @returns {{ consequences:object[], logs:string[], globalEffects:object }}
   */
  executeKillChain(killedNPC, killerFaction) {
    const npcData = KEY_NPCS[killedNPC];
    if (!npcData || !npcData.relations) {
      // 非关键NPC，只标记死亡
      this._deadNPCs.push(killedNPC);
      return { consequences: [], logs: [`${killedNPC} 已死亡`], globalEffects: {} };
    }

    this._deadNPCs.push(killedNPC);

    const consequences = [];
    const logs = [];
    const globalEffects = {};

    for (const [relType, npcs] of Object.entries(npcData.relations)) {
      const rule = KILL_CHAIN_RULES.find(r => r.relation === relType);
      if (!rule) continue;

      switch (relType) {
        case '挚友': {
          if (rule.favorPenalty) {
            npcs.forEach(n => {
              const cleanName = n.replace(/\(.*\)/, '').trim();
              if (cleanName !== '玩家') {
                const result = this.modifyFavor(cleanName, rule.favorPenalty);
                logs.push(result.msg);
              }
            });
          }
          // 50%概率寻仇
          if (Math.random() < 0.50) {
            consequences.push({
              type: '寻仇',
              from: npcs.map(n => n.replace(/\(.*\)/, '').trim()).filter(n => n !== '玩家'),
              msg: `${npcs.join('、')} 可能前来寻仇`
            });
            logs.push(`挚友寻仇警告：${npcs.join('、')} 50%概率前来复仇`);
          }
          break;
        }

        case '师徒': {
          // 师门悬赏
          globalEffects.bounty = true;
          npcs.forEach(n => {
            const cleanName = n.replace(/\(.*\)/, '').trim();
            if (cleanName !== '玩家') {
              this.modifyFavor(cleanName, -100); // 全部敌对
            }
          });
          logs.push(`${killedNPC}的师父发布了悬赏令，门下弟子全部敌对`);
          break;
        }

        case '道侣': {
          npcs.forEach(n => {
            const cleanName = n.replace(/\(.*\)/, '').trim();
            if (cleanName !== '玩家') {
              this.modifyFavor(cleanName, -100);
            }
          });
          logs.push(`${killedNPC}的道侣必定前来复仇，不死不休`);
          break;
        }

        case '同门': {
          if (rule.favorPenalty) {
            npcs.forEach(n => {
              const cleanName = n.replace(/\(.*\)/, '').trim();
              if (cleanName !== '玩家') {
                this.modifyFavor(cleanName, rule.favorPenalty);
              }
            });
          }
          globalEffects.sectBounty = true;
          logs.push(`同门全员好感${rule.favorPenalty}，宗门可能发悬赏`);
          break;
        }

        case '势力隶属': {
          if (rule.favorPenalty) {
            const sectName = npcs[0]; // 所属势力名
            logs.push(`全势力"${sectName}"好感${rule.favorPenalty}，无法进入该势力区域`);
          }
          break;
        }

        case '熟人': {
          if (rule.favorPenalty) {
            npcs.forEach(n => {
              const cleanName = n.replace(/\(.*\)/, '').trim();
              if (cleanName !== '玩家') {
                this.modifyFavor(cleanName, rule.favorPenalty);
              }
            });
          }
          break;
        }
      }
    }

    return { consequences, logs, globalEffects };
  }

  /**
   * 获取NPC信息卡（用于击杀前查看关系网络）
   * @param {string} npcName
   */
  getNPCInfo(npcName) {
    const data = KEY_NPCS[npcName];
    if (!data) return null;

    const favor = this.getFavor(npcName);
    const stage = this.getFavorStage(favor);
    const isDead = this._deadNPCs.includes(npcName);

    return {
      name: npcName,
      realm: data.realm,
      location: data.location,
      schedule: data.schedule,
      relations: data.relations,
      favor,
      stage: stage.title,
      discount: stage.discount,
      isDead
    };
  }

  /**
   * 获取NPC当前所在位置（根据时间/日期）
   * @param {string} npcName
   * @param {object} gameTime { day, month, season }
   * @returns {{ location:string, action:string }|null}
   */
  getNPCCurrentLocation(npcName, gameTime) {
    const data = KEY_NPCS[npcName];
    if (!data || !data.schedule) return null;

    if (this._deadNPCs.includes(npcName)) {
      return { location: '已故', action: '-' };
    }

    const schedule = data.schedule;

    // 找最匹配的日程（常驻 > 按月 > 按季度）
    for (const entry of schedule) {
      if (entry.time === '常驻') {
        return { location: entry.location, action: entry.action };
      }
    }

    // 按月匹配
    for (const entry of schedule) {
      if (entry.time === '每月' || entry.time === '每月初一') {
        if (gameTime && (entry.time === '每月' || gameTime.day === 1)) {
          return { location: entry.location, action: entry.action };
        }
      }
    }

    // 按季度
    for (const entry of schedule) {
      if (entry.time === '每季度' && gameTime) {
        const monthInQuarter = (gameTime.month % 3);
        if (monthInQuarter === 0) { // 季度首月
          return { location: entry.location, action: entry.action };
        }
      }
    }

    return { location: data.schedule[0].location, action: data.schedule[0].action };
  }

  /** 获取所有关键NPC列表 */
  getKeyNPCList() {
    return Object.keys(KEY_NPCS).map(name => ({
      name,
      realm: KEY_NPCS[name].realm,
      location: KEY_NPCS[name].location,
      relations: KEY_NPCS[name].relations,
      favor: this.getFavor(name),
      isDead: this._deadNPCs.includes(name)
    }));
  }

  /**
   * 获取NPC关系网络数据
   * @param {string} npcName
   */
  getNPCRelationNetwork(npcName) {
    const data = KEY_NPCS[npcName];
    if (!data) return null;
    return {
      name: npcName,
      relations: data.relations,
      relationTypes: Object.keys(data.relations)
    };
  }

  // ---- 初始关系（新游戏或新NPC加入时调用） ----

  /**
   * 设置NPC初始关系好感度
   * @param {string} npcName
   * @param {number} baseFavor 基础好感度
   * @param {object} playerContext { sect, faction, etc. }
   */
  initNPCFavor(npcName, baseFavor, playerContext) {
    if (this._npcFavors[npcName] !== undefined) return; // 不覆盖已有

    let favor = baseFavor || 0;

    // 同门+15
    if (playerContext && playerContext.sect) {
      const npcData = KEY_NPCS[npcName];
      if (npcData && npcData.relations) {
        const sectRelations = npcData.relations['势力隶属'] || [];
        if (sectRelations.includes(playerContext.sect)) {
          favor += 15;
        }
      }
    }

    // 势力敌对-20
    if (playerContext && playerContext.faction) {
      const npcData = KEY_NPCS[npcName];
      if (npcData && npcData.relations) {
        const enemies = npcData.relations['仇敌'] || [];
        // 检查是否存在间接敌对
      }
    }

    this._npcFavors[npcName] = Math.max(0, Math.min(100, favor));
    return this._npcFavors[npcName];
  }

  /** 获取某NPC关系链中所有关联NPC */
  getRelatedNPCs(npcName) {
    const data = KEY_NPCS[npcName];
    if (!data || !data.relations) return [];

    const allRelated = new Set();
    Object.values(data.relations).forEach(npcs => {
      npcs.forEach(n => {
        const clean = n.replace(/\(.*\)/, '').trim();
        if (clean !== '玩家') allRelated.add(clean);
      });
    });

    return Array.from(allRelated);
  }

  // ================================================================
  // 综合辅助
  // ================================================================

  /**
   * 时间推进
   * @param {number} days 经过天数
   * @param {object} playerState { spiritStones } 用于自动喂食扣费
   */
  tick(days, playerState) {
    // 推进傀儡年龄
    this.tickPuppets(days);

    // 自动喂食灵兽（简化：按拥有的灵兽数和天数扣灵石）
    const alivePets = this.getAlivePets();
    let totalFeedCost = 0;
    alivePets.forEach(pet => {
      const dailyCost = this.getFeedCost(pet.rank || 1);
      totalFeedCost += dailyCost * days;
    });

    if (playerState && playerState.spiritStones !== undefined) {
      playerState.spiritStones -= totalFeedCost;
    }

    return {
      feedCost: totalFeedCost,
      feedMsg: totalFeedCost > 0 ? `灵兽喂食 ${days} 天，共消耗 ${totalFeedCost} 灵石` : ''
    };
  }

  /** 获取完整状态快照 */
  getState() {
    return {
      pets: this._pets.map(p => ({ ...p })),
      puppets: this._puppets.map(p => ({ ...p })),
      sect: this._sect ? { ...this._sect } : null,
      sectContribution: this._sectContribution,
      npcFavors: { ...this._npcFavors },
      deadNPCs: [...this._deadNPCs]
    };
  }

  /** 序列化 */
  serialize() {
    return JSON.stringify(this.getState());
  }

  /** 反序列化 */
  deserialize(json) {
    const state = JSON.parse(json);
    if (state.pets) this._pets = state.pets;
    if (state.puppets) this._puppets = state.puppets;
    if (state.sect) this._sect = state.sect;
    this._sectContribution = state.sectContribution || 0;
    if (state.npcFavors) this._npcFavors = state.npcFavors;
    if (state.deadNPCs) this._deadNPCs = state.deadNPCs;
  }
}

// ============================================================
// 导出
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Companions };
}
// 浏览器环境
if (typeof window !== 'undefined') {
  window.Companions = Companions;
}
