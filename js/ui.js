/**
 * ui.js — 凡人修仙传·模拟器 UI 渲染引擎
 *
 * 基于 GDD 附录三（行1765~3065）全部 UI 界面布局规范。
 * 纯 DOM 操作，读取 GameState 各模块渲染。
 *
 * 导出：UI 类
 * 依赖：GameState（全局）、各模块实例（player/world/cultivation/etc.）
 *
 * 渲染范围：
 *   顶栏 / 进度条 / 属性面板(折叠展开3卡片)
 *   5个Tab所有子页面 / 底栏
 *   战斗界面 / 创建角色 / 弹窗系统
 *   日志 / 红点 / 新手引导
 */

/* ================================================================
 *  常量
 * ================================================================ */

const TAB_CFG = [
  { id: 'home',          icon: '🏠', label: '首页' },
  { id: 'cultivation',   icon: '🧘', label: '修炼' },
  { id: 'exploration',   icon: '🗺️', label: '探索' },
  { id: 'backpack',      icon: '🎒', label: '背包' },
  { id: 'more',          icon: '⚙️', label: '更多' },
];

// 五行色映射
const WU_COLORS = { 金: '#ffd700', 木: '#4ad06a', 水: '#6b9fff', 火: '#e05555', 土: '#b08060' };
const WU_CLASS  = { 金: 'wu-metal', 木: 'wu-wood', 水: 'wu-water', 火: 'wu-fire', 土: 'wu-earth' };

// 日志色
const LOG_CLASS = { gold: 'log-gold', red: 'log-red', blue: 'log-blue', green: 'log-green', white: 'log-white' };


/* ================================================================
 *  DOM 工具
 * ================================================================ */

const D = {
  /** 创建元素 + class(es) */
  el(tag, cls, attrs = {}) {
    const e = document.createElement(tag);
    if (cls) {
      const classes = cls.split(' ').filter(Boolean);
      classes.forEach(c => e.classList.add(c));
    }
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'data') Object.entries(v).forEach(([dk, dv]) => e.dataset[dk] = dv);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    return e;
  },

  /** 快捷：创建文本节点 */
  txt(s) { return document.createTextNode(String(s)); },

  /** 快捷：创建进度条 */
  bar(cls, pct) {
    const outer = D.el('div', 'progress-bar');
    const fill  = D.el('div', `progress-fill ${cls}`, { style: `width:${Math.min(pct,100)}%` });
    outer.appendChild(fill);
    return outer;
  },

  /** 快捷：小进度条 + 标签行 */
  barRow(label, cls, current, max) {
    const row = D.el('div', 'progress-label');
    row.appendChild(D.el('span', 'name', { text: label }));
    const pct = max > 0 ? (current / max * 100) : 0;
    row.appendChild(D.el('span', 'value', { text: `${fmtNum(current)}/${fmtNum(max)}` }));
    const b = D.bar(cls, pct);
    b.classList.add('sm');
    const wrap = D.el('div', 'mini-bar');
    wrap.appendChild(row);
    wrap.appendChild(b);
    return wrap;
  },

  /** 空态提示 */
  empty(msg) { return D.el('div', 'log-empty', { text: msg || '暂无数据' }); },
};

/** 数值缩写 */
function fmtNum(n) {
  if (n == null || isNaN(n)) return '0';
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
  return String(Math.floor(n));
}

/** 灵石缩写 */
function fmtStones(n) {
  if (n == null) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e8) return (n / 1e8).toFixed(1) + '亿';
  if (abs >= 1e4) return (n / 1e4).toFixed(1) + '万';
  return String(Math.floor(n));
}


/* ================================================================
 *  UI 类
 * ================================================================ */

class UI {
  /**
   * @param {HTMLElement} container - 挂载容器（#game-container）
   * @param {Function}    onAction  - 操作回调 (action, payload) => void
   */
  constructor(container, onAction) {
    this.root     = container;
    this.onAction = onAction || (() => {});

    // 状态
    this.activeTab      = 'home';
    this.activeSubTab   = {};           // { cultivation: 'cultivation', backpack: 'bag', ... }
    this.attrExpanded   = false;
    this.logs           = [];           // [{ msg, type }]
    this.logExpanded    = false;        // 是否展开全部日志
    this.battleMode     = false;
    this.tutorial       = null;         // 引导状态
    this.tutorialPhase  = null;         // 'forced'|'optional'
    this.modalStack     = [];

    // 缓存常用引用
    this._els = {};  // { topbar, progress, attrPanel, content, bottombar, battle, modal, tutorial }
  }

  // ─── 读 GameState ───
  get GS()  { return window.GameState || {}; }
  get p()   { return this.GS.player; }
  get w()   { return this.GS.world; }
  get cult(){ return this.GS.cultivation; }
  get expl(){ return this.GS.exploration; }
  get comp(){ return this.GS.companions; }
  get evtM(){ return this.GS.eventsMgr; }
  get inv() { return this.GS.inventory; }
  get eq()  { return this.GS.equipment; }
  get cra() { return this.GS.crafting; }
  get bot() { return this.GS.bottle; }
  get skl() { return this.GS.skillsMgr; }
  get btl() { return this.GS.battle; }


  /* ================================================================
   *  初始化 — 构建全部 DOM
   * ================================================================ */
  init() {
    this.root.innerHTML = '';
    this.root.classList.add('app-container');

    // 藏内容区
    this._els.content   = D.el('div', 'main-content');
    this.root.appendChild(this._els.content);

    // 顶栏
    this._els.topbar    = this._buildTopBar();
    this.root.appendChild(this._els.topbar);

    // 底栏
    this._els.bottombar = this._buildBottomBar();
    this.root.appendChild(this._els.bottombar);

    this.bindEvents();
    this.renderProgressPanel();
    this.switchTab('home');
    this.updateRedDots();

    // 聆听 GameState 事件
    if (this.GS.bus) {
      this.GS.bus.on('day:advanced',  () => { this.updateRedDots(); this.refreshTopBar(); });
      this.GS.bus.on('battle:start',  (data) => this.showBattleUI(data));
      this.GS.bus.on('battle:end',    () => this.hideBattleUI());
      this.GS.bus.on('log:add',       (data) => this.addLog(data.msg, data.type || 'white'));
      this.GS.bus.on('player:updated', () => { this.refreshProgress(); this.refreshContent(); this.updateRedDots(); });
    }
  }


