/**
 * events.js — 事件与剧情系统
 * 基于 temp_gdd.md v1.0
 *
 * 内容：
 *   一、6大类事件池（每事件3套文本变体+选项+结果）
 *   二、5条事件链（多步骤衔接）
 *   三、动态条件（名望/境界/神识/炼体/灵根）
 *   四、主线9章完整步骤拆解
 *   五、8条支线任务
 *   六、6位NPC对话（5阶段×3句）
 *
 * 依赖：DATA（DATA.REALMS, DATA.EXPLORATION, DATA.PILLS 等）
 * 导出：Events 类
 */

import { DATA } from './data.js';

// ============================================================
// 一、事件池文本库
// ============================================================

/** ① 普通野外节点事件池（9种） */
const WILD_EVENTS = {
  '采集灵草': {
    weight: 30,
    texts: [
      '你拨开一丛茂密的灌木，发现了一片灵草，大约有5~8株。',
      '山壁上几株灵草在风中轻轻摇曳，品相极佳。',
      '石缝里冒出一小片翠绿的灵草，散发着淡淡的灵气。'
    ],
    options: [
      { label: '采集', action: 'harvest', cost: { days: 1 }, result: { type: 'items', items: { '灵草': '3~6' }, text: '你小心地将灵草采下，收入囊中。' } },
      { label: '移植灵田', action: 'transplant', result: { type: 'bottleGarden', text: '你连根带土挖起，移植到灵田中，预计7天后可收获。' } },
      { label: '绿液催熟', action: 'greenLiquid', cost: { greenLiquid: 1 }, result: { type: 'instantHarvest', text: '绿液滴下，灵草以肉眼可见的速度疯长！' } },
      { label: '忽略', action: 'skip', result: { type: 'none', text: '无事发生' } }
    ],
    dynamic: {
      境界: { aboveRegion: 0.2, effect: '有20%概率发现变异灵草(药效x2)' }
    }
  },
  '遭遇妖兽': {
    weight: 20,
    texts: [
      '草丛中传来低沉的吼声，一双发光的眼睛正盯着你。',
      '地面微微震动，有什么大型生物正在靠近……',
      '树梢上传来尖锐的鸣叫，一只妖兽俯冲而下！'
    ],
    options: [
      { label: '战斗', action: 'battle', result: { type: 'combat', enemy: '区域最低级妖兽' } },
      { label: '隐匿符', action: 'useTalisman', cost: { item: '隐匿符', count: 1 }, result: { type: 'escape', text: '安全离开' } },
      { label: '绕路', action: 'detour', cost: { days: 1 }, result: { type: 'none', text: '无事发生' } },
      { label: '神识探查', action: 'scan', require: { 神识: 50 }, result: { type: 'assess', text: '判断妖兽实力，太强则自动建议绕路' } }
    ],
    dynamic: {
      名望: { above: 50, effect: '妖兽被气势震慑，概率不战而退' }
    }
  },
  '废弃洞府': {
    weight: 12,
    texts: [
      '岩石后面露出半边石门，看上去是前人留下的洞府。',
      '山壁上有一个被藤蔓遮掩的洞口，隐约可见人工开凿的痕迹。',
      '一棵古树的根部露出一个洞口，里面有微弱的光。'
    ],
    options: [
      { label: '搜索', action: 'search', cost: { days: 2 }, result: { type: 'randomLoot', text: '获得随机物品(丹药/材料/灵石)。神识≥100额外发现隐藏暗格' }, require: { 神识: 100, bonus: '发现隐藏暗格' } },
      { label: '占为己有', action: 'claim', cost: { days: 5, spiritStone: 200 }, result: { type: 'cultivationSite', text: '获得修炼据点（修炼速度+10%永久，仅1次）' } },
      { label: '离开', action: 'leave', result: { type: 'none', text: '无事' } }
    ],
    chain: { key: '藏宝图', text: '首次获得"藏宝图碎片①"，3次集齐→隐藏秘境' }
  },
  '灵泉眼': {
    weight: 8,
    texts: [
      '石缝中渗出一股清泉，散发着淡淡的灵气。',
      '低洼处积了一小潭水，水质清澈透亮。',
      '岩石上滴落的水珠在下方汇成一小洼灵泉。'
    ],
    options: [
      { label: '饮用', action: 'drink', result: { type: 'permBuff', buff: { mpMax: 3 }, text: '灵力上限永久+3' }, dynamic: { 灵根: { 水: { min: 30, bonus: '效果翻倍(+6)' } } } },
      { label: '装走', action: 'bottle', result: { type: 'items', items: { '灵泉水': 3 } } },
      { label: '标记', action: 'mark', result: { type: 'mapMark', text: '标记在地图上（一次性）' } }
    ]
  },
  '矿石露头': {
    weight: 10,
    texts: [
      '岩壁上裸露着一些闪烁的矿石。',
      '脚下的碎石中混杂着几块颜色不同的矿石。',
      '溪水冲刷过的河床上散落着几块矿石。'
    ],
    options: [
      { label: '开采', action: 'mine', cost: { days: 1 }, result: { type: 'items', items: { '矿石': '3~8' } } }
    ]
  },
  '遇到散修': {
    weight: 8,
    texts: [
      '一位修士迎面走来，打量了你几眼。',
      '前方有人影晃动，一名修士正坐在路边休息。',
      '有人喊了一声"道友留步"，回头一看是个面生的修士。'
    ],
    options: [
      { label: '交易', action: 'trade', result: { type: 'shop', text: '对方出售2~3件随机物品' } },
      { label: '切磋', action: 'spar', result: { type: 'combat', friendly: true, win: { fame: 5 }, lose: { text: '无事' }, text: '友好切磋' } },
      { label: '结伴', action: 'companion', result: { type: 'companion', text: '跟随探索1次，遇战斗时协助' } }
    ],
    dynamic: {
      正道名望: { above: 30, effect: '友善可打9折' },
      魔道名望: { above: 30, effect: '警惕可能动手' }
    }
  },
  '陷阱': {
    weight: 5,
    texts: [
      '你脚下突然一空！地面上有一个精心伪装的陷坑。',
      '一根被削尖的木桩从侧面弹射而来！',
      '你触碰到一根极细的丝线——有机关！'
    ],
    options: [
      { label: '硬抗', action: 'tank', result: { type: 'damage', hpPercent: -15 } },
      { label: '神识躲避', action: 'avoid', require: { 神识: 30 }, result: { type: 'avoid', text: '神识≥30可提前发现，安全避开' } }
    ],
    dynamic: {
      境界: { aboveRegion: true, effect: '自动规避，无需判定' }
    }
  },
  '特殊天象': {
    weight: 5,
    texts: [
      '天边闪过一道异光，灵气骤然浓郁起来。',
      '天空出现七彩霞光，空气中的灵气变得异常活跃。',
      '一道流星划破天际，坠落在远处的山间。'
    ],
    options: [
      { label: '感悟', action: 'meditate', cost: { days: 3 }, result: { type: 'statBuff', buff: { 悟性: 1, cultivation: '速度x3' } } },
      { label: '追查源头', action: 'trace', cost: { days: 5 }, result: { type: 'random', effects: ['发现秘境入口', '发现天材地宝'] } }
    ]
  },
  '空手而归': {
    weight: 2,
    texts: [
      '转了一圈，什么也没发现。',
      '今天运气不太好，空手而归。',
      '这里似乎被人搜刮过了，没什么有价值的东西。'
    ],
    options: [
      { label: '返回', action: 'return', result: { type: 'none', text: '探索结束' } }
    ]
  }
};

