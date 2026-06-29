// ==========================================
//  data/alchemy.js — 炼丹系统数据（原著向）
// ==========================================

// 炼丹材料（凡人修仙传原著灵药）
const ALCHEMY_MATERIALS = {
  // 一品（凡间灵药）
  tianlingguo:    { name: '天灵果',      tier: 1, desc: '凡间灵山所产，入丹可增一丝灵力', price: 2 },
  chijinzhi:      { name: '赤精芝',      tier: 1, desc: '赤红色灵芝，百年份灵药的基础', price: 3 },
  baiyulu:        { name: '百玉露',      tier: 1, desc: '清晨灵草叶上凝结的露珠', price: 3 },
  lingShiFen:     { name: '灵石粉',      tier: 1, desc: '下品灵石研磨成的粉末，丹方引子', price: 5 },
  // 二品（数百年灵药）
  wusedlingzhi:   { name: '五色灵芝',    tier: 2, desc: '五百年份，已具五色光芒的灵芝', price: 15 },
  xuanyuhua:      { name: '玄玉花',      tier: 2, desc: '色如墨玉，五百年一开花', price: 20 },
  yaoshouNeidan:  { name: '妖兽内丹',    tier: 2, desc: '四级以上妖兽体内凝结的精华', price: 35 },
  longlinguo:     { name: '龙鳞果',      tier: 2, desc: '形如龙鳞，三百年一熟', price: 25 },
  // 三品（千年灵药）
  zixueshen:      { name: '紫血灵参',    tier: 3, desc: '千年份，切开后汁液如紫血', price: 50 },
  tianyuanguo:    { name: '天元果',      tier: 3, desc: '千年灵果树所结，一枚抵百年苦修', price: 60 },
  jinleizhu:      { name: '金雷竹',      tier: 3, desc: '生长在雷击之地，千年方成', price: 55 },
  xuejingou:      { name: '血晶藕',      tier: 3, desc: '深潭血水中长出的晶状莲藕', price: 45 },
  // 四品（数千年灵药）
  shouyuanguo:    { name: '寿元果',      tier: 4, desc: '三千年一熟，增寿百年', price: 150 },
  tianhundan:     { name: '天魂果',      tier: 4, desc: '生于极阴之地，滋养神魂', price: 200 },
  wannianlingru:  { name: '万年灵乳',    tier: 4, desc: '万年石钟乳核心的乳白液体', price: 180 },
  banxiaocao:     { name: '伴妖草',      tier: 4, desc: '只在化形妖兽巢穴附近生长', price: 160 },
  // 五品（万年以上仙药）
  mingmuGen:      { name: '螟母之根',    tier: 5, desc: '上古螟虫之母死后化为的根茎', price: 600 },
  jiuyelingye:    { name: '九叶灵液',    tier: 5, desc: '九叶仙草每千年产一滴的灵液', price: 800 },
};

