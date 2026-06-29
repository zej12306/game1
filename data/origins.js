// ==========================================
//  data/origins.js — 身世数据 + 叙事事件
// ==========================================

const ORIGINS = [
  // ===== 普通 (35%) =====
  {
    id: 'wanderer',
    name: '散修后人',
    rarity: 'common',
    weight: 35,
    desc: '父母皆为散修，幼年随父母游历四方，耳濡目染了些许修炼之法。父母仙逝后，独自踏上修仙之路。',
    bonus: { spiritStones: 10, items: {} },
    // 命定事件（带分支）
    destined: {
      day: 50,
      text: '一位风尘仆仆的散修拦住了你的去路："少年郎，我看你根基不稳，可是散修之后？"',
      choices: [
        { text: '虚心求教，请前辈指点', effect: () => {
          GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 50);
          addLog('散修前辈传授修炼心得，修为+50', 'loot');
          renderAll();
        }},
        { text: '警惕拒绝，担心是骗子', effect: () => {
          // no immediate effect, but no penalty either
          addLog('你婉拒了散修，他摇摇头转身离去', '');
          renderAll();
        }},
      ],
    },
  },
  {
    id: 'farmer',
    name: '农户子弟',
    rarity: 'common',
    weight: 35,
    desc: '生于偏远山村农户之家，本应耕田度日。一日山中砍柴，意外捡到一本残破修炼手札，从此窥见修仙门径。',
    bonus: { spiritStones: 20, items: {} },
    destined: {
      day: 60,
      text: '你在田间劳作时，锄头触到硬物——是一枚通体碧绿的果实，散发着微弱的灵气。',
      choices: [
        { text: '立即服下灵果', effect: () => {
          GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 80);
          GameState.spiritStones += 30;
          addLog('服下灵果，浑身暖流涌动，修为+80，灵石+30', 'success');
          renderAll();
        }},
        { text: '收起来，日后炼丹用', effect: () => {
          GameState.breakItems['灵果'] = (GameState.breakItems['灵果'] || 0) + 1;
          addLog('你将灵果小心收起，留待日后使用', 'loot');
          renderAll();
        }},
      ],
    },
  },
  {
    id: 'merchant',
    name: '商贾之子',
    rarity: 'common',
    weight: 35,
    desc: '江南富商之子，自幼锦衣玉食。十五岁时家中遭劫，父亲临终前交给你一枚玉简，说"修仙界才是你的归宿"。',
    bonus: { spiritStones: 50, items: {} },
    destined: {
      day: 80,
      text: '市集中一位身穿斗篷的神秘货商朝你招手："小友，我这里有些有趣的东西，要不要看看？"',
      choices: [
        { text: '买一颗续命丹（30灵石）', effect: () => {
          if (GameState.spiritStones >= 30) {
            GameState.spiritStones -= 30;
            GameState.breakItems['续命丹'] = (GameState.breakItems['续命丹'] || 0) + 1;
            addLog('购得续命丹一颗', 'loot');
          } else {
            addLog('灵石不够，商人遗憾地收起了丹药', '');
          }
          renderAll();
        }},
        { text: '询问是否有修炼典籍', effect: () => {
          GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 30);
          addLog('商人拿出一本旧书，你翻阅后若有所悟，修为+30', '');
          renderAll();
        }},
      ],
    },
  },
  {
    id: 'hunter',
    name: '猎户之后',
    rarity: 'common',
    weight: 35,
    desc: '自小随父亲在山林中狩猎，练就敏锐的直觉和强健体魄。一次追踪猎物时误入仙人洞府，从此踏入修仙之路。',
    bonus: { spiritStones: 15, items: { '兽骨': 1 } },
    destined: {
      day: 40,
      text: '追踪一只银毛妖狐深入老林，却发现一处隐蔽的洞口，壁上刻着古老的符文。',
      choices: [
        { text: '勇敢进入洞府探索', effect: () => {
          const loot = Math.random();
          if (loot < 0.3) {
            GameState.spiritStones += 50;
            GameState.breakItems['筑基丹'] = (GameState.breakItems['筑基丹'] || 0) + 1;
            addLog('洞府中发现前人遗物：灵石x50，筑基丹x1！', 'crit');
          } else if (loot < 0.7) {
            GameState.spiritStones += 20;
            addLog('洞府中发现些许灵石，修为+20', 'loot');
          } else {
            addLog('洞府中无人，但壁上符文让你若有所悟', '');
          }
          renderAll();
        }},
        { text: '谨慎退去，标记位置日后再来', effect: () => {
          // marks the location on map (future phase)
          addLog('你记住了这处洞府的位置', '');
          renderAll();
        }},
      ],
    },
  },

  // ===== 优秀 (30%) =====
  {
    id: 'fallen_clan',
    name: '没落修仙家族',
    rarity: 'uncommon',
    weight: 30,
    desc: '祖上曾是金丹修士，家族却没落至今。你是族中唯一有灵根的子弟，族长将最后的筑基丹交给了你。',
    bonus: { spiritStones: 30, items: { '筑基丹': 1 } },
    destined: {
      day: 120,
      text: '一封泛黄的家书从族中寄来："我族典籍阁地下的密室...或许有你想要的答案。"',
      choices: [
        { text: '立即回族中密室', effect: () => {
          GameState.breakItems['降尘丹'] = (GameState.breakItems['降尘丹'] || 0) + 1;
          GameState.spiritStones += 100;
          GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 100);
          addLog('密室中藏有先祖遗物：降尘丹x1，灵石x100，修为+100', 'crit');
          renderAll();
        }},
        { text: '先将手头之事了结再去', effect: () => {
          addLog('你将信收好，决定日后再回', '');
          // later event will trigger again at day 300
          const ev = ORIGINS.find(o => o.id === 'fallen_clan').destined;
          ev.day = 300;
          renderAll();
        }},
      ],
    },
  },
  {
    id: 'taoist_dropout',
    name: '道观弃徒',
    rarity: 'uncommon',
    weight: 30,
    desc: '曾在小道观中修行三年，因不愿守清规被逐出。但三年观中生活给你打下了扎实基础。',
    bonus: { spiritStones: 20, items: { '功法残卷': 1 } },
    destined: {
      day: 70,
      text: '你在路边歇脚时，一个熟悉的声音从背后传来："师兄...真的是你？"',
      choices: [
        { text: '欣然相认，叙旧', effect: () => {
          GameState.breakItems['筑基丹'] = (GameState.breakItems['筑基丹'] || 0) + 1;
          GameState.spiritStones += 30;
          addLog('旧日师弟偷偷塞给你筑基丹和灵石："师兄保重"', 'loot');
          renderAll();
        }},
        { text: '冷淡回应，过往已逝', effect: () => {
          GameState.wis += 2;
          addLog('你平静地与师弟告别。道心更加坚固，神识+2', '');
          renderAll();
        }},
      ],
    },
  },
  {
    id: 'herbalist',
    name: '药农传人',
    rarity: 'uncommon',
    weight: 30,
    desc: '祖辈三代皆为药农，你从小便能辨识各种灵草仙药。祖父临终前说："修仙者，草木为始。"',
    bonus: { spiritStones: 25, items: { '凝元草': 3 } },
    destined: {
      day: 55,
      text: '山道上，一株泛着紫光的草药引起了你的注意——竟是百年难遇的紫纹灵芝！',
      choices: [
        { text: '小心翼翼地采摘', effect: () => {
          GameState.breakItems['紫纹灵芝'] = (GameState.breakItems['紫纹灵芝'] || 0) + 1;
          GameState.spiritStones += 40;
          addLog('成功采摘紫纹灵芝！灵石+40', 'crit');
          renderAll();
        }},
        { text: '守护灵芝，等它成熟', effect: () => {
          // delayed reward
          setTimeout(() => {
            GameState.breakItems['紫纹灵芝'] = (GameState.breakItems['紫纹灵芝'] || 0) + 1;
            GameState.spiritStones += 60;
            addLog('灵芝成熟，药力更盛！灵石+60', 'success');
            renderAll();
          }, 100);
          addLog('你决定守护灵芝，等它继续生长', '');
          renderAll();
        }},
      ],
    },
  },

  // ===== 稀有 (20%) =====
  {
    id: 'outer_disciple',
    name: '宗门外门弟子',
    rarity: 'rare',
    weight: 20,
    desc: '年幼时被青云宗选中，资质平庸被分入外门。十年苦修，终于被允许下山历练。',
    bonus: { spiritStones: 100, items: { '灵石袋': 1 } },
    destined: {
      day: 150,
      text: '一位昔日师兄传音而来："秘境即将开启，师弟可愿同行？危险重重，但机缘难得。"',
      choices: [
        { text: '答应同行，富贵险中求', effect: () => {
          if (Math.random() < 0.6) {
            GameState.spiritStones += 200;
            GameState.breakItems['降尘丹'] = (GameState.breakItems['降尘丹'] || 0) + 1;
            addLog('秘境有惊无险，收获颇丰：降尘丹x1，灵石+200', 'success');
          } else {
            GameState.cultivation = Math.floor(GameState.cultivation * 0.7);
            addLog('秘境中遭遇妖兽，身受重伤，修为 -30%', 'danger');
          }
          renderAll();
        }},
        { text: '婉拒，稳扎稳打', effect: () => {
          GameState.def += 3;
          addLog('你选择以稳为上。独修中炼出一身防御法门，防御+3', '');
          renderAll();
        }},
      ],
    },
  },

  // ===== 史诗 (10%) =====
  {
    id: 'spirit_root',
    name: '天灵根觉醒者',
    rarity: 'epic',
    weight: 10,
    desc: '出生时天降异象，天生五行灵根。但你幼年体弱多病，直到十岁才被路过的高人指点觉醒。',
    bonus: { spiritStones: 50, items: {} },
    destined: {
      day: 100,
      text: '一位白发苍苍的老者出现在你面前："老夫寻了你十年。你可愿做我的弟子？"',
      choices: [
        { text: '拜师学艺', effect: () => {
          // +2 to two random attributes
          const attrs = ['atk','def','spd','wis','vit','spi'];
          const pick = attrs.sort(() => Math.random() - 0.5).slice(0, 2);
          pick.forEach(a => GameState[a] += 2);
          GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 150);
          addLog(`拜师成功！${pick.join('、')}+2，修为+150`, 'crit');
          renderAll();
        }},
        { text: '婉拒：自己的路自己走', effect: () => {
          GameState.wis += 4;
          GameState.spi += 4;
          addLog('你选择独行。这份傲骨让你神识+4，灵力+4', 'success');
          renderAll();
        }},
      ],
    },
  },

  // ===== 传说 (5%) =====
  {
    id: 'reincarnation',
    name: '大能转世',
    rarity: 'legendary',
    weight: 5,
    desc: '你时常梦见不属于今生的记忆——仙台论道，万仙大战，和那最后的一剑。你不知道自己是谁，但你知道自己不属于这里。',
    bonus: { spiritStones: 200, items: { '残缺古戒': 1 } },
    destined: {
      day: 200,
      text: '深夜，一个黑袍人无声出现在你面前。他摘下兜帽，露出一张和你梦中一模一样的脸："你果然还活着...或者说，您果然转世了。"',
      choices: [
        { text: '追问前世之事', effect: () => {
          GameState.breakItems['螟母汁液'] = (GameState.breakItems['螟母汁液'] || 0) + 1;
          GameState.spiritStones += 500;
          GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 300);
          addLog('黑袍人留下前世的储物戒：螟母汁液x1，灵石+500，修为+300', 'crit');
          addLog('他临走前说："那些人...迟早会找到你。"', 'danger');
          renderAll();
        }},
        { text: '否认：你认错人了', effect: () => {
          GameState.spi += 5;
          GameState.wis += 3;
          addLog('黑袍人凝视你良久："装不认识也行。但命运不会装不认识你。"', '');
          addLog('你封印了这段记忆，但灵力+5，神识+3', 'success');
          renderAll();
        }},
      ],
    },
  },
];

