/**
 * 凡人修仙传·模拟器 — 功法系统
 * 依赖：DATA（js/data.js）
 * 导出：Skills 类
 *
 * 涵盖：5大类功法、主修/辅助/招式/被动/秘术
 *       品阶价值、97部功法数据、装备栏位
 *       叛宗规则、12Buff/12Debuff、技能招式
 *       Buff叠层规则
 */

class Skills {
  constructor(DATA) {
    this.D = DATA;
    this.S = DATA.SKILLS;
    this.B = DATA.BUFFS;

    // ========== 五类功法 ==========
    this.CATEGORIES = {
      MAIN: 'main',       // 主修功法 — 只能运转1部
      AUX: 'aux',         // 辅助功法 — 上限=境界系数×2
      MOVE: 'move',       // 神通/招式 — 装备到战斗栏位
      PASSIVE: 'passive', // 被动技能 — 装备到被动栏位
      SECRET: 'secret'    // 秘术 — 不限可学，但每次只能激活一种
    };

    // ========== 品阶价值 ==========
    this.RANK_VALUES = { 黄: 35, 玄: 70, 地: 140, 天: 250, 灵: 500, 仙: 1000, 神: 2000 };

    // ========== 装备栏位 ==========
    this.EQUIP_SLOTS = {
      凡人: { active: 1, passive: 1 },
      练气: { active: 2, passive: 1 },
      筑基: { active: 2, passive: 2 },
      金丹: { active: 3, passive: 2 },
      元婴: { active: 4, passive: 3 },
      化神: { active: 4, passive: 3 },
      炼虚: { active: 5, passive: 4 },
      合体: { active: 5, passive: 4 },
      大乘: { active: 5, passive: 4 },
      渡劫: { active: 5, passive: 4 },
      真仙: { active: 6, passive: 5 },
      金仙: { active: 6, passive: 5 },
      太乙: { active: 6, passive: 5 },
      大罗: { active: 6, passive: 5 },
      道祖: { active: Infinity, passive: Infinity }
    };

    // ========== 主修功法（完整26部） ==========
    this.mainSkills = [
      { name:'掩月基础功',   rank:'黄', value:35,   cult:20,  sp1:'灵力恢复+12%',          sp2:'气血+10%',                 faction:'黄枫谷', attr:'无' },
      { name:'妙音天诀',     rank:'玄', value:70,   cult:38,  sp1:'交易价格+10%',          sp2:'魅力+15',                  faction:'妙音门', attr:'无' },
      { name:'落云剑诀',     rank:'地', value:140,  cult:55,  sp1:'攻击+18%',              sp2:'剑气积累+剑阵',             faction:'落云宗', attr:'金' },
      { name:'不动金钟',     rank:'地', value:140,  cult:50,  sp1:'防御+20%+减伤8%',        sp2:'气血+25%',                 faction:'天阙堡', attr:'土' },
      { name:'万兽诀',       rank:'地', value:140,  cult:50,  sp1:'灵兽成长+25%',           sp2:'多控+1+全属+8%',           faction:'灵兽山', attr:'木' },
      { name:'天煞魔功',     rank:'地', value:140,  cult:55,  sp1:'攻击+20%',              sp2:'击杀回血8%+魔道+12%',       faction:'天煞宗', attr:'暗' },
      { name:'御鬼诀',       rank:'地', value:140,  cult:50,  sp1:'鬼物操控+2',             sp2:'鬼物属+12%+召唤CD-1',       faction:'鬼灵门', attr:'暗' },
      { name:'合欢诀',       rank:'地', value:140,  cult:50,  sp1:'双修收益+60%',           sp2:'魅力+18+灵力+15%',          faction:'合欢宗', attr:'木' },
      { name:'玄阴魔功',     rank:'地', value:140,  cult:55,  sp1:'冰伤+22%',              sp2:'灵力+18%+冰抗+25%',         faction:'极阴岛', attr:'冰' },
      { name:'九转归元诀',   rank:'地', value:140,  cult:55,  sp1:'突破+灵力上限+10%',       sp2:'瓶颈-10%+灵力恢复+15%',     faction:'虚天殿', attr:'无' },
      { name:'梵圣真魔功(残)',rank:'地',value:140,  cult:40,  sp1:'炼体+30%',              sp2:'气血+35%+防御+18%',         faction:'大晋古战场', attr:'无' },
      { name:'掩月天诀',     rank:'天', value:250,  cult:90,  sp1:'夜间+40%',              sp2:'灵力恢复x2+灵力+25%',        faction:'掩月宗', attr:'阴' },
      { name:'天魔解体大法',  rank:'天', value:250,  cult:75,  sp1:'解体攻防x3/3回合',       sp2:'攻击+18%+气血+30%',         faction:'天魔宗', attr:'暗' },
      { name:'星辰引',       rank:'天', value:250,  cult:110, sp1:'星辰伤害+35%',           sp2:'灵力+28%+夜间+15%',         faction:'星宫', attr:'星' },
      { name:'天道正法',     rank:'天', value:250,  cult:120, sp1:'对魔道+18%',             sp2:'全属+10%+心魔-25%',         faction:'天道盟', attr:'光' },
      { name:'三转重元功',   rank:'天', value:250,  cult:30,  sp1:'每转灵力+15%(3转)',       sp2:'二转突破+8%+走火归零',       faction:'独立', attr:'无', req:'悟性>=70' },
      { name:'青元剑诀',     rank:'天', value:250,  cult:90,  sp1:'攻击+15%+剑气x10',       sp2:'大庚剑阵',                  faction:'虚天殿', attr:'金', legacy:'韩立' },
      { name:'万古长青诀',   rank:'天', value:250,  cult:70,  sp1:'寿元+120年',              sp2:'气血+35%+炼体+12%',         faction:'万年灵木禁地', attr:'木' },
      { name:'混沌真解(人界)',rank:'天',value:250,  cult:110, sp1:'全属+8%',               sp2:'悟性+10+机缘+10',           faction:'三石碑拼凑', attr:'无' },
      { name:'太初剑经',     rank:'天', value:250,  cult:110, sp1:'攻击+35%',              sp2:'剑气上限x2+首击x3',          faction:'远古战场剑冢', attr:'金' },
      { name:'广灵道经',     rank:'灵', value:500,  cult:200, sp1:'法则感悟+5%',            sp2:'全属+15%+突破+8%',          faction:'广灵洞天', attr:'无' },
      { name:'梵圣真魔功(完整)',rank:'灵',value:500, cult:70,  sp1:'炼体+50%',              sp2:'气血+80%+防御+40%+法相',     faction:'广灵洞天', attr:'无' },
      { name:'混沌真解(灵界)',rank:'灵',value:500,  cult:200, sp1:'集人界篇+40%',           sp2:'全属+12%+灵力消耗-12%',      faction:'万古魔域', attr:'无' },
      { name:'混沌造化诀',   rank:'仙', value:1000, cult:400, sp1:'全属+25%+法则+12%',      sp2:'突破+10%',                  faction:'源初秘境', attr:'无' },
      { name:'鸿蒙道典',     rank:'仙', value:1000, cult:380, sp1:'法则+6%/级',            sp2:'突破+12%+法术减伤',          faction:'天庭禁书区', attr:'无' },
      { name:'青莲造化诀',   rank:'神', value:2000, cult:800, sp1:'全属+50%+法则+25%',      sp2:'突破+20%+掌天瓶完全体',       faction:'掌天瓶完全炼化', attr:'无' }
    ];

    // ========== 宗门专属功法 ==========
    this.factionSkills = [
      // 掩月宗
      { name:'月华斩',       rank:'地', type:'move',  effect:'单体2.0倍·夜间x1.5',                               faction:'掩月宗' },
      { name:'嫦娥步',       rank:'玄', type:'move',  effect:'身法·闪避+15%+夜间+10%',                            faction:'掩月宗' },
      // 落云宗
      { name:'穿云一剑',     rank:'地', type:'move',  effect:'单体2.2倍·无视30%防御',                               faction:'落云宗' },
      // 黄枫谷
      { name:'黄枫阵术',     rank:'玄', type:'aux',   effect:'阵法效果+30%+布阵速度+20%',                           faction:'黄枫谷' },
      // 天阙堡
      { name:'铁壁阵',       rank:'玄', type:'aux',   effect:'防御+25%+格挡率+15%',                                faction:'天阙堡' },
      // 清虚门
      { name:'清心诀',       rank:'玄', type:'aux',   effect:'心魔抗性+30%+悟性临时+3',                             faction:'清虚门' },
      { name:'太清神雷',     rank:'地', type:'move',  effect:'3.0倍雷伤+麻痹',                                     faction:'清虚门' },
      // 百巧院
      { name:'百炼术',       rank:'地', type:'aux',   effect:'炼器成功率+25%+法宝品质概率+10%',                      faction:'百巧院' },
      { name:'巧手天工',     rank:'地', type:'passive',effect:'傀儡制作效率+40%+傀儡属性+15%',                       faction:'百巧院' },
      // 灵兽山
      { name:'兽灵合体',     rank:'地', type:'move',  effect:'与出战灵兽属性融合30%/3回合',                          faction:'灵兽山' },
      // 天煞宗
      { name:'血煞斩',       rank:'地', type:'move',  effect:'2.5倍·附加3回合灼烧·消耗5%HP',                         faction:'天煞宗' },
      // 鬼灵门
      { name:'百鬼夜行',     rank:'天', type:'move',  effect:'召唤5只鬼物·全属+15%/5回合',                           faction:'鬼灵门' },
      // 御灵宗
      { name:'控神术',       rank:'玄', type:'aux',   effect:'对灵兽/鬼物控制+2·忠诚度衰减-20%',                      faction:'御灵宗' },
      { name:'兽魂寄生',     rank:'地', type:'move',  effect:'寄生敌方灵兽·夺取控制权2回合',                          faction:'御灵宗' },
      // 合欢宗
      { name:'采补术',       rank:'玄', type:'aux',   effect:'双修效果+30%·可采补NPC',                               faction:'合欢宗' },
      // 天魔宗
      { name:'魔相金身',     rank:'地', type:'move',  effect:'攻防+50%/3回合·冷却10天·消耗10%气血',                   faction:'天魔宗' },
      // 阴罗宗
      { name:'七绝咒术',     rank:'地', type:'move',  effect:'随机施加2种Debuff·持续3回合',                          faction:'阴罗宗' },
      { name:'替身咒',       rank:'玄', type:'aux',   effect:'可替队友承受伤害1次/天',                                faction:'阴罗宗' },
      // 星宫
      { name:'星陨术',       rank:'天', type:'move',  effect:'群体4.0倍星伤+标记·夜间x1.5',                           faction:'星宫' },
      { name:'星光遁',       rank:'地', type:'move',  effect:'身法·战斗中闪避+25%+夜间+15%',                         faction:'星宫' },
      // 妙音门
      { name:'音波功',       rank:'玄', type:'move',  effect:'群伤1.5倍·无视30%防御·概率混乱',                        faction:'妙音门' },
      // 极阴岛
      { name:'玄阴大法',     rank:'天', type:'move',  effect:'3.5倍冰伤+冰冻2回合+冰抗-30%',                          faction:'极阴岛' },
      // 万宝楼
      { name:'通宝诀',       rank:'玄', type:'aux',   effect:'交易价格+8%·灵石收益+15%',                              faction:'万宝楼' },
    ];

    // ========== 人界独立功法（19部） ==========
    this.independentRenJie = [
      { name:'太虚炼神诀',   rank:'玄', type:'aux',    effect:'神识+8%/级',                          location:'大晋古战场地宫'       },
      { name:'天罡罩',       rank:'玄', type:'move',   effect:'减伤70%/2回合·冷却5',                  location:'天南禁地藏经洞'       },
      { name:'碎星指',       rank:'玄', type:'move',   effect:'单体2.5倍·破甲50%',                    location:'乱星海海底遗迹'       },
      { name:'万毒心经',     rank:'玄', type:'aux',    effect:'毒伤+50%+炼毒不伤',                     location:'慕兰草原毒修遗迹'     },
      { name:'草木逢春诀',   rank:'玄', type:'aux',    effect:'战斗每回合回5%HP',                      location:'万年灵木禁地'         },
      { name:'虚空步',       rank:'玄', type:'move',   effect:'闪避+25%+完全闪避概率',                  location:'陨铁岛空间裂缝'       },
      { name:'搬山诀',       rank:'玄', type:'aux',    effect:'负重x3+炼体+10%',                      location:'昆吾山外围矿洞'       },
      { name:'融灵诀',       rank:'玄', type:'aux',    effect:'灵兽成长+30%+出战+1',                   location:'灵兽山外围密道'       },
      { name:'锻体诀',       rank:'黄', type:'aux',    effect:'炼体速度+15%',                         location:'各处山洞遗迹'          },
      { name:'五禽戏',       rank:'黄', type:'aux',    effect:'寿元+10+全属+3%',                      location:'青云山七玄门'          },
      { name:'天听术',       rank:'黄', type:'aux',    effect:'探索发现范围+20%',                      location:'黑风林隐藏树洞'       },
      { name:'敛息术',       rank:'黄', type:'aux',    effect:'探索安全+20%+避开妖兽',                 location:'散修联盟任务'          },
      { name:'缩地成寸',     rank:'黄', type:'move',   effect:'赶路x2+战斗先手',                       location:'天南城奇遇'            },
      { name:'破阵诀',       rank:'黄', type:'aux',    effect:'破阵效率+40%',                         location:'清虚门废弃讲堂'       },
      { name:'金钟罩残篇',   rank:'黄', type:'move',   effect:'减伤+15%炼体联动',                      location:'天阙堡外门垃圾堆'     },
      { name:'雷音吼',       rank:'黄', type:'move',   effect:'无视防御+概率眩晕',                      location:'雷鸣山脉山脚洞穴'     },
      { name:'血炼术',       rank:'黄', type:'aux',    effect:'气血代替灵石催动法宝',                    location:'魔岛血修洞府'          },
      { name:'混沌真解·人界篇',rank:'天',type:'main',  effect:'全属8%+悟性10+机缘10',                  location:'集三块禁地石碑', isMain:true },
      { name:'万古长青诀',   rank:'天', type:'main',   effect:'寿元+120+气血+35%+炼体+12%',            location:'万年灵木禁地最深处', isMain:true }
    ];

    // ========== 灵界独立功法（12部） ==========
    this.independentLingJie = [
      { name:'虚空遁术',     rank:'玄', type:'move',   effect:'战斗中瞬移闪避+40%',                   location:'灵界虚空裂缝'         },
      { name:'化灵术',       rank:'玄', type:'aux',    effect:'灵力恢复速度+50%+丹毒减半',             location:'灵界坊市'              },
      { name:'分光错影',     rank:'地', type:'move',   effect:'制造3个幻影·各有30%本体属性·持续3回合',    location:'天渊城藏经阁'          },
      { name:'真灵变',       rank:'地', type:'move',   effect:'化为已签真灵形态·属性+50%/5回合·冷却30天',  location:'万妖山脉传承'          },
      { name:'万剑归宗',     rank:'地', type:'move',   effect:'群体4.0倍金伤·剑气附体',                 location:'灵界剑修遗迹'          },
      { name:'洞虚之眼',     rank:'地', type:'passive',effect:'可看穿隐藏·侦查范围+50%',                 location:'迷雾海幻境核心'        },
      { name:'不朽金身',     rank:'灵', type:'passive',effect:'炼体上限+50%+物理减伤+20%',               location:'广灵洞天炼体试炼'      },
      { name:'九劫秘典',     rank:'灵', type:'secret', effect:'渡劫时每劫+15%成功率·累计9劫',             location:'雷鸣山脉禁地'          },
      { name:'万灵血咒',     rank:'灵', type:'secret', effect:'消耗1000HP·下次攻击x5倍·冷却30天',           location:'血神秘境核心'          },
      { name:'太虚神游',     rank:'天', type:'move',   effect:'神识出窍·无视距离侦察·持续1天',             location:'大晋古战场深处'        },
      { name:'混沌真解·灵界篇',rank:'天',type:'main',  effect:'集人界篇+40%·全属+12%+灵力消耗-12%',        location:'万古魔域', isMain:true  },
      { name:'五色神光',     rank:'灵', type:'move',   effect:'刷掉敌方2个Buff+造成3.0倍混合伤',           location:'广灵洞天·五行试炼'     }
    ];

    // ========== 仙界独立功法（8部） ==========
    this.independentXianJie = [
      { name:'时间凝滞',     rank:'地', type:'move',   effect:'敌方跳过1回合·冷却20回合',                location:'仙界时痕裂缝'          },
      { name:'因果逆转',     rank:'灵', type:'secret', effect:'消耗当下HP50%·下一击效果翻倍',              location:'轮回殿外围'            },
      { name:'法则共鸣',     rank:'灵', type:'passive',effect:'所悟法则效果+30%+法则获取速+25%',           location:'源初秘境外围'          },
      { name:'道化万千',     rank:'灵', type:'move',   effect:'分身x3·各有本体70%属性·持续5回合',           location:'天庭藏法阁'            },
      { name:'大轮回术',     rank:'仙', type:'secret', effect:'死亡时100%复生1次·全属性恢复·冷却100年',      location:'轮回殿殿主传承'        },
      { name:'言出法随',     rank:'仙', type:'move',   effect:'宣言一种效果·强制生效1次·冷却1000天',         location:'道祖试炼', req:'道祖'  },
      { name:'混沌开天',     rank:'神', type:'move',   effect:'无视一切防御·造成10倍混沌伤',               location:'混沌古神陨落之地'      },
      { name:'造化涅槃',     rank:'神', type:'secret', effect:'重置全部冷却+满状态·冷却100年',              location:'源初秘境最深处'        }
    ];

    // ========== 远古古法（8部·特殊独立品阶） ==========
    this.ancientArts = [
      { name:'盘古炼体术',   rank:'远古', type:'aux',    effect:'炼体基础+100%+气血上限+200%',           location:'混沌外域'              },
      { name:'女娲补天诀',   rank:'远古', type:'secret', effect:'修复破损法则·消耗寿元1000年',             location:'天庭废墟'              },
      { name:'伏羲八卦',     rank:'远古', type:'passive',effect:'推演成功率+80%+预知危险',                location:'远古遗迹卦台'          },
      { name:'神农百草经',   rank:'远古', type:'aux',    effect:'炼丹成功率+50%+丹毒免疫',                location:'远古药谷'              },
      { name:'共工怒涛诀',   rank:'远古', type:'move',   effect:'水系8.0倍群伤+全屏',                     location:'远古深海祭坛'          },
      { name:'祝融焚天咒',   rank:'远古', type:'move',   effect:'火系8.0倍群伤+灼烧5层',                   location:'远古火山核心'          },
      { name:'后羿射日',     rank:'远古', type:'move',   effect:'单体50倍·对金乌x100倍·冷却100年',          location:'远古太阳遗迹'          },
      { name:'夸父逐日',     rank:'远古', type:'aux',    effect:'赶路速度无上限·每100步+1%速度(永续)',       location:'远古神道'              }
    ];

    // ========== 独立传承（韩立线5部） ==========
    this.legacySkills = [
      { name:'大衍诀',       rank:'天', type:'aux',    effect:'每级+10%神识上限·Lv5神念化丝·Lv8分神术·Lv10大衍神光(x3)', location:'血色禁地·大衍神君残魂试炼', legacy:'韩立' },
      { name:'三转重元功',   rank:'天', type:'main',   effect:'每转灵力+15%·三转后灵力同阶2倍·走火归零',                 location:'顿悟事件', legacy:'韩立', req:'悟性>=70' },
      { name:'青元剑诀',     rank:'天', type:'main',   effect:'剑气积累·每层+5%法宝攻击·Lv6剑阵·Lv10大庚剑阵(x5)',         location:'虚天殿偏殿', legacy:'韩立' },
      { name:'梵圣真魔功·残',rank:'地', type:'main',   effect:'炼体+30%+气血+35%+真魔法相(攻防+50%/3回/冷却10天)',         location:'大晋古战场地宫', legacy:'韩立' },
      { name:'罗烟步',       rank:'玄', type:'move',   effect:'闪避+15%',                                                 location:'随机探索', legacy:'韩立' },
      { name:'血遁术',       rank:'玄', type:'secret', effect:'消耗10%气血·战斗中立即逃离·赶路速度x20(紧急)',                location:'黑市购买', legacy:'韩立' }
    ];

    // ========== 全功法合并 ==========
    this.allSkills = this._mergeAllSkills();

    // ========== 技能招式（按品阶分） ==========
    this.skillMoves = {
      黄: [
        { name:'火球术',   effect:'基础火伤+灼烧',        desc:'基础+灼烧'             },
        { name:'冰锥术',   effect:'基础冰伤+冰冻',        desc:'基础+冰冻'             },
        { name:'金盾术',   effect:'护体2回合',            desc:'护体2回合'             },
        { name:'缠绕术',   effect:'基础+缠绕',            desc:'基础+缠绕'             },
        { name:'土墙',     effect:'金刚罩1回合',          desc:'金刚罩1回合'            },
        { name:'风刃',     effect:'基础·无法闪避',        desc:'基础·无法闪避'          },
        { name:'雷击',     effect:'1.5倍+麻痹',           desc:'1.5倍+麻痹'            }
      ],
      玄: [
        { name:'烈焰滔天', effect:'群体灼烧3回合',         desc:'群体灼烧3回合'          },
        { name:'冰封万里', effect:'群体冰冻1回合',         desc:'群体冰冻1回合'          },
        { name:'剑气纵横', effect:'1.8倍+破甲',            desc:'1.8倍+破甲'            },
        { name:'枯木逢春', effect:'回25%HP+驱散1',         desc:'回25%HP+驱散1'         },
        { name:'流沙术',   effect:'缠绕2回+灵-20%',        desc:'缠绕2回+灵-20%'        },
        { name:'蚀魂咒',   effect:'虚弱+噬灵2回',          desc:'虚弱+噬灵2回'          },
        { name:'狂雷天降', effect:'2倍+麻痹',              desc:'2倍+麻痹'              }
      ],
      地: [
        { name:'天火燎原', effect:'群体3倍+灼烧3层',        desc:'群体3倍+灼烧3层'        },
        { name:'玄冰神刺', effect:'2.5倍+冰冻+破甲',        desc:'2.5倍+冰冻+破甲'        },
        { name:'万剑诀',   effect:'3倍+标记',               desc:'3倍+标记'              },
        { name:'回春术',   effect:'回50%HP+驱散全部',       desc:'回50%HP+驱散全部'       },
        { name:'大地之盾', effect:'减伤80%+反伤20%',        desc:'减伤80%+反伤20%'        },
        { name:'摄魂',     effect:'混乱2回+灵-20%',         desc:'混乱2回+灵-20%'         },
        { name:'雷狱',     effect:'3倍+麻痹+无法闪避',      desc:'3倍+麻痹+无法闪避'       },
        { name:'血祭',     effect:'消耗15%HP·攻+60%3回合',  desc:'消耗15%HP·攻+60%3回合'  }
      ],
      天: [
        { name:'焚天',       effect:'5倍+灼烧3层',                       desc:'5倍+灼烧3层'                 },
        { name:'绝对零度',   effect:'3倍+冰冻3回+灵力涌动',               desc:'3倍+冰冻3回+灵力涌动'         },
        { name:'大庚剑阵',   effect:'5倍单体+剑气附体',                   desc:'5倍单体+剑气附体'             },
        { name:'生命礼赞',   effect:'全恢复+涅槃',                        desc:'全恢复+涅槃'                  },
        { name:'不动明王',   effect:'金刚罩3回+反伤40%',                   desc:'金刚罩3回+反伤40%'            },
        { name:'神雷天罚',   effect:'4倍群+麻痹+标记',                    desc:'4倍群+麻痹+标记'              },
        { name:'神识风暴',   effect:'无视防2.5倍+混乱+沉默',               desc:'无视防2.5倍+混乱+沉默'         },
        { name:'法天象地',   effect:'攻防x3/3回/虚弱3回/CD20回',           desc:'攻防x3/3回/虚弱3回/CD20回'     }
      ]
    };

    // ========== Buff/Debuff 定义 ==========
    this.buffs = [
      { name:'护体灵光',  effect:'防御+30%',          duration:3, maxStack:1, stackable:true  },
      { name:'剑气附体',  effect:'攻击+25%',          duration:5, maxStack:2, stackable:true  },
      { name:'灵力涌动',  effect:'灵力恢复x2',         duration:3, maxStack:1, stackable:false },
      { name:'金刚罩',    effect:'减伤50%',           duration:2, maxStack:1, stackable:false, note:'不可攻击'  },
      { name:'嗜血',      effect:'攻击回10%HP',        duration:4, maxStack:1, stackable:false },
      { name:'神速',      effect:'闪避+30%/出手x1.5',   duration:3, maxStack:1, stackable:false },
      { name:'狂化',      effect:'攻击+50%/防御-30%',   duration:3, maxStack:1, stackable:false },
      { name:'灵域',      effect:'全属+15%',           duration:5, maxStack:1, stackable:false },
      { name:'涅槃',      effect:'濒死恢复50%HP',       duration:1, maxStack:1, stackable:false },
      { name:'法相天地',  effect:'攻防+80%',           duration:3, maxStack:1, stackable:false, note:'每轮回5%灵力' }
    ];

    this.debuffs = [
      { name:'灼烧',  effect:'每轮回5%HP',           duration:3, maxStack:3, note:'可叠3层'   },
      { name:'冰冻',  effect:'速度-50%/概率跳回',     duration:2, maxStack:1                  },
      { name:'麻痹',  effect:'30%概率跳回',           duration:2, maxStack:1                  },
      { name:'中毒',  effect:'每轮回8%HP+10%',        duration:4, maxStack:2, note:'可叠2层'   },
      { name:'破甲',  effect:'防御-40%',              duration:3, maxStack:1                  },
      { name:'沉默',  effect:'无法用技能',            duration:2, maxStack:1                  },
      { name:'混乱',  effect:'20%打自己',             duration:2, maxStack:1                  },
      { name:'虚弱',  effect:'攻击-30%',              duration:3, maxStack:1                  },
      { name:'噬灵',  effect:'每轮回15%灵',           duration:3, maxStack:1                  },
      { name:'标记',  effect:'受伤+25%',              duration:5, maxStack:1                  },
      { name:'缠绕',  effect:'无法闪避/速归零',       duration:2, maxStack:1                  },
      { name:'心魔',  effect:'突破-20%',              duration:0, maxStack:1, note:'战后持续'  }
    ];

    // ========== 叛宗规则 ==========
    this.defectionRates = { 黄:0.90, 玄:0.70, 地:0.50, 天:0.30, 镇派:0.10 };
    this.defectionOptions = [
      { id:1,  label:'乖乖归还',      risk:0,   consequence:'安全离开，功法全失'            },
      { id:2,  label:'装作已忘',      risk:1,   consequence:'按概率判定·失败触发追杀'        },
      { id:3,  label:'强行保留',      risk:2,   consequence:'全宗敌对+永久追杀'              },
      { id:4,  label:'废功脱宗',      risk:0,   consequence:'自废该宗门功法·安全离开'         }
    ];

    // ========== 功法等级 ==========
    this.MAX_LEVEL = 10;
    this.PER_LEVEL_BONUS = 5;      // 每级+5%效果
    this.SWITCH_DAYS = 10;          // 主修切换耗时（转修期）

    // ========== 基础吐纳法（保底主修） ==========
    this.BASIC_SKILL = { name:'基础吐纳法', rank:'无', type:'main', cult:0, sp1:'无加成', sp2:'保底可用', faction:'通用' };
  }