/** ② 秘境节点事件池（9种） */
const SECRET_EVENTS = {
  '禁制挡路': {
    weight: 25,
    texts: [
      '一道古老的禁制挡住了去路，符文闪烁。',
      '面前是一道光幕，散发着强大的灵力波动。',
      '空气中浮现出金色的符文锁链，封锁了通道。'
    ],
    options: [
      { label: '神识破禁', action: 'breachSpirit', result: { type: 'check', stat: '神识', win: '通过', lose: '神识-20%' } },
      { label: '灵力冲破', action: 'breachMp', cost: { mpPercent: -50 }, result: { type: 'pass' } },
      { label: '绕路', action: 'detour', cost: { days: 2 }, result: { type: 'pass' } },
      { label: '破禁符', action: 'useTalisman', cost: { item: '破禁符', count: 1 }, result: { type: 'pass', guaranteed: true } }
    ]
  },
  '宝物出现': {
    weight: 20,
    texts: [
      '前方石台上放着一件物品，散发着微光。',
      '角落里有一个尘封的宝箱。',
      '一具骸骨手中握着一件完整的法宝。'
    ],
    options: [
      { label: '取走', action: 'take', result: { type: 'randomTreasure', text: '获得随机品阶宝物' } },
      { label: '先探查', action: 'check', result: { type: 'scan', text: '神识判定是否有陷阱' } }
    ]
  },
  '妖兽守护': {
    weight: 15,
    texts: [
      '一只妖兽盘踞在通道前方。',
      '黑暗中亮起两团红光——守护兽醒了！',
      '通道尽头传来低沉的呼吸声。'
    ],
    options: [
      { label: '战斗', action: 'battle', result: { type: 'bossFight' } },
      { label: '绕路', action: 'retreat', result: { type: 'back', text: '返回上层' } }
    ]
  },
  '传承试炼': {
    weight: 10,
    texts: [
      '骸骨前放着玉简，旁边刻着"通过试炼者可得"。',
      '石壁上刻满了文字，最下方有一个手掌印。',
      '一座石碑立在通道中央，碑文泛着金光。'
    ],
    options: [
      { label: '接受试炼', action: 'accept', result: { type: 'trial', variants: ['战斗', '答题', '心魔'], text: '随机挑战' } },
      { label: '强行取走', action: 'force', result: { type: 'trap', text: '触发禁制强制战斗' } }
    ]
  },
  '迷宫岔路': {
    weight: 10,
    texts: [
      '前方出现三条岔路。',
      '通道在此分成了两个方向。',
      '面前是一道传送门和一条步行通道。'
    ],
    options: [
      { label: '左', action: 'left', result: { type: 'branch', text: '不同方向对应不同结果' } },
      { label: '右', action: 'right', result: { type: 'branch' } },
      { label: '前', action: 'forward', result: { type: 'branch' } }
    ]
  },
  '前人遗骸': {
    weight: 8,
    texts: [
      '角落倚着一具骸骨，衣物尚未完全腐朽。',
      '通道边倒着一具遗骸，手边还有一个储物袋。',
      '一具盘坐的骸骨，膝上放着一卷竹简。'
    ],
    options: [
      { label: '搜尸', action: 'loot', result: { type: 'loot', items: ['丹药', '法宝', '灵石'], text: '概率触发回忆剧情' } }
    ]
  },
  '传送陷阱': {
    weight: 5,
    texts: [
      '你踩到了一块松动的石板……脚下突然一空！',
      '你碰触墙壁时，掌下亮起了传送符文。',
      '地面上有一个不起眼的阵法图案。'
    ],
    result: { type: 'teleport', text: '随机传送到秘境其他位置（可能更近/可能回到入口）' },
    options: [{ label: '接受', action: 'accept', result: { type: 'teleport' } }]
  },
  '秘境崩塌': {
    weight: 5,
    texts: [
      '整个秘境开始剧烈震动！天花板的石块不断坠落！',
      '地面裂开了一道巨大的缝隙！',
      '支撑秘境的阵法正在崩溃——要塌了！'
    ],
    options: [
      { label: '冲刺出口', action: 'rush', result: { type: 'escape', text: '必定逃脱但失去探索机会' } },
      { label: '找安全角落', action: 'hide', result: { type: 'check', stat: '神识', win: '躲过崩塌', lose: '气血-40%' } }
    ]
  },
  '隐秘通道': {
    weight: 2,
    texts: [
      '你注意到墙壁上有一处不仔细看根本发现不了的缝隙。',
      '一块岩石的颜色和周围不太一样。',
      '风从墙壁的某处吹来——后面是空的！'
    ],
    options: [
      { label: '探索', action: 'explore', result: { type: 'hiddenArea', text: '发现隐藏区域，额外奖励' } }
    ]
  }
};

/** ③ 城镇节点事件池（10种） */
const TOWN_EVENTS = {
  '坊市摊位': {
    weight: 25,
    texts: [
      '街道两旁摆满了摊位，各种物品琳琅满目。',
      '坊市里人来人往，叫卖声不绝于耳。',
      '今天的坊市格外热闹，多了几个新摊位。'
    ],
    options: [
      { label: '浏览', action: 'browse', result: { type: 'shop', text: '打开该城镇坊市列表' } }
    ]
  },
  '酒馆情报': {
    weight: 15,
    texts: [
      '酒馆里人声鼎沸，角落里有修士在低声交谈。',
      '吧台边坐着几个修士，似乎在讨论什么秘闻。',
      '一个醉醺醺的修士拉着你，"我告诉你一个秘密……"'
    ],
    options: [
      { label: '打听情报', action: 'inquire', cost: { spiritStone: 50, days: 1 }, result: { type: 'intel', text: '获得随机情报' } }
    ],
    chain: { key: '酒馆情报', text: '连续3次听到同一秘境的情报→秘境线索(3/3)→解锁入口' }
  },
  '告示板任务': {
    weight: 15,
    texts: [
      '城门口的告示板上贴着几张任务单。',
      '任务堂的墙上挂满了委托。',
      '一张新的悬赏令刚刚贴上告示板。'
    ],
    options: [
      { label: '查看', action: 'view', result: { type: 'questList', text: '任务列表' } },
      { label: '接取', action: 'accept', result: { type: 'addQuest', text: '加入任务列表' } }
    ]
  },
  '遇到熟人': {
    weight: 12,
    texts: [
      '一个熟悉的身影出现在人群中。',
      '有人在背后拍了拍你的肩膀。',
      '街角的茶馆里坐着一个你认识的人。'
    ],
    options: [
      { label: '打招呼', action: 'greet', result: { type: 'affection', value: 2 } },
      { label: '小聚', action: 'dine', cost: { days: 1 }, result: { type: 'affection', value: 5, bonus: '获得情报' } }
    ]
  },
  '黑市入口': {
    weight: 10,
    texts: [
      '巷子里一个黑袍人向你使了个眼色。',
      '一个摊主压低声音："有好货，要不要看看？"',
      '酒馆的小二递给你一张纸条：今晚有暗市。'
    ],
    options: [
      { label: '跟随', action: 'follow', result: { type: 'unlock', what: '黑市入口' } },
      { label: '无视', action: 'ignore', result: { type: 'none' } }
    ]
  },
  '拍卖会': {
    weight: 8,
    texts: [
      '一张金色请柬飘到你面前——拍卖会即将开始。',
      '街道上贴满了拍卖会的告示。',
      '你收到一封匿名邀请函，上面写着拍卖会的时间和地点。'
    ],
    options: [
      { label: '查看预告', action: 'preview', result: { type: 'auctionPreview', text: '拍品列表' } },
      { label: '预约', action: 'reserve', result: { type: 'reminder', text: '到期自动提醒' } }
    ]
  },
  '被人跟踪': {
    weight: 5,
    texts: [
      '你感觉有人在暗处盯着你。',
      '回头时瞥见一个身影迅速躲进了巷子里。',
      '你已经注意到同一个人在你附近出现了三次。'
    ],
    options: [
      { label: '甩掉', action: 'shake', result: { type: 'check', stat: '神识' } },
      { label: '反制', action: 'counter', result: { type: 'combat' } },
      { label: '加速离开', action: 'flee', result: { type: 'safeZone' } }
    ]
  },
  '街头比试': {
    weight: 5,
    texts: [
      '一名修士拦住你："道友，切磋一下？"',
      '广场上围了一群人，中间有人正在比试。',
      '一个年轻人跃到你面前，拱手道："请指教。"'
    ],
    options: [
      { label: '接受', action: 'accept', result: { type: 'combat', win: { fame: 5, spiritStone: 50 }, lose: { text: '无事' } } },
      { label: '婉拒', action: 'decline', result: { type: 'none' } }
    ],
    dynamic: {
      名望: { above: 50, effect: '对方直接认输，名望+10' }
    }
  },
  '秘闻': {
    weight: 3,
    texts: [
      '你无意中听到两个修士的对话……似乎提到了某个秘境。',
      '邻桌的人在低声讨论一件大事。',
      '路过巷口时，你听到了一个惊人的消息。'
    ],
    options: [
      { label: '继续偷听', action: 'eavesdrop', require: { 神识: 50 }, result: { type: 'intel', text: '神识≥50可听全，获得秘境线索' } }
    ]
  },
  '天降机缘': {
    weight: 2,
    texts: [
      '路边摊上一件不起眼的物品引起了你的注意。',
      '一个老婆婆的摊位上有件东西散发着微弱的气息。',
      '废品堆里有什么东西闪了一下。'
    ],
    options: [
      { label: '购买', action: 'buy', cost: { spiritStone: 100 }, result: { type: 'gamble', text: '获得随机物品（可能是极品/可能是废品）' } }
    ]
  }
};