  /* ================================================================
   *  顶栏 (Top Bar)
   * ================================================================ */
  _buildTopBar() {
    const bar = D.el('div', 'topbar');

    // 左侧：日期 + 天气
    const left = D.el('div', 'topbar-left');
    this._els.topDate    = D.el('span', 'topbar-date');
    this._els.topWeather = D.el('span', 'topbar-weather');
    left.appendChild(this._els.topDate);
    left.appendChild(this._els.topWeather);

    // 中间：灵石 + 身份
    const center = D.el('div', 'topbar-center');
    this._els.topStones   = D.el('span', 'topbar-lingshi', { text: '💎 0' });
    this._els.topIdentity = D.el('span', 'topbar-identity');
    center.appendChild(this._els.topStones);
    center.appendChild(this._els.topIdentity);

    // 右侧：存档
    const right = D.el('div', 'topbar-right');
    this._els.topSave = D.el('span', 'topbar-save', { text: '💾' });
    this._els.topSave.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onAction('save', {});
    });
    right.appendChild(this._els.topSave);

    // 灵石点击：切换缩写
    this._els._stoneExpanded = false;
    this._els.topStones.addEventListener('click', (e) => {
      e.stopPropagation();
      this._els._stoneExpanded = !this._els._stoneExpanded;
      this.refreshTopBar();
    });

    bar.appendChild(left);
    bar.appendChild(center);
    bar.appendChild(right);
    return bar;
  }

  refreshTopBar() {
    const p = this.p;
    const w = this.w;
    // 日期
    if (w) {
      const dateStr = w.getDateString ? w.getDateString() : `第${this.GS.gameDay || 0}天`;
      const weather = w.currentWeather ? w.currentWeather() : { icon: '☀️', desc: '晴' };
      this._els.topDate.textContent    = dateStr;
      this._els.topWeather.textContent = `${weather.icon || ''} ${weather.desc || ''}`;
      this._els.topWeather.setAttribute('title', [
        w.seasonName ? w.seasonName() : '',
        weather.desc || '',
      ].filter(Boolean).join(' · '));
    } else {
      this._els.topDate.textContent    = '游戏未开始';
      this._els.topWeather.textContent = '';
    }

    // 灵石
    const stones = p ? (p.spiritStones || 0) : 0;
    this._els.topStones.textContent = this._els._stoneExpanded
      ? `💎 ${stones.toLocaleString()}`
      : `💎 ${fmtStones(stones)}`;

    // 身份
    if (p) {
      const gender = p.gender || '男';
      const age    = p.age || (w ? w.getAge ? w.getAge() : 18 : 18);
      this._els.topIdentity.textContent = `${p.name || '无名'}·${gender}·${age}岁`;
    } else {
      this._els.topIdentity.textContent = '';
    }
  }


  /* ================================================================
   *  进度条 + 属性面板（折叠/展开）
   * ================================================================ */
  refreshProgressPanel() {
    // 移除旧的进度面板
    if (this._els.progressWrap) this._els.progressWrap.remove();

    const wrap = D.el('div');
    wrap.id = 'progress-area';

    const p = this.p;
    if (!p) { this._els.progressWrap = wrap; this._els.content.prepend(wrap); return; }

    // ── 折叠态 ──
    const collapsed = D.el('div', 'attr-panel-collapsed');
    if (this.attrExpanded) collapsed.classList.add('expanded');

    collapsed.addEventListener('click', () => this.toggleAttrPanel());

    // 境界
    const realmEl = D.el('div', 'attr-realm',
      { html: `${p.fullTitle || p.realm || '凡人'}<span class="stage">${p.subStage || ''}</span>` });
    collapsed.appendChild(realmEl);

    // 修为条
    const req = p.getCultivationRequirement ? p.getCultivationRequirement() : 1;
    const cultPct = req > 0 ? ((p.cultivation || 0) / req * 100) : 0;
    const cultBar = D.barRow('修为', 'cultivation', p.cultivation || 0, req);
    collapsed.appendChild(cultBar);

    // 三小条
    const barRow = D.el('div', 'attr-bar-row');
    barRow.appendChild(D.barRow('气血', 'hp', p.hpMax || 100, p.hpMax || 100));
    barRow.appendChild(D.barRow('灵力', 'mp', p.mpMax || 50, p.mpMax || 50));
    barRow.appendChild(D.barRow('神识', 'sp', p.sp || 10, (p.spMax || p.sp || 10)));
    collapsed.appendChild(barRow);

    // 寿元
    const life = D.el('div', 'attr-lifetime', { text: `寿元：${fmtNum(p.lifespan || 100)} 年` });
    collapsed.appendChild(life);

    // 折叠按钮
    const toggle = D.el('span', 'attr-toggle', { text: '▼' });
    collapsed.appendChild(toggle);

    wrap.appendChild(collapsed);

    // ── 展开态（3卡片） ──
    const expanded = D.el('div', `attr-panel-expanded${this.attrExpanded ? ' open' : ''}`);
    expanded.appendChild(this._buildAttrCard1()); // 战斗属性
    expanded.appendChild(this._buildAttrCard2()); // 天赋属性
    expanded.appendChild(this._buildAttrCard3()); // 状态信息
    const footer = D.el('div', 'attr-panel-footer');
    const collapseBtn = D.el('span', 'collapse-btn', { text: '收起 ▲' });
    collapseBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleAttrPanel(); });
    footer.appendChild(collapseBtn);
    expanded.appendChild(footer);
    wrap.appendChild(expanded);

    this._els.progressWrap = wrap;
    this._els.content.prepend(wrap);
  }

  /** 战斗属性卡片 */
  _buildAttrCard1() {
    const card = D.el('div', 'attr-card');
    card.appendChild(D.el('div', 'attr-card-title', { text: '战斗属性' }));
    const p = this.p;
    if (!p) return card;

    const rows = [
      ['攻击', fmtNum(p.atk || 0), null, null],
      ['防御', fmtNum(p.def || 0), null, null],
      ['气血', fmtNum(p.hpMax || 0), null, null],
      ['灵力', fmtNum(p.mpMax || 0), null, null],
      ['神识', fmtNum(p.sp || 0), null, null],
      ['速度', (p.spd || 100), null, null],
    ];
    rows.forEach(([name, current, delta, deltaCls]) => {
      const row = D.el('div', 'attr-row');
      row.appendChild(D.el('span', 'attr-name', { text: name }));
      row.appendChild(D.el('span', 'attr-current', { text: String(current) }));
      if (delta != null) {
        const d = D.el('span', `attr-delta ${deltaCls || ''}`, { text: (delta > 0 ? '+' : '') + delta });
        row.appendChild(d);
      }
      card.appendChild(row);
    });

    // 暴击率 / 闪避率 / 灵力恢复
    const crit  = p.critRate  ? (p.critRate  * 100).toFixed(1) + '%' : '0%';
    const dodge = p.dodgeRate ? (p.dodgeRate * 100).toFixed(1) + '%' : '0%';
    const regen  = p.mpRegen   ? fmtNum(p.mpRegen) : '0';
    const ext = [
      ['暴击率', crit],
      ['闪避率', dodge],
      ['灵力恢复/回合', regen],
    ];
    ext.forEach(([name, val]) => {
      const row = D.el('div', 'attr-row');
      row.appendChild(D.el('span', 'attr-name', { text: name }));
      row.appendChild(D.el('span', 'attr-current', { text: val }));
      card.appendChild(row);
    });

    return card;
  }

  /** 天赋属性卡片 */
  _buildAttrCard2() {
    const card = D.el('div', 'attr-card');
    card.appendChild(D.el('div', 'attr-card-title', { text: '天赋属性' }));
    const p = this.p;
    if (!p) return card;

    const ext = [
      ['悟性', fmtNum(p.wisdom || 0)],
      ['机缘', fmtNum(p.luck || 0)],
      ['灵根', p.rootName || '未知'],
      ['修炼倍率', (p.cultivateMul || 1).toFixed(1) + 'x'],
    ];
    ext.forEach(([name, val]) => {
      const row = D.el('div', 'attr-row');
      row.appendChild(D.el('span', 'attr-name', { text: name }));
      row.appendChild(D.el('span', 'attr-current', { text: String(val) }));
      card.appendChild(row);
    });

    // 五行
    if (p.elements) {
      const wx = D.el('div', 'wuxing-row');
      const EL = ['金','木','水','火','土'];
      EL.forEach(el => {
        const v = p.elements[el] || 0;
        const item = D.el('div', 'wuxing-item');
        item.appendChild(D.el('span', 'wu-label', { text: el, style: `color:${WU_COLORS[el]}` }));
        const barWrap = D.el('div', 'wu-bar');
        barWrap.appendChild(D.el('div', `wu-fill ${WU_CLASS[el]}`, { style: `width:${v}%` }));
        item.appendChild(barWrap);
        item.appendChild(D.el('span', 'wu-value', { text: v + '%' }));
        wx.appendChild(item);
      });
      card.appendChild(wx);
    }

    // 名望
    const fame = D.el('div', 'attr-row');
    fame.appendChild(D.el('span', 'attr-name', { text: '名望' }));
    const rVal = p.righteousFame || 0;
    const dVal = p.demonicFame || 0;
    fame.appendChild(D.el('span', 'attr-current', { text: `正${rVal>=0?'+':''}${rVal} 魔${dVal>=0?'+':''}${dVal}` }));
    card.appendChild(fame);

    return card;
  }

  /** 状态信息卡片 */
  _buildAttrCard3() {
    const card = D.el('div', 'attr-card');
    card.appendChild(D.el('div', 'attr-card-title', { text: '状态信息' }));
    const p = this.p;
    if (!p) return card;

    // 功法/法宝计数
    const skillsCount  = this.skl ? (this.skl.getAll ? this.skl.getAll().length : 0) : 0;
    const equipsCount  = this.eq  ? (this.eq.getAll ? this.eq.getAll().length : 0) : 0;
    // 背包
    const bagCount     = this.inv ? (this.inv.count ? this.inv.count() : 0) : 0;
    const bagWeight    = this.inv ? (this.inv.totalWeight ? this.inv.totalWeight() : 0) : 0;
    const maxWeight    = p.carryWeight || 50;

    // 丹毒
    const toxicity = this.cra ? (this.cra.toxicity || 0) : 0;
    const toxBar = D.bar('dandu', toxicity > 100 ? 100 : toxicity);
    toxBar.classList.add('xs');

    const items = [
      ['功法', `${skillsCount} 部`],
      ['法宝', `${equipsCount} 件`],
      ['负重', `${bagWeight}/${fmtNum(maxWeight)}`],
    ];
    items.forEach(([name, val]) => {
      const row = D.el('div', 'attr-row');
      row.appendChild(D.el('span', 'attr-name', { text: name }));
      row.appendChild(D.el('span', 'attr-current', { text: val }));
      card.appendChild(row);
    });

    // 丹毒
    const toxRow = D.el('div', 'attr-row', { style: 'margin-top:4px' });
    toxRow.appendChild(D.el('span', 'attr-name', { text: '丹毒' }));
    const toxWrap = D.el('span', 'attr-mini-bar');
    const toxLbl  = D.el('span', 'progress-label');
    toxLbl.appendChild(D.el('span', 'name'));
    toxLbl.appendChild(D.el('span', 'value', { text: toxicity }));
    toxWrap.appendChild(toxLbl);
    toxWrap.appendChild(toxBar);
    toxRow.appendChild(toxWrap);
    card.appendChild(toxRow);

    // Buff / Debuff
    if (this.GS.activeBuffs && this.GS.activeBuffs.length) {
      const buffRow = D.el('div', 'attr-row');
      buffRow.appendChild(D.el('span', 'attr-name', { text: '增益' }));
      buffRow.appendChild(D.el('span', 'attr-current', { text: this.GS.activeBuffs.map(b => b.name).join(', ') }));
      card.appendChild(buffRow);
    }

    const tag = D.el('span', 'status-tag normal', { text: '正常' });
    const tagRow = D.el('div', 'attr-row');
    tagRow.appendChild(D.el('span', 'attr-name', { text: '状态' }));
    tagRow.appendChild(tag);
    card.appendChild(tagRow);

    return card;
  }

  refreshProgress() { this.refreshProgressPanel(); }

  toggleAttrPanel() {
    this.attrExpanded = !this.attrExpanded;
    if (this._els.progressWrap) {
      const collapsed = this._els.progressWrap.querySelector('.attr-panel-collapsed');
      const expanded  = this._els.progressWrap.querySelector('.attr-panel-expanded');
      if (collapsed) collapsed.classList.toggle('expanded', this.attrExpanded);
      if (expanded)  expanded.classList.toggle('open', this.attrExpanded);
    }
  }


  /* ================================================================
   *  底栏 (Bottom Bar)
   * ================================================================ */
  _buildBottomBar() {
    const bar = D.el('div', 'bottombar');

    TAB_CFG.forEach((cfg, idx) => {
      const item = D.el('div', `tab-item${idx === 0 ? ' active' : ''}`, {
        data: { tab: cfg.id, index: String(idx) },
      });
      const icon = D.el('span', 'tab-icon', { text: cfg.icon });
      const label = D.el('span', 'tab-label', { text: cfg.label });
      item.appendChild(icon);
      item.appendChild(label);
      // 红点
      const badge = D.el('div', 'tab-badge hidden');
      item.appendChild(badge);

      item.addEventListener('click', () => this.switchTab(cfg.id));
      bar.appendChild(item);
    });

    return bar;
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    this.activeSubTab[tabId] = this.activeSubTab[tabId] || this._defaultSubTab(tabId);

    // 更新底栏选中态
    const allTabs = this._els.bottombar.querySelectorAll('.tab-item');
    allTabs.forEach((t, i) => {
      t.classList.toggle('active', i === TAB_CFG.findIndex(c => c.id === tabId));
    });

    this.renderContent();
    this.updateRedDots();
  }

  _defaultSubTab(tabId) {
    const map = {
      cultivation: 'cultivation',  exploration: 'map',
      backpack: 'bag',            more: 'sect',
    };
    return map[tabId] || '';
  }


  /* ================================================================
   *  内容渲染 — 主路由
   * ================================================================ */
  renderContent() {
    // 清空内容区（保留 progressWrap）
    const content = this._els.content;
    // 移除除 progress-area 以外的所有子节点
    Array.from(content.children).forEach(c => {
      if (c.id !== 'progress-area') c.remove();
    });

    const wrap = D.el('div', 'tab-content');
    const id = this.activeTab;

    switch (id) {
      case 'home':          this._renderHome(wrap);        break;
      case 'cultivation':   this._renderCultivation(wrap); break;
      case 'exploration':   this._renderExploration(wrap); break;
      case 'backpack':      this._renderBackpack(wrap);    break;
      case 'more':          this._renderMore(wrap);        break;
      default:              this._renderHome(wrap);
    }

    content.appendChild(wrap);
  }

  refreshContent() { this.renderContent(); }


  /* ================================================================
   *  🏠 首页
   * ================================================================ */
  _renderHome(wrap) {
    // ── 修炼卡片 ──
    const cultCard = D.el('div', 'card cultivation-card');
    const p = this.p;
    if (p) {
      cultCard.appendChild(D.el('div', 'card-title', { text: '修炼进度' }));
      const speed = D.el('div', 'speed', { text: `修炼速度：${(p.cultivateSpeed || 1).toFixed(2)}x` });
      cultCard.appendChild(speed);

      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : 1;
      const bar = D.barRow('修为积累', 'cultivation', p.cultivation || 0, req);
      cultCard.appendChild(bar);

      const info = D.el('div', 'progress-info');
      info.appendChild(D.el('span', '', { text: `${p.fullTitle || '凡人'}` }));
      const nextReq = req > (p.cultivation || 0) ? `还需 ${fmtNum(req - (p.cultivation||0))}` : '可突破';
      info.appendChild(D.el('span', '', { text: nextReq }));
      cultCard.appendChild(info);

      // ETA
      const dailyGain = Math.floor((p.cultivateSpeed || 1) * 10);
      const remaining = Math.max(0, req - (p.cultivation || 0));
      const etaDays = dailyGain > 0 ? Math.ceil(remaining / dailyGain) : '∞';
      cultCard.appendChild(D.el('div', 'eta', { text: `预计还需修炼 ${etaDays} 天` }));
    } else {
      cultCard.appendChild(D.el('div', 'card-title', { text: '尚未创建角色' }));
    }
    wrap.appendChild(cultCard);

    // ── 快捷操作 ──
    const qa = D.el('div', 'quick-actions');
    const actions = [
      { icon: '🧘', label: '打坐修炼', action: 'cultivate', cond: true },
      { icon: '🗺️', label: '探索',    action: 'explore',    cond: true },
      { icon: '💊', label: '炼丹',    action: 'alchemy',    cond: !!(this.cra) },
      { icon: '⚔️', label: '切磋',    action: 'battle',     cond: true },
    ];
    actions.forEach(a => {
      const btn = D.el('div', `quick-action-btn${a.cond ? '' : ' disabled'}`);
      btn.appendChild(D.el('span', 'qa-icon', { text: a.icon }));
      btn.appendChild(D.el('span', 'qa-label', { text: a.label }));
      btn.addEventListener('click', () => { if (a.cond) this.onAction(a.action, {}); });
      qa.appendChild(btn);
    });
    wrap.appendChild(qa);

    // ── 快速状态 ──
    const statusCard = D.el('div', 'card');
    statusCard.appendChild(D.el('div', 'card-title', { text: '快速状态' }));
    if (p) {
      const sts = [
        ['修为', `${p.fullTitle || '凡人'}`, 'active'],
        ['寿元', `${fmtNum(p.lifespan || 100)} 年`, (p.lifespan||0) < 20 ? 'expired' : 'active'],
        ['灵石', fmtNum(p.spiritStones || 0), 'active'],
      ];
      sts.forEach(([name, val, cls]) => {
        const r = D.el('div', 'status-row');
        r.appendChild(D.el('span', 'st-name', { text: name }));
        r.appendChild(D.el('span', `st-value ${cls}`, { text: val }));
        statusCard.appendChild(r);
      });

      // 如果有修炼/灵植在跑，显示CD状态
      if (this.cult && this.cult._running) {
        const r = D.el('div', 'status-row');
        r.appendChild(D.el('span', 'st-name', { text: '修炼' }));
        r.appendChild(D.el('span', 'st-value cooldown', { text: `进行中 (剩余${this.cult._daysLeft||0}天)` }));
        statusCard.appendChild(r);
      }
    }
    wrap.appendChild(statusCard);

    // ── 事件提醒 ──
    const eventCard = D.el('div', 'card');
    eventCard.appendChild(D.el('div', 'card-title', { text: '事件提醒' }));
    const events = this._gatherEvents();
    if (events.length) {
      events.slice(0, 5).forEach(ev => {
        const item = D.el('div', 'event-item', { data: { action: ev.action || '' } });
        item.appendChild(D.el('span', 'ev-icon', { text: ev.icon || '📌' }));
        item.appendChild(D.el('span', 'ev-name', { text: ev.name }));
        const timeCls = ev.urgent ? 'urgent' : (ev.soon ? 'soon' : '');
        item.appendChild(D.el('span', `ev-time ${timeCls}`, { text: ev.timeStr || '' }));
        if (ev.tag) item.appendChild(D.el('span', 'ev-tag', { text: ev.tag }));
        item.addEventListener('click', () => { if (ev.action) this.onAction(ev.action, ev.payload || {}); });
        eventCard.appendChild(item);
      });
    } else {
      eventCard.appendChild(D.el('div', 'event-item empty', { text: '— 暂无待办事项 —' }));
    }
    wrap.appendChild(eventCard);

    // ── 日志 ──
    this._renderLogArea(wrap);
  }

  _gatherEvents() {
    const events = [];
    const p = this.p;
    if (!p) return events;

    // 寿元告急
    if ((p.lifespan || 100) < 30) {
      events.push({ icon: '⚠️', name: '寿元告急', timeStr: `${fmtNum(p.lifespan)}年`, tag: '紧急', urgent: true, action: 'lifespan' });
    }
    // 可突破
    if (p.subStageIndex >= 3 && p.realmIndex < 14) {
      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : Infinity;
      if ((p.cultivation || 0) >= req) {
        events.push({ icon: '⬆️', name: '可以突破大境界', timeStr: '就绪', urgent: false, soon: true, action: 'breakthrough' });
      }
    } else if (p.subStageIndex < 3) {
      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : Infinity;
      if ((p.cultivation || 0) >= req) {
        events.push({ icon: '⬆️', name: '可以突破小境界', timeStr: '就绪', action: 'breakthroughSub' });
      }
    }
    // 秘境开启提示（简化）
    if (this.expl && this.expl.getOpenDungeons) {
      const dungeons = this.expl.getOpenDungeons(p);
      if (dungeons && dungeons.length) {
        dungeons.forEach(d => {
          events.push({ icon: '🏯', name: `秘境：${d.name || d} 可进入`, timeStr: '开放中', soon: true, action: 'dungeon', payload: { dungeon: d } });
        });
      }
    }
    // 掌天瓶绿液满
    if (this.bot && this.bot.liquid >= (this.bot.maxLiquid || 100)) {
      events.push({ icon: '🧪', name: '掌天瓶绿液已满', timeStr: '', action: 'bottle' });
    }

    return events;
  }


  /* ================================================================
   *  🧘 修炼 Tab
   * ================================================================ */
  _renderCultivation(wrap) {
    const subTabs = [
      { id: 'cultivation',  label: '修为' },
      { id: 'divineSense',  label: '神识' },
      { id: 'bodyRefine',   label: '炼体' },
      { id: 'breakthrough', label: '突破' },
    ];
    const sub = this.activeSubTab['cultivation'] || 'cultivation';
    wrap.appendChild(this._buildSubTabNav(subTabs, sub, 'cultivation'));

    switch (sub) {
      case 'cultivation':  this._renderCultSub(wrap);  break;
      case 'divineSense':  this._renderDivineSense(wrap); break;
      case 'bodyRefine':   this._renderBodyRefine(wrap);  break;
      case 'breakthrough': this._renderBreakthrough(wrap); break;
    }
  }

  _renderCultSub(wrap) {
    const p = this.p;
    if (!p) { wrap.appendChild(D.empty('请先创建角色')); return; }

    // 修炼方式
    const methods = [
      { icon: '🧘', name: '打坐',        desc: '单次1~60天，安全稳定',  days: '1-60天',  action: 'cultivateSit' },
      { icon: '🏔️', name: '闭关',       desc: '单次7~365天，修为获取+20%', days: '7-365天', action: 'cultivateSeclusion' },
      { icon: '🌀', name: '周天运转',    desc: '单次可调，效率高但消耗灵力', days: '1-30天',  action: 'cultivateCycle' },
    ];
    methods.forEach(m => {
      const card = D.el('div', 'method-card');
      const hdr = D.el('div', 'method-header');
      hdr.appendChild(D.el('span', 'method-icon', { text: m.icon }));
      hdr.appendChild(D.el('span', 'method-name', { text: m.name }));
      card.appendChild(hdr);
      card.appendChild(D.el('div', 'method-info', { html: `${m.desc}<br><span class="risk">耗时：${m.days}</span>` }));
      const footer = D.el('div', 'method-footer');
      footer.appendChild(D.el('span', 'method-status available', { text: '可修炼' }));
      const btn = D.el('button', 'btn btn-primary', { text: '开始' });
      btn.addEventListener('click', () => this.onAction(m.action, {}));
      footer.appendChild(btn);
      card.appendChild(footer);
      wrap.appendChild(card);
    });

    // 修炼速度明细
    const speedCard = D.el('div', 'card');
    speedCard.appendChild(D.el('div', 'card-title', { text: '修炼速度明细' }));
    const sd = D.el('div', 'speed-detail');
    const rows = [
      ['基础速度', '1.00x'],
      ['灵根加成', `${(p.cultivateMul || 1).toFixed(1)}x`],
      ['悟性加成', `${(1 + (p.wisdom||0) * 0.005).toFixed(2)}x`],
    ];
    rows.forEach(([name, val]) => {
      const r = D.el('div', 'speed-detail-row');
      r.appendChild(D.el('span', 'sd-name', { text: name }));
      r.appendChild(D.el('span', 'sd-value', { text: val }));
      sd.appendChild(r);
    });
    const final = D.el('div', 'speed-detail-row');
    final.appendChild(D.el('span', 'sd-name', { text: '最终速度' }));
    final.appendChild(D.el('span', 'sd-final', { text: (p.cultivateSpeed || 1).toFixed(2) + 'x' }));
    sd.appendChild(final);
    speedCard.appendChild(sd);
    wrap.appendChild(speedCard);

    // 聚灵阵/修炼地点
    if (this.cult) {
      const locCard = D.el('div', 'card');
      locCard.appendChild(D.el('div', 'card-title', { text: '修炼环境' }));
      const loc = this.cult.currentLocation || { name: '无' };
      const arr = this.cult.currentArray || { name: '无' };
      locCard.appendChild(D.el('div', 'attr-row',
        { html: '<span class="attr-name">地点</span><span class="attr-current">' + (loc.name||'无') + '</span>' }));
      locCard.appendChild(D.el('div', 'attr-row',
        { html: '<span class="attr-name">聚灵阵</span><span class="attr-current">' + (arr.name||'无') + '</span>' }));
      wrap.appendChild(locCard);
    }
  }

  _renderDivineSense(wrap) {
    const p = this.p;
    if (!p) { wrap.appendChild(D.empty('请先创建角色')); return; }

    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '神识淬炼' }));
    card.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">当前神识</span><span class="attr-current">${fmtNum(p.sp||0)}</span>` }));

    if (this.cult && this.cult.divineSense) {
      const ds = this.cult.divineSense;
      const cdReady = ds.cooldownRemaining ? ds.cooldownRemaining <= 0 : true;
      card.appendChild(D.el('hr', 'card-divider'));
      const footer = D.el('div', 'method-footer');
      footer.appendChild(D.el('span', `method-status ${cdReady ? 'available' : 'cooldown'}`,
        { text: cdReady ? '可淬炼' : `冷却中 ${ds.cooldownRemaining || 0}天` }));
      const btn = D.el('button', `btn btn-primary${cdReady ? '' : ' disabled'}`, { text: '神识淬炼' });
      btn.addEventListener('click', () => { if (cdReady) this.onAction('divineSense', {}); });
      footer.appendChild(btn);
      card.appendChild(footer);
    }
    wrap.appendChild(card);
  }

  _renderBodyRefine(wrap) {
    const p = this.p;
    if (!p) { wrap.appendChild(D.empty('请先创建角色')); return; }

    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '炼体' }));
    card.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">气血</span><span class="attr-current">${fmtNum(p.hpMax||0)}</span>` }));
    card.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">防御</span><span class="attr-current">${fmtNum(p.def||0)}</span>` }));

    if (this.cult && this.cult.bodyRefine) {
      const br = this.cult.bodyRefine;
      const cdReady = br.cooldownRemaining ? br.cooldownRemaining <= 0 : true;
      card.appendChild(D.el('hr', 'card-divider'));
      const footer = D.el('div', 'method-footer');
      footer.appendChild(D.el('span', `method-status ${cdReady ? 'available' : 'cooldown'}`,
        { text: cdReady ? '可炼体' : `冷却中 ${br.cooldownRemaining || 0}天` }));
      const btn = D.el('button', `btn btn-primary${cdReady ? '' : ' disabled'}`, { text: '炼体' });
      btn.addEventListener('click', () => { if (cdReady) this.onAction('bodyRefine', {}); });
      footer.appendChild(btn);
      card.appendChild(footer);
    }
    wrap.appendChild(card);
  }

  _renderBreakthrough(wrap) {
    const p = this.p;
    if (!p) { wrap.appendChild(D.empty('请先创建角色')); return; }

    const canSub = p.subStageIndex < 3;
    const canRealm = p.subStageIndex >= 3 && p.realmIndex < 14;

    if (canSub) {
      const card = D.el('div', 'card');
      card.appendChild(D.el('div', 'card-title', { text: '小境界突破' }));
      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : Infinity;
      const met = (p.cultivation || 0) >= req;
      card.appendChild(D.el('div', 'attr-row',
        { html: `<span class="attr-name">当前</span><span class="attr-current">${p.fullTitle || '凡人'}</span>` }));
      card.appendChild(D.el('div', 'attr-row',
        { html: `<span class="attr-name">修为需求</span><span class="attr-current">${fmtNum(req)} (${fmtNum(p.cultivation||0)}/${fmtNum(req)})</span>` }));

      const checks = [
        { label: '修为达标', pass: met, val: met ? '✅ 已达标' : '❌ 未达标' },
      ];
      checks.forEach(c => {
        const row = D.el('div', `check-row ${c.pass ? 'pass' : 'fail'}`);
        row.appendChild(D.el('span', 'check-icon', { text: c.pass ? '✅' : '❌' }));
        row.appendChild(D.el('span', 'check-name', { text: c.label }));
        row.appendChild(D.el('span', 'check-value', { text: c.val }));
        card.appendChild(row);
      });

      const btn = D.el('button', `btn btn-primary btn-block${met ? '' : ' disabled'}`, { text: '突破小境界' });
      btn.addEventListener('click', () => { if (met) this.onAction('breakthroughSub', {}); });
      card.appendChild(btn);
      wrap.appendChild(card);
    }

    if (canRealm) {
      const card = D.el('div', 'card');
      card.appendChild(D.el('div', 'card-title', { text: '大境界突破' }));
      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : Infinity;
      const cost = p.realm ? ((window.BREAKTHROUGH_COST && window.BREAKTHROUGH_COST[p.realm]) ? window.BREAKTHROUGH_COST[p.realm].spiritStones : 0) : 0;
      const metCult = (p.cultivation || 0) >= req;
      const metStones = (p.spiritStones || 0) >= cost;
      const metMP = (p.mpMax || 0) >= (p.mpMax || 100); // 灵力满

      card.appendChild(D.el('div', 'attr-row',
        { html: `<span class="attr-name">目标</span><span class="attr-current">从 ${p.realm||'?'} 突破</span>` }));

      const rate = p.calculateBreakthroughRate ? (p.calculateBreakthroughRate({ hasPill: true }) * 100).toFixed(1) : '?';
      card.appendChild(D.el('div', 'attr-row',
        { html: `<span class="attr-name">成功率</span><span class="attr-current">${rate}%</span>` }));

      const checks = [
        { label: '修为达标', pass: metCult,  val: fmtNum(p.cultivation||0) + '/' + fmtNum(req) },
        { label: '灵石',   pass: metStones, val: fmtNum(p.spiritStones||0) + '/' + fmtNum(cost) },
      ];
      checks.forEach(c => {
        const row = D.el('div', `check-row ${c.pass ? 'pass' : 'fail'}`);
        row.appendChild(D.el('span', 'check-icon', { text: c.pass ? '✅' : '❌' }));
        row.appendChild(D.el('span', 'check-name', { text: c.label }));
        row.appendChild(D.el('span', 'check-value', { text: c.val }));
        card.appendChild(row);
      });

      const allMet = metCult && metStones;
      const btn = D.el('button', `btn btn-danger btn-block${allMet ? '' : ' disabled'}`, { text: '突破大境界' });
      btn.addEventListener('click', () => { if (allMet) this.onAction('breakthroughRealm', { hasPill: true }); });
      card.appendChild(btn);
      wrap.appendChild(card);
    }

    if (!canSub && !canRealm) {
      wrap.appendChild(D.el('div', 'card', { html: '<div class="text-center text-dim">已达当前上限</div>' }));
    }
  }


  /* ================================================================
   *  🗺️ 探索 Tab
   * ================================================================ */
  _renderExploration(wrap) {
    const subTabs = [
      { id: 'map',      label: '地图' },
      { id: 'explore',  label: '探索' },
    ];
    const sub = this.activeSubTab['exploration'] || 'map';
    wrap.appendChild(this._buildSubTabNav(subTabs, sub, 'exploration'));

    switch (sub) {
      case 'map':     this._renderMapTab(wrap);     break;
      case 'explore': this._renderExploreTab(wrap); break;
    }
  }

  _renderMapTab(wrap) {
    const p = this.p;
    const w = this.w;

    if (!w) { wrap.appendChild(D.empty('世界模块未加载')); return; }

    const currentRegion = w.currentRegion ? w.currentRegion() : '未知区域';
    const info = D.el('div', 'card');
    info.appendChild(D.el('div', 'card-title', { text: `当前位置：${currentRegion}` }));
    info.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">境界</span><span class="attr-current">${p ? p.fullTitle : '?'}</span>` }));
    wrap.appendChild(info);

    // 地图节点列表
    if (w.getAvailableNodes) {
      const nodes = w.getAvailableNodes(p);
      if (nodes && nodes.length) {
        const nodeList = D.el('div', 'card');
        nodeList.appendChild(D.el('div', 'card-title', { text: '可前往地点' }));
        nodes.forEach(n => {
          const node = D.el('div', 'map-node');
          const isCur = n.name === currentRegion;
          const nodeEl = D.el('div', `node-name${isCur ? ' node-current' : ''}`, { text: n.name });
          node.appendChild(nodeEl);
          node.addEventListener('click', () => this.onAction('travel', { node: n }));
          nodeList.appendChild(node);
        });
        wrap.appendChild(nodeList);
      }
    }

    // 秘境入口
    if (w.getDungeonEntries) {
      const entries = w.getDungeonEntries(p);
      if (entries && entries.length) {
        const dCard = D.el('div', 'card');
        dCard.appendChild(D.el('div', 'card-title', { text: '秘境入口' }));
        entries.forEach(d => {
          const row = D.el('div', 'event-item', { data: { action: 'dungeon', payload: JSON.stringify(d) } });
          row.appendChild(D.el('span', 'ev-icon', { text: '🏯' }));
          row.appendChild(D.el('span', 'ev-name', { text: d.name }));
          row.appendChild(D.el('span', 'ev-time', { text: d.status || '开放' }));
          row.addEventListener('click', () => this.onAction('dungeon', { dungeon: d }));
          dCard.appendChild(row);
        });
        wrap.appendChild(dCard);
      }
    }
  }

  _renderExploreTab(wrap) {
    const p = this.p;
    if (!p) { wrap.appendChild(D.empty('请先创建角色')); return; }

    // 探索按钮
    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '探索当前区域' }));
    card.appendChild(D.el('div', 'method-info',
      { html: '消耗天数探索当前区域，有机率触发随机事件、战斗、获得材料。<br><span class="risk">境界越高探索耗时越长</span>' }));
    const btn = D.el('button', 'btn btn-primary btn-block', { text: '开始探索' });
    btn.addEventListener('click', () => this.onAction('explore', {}));
    card.appendChild(btn);
    wrap.appendChild(card);

    // 当前事件（如果有）
    if (this.evtM && this.evtM.currentEvent) {
      const ev = this.evtM.currentEvent;
      const evCard = D.el('div', 'event-card');
      evCard.appendChild(D.el('div', 'event-desc', { text: ev.text || ev.name || '事件' }));
      if (ev.options && ev.options.length) {
        const optsWrap = D.el('div', 'event-options');
        ev.options.forEach(opt => {
          const optBtn = D.el('div', 'event-option', { text: opt.text || '选择' });
          optBtn.addEventListener('click', () => this.onAction('eventOption', { option: opt }));
          optsWrap.appendChild(optBtn);
        });
        evCard.appendChild(optsWrap);
      }
      wrap.appendChild(evCard);
    }

    // 区域探索度
    if (this.expl && this.expl.getRegionProgress) {
      const region = this.w ? this.w.currentRegion() : null;
      if (region) {
        const prog = this.expl.getRegionProgress(region);
        if (prog != null) {
          const pCard = D.el('div', 'card');
          pCard.appendChild(D.el('div', 'card-title', { text: `${region} 探索度` }));
          pCard.appendChild(D.bar('cultivation', prog));
          pCard.appendChild(D.el('div', 'text-right fs-sm text-dim mt-xs', { text: `${prog}%` }));
          wrap.appendChild(pCard);
        }
      }
    }
  }


  /* ================================================================
   *  🎒 背包 Tab
   * ================================================================ */
  _renderBackpack(wrap) {
    const subTabs = [
      { id: 'bag',       label: '背包' },
      { id: 'alchemy',   label: '炼丹' },
      { id: 'talisman',  label: '制符' },
      { id: 'artifact',  label: '法宝' },
      { id: 'beast',     label: '灵兽' },
      { id: 'puppet',    label: '傀儡' },
    ];
    const sub = this.activeSubTab['backpack'] || 'bag';
    wrap.appendChild(this._buildSubTabNav(subTabs, sub, 'backpack'));

    switch (sub) {
      case 'bag':       this._renderBagTab(wrap);      break;
      case 'alchemy':   this._renderAlchemyTab(wrap);  break;
      case 'talisman':  this._renderTalismanTab(wrap); break;
      case 'artifact':  this._renderArtifactTab(wrap); break;
      case 'beast':     this._renderBeastTab(wrap);    break;
      case 'puppet':    this._renderPuppetTab(wrap);   break;
    }
  }

  _renderBagTab(wrap) {
    const p = this.p;
    const inv = this.inv;

    const header = D.el('div', 'bag-header');
    header.appendChild(D.el('span', 'bag-title', { text: '背包' }));
    const weight = inv ? (inv.totalWeight ? inv.totalWeight() : 0) : 0;
    const maxW    = p ? (p.carryWeight || 50) : 50;
    header.appendChild(D.el('span', 'bag-load', { text: `${weight}/${fmtNum(maxW)} 斤` }));
    wrap.appendChild(header);

    if (!inv) { wrap.appendChild(D.empty('背包模块未加载')); return; }

    // 分类筛选
    const filterDiv = D.el('div', 'bag-filter');
    const categories = ['all','pill','talisman','weapon','material','quest','book','misc'];
    const catNames   = ['全部','丹药','符箓','武器','材料','任务','功法','杂项'];
    let filter = this._bagFilter || 'all';

    categories.forEach((cat, i) => {
      const tag = D.el('div', `filter-tag${cat===filter?' active':''}`, { text: catNames[i], data: { cat } });
      tag.addEventListener('click', () => { this._bagFilter = cat; this.renderContent(); });
      filterDiv.appendChild(tag);
    });
    wrap.appendChild(filterDiv);

    // 物品网格
    const grid = D.el('div', 'bag-grid');
    let items = inv.getAll ? inv.getAll() : [];
    if (filter !== 'all') {
      const typeMap = { pill:'丹药', talisman:'符箓', weapon:'法宝', material:'材料', quest:'任务', book:'功法', misc:'杂项' };
      items = items.filter(it => (it.type || it.category) === typeMap[filter]);
    }
    items.slice(0, 28).forEach(it => {
      const item = D.el('div', 'bag-item', { data: { id: it.id || it.name } });
      item.appendChild(D.el('span', 'item-icon', { text: it.icon || '📦' }));
      item.appendChild(D.el('span', 'item-name', { text: it.name || '?' }));
      if (it.count > 1) item.appendChild(D.el('span', 'item-count', { text: 'x' + it.count }));
      if (it.weight) item.appendChild(D.el('span', 'item-weight', { text: it.weight + '斤' }));
      item.addEventListener('click', () => this._showItemDetail(it));
      grid.appendChild(item);
    });
    wrap.appendChild(grid);
  }

  _showItemDetail(item) {
    const overlay = D.el('div', 'item-detail-overlay');
    const detail = D.el('div', 'item-detail');

    const header = D.el('div', 'item-header');
    header.appendChild(D.el('span', 'item-name', { text: item.name || '物品' }));
    header.appendChild(D.el('span', 'item-type', { text: item.type || item.category || '' }));
    detail.appendChild(header);

    const info = D.el('div', 'item-info');
    const lines = [];
    if (item.desc) lines.push(item.desc);
    if (item.effect) lines.push('效果：' + item.effect);
    if (item.count > 1) lines.push('数量：x' + item.count);
    if (item.weight) lines.push('重量：' + item.weight + ' 斤');
    info.innerHTML = lines.join('<br>');
    detail.appendChild(info);

    const actions = D.el('div', 'item-actions');
    if (item.type === '丹药' || item.category === '丹药') {
      const useBtn = D.el('button', 'btn btn-primary', { text: '使用' });
      useBtn.addEventListener('click', () => { this.onAction('useItem', { item }); overlay.remove(); });
      actions.appendChild(useBtn);
    }
    const closeBtn = D.el('button', 'btn btn-secondary', { text: '关闭' });
    closeBtn.addEventListener('click', () => overlay.remove());
    actions.appendChild(closeBtn);
    detail.appendChild(actions);

    overlay.appendChild(detail);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  _renderAlchemyTab(wrap) {
    if (!this.cra) { wrap.appendChild(D.empty('炼丹模块未加载')); return; }

    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '炼丹' }));
    const level = this.cra.getLevel ? this.cra.getLevel() : { title: '学徒', level: 1 };
    card.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">丹术</span><span class="attr-current">${level.title} Lv${level.level}</span>` }));
    card.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">丹毒</span><span class="attr-current">${this.cra.toxicity||0}</span>` }));

    const btn = D.el('button', 'btn btn-primary btn-block mt-md', { text: '打开丹炉' });
    btn.addEventListener('click', () => this.onAction('openAlchemy', {}));
    card.appendChild(btn);
    wrap.appendChild(card);

    // 丹方列表
    if (this.cra.getFormulas) {
      const formulas = this.cra.getFormulas(this.p);
      if (formulas && formulas.length) {
        const fCard = D.el('div', 'card');
        fCard.appendChild(D.el('div', 'card-title', { text: `可用丹方 (${formulas.length})` }));
        formulas.slice(0, 10).forEach(f => {
          const row = D.el('div', 'attr-row');
          row.appendChild(D.el('span', 'attr-name', { text: f.name }));
          row.appendChild(D.el('span', 'attr-current', { text: `Lv${f.level||1} ${f.cost||0}灵石` }));
          fCard.appendChild(row);
        });
        wrap.appendChild(fCard);
      }
    }
  }

  _renderTalismanTab(wrap) {
    if (!this.cra) { wrap.appendChild(D.empty('制符模块未加载')); return; }
    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '制符' }));
    const tl = this.cra.getTalismanLevel ? this.cra.getTalismanLevel() : { title: '学徒', level: 1 };
    card.appendChild(D.el('div', 'attr-row',
      { html: `<span class="attr-name">制符术</span><span class="attr-current">${tl.title} Lv${tl.level}</span>` }));
    const btn = D.el('button', 'btn btn-primary btn-block mt-md', { text: '开始制符' });
    btn.addEventListener('click', () => this.onAction('openTalisman', {}));
    card.appendChild(btn);
    wrap.appendChild(card);
  }

  _renderArtifactTab(wrap) {
    const eq = this.eq;
    if (!eq) { wrap.appendChild(D.empty('法宝模块未加载')); return; }

    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '法宝' }));
    const all = eq.getAll ? eq.getAll() : [];
    if (all.length) {
      all.slice(0, 8).forEach(a => {
        const row = D.el('div', 'attr-row');
        row.appendChild(D.el('span', 'attr-name', { text: a.name }));
        row.appendChild(D.el('span', 'attr-current', { text: `${a.rank || ''} ATK:${a.atk||0} DEF:${a.def||0}` }));
        card.appendChild(row);
      });
    } else {
      card.appendChild(D.el('div', 'text-center text-dim', { text: '暂无法宝' }));
    }
    const btn = D.el('button', 'btn btn-primary btn-block mt-md', { text: '炼制法宝' });
    btn.addEventListener('click', () => this.onAction('craftArtifact', {}));
    card.appendChild(btn);
    wrap.appendChild(card);
  }

  _renderBeastTab(wrap) {
    if (!this.comp) { wrap.appendChild(D.empty('灵兽模块未加载')); return; }
    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '灵兽' }));
    const beasts = this.comp.getBeasts ? this.comp.getBeasts() : [];
    if (beasts && beasts.length) {
      beasts.forEach(b => {
        const row = D.el('div', 'attr-row');
        row.appendChild(D.el('span', 'attr-name', { text: b.name }));
        row.appendChild(D.el('span', 'attr-current', { text: `${b.rank||''} Lv${b.level||1}` }));
        card.appendChild(row);
      });
    } else {
      card.appendChild(D.el('div', 'text-center text-dim', { text: '暂无灵兽' }));
    }
    wrap.appendChild(card);
  }

  _renderPuppetTab(wrap) {
    if (!this.comp) { wrap.appendChild(D.empty('傀儡模块未加载')); return; }
    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '傀儡' }));
    const puppets = this.comp.getPuppets ? this.comp.getPuppets() : [];
    if (puppets && puppets.length) {
      puppets.forEach(pu => {
        const row = D.el('div', 'attr-row');
        row.appendChild(D.el('span', 'attr-name', { text: pu.name }));
        row.appendChild(D.el('span', 'attr-current',
          { text: `${pu.rank||''} 灵力:${pu.energy||0}/${pu.maxEnergy||100}` }));
        card.appendChild(row);
      });
    } else {
      card.appendChild(D.el('div', 'text-center text-dim', { text: '暂无傀儡' }));
    }
    wrap.appendChild(card);
  }


  /* ================================================================
   *  ⚙️ 更多 Tab
   * ================================================================ */
  _renderMore(wrap) {
    const subTabs = [
      { id: 'sect',     label: '宗门' },
      { id: 'npc',      label: 'NPC' },
      { id: 'trade',    label: '交易' },
      { id: 'bottle',   label: '掌天瓶' },
      { id: 'settings', label: '设置' },
    ];
    const sub = this.activeSubTab['more'] || 'sect';
    wrap.appendChild(this._buildSubTabNav(subTabs, sub, 'more'));

    switch (sub) {
      case 'sect':     this._renderSectTab(wrap);     break;
      case 'npc':      this._renderNPCTab(wrap);      break;
      case 'trade':    this._renderTradeTab(wrap);    break;
      case 'bottle':   this._renderBottleTab(wrap);   break;
      case 'settings': this._renderSettingsTab(wrap); break;
    }
  }

  _renderSectTab(wrap) {
    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '宗门' }));
    if (this.comp && this.comp.getCurrentSect) {
      const sect = this.comp.getCurrentSect();
      if (sect) {
        card.appendChild(D.el('div', 'attr-row',
          { html: `<span class="attr-name">门派</span><span class="attr-current">${sect.name||'无'}</span>` }));
        card.appendChild(D.el('div', 'attr-row',
          { html: `<span class="attr-name">职位</span><span class="attr-current">${sect.rank||'弟子'}</span>` }));
        card.appendChild(D.el('div', 'attr-row',
          { html: `<span class="attr-name">贡献</span><span class="attr-current">${sect.contribution||0}</span>` }));
      } else {
        card.appendChild(D.el('div', 'text-center text-dim', { text: '未加入宗门' }));
      }
    } else {
      card.appendChild(D.empty('宗门模块未加载'));
    }
    wrap.appendChild(card);

    // 势力列表
    if (this.comp && this.comp.getSects) {
      const sects = this.comp.getSects(this.p);
      if (sects && sects.length) {
        const sCard = D.el('div', 'card');
        sCard.appendChild(D.el('div', 'card-title', { text: '可加入势力' }));
        sects.slice(0, 8).forEach(s => {
          const row = D.el('div', 'attr-row');
          row.appendChild(D.el('span', 'attr-name', { text: s.name }));
          row.appendChild(D.el('span', 'attr-current', { text: s.location || '' }));
          sCard.appendChild(row);
        });
        wrap.appendChild(sCard);
      }
    }
  }

  _renderNPCTab(wrap) {
    const npcs = this.comp ? (this.comp.getNPCs ? this.comp.getNPCs() : []) : [];
    if (!npcs.length) { wrap.appendChild(D.empty('暂无NPC数据')); return; }

    const list = D.el('div');
    npcs.slice(0, 15).forEach(npc => {
      const item = D.el('div', 'npc-list-item', { data: { id: npc.id || npc.name } });
      item.appendChild(D.el('span', 'npc-name', { text: npc.name }));
      const favor = npc.favor || 0;
      const fBarWrap = D.el('div', 'npc-favor-bar');
      const fBar = D.bar(this._favorClass(favor), Math.min(favor, 100));
      fBar.classList.add('xs');
      fBarWrap.appendChild(fBar);
      item.appendChild(fBarWrap);
      item.appendChild(D.el('span', 'npc-location', { text: npc.location || '' }));
      item.addEventListener('click', () => this._showNPCDetail(npc));
      list.appendChild(item);
    });
    wrap.appendChild(list);
  }

  _favorClass(v) {
    if (v >= 96) return 'favor-fill f96';
    if (v >= 80) return 'favor-fill f80';
    if (v >= 60) return 'favor-fill f60';
    if (v >= 40) return 'favor-fill f40';
    if (v >= 20) return 'favor-fill f20';
    return 'favor-fill f0';
  }

  _showNPCDetail(npc) {
    this.showModal(npc.name, `
      <div class="npc-detail-location">${npc.location || '未知位置'} · ${npc.realm || '未知境界'}</div>
      <div>好感度：${npc.favor || 0}</div>
      <div>关系：${npc.relation || '陌生人'}</div>
      ${npc.desc ? '<div>' + npc.desc + '</div>' : ''}
    `, [
      { text: '交互', cls: 'btn-primary', action: () => { this.closeModal(); this.onAction('npcInteract', { npc }); } },
      { text: '关闭', cls: 'btn-secondary', action: () => this.closeModal() },
    ]);
  }

  _renderTradeTab(wrap) {
    const w = this.w;
    const p = this.p;

    const card = D.el('div', 'card');
    card.appendChild(D.el('div', 'card-title', { text: '交易系统' }));

    // 商店
    if (w && w.getShops) {
      const shops = w.getShops(p);
      if (shops && shops.length) {
        shops.slice(0, 6).forEach(s => {
          const shop = D.el('div', `${s.type==='auction'?'auction-card ':''}shop-card`);
          shop.appendChild(D.el('div', 'shop-name', { text: s.name }));
          shop.appendChild(D.el('div', 'shop-desc', { text: s.desc || '' }));
          shop.addEventListener('click', () => this.onAction('openShop', { shop: s }));
          card.appendChild(shop);
        });
      }
    }

    // 拍卖会
    const auction = D.el('div', 'card auction-card');
    auction.appendChild(D.el('div', 'card-title', { text: '拍卖会' }));
    auction.appendChild(D.el('div', 'event-item',
      { html: '<span class="ev-icon">🔨</span><span class="ev-name">查看拍卖日程</span>' }));
    auction.addEventListener('click', () => this.onAction('openAuction', {}));
    card.appendChild(auction);

    wrap.appendChild(card);
  }

  _renderBottleTab(wrap) {
    const b = this.bot;
    if (!b) { wrap.appendChild(D.empty('掌天瓶模块未加载')); return; }

    const header = D.el('div', 'bottle-header');
    header.appendChild(D.el('div', 'bottle-status', { text: b.evolving ? '进化中...' : '正常' }));
    header.appendChild(D.el('div', 'bottle-liquid',
      { text: `绿液：${b.liquid || 0}/${b.maxLiquid || 100}` }));
    wrap.appendChild(header);

    // 操作
    const actionCard = D.el('div', 'card');
    actionCard.appendChild(D.el('div', 'card-title', { text: '掌天瓶操作' }));
    const btns = [
      { text: '凝聚绿液', action: 'bottleCondense', disabled: !!b._cd },
      { text: '催熟灵植',  action: 'bottleSpeedup', disabled: b.liquid < 10 },
      { text: '灵田扩块',  action: 'bottleExpand',  disabled: false },
    ];
    btns.forEach(cfg => {
      const btn = D.el('button', `btn btn-primary btn-block mt-sm${cfg.disabled ? ' disabled' : ''}`,
        { text: cfg.text });
      btn.addEventListener('click', () => { if (!cfg.disabled) this.onAction(cfg.action, {}); });
      actionCard.appendChild(btn);
    });
    wrap.appendChild(actionCard);

    // 灵田
    if (b.getPlots) {
      const plots = b.getPlots();
      if (plots && plots.length) {
        const grid = D.el('div', 'lingtian-grid');
        grid.appendChild(D.el('div', 'card-title mt-md', { text: '灵田', style: 'padding:0 12px' }));
        plots.forEach(p => {
          const plot = D.el('div', 'lingtian-plot');
          plot.appendChild(D.el('span', 'plot-icon', { text: p.icon || '🌱' }));
          const info = D.el('div', 'plot-info');
          info.appendChild(D.el('div', 'plot-name', { text: p.name || '空地' }));
          if (p.progress != null) {
            const pb = D.bar('cultivation', p.progress);
            pb.classList.add('xs');
            const pw = D.el('div', 'plot-progress');
            pw.appendChild(pb);
            info.appendChild(pw);
          }
          plot.appendChild(info);
          const actions = D.el('div', 'plot-actions');
          if (p.canHarvest) {
            const hBtn = D.el('button', 'btn btn-primary', { text: '收获' });
            hBtn.addEventListener('click', () => this.onAction('bottleHarvest', { plot: p }));
            actions.appendChild(hBtn);
          }
          plot.appendChild(actions);
          grid.appendChild(plot);
        });
        wrap.appendChild(grid);
      }
    }

    // 仓库
    if (b.getWarehouse) {
      const wh = b.getWarehouse();
      if (wh && wh.length) {
        const whCard = D.el('div', 'card');
        whCard.appendChild(D.el('div', 'card-title', { text: '灵田仓库' }));
        wh.slice(0, 8).forEach(it => {
          const row = D.el('div', 'attr-row');
          row.appendChild(D.el('span', 'attr-name', { text: it.name }));
          row.appendChild(D.el('span', 'attr-current', { text: 'x' + (it.count || 1) }));
          whCard.appendChild(row);
        });
        wrap.appendChild(whCard);
      }
    }
  }

  _renderSettingsTab(wrap) {
    const p = this.p;

    // 存档位
    const saveCard = D.el('div', 'card');
    saveCard.appendChild(D.el('div', 'card-title', { text: '存档管理' }));
    for (let i = 1; i <= 3; i++) {
      const slot = D.el('div', 'save-slot');
      const info = D.el('div', 'save-info');
      info.appendChild(D.el('div', 'save-name', { text: `存档位 ${i}` }));
      info.appendChild(D.el('div', 'save-meta',
        { text: p ? `${p.fullTitle||'?'} · 第${this.GS.gameDay||0}天` : '空' }));
      slot.appendChild(info);
      const actions = D.el('div', 'save-actions');
      const saveBtn = D.el('button', 'btn btn-primary', { text: '保存' });
      saveBtn.addEventListener('click', () => this.onAction('saveGame', { slot: i }));
      const loadBtn = D.el('button', 'btn btn-secondary', { text: '读取' });
      loadBtn.addEventListener('click', () => {
        this.showModal('确认读取', '读取存档将覆盖当前进度，确认？', [
          { text: '确认读取', cls: 'btn-danger', action: () => { this.closeModal(); this.onAction('loadGame', { slot: i }); } },
          { text: '取消', cls: 'btn-secondary', action: () => this.closeModal() },
        ]);
      });
      actions.appendChild(saveBtn);
      actions.appendChild(loadBtn);
      slot.appendChild(actions);
      saveCard.appendChild(slot);
    }
    wrap.appendChild(saveCard);

    // 重置按钮
    const reset = D.el('div', 'reset-btn', { text: '重置游戏' });
    reset.addEventListener('click', () => {
      this.showModal('重置游戏', '确定要重置所有数据吗？此操作不可撤销。', [
        { text: '确认重置', cls: 'btn-danger', action: () => {
          this.closeModal();
          this.showModal('最终确认', '再次确认：此操作将清除所有进度，不可恢复！', [
            { text: '确认', cls: 'btn-danger', action: () => { this.closeModal(); this.onAction('resetGame', {}); } },
            { text: '取消', cls: 'btn-secondary', action: () => this.closeModal() },
          ]);
        }},
        { text: '取消', cls: 'btn-secondary', action: () => this.closeModal() },
      ]);
    });
    wrap.appendChild(reset);
  }


  /* ================================================================
   *  子Tab导航
   * ================================================================ */
  _buildSubTabNav(subTabs, active, parentTab) {
    const nav = D.el('div', 'subtab-nav');
    subTabs.forEach(st => {
      const item = D.el('div', `subtab-item${st.id === active ? ' active' : ''}`,
        { text: st.label, data: { subtab: st.id } });
      // 红点
      const badge = D.el('div', 'tab-badge hidden');
      badge.classList.add('sub-badge');
      item.appendChild(badge);
      item.addEventListener('click', () => {
        this.activeSubTab[parentTab] = st.id;
        this.renderContent();
        this.updateRedDots();
      });
      nav.appendChild(item);
    });
    return nav;
  }


  /* ================================================================
   *  战斗界面
   * ================================================================ */
  showBattleUI(battleData) {
    this.battleMode = true;
    this.root.classList.add('battle-mode');

    // 移除旧战斗
    if (this._els.battle) this._els.battle.remove();

    const scene = D.el('div', 'battle-scene');
    this._els.battle = scene;

    const b = battleData || {};
    const enemy = b.enemy || {};
    const player = b.player || this.p || {};

    // ── 敌人区 ──
    const enemyArea = D.el('div', 'battle-enemy');
    enemyArea.appendChild(D.el('div', 'enemy-name', { text: enemy.name || '未知敌人' }));
    enemyArea.appendChild(D.el('div', 'enemy-realm', { text: enemy.realm || '' }));
    const eHpWrap = D.el('div', 'enemy-hp-bar');
    const eHpPct  = enemy.maxHp > 0 ? (enemy.hp / enemy.maxHp * 100) : 100;
    eHpWrap.appendChild(D.bar('hp', eHpPct));
    enemyArea.appendChild(eHpWrap);
    enemyArea.appendChild(D.el('div', 'enemy-hp-text',
      { text: `${fmtNum(enemy.hp||0)} / ${fmtNum(enemy.maxHp||0)}` }));
    scene.appendChild(enemyArea);

    // ── 战斗日志 ──
    this._els.battleLog = D.el('div', 'battle-log');
    this._els.battleLog.appendChild(D.el('div', 'battle-msg system', { text: `战斗开始！你遭遇了 ${enemy.name || '敌人'}` }));
    scene.appendChild(this._els.battleLog);

    // ── 玩家区 ──
    const playerArea = D.el('div', 'battle-player-area');

    const stats = D.el('div', 'battle-player-stats');
    const stsConfig = [
      ['气血', `${fmtNum(player.hpMax||0)}/${fmtNum(player.hpMax||0)}`],
      ['灵力', `${fmtNum(player.mpMax||0)}/${fmtNum(player.mpMax||0)}`],
      ['神识', fmtNum(player.sp||0)],
    ];
    stsConfig.forEach(([label, val]) => {
      const stat = D.el('div', 'bp-stat');
      stat.appendChild(D.el('div', 'bp-label', { text: label }));
      stat.appendChild(D.el('div', '', { text: val }));
      stats.appendChild(stat);
    });
    playerArea.appendChild(stats);

    // 技能
    const actions = D.el('div', 'battle-actions');
    const skills = b.playerSkills || [];
    skills.forEach(sk => {
      const skill = D.el('div', `battle-skill${sk.insufficient?' insufficient':''}`, { data: { skill: sk.id } });
      skill.appendChild(D.el('div', 'skill-name', { text: sk.name || '攻击' }));
      skill.appendChild(D.el('div', 'skill-cost', { text: sk.cost ? `消耗${sk.cost}灵力` : '' }));
      skill.addEventListener('click', () => {
        if (!sk.insufficient) this.onAction('battleAction', { skill: sk.id || sk.name });
      });
      actions.appendChild(skill);
    });
    playerArea.appendChild(actions);

    // 额外行动
    const extras = D.el('div', 'battle-extra-actions');
    const defBtn = D.el('button', 'btn btn-secondary', { text: '防御' });
    defBtn.addEventListener('click', () => this.onAction('battleAction', { skill: 'defend' }));
    const fleeBtn = D.el('button', 'btn btn-primary', { text: '逃跑' });
    fleeBtn.addEventListener('click', () => this.onAction('battleAction', { skill: 'flee' }));
    extras.appendChild(defBtn);
    extras.appendChild(fleeBtn);
    playerArea.appendChild(extras);

    scene.appendChild(playerArea);
    document.body.appendChild(scene);
  }

  addBattleLog(msg, type = 'system') {
    if (!this._els.battleLog) return;
    const entry = D.el('div', `battle-msg ${type}`, { text: msg });
    this._els.battleLog.appendChild(entry);
    this._els.battleLog.scrollTop = this._els.battleLog.scrollHeight;
  }

  updateBattleUI(battleData) {
    const b = battleData || {};
    const enemy = b.enemy || {};

    // 更新敌人HP
    const scene = this._els.battle;
    if (scene) {
      const eHpWrap = scene.querySelector('.enemy-hp-bar');
      if (eHpWrap) {
        eHpWrap.innerHTML = '';
        const eHpPct = enemy.maxHp > 0 ? (enemy.hp / enemy.maxHp * 100) : 0;
        eHpWrap.appendChild(D.bar('hp', Math.max(0, eHpPct)));
      }
      const eHpText = scene.querySelector('.enemy-hp-text');
      if (eHpText) eHpText.textContent = `${fmtNum(enemy.hp||0)} / ${fmtNum(enemy.maxHp||0)}`;
    }

    // 更新玩家状态
    const player = b.player || this.p || {};
    const stats = scene ? scene.querySelector('.battle-player-stats') : null;
    if (stats) {
      const stsVals = [
        `${fmtNum(player.hpMax||0)}/${fmtNum(player.hpMax||0)}`,
        `${fmtNum(player.mpMax||0)}/${fmtNum(player.mpMax||0)}`,
        fmtNum(player.sp||0),
      ];
      const statDivs = stats.querySelectorAll('.bp-stat div:last-child');
      statDivs.forEach((d, i) => { if (stsVals[i]) d.textContent = stsVals[i]; });
    }
  }

  hideBattleUI() {
    this.battleMode = false;
    this.root.classList.remove('battle-mode');
    if (this._els.battle) {
      this._els.battle.remove();
      this._els.battle = null;
    }
    this.renderContent();
    this.updateRedDots();
  }


  /* ================================================================
   *  创建角色界面
   * ================================================================ */
  showCreateCharacter(onSubmit) {
    const overlay = D.el('div', 'create-char-overlay');
    overlay.appendChild(D.el('div', 'create-char-title', { text: '凡人修仙传' }));

    const form = D.el('div', 'create-char-form');

    // 姓名
    const nameGroup = D.el('div', 'create-char-group');
    nameGroup.appendChild(D.el('div', 'group-label', { text: '道号 / 姓名' }));
    const nameInput = D.el('input', 'create-char-input', { placeholder: '输入你的名字...', maxlength: '12' });
    nameInput.value = '韩立';
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    // 性别
    const genderGroup = D.el('div', 'create-char-group');
    genderGroup.appendChild(D.el('div', 'group-label', { text: '性别' }));
    const genderOpts = D.el('div', 'gender-options');
    let selectedGender = '男';
    ['男', '女'].forEach(g => {
      const opt = D.el('div', `gender-option${g === '男' ? ' selected' : ''}`, { text: g, data: { gender: g } });
      opt.addEventListener('click', () => {
        genderOpts.querySelectorAll('.gender-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedGender = g;
        // 随机出身
        const origins = { 男: '山村少年', 女: '世家千金' };
        originEl.textContent = origins[g] || '散修';
      });
      genderOpts.appendChild(opt);
    });
    genderGroup.appendChild(genderOpts);
    form.appendChild(genderGroup);

    // 出身（随机预览）
    const originGroup = D.el('div', 'create-char-group');
    originGroup.appendChild(D.el('div', 'group-label', { text: '出身' }));
    const originEl = D.el('div', 'create-char-origin', { text: '山村少年' });
    originGroup.appendChild(originEl);
    form.appendChild(originGroup);

    // 提交
    const submitWrap = D.el('div', 'create-char-submit');
    const submitBtn = D.el('button', 'btn btn-primary', { text: '开始修仙' });
    submitBtn.addEventListener('click', () => {
      const name = nameInput.value.trim() || '无名散修';
      overlay.remove();
      if (onSubmit) onSubmit({ name, gender: selectedGender, origin: originEl.textContent });
      else this.onAction('createCharacter', { name, gender: selectedGender, origin: originEl.textContent });
    });
    submitWrap.appendChild(submitBtn);
    form.appendChild(submitWrap);

    overlay.appendChild(form);
    document.body.appendChild(overlay);

    // 自动聚焦
    setTimeout(() => nameInput.focus(), 100);
  }


  /* ================================================================
   *  弹窗系统
   * ================================================================ */
  showModal(title, content, buttons = []) {
    const overlay = D.el('div', 'modal-overlay');
    const modal = D.el('div', 'modal');

    modal.appendChild(D.el('div', 'modal-title', { text: title || '' }));
    const body = D.el('div', 'modal-body');
    if (typeof content === 'string') body.innerHTML = content;
    else body.appendChild(content);
    modal.appendChild(body);

    if (buttons.length) {
      const footer = D.el('div', 'modal-footer');
      buttons.forEach(b => {
        const btn = D.el('button', `btn ${b.cls || 'btn-secondary'}`, { text: b.text || '确定' });
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (b.action) b.action();
        });
        footer.appendChild(btn);
      });
      modal.appendChild(footer);
    }

    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    document.body.appendChild(overlay);
    this.modalStack.push(overlay);
  }

  closeModal() {
    if (this.modalStack.length) {
      const modal = this.modalStack.pop();
      if (modal && modal.parentNode) modal.remove();
    }
  }

  /** 突破结果弹窗 */
  showResultModal(result) {
    if (!result) return;
    const isSuccess = result.success;
    const isCrit   = result.result === '大成功' || result.result === '大失败';

    let cls = isCrit ? 'crit-fail' : (isSuccess ? 'success' : 'fail');
    if (result.result === '大成功') cls = 'golden';

    const body = D.el('div', `result-modal ${cls}`);
    body.appendChild(D.el('div', 'result-icon', { text: isSuccess ? '✨' : '💔' }));
    body.appendChild(D.el('div', 'result-text', { text: result.result || (isSuccess ? '成功' : '失败') }));
    body.appendChild(D.el('div', '', { text: result.msg || '' }));

    this.showModal('突破结果', body, [
      { text: '确定', cls: 'btn-primary', action: () => this.closeModal() },
    ]);
  }


  /* ================================================================
   *  日志系统
   * ================================================================ */
  addLog(msg, type = 'white') {
    this.logs.unshift({ msg, type, time: Date.now() });
    if (this.logs.length > 200) this.logs.length = 200;

    // 实时追加到当前页面日志区
    const logList = document.querySelector('.log-list');
    if (logList && !this.battleMode) {
      const entry = D.el('div', `log-item ${LOG_CLASS[type] || 'log-white'}`, { text: msg });
      if (logList.firstChild) logList.insertBefore(entry, logList.firstChild);
      else logList.appendChild(entry);

      // 限制显示10条
      if (!this.logExpanded) {
        const all = logList.querySelectorAll('.log-item');
        for (let i = 10; i < all.length; i++) all[i].classList.add('hidden');
      }
    }
  }

  _renderLogArea(wrap) {
    const logWrap = D.el('div');
    if (!this.logs.length) {
      logWrap.appendChild(D.el('div', 'log-empty', { text: '— 暂无日志 —' }));
      wrap.appendChild(logWrap);
      return;
    }

    const logList = D.el('div', 'log-list');
    const visible = this.logExpanded ? this.logs : this.logs.slice(0, 10);
    visible.forEach(l => {
      logList.appendChild(D.el('div', `log-item ${LOG_CLASS[l.type] || 'log-white'}`, { text: l.msg }));
    });
    logWrap.appendChild(logList);

    if (this.logs.length > 10) {
      const toggle = D.el('div', 'log-expand', { text: this.logExpanded ? '收起' : `展开全部 (${this.logs.length}条)` });
      toggle.addEventListener('click', () => {
        this.logExpanded = !this.logExpanded;
        this.renderContent();
      });
      logWrap.appendChild(toggle);
    }

    wrap.appendChild(logWrap);
  }


  /* ================================================================
   *  红点系统
   * ================================================================ */
  updateRedDots() {
    const dots = this._computeRedDots();

    // 底栏 Tab 红点
    const tabItems = this._els.bottombar.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
      const tabId = item.dataset.tab;
      const badge = item.querySelector('.tab-badge');
      if (!badge) return;
      const dot = dots[tabId];
      if (dot) {
        if (typeof dot === 'number' && dot > 0) {
          badge.textContent = dot > 99 ? '99+' : String(dot);
          badge.classList.add('count');
          badge.classList.remove('hidden');
        } else {
          badge.textContent = '';
          badge.classList.remove('count', 'hidden');
        }
      } else {
        badge.classList.add('hidden');
      }
    });

    // 子Tab 红点
    const subBadges = document.querySelectorAll('.sub-badge');
    subBadges.forEach(badge => {
      // 找父级 subtab-item 的 id
      const parent = badge.closest('.subtab-item');
      if (!parent) return;
      const subId = parent.dataset.subtab;
      if (!subId) return;
      const subDot = dots[`sub_${subId}`];
      if (subDot) {
        badge.classList.remove('hidden');
        if (typeof subDot === 'number' && subDot > 0) {
          badge.textContent = subDot > 99 ? '99+' : String(subDot);
          badge.classList.add('count');
        }
      } else {
        badge.classList.add('hidden');
      }
    });
  }

  _computeRedDots() {
    const dots = {};
    const p = this.p;
    if (!p) return dots;

    // 🏠 首页：修炼完成、灵草成熟、秘境开启、寿元告急
    const events = this._gatherEvents();
    if (events.length) dots.home = events.length;

    // 🧘 修炼：神识CD结束、炼体可进行、可突破
    let cultDots = 0;
    if (p.subStageIndex >= 3 && p.realmIndex < 14) {
      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : Infinity;
      if ((p.cultivation || 0) >= req) cultDots++;
    } else if (p.subStageIndex < 3) {
      const req = p.getCultivationRequirement ? p.getCultivationRequirement() : Infinity;
      if ((p.cultivation || 0) >= req) cultDots++;
    }
    if (this.cult) {
      if (this.cult.divineSense && (this.cult.divineSense.cooldownRemaining || 0) <= 0) cultDots++;
      if (this.cult.bodyRefine && (this.cult.bodyRefine.cooldownRemaining || 0) <= 0) cultDots++;
    }
    if (cultDots) dots.cultivation = cultDots;

    // 🗺️ 探索：秘境开启
    if (this.expl && this.expl.getOpenDungeons) {
      const duns = this.expl.getOpenDungeons(p);
      if (duns && duns.length) dots.exploration = duns.length;
    }

    // 🎒 背包：炼丹完成、制符完成、灵兽可进化
    let bagDots = 0;
    if (this.cra) {
      if (this.cra._done) bagDots++;
    }
    if (bagDots) dots.backpack = bagDots;

    // ⚙️ 更多：拍卖会、NPC、绿液满
    let moreDots = 0;
    if (this.bot && this.bot.liquid >= (this.bot.maxLiquid || 100)) moreDots++;
    if (moreDots) dots.more = moreDots;

    return dots;
  }


  /* ================================================================
   *  新手引导
   * ================================================================ */
  startTutorial(onComplete) {
    this.tutorial = {
      phase: 'forced',
      step: 0,
      onComplete: onComplete || (() => {}),
    };
    this._runTutorialStep();
  }

  _runTutorialStep() {
    if (!this.tutorial) return;
    const t = this.tutorial;

    // 清除上次遗留
    this._clearTutorial();
    document.body.insertAdjacentHTML('beforeend', '<div class="tutorial-overlay" id="tut-overlay"></div>');

    if (t.phase === 'forced') {
      switch (t.step) {
        case 0: this._tutStep_Welcome(); break;
        case 1: this._tutStep_Cultivate(); break;
        case 2: this._tutStep_AttrPanel(); break;
        default: this._endForcedTutorial(); return;
      }
    } else if (t.phase === 'optional') {
      this._startOptionalTutorial();
      return;
    }
    t.step++;
  }

  _clearTutorial() {
    const ov = document.getElementById('tut-overlay');
    if (ov) ov.remove();
    const dialogs = document.querySelectorAll('.tutorial-dialog');
    dialogs.forEach(d => d.remove());
    const arrows = document.querySelectorAll('.tutorial-arrow');
    arrows.forEach(a => a.remove());
    const highlights = document.querySelectorAll('.tutorial-highlight');
    highlights.forEach(h => h.classList.remove('tutorial-highlight'));
  }

  _tutStep_Welcome() {
    this.switchTab('home');
    const dialog = this._createTutDialog(
      '✦ 欢迎来到凡人修仙传的世界',
      '这是你的修仙之旅。底部Tab可切换不同功能页面。',
      [{ text: '下一步', action: () => this._runTutorialStep() }]
    );
    this._positionTutDialog(dialog, 'bottom', 'center');
  }

  _tutStep_Cultivate() {
    // 高亮修炼卡片
    const cultCard = document.querySelector('.cultivation-card');
    if (cultCard) cultCard.classList.add('tutorial-highlight');

    const dialog = this._createTutDialog(
      '第一步·修炼',
      '先试试打坐修炼，感受灵力的流动。点击"🧘 打坐修炼"快捷按钮。',
      [{ text: '我知道了', action: () => { cultCard?.classList.remove('tutorial-highlight'); this._runTutorialStep(); } }]
    );
    this._positionTutDialog(dialog, 'top', 'center');
  }

  _tutStep_AttrPanel() {
    const progress = document.getElementById('progress-area');
    if (progress) progress.classList.add('tutorial-highlight');

    const dialog = this._createTutDialog(
      '认识属性',
      '点击上方境界/属性区域可展开查看详细属性，了解你的战斗能力和天赋。',
      [{ text: '完成引导', action: () => {
        progress?.classList.remove('tutorial-highlight');
        this._endForcedTutorial();
      }}]
    );
    this._positionTutDialog(dialog, 'top', 'center');
  }

  _endForcedTutorial() {
    this._clearTutorial();
    this.tutorial.phase = 'optional';
    this.tutorial.step = 0;

    // 跳过引导按钮
    const skipBtn = D.el('button', 'btn btn-secondary', { text: '跳过引导' });
    skipBtn.addEventListener('click', () => this._endAllTutorial());
    document.body.appendChild(skipBtn);
    skipBtn.style.cssText = 'position:fixed;top:50px;right:12px;z-index:252;';

    // 自动开始可选引导第0步
    this._startOptionalTutorial();
  }

  _startOptionalTutorial() {
    this._clearTutorial();
    // 可选引导：用主线任务系统替代（简化实现）
    this._endAllTutorial();
  }

  _endAllTutorial() {
    this._clearTutorial();
    if (this.tutorial && this.tutorial.onComplete) this.tutorial.onComplete();
    this.tutorial = null;
    this.renderContent();
  }

  _createTutDialog(title, body, buttons) {
    const dialog = D.el('div', 'tutorial-dialog');
    dialog.appendChild(D.el('div', 'modal-title', { text: title, style: 'margin-bottom:8px' }));
    dialog.appendChild(D.el('div', 'modal-body', { html: body }));
    if (buttons.length) {
      const btnsWrap = D.el('div', 'tutorial-btns');
      buttons.forEach(b => {
        const btn = D.el('button', `btn ${b.cls || 'btn-primary'}`, { text: b.text, style: 'flex:none;min-width:80px' });
        btn.addEventListener('click', () => b.action());
        btnsWrap.appendChild(btn);
      });
      dialog.appendChild(btnsWrap);
    }
    document.body.appendChild(dialog);
    return dialog;
  }

  _positionTutDialog(dialog, vPos, hPos) {
    const w = dialog.offsetWidth || 300;
    const h = dialog.offsetHeight || 150;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left, top;
    if (vPos === 'bottom') top = vh - h - 100;
    else if (vPos === 'top') top = 60;
    else top = (vh - h) / 2;

    if (hPos === 'center') left = (vw - w) / 2;
    else left = 20;

    dialog.style.left = Math.max(8, left) + 'px';
    dialog.style.top  = Math.max(8, top) + 'px';
  }


  /* ================================================================
   *  事件绑定
   * ================================================================ */
  bindEvents() {
    // 攻击底栏的现有事件已在构建时绑定
    // 全局按键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.modalStack.length) this.closeModal();
      }
    });
  }


  /* ================================================================
   *  全量刷新
   * ================================================================ */
  refresh() {
    this.refreshTopBar();
    this.refreshProgress();
    this.renderContent();
    this.updateRedDots();
  }
}


/* ================================================================
 *  导出
 * ================================================================ */

// 同时挂到 window 供旧代码访问
window.UI = UI;