  // ==================== 核心方法 ====================

  /** 合并所有功法为一个数组 */
  _mergeAllSkills() {
    const all = [];

    // 主修功法
    this.mainSkills.forEach(s => all.push({ ...s, category: this.CATEGORIES.MAIN, tags: ['主修'] }));

    // 宗门专属
    this.factionSkills.forEach(s => all.push({ ...s, category: this._mapTypeToCategory(s.type), tags: ['宗门专属'] }));

    // 人界独立
    this.independentRenJie.forEach(s => all.push({ ...s, category: this._mapTypeToCategory(s.type), tags: ['人界'], realm:'人界' }));

    // 灵界独立
    this.independentLingJie.forEach(s => all.push({ ...s, category: this._mapTypeToCategory(s.type), tags: ['灵界'], realm:'灵界' }));

    // 仙界独立
    this.independentXianJie.forEach(s => all.push({ ...s, category: this._mapTypeToCategory(s.type), tags: ['仙界'], realm:'仙界' }));

    // 远古古法
    this.ancientArts.forEach(s => all.push({ ...s, category: this._mapTypeToCategory(s.type), tags: ['远古'], realm:'远古' }));

    // 独立传承
    this.legacySkills.forEach(s => all.push({ ...s, category: this._mapTypeToCategory(s.type), tags: ['传承'], realm:'传承' }));

    return all;
  }