/** ④ 宗门节点事件池（9种） */
const FACTION_EVENTS = {
  '宗门任务': {
    weight: 25,
    texts: [
      '任务堂的公告板上贴着今日任务。',
      '管事师兄看到你："来领任务？正好有几个合适的。"',
      '宗门传讯符闪烁，有新的任务发布。'
    ],
    options: [
      { label: '查看', action: 'view', result: { type: 'dailyQuests', text: '接取日常任务' } }
    ]
  },
  '藏经阁': {
    weight: 20,
    texts: [
      '藏经阁中典籍浩如烟海。',
      '守阁长老正在打瞌睡。',
      '藏经阁的书架间弥漫着淡淡的书卷气息。'
    ],
    options: [
      { label: '浏览', action: 'browse', result: { type: 'exchange', text: '消耗贡献兑换功法' } }
    ]
  },
  '同门切磋': {
    weight: 15,
    texts: [
      '一名同门走过来："师兄，切磋一下？"',
      '演武场上有人向你招手。',
      '宗门擂台边围着不少人，有人正在找你。'
    ],
    options: [
      { label: '接受', action: 'accept', result: { type: 'combat', win: { contribution: 20, fame: 3 } } }
    ]
  },
  '长老讲学': {
    weight: 12,
    texts: [
      '长老今日开坛讲学，不少弟子已经到场。',
      '钟声响起——又到了长老讲学的日子。',
      '一张告示：XX长老将于明日讲授心得。'
    ],
    options: [
      { label: '听讲', action: 'attend', cost: { days: 3 }, result: { type: 'wisdomXP', text: '悟性经验+概率获得突破感悟' } }
    ]
  },
  '灵药园任务': {
    weight: 10,
    texts: [
      '灵药园的管事招手："来帮忙，给你算贡献。"',
      '灵药园的灵草需要浇水了。',
      '管事愁眉苦脸：人手不够，灵草要荒了。'
    ],
    options: [
      { label: '帮忙', action: 'help', cost: { days: 2 }, result: { type: 'reward', items: { '灵草': 5 }, contribution: 10 } }
    ]
  },
  '宗门仓库': {
    weight: 8,
    texts: [
      '可以用贡献到仓库兑换物资。',
      '仓库执事翻了翻册子："最近新到了一批丹药。"'
    ],
    options: [
      { label: '兑换', action: 'exchange', result: { type: 'exchangeList', text: '打开兑换列表' } }
    ]
  },
  '同门求助': {
    weight: 5,
    texts: [
      '一位同门满脸愁容地找到你："能不能帮我一个忙？"',
      '有人给你传了条简讯："急事相求，速来。"'
    ],
    options: [
      { label: '帮助', action: 'help', result: { type: 'questChain', affection: 15, contribution: 30 } },
      { label: '拒绝', action: 'decline', result: { type: 'affectionLoss', affection: -5 } }
    ]
  },
  '宗门大比': {
    weight: 3,
    texts: [
      '宗门大比的报名开始了！',
      '公告：三个月后举行宗门大比，奖励丰厚。'
    ],
    options: [
      { label: '报名', action: 'register', result: { type: 'tournament', text: '参赛，排名越高奖励越好' } }
    ]
  },
  '内奸事件': {
    weight: 2,
    texts: [
      '你无意中看到一个人在鬼鬼祟祟地传递什么东西。',
      '后山禁地附近有个可疑的身影一晃而过。'
    ],
    options: [
      { label: '举报', action: 'report', result: { type: 'reward', contribution: 100, risk: '可能结仇' } },
      { label: '跟踪', action: 'tail', result: { type: 'hiddenQuestChain', text: '触发隐藏任务链' } }
    ]
  }
};

/** ⑤ 危险节点事件池（6种） */
const DANGER_EVENTS = {
  '魔气侵蚀': {
    weight: 30,
    texts: [
      '浓重的魔气从四面八方涌来。',
      '空气中弥漫着一股腐蚀性的气息。',
      '魔气如潮水般涌来，护体灵光在快速消耗。'
    ],
    options: [
      { label: '运功抵抗', action: 'resist', cost: { mpPercent: -10, rounds: 3 }, result: { type: 'immune', text: '3回合后免疫' } },
      { label: '破瘴丹', action: 'usePill', cost: { item: '破瘴丹', count: 1 }, result: { type: 'immune', duration: 30, unit: '天' } },
      { label: '退出', action: 'leave', result: { type: 'back' } }
    ]
  },
  '古魔残魂': {
    weight: 20,
    texts: [
      '一道残魂从黑暗中浮现，发出无声的咆哮。',
      '角落里的阴影蠕动着凝聚成一个模糊的人形。',
      '一股寒意从背后袭来——转头的瞬间，一张苍白的脸近在咫尺。'
    ],
    options: [
      { label: '神识拼斗', action: 'spiritBattle', result: { type: 'spiritCombat' } },
      { label: '退避', action: 'retreat', result: { type: 'none' } }
    ]
  },
  '封印松动': {
    weight: 15,
    texts: [
      '地面震动，封印阵法出现了裂纹！',
      '封印石上的符文忽明忽暗，发出不堪重负的声音。',
      '一股强大的力量正从封印下方冲击着屏障。'
    ],
    options: [
      { label: '加固封印', action: 'reinforce', cost: { mpPercent: -50, spiritStone: 1000 }, result: { type: 'contribution', text: '获得贡献' } },
      { label: '收集能量', action: 'collect', result: { type: 'items', items: { '魔晶石': '3~5' } } },
      { label: '撤离', action: 'evacuate', result: { type: 'safe' } }
    ],
    chain: { key: '昆吾山', text: '3次加固获得完整封印法宝' }
  },
  '煞气爆发': {
    weight: 15,
    texts: [
      '地煞之气突然喷涌而出！',
      '地面裂开一道缝隙，煞气如利刃般冲出！',
      '空气中弥漫着刺骨的煞气。'
    ],
    options: [
      { label: '炼体吸收', action: 'absorb', cost: { days: 5 }, result: { type: 'bodyXP', value: '80~150' } },
      { label: '躲避', action: 'dodge', result: { type: 'none' } }
    ],
    dynamic: {
      炼体: { min: '铜皮Lv5', effect: '可主动吸收，收益翻倍' }
    }
  },
  '古修遗宝': {
    weight: 10,
    texts: [
      '角落里有一件被尘土掩盖的物品。',
      '石缝中隐约可以看到一件法宝的轮廓。',
      '一具骸骨的手指上戴着一枚古朴的戒指。'
    ],
    options: [
      { label: '拾取', action: 'take', result: { type: 'treasure', text: '获得古宝/玄天之宝（按节点等级）' } }
    ]
  },
  '空间裂缝': {
    weight: 10,
    texts: [
      '空气中出现一道漆黑的裂缝，传来吸力。',
      '前方的空间扭曲了，像一面破碎的镜子。',
      '一股不正常的吸力拉扯着你——那里有一道空间裂隙！'
    ],
    options: [
      { label: '探索', action: 'explore', result: { type: 'gamble', effects: ['获虚空晶', '被随机传送'] } },
      { label: '远离', action: 'leave', result: { type: 'safe' } }
    ]
  }
};