// 丹方（凡人修仙传原著丹药）
const ALCHEMY_RECIPES = [
  // ===== 练气期丹药 =====
  {
    id: 'huanglong_dan', name: '黄龙丹', tier: 1, difficulty: 1, days: 1,
    materials: { tianlingguo: 3, lingShiFen: 1 },
    effect: { type: 'cultRecover', val: 40, desc: '恢复40点修为' },
    desc: '练气期最常用的丹药，可略微增进修为。黄枫谷外门弟子每月配给。',
  },
  {
    id: 'huichun_dan_recipe', name: '回春丹', tier: 1, difficulty: 2, days: 1,
    materials: { tianlingguo: 3, chijinzhi: 2, lingShiFen: 2 },
    effect: { type: 'combatItem', itemId: 'huiChunDan', desc: '制作战斗用品：回春丹' },
    desc: '战斗中恢复30%气血。练气期出行必备。',
  },
  {
    id: 'jinsui_wan', name: '金髓丸', tier: 1, difficulty: 1, days: 1,
    materials: { tianlingguo: 2, chijinzhi: 1, baiyulu: 2 },
    effect: { type: 'attrUp', attr: 'vit', val: 1, desc: '永久体魄+1' },
    desc: '强化肉身筋骨的丹药，服用后体魄强健。',
  },
  {
    id: 'qingling_san', name: '清灵散', tier: 1, difficulty: 2, days: 1,
    materials: { chijinzhi: 2, baiyulu: 3, lingShiFen: 2 },
    effect: { type: 'attrUp', attr: 'wis', val: 1, desc: '永久神识+1' },
    desc: '清心明目，可略微提升神识。韩立在黄枫谷时常用。',
  },
  // ===== 筑基期丹药 =====
  {
    id: 'jizhu_dan', name: '筑基丹', tier: 2, difficulty: 5, days: 5,
    materials: { tianlingguo: 10, wusedlingzhi: 3, lingShiFen: 8, xuanyuhua: 2 },
    effect: { type: 'breakRequired', itemName: '筑基丹', desc: '突破筑基境的必须丹药' },
    desc: '由天灵果、五色灵芝为主料炼制。练气修士冲击筑基境的必须之物，极为珍贵。原著中韩立为凑齐药材费尽心机。',
    realmRequired: '练气',
  },
  {
    id: 'heqi_dan', name: '合气丹', tier: 2, difficulty: 3, days: 2,
    materials: { tianlingguo: 5, wusedlingzhi: 2, longlinguo: 1, lingShiFen: 5 },
    effect: { type: 'cultRecover', val: 120, desc: '恢复120点修为' },
    desc: '筑基期修士常用的丹药，比黄龙丹药力强上数倍。',
  },
  {
    id: 'dahuan_dan_recipe', name: '大还丹', tier: 2, difficulty: 3, days: 2,
    materials: { wusedlingzhi: 2, xuanyuhua: 1, yaoshouNeidan: 1, lingShiFen: 5 },
    effect: { type: 'combatItem', itemId: 'daHuanDan', desc: '制作战斗用品：大还丹' },
    desc: '战斗中恢复50%气血。筑基后出远门必备。',
  },
  {
    id: 'jingang_wan', name: '金刚丸', tier: 2, difficulty: 3, days: 1,
    materials: { tianlingguo: 3, chijinzhi: 2, yaoshouNeidan: 1, lingShiFen: 3 },
    effect: { type: 'combatItem', itemId: 'jingangWan', desc: '制作战斗用品：金刚丸' },
    desc: '战前服用，防御大幅提升，持续3回合。',
  },
  {
    id: 'jifeng_san', name: '疾风散', tier: 2, difficulty: 2, days: 1,
    materials: { baiyulu: 4, longlinguo: 1, lingShiFen: 3 },
    effect: { type: 'combatItem', itemId: 'jifengSan', desc: '制作战斗用品：疾风散' },
    desc: '战前服用，速度激增，本回合必定先手。',
  },
  // ===== 金丹期丹药 =====
  {
    id: 'juling_dan', name: '聚灵丹', tier: 3, difficulty: 5, days: 3,
    materials: { tianyuanguo: 2, wusedlingzhi: 3, jinleizhu: 1, lingShiFen: 10 },
    effect: { type: 'cultRecover', val: 300, desc: '恢复300点修为' },
    desc: '金丹期修士增进修为的主用丹药。韩立结丹后大量炼制。',
  },
  {
    id: 'dingling_dan', name: '定灵丹', tier: 3, difficulty: 4, days: 2,
    materials: { zixueshen: 2, xuejingou: 2, wusedlingzhi: 2, lingShiFen: 8 },
    effect: { type: 'attrUp', attr: 'spi', val: 2, desc: '永久灵力+2' },
    desc: '稳定丹田灵力，略微扩大灵力容量的丹药。',
  },
  {
    id: 'baokuang_dan', name: '狂暴丹', tier: 3, difficulty: 4, days: 2,
    materials: { yaoshouNeidan: 2, tianyuanguo: 1, xuejingou: 2, lingShiFen: 5 },
    effect: { type: 'combatItem', itemId: 'baokuangDan', desc: '制作战斗用品：狂暴丹' },
    desc: '战前服用，攻击力暴增，持续3回合。注意：药效过后会虚弱。',
  },
  {
    id: 'jiangchen_dan', name: '降尘丹', tier: 3, difficulty: 6, days: 5,
    materials: { tianyuanguo: 4, zixueshen: 3, jinleizhu: 2, yaoshouNeidan: 3, lingShiFen: 15 },
    effect: { type: 'breakBonus', val: 0.12, desc: '突破金丹境成功率+12%（一次性）' },
    desc: '辅助结丹的丹药。原著中韩立在血色试炼中获得类似丹药助其结丹。注意：无此丹也可结丹，只是更难。',
    realmRequired: '筑基',
  },
  // ===== 元婴期丹药 =====
  {
    id: 'yanghun_dan', name: '养魂丹', tier: 4, difficulty: 6, days: 5,
    materials: { tianhundan: 3, shouyuanguo: 2, zixueshen: 3, lingShiFen: 15 },
    effect: { type: 'attrUp', attr: 'wis', val: 3, desc: '永久神识+3' },
    desc: '滋养神魂的丹药。韩立修炼大衍诀后神识远超同阶，此丹可进一步强化。',
  },
  {
    id: 'jiuzhuan_dan', name: '九转丹', tier: 4, difficulty: 6, days: 5,
    materials: { zixueshen: 5, wannianlingru: 2, tianhundan: 2, lingShiFen: 15 },
    effect: { type: 'combatItem', itemId: 'jiuzhuanDan', desc: '制作战斗用品：九转丹' },
    desc: '战斗中恢复全部气血。元婴修士的保命圣品。',
  },
  {
    id: 'huhun_dan', name: '护魂丹', tier: 4, difficulty: 7, days: 5,
    materials: { tianhundan: 3, banxiaocao: 2, wannianlingru: 3, lingShiFen: 15 },
    effect: { type: 'combatItem', itemId: 'huhunDan', desc: '制作战斗用品：护魂丹' },
    desc: '神魂护体，本次战斗中免疫一次致命伤害（HP归零时强制保留1点HP）。',
  },
  {
    id: 'chiyang_dan', name: '赤阳丹', tier: 4, difficulty: 6, days: 4,
    materials: { chijinzhi: 5, yaoshouNeidan: 3, xuejingou: 3, banxiaocao: 1, lingShiFen: 12 },
    effect: { type: 'attrUp', attr: 'atk', val: 3, desc: '永久攻击+3' },
    desc: '激发肉身潜能的烈性丹药，服用后攻击大增。',
  },
  {
    id: 'jiuying_yaoye', name: '结婴药液', tier: 4, difficulty: 8, days: 8,
    materials: { tianhundan: 4, wannianlingru: 3, banxiaocao: 2, tianyuanguo: 5, lingShiFen: 25 },
    effect: { type: 'breakBonus', val: 0.10, desc: '突破元婴境成功率+10%（一次性）' },
    desc: '并非单一丹药，而是多种天材地宝调和的药液。原著中结婴需多种灵物辅助，无固定丹方。此药液可略微提升结婴概率。',
    realmRequired: '金丹',
  },
  // ===== 化神及以上丹药 =====
  {
    id: 'shouyuandan_plus', name: '寿元果丹', tier: 4, difficulty: 5, days: 3,
    materials: { shouyuanguo: 3, wusedlingzhi: 5, zixueshen: 3, lingShiFen: 10 },
    effect: { type: 'lifespan', val: 50, desc: '增加50年寿元' },
    desc: '以寿元果为主料炼制的延寿丹药。原著中寿元果极为罕见。',
  },
  {
    id: 'mingmu_zhiye', name: '螟母汁液', tier: 5, difficulty: 9, days: 12,
    materials: { mingmuGen: 2, jiuyelingye: 2, tianhundan: 3, wannianlingru: 5, lingShiFen: 40 },
    effect: { type: 'allAttr', val: 2, desc: '六维全属性+2' },
    desc: '以上古螟母之根为主料的至强丹药。原著中此类逆天灵药可大幅提升修士肉身与神魂。',
  },
];