  _mapTypeToCategory(type) {
    if (!type) return this.CATEGORIES.MAIN;
    if (type.includes('主修') || type === 'main') return this.CATEGORIES.MAIN;
    if (type.includes('辅修') || type === 'aux')   return this.CATEGORIES.AUX;
    if (type.includes('招式') || type.includes('身法') || type.includes('防御') || type.includes('攻击')
        || type === 'move' || type.includes('术')) return this.CATEGORIES.MOVE;
    if (type.includes('被动') || type === 'passive') return this.CATEGORIES.PASSIVE;
    if (type.includes('秘术') || type === 'secret')  return this.CATEGORIES.SECRET;
    return this.CATEGORIES.AUX;
  }

  // ==================== 查询方法 ====================

  /** 获取所有功法 */
  getAllSkills() { return this.allSkills; }

  /** 按分类获取功法 */
  getByCategory(cat) { return this.allSkills.filter(s => s.category === cat); }

  /** 按宗门筛选 */
  getByFaction(factionName) {
    return this.allSkills.filter(s => s.faction === factionName);
  }

  /** 按品阶筛选 */
  getByRank(rank) { return this.allSkills.filter(s => s.rank === rank); }

  /** 按名称查找 */
  getByName(name) { return this.allSkills.find(s => s.name === name); }