/** ⑥ 飞升渡劫事件（4阶段固定） */
const TRIBULATION_EVENTS = {
  '天雷降临': {
    texts: ['劫云汇聚，天地变色。第一道天雷轰然落下！'],
    options: [
      { label: '硬抗', action: 'tank', result: { type: 'damage', hpPercent: -50 } },
      { label: '用法宝挡', action: 'block', result: { type: 'equipDamage', durabilityPercent: -30 } },
      { label: '布阵', action: 'array', cost: { spiritStone: 5000, materials: '阵法材料' }, result: { type: 'protect', damageReduction: 70 } }
    ]
  },
  '心魔骤起': {
    texts: ['耳边响起无数低语，往日的遗憾和恐惧涌上心头……'],
    options: [
      { label: '神识对抗', action: 'spiritCheck', result: { type: 'check', stat: '神识' } },
      { label: '凝神丹', action: 'usePill', cost: { item: '凝神丹', count: 1 }, result: { type: 'buff', buff: { 神识: '临时+50%' } } }
    ]
  },
  '灵气枯竭': {
    texts: ['周围的灵气被劫雷一扫而空，灵力恢复停滞了。'],
    options: [
      { label: '回灵丹', action: 'usePill', cost: { item: '回灵丹', count: 1 }, result: { type: 'recover', mpPercent: 40 } },
      { label: '灵石补充', action: 'stones', cost: { spiritStone: 1000 }, result: { type: 'recover', mpPercent: 20 } },
      { label: '硬撑', action: 'endure', result: { type: 'consume', text: '灵力归零后消耗气血' } }
    ]
  },
  '天降甘霖': {
    texts: ['劫云散去，一道金色的甘霖从天而降，滋养肉身和神魂。'],
    result: { type: 'ascension', text: '全属性大幅提升，肉身重塑，寿元增加' },
    options: []
  }
};

// ============================================================
// 二、事件链
// ============================================================

const EVENT_CHAINS = {
  '藏宝图': {
    name: '废弃洞府→藏宝图',
    description: '从废弃洞府收集藏宝图碎片',
    steps: [
      { id: 1, trigger: '废弃洞府', text: '获得"藏宝图碎片①"', action: '搜索洞府' },
      { id: 2, trigger: '废弃洞府（同一区域）', text: '获得藏宝图碎片②' },
      { id: 3, trigger: '废弃洞府（同一区域）', text: '碎片③集齐→解锁"隐藏秘境"入口坐标' }
    ],
    completeReward: { type: 'unlock', target: '隐藏秘境', text: '解锁隐藏秘境入口' }
  },
  '酒馆情报': {
    name: '酒馆情报→秘境线索',
    description: '在酒馆收集秘境情报',
    steps: [
      { id: 1, trigger: '酒馆情报', text: '听到某秘境线索' },
      { id: 2, trigger: '对应区域', text: '前往对应区域触发指引事件' },
      { id: 3, trigger: '指引事件', text: '找到秘境入口' }
    ],
    progressText: '秘境线索收集({current}/{total})'
  },
  '血色禁地': {
    name: '血禁山脉→血色禁地',
    description: '通过血禁山脉任务获得血色禁地准入资格',
    steps: [
      { id: 1, trigger: '首次进入血禁山脉', text: '触发送信任务' },
      { id: 2, trigger: '完成送信', text: '获得血色禁地准入资格' }
    ],
    completeReward: { type: 'access', target: '血色禁地', text: '后续血色禁地开启时自动获得进入名额' }
  },
  '万妖山脉': {
    name: '万妖山脉→妖族友好',
    description: '通过和平行为建立妖族好感',
    steps: [
      { id: 1, trigger: '万妖山脉', action: '连续3次选择"和平离开"', text: '妖族好感+30' },
      { id: 2, trigger: '好感≥50', text: '触发"妖族交易会"事件' },
      { id: 3, trigger: '好感≥80', text: '触发"妖族传承"任务' }
    ]
  },
  '昆吾山': {
    name: '昆吾山→封印逐步松动',
    description: '加固昆吾山封印获得完整封印法宝',
    steps: [
      { id: 1, trigger: '封印松动', action: '加固', text: '获得封印碎片①' },
      { id: 2, trigger: '封印松动（第2次）', action: '加固', text: '获得封印碎片②' },
      { id: 3, trigger: '封印松动（第3次）', action: '加固', text: '封印完全修复，获得完整封印法宝' }
    ],
    completeReward: { type: 'item', target: '完整封印法宝' }
  }
};

// ============================================================
// 三、动态条件
// ============================================================

const DYNAMIC_CONDITIONS = {
  名望: [
    { field: '正道名望', operator: 'gt', value: 30, event: '遇到散修', effect: '友善可交易（9折）' },
    { field: '魔道名望', operator: 'gt', value: 30, event: '遇到散修', effect: '警惕可能动手' },
    { field: '名望', operator: 'gt', value: 50, event: '街头比试', effect: '对方直接认输，名望+10' },
    { field: '名望', operator: 'gt', value: 50, event: '遭遇妖兽', effect: '妖兽被气势震慑，概率不战而退' }
  ],
  境界: [
    { field: '境界', operator: 'aboveRegion', event: '陷阱', effect: '自动规避，无需判定' },
    { field: '境界', operator: 'aboveRegion', event: '采集灵草', effect: '有20%概率发现变异灵草(药效x2)' }
  ],
  神识: [
    { field: '神识', operator: 'gte', value: 100, event: '废弃洞府', effect: '搜索时额外发现隐藏暗格' },
    { field: '神识', operator: 'gte', value: '区域推荐值', event: '迷雾类', effect: '直接看穿，无需绕路' },
    { field: '神识', operator: 'gte', value: 50, event: '秘闻', effect: '可听全对话，获得秘境线索' }
  ],
  炼体: [
    { field: '炼体', operator: 'gte', value: '铜皮Lv5', event: '煞气爆发', effect: '可主动吸收煞气，收益翻倍' },
    { field: '炼体', operator: 'gte', value: '铁骨', event: '严寒类', effect: '无视环境惩罚' }
  ],
  灵根: [
    { field: '水灵根', operator: 'gte', value: 30, event: '灵泉眼', effect: '灵泉水效果翻倍(+6)' },
    { field: '火灵根', operator: 'gte', value: 30, event: '火焰类', effect: '减少伤害+50%' }
  ]
};

// ============================================================
// 四、主线9章完整步骤拆解
// ============================================================