// 丹炉
const CAULDRONS = [
  { id: 'xia',   name: '下品丹炉', successBonus: 0.05, qualityBonus: 0.00, timeMult: 1.2, price: 50,  desc: '黄铜铸就的普通丹炉，韩立在黄枫谷初学炼丹所用' },
  { id: 'zhong', name: '中品丹炉', successBonus: 0.10, qualityBonus: 0.05, timeMult: 1.0, price: 300, desc: '精铁打造，炉壁刻有简易法阵' },
  { id: 'shang', name: '上品丹炉', successBonus: 0.15, qualityBonus: 0.10, timeMult: 0.8, price: 1500, desc: '寒铁为胎，内蕴地火之精。韩立筑基后所用' },
  { id: 'ji',    name: '极品丹炉', successBonus: 0.20, qualityBonus: 0.15, timeMult: 0.6, price: 5000, desc: '天外陨铁所铸，炼化万物。相当于韩立后期的银月鼎' },
];

// 丹药品质
const PILL_QUALITY = {
  low:  { name: '下品', mult: 1.0, color: '#9897a8', cssClass: '' },
  mid:  { name: '中品', mult: 1.5, color: '#5b8c5a', cssClass: 'success' },
  high: { name: '上品', mult: 2.0, color: '#c9a96e', cssClass: 'crit' },
  top:  { name: '极品', mult: 3.0, color: '#c0392b', cssClass: 'danger' },
};