  /** 获取基础吐纳法 */
  getBasicSkill() { return { ...this.BASIC_SKILL }; }

  /** 获取所有主修功法 */
  getMainSkills() { return this.allSkills.filter(s => s.category === this.CATEGORIES.MAIN); }

  /** 获取所有招式 */
  getMoves()     { return this.allSkills.filter(s => s.category === this.CATEGORIES.MOVE); }

  /** 获取所有被动 */
  getPassives()  { return this.allSkills.filter(s => s.category === this.CATEGORIES.PASSIVE); }

  /** 获取所有秘术 */
  getSecrets()   { return this.allSkills.filter(s => s.category === this.CATEGORIES.SECRET); }

  /** 获取所有辅助功法 */
  getAuxSkills() { return this.allSkills.filter(s => s.category === this.CATEGORIES.AUX); }

  /** 按品阶获取技能招式列表 */
  getSkillMovesByRank(rank) { return this.skillMoves[rank] || []; }

  /** 获取全部技能招式 */
  getAllSkillMoves() { return this.skillMoves; }

  /** 统计功法数量 */
  countAll()     { return this.allSkills.length; }
  countMain()    { return this.getMainSkills().length; }
  countAux()     { return this.getAuxSkills().length; }
  countMoves()   { return this.getMoves().length; }
  countPassives(){ return this.getPassives().length; }
  countSecrets() { return this.getSecrets().length; }