const MAIN_QUEST = {
  chapter1: {
    title: '第一章：七玄门风云',
    subtitle: '凡人~练气初期',
    trigger: '新手引导完成后自动弹出',
    steps: [
      {
        id: 1, name: '七玄门召唤',
        trigger: '回到首页自动弹窗',
        text: '厉师兄让我通知你，墨大夫有异动！请你速回七玄门旧址！',
        goal: '前往青云山·七玄门旧址（地图自动标记）'
      },
      {
        id: 2, name: '墨大夫阴谋',
        trigger: '到达七玄门旧址',
        text: '厉飞雨交给你"墨玉含章"，说在墨大夫密室发现的。',
        branches: [
          { label: '质问墨大夫', action: 'confront', result: '直接去药庐' },
          { label: '搜索证据', action: 'search', cost: { days: 1 }, result: '修为+30，获得情报碎片' },
          { label: '召集旧部', action: 'gather', cost: { days: 1 }, result: '获得2名助手（战斗中协助）' }
        ]
      },
      {
        id: 3, name: '药庐对峙',
        trigger: '进入药庐',
        battle: { enemy: '墨大夫(入魔)', hp: 200, atk: 28, def: 10, skills: ['毒针', '金针', '魔化'] },
        win: { items: { '掌天瓶': '封印状态' }, cultivation: 50 },
        lose: '厉飞雨救援替换上场'
      },
      {
        id: 4, name: '掌天瓶异动',
        trigger: '离开药庐',
        text: '瓶身发热→掌天瓶激活（基础状态）。厉飞雨提议去天南城。'
      },
      {
        id: 5, name: '去向抉择',
        branches: [
          { label: '同去天南城', action: 'together', cost: { days: 3 }, result: '厉飞雨好感+5，同行事件（遇山贼战斗）' },
          { label: '独自历练', action: 'solo', result: '获得随机玄级功法，厉飞雨好感-5' }
        ]
      },
      {
        id: 6, name: '到达天南城（章节完成）',
        reward: { cultivation: 100, spiritStone: 50, 厉飞雨好感: 10, 掌天瓶: '激活' },
        unlock: ['天南城坊市', '告示板任务', '区域路线'],
        nextCondition: '修为达到练气·中期'
      }
    ]
  },
  chapter2: {
    title: '第二章：黄枫谷修行',
    subtitle: '练气中期~筑基',
    trigger: '修为达到练气·中期 + 在天南城',
    steps: [
      {
        id: 1, name: '拜师黄枫谷',
        text: '在天南城坊市听说黄枫谷正在招收新弟子。',
        battle: { enemy: '石甲龟(练气后)', type: '入门试炼' },
        win: { items: { '掩月基础功': '黄级' }, reward: '月俸50灵石/月，成为外门弟子' }
      },
      {
        id: 2, name: '掩月宗初识',
        trigger: '练气·后期，长老李化元召见',
        text: '被派往掩月宗送信→遇到南宫碗（首次登场）。',
        reward: { 南宫碗好感: 10, cultivation: 200 }
      },
      {
        id: 3, name: '血色禁地试炼',
        trigger: '筑基后',
        text: '血色禁地30年后开启，需提前准备。',
        taskChain: ['收集筑基丹材料', '炼制筑基丹', '突破筑基', '进入血色禁地'],
        npcs: ['首次遇到元瑶', '首次遇到紫灵'],
        reward: { 稀有灵药: 5, cultivation: 500, 大衍诀线索: true }
      },
      {
        id: 4, name: '大衍诀传承（可选）',
        trigger: '持有大衍诀线索，前往天南禁地',
        text: '大衍神君残魂试炼（神识对抗）。',
        win: { 大衍诀: '天级·辅修·神识' },
        lose: '修为-100，可重新挑战'
      }
    ],
    chapterReward: { cultivation: 800, 稀有灵药: 5, 大衍诀: '或线索' },
    unlock: ['血色禁地准入资格'],
    nextCondition: '修为达到金丹'
  },
  chapter3: {
    title: '第三章：乱星海寻宝',
    subtitle: '金丹~元婴',
    trigger: '修为达到金丹 + 在天南禁地发现传送阵',
    steps: [
      {
        id: 1, name: '传送阵',
        text: '在天南禁地深处发现古传送阵。',
        cost: { spiritStone: 5000 },
        result: '传送到乱星海·天星城'
      },
      {
        id: 2, name: '天星城',
        text: '到达天星城，遇到元瑶（常驻）。元瑶提供情报：小寰天秘境即将开启，虚天殿百年一遇。',
        unlock: ['天星城全部功能']
      },
      {
        id: 3, name: '小寰天秘境',
        trigger: '金丹·中期以上 + 小寰天开放',
        text: '进入小寰天（5层秘境）。',
        boss: { name: '万载灵药守护兽', realm: '元婴初', hp: 2500 },
        reward: { 万年灵药: true, cultivation: 1200 }
      },
      {
        id: 4, name: '虚天殿',
        trigger: '元婴后 + 虚天殿开放',
        text: '进入虚天殿（7层），通过冰火道。',
        boss: { name: '虚天鼎守护灵', realm: '元婴后', hp: 5000 },
        reward: { 虚天鼎: '古宝', 青元剑诀: '天级', cultivation: 3000 }
      }
    ],
    chapterReward: { cultivation: 5000, 虚天鼎: '古宝', 青元剑诀: '天级' },
    unlock: ['跨海航线', '大晋方向'],
    nextCondition: '修为达到元婴·中期'
  },
  chapter4: {
    title: '第四章：大晋风云',
    subtitle: '元婴~化神',
    trigger: '修为达到元婴·中期 + 到达大晋皇都',
    steps: [
      {
        id: 1, name: '初到大晋',
        text: '到达大晋皇都，感受到远超天南的繁华和强者气息。',
        unlock: ['大晋皇都全部功能']
      },
      {
        id: 2, name: '古战场遗迹',
        text: '在大晋古战场探索时遇到被封印的银月（天狐族公主）。解救银月→银月成为重要NPC。',
        reward: { 银月好感: 30, 银月信物: true, cultivation: 2000 }
      },
      {
        id: 3, name: '昆吾山封印',
        trigger: '化神后触发封印松动事件',
        boss: { name: '古魔分身', realm: '化神中', hp: 10000 },
        layers: 4,
        reward: { 梵圣真魔功残篇: true, cultivation: 5000 }
      },
      {
        id: 4, name: '万年灵木禁地',
        trigger: '化神·中期',
        boss: { name: '木灵守护者', realm: '化神中', hp: 12000 },
        reward: { 万古长青诀: true, cultivation: 5000 }
      }
    ],
    chapterReward: { cultivation: 12000, 梵圣真魔功残篇: true, 万古长青诀: true },
    nextCondition: '修为达到化神·圆满'
  },
  chapter5: {
    title: '第五章：飞升灵界',
    subtitle: '化神·圆满',
    trigger: '化神·圆满自动触发',
    steps: [
      {
        id: 1, name: '飞升准备',
        text: '系统提示："你感觉到天地间有一股排斥之力……化神之上，此界不容。"',
        tasks: [
          { id: 'a', name: '加固肉身', cost: { spiritStone: 10000 }, effect: '渡劫成功率+10%' },
          { id: 'b', name: '准备防御法宝', require: '古宝级以上', effect: '减伤30%' },
          { id: 'c', name: '炼制飞升丹', cost: { materials: ['麒麟角', '凤羽', '万年灵乳×10'] } }
        ]
      },
      {
        id: 2, name: '渡劫',
        text: '自动进入渡劫4阶段：天雷→心魔→灵气枯竭→甘霖',
        outcomes: {
          成功: '飞升灵界',
          失败: '修为-50%/寿元-50年/可重新准备',
          大失败: '陨落（触发陨落事件）'
        }
      },
      {
        id: 3, name: '飞升灵界',
        text: '穿过界域通道，到达灵界·飞升台。属性按比例转化，灵石按1000:1兑换为灵晶。',
        reward: { 灵界生存物资: true, 基础灵诀: true },
        unlock: ['灵界地图全部区域']
      }
    ],
    nextCondition: '到达人族边境城'
  },
  chapter6: {
    title: '第六章：灵界争锋',
    subtitle: '炼虚~渡劫',
    trigger: '到达灵界 + 人族边境城',
    steps: [
      {
        id: 1, name: '边境城',
        text: '到达人族边境城，了解灵界格局（人族九大势力·妖族七大族·异族七族）。'
      },
      {
        id: 2, name: '天渊城',
        text: '人族妖族前线要塞，参与边境防守战（大型战斗事件）。遇到敖啸（真龙族长老）。',
        reward: { type: '战功', text: '可兑换灵界物资' }
      },
      {
        id: 3, name: '万妖山脉',
        text: '深入妖族领地，可选择和平路线或战斗路线。',
        branches: [
          { label: '和平', result: '妖族好感+50，获得妖族交易权' },
          { label: '战斗', boss: { name: '万妖之王', realm: '大乘初', hp: 150000 }, reward: '妖丹' }
        ]
      },
      {
        id: 4, name: '广灵洞天',
        require: '令牌或机缘',
        text: '通过3项传承试炼（剑/体/法）。',
        reward: { 广灵道经: '灵级功法', cultivation: 200000 }
      },
      {
        id: 5, name: '万古魔域',
        boss: { name: '古魔真身', realm: '渡劫中', hp: 500000 },
        reward: { '混沌真解·灵界篇': true, cultivation: 250000 }
      },
      {
        id: 6, name: '准备飞升仙界',
        require: ['渡劫圣丹', '飞升丹(灵界版)'],
        text: '再次面对渡劫（4阶段·仙界级）。'
      }
    ],
    chapterReward: { 广灵道经: true, 混沌真解: true, cultivation: 500000 },
    nextCondition: '渡劫成功→飞升仙界'
  },
  chapter7: {
    title: '第七章：仙界问道',
    subtitle: '真仙~道祖',
    trigger: '飞升到达仙界·飞升池',
    steps: [
      {
        id: 1, name: '初入仙界',
        text: '接引仙官引导，了解仙界格局。',
        reward: { 基础仙诀: true, 仙灵石: 100 }
      },
      {
        id: 2, name: '天庭城',
        text: '前往天庭城，面见天帝（可选）。翻阅藏经阁禁书区→获得鸿蒙道典。',
        reward: { 鸿蒙道典: true }
      },
      {
        id: 3, name: '源初秘境',
        text: '探索源初秘境（9层），获得混沌造化诀。遇到掌天瓶器灵完全体→揭示掌天瓶真相。',
        boss: { name: '源初之灵', realm: '太乙后', hp: 20000000 },
        reward: { 混沌造化诀: true }
      },
      {
        id: 4, name: '混沌外域',
        text: '探索混沌外域，面对古神残念。',
        reward: { 混沌法则感悟: true, cultivation: 5000000 }
      },
      {
        id: 5, name: '轮回殿',
        text: '前往轮回殿，面对轮回殿主。',
        boss: { name: '轮回殿主', realm: '道祖初', hp: 100000000 },
        reward: { 大轮回术: '可学', cultivation: 10000000 }
      },
      {
        id: 6, name: '道祖之路（终步）',
        trigger: '修为达到道祖门槛',
        branches: [
          { label: '成就道祖', result: '终极结局，游戏通关' },
          { label: '继续探索', result: '不突破道祖，继续在仙界探索（解锁混沌外域更深处·灰域隐藏内容）' }
        ]
      }
    ],
    chapterReward: { 成就道祖: '终极成就', note: '通关画面' }
  }
};