// 基础品质概率
const BASE_QUALITY_WEIGHT = { low: 55, mid: 30, high: 12, top: 3 };

// 炼丹基础成功率系数 — 原著中炼丹失败率很高，此处 `[PLACEHOLDER]` 待调
const ALCHEMY_BASE_SUCCESS = 0.85;

// 品质乘数
function getQualityMult(quality) {
  return PILL_QUALITY[quality] ? PILL_QUALITY[quality].mult : 1.0;
}

// 材料掉落表（探索时随机获取）
const MATERIAL_DROP_TABLE = {
  1: [ { id: 'tianlingguo', w: 45 }, { id: 'chijinzhi', w: 30 }, { id: 'baiyulu', w: 25 }, { id: 'lingShiFen', w: 20 } ],
  2: [ { id: 'wusedlingzhi', w: 35 }, { id: 'xuanyuhua', w: 25 }, { id: 'longlinguo', w: 20 }, { id: 'yaoshouNeidan', w: 15 } ],
  3: [ { id: 'zixueshen', w: 25 }, { id: 'tianyuanguo', w: 20 }, { id: 'jinleizhu', w: 20 }, { id: 'xuejingou', w: 15 }, { id: 'yaoshouNeidan', w: 10 } ],
  4: [ { id: 'shouyuanguo', w: 15 }, { id: 'tianhundan', w: 12 }, { id: 'banxiaocao', w: 12 }, { id: 'wannianlingru', w: 10 }, { id: 'tianyuanguo', w: 10 } ],
  5: [ { id: 'mingmuGen', w: 8 }, { id: 'jiuyelingye', w: 6 }, { id: 'shouyuanguo', w: 12 }, { id: 'wannianlingru', w: 10 } ],
};

function rollMaterialFromTier(tier) {
  const table = MATERIAL_DROP_TABLE[tier];
  if (!table || table.length === 0) return null;
  const totalW = table.reduce((s, t) => s + t.w, 0);
  let roll = Math.random() * totalW;
  for (const entry of table) {
    roll -= entry.w;
    if (roll <= 0) return entry.id;
  }
  return table[table.length - 1].id;
}