  // ==================== 装备栏位 ====================

  /** 获取某境界的装备栏位数 */
  getEquipSlots(realm) {
    return this.EQUIP_SLOTS[realm] || { active:1, passive:1 };
  }

  /** 辅助功法最大可学数 */
  getAuxCapacity(realm) {
    // 境界系数：用realm在 REALMS.baseStats 里的索引
    const realmOrder = Object.keys(this.D.REALMS.baseStats);
    const idx = realmOrder.indexOf(realm);
    const coeff = idx >= 0 ? idx + 1 : 1;
    return coeff * 2;
  }

  // ==================== 品阶价值 ====================

  /** 获取品阶总价值 */
  getRankValue(rank) { return this.RANK_VALUES[rank] || 35; }

  // ==================== Buff/Debuff ====================

  /** 获取指定Buff */
  getBuff(name) { return this.buffs.find(b => b.name === name); }

  /** 获取指定Debuff */
  getDebuff(name) { return this.debuffs.find(d => d.name === name); }

  /** 获取全部Buff */
  getAllBuffs() { return this.buffs; }

  /** 获取全部Debuff */
  getAllDebuffs() { return this.debuffs; }

  // ==================== Buff叠层规则 ====================

  /**
   * 计算Buff叠层效果（乘法·非线性）
   * 公式：N层效果 = 基础值 × (1 + 0.8 × (N-1))
   *
   * @param {number} baseValue   - 基础效果值（百分比数值，如5表示5%）
   * @param {number} stackCount  - 当前叠层数
   * @returns {number} 叠层后的效果值
   */
  calcStackEffect(baseValue, stackCount) {
    if (stackCount <= 1) return baseValue;
    // N层效果 = 基础值 × (1 + 0.8 × (N-1))
    return baseValue * (1 + 0.8 * (stackCount - 1));
  }