// ============================================================
// 五、8条支线任务
// ============================================================

const SIDE_QUESTS = {
  '厉飞雨的委托': {
    id: 1,
    trigger: { npc: '厉飞雨', affection: 30, location: '七玄门旧址' },
    dialogue: '厉飞雨："墨大夫生前提到过一张上古丹方，应该还在药庐里。"',
    steps: [
      { name: '搜索药庐', count: 3, note: '第3次需神识≥30发现暗格' },
      { name: '获取丹方', text: '获得上古丹方残篇' }
    ],
    reward: { affection: 15, cultivation: 200, items: { '解毒丹': 3 }, unlock: '凝元丹药方' }
  },
  '元瑶的请求': {
    id: 2,
    trigger: { npc: '元瑶', affection: 40, location: '天星城' },
    dialogue: '元瑶："一批货物被海族劫了，帮我取回。"',
    steps: [
      { name: '前往海族海域', text: '到达指定海域' },
      { name: '战斗', enemy: '巡海夜叉×2' },
      { name: '搜索沉船', text: '取回货物' }
    ],
    reward: { affection: 15, spiritStone: 500, 妙音门折扣: '9折' }
  },
  '银月的报恩': {
    id: 3,
    trigger: { condition: '完成第四章解救银月后' },
    dialogue: '银月："恩公，护送我回天狐族领地。"',
    steps: [
      { name: '穿越慕兰草原', cost: { days: 7 } },
      { name: '狼群围猎事件', options: ['战斗', '驱散', '谈判'] },
      { name: '到达天狐族', text: '完成护送' }
    ],
    reward: { affection: 20, 天狐族通行权: true, spiritStone: 300, 银月狐簪线索: true }
  },
  '紫灵的复仇': {
    id: 4,
    trigger: { npc: '紫灵', affection: 50, realm: '元婴期', location: '天星城' },
    dialogue: '紫灵："极阴祖师我要让他付出代价。"',
    steps: [
      { name: '潜入极阴岛' },
      { name: '战斗', enemy: { name: '极阴祖师分身', realm: '元婴后', hp: 4000 } }
    ],
    reward: { affection: 25, 魔道中立通行: true, cultivation: 2000 }
  },
  '向之礼的考验': {
    id: 5,
    trigger: { realm: '元婴后期', location: '大晋黑市', npc: '向之礼' },
    dialogue: '向之礼："加入散修联盟得过三项考验。"',
    steps: [
      { name: '考验一', type: '战斗', enemy: { name: '上古傀儡', realm: '化神初', hp: 6000 } },
      { name: '考验二', type: '神识', require: { 神识: 800 } },
      { name: '考验三', type: '幻境心性' }
    ],
    reward: { 散修联盟声望: 50, 随机天级功法: true, spiritStone: 1000 }
  },
  '敖啸的认可': {
    id: 6,
    trigger: { realm: '合体期', location: '万妖山脉', npc: '敖啸' },
    dialogue: '敖啸："想得龙族认可，先过挑战。"',
    steps: [
      { name: '战真龙族守卫', enemy: { name: '真龙族守卫·精英', realm: '合体后', hp: 60000 }, restrict: '不可用灵兽' }
    ],
    reward: { 敖啸好感: 20, 龙族炼体秘法: true, 灵晶: 200, 龙族通行权: true }
  },
  '广灵遗愿': {
    id: 7,
    trigger: { condition: '获得广灵道经后' },
    dialogue: '广灵道尊残魂："寻回三件遗物。"',
    steps: [
      { name: '遗物1', location: '虚天殿隐藏层', require: { 神识: 1500 } },
      { name: '遗物2', location: '广灵洞天外围' },
      { name: '遗物3', location: '源初秘境边缘' }
    ],
    reward: { 广灵洞天深层开启: true, cultivation: 100000 }
  },
  '轮回之谜': {
    id: 8,
    trigger: { realm: '大罗期', location: '轮回殿前' },
    dialogue: '轮回殿主："进入轮回幻境，面对七世心魔。"',
    steps: [
      { name: '七世考验', type: '混合', desc: '战斗/选择/神识/心性', count: 7 },
      { name: '第7世', enemy: '道祖级幻象' }
    ],
    reward: { 轮回法则碎片: true, 悟性: 5, 大轮回术线索: true }
  }
};

// ============================================================
// 六、NPC对话（6位，每好感阶段3句）
// ============================================================