// ===== 共享随机事件池 =====
// 所有身世共用的随机叙事事件
const RANDOM_EVENTS = [
  // 正面事件
  { dayMin: 30, text: '山间偶遇一位采药老人，他分给你一些灵草。', effect: () => {
    GameState.spiritStones += 15;
    addLog('采药老人分你灵草，灵石+15', 'loot');
  }},
  { dayMin: 40, text: '在溪边发现一颗光滑的灵石，品质不凡。', effect: () => {
    GameState.spiritStones += 25;
    addLog('意外发现灵石+25', 'loot');
  }},
  { dayMin: 50, text: '路过的修士正在论道，你驻足旁听，若有所悟。', effect: () => {
    GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 20);
    addLog('听道感悟，修为+20', '');
  }},
  { dayMin: 60, text: '一只受伤的灵鹤落在你面前，你帮它包扎。它临走前从羽翼下抖落一颗丹药。', effect: () => {
    GameState.breakItems['筑基丹'] = (GameState.breakItems['筑基丹'] || 0) + 1;
    addLog('灵鹤报恩，获得筑基丹x1', 'loot');
  }},
  { dayMin: 80, text: '集市上有人低价甩卖残旧法器，你花了点灵石碰碰运气。', effect: () => {
    if (Math.random() < 0.5) {
      const cost = 20;
      if (GameState.spiritStones >= cost) {
        GameState.spiritStones -= cost;
        GameState.atk += 2;
        addLog('淘到一件能用的法器，攻击+2（花费20灵石）', 'loot');
      }
    } else {
      addLog('全是废铜烂铁，悻悻而归', '');
    }
  }},
  { dayMin: 100, text: '一位游方道士在路边算命："小友近日有一劫，老夫替你化解。"', effect: () => {
    GameState.spiritStones += 10;
    addLog('道士给你一道平安符，灵石+10', '');
  }},
  { dayMin: 120, text: '山中瀑布下修炼时，水面映出奇异光芒——潭底竟然有灵脉分支。', effect: () => {
    GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 40);
    addLog('灵脉修炼，修为+40', 'success');
  }},
  { dayMin: 150, text: '旧货摊上发现一本残缺功法，虽然不全但有些启发。', effect: () => {
    GameState.wis += 1;
    addLog('残卷启发，神识+1', '');
  }},
  { dayMin: 200, text: '偶遇的散修和你说起一个秘境传闻，值得一探。', effect: () => {
    // will be useful when map system is built
    addLog('获知秘境线索（地图系统开放后可用）', 'loot');
  }},
  { dayMin: 250, text: '路遇两人斗法，你远远观望，竟悟到一些攻击法门。', effect: () => {
    GameState.atk += 2;
    addLog('观战悟道，攻击+2', '');
  }},
  { dayMin: 300, text: '一位炼丹师急需某种药材，恰好你手头有。', effect: () => {
    GameState.spiritStones += 50;
    addLog('与炼丹师交易，灵石+50', 'loot');
  }},

  // 负面事件
  { dayMin: 40, text: '路上遭遇暴雨山洪，行李被冲走了一些。', effect: () => {
    const loss = Math.min(GameState.spiritStones, Math.floor(GameState.spiritStones * 0.1));
    GameState.spiritStones -= loss;
    addLog(`山洪冲走灵石 -${loss}`, 'danger');
  }},
  { dayMin: 70, text: '误入一片瘴气林，呛得头晕眼花。', effect: () => {
    GameState.cultivation = Math.floor(GameState.cultivation * 0.95);
    addLog('瘴气伤身，修为略有损失', 'danger');
  }},
  { dayMin: 90, text: '遭遇拦路劫修，不得不破财消灾。', effect: () => {
    const loss = Math.min(GameState.spiritStones, 30);
    GameState.spiritStones -= loss;
    addLog(`被劫走灵石 -${loss}`, 'danger');
  }},
  { dayMin: 130, text: '修炼时灵脉不稳，差点走岔了气。', effect: () => {
    GameState.cultivation = Math.floor(GameState.cultivation * 0.9);
    addLog('岔气内伤，修为 -10%', 'danger');
  }},
  { dayMin: 180, text: '有人在城中冒充你的名义行骗，不得不澄清。', effect: () => {
    addLog('名声受损，但所幸未造成实质损失', '');
  }},
  { dayMin: 220, text: '深夜修炼时被不明野兽的吼声打断，心绪不宁。', effect: () => {
    GameState.wis = Math.max(1, GameState.wis - 1);
    addLog('心神受扰，神识 -1', 'danger');
  }},

  // 中性事件
  { dayMin: 20, text: '路边的茶棚，说书人正在讲一个修仙者的传奇。你听入了神。', effect: () => {
    addLog('听完说书，修仙之心更加坚定', '');
  }},
  { dayMin: 45, text: '你遇到了一个和你年龄相仿的修仙者，短暂同行后分道扬镳。', effect: () => {
    GameState.spiritStones += 10;
    addLog('同路人赠你路费，灵石+10', '');
  }},
  { dayMin: 110, text: '你在一座小城中遇到了曾经的邻居，他已认不出你。', effect: () => {
    addLog('修仙者与凡人，已是两个世界', '');
  }},
  { dayMin: 160, text: '一位老妪请你帮忙搬运柴禾，你顺手帮了。', effect: () => {
    GameState.spiritStones += 5;
    addLog('积德行善，灵石+5', '');
  }},
  { dayMin: 210, text: '你路过一座破败的道观，香火已断，心中感慨。', effect: () => {
    addLog('盛世道观今已荒，修仙之路，不进则退', '');
  }},
  { dayMin: 280, text: '你在悬崖边上眺望远方，云雾缭绕，不知前路通向何方。', effect: () => {
    addLog('前路未知，但你没有停下脚步', '');
  }},
];