  /**
   * 尝试给buff/debuff叠层
   * @param {object} activeBuff    - 当前已激活的buff
   * @param {object} newBuff       - 新施加的buff
   * @returns {object} { success, message, newStack, newDuration }
   */
  applyStack(activeBuff, newBuff) {
    // 不可叠层 = 只刷新持续时间
    if (!newBuff.stackable || newBuff.maxStack <= 1) {
      return {
        success: true,
        stackApplied: false,
        newStack: activeBuff ? activeBuff.stack || 1 : 1,
        newDuration: newBuff.duration,
        message: 'Buff不可叠加，已刷新持续时间'
      };
    }

    const currentStack = activeBuff ? (activeBuff.stack || 1) : 0;
    const maxStack = newBuff.maxStack || 1;

    if (currentStack >= maxStack) {
      // 已达上限，刷新持续时间
      return {
        success: true,
        stackApplied: false,
        newStack: maxStack,
        newDuration: newBuff.duration,
        message: `已达最大层数(${maxStack})，已刷新持续时间`
      };
    }

    const newStack = currentStack + 1;
    return {
      success: true,
      stackApplied: true,
      newStack: newStack,
      newDuration: newBuff.duration, // 统一计时，到期全消
      message: `叠加至${newStack}层，效果=${this.calcStackEffect(newBuff.baseValue || 5, newStack).toFixed(1)}%`
    };
  }