const NPC_DIALOGUES = {
  '厉飞雨': {
    location: '青云山·七玄门旧址',
    initialAffection: 20,
    stages: [
      {
        range: [0, 39], label: '陌生人',
        lines: [
          '你来了。七玄门已经不在了……但我们还活着。',
          '这里的风还是和以前一样。',
          '修炼别太拼，也要注意休息。'
        ]
      },
      {
        range: [40, 59], label: '认识',
        lines: [
          '听说你最近修炼遇到了瓶颈？要不要聊聊？',
          '天南城最近来了个有趣的散修，你知道吗？',
          '我今天又去了一趟药庐……还是能闻到那股味道。'
        ]
      },
      {
        range: [60, 79], label: '友善',
        lines: [
          '你我之间不必客气，有事直说。',
          '我这条命算是你救的，有什么需要帮忙的就说。',
          '最近总觉得修为到了瓶颈……你也有这种感觉吗？'
        ]
      },
      {
        range: [80, 99], label: '信任',
        lines: [
          '能遇到你这样的朋友，是我的运气。',
          '这世道，能信任的人不多——你算一个。',
          '若有一天你需要我豁出性命……我不会犹豫。'
        ]
      },
      {
        range: [100, 100], label: '亲密/至交',
        lines: [
          '无论你走到哪，记得七玄门永远有你的位置。',
          '保重。活着回来。',
          '你送的这东西……我会好好珍藏的。'
        ]
      }
    ]
  },
  '南宫碗': {
    location: '掩月宗·修炼室(白天)/掩月宗·花园(傍晚)',
    initialAffection: 10,
    stages: [
      {
        range: [0, 29], label: '陌生人',
        lines: [
          '掩月宗不接待外客……你怎么进来的？',
          '你是……黄枫谷的弟子？有事吗？',
          '我还有事，长话短说。'
        ]
      },
      {
        range: [30, 49], label: '认识',
        lines: [
          '原来是道友，之前在血色禁地见过。',
          '没想到你还活着……我是说，没想到还能再见。',
          '掩月宗的规矩多，但偶尔出来透透气也不错。'
        ]
      },
      {
        range: [50, 69], label: '友善',
        lines: [
          '你这个人……倒是和那些阿谀奉承的家伙不一样。',
          '有空可以来掩月宗坐坐——当然，得先通报。',
          '修炼上有什么不懂的，可以问我。'
        ]
      },
      {
        range: [70, 89], label: '信任',
        lines: [
          '你……值得信任。',
          '有些话我只对你说……最近掩月宗内部不太平。',
          '若有空，陪我去天南城逛逛？很久没出去了。'
        ]
      },
      {
        range: [90, 100], label: '亲密/至交',
        lines: [
          '你是我为数不多愿意交心的人。',
          '不管发生什么……我都会站在你这边。',
          '这件东西你收着，就当……是我的心意。'
        ]
      }
    ]
  },
  '元瑶': {
    location: '天星城·妙音门',
    initialAffection: 15,
    stages: [
      {
        range: [0, 34], label: '陌生人',
        lines: [
          '欢迎光临妙音门——需要什么？丹药还是情报？',
          '道友面生，第一次来天星城？',
          '今天的灵草新鲜到货，要不要看看？'
        ]
      },
      {
        range: [35, 54], label: '认识',
        lines: [
          '原来是老顾客了，给你打个折。',
          '最近海族那边不太平，做生意都难了。',
          '有批好货刚到，要不要先看看？'
        ]
      },
      {
        range: [55, 74], label: '友善',
        lines: [
          '道友帮了我不少忙，以后就是自己人了。',
          '商路最近不太安全……你有空的话帮我盯着点。',
          '消息方面有什么需要的？黑白两道的都有。'
        ]
      },
      {
        range: [75, 94], label: '信任',
        lines: [
          '你算是我在乱星海为数不多的朋友。',
          '有笔大生意……你有兴趣吗？',
          '小心星宫的人，他们最近在查什么。'
        ]
      },
      {
        range: [95, 100], label: '亲密/至交',
        lines: [
          '若有一天我不在了，妙音门就托付给你了。',
          '这枚令牌你收着，可以在任何妙音门分号调用资源。',
          '谢谢你……一直以来。'
        ]
      }
    ]
  },
  '紫灵': {
    location: '极阴岛(早期)/天星城(后期)',
    initialAffection: 5,
    stages: [
      {
        range: [0, 24], label: '陌生人',
        lines: [
          '鬼灵门的人？你认错人了。',
          '让开。我不想惹麻烦。',
          '你看上去不像魔道修士……离我远点。'
        ]
      },
      {
        range: [25, 44], label: '认识',
        lines: [
          '你倒是胆子不小，敢靠近我。',
          '我不需要朋友。也不需要同情。',
          '极阴岛不是你能来的地方，走吧。'
        ]
      },
      {
        range: [45, 64], label: '友善',
        lines: [
          '你……和其他人不太一样。',
          '小心极阴祖师。他盯上你了。',
          '我会记住你这份人情的。'
        ]
      },
      {
        range: [65, 84], label: '信任',
        lines: [
          '若你要对付极阴祖师……算我一份。',
          '有时候我真羡慕你，可以自由自在地活着。',
          '别死。等我做完该做的事，再好好谢谢你。'
        ]
      },
      {
        range: [85, 100], label: '亲密/至交',
        lines: [
          '你是我唯一信任的人……别辜负了这份信任。',
          '这枚玉佩跟了我很多年，送你。',
          '做完该做的事之后……我想和你一起离开这里。'
        ]
      }
    ]
  },
  '银月': {
    location: '大晋古战场(初遇)/天狐族领地(后续)',
    initialAffection: 30,
    stages: [
      {
        range: [0, 49], label: '陌生人',
        lines: [
          '恩公！你还记得我吗？',
          '天狐族永远欢迎你的到来。',
          '这瓶灵酒是族中特产，你尝尝。'
        ]
      },
      {
        range: [50, 69], label: '认识',
        lines: [
          '恩公，你的伤好了吗？让我看看。',
          '族中的长老想见你……只是聊聊天。',
          '外面的世界是什么样的？跟我说说。'
        ]
      },
      {
        range: [70, 89], label: '友善',
        lines: [
          '你救了我，也救了天狐族——这份恩情我不会忘。',
          '你若需要天狐族的帮助，随时开口。',
          '这根狐簪你收着……就当是我的一点心意。'
        ]
      },
      {
        range: [90, 109], label: '信任',
        lines: [
          '你知道吗……有时候我会想，能不能一直这样。',
          '天狐族的事情处理完了，我可以去找你吗？',
          '你身上的气息……让我觉得很安心。'
        ]
      },
      {
        range: [110, 110], label: '亲密/至交',
        lines: [
          '无论你走到哪里，我都会记住你的。',
          '若有来世……我还想遇见你。',
          '这个拥抱……是告别，也是约定。'
        ]
      }
    ]
  },
  '向之礼': {
    location: '大晋皇都·地下黑市',
    initialAffection: 0,
    stages: [
      {
        range: [0, 19], label: '陌生人',
        lines: [
          '嘿，小子，看你面生——新来的？',
          '这黑市不是随便什么人都能进的。',
          '老夫向之礼，散修联盟的——听过没有？'
        ]
      },
      {
        range: [20, 39], label: '认识',
        lines: [
          '不错不错，能走到这里说明有点本事。',
          '想不想加入散修联盟？比那些宗门自由多了。',
          '这大晋的水很深……你小心点。'
        ]
      },
      {
        range: [40, 59], label: '友善',
        lines: [
          '以后在散修联盟，有事报我名字。',
          '你小子成长挺快……老夫没看错人。',
          '最近有一批好东西……要搞吗？'
        ]
      },
      {
        range: [60, 79], label: '信任',
        lines: [
          '以后散修联盟就靠你们这些年轻人了。',
          '别看我现在这样子，当年我也是叱咤风云的人物。',
          '有些事，等你到了我这个境界自然就懂了。'
        ]
      },
      {
        range: [80, 100], label: '亲密/至交',
        lines: [
          '老夫活了这么多年，没见过几个像你这样的人物。',
          '这玉简里是我毕生的修炼心得……送你了。',
          '别死了。活着，才能看到更远的地方。'
        ]
      }
    ]
  }
};


// ============================================================
//  Events 类
// ============================================================

class Events {
  constructor() {
    /** 全部事件池（6类） */
    this.pools = {
      wild: WILD_EVENTS,
      secret: SECRET_EVENTS,
      town: TOWN_EVENTS,
      faction: FACTION_EVENTS,
      danger: DANGER_EVENTS,
      tribulation: TRIBULATION_EVENTS
    };

    /** 事件链 */
    this.chains = EVENT_CHAINS;

    /** 动态条件 */
    this.conditions = DYNAMIC_CONDITIONS;

    /** 主线9章 */
    this.mainQuest = MAIN_QUEST;

    /** 8条支线 */
    this.sideQuests = SIDE_QUESTS;

    /** 6位NPC对话 */
    this.npcDialogues = NPC_DIALOGUES;

    /** 事件池权重索引（与 DATA.EXPLORATION 对齐） */
    this.poolWeights = {
      wild: this._extractWeights(WILD_EVENTS),
      secret: this._extractWeights(SECRET_EVENTS),
      town: this._extractWeights(TOWN_EVENTS),
      faction: this._extractWeights(FACTION_EVENTS),
      danger: this._extractWeights(DANGER_EVENTS),
      tribulation: null // 飞升事件按顺序链执行
    };
  }

  /** 从事件池提取权重表 */
  _extractWeights(pool) {
    const weights = {};
    for (const [key, ev] of Object.entries(pool)) {
      weights[key] = ev.weight;
    }
    return weights;
  }

  // ──────────────────────────────
  //  事件池
  // ──────────────────────────────

  /**
   * 获取事件的随机文本变体（3选1）
   * @param {string} poolKey - 'wild'|'secret'|'town'|'faction'|'danger'|'tribulation'
   * @param {string} eventName - 事件名称
   * @returns {string|null}
   */
  getRandomText(poolKey, eventName) {
    const pool = this.pools[poolKey];
    if (!pool || !pool[eventName] || !pool[eventName].texts) return null;
    const texts = pool[eventName].texts;
    return texts[Math.floor(Math.random() * texts.length)];
  }

  /**
   * 获取事件全部选项
   * @param {string} poolKey
   * @param {string} eventName
   * @returns {Array}
   */
  getOptions(poolKey, eventName) {
    const pool = this.pools[poolKey];
    if (!pool || !pool[eventName]) return [];
    return pool[eventName].options || [];
  }

  /**
   * 获取指定文本变体
   * @param {string} poolKey
   * @param {string} eventName
   * @param {number} variantIndex - 0/1/2
   * @returns {string|null}
   */
  getTextVariant(poolKey, eventName, variantIndex = 0) {
    const pool = this.pools[poolKey];
    if (!pool || !pool[eventName]) return null;
    const texts = pool[eventName].texts;
    if (!texts) return pool[eventName].texts?.[0] || null;
    return texts[variantIndex % texts.length] || texts[0];
  }