// ===== 辅助函数 =====

/**
 * 按权重随机抽取身世
 */
function rollOrigin() {
  const pool = [];
  ORIGINS.forEach(o => {
    for (let i = 0; i < o.weight; i++) pool.push(o);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 获取指定身世的命定事件
 */
function getDestinedEvent(originId) {
  const origin = ORIGINS.find(o => o.id === originId);
  return origin ? origin.destined : null;
}

/**
 * 随机获取一个叙事事件（排除已触发过的）
 */
function rollRandomEvent(triggeredIds, plane) {
  const pool = plane === 'spirit' ? SPIRIT_EVENTS : plane === 'immortal' ? IMMORTAL_EVENTS : RANDOM_EVENTS;
  const prefix = plane === 'spirit' ? 'sp_' : plane === 'immortal' ? 'im_' : 'r_';
  const available = pool.filter((_, i) => !triggeredIds.includes(prefix + i));
  if (available.length === 0) return null;
  const ev = available[Math.floor(Math.random() * available.length)];
  const idx = pool.indexOf(ev);
  return { ...ev, id: prefix + idx };
}

// ===== 灵界随机事件 (20个) =====
const SPIRIT_EVENTS = [
  { dayMin: 5, text: '灵界灵气浓郁，深吸一口都觉得修为在涨。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 80); addLog('灵气灌体，修为+80','success'); }},
  { dayMin: 10, text: '冰封大陆的寒风让你灵台清明，神识有所精进。', effect: () => { GameState.wis += 1; addLog('极寒之中凝练神识，神识+1','success'); }},
  { dayMin: 15, text: '路边捡到一块灵界特产灵石，纯度极高。', effect: () => { GameState.spiritStones += 200; addLog('捡到灵晶，灵石+200','loot'); }},
  { dayMin: 20, text: '一位灵界散修邀你合猎妖兽，平分所得。', effect: () => { GameState.spiritStones += 350; addLog('合猎妖兽，灵石+350','loot'); }},
  { dayMin: 25, text: '天渊城的传送阵闪烁不止，你捡到一枚被人遗忘的传送符。', effect: () => { GameState.spiritStones += 180; addLog('传送符换灵石+180','loot'); }},
  { dayMin: 30, text: '木族领地的灵树开花，花瓣纷纷洒落，你获得一缕自然生机。', effect: () => { applyLifespan(GameState,30); GameState.vit += 1; addLog('吸收木华生机，寿元+30，体魄+1','crit'); }},
  { dayMin: 35, text: '血光圣殿外遇到一位负伤退走的修士，将多余的疗伤丹药给了你。', effect: () => { GameState.spiritStones += 150; addLog('获赠疗伤丹药，灵石+150','loot'); }},
  { dayMin: 40, text: '雷鸣峡谷的一缕天雷意外劈中身边石块，竟炸出一块雷晶。', effect: () => { GameState.atk += 2; addLog('天雷淬体，攻击+2','success'); }},
  { dayMin: 45, text: '飞灵族圣地巡逻的飞灵战士与你切磋，你受益匪浅。', effect: () => { GameState.spd += 2; addLog('飞灵切磋，速度+2','success'); }},
  { dayMin: 50, text: '灵界坊市中遇到当年的故人，对方感慨万千赠你一份厚礼。', effect: () => { GameState.spiritStones += 500; GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 120); addLog('故人重逢赠厚礼，灵石+500，修为+120','loot'); }},
  { dayMin: 55, text: '误入一座灵界上古遗迹，废墟中捡到一枚残缺的灵玉。', effect: () => { GameState.spiri += 1; addLog('上古灵玉残片，灵力+1','success'); }},
  { dayMin: 60, text: '冰封大陆深处传来龙吟，心神为之震荡，神魂越发凝练。', effect: () => { GameState.def += 2; addLog('龙吟锻体，防御+2','success'); }},
  { dayMin: 65, text: '灵脉区修炼时意外触发了地脉灵气潮，修为暴涨。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + Math.floor(GameState.cultivationMax * 0.07)); addLog('灵气潮爆发，修为大增！','crit'); }},
  { dayMin: 70, text: '木族长老向你传授一段生僻的木族秘术，神识微涨。', effect: () => { GameState.wis += 2; addLog('木族秘术，神识+2','success'); }},
  { dayMin: 75, text: '血炼塔的守卫索要过路费，你交了灵石后却不经意捡到一枚血晶。', effect: () => { const loss=Math.min(GameState.spiritStones,100); GameState.spiritStones-=loss; GameState.atk+=2; addLog('缴过路费-'+loss+'灵石，捡到血晶攻击+2',''); }},
  { dayMin: 80, text: '雷帝城中电闪雷鸣，万雷齐发，你趁机引雷锻体。', effect: () => { GameState.vit += 2; GameState.atk += 1; addLog('雷帝城引雷锻体，体魄+2，攻击+1','crit'); }},
  { dayMin: 85, text: '飞灵族一位长老看你有缘，赐予你一道飞灵符文。', effect: () => { GameState.spd += 3; addLog('飞灵符文刻印，速度+3','crit'); }},
  { dayMin: 90, text: '跨界通道的不稳定引起了空间震荡，你从乱流中捞起一件异物。', effect: () => { GameState.spiritStones += 400; addLog('空间乱流，灵石+400','loot'); }},
  { dayMin: 95, text: '灵界通缉榜更新，你无意中发现一条赏金线索。', effect: () => { GameState.spiritStones += 280; addLog('赏金线索兑现，灵石+280','loot'); }},
  { dayMin: 100, text: '万灵祭坛突然发出微光，一股远古之力灌注你身。', effect: () => { GameState.atk += 2; GameState.def += 2; GameState.spd += 2; addLog('万灵祝福！攻击+2，防御+2，速度+2','crit'); }},
];

// ===== 仙界随机事件 (18个) =====
const IMMORTAL_EVENTS = [
  { dayMin: 3, text: '飞升台上仙气缭绕，浑身毛孔都在吸收仙界灵力。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 200); addLog('仙界灵气，修为+200','success'); }},
  { dayMin: 6, text: '一位接引仙使见你刚飞升，随手赠予一些仙灵石。', effect: () => { GameState.spiritStones += 800; addLog('接引仙使赠灵石+800','loot'); }},
  { dayMin: 10, text: '仙坊中一位仙商看中你随身的一块凡石，以高价收走。', effect: () => { GameState.spiritStones += 600; addLog('凡石变仙石，灵石+600','loot'); }},
  { dayMin: 14, text: '金阙仙宫的仙乐袅袅，心神舒畅，修为精进。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 350); addLog('仙乐涤心，修为+350','success'); }},
  { dayMin: 18, text: '仙丹阁的丹香溢出墙外，你深吸几口便觉体魄大增。', effect: () => { GameState.vit += 2; addLog('丹香淬体，体魄+2','success'); }},
  { dayMin: 22, text: '论道台上两位金仙激辩大道，你旁听多日，豁然开悟。', effect: () => { GameState.wis += 3; addLog('金仙论道，神识+3','crit'); }},
  { dayMin: 26, text: '金甲卫营正在整顿，随手扔掉的旧仙甲碎片被你拾得。', effect: () => { GameState.def += 3; addLog('捡到仙甲碎片，防御+3','success'); }},
  { dayMin: 30, text: '太乙殿中一位大能讲法，你虽只能听懂皮毛却已获益良多。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + Math.floor(GameState.cultivationMax * 0.05)); addLog('太乙讲法，修为大进！','crit'); }},
  { dayMin: 35, text: '星域中一颗流星划过，其星芒竟凝成一枚微小的星钻。', effect: () => { GameState.spiritStones += 1200; addLog('星钻入手，灵石+1200','loot'); }},
  { dayMin: 40, text: '悟道崖上的一块仙石突然发光，你的心头浮现一道古老法门。', effect: () => { GameState.spd += 3; GameState.wis += 1; addLog('悟道崖顿悟，速度+3，神识+1','crit'); }},
  { dayMin: 45, text: '时空裂隙中飘出一页残破仙法，你勉强记下几行。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + 500); addLog('仙法残页，修为+500','success'); }},
  { dayMin: 50, text: '大罗宫举办万仙宴，你有幸位列末席，尝了一口仙宴灵肴。', effect: () => { applyLifespan(GameState,100); GameState.vit += 3; addLog('万仙宴·末席，寿元+100，体魄+3','crit'); }},
  { dayMin: 55, text: '混沌海中出现异象，一缕混沌之气飘入你的衣袖。', effect: () => { GameState.atk += 3; GameState.spd += 1; addLog('混沌之气，攻击+3，速度+1','success'); }},
  { dayMin: 60, text: '仙帝试炼场外有人贩卖淘汰的试炼情报，你花灵石买了一份。', effect: () => { const loss=Math.min(GameState.spiritStones,200); GameState.spiritStones-=loss; GameState.atk+=4; addLog('情报到手，-'+loss+'灵石，攻击+4',''); }},
  { dayMin: 65, text: '万法藏书阁的智能书灵为你推荐了一本失传古法。', effect: () => { GameState.wis += 5; addLog('失传古法，神识+5','crit'); }},
  { dayMin: 70, text: '天道祭坛上的古老符文逐个亮起，你感受到了一丝天道意志。', effect: () => { GameState.cultivation = Math.min(GameState.cultivationMax, GameState.cultivation + Math.floor(GameState.cultivationMax * 0.08)); addLog('天道意志灌注，修为大涨！','crit'); }},
  { dayMin: 75, text: '开天斧的余威从圣境深处传来，你的体魄在震动中精炼。', effect: () => { GameState.vit += 5; addLog('开天斧余威炼体，体魄+5','crit'); }},
  { dayMin: 80, text: '万物归墟的虚空中凝聚一滴本源之水，悄然落入你手中。', effect: () => { GameState.atk += 5; GameState.def += 5; GameState.spd += 5; addLog('本源之水！攻击+5，防御+5，速度+5','crit'); }},
];