  // ==================== 装备/卸装 ====================

  /**
   * 检查是否可以装备
   * @param {object} player  - 玩家状态 { realm, equipped:{ active:[], passive:[] } }
   * @param {object} skill   - 要装备的功法
   * @param {string} slotType - 'active'|'passive'
   * @returns {object} { canEquip, reason }
   */
  canEquip(player, skill, slotType) {
    const slots = this.getEquipSlots(player.realm);
    const equipped = player.equipped[slotType] || [];
    const max = slots[slotType];

    if (equipped.length >= max) {
      return { canEquip: false, reason: `${slotType==='active'?'主动':'被动'}栏位已满 (${equipped.length}/${max})` };
    }

    // 主修功法只能装主动栏 & 只能有一个
    if (skill.category === this.CATEGORIES.MAIN) {
      if (slotType !== 'active') {
        return { canEquip: false, reason: '主修功法只能装备到主动栏位' };
      }
      const hasMain = equipped.some(s => s.category === this.CATEGORIES.MAIN);
      if (hasMain) {
        return { canEquip: false, reason: '已装备主修功法，需先切换' };
      }
    }

    // 被动技能只能装被动栏
    if (skill.category === this.CATEGORIES.PASSIVE && slotType !== 'passive') {
      return { canEquip: false, reason: '被动技能只能装备到被动栏位' };
    }

    // 秘术只能装主动栏且只能1个
    if (skill.category === this.CATEGORIES.SECRET && slotType === 'active') {
      const hasSecret = equipped.some(s => s.category === this.CATEGORIES.SECRET);
      if (hasSecret) {
        return { canEquip: false, reason: '已激活一种秘术' };
      }
    }

    return { canEquip: true };
  }