  /**
   * 获取事件完整数据（含所有文本变体+选项+结果）
   * @param {string} poolKey
   * @param {string} eventName
   * @returns {Object|null}
   */
  getEventData(poolKey, eventName) {
    const pool = this.pools[poolKey];
    if (!pool) return null;
    return pool[eventName] || null;
  }

  /**
   * 列出某类事件池全部事件名
   * @param {string} poolKey
   * @returns {string[]}
   */
  listEvents(poolKey) {
    const pool = this.pools[poolKey];
    if (!pool) return [];
    return Object.keys(pool);
  }

  /**
   * 按权重随机抽取一个事件
   * @param {string} poolKey
   * @returns {string|null} 事件名
   */
  rollEvent(poolKey) {
    const weights = this.poolWeights[poolKey];
    if (!weights) return null;
    const entries = Object.entries(weights);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    for (const [name, w] of entries) {
      roll -= w;
      if (roll <= 0) return name;
    }
    return entries[entries.length - 1][0];
  }

  // ──────────────────────────────
  //  事件链
  // ──────────────────────────────

  /**
   * 获取事件链定义
   * @param {string} chainKey
   * @returns {Object|null}
   */
  getChain(chainKey) {
    return this.chains[chainKey] || null;
  }

  /**
   * 获取事件链当前步骤
   * @param {string} chainKey
   * @param {number} stepIndex - 当前步数（0-based）
   * @returns {Object|null}
   */
  getChainStep(chainKey, stepIndex) {
    const chain = this.chains[chainKey];
    if (!chain) return null;
    return chain.steps[stepIndex] || null;
  }

  /**
   * 列出所有事件链key
   * @returns {string[]}
   */
  listChains() {
    return Object.keys(this.chains);
  }

  // ──────────────────────────────
  //  动态条件
  // ──────────────────────────────

  /**
   * 检查动态条件（名望/境界/神识/炼体/灵根影响）
   * @param {string} conditionType - '名望'|'境界'|'神识'|'炼体'|'灵根'
   * @param {Object} playerState - { fame, realm, spirit, body, elements }
   * @param {string} eventName - 事件名
   * @returns {Array} 匹配的条件效果列表
   */
  checkConditions(conditionType, playerState, eventName) {
    const rules = this.conditions[conditionType];
    if (!rules) return [];
    return rules.filter(r => r.event === eventName).map(r => ({
      effect: r.effect,
      met: this._evalCondition(r, playerState)
    }));
  }

  /** 评估单条条件 */
  _evalCondition(rule, state) {
    const val = state[rule.field];
    if (val === undefined) return false;
    switch (rule.operator) {
      case 'gt': return val > rule.value;
      case 'gte': return val >= rule.value;
      case 'lt': return val < rule.value;
      case 'lte': return val <= rule.value;
      case 'eq': return val === rule.value;
      case 'aboveRegion': return state.realm >= state.regionRecommend;
      default: return false;
    }
  }

  // ──────────────────────────────
  //  主线
  // ──────────────────────────────

  /**
   * 获取主线章节
   * @param {number} chapter - 1~7/9（第8/9章合并为chapter7终步）
   * @returns {Object|null}
   */
  getMainChapter(chapter) {
    const key = `chapter${chapter}`;
    return this.mainQuest[key] || null;
  }

  /**
   * 获取章节某一步
   * @param {number} chapter
   * @param {number} stepIndex - 0-based
   * @returns {Object|null}
   */
  getMainStep(chapter, stepIndex) {
    const ch = this.getMainChapter(chapter);
    if (!ch) return null;
    return ch.steps[stepIndex] || null;
  }

  /**
   * 列出全部主线章节
   * @returns {Array}
   */
  listMainChapters() {
    return Object.values(this.mainQuest).map(ch => ({
      title: ch.title,
      subtitle: ch.subtitle,
      trigger: ch.trigger,
      steps: ch.steps.length
    }));
  }

  // ──────────────────────────────
  //  支线
  // ──────────────────────────────

  /**
   * 获取支线任务
   * @param {number|string} id - 支线编号(1-8)或名称
   * @returns {Object|null}
   */
  getSideQuest(id) {
    if (typeof id === 'number') {
      const quest = Object.values(this.sideQuests).find(q => q.id === id);
      return quest || null;
    }
    return this.sideQuests[id] || null;
  }

  /**
   * 列出全部支线
   * @returns {Array}
   */
  listSideQuests() {
    return Object.values(this.sideQuests).map(q => ({
      id: q.id,
      name: Object.keys(this.sideQuests).find(k => this.sideQuests[k].id === q.id),
      trigger: q.trigger,
      reward: q.reward
    }));
  }

  // ──────────────────────────────
  //  NPC对话
  // ──────────────────────────────

  /**
   * 获取NPC对话（根据好感度返回随机1句）
   * @param {string} npcName - 厉飞雨/南宫碗/元瑶/紫灵/银月/向之礼
   * @param {number} affection - 好感度
   * @returns {string|null}
   */
  getNPCDialogue(npcName, affection) {
    const npc = this.npcDialogues[npcName];
    if (!npc) return null;
    const stage = npc.stages.find(s => affection >= s.range[0] && affection <= s.range[1]);
    if (!stage) return null;
    const lines = stage.lines;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  /**
   * 获取NPC某个好感阶段的全部对话
   * @param {string} npcName
   * @param {number} affection
   * @returns {Object|null} { label, lines }
   */
  getNPCDialogueStage(npcName, affection) {
    const npc = this.npcDialogues[npcName];
    if (!npc) return null;
    return npc.stages.find(s => affection >= s.range[0] && affection <= s.range[1]) || null;
  }

  /**
   * 获取NPC元数据
   * @param {string} npcName
   * @returns {Object|null} { location, initialAffection, stages }
   */
  getNPCMeta(npcName) {
    const npc = this.npcDialogues[npcName];
    if (!npc) return null;
    return {
      location: npc.location,
      initialAffection: npc.initialAffection,
      stageCount: npc.stages.length
    };
  }

  /**
   * 列出全部NPC名称
   * @returns {string[]}
   */
  listNPCs() {
    return Object.keys(this.npcDialogues);
  }

  // ──────────────────────────────
  //  飞升渡劫
  // ──────────────────────────────

  /**
   * 获取飞升渡劫事件链顺序
   * @returns {string[]} ['天雷降临', '心魔骤起', '灵气枯竭', '天降甘霖']
   */
  getTribulationChain() {
    return ['天雷降临', '心魔骤起', '灵气枯竭', '天降甘霖'];
  }

  /**
   * 获取飞升渡劫某阶段事件数据
   * @param {string} phase
   * @returns {Object|null}
   */
  getTribulationPhase(phase) {
    return this.pools.tribulation[phase] || null;
  }

  // ──────────────────────────────
  //  概览
  // ──────────────────────────────

  /** 获取系统概览统计 */
  getOverview() {
    return {
      pools: {
        wild: Object.keys(WILD_EVENTS).length,
        secret: Object.keys(SECRET_EVENTS).length,
        town: Object.keys(TOWN_EVENTS).length,
        faction: Object.keys(FACTION_EVENTS).length,
        danger: Object.keys(DANGER_EVENTS).length,
        tribulation: Object.keys(TRIBULATION_EVENTS).length
      },
      chains: Object.keys(EVENT_CHAINS).length,
      conditions: Object.keys(DYNAMIC_CONDITIONS).length,
      mainChapters: Object.keys(MAIN_QUEST).length,
      sideQuests: Object.keys(SIDE_QUESTS).length,
      npcs: {
        count: Object.keys(NPC_DIALOGUES).length,
        names: Object.keys(NPC_DIALOGUES)
      }
    };
  }
}

// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Events = Events;
}

export { Events };
export {
  WILD_EVENTS, SECRET_EVENTS, TOWN_EVENTS, FACTION_EVENTS,
  DANGER_EVENTS, TRIBULATION_EVENTS, EVENT_CHAINS,
  DYNAMIC_CONDITIONS, MAIN_QUEST, SIDE_QUESTS, NPC_DIALOGUES
};