  /**
   * 切换主修功法
   * @returns {object} { success, message, switchDays, oldMain, newMain }
   */
  switchMainSkill(player, newSkill) {
    if (newSkill.category !== this.CATEGORIES.MAIN) {
      return { success: false, message: '只能切换主修类功法' };
    }

    const activeEquipped = player.equipped.active || [];
    const currentMain = activeEquipped.find(s => s.category === this.CATEGORIES.MAIN);

    return {
      success: true,
      message: `开始转修【${newSkill.name}】，需${this.SWITCH_DAYS}天转修期`,
      switchDays: this.SWITCH_DAYS,
      oldMain: currentMain ? currentMain.name : '基础吐纳法',
      newMain: newSkill.name
    };
  }

  // ==================== 叛宗处理 ====================

  /**
   * 处理叛宗功法保留
   * @param {array}  factionSkills   - 该宗门功法列表
   * @param {number} optionId       - 叛宗选项 (1-4)
   * @returns {object} 处理结果
   */
  handleDefection(factionSkills, optionId) {
    const option = this.defectionOptions.find(o => o.id === optionId);
    if (!option) return { success: false, message: '无效选项' };

    const result = { success: true, option: option.label, lost: [], kept: [], consequence: option.consequence };

    if (option.id === 1 || option.id === 4) {
      // 全部归还 / 废功脱宗 → 全失
      result.lost = factionSkills.map(s => s.name);
      result.kept = [];
    } else {
      // 装作已忘 / 强行保留 → 按概率判定
      factionSkills.forEach(skill => {
        const rate = this.getRetentionRate(skill.rank);
        // 强势保留选项给额外+20%几率
        const finalRate = option.id === 3 ? Math.min(1, rate + 0.2) : rate;
        const retained = Math.random() < finalRate;

        if (retained) {
          result.kept.push(skill.name);
        } else {
          result.lost.push(skill.name);
        }
      });
    }

    // 若丢失的是主修功法 → 自动切基础吐纳法
    const lostMain = result.lost.find(name => {
      const s = this.allSkills.find(sk => sk.name === name);
      return s && s.category === this.CATEGORIES.MAIN;
    });
    if (lostMain) {
      result.mainSwitchedToBasic = true;
      result.message = `你的主修功法【${lostMain}】已被废除，已自动切换至基础吐纳法`;
    }

    return result;
  }

  /** 获取某品阶叛宗保留率 */
  getRetentionRate(rank) {
    return this.defectionRates[rank] || 0;
  }

  /** 获取叛宗选项列表 */
  getDefectionOptions() { return this.defectionOptions; }

  // ==================== 等级计算 ====================

  /**
   * 功法等级加成计算
   * @param {number} baseEffect - 基础效果值
   * @param {number} level      - 功法等级 (1-10)
   * @returns {number} 等级加成后效果
   */
  calcLevelBonus(baseEffect, level) {
    return baseEffect * (1 + (level - 1) * this.PER_LEVEL_BONUS / 100);
  }

  /**
   * 计算主修功法修炼加成
   * @param {object} mainSkill - 主修功法
   * @param {number} level     - 功法等级
   * @returns {number} 修炼加成百分比
   */
  calcCultivationBonus(mainSkill, level) {
    const base = mainSkill.cult || 0;
    return this.calcLevelBonus(base, level);
  }

  // ==================== 统计/报告 ====================

  /** 生成功法系统报告 */
  report() {
    return {
      totalSkills: this.countAll(),
      byCategory: {
        main: this.countMain(),
        aux: this.countAux(),
        move: this.countMoves(),
        passive: this.countPassives(),
        secret: this.countSecrets()
      },
      byRank: {
        远古: this.ancientArts.length,
        神: this.getByRank('神').length,
        仙: this.getByRank('仙').length,
        灵: this.getByRank('灵').length,
        天: this.getByRank('天').length,
        地: this.getByRank('地').length,
        玄: this.getByRank('玄').length,
        黄: this.getByRank('黄').length
      },
      skillMovesCount: {
        黄: this.skillMoves['黄']?.length || 0,
        玄: this.skillMoves['玄']?.length || 0,
        地: this.skillMoves['地']?.length || 0,
        天: this.skillMoves['天']?.length || 0
      },
      buffsCount: this.buffs.length,
      debuffsCount: this.debuffs.length,
      defectionRates: this.defectionRates,
      maxLevel: this.MAX_LEVEL,
      switchDays: this.SWITCH_DAYS
    };
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Skills };
}
// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Skills = Skills;
}
