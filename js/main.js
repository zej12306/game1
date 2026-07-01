// 主入口文件
import { REALMS, BREAKTHROUGH_MULTIPLIER, SUB_STAGE_MULTIPLIER } from './data/realms.js';
import { SKILLS, GRADE_VALUE } from './data/skills.js';
import { ITEMS, SHOP_ITEMS } from './data/items.js';
import { LOCATIONS, TRAVEL_MODES } from './data/locations.js';
import { NPCS, QUESTS } from './data/npcs.js';
import { BEASTS, BEAST_GRADE, calcSwarmPower } from './data/beasts.js';
import { EVENTS, ENEMIES, SECTS, BOTTLE_EVENTS } from './data/events.js';
import { ARTIFACT_CATALOG, ARTIFACT_COMBAT_TYPES } from './data/artifact_catalog.js';
import { CombatSystem } from './systems/combat.js';
import { CultivationSystem } from './systems/cultivation.js';
import { BreakthroughSystem } from './systems/breakthrough.js';
import { ExplorationSystem } from './systems/exploration.js';
import { InventorySystem } from './systems/inventory.js';
import { SaveSystem } from './systems/save.js';
import { AlchemySystem } from './systems/alchemy.js';
import { NpcSystem } from './systems/npc.js';
import { SectSystem } from './systems/sect.js';
import { AchievementSystem } from './systems/achievement.js';
import { BodySystem } from './systems/body.js';
import { SenseSystem } from './systems/sense.js';
import { TalismanSystem } from './systems/talisman.js';
import { ArtifactSystem } from './systems/artifact.js';
import { BeastSystem } from './systems/beast.js';
import { SkillUpgradeSystem } from './systems/skill_upgrade.js';
import { PuppetSystem } from './systems/puppet.js';
import { BottleSystem } from './systems/bottle.js';
import { DeathSystem } from './systems/death.js';
import { DungeonSystem } from './systems/dungeon.js';
import { TradeSystem } from './systems/trade.js';
import { TimeSystem } from './systems/time.js';
import { TutorialSystem } from './systems/tutorial.js';
import { NotificationSystem } from './systems/notification.js';
import { DailySystem } from './systems/daily.js';
import { ForgeSystem } from './systems/forge.js';
import { EventChainSystem } from './systems/event_chain.js';
import { WeightSystem } from './systems/weight.js';
import { Renderer } from './ui/renderer.js';

// 注册全局数据
window.gameData = {
  REALMS, BREAKTHROUGH_MULTIPLIER, SUB_STAGE_MULTIPLIER,
  SKILLS, GRADE_VALUE,
  ITEMS, SHOP_ITEMS,
  LOCATIONS, TRAVEL_MODES,
  NPCS, QUESTS,
  BEASTS, BEAST_GRADE, calcSwarmPower,
  EVENTS, ENEMIES, SECTS, BOTTLE_EVENTS,
  ARTIFACT_CATALOG, ARTIFACT_COMBAT_TYPES
};

// 游戏类
class Game {
  constructor() {
    this.state = this.getDefaultState();
    this.systems = {};
    this.renderer = null;
    this.init();
  }

  // 获取默认状态
  getDefaultState() {
    return {
      player: {
        name: '无名散修',
        gender: '男',
        age: 18,
        lifespan: 100,
        realmIdx: 0,
        exp: 0,
        root: this.generateRoot(),
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 10,
        def: 5,
        spd: 10,
        sense: 10,
        comprehension: Math.floor(Math.random() * 21) + 10,
        fortune: Math.floor(Math.random() * 21) + 10,
        fame: 0,
        spiritStones: 10,
        bodyExp: 0
      },
      inventory: [
        { id: 'herb', name: '灵草', icon: ' ', type: 'material', count: 5 },
        { id: 'heal_pill', name: '金创药', icon: ' ', type: 'pill', count: 3 },
        { id: 'stone', name: '灵石', icon: ' ', type: 'currency', count: 10 }
      ],
      skills: {
        main: { id: 'basic_art', name: '基础吐纳法', grade: '黄级', desc: '基础修炼功法', cultivationBonus: 1.0 },
        sub: [],
        combat: []
      },
      npcs: [],
      quests: [],
      achievements: [],
      sect: null,
      beasts: [],
      artifacts: [],
      puppets: [],
      bottle: null,
      body: { realmIdx: 0, level: 1, exp: 0 },
      talismanLevel: 1,
      talismanExp: 0,
      puppetLevel: 0,
      gameTime: { day: 1, totalDays: 0 },
      currentLocation: null,
      playerLocation: 'qingyun',
      currentRegion: 'renjie',
      logs: [{ text: '欢迎来到凡人修仙传的世界。', type: '' }, { text: '你是一名散修，正在青云山修炼。', type: '' }],
      stats: { explorations: 0, combats: 0, victories: 0, pillsRefined: 0 },
      combatLog: [],
      breakthroughPill: null,
      ascendPrep: { body: false, artifact: false, pill: false },
      npcRelations: {},   // { npcId: { targetId: relationType } }
      npcKilled: [],      // 已击杀NPC列表
      karma: 0,           // -100~100 业力值
      dualRecords: {},    // { npcId: { modes: [], yinyuanUsed: false } }
      buffs: []
    };
  }

  // 生成灵根
  generateRoot() {
    const elements = ['金', '木', '水', '火', '土'];
    const values = [];
    let sum = 0;

    for (let i = 0; i < 5; i++) {
      const val = Math.random() * 100;
      values.push(val);
      sum += val;
    }

    const normalized = values.map(v => Math.round((v / sum) * 100));
    
    // 修正总和为100%
    const total = normalized.reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const diff = 100 - total;
      const maxIdx = normalized.indexOf(Math.max(...normalized));
      normalized[maxIdx] += diff;
    }

    const max = Math.max(...normalized);
    const maxIndex = normalized.indexOf(max);
    
    // 统计有多少个属性≥20%
    const highElements = normalized.filter(v => v >= 20).length;

    let type;
    if (max >= 80) {
      // 单一属性≥80%：天灵根
      type = { name: '天灵根', mult: 3.0, bonus: 20 };
    } else if (highElements === 2) {
      // 两个属性≥20%：双灵根
      type = { name: '双灵根', mult: 1.8, bonus: 12 };
    } else if (highElements === 3) {
      // 三个属性≥20%：三灵根
      type = { name: '三灵根', mult: 1.2, bonus: 5 };
    } else if (highElements === 4) {
      // 四个属性≥20%：四灵根
      type = { name: '四灵根', mult: 0.8, bonus: -5 };
    } else if (highElements === 5) {
      // 五个属性≥20%：五灵根（杂灵根）
      type = { name: '杂灵根', mult: 0.6, bonus: -10 };
    } else {
      // 伪灵根（没有任何属性≥20%）
      type = { name: '伪灵根', mult: 0.5, bonus: -20 };
    }

    // 确定主属性（最高的）
    const mainElement = elements[maxIndex];

    return {
      elements: { 
        '金': normalized[0], 
        '木': normalized[1], 
        '水': normalized[2], 
        '火': normalized[3], 
        '土': normalized[4] 
      },
      type,
      mainElement
    };
  }

  // 显示创角界面
  showCharacterCreation() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        <div class="card">
          <h3>  角色创建</h3>
          <div style="text-align:center;margin:20px 0">
            <div style="font-size:48px;margin-bottom:10px">⚔️</div>
            <h2 style="color:#ffd700">凡人修仙传</h2>
            <p style="color:#aaa;font-size:12px">修仙之路，从今日开始</p>
          </div>
        </div>

        <div class="card">
          <h3>基本信息</h3>
          <div style="margin-bottom:10px">
            <label style="color:#aaa;font-size:12px">姓名</label>
            <input type="text" id="playerName" value="无名散修" style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,215,0,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:14px">
          </div>
          <div style="margin-bottom:10px">
            <label style="color:#aaa;font-size:12px">性别</label>
            <div style="display:flex;gap:10px;margin-top:5px">
              <label style="cursor:pointer;color:#fff">
                <input type="radio" name="gender" value="男" checked> ♂ 男
              </label>
              <label style="cursor:pointer;color:#fff">
                <input type="radio" name="gender" value="女"> ♀ 女
              </label>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>天赋属性（总值50点）</h3>
          <div style="margin-bottom:10px">
            <label style="color:#aaa;font-size:12px">悟性</label>
            <div style="display:flex;align-items:center;gap:10px">
              <input type="range" id="comprehension" min="5" max="40" value="25" style="flex:1">
              <span id="compValue" style="color:#ffd700;min-width:30px">25</span>
            </div>
          </div>
          <div style="margin-bottom:10px">
            <label style="color:#aaa;font-size:12px">机缘</label>
            <div style="display:flex;align-items:center;gap:10px">
              <input type="range" id="fortune" min="5" max="40" value="25" style="flex:1">
              <span id="fortuneValue" style="color:#ffd700;min-width:30px">25</span>
            </div>
          </div>
          <div style="font-size:11px;color:#aaa;text-align:center;margin-top:5px">
            剩余点数：<span id="remainPoints" style="color:#4ad06a">0</span>/50
          </div>
        </div>

        <div class="card">
          <h3>灵根</h3>
          <div id="rootDisplay" style="text-align:center;padding:15px">
            <div style="font-size:24px;color:#ffd700;margin-bottom:10px">点击下方按钮生成灵根</div>
          </div>
          <button class="btn btn-primary" onclick="game.rollRoot()" style="width:100%;margin-bottom:10px">  生成灵根</button>
        </div>

        <div class="card">
          <button class="btn btn-explore" onclick="game.confirmCharacter()" style="width:100%;font-size:16px;padding:15px">⚔️ 开始修仙</button>
        </div>
      </div>
    `;

    // 绑定滑块事件（悟性和机缘总值50）
    const TOTAL_POINTS = 50;
    const compSlider = document.getElementById('comprehension');
    const fortuneSlider = document.getElementById('fortune');

    compSlider.addEventListener('input', (e) => {
      const comp = parseInt(e.target.value);
      const maxFortune = TOTAL_POINTS - comp;
      fortuneSlider.max = Math.max(5, maxFortune);
      if (parseInt(fortuneSlider.value) > maxFortune) {
        fortuneSlider.value = maxFortune;
      }
      document.getElementById('compValue').textContent = comp;
      document.getElementById('fortuneValue').textContent = fortuneSlider.value;
      document.getElementById('remainPoints').textContent = TOTAL_POINTS - comp - parseInt(fortuneSlider.value);
    });

    fortuneSlider.addEventListener('input', (e) => {
      const fortune = parseInt(e.target.value);
      const maxComp = TOTAL_POINTS - fortune;
      compSlider.max = Math.max(5, maxComp);
      if (parseInt(compSlider.value) > maxComp) {
        compSlider.value = maxComp;
      }
      document.getElementById('fortuneValue').textContent = fortune;
      document.getElementById('compValue').textContent = compSlider.value;
      document.getElementById('remainPoints').textContent = TOTAL_POINTS - parseInt(compSlider.value) - fortune;
    });

    // 初始显示剩余点数
    document.getElementById('remainPoints').textContent = '0';

    // 自动生成初始灵根
    this.rollRoot();
  }

  // 生成灵根显示
  rollRoot() {
    this.tempRoot = this.generateRoot();
    this.updateRootDisplay();
  }

  // 更新灵根显示
  updateRootDisplay() {
    const root = this.tempRoot;
    const display = document.getElementById('rootDisplay');
    if (!display) return;

    const elementColors = {
      '金': '#ffd700',
      '木': '#4caf50',
      '水': '#2196f3',
      '火': '#f44336',
      '土': '#795548'
    };

    display.innerHTML = `
      <div style="font-size:18px;color:#ffd700;margin-bottom:10px">${root.type.name}（${root.mainElement}）</div>
      <div style="display:flex;justify-content:center;gap:8px;margin-bottom:10px">
        ${Object.entries(root.elements).map(([el, val]) => `
          <div style="text-align:center">
            <div style="width:50px;height:50px;border-radius:50%;background:${elementColors[el]};display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:bold">${el}</div>
            <div style="font-size:12px;color:#aaa;margin-top:4px">${val}%</div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:11px;color:#aaa">修炼速度：x${root.type.mult} | 突破加成：${root.type.bonus > 0 ? '+' : ''}${root.type.bonus}%</div>
    `;
  }

  // 确认角色创建
  confirmCharacter() {
    try {
      const name = document.getElementById('playerName')?.value || '无名散修';
      const genderEl = document.querySelector('input[name="gender"]:checked');
      const gender = genderEl ? genderEl.value : '男';
      const comprehension = parseInt(document.getElementById('comprehension')?.value) || 25;
      const fortune = parseInt(document.getElementById('fortune')?.value) || 25;

      this.state.player.name = name;
      this.state.player.gender = gender;
      this.state.player.comprehension = comprehension;
      this.state.player.fortune = fortune;
      this.state.player.root = this.tempRoot;

      // 直接初始化系统并渲染界面（不调用init避免无限循环）
      this.initSystems();
      this.render();

      // 自动存档
      setInterval(() => this.saveGame(), 60000);

      // 检查新手引导
      this.checkTutorial();

      console.log('角色创建完成，游戏开始');
    } catch (e) {
      console.error('角色创建失败:', e);
      alert('角色创建出错: ' + e.message);
    }
  }

  // 初始化系统（不检查存档）
  initSystems() {
    // 初始化系统
    this.systems.combat = new CombatSystem(this.state);
    this.systems.cultivation = new CultivationSystem(this.state);
    this.systems.breakthrough = new BreakthroughSystem(this.state);
    this.systems.exploration = new ExplorationSystem(this.state);
    this.systems.inventory = new InventorySystem(this.state);
    this.systems.save = new SaveSystem(this.state);
    this.systems.alchemy = new AlchemySystem(this.state);
    this.systems.npc = new NpcSystem(this.state);
    this.systems.sect = new SectSystem(this.state);
    this.systems.achievement = new AchievementSystem(this.state);
    this.systems.body = new BodySystem(this.state);
    this.systems.sense = new SenseSystem(this.state);
    this.systems.talisman = new TalismanSystem(this.state);
    this.systems.artifact = new ArtifactSystem(this.state);
    this.systems.beast = new BeastSystem(this.state);
    this.systems.skillUpgrade = new SkillUpgradeSystem(this.state);
    this.systems.puppet = new PuppetSystem(this.state);
    this.systems.bottle = new BottleSystem(this.state);
    this.systems.death = new DeathSystem(this.state);
    this.systems.dungeon = new DungeonSystem(this.state);
    this.systems.trade = new TradeSystem(this.state);
    this.systems.time = new TimeSystem(this.state);
    this.systems.tutorial = new TutorialSystem(this.state);
    this.systems.notification = new NotificationSystem(this.state);
    this.systems.daily = new DailySystem(this.state);
    this.systems.forge = new ForgeSystem(this.state);
    this.systems.eventChain = new EventChainSystem(this.state);
    this.systems.weight = new WeightSystem(this.state);

    this.renderer = new Renderer(this.state);
  }

  // 初始化
  init() {
    // 初始化系统
    this.initSystems();

    // 检查是否有存档
    const hasSave = localStorage.getItem('save_auto');
    if (!hasSave) {
      // 没有存档，显示创角界面
      this.showCharacterCreation();
      return;
    }

    // 加载存档
    this.loadGame();

    // 渲染界面
    this.render();

    // 自动存档
    setInterval(() => this.saveGame(), 60000);

    // 检查新手引导
    this.checkTutorial();

    console.log('游戏初始化完成');
  }

  // === 新手引导系统 ===

  // 检查是否需要显示引导
  checkTutorial() {
    if (this.systems.tutorial.shouldShowTutorial()) {
      this.showTutorialOverlay();
    }
  }

  // 显示引导遮罩
  showTutorialOverlay() {
    const tutorialHtml = this.systems.tutorial.renderTutorial();
    if (!tutorialHtml) return;

    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.innerHTML = tutorialHtml;
    document.body.appendChild(overlay);
  }

  // 移除引导遮罩
  removeTutorialOverlay() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.remove();
  }

  // 完成引导步骤
  completeTutorialStep() {
    const result = this.systems.tutorial.completeMandatoryStep();
    this.removeTutorialOverlay();

    // 根据当前步骤执行对应操作
    if (result.action === 'first_meditate') {
      // 第二步：执行打坐
      this.meditate(1);
    } else if (result.action === 'view_stats') {
      // 第三步：显示属性面板（已经是主界面，属性面板已显示）
    }

    if (result.completed) {
      this.addLog('新手引导完成！', 'highlight');
      this.render();
    } else {
      this.showTutorialOverlay();
    }
  }

  // 跳过引导
  skipTutorial() {
    this.systems.tutorial.skipTutorial();
    this.removeTutorialOverlay();
    this.addLog('已跳过新手引导', '');
    this.render();
  }

  // 检查可选任务
  checkOptionalTasks() {
    const results = this.systems.tutorial.checkAllOptionalTasks();
    results.forEach(r => {
      this.addLog(`完成任务：${r.task}，获得奖励！`, 'highlight');
      // 显示奖励详情悬浮弹窗
      let rewardText = `完成任务：${r.task}`;
      if (r.reward) {
        const rewards = [];
        if (r.reward.exp) rewards.push(`${r.reward.exp}修为`);
        if (r.reward.stones) rewards.push(`${r.reward.stones}灵石`);
        if (r.reward.fame) rewards.push(`${r.reward.fame}名望`);
        if (rewards.length > 0) {
          rewardText += `，获得：${rewards.join('、')}`;
        }
      }
      this.showToast(rewardText, 'success');
    });
    if (results.length > 0) this.render();
  }

  // 渲染界面
  render() {
    const app = document.getElementById('app');
    if (!app) return;

    try {
    const player = this.state.player;
    const realms = window.gameData?.REALMS || [];
    const currentRealm = realms[player.realmIdx] || { name: '凡人', maxExp: 120 };
    const nextRealm = realms[player.realmIdx + 1];
    const expPercent = Math.min((player.exp / (currentRealm.maxExp || 120)) * 100, 100);
    const speed = this.systems?.cultivation?.getCultivationSpeed?.() || 1.0;
    const daysToNext = nextRealm ? Math.ceil((currentRealm.maxExp - player.exp) / speed) : '∞';

    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        ${this.renderer.renderStatsPanel()}
        ${this.renderer.renderRootPanel()}

        <div class="card">
          <h3> 修炼状态</h3>
          <div style="font-size:12px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between">
              <span>当前境界：${currentRealm.name}</span>
              <span>修为：${player.exp}/${currentRealm.maxExp}</span>
            </div>
            <div class="bar" style="margin:4px 0">
              <div class="fill fill-exp" style="width:${expPercent}%"></div>
            </div>
            <div style="color:#aaa;font-size:11px">
              修炼速度：${this.systems.cultivation.getCultivationSpeed().toFixed(1)}修为/天
              ${nextRealm ? ` | 突破还需约${daysToNext}天` : ''}
            </div>
          </div>
        </div>

        <div class="card">
          <h3>操作</h3>
          <div class="grid2">
            <button class="btn btn-primary" onclick="game.meditate(3)">打坐3天</button>
            <button class="btn btn-primary" onclick="game.meditate(7)">闭关7天</button>
          </div>
          <div class="grid2" style="margin-top:8px">
            <button class="btn btn-heal" onclick="game.rest(1)">休养1天</button>
            <button class="btn btn-heal" onclick="game.rest(3)">休养3天</button>
          </div>
          <div style="margin-top:8px">
            <button class="btn btn-explore" onclick="game.showExplore()" style="width:100%">探索</button>
          </div>
        </div>

        <div class="card">
          <h3>日志</h3>
          ${this.renderer.renderLogs()}
        </div>
        ${this.systems.tutorial.getProgress().mandatory === 100 ? this.systems.tutorial.renderOptionalHint() : ''}

        <div class="nav-bar">
          <div class="nav-item active" onclick="game.showPage('home')" style="position:relative">  首页 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('home'))}</div>
          <div class="nav-item" onclick="game.showPage('explore')" style="position:relative"> ️ 探索 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('explore'))}</div>
          <div class="nav-item" onclick="game.showPage('cultivation')" style="position:relative">  修炼</div>
          <div class="nav-item" onclick="game.showPage('inventory')" style="position:relative">  背包</div>
          <div class="nav-item" onclick="game.showPage('more')" style="position:relative">  更多</div>
        </div>
      </div>
    `;
    } catch (e) {
      console.error('渲染失败:', e);
      app.innerHTML = `<div class="game"><div class="card"><h3>渲染错误</h3><pre style="color:#e74c3c;font-size:12px;white-space:pre-wrap">${e.message}\n${e.stack}</pre><button class="btn btn-primary" onclick="location.reload()">刷新页面</button></div></div>`;
    }
  }

  // 获取物品数量
  getItemCount(itemId) {
    const item = this.state.inventory.find(i => i.id === itemId);
    return item ? item.count : 0;
  }

  // 背包分类筛选
  filterInventory(category) {
    const app = document.getElementById('app');
    if (!app) return;

    // 重新渲染背包页面，传入筛选类别
    const content = `
      <div class="card">
        <h3>背包</h3>
        ${this.renderer.renderInventory(category)}
      </div>
    `;

    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        ${content}
        <div class="nav-bar">
          <div class="nav-item" onclick="game.showPage('home')" style="position:relative">  首页 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('home'))}</div>
          <div class="nav-item" onclick="game.showPage('explore')" style="position:relative"> ️ 探索 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('explore'))}</div>
          <div class="nav-item" onclick="game.showPage('cultivation')" style="position:relative">  修炼 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('craft'))}</div>
          <div class="nav-item" onclick="game.showPage('craft')" style="position:relative"> ️ 制作</div>
          <div class="nav-item" onclick="game.showPage('beast')" style="position:relative">  灵兽</div>
          <div class="nav-item" onclick="game.showPage('bottle')" style="position:relative">  掌天瓶</div>
          <div class="nav-item" onclick="game.showPage('settings')" style="position:relative">⚙️</div>
        </div>
      </div>
    `;
  }

  // 休养（恢复气血，比例随境界递减）
  rest(days) {
    const player = this.state.player;
    const realmIdx = player.realmIdx || 0;

    // 根据境界确定恢复比例
    let dayRate1, dayRate3;
    if (realmIdx <= 1) {       // 凡人~练气
      dayRate1 = 0.15; dayRate3 = 0.35;
    } else if (realmIdx <= 3) { // 筑基~金丹
      dayRate1 = 0.10; dayRate3 = 0.25;
    } else if (realmIdx <= 5) { // 元婴~化神
      dayRate1 = 0.08; dayRate3 = 0.20;
    } else if (realmIdx <= 8) { // 炼虚~大乘
      dayRate1 = 0.05; dayRate3 = 0.12;
    } else {                    // 渡劫以上
      dayRate1 = 0.03; dayRate3 = 0.08;
    }

    const healPercent = days === 1 ? dayRate1 : dayRate3;
    const healAmount = Math.floor(player.maxHp * healPercent);
    const oldHp = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    const actualHeal = player.hp - oldHp;

    this.addLog(`休养${days}天，气血+${actualHeal}（${player.hp}/${player.maxHp}）`, 'success');
    this.showToast(`休养${days}天，恢复${actualHeal}气血`, 'success');

    // 使用时间系统8步结算
    const timeResults = this.systems.time.advanceTime(days);
    timeResults.forEach(r => {
      if (r && r.message) this.addLog(r.message, r.type === 'lifespan_warning' ? 'warning' : r.type === 'special_event' ? 'highlight' : '');
    });

    this.checkAchievements();
    this.checkDeath();
    this.showPage('home');
  }

  // 打坐修炼（使用时间系统8步结算）
  meditate(days) {
    const expGain = this.systems.cultivation.meditate(days);
    this.addLog(`打坐${days}天，修为+${expGain}`, 'success');
    this.showToast(`打坐${days}天完成，修为+${expGain}`, 'success');

    // 功法获得经验
    if (this.state.skills.main) {
      const skillExp = this.systems.skillUpgrade.gainExp(this.state.skills.main.id, 'main', days);
      if (skillExp > 0) {
        this.addLog(`主修功法${this.state.skills.main.name}经验+${skillExp}`, 'info');
      }
    }

    // 使用时间系统8步结算
    const timeResults = this.systems.time.advanceTime(days);
    timeResults.forEach(r => {
      if (r && r.message) this.addLog(r.message, r.type === 'lifespan_warning' ? 'warning' : r.type === 'special_event' ? 'highlight' : '');
      if (r && r.name) this.addLog(`特殊事件：${r.name} - ${r.effect}`, 'highlight');
    });

    this.checkBreakthrough();
    this.checkAchievements();
    this.checkDeath();
    // 留在修炼界面
    this.showPage('cultivation');
  }

  // 显示功法详情
  showSkillDetail(skillId, skillType) {
    const { SKILLS } = window.gameData;
    const allSkills = [...(SKILLS.main || []), ...(SKILLS.sub || []), ...(SKILLS.combat || [])];
    const skillData = allSkills.find(s => s.id === skillId);
    
    if (!skillData) {
      this.showToast('功法数据不存在', 'warning');
      return;
    }

    // 获取当前功法等级
    const currentSkill = this.state.skills[skillType === 'main' ? 'main' : skillType];
    const level = currentSkill?.level || 1;
    const maxLevel = skillData.maxLevel || 10;

    // 获取升级信息
    const upgradeInfo = this.systems.skillUpgrade.getSkillUpgradeInfo(skillId, skillType);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <button class="btn btn-heal" onclick="game.showPage('skills')" style="width:100%;margin-bottom:12px">← 返回功法列表</button>

          <div style="text-align:center;margin-bottom:12px">
            <div style="font-size:24px;color:#ffd700;margin-bottom:4px">${skillData.name}</div>
            <div style="font-size:12px;color:#aaa">${skillData.grade} · ${skillData.element || '无'}属性</div>
          </div>

          <div style="padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#4fc3f7;margin-bottom:6px">功法描述</div>
            <div style="font-size:12px;color:#ccc;line-height:1.5">${skillData.desc}</div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px">
            <div style="padding:8px;background:rgba(255,215,0,0.1);border-radius:6px;text-align:center">
              <div style="font-size:10px;color:#aaa">等级</div>
              <div style="font-size:14px;color:#ffd700;font-weight:bold">Lv.${level}/${maxLevel}</div>
            </div>
            <div style="padding:8px;background:rgba(79,195,247,0.1);border-radius:6px;text-align:center">
              <div style="font-size:10px;color:#aaa">修炼加成</div>
              <div style="font-size:14px;color:#4fc3f7;font-weight:bold">x${skillData.cultivationBonus || 1.0}</div>
            </div>
          </div>

          ${skillType === 'combat' ? `
            <div style="padding:10px;background:rgba(231,76,60,0.1);border-radius:8px;margin-bottom:12px">
              <div style="font-size:11px;color:#e74c3c;margin-bottom:6px">⚔️ 战斗属性</div>
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
                <div><span style="color:#aaa">伤害倍率:</span> <span style="color:#fff">${skillData.damageMultiplier || 1.0}x</span></div>
                <div><span style="color:#aaa">灵力消耗:</span> <span style="color:#fff">${skillData.mpCost || 0}</span></div>
                <div><span style="color:#aaa">暴击率:</span> <span style="color:#fff">${skillData.critBonus || 0}%</span></div>
                <div><span style="color:#aaa">特殊效果:</span> <span style="color:#fff">${skillData.specialEffect || '无'}</span></div>
              </div>
            </div>
          ` : `
            <div style="padding:10px;background:rgba(76,175,80,0.1);border-radius:8px;margin-bottom:12px">
              <div style="font-size:11px;color:#4caf50;margin-bottom:6px">  修炼属性</div>
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
                <div><span style="color:#aaa">修炼速度:</span> <span style="color:#fff">+${((skillData.cultivationBonus - 1) * 100).toFixed(0)}%</span></div>
                <div><span style="color:#aaa">突破加成:</span> <span style="color:#fff">+${skillData.breakthroughBonus || 0}%</span></div>
                <div><span style="color:#aaa">灵力消耗:</span> <span style="color:#fff">${skillData.mpCost || 0}/天</span></div>
                <div><span style="color:#aaa">特殊效果:</span> <span style="color:#fff">${skillData.specialEffect || '无'}</span></div>
              </div>
            </div>
          `}

          <div style="padding:10px;background:rgba(155,89,182,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#9b59b6;margin-bottom:6px">  获取方式</div>
            <div style="font-size:11px;color:#aaa">${skillData.source || '未知'}</div>
          </div>

          ${skillType === 'main' ? `
            <div style="font-size:10px;color:#aaa;text-align:center">
              * 主修功法决定你的修炼方向，切换需要转修期（黄级5天/玄级10天/地级15天/天级20天/灵级30天/仙级50天/神级100天）
            </div>
          ` : ''}

          ${upgradeInfo ? `
            <div style="padding:12px;background:rgba(76,175,80,0.1);border-radius:8px;border:1px solid rgba(76,175,80,0.3);margin-top:12px">
              <div style="font-size:12px;color:#4caf50;font-weight:bold;margin-bottom:8px">  功法升级</div>

              <div style="margin-bottom:8px">
                <div style="font-size:11px;color:#aaa;margin-bottom:4px">经验进度: ${upgradeInfo.exp}/${upgradeInfo.expRequired}</div>
                <div style="height:6px;background:rgba(0,0,0,0.3);border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${upgradeInfo.expPercent}%;background:linear-gradient(90deg,#4caf50,#8bc34a);transition:width 0.3s"></div>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px;margin-bottom:8px">
                <div><span style="color:#aaa">当前加成:</span> <span style="color:#fff">x${upgradeInfo.currentBonus.toFixed(2)}</span></div>
                <div><span style="color:#aaa">升级加成:</span> <span style="color:#4caf50">x${upgradeInfo.nextBonus.toFixed(2)}</span></div>
                <div><span style="color:#aaa">灵石消耗:</span> <span style="color:#ffd700">${upgradeInfo.cost}灵石</span></div>
                ${upgradeInfo.materials ? `
                  <div><span style="color:#aaa">突破材料:</span> <span style="color:#ff9800">${upgradeInfo.materials.map(m => `${m.name}x${m.count}`).join(', ')}</span></div>
                ` : ''}
              </div>

              ${upgradeInfo.awakenEffect ? `
                <div style="padding:6px;background:rgba(255,215,0,0.1);border-radius:6px;margin-bottom:8px">
                  <div style="font-size:10px;color:#ffd700">Lv.${level + 1}觉醒: ${upgradeInfo.awakenEffect.name}</div>
                  <div style="font-size:10px;color:#aaa">${upgradeInfo.awakenEffect.desc}</div>
                </div>
              ` : ''}

              <button class="btn btn-primary" onclick="game.upgradeSkill('${skillId}', '${skillType}')" ${upgradeInfo.canUpgrade ? '' : 'disabled'} style="width:100%">
                ${upgradeInfo.canUpgrade ? '升级功法' : '条件不足'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 显示物品详情
  showItemDetail(itemId) {
    const { ITEMS } = window.gameData;
    const allItems = [...(ITEMS.pills || []), ...(ITEMS.materials || []), ...(ITEMS.talismans || []), ...(ITEMS.artifacts || []), ...(ITEMS.specials || [])];
    const itemData = allItems.find(i => i.id === itemId);

    if (!itemData) {
      this.showToast('物品数据不存在', 'warning');
      return;
    }

    // 获取背包中的物品
    const inventoryItem = this.state.inventory.find(i => i.id === itemId);
    const count = inventoryItem?.count || 0;

    if (count === 0) {
      this.showToast('你没有这个物品', 'warning');
      return;
    }

    // 获取物品详情
    const weight = window.game?.systems?.weight?.getItemWeight(itemId) || 0;
    const totalWeight = weight * count;

    // 根据物品类型显示不同信息
    let typeInfo = '';
    let actionButtons = '';

    switch (itemData.type || 'material') {
      case 'pill':
        typeInfo = `
          <div style="padding:10px;background:rgba(76,175,80,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#4caf50;margin-bottom:6px">  丹药效果</div>
            <div style="font-size:12px;color:#fff;line-height:1.5">${itemData.effect || itemData.desc}</div>
            ${itemData.cooldown ? `<div style="font-size:10px;color:#aaa;margin-top:4px">冷却: ${itemData.cooldown}天</div>` : ''}
          </div>
        `;
        actionButtons = `
          <button class="btn btn-primary" onclick="game.useItem('${itemId}');game.showPage('inventory')" style="width:100%;margin-bottom:8px">使用</button>
          <button class="btn btn-heal" onclick="game.showPage('inventory')" style="width:100%">返回背包</button>
        `;
        break;

      case 'talisman':
        typeInfo = `
          <div style="padding:10px;background:rgba(155,89,182,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#9b59b6;margin-bottom:6px">  符箓效果</div>
            <div style="font-size:12px;color:#fff;line-height:1.5">${itemData.effect || itemData.desc}</div>
            ${itemData.uses ? `<div style="font-size:10px;color:#aaa;margin-top:4px">可用次数: ${itemData.uses}</div>` : ''}
          </div>
        `;
        actionButtons = `
          <button class="btn btn-primary" onclick="game.useItem('${itemId}');game.showPage('inventory')" style="width:100%;margin-bottom:8px">使用</button>
          <button class="btn btn-heal" onclick="game.showPage('inventory')" style="width:100%">返回背包</button>
        `;
        break;

      case 'artifact':
        typeInfo = `
          <div style="padding:10px;background:rgba(241,196,15,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#f1c40f;margin-bottom:6px">⚔️ 法宝属性</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
              <div><span style="color:#aaa">攻击力:</span> <span style="color:#fff">+${itemData.atk || 0}</span></div>
              <div><span style="color:#aaa">防御力:</span> <span style="color:#fff">+${itemData.def || 0}</span></div>
              <div><span style="color:#aaa">特殊效果:</span> <span style="color:#fff">${itemData.special || '无'}</span></div>
              <div><span style="color:#aaa">耐久度:</span> <span style="color:#fff">${itemData.durability || '∞'}</span></div>
            </div>
          </div>
        `;
        actionButtons = `
          <button class="btn btn-primary" onclick="game.equipArtifact('${itemId}');game.showPage('inventory')" style="width:100%;margin-bottom:8px">装备</button>
          <button class="btn btn-heal" onclick="game.showPage('inventory')" style="width:100%">返回背包</button>
        `;
        break;

      case 'skill':
        typeInfo = `
          <div style="padding:10px;background:rgba(52,152,219,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#3498db;margin-bottom:6px">  功法信息</div>
            <div style="font-size:12px;color:#fff;line-height:1.5">${itemData.desc}</div>
            <div style="font-size:10px;color:#aaa;margin-top:4px">品阶: ${itemData.grade || '未知'} | 属性: ${itemData.element || '无'}</div>
          </div>
        `;
        actionButtons = `
          <button class="btn btn-primary" onclick="game.learnSkill('${itemId}');game.showPage('inventory')" style="width:100%;margin-bottom:8px">修炼</button>
          <button class="btn btn-heal" onclick="game.showPage('inventory')" style="width:100%">返回背包</button>
        `;
        break;

      default: // material, special, quest
        typeInfo = `
          <div style="padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#aaa;margin-bottom:6px">物品描述</div>
            <div style="font-size:12px;color:#ccc;line-height:1.5">${itemData.desc || '无描述'}</div>
          </div>
        `;
        actionButtons = `
          <button class="btn btn-heal" onclick="game.showPage('inventory')" style="width:100%">返回背包</button>
        `;
        break;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <button class="btn btn-heal" onclick="game.showPage('inventory')" style="width:100%;margin-bottom:12px">← 返回背包</button>

          <div style="text-align:center;margin-bottom:12px">
            <div style="font-size:24px;margin-bottom:4px">${itemData.icon || ' '}</div>
            <div style="font-size:20px;color:#ffd700;margin-bottom:4px">${itemData.name}</div>
            <div style="font-size:12px;color:#aaa">${itemData.grade || ''} ${this.getItemTypeName(itemData, itemId)}</div>
          </div>

          ${typeInfo}

          <div style="padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:12px">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
              <div><span style="color:#aaa">持有数量:</span> <span style="color:#ffd700">${count}</span></div>
              <div><span style="color:#aaa">单件重量:</span> <span style="color:#fff">${weight}</span></div>
              <div><span style="color:#aaa">总重量:</span> <span style="color:#fff">${totalWeight.toFixed(2)}</span></div>
              <div><span style="color:#aaa">获取方式:</span> <span style="color:#fff">${itemData.source || '未知'}</span></div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            ${actionButtons}
          </div>
        </div>
      </div>
    `;
  }

  // 切换主修功法（转修期根据品阶不同）
  switchMainSkill(newSkillId) {
    const { SKILLS } = window.gameData;
    const newSkill = SKILLS.main.find(s => s.id === newSkillId);
    if (!newSkill) {
      this.addLog('功法不存在', 'warning');
      return;
    }

    // 检查是否拥有该功法
    const owned = this.state.inventory.find(i => i.id === newSkillId && i.type === 'skill');
    if (!owned) {
      this.addLog('你没有这部功法', 'warning');
      return;
    }

    // 检查灵根是否匹配
    if (newSkill.element !== '无' && newSkill.element !== this.state.player.root.mainElement) {
      this.addLog(`灵根不匹配，需要${newSkill.element}属性`, 'warning');
      return;
    }

    // 检查是否正在转修期
    const transmuteBuff = this.state.player.buffs?.find(b => b.type === 'transmute');
    if (transmuteBuff) {
      this.addLog('转修期中，无法切换功法', 'warning');
      return;
    }

    // 根据品阶确定转修期天数
    const transmuteDays = {
      '黄级': 5,
      '玄级': 10,
      '地级': 15,
      '天级': 20,
      '灵级': 30,
      '仙级': 50,
      '神级': 100
    };
    const days = transmuteDays[newSkill.grade] || 10;

    // 切换功法
    this.state.skills.main = { ...newSkill, level: 1 };

    // 添加转修期debuff
    this.state.player.buffs = this.state.player.buffs || [];
    this.state.player.buffs.push({
      type: 'transmute',
      duration: days,
      value: -0.5,
      name: '转修期'
    });

    this.addLog(`切换功法为${newSkill.name}，进入转修期（${days}天修炼速度-50%）`, 'success');
    this.showToast(`进入转修期：${days}天`, 'warning');
    this.render();
  }

  // 升级功法
  upgradeSkill(skillId, skillType) {
    const result = this.systems.skillUpgrade.upgradeSkill(skillId, skillType);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.showToast(result.text, 'warning');
    }
    // 刷新功法详情页面
    this.showSkillDetail(skillId, skillType);
  }

  // 使用感悟丹
  useInsightPill(skillId, skillType, pillId) {
    const result = this.systems.skillUpgrade.useInsightPill(skillId, skillType, pillId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.showToast(result.text, 'warning');
    }
    // 刷新功法详情页面
    this.showSkillDetail(skillId, skillType);
  }

  // 叛宗功能（GDD: 4种选项）
  betraySect() {
    if (!this.state.sect) {
      this.addLog('你不是任何宗门的弟子', 'warning');
      return;
    }

    const sectName = this.state.sect.name;

    // 显示叛宗选项
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>⚠️ 叛宗 - ${sectName}</h3>
          <div style="margin-bottom:15px;color:#aaa;font-size:12px">
            你确定要叛出${sectName}吗？这将带来严重后果。
          </div>
          <div class="grid2">
            <button class="btn btn-primary" onclick="game.betrayChoice('return')" style="font-size:12px">
              ①乖乖归还<br><span style="font-size:10px;color:#aaa">交还功法，平安离开</span>
            </button>
            <button class="btn btn-heal" onclick="game.betrayChoice('pretend')" style="font-size:12px">
              ②装作已忘<br><span style="font-size:10px;color:#aaa">按概率判定，失败触发追杀</span>
            </button>
            <button class="btn btn-combat" onclick="game.betrayChoice('force')" style="font-size:12px">
              ③强行保留<br><span style="font-size:10px;color:#aaa">全宗敌对+永久追杀</span>
            </button>
            <button class="btn btn-skill" onclick="game.betrayChoice('abolish')" style="font-size:12px">
              ④废功脱宗<br><span style="font-size:10px;color:#aaa">自废该宗门功法，安全离开</span>
            </button>
          </div>
          <button class="btn btn-heal" onclick="game.showPage('settings')" style="width:100%;margin-top:10px">返回</button>
        </div>
      </div>
    `;
  }

  // 处理叛宗选择
  betrayChoice(choice) {
    const sect = this.state.sect;
    if (!sect) return;

    switch (choice) {
      case 'return':
        // 乖乖归还：交还功法，平安离开
        this.state.skills.main = { id: 'basic_art', name: '基础吐纳法', grade: '黄级', desc: '基础修炼功法', cultivationBonus: 1.0 };
        this.state.sect = null;
        this.addLog(`交还${sect.name}功法，平安离开`, 'success');
        break;

      case 'pretend':
        // 装作已忘：80%成功，20%失败触发追杀
        if (Math.random() < 0.8) {
          this.state.sect = null;
          this.addLog('成功蒙混过关，平安离开', 'success');
        } else {
          this.addLog('被识破！触发追杀！', 'warning');
          // 触发追杀事件
          this.state.sectHostile = true;
          this.state.sect = null;
        }
        break;

      case 'force':
        // 强行保留：全宗敌对+永久追杀
        this.state.sectHostile = true;
        this.state.sect = null;
        this.state.factions = this.state.factions || {};
        this.state.factions[sect.id] = -100;
        this.addLog(`强行保留${sect.name}功法，全宗敌对！`, 'warning');
        break;

      case 'abolish':
        // 废功脱宗：自废该宗门功法，安全离开
        this.state.skills.main = { id: 'basic_art', name: '基础吐纳法', grade: '黄级', desc: '基础修炼功法', cultivationBonus: 1.0 };
        this.state.sect = null;
        this.state.player.exp = Math.floor(this.state.player.exp * 0.5);
        this.addLog('自废功法，修为减半，平安离开', 'success');
        break;
    }

    this.render();
  }

  // 检查陨落
  checkDeath() {
    const deathResult = this.systems.death.checkDeath();
    if (deathResult) {
      this.showDeathScreen(deathResult);
      return true;
    }
    // 寿元警告
    const info = this.systems.death.getDeathInfo();
    if (info.critical) {
      this.addLog(`⚠️ 寿元告急！剩余${info.remaining}年！`, 'warning');
    } else if (info.warning) {
      this.addLog(`⚠️ 寿元不足${info.remaining}年，请注意突破或延寿。`, 'warning');
    }
    return false;
  }

  // 显示陨落界面
  showDeathScreen(deathResult) {
    const app = document.getElementById('app');
    const player = this.state.player;
    const realmName = window.gameData?.REALMS?.[player.realmIdx]?.name || '凡人';

    app.innerHTML = `
      <div class="game">
        <div class="card" style="border-color:rgba(231,76,60,0.5)">
          <h3 style="color:#e74c3c">  陨落</h3>
          <div style="color:#ffd700;font-size:14px;margin-bottom:12px">${deathResult.cause.name}</div>
          <div style="color:#aaa;font-size:12px;margin-bottom:16px">${deathResult.cause.desc}</div>
          <div style="margin-bottom:12px">
            <div>最终境界：${realmName}</div>
            <div>年龄：${player.age.toFixed(1)}岁</div>
            <div>总游戏天数：${this.state.gameTime.totalDays}</div>
            <div>已解锁成就：${(this.state.achievements || []).length}个</div>
          </div>
          <div style="color:#4fc3f7;margin-bottom:8px">选择你的结局：</div>
          ${deathResult.availableEndings.map(ending => `
            <div class="inv-item" style="text-align:left;padding:10px;margin-bottom:6px;cursor:pointer" onclick="game.selectEnding('${ending.id}')">
              <div style="color:#ffd700;font-weight:bold">${ending.name}</div>
              <div style="font-size:11px;color:#aaa;margin-top:4px">${ending.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 选择结局
  selectEnding(endingId) {
    const result = this.systems.death.executeEnding(endingId);
    if (result.success) {
      // 显示结局文字
      const app = document.getElementById('app');
      const lines = result.text.split('\n');
      app.innerHTML = `
        <div class="game">
          <div class="card" style="border-color:rgba(255,215,0,0.3)">
            <h3 style="color:#ffd700">  ${this.systems.death.endings[endingId]?.name || '结局'}</h3>
            ${lines.map(l => `<div style="margin-bottom:6px;font-size:13px">${l}</div>`).join('')}
            ${result.gameOver ? `
              <div style="margin-top:16px;text-align:center">
                <button class="btn btn-primary" onclick="location.reload()">重新开始</button>
              </div>
            ` : `
              <div style="margin-top:16px;text-align:center">
                <button class="btn btn-primary" onclick="game.render()">继续修行</button>
              </div>
            `}
          </div>
        </div>
      `;
    }
  }

  // 使用金创药
  useHealPill() {
    const result = this.systems.inventory.useItem('heal_pill');
    if (result) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.addLog('无法使用金创药', 'warning');
      this.showToast('无法使用金创药', 'warning');
    }
    this.render();
  }

  // 使用物品
  useItem(itemId) {
    const result = this.systems.inventory.useItem(itemId);
    if (result) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.showToast('无法使用该物品', 'warning');
    }
    this.render();
  }

  // 检查突破
  checkBreakthrough() {
    if (this.systems.breakthrough.canBreakthrough()) {
      const rate = this.systems.breakthrough.calcSuccessRate();
      this.addLog(`修为已满，可尝试突破（成功率${rate}%）`, 'highlight');

      // 自动突破凡人期
      if (this.state.player.realmIdx === 0) {
        const result = this.systems.breakthrough.attempt();
        if (result.success) {
          this.addLog(`突破成功！从${result.oldRealm}晋升为${result.newRealm}！`, 'highlight');
        }
      }
    }
  }

  // 手动突破
  attemptBreakthrough() {
    const result = this.systems.breakthrough.attempt();
    if (result.success) {
      this.addLog(`突破成功！从${result.oldRealm}晋升为${result.newRealm}！`, 'highlight');
    } else if (result.goneWrong) {
      this.addLog(result.reason, 'warning');
      // 走火入魔可能触发陨落
      if (this.systems.breakthrough.calcSuccessRate() < 10) {
        const deathResult = this.systems.death.triggerDeath('madness');
        if (deathResult) {
          this.showDeathScreen(deathResult);
          return;
        }
      }
    } else {
      this.addLog(result.reason, 'warning');
    }
    this.checkDeath();
    this.checkOptionalTasks();
    // 留在修炼界面
    this.showPage('cultivation');
  }

  // 切换区域
  selectRegion(region) {
    this.state.currentRegion = region;
    this.state.currentLocation = null; // 退出地点详情
    this.showPage('explore');
  }

  // 进入地点
  enterLocation(locationId) {
    const { LOCATIONS } = window.gameData;
    const locations = LOCATIONS[this.state.currentRegion] || [];
    const location = locations.find(l => l.id === locationId);

    if (!location) {
      this.showToast('地点不存在', 'warning');
      return;
    }

    this.state.currentLocation = locationId;
    this.state.playerLocation = locationId;
    this.showToast(`进入${location.name}`, 'info');
    this.showPage('explore');
  }

  // 退出地点（返回地图）
  exitLocation() {
    this.state.currentLocation = null;
    this.showPage('explore');
  }

  // 进入地点的NPC界面
  enterLocationNpc(locationId) {
    this.state.currentRegion = this.state.currentRegion || 'renjie';
    this.state.selectedNpcId = null;
    this.renderNpcPage();
  }

  // 从地点选择NPC
  selectNpcFromLocation(npcId) {
    this.state.selectedNpcId = npcId;
    this.renderNpcPage();
  }

  // 探索（在地点内进行探索操作）
  explore(locationId) {
    const { LOCATIONS } = window.gameData;
    const locations = LOCATIONS[this.state.currentRegion] || [];
    const location = locations.find(l => l.id === locationId);

    if (!location) {
      this.showToast('地点不存在', 'warning');
      return;
    }

    this.state.currentLocation = locationId;
    this.state.playerLocation = locationId;
    this.state.stats.explorations++;

    const result = this.systems.exploration.explore(location);
    this.addLog(result.text, result.reward?.type === 'combat' ? 'warning' : '');

    if (result.reward) {
      if (result.reward.type === 'combat') {
        this.handleReward(result.reward);
        return; // 战斗界面由战斗系统处理，不刷新
      }
      this.handleReward(result.reward);
    }

    // 检查异火事件
    const fireResult = this.systems.forge.checkFireEvent(locationId);
    if (fireResult) {
      this.addLog(fireResult.text, 'success');
      this.systems.notification.notifyRareItem(this.systems.forge.strangeFires.find(f => f.id === fireResult.fireId)?.name || '异火');
    }

    // 检查事件链触发
    const chainTriggers = this.systems.eventChain.checkTrigger(locationId);
    for (const trigger of chainTriggers) {
      const result = this.systems.eventChain.executeStep(trigger.chainId, trigger.step.id);
      this.addLog(result.text, 'highlight');
      if (result.progress) {
        this.addLog(result.progress, 'info');
      }
      if (result.completion) {
        this.systems.notification.notifyRareItem(trigger.chain.name);
      }
    }

    this.checkAchievements();
    this.checkOptionalTasks();

    // 重新渲染地点详情页
    this.showPage('explore');
  }

  // 处理奖励
  handleReward(reward) {
    switch (reward.type) {
      case 'item':
        this.systems.inventory.addItem(reward.id, reward.count);
        // 查找物品中文名称
        const { ITEMS } = window.gameData;
        const allItems = [...(ITEMS.pills || []), ...(ITEMS.materials || []), ...(ITEMS.talismans || []), ...(ITEMS.artifacts || []), ...(ITEMS.special || [])];
        const itemData = allItems.find(i => i.id === reward.id);
        const itemName = itemData?.name || reward.id;
        this.addLog(`获得${itemName} x${reward.count}`, 'success');
        this.showToast(`获得${itemName} x${reward.count}`, 'success');
        break;
      case 'combat':
        this.startCombat(reward.enemy);
        break;
      case 'damage':
        this.addLog(`受到${reward.value}点伤害`, 'warning');
        break;
      case 'shop':
        this.showShop();
        break;
      case 'skill':
        this.addLog(`获得功法：${reward.skill.name}`, 'success');
        break;
    }
  }

  // 开始战斗
  startCombat(enemyType) {
    const enemy = this.systems.combat.startCombat(enemyType);
    this.addLog(`遭遇${enemy.name}！`, 'warning');
    this.renderCombat(enemy);
  }

  // 渲染战斗界面
  renderCombat(enemy) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderCombat(enemy)}
      </div>
    `;
  }

  // 战斗操作
  combat(action) {
    let result;

    switch (action) {
      case 'attack':
        result = this.systems.combat.playerAttack();
        break;
      case 'defend':
        result = this.systems.combat.defend();
        break;
      case 'escape':
        result = this.systems.combat.escape();
        break;
      case 'skill':
        // 显示技能选择
        this.showSkillSelect();
        return;
      case 'talisman':
        this.showTalismanSelect();
        return;
    }

    if (result) {
      this.state.combatLog = result.log || [];

      if (result.type === 'victory') {
        this.addLog(`战斗胜利！获得${result.exp}修为`, 'success');
        this.showToast(`战斗胜利！获得${result.exp}修为`, 'highlight');
        if (result.loot) {
          const { ITEMS } = window.gameData;
          const allItems = [...(ITEMS.pills || []), ...(ITEMS.materials || []), ...(ITEMS.talismans || []), ...(ITEMS.artifacts || []), ...(ITEMS.special || [])];
          result.loot.forEach(item => {
            this.systems.inventory.addItem(item.id, item.count);
            const itemData = allItems.find(i => i.id === item.id);
            const itemName = itemData?.name || item.id;
            this.addLog(`获得${itemName} x${item.count}`, 'success');
            this.showToast(`获得${itemName} x${item.count}`, 'success');
          });
        }
        this.state.stats.victories++;
        this.checkAchievements();
        // 秘境BOSS击败检查
        if (this.state.currentDungeon) {
          const dungeonResult = this.systems.dungeon.onBossDefeated();
          if (dungeonResult) {
            this.addLog(dungeonResult.text, 'success');
            if (dungeonResult.type === 'dungeon_complete') {
              this.addLog(`通关奖励：${dungeonResult.rewards.join('、')}`, 'highlight');
            }
          }
          this.showDungeonExplore();
          return;
        }
        this.render();
      } else if (result.type === 'npc_victory') {
        // 修士战斗胜利 → 三选一
        this.showNpcVictoryChoices(result);
        return;
      } else if (result.type === 'defeat') {
        this.addLog('战斗失败...', 'warning');
        this.showToast('战斗失败，你被击败了', 'error');
        this.render();
      } else if (result.type === 'escape') {
        this.addLog('逃跑成功', '');
        this.showToast('逃跑成功', 'success');
        this.render();
      } else if (result.type === 'enemy_escape') {
        this.addLog(`${this.systems.combat.enemy.name}逃跑了`, '');
        this.showToast(`${this.systems.combat.enemy.name}逃跑了`, 'warning');
        this.render();
      } else {
        // 继续战斗
        this.renderCombat(this.systems.combat.enemy);
      }
    }
  }

  // 显示修士战斗胜利选择（放走/搜刮/击杀）
  showNpcVictoryChoices(result) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        <div class="card">
          <h3>战斗胜利</h3>
          <div class="log-list">
            ${result.log.slice(-5).map(l => `<div class="log-item">${l}</div>`).join('')}
          </div>
          <div style="margin-top:12px">
            <div style="color:#ffd700;margin-bottom:8px">如何处置对方？</div>
            <div class="grid2">
              <button class="btn btn-primary" onclick="game.handleKillChoice('release')">放走</button>
              <button class="btn btn-explore" onclick="game.handleKillChoice('loot')">搜刮</button>
              <button class="btn btn-combat" onclick="game.handleKillChoice('kill')">击杀</button>
            </div>
            <div style="font-size:10px;color:#aaa;margin-top:6px">
              放走：无事发生<br>
              搜刮：获得对方灵石20~30%+随机1件物品<br>
              击杀：获得灵石50~100%+装备(50%)，但可能影响名望
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 处理击杀选择
  handleKillChoice(choice) {
    const result = this.systems.combat.handleKillChoice(choice);
    if (result.loot) {
      result.loot.forEach(item => {
        this.systems.inventory.addItem(item.id, item.count);
      });
    }
    result.log.forEach(l => this.addLog(l, ''));
    this.state.stats.victories++;
    this.checkAchievements();
    this.render();
  }

  // 显示技能选择
  showSkillSelect() {
    const skills = this.state.skills.combat || [];
    if (skills.length === 0) {
      this.addLog('没有可用的战斗技能', 'warning');
      this.showToast('还没有学习战斗技能', 'warning');
      this.renderCombat(this.systems.combat.enemy);
      return;
    }
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        <div class="card">
          <h3>选择技能</h3>
          ${skills.map(s => `
            <div class="skill-item" onclick="game.useCombatSkill('${s.id}')">
              <div class="skill-name">${s.name} <span class="grade">${s.grade}</span></div>
              <div class="skill-desc">消耗${s.mpCost}灵力 | ${s.desc}</div>
            </div>
          `).join('')}
          <button class="btn btn-heal" onclick="game.renderCombat(game.systems.combat.enemy)" style="margin-top:8px">返回</button>
        </div>
      </div>
    `;
  }

  // 使用战斗技能
  useCombatSkill(skillId) {
    const skills = this.state.skills.combat || [];
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    const result = this.systems.combat.useSkill(skill);
    if (result) {
      this.state.combatLog = result.log || [];
      if (result.type === 'victory') {
        this.addLog(`战斗胜利！获得${result.exp}修为`, 'success');
        if (result.loot) result.loot.forEach(item => { this.systems.inventory.addItem(item.id, item.count); });
        this.state.stats.victories++;
        this.checkAchievements();
        this.render();
      } else if (result.type === 'npc_victory') {
        this.showNpcVictoryChoices(result);
      } else if (result.type === 'defeat') {
        this.addLog('战斗失败...', 'warning');
        this.showToast('战斗失败，你被击败了', 'error');
        this.render();
      } else {
        this.renderCombat(this.systems.combat.enemy);
      }
    } else {
      this.addLog('灵力不足，无法释放技能', 'warning');
      this.showToast('灵力不足，无法释放技能', 'warning');
      this.renderCombat(this.systems.combat.enemy);
    }
  }

  // 显示符箓选择
  showTalismanSelect() {
    const talismans = this.state.inventory.filter(i => i.type === 'talisman');
    if (talismans.length === 0) {
      this.addLog('没有可用的符箓', 'warning');
      this.showToast('背包里没有符箓', 'warning');
      this.renderCombat(this.systems.combat.enemy);
      return;
    }
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        <div class="card">
          <h3>选择符箓</h3>
          ${talismans.map(t => `
            <div class="inv-item" onclick="game.useCombatTalisman('${t.id}')">
              <div class="icon"> </div>
              <div class="name">${t.name}</div>
              <div class="count">x${t.count}</div>
            </div>
          `).join('')}
          <button class="btn btn-heal" onclick="game.renderCombat(game.systems.combat.enemy)" style="margin-top:8px">返回</button>
        </div>
      </div>
    `;
  }

  // 使用战斗符箓
  useCombatTalisman(talismanId) {
    const { ITEMS } = window.gameData;
    const talismanData = ITEMS.talismans.find(t => t.id === talismanId);
    if (!talismanData) return;
    const result = this.systems.combat.useTalisman(talismanData);
    if (result) {
      // 消耗符箓
      const item = this.state.inventory.find(i => i.id === talismanId);
      if (item) {
        item.count--;
        if (item.count <= 0) this.state.inventory.splice(this.state.inventory.indexOf(item), 1);
      }
      this.state.combatLog = result.log || [];
      if (result.type === 'victory') {
        this.addLog(`战斗胜利！`, 'success');
        this.state.stats.victories++;
        this.render();
      } else if (result.type === 'defeat') {
        this.addLog('战斗失败...', 'warning');
        this.showToast('战斗失败，你被击败了', 'error');
        this.render();
      } else {
        this.renderCombat(this.systems.combat.enemy);
      }
    }
  }

  // 与NPC对话
  talkToNpc(npcId) {
    const result = this.systems.npc.talk(npcId);
    if (result.success) {
      this.addLog(`${result.npc}：${result.text}`, '');
      this.showToast(`${result.npc}：${result.text}`, 'info');
      this.checkAchievements();
      // 增加对话次数统计
      this.state.stats.npcTalks = (this.state.stats.npcTalks || 0) + 1;
      this.checkOptionalTasks();
    } else {
      this.showToast(result.text || '对话失败', 'warning');
    }
    // 保持NPC界面状态
    this.renderNpcPage();
  }

  // 选择NPC地区
  selectNpcRegion(regionId) {
    this.state.currentRegion = regionId;
    this.renderNpcPage();
  }

  // 选择NPC
  selectNpc(npcId) {
    this.state.selectedNpcId = npcId;
    this.renderNpcPage();
  }

  // 送给NPC礼物
  giveGiftToNpc(npcId) {
    // 获取背包中的物品
    const items = this.state.inventory.filter(i => i.count > 0);
    if (items.length === 0) {
      this.showToast('背包里没有物品', 'warning');
      return;
    }

    // 显示物品选择界面
    const app = document.getElementById('app');
    const npc = window.gameData?.NPCS?.find(n => n.id === npcId);
    if (!npc) return;

    app.innerHTML = `
      <div class="game">
        <div class="card">
          <h3>送给${npc.name}礼物</h3>
          <div style="font-size:12px;color:#aaa;margin-bottom:12px">选择要赠送的物品</div>
          <div style="max-height:300px;overflow-y:auto">
            ${items.map(item => {
              const itemData = this.getItemData(item.id);
              if (!itemData) return '';
              return `
                <div class="inv-item" onclick="game.confirmGiveGift('${npcId}', '${item.id}')">
                  <div class="icon">${itemData.icon || ' '}</div>
                  <div class="name">${itemData.name}</div>
                  <div class="count">x${item.count}</div>
                </div>
              `;
            }).join('')}
          </div>
          <button class="btn btn-heal" onclick="game.renderNpcPage()" style="margin-top:8px;width:100%">返回</button>
        </div>
      </div>
    `;
  }

  // 确认赠送礼物
  confirmGiveGift(npcId, itemId) {
    const result = this.systems.npc.giveGift(npcId, itemId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.showToast(result.text || '赠送失败', 'error');
    }
    // 返回NPC界面
    this.renderNpcPage();
  }

  // 接取NPC任务
  acceptNpcQuest(npcId) {
    const result = this.systems.npc.acceptQuest(npcId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.showToast(result.text || '接取失败', 'warning');
    }
    this.renderNpcPage();
  }

  // 与NPC交易
  tradeWithNpc(npcId) {
    // 简单实现：显示商店界面
    this.showToast('交易功能开发中...', 'info');
    this.addLog('交易功能开发中...', '');
  }

  // 前往NPC所在地
  goToNpcLocation(locationId) {
    // 找到NPC所在地区和地点
    const { LOCATIONS } = window.gameData;
    let foundRegion = null;
    let foundLocation = null;
    for (const [region, locations] of Object.entries(LOCATIONS)) {
      const loc = locations.find(l => l.id === locationId);
      if (loc) {
        foundRegion = region;
        foundLocation = loc;
        break;
      }
    }

    if (!foundRegion || !foundLocation) {
      this.showToast('地点不存在', 'warning');
      return;
    }

    // 检查境界限制
    const playerRealmIdx = this.state.player.realmIdx;
    const requiredRealmIdx = foundLocation.realmIdx || 0;
    if (playerRealmIdx < requiredRealmIdx) {
      const { REALMS } = window.gameData;
      const requiredRealm = REALMS[requiredRealmIdx]?.name || '未知境界';
      this.showToast(`境界不足，需要${requiredRealm}才能前往${foundLocation.name}`, 'warning');
      return;
    }

    this.state.currentRegion = foundRegion;
    this.state.currentLocation = locationId;
    this.state.playerLocation = locationId;
    this.showToast(`前往${foundLocation.name}`, 'info');
    this.showPage('explore');
  }

  // 获取物品数据
  getItemData(itemId) {
    const { ITEMS } = window.gameData || {};
    const allItems = [
      ...(ITEMS.pills || []),
      ...(ITEMS.materials || []),
      ...(ITEMS.artifacts || []),
      ...(ITEMS.talismans || []),
      ...(ITEMS.specials || [])
    ];
    return allItems.find(i => i.id === itemId);
  }

  // 获取物品类型名称
  getItemTypeName(itemData, itemId) {
    const { ITEMS } = window.gameData || {};
    if (ITEMS.pills?.some(i => i.id === itemId)) return '丹药';
    if (ITEMS.materials?.some(i => i.id === itemId)) return '材料';
    if (ITEMS.talismans?.some(i => i.id === itemId)) return '符箓';
    if (ITEMS.artifacts?.some(i => i.id === itemId)) return '法宝';
    if (ITEMS.specials?.some(i => i.id === itemId)) return '特殊';
    return '材料';
  }

  // 渲染NPC页面
  renderNpcPage() {
    const app = document.getElementById('app');
    if (!app) return;

    try {
      const content = this.renderer.renderNpcs();
      app.innerHTML = `
        <div class="game">
          <div class="card">
            <h3>  社交/NPC</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:12px">与NPC交流、送礼、接取任务</div>
            ${content}
          </div>
          <div class="nav-bar">
            <div class="nav-item" onclick="game.showPage('home')" style="position:relative">  首页</div>
            <div class="nav-item" onclick="game.showPage('explore')" style="position:relative"> ️ 探索</div>
            <div class="nav-item" onclick="game.showPage('cultivation')" style="position:relative">  修炼</div>
            <div class="nav-item" onclick="game.showPage('inventory')" style="position:relative">  背包</div>
            <div class="nav-item" onclick="game.showPage('more')" style="position:relative">  更多</div>
          </div>
        </div>
      `;
    } catch (e) {
      console.error('NPC页面渲染失败:', e);
      app.innerHTML = `<div class="game"><div class="card"><h3>页面渲染错误</h3><pre style="color:#e74c3c;font-size:12px;white-space:pre-wrap">${e.message}</pre><button class="btn btn-primary" onclick="game.showPage('home')">返回首页</button></div></div>`;
    }
  }

  // 显示探索页面
  showExplore() {
    this.showPage('explore');
  }

  // 显示商店
  showShop() {
    // TODO: 实现商店界面
    this.addLog('商店功能开发中...', '');
  }

  // 显示页面
  showPage(page) {
    const app = document.getElementById('app');
    let content = '';

    try {
    switch (page) {
      case 'home':
        this.render();
        return;
      case 'explore':
        const currentDungeon = this.systems?.dungeon?.getStatus?.() || null;
        const inLocation = this.state.currentLocation != null;
        content = `
          ${!inLocation && currentDungeon ? `
            <div class="card" style="border-color:rgba(155,89,182,0.4)">
              <h3 style="color:#9b59b6">⚔️ 当前秘境：${currentDungeon.dungeonName}</h3>
              <div style="font-size:12px;color:#aaa">第${currentDungeon.currentLayer + 1}层：${currentDungeon.layerName}</div>
              <button class="btn btn-skill" onclick="game.showDungeonExplore()" style="width:100%;margin-top:8px">返回秘境</button>
            </div>
          ` : ''}
          <div class="card">
            <h3>${inLocation ? '地点详情' : '探索区域'}</h3>
            ${this.renderer.renderLocations()}
          </div>
          ${!inLocation ? `
          <div class="card">
            <h3>秘境副本</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px">挑战多层秘境，获取稀有奖励</div>
            <button class="btn btn-skill" onclick="game.showDungeonList()" style="width:100%">查看秘境列表</button>
          </div>
          <div class="card">
            <h3>交易</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px">坊市·拍卖会·黑市</div>
            <button class="btn btn-explore" onclick="game.showTrade()" style="width:100%">前往交易</button>
          </div>
          <div class="card">
            <h3>日常任务</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px">完成任务获取灵石和奖励</div>
            <button class="btn btn-primary" onclick="game.showDailyQuests()" style="width:100%">查看日常任务</button>
          </div>
          ` : ''}
        `;
        break;
      case 'inventory':
        this.systems.tutorial.markBackpackVisited();
        content = `
          <div class="card">
            <h3>背包</h3>
            ${this.renderer.renderInventory()}
          </div>
        `;
        break;
      case 'skills':
        content = `
          <div class="card">
            <h3>功法</h3>
            ${this.renderer.renderSkills()}
          </div>
        `;
        break;
      case 'npc':
        content = `
          <div class="card">
            <h3>社交</h3>
            ${this.renderer.renderNpcs()}
          </div>
        `;
        break;
      case 'cultivation':
        const player = this.state.player;
        const realms = window.gameData?.REALMS || [];
        const currentRealm = realms[player.realmIdx] || { name: '凡人', maxExp: 120 };
        const nextRealm = realms[player.realmIdx + 1];
        const expPercent = Math.min((player.exp / currentRealm.maxExp) * 100, 100);

        content = `
          <div class="card">
            <h3> 修为修炼</h3>
            <div style="font-size:12px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between">
                <span>当前境界：${currentRealm.name}</span>
                <span>修为：${player.exp}/${currentRealm.maxExp}</span>
              </div>
              <div class="bar" style="margin:4px 0">
                <div class="fill fill-exp" style="width:${expPercent}%"></div>
              </div>
              <div style="color:#aaa;font-size:11px">
                修炼速度：${this.systems.cultivation.getCultivationSpeed().toFixed(1)}修为/天
              </div>
            </div>
            <div class="grid2">
              <button class="btn btn-primary" onclick="game.meditate(3)">打坐3天</button>
              <button class="btn btn-primary" onclick="game.meditate(7)">闭关7天</button>
            </div>
            <div class="grid2" style="margin-top:8px">
              <button class="btn btn-heal" onclick="game.rest(1)">休养1天</button>
              <button class="btn btn-heal" onclick="game.rest(3)">休养3天</button>
            </div>
            ${nextRealm ? `
              <div style="margin-top:12px;padding:10px;background:rgba(155,89,182,0.1);border-radius:8px;border:1px solid rgba(155,89,182,0.3)">
                <div style="font-size:12px;color:#9b59b6;font-weight:bold;margin-bottom:8px">  突破信息</div>
                <div style="font-size:11px;color:#aaa;line-height:1.8">
                  <div>目标境界：${nextRealm.name}</div>
                  <div>所需修为：${nextRealm.maxExp}</div>
                  <div>当前修为：${player.exp}/${currentRealm.maxExp}</div>
                  <div>成功率：${this.systems.breakthrough.calcSuccessRate()}%</div>
                  <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1)">
                    <div style="color:#ffd700;font-size:10px">成功率影响因素：</div>
                    <div style="font-size:10px;color:#888">• 灵根加成：${this.state.player.root.type.name}</div>
                    <div style="font-size:10px;color:#888">• 悟性加成：${Math.min(this.state.player.comprehension * 0.2, 20)}%</div>
                    <div style="font-size:10px;color:#888">• 机缘加成：${Math.min(this.state.player.fortune * 0.15, 15)}%</div>
                  </div>
                </div>
                <button class="btn btn-skill" onclick="game.attemptBreakthrough()" style="width:100%;margin-top:8px">尝试突破</button>
              </div>
            ` : ''}
          </div>
          ${this.renderer.renderBodyPanel()}
          ${this.renderer.renderSensePanel()}
        `;
        break;
      case 'craft':
        content = `
          <div class="card">
            <h3>异火/丹炉</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px">装备异火和丹炉提升炼丹成功率</div>
            <button class="btn btn-explore" onclick="game.showForge()" style="width:100%">管理异火/丹炉</button>
          </div>
          ${this.renderer.renderTalismanPanel()}
          ${this.renderer.renderArtifactPanel()}
        `;
        break;
      case 'beast':
        content = `
          ${this.renderer.renderBeastPanel()}
          ${this.renderer.renderPuppetPanel()}
        `;
        break;
      case 'bottle':
        content = this.renderer.renderBottlePanel();
        break;
      case 'more':
        content = `
          <div class="card">
            <h3>更多功能</h3>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="btn btn-skill" onclick="game.showPage('skills')" style="width:100%">  功法（修炼/战斗功法）</button>
              <button class="btn btn-combat" onclick="game.showEquipment()" style="width:100%">⚔️ 装备栏（法宝装备）</button>
              <button class="btn btn-explore" onclick="game.showPage('craft')" style="width:100%"> ️ 制作（炼丹/制符/法宝）</button>
              <button class="btn btn-primary" onclick="game.showPage('beast')" style="width:100%">  灵兽/傀儡</button>
              <button class="btn btn-heal" onclick="game.showPage('bottle')" style="width:100%">  掌天瓶</button>
              <button class="btn btn-skill" onclick="game.showSectPage()" style="width:100%">  宗门</button>
              <button class="btn btn-explore" onclick="game.showAchievements()" style="width:100%">  成就系统</button>
              <button class="btn btn-skill" onclick="game.showPage('settings')" style="width:100%">⚙️ 设置/存档</button>
            </div>
          </div>
        `;
        break;
      case 'settings':
        content = `
          <div class="card">
            <h3>设置</h3>
            <div class="grid2">
              <button class="btn btn-save" onclick="game.saveGame()">保存游戏</button>
              <button class="btn btn-load" onclick="game.loadGame()">读取存档</button>
              <button class="btn btn-heal" onclick="game.resetGame()">重置游戏</button>
            </div>
          </div>
        `;
        break;
    }

    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        ${content}
        <div class="nav-bar">
          <div class="nav-item" onclick="game.showPage('home')" style="position:relative">  首页 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('home'))}</div>
          <div class="nav-item ${page === 'explore' ? 'active' : ''}" onclick="game.showPage('explore')" style="position:relative"> ️ 探索 ${this.systems.notification.renderRedDot(this.systems.notification.getRedDot('explore'))}</div>
          <div class="nav-item ${page === 'cultivation' ? 'active' : ''}" onclick="game.showPage('cultivation')" style="position:relative">  修炼</div>
          <div class="nav-item ${page === 'inventory' ? 'active' : ''}" onclick="game.showPage('inventory')" style="position:relative">  背包</div>
          <div class="nav-item ${page === 'more' ? 'active' : ''}" onclick="game.showPage('more')" style="position:relative">  更多</div>
        </div>
      </div>
    `;
    } catch (e) {
      console.error('页面渲染失败:', e);
      app.innerHTML = `<div class="game"><div class="card"><h3>页面渲染错误</h3><pre style="color:#e74c3c;font-size:12px;white-space:pre-wrap">${e.message}</pre><button class="btn btn-primary" onclick="game.showPage('home')">返回首页</button></div></div>`;
    }
  }

  // 显示成就页面
  showAchievements() {
    const achievements = this.state.achievements || [];
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>  成就系统</h3>
          <button class="btn btn-heal" onclick="game.showPage('more')" style="width:100%">← 返回更多</button>
        </div>
        <div class="card">
          <h3>已解锁成就 (${achievements.length}/33)</h3>
          <div style="max-height:400px;overflow-y:auto">
            ${achievements.length === 0 ? '<div class="empty">暂无成就</div>' :
              achievements.map(a => `
                <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px">
                  <div style="color:#ffd700;font-size:12px">${a.name}</div>
                  <div style="font-size:11px;color:#aaa">${a.desc}</div>
                  ${a.reward ? `<div style="font-size:10px;color:#4ad06a">奖励：${a.reward.exp ? a.reward.exp+'修为' : ''}${a.reward.stones ? a.reward.stones+'灵石' : ''}</div>` : ''}
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 显示宗门页面
  showSectPage() {
    const sect = this.state.sect;
    const app = document.getElementById('app');
    const currentLocation = this.state.playerLocation;

    if (!sect) {
      // 没有加入宗门，显示可加入宗门列表
      const { SECTS, LOCATIONS } = window.gameData;
      const sects = SECTS?.slice(0, 20) || []; // 显示前20个宗门
      const allLocations = Object.values(LOCATIONS || {}).flat();

      app.innerHTML = `
        <div class="game">
          ${this.renderer.renderStatusBar()}
          <div class="card">
            <h3>  宗门</h3>
            <button class="btn btn-heal" onclick="game.showPage('more')" style="width:100%">← 返回更多</button>
          </div>
          <div class="card">
            <h3>加入宗门</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px">选择一个宗门加入，获得专属功法和资源</div>
            <div style="font-size:10px;color:#4fc3f7;margin-bottom:8px">⚠️ 需要到达宗门所在位置才能加入</div>
            ${sects.map(s => {
              const locData = allLocations.find(l => l.id === s.location);
              const locName = locData?.name || s.location;
              const isAtLocation = currentLocation === s.location;
              return `
                <div class="inv-item" style="text-align:left;padding:10px;margin-bottom:6px;cursor:pointer;${isAtLocation ? 'border-color:rgba(76,175,80,0.5)' : 'opacity:0.8'}" onclick="game.joinSect('${s.id}')">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="color:#ffd700;font-weight:bold">${s.name}</span>
                    <span style="font-size:10px;color:${s.type === '正道' ? '#4ad06a' : '#e74c3c'}">${s.type}</span>
                  </div>
                  <div style="font-size:11px;color:#aaa;margin-top:4px">${s.desc || '暂无描述'}</div>
                  <div style="font-size:10px;margin-top:2px">
                    <span style="color:#888">位置：${locName}</span>
                    ${isAtLocation ? '<span style="color:#4ad06a;margin-left:8px">✓ 当前位置</span>' : '<span style="color:#e74c3c;margin-left:8px">需前往</span>'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      // 已加入宗门，显示宗门详情
      const { SECTS, LOCATIONS } = window.gameData;
      const sectData = SECTS?.find(s => s.id === sect.id);
      const allLocations = Object.values(LOCATIONS || {}).flat();
      const locData = allLocations.find(l => l.id === sectData?.location);
      const locName = locData?.name || sectData?.location || '未知';

      app.innerHTML = `
        <div class="game">
          ${this.renderer.renderStatusBar()}
          <div class="card">
            <h3>  ${sect.name}</h3>
            <button class="btn btn-heal" onclick="game.showPage('more')" style="width:100%">← 返回更多</button>
          </div>
          <div class="card">
            <h3>宗门信息</h3>
            <div style="margin-bottom:8px">
              <div>职位：<span style="color:#ffd700">${sect.rank}</span></div>
              <div>贡献：<span style="color:#ffd700">${sect.contribution}</span></div>
              <div>类型：<span style="color:${sectData?.type === '正道' ? '#4ad06a' : '#e74c3c'}">${sectData?.type || '未知'}</span></div>
              <div>位置：<span style="color:#4fc3f7">${locName}</span></div>
            </div>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px">${sectData?.desc || '暂无描述'}</div>
          </div>
          <div class="card">
            <h3>操作</h3>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="btn btn-primary" onclick="game.doSectQuest()" style="width:100%">  宗门任务</button>
              <button class="btn btn-explore" onclick="game.exchangeContribution()" style="width:100%">  贡献兑换</button>
              <button class="btn btn-heal" onclick="game.betraySect()" style="width:100%;background:rgba(231,76,60,0.3);border-color:rgba(231,76,60,0.5)">  叛宗</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 加入宗门
  joinSect(sectId) {
    const result = this.systems.sect.join(sectId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showSectPage();
    } else {
      this.addLog(result.text, 'warning');
    }
  }

  // 执行宗门任务
  doSectQuest() {
    if (!this.state.sect) {
      this.addLog('你没有加入任何宗门', 'warning');
      return;
    }

    // 简单的宗门任务：消耗1天，获得贡献
    const timeResult = this.systems.time.advanceTime(1);
    timeResult.forEach(r => {
      if (r && r.message) this.addLog(r.message, '');
    });

    const contribution = Math.floor(Math.random() * 20) + 10;
    const result = this.systems.sect.addContribution(contribution);
    this.addLog(`完成宗门任务，贡献+${contribution}`, 'success');

    if (result.rank) {
      this.addLog(`恭喜！你晋升为${result.rank}！`, 'highlight');
    }

    this.showSectPage();
  }

  // 贡献兑换
  exchangeContribution() {
    if (!this.state.sect) {
      this.addLog('你没有加入任何宗门', 'warning');
      return;
    }

    const contribution = this.state.sect.contribution;
    if (contribution < 50) {
      this.addLog('贡献不足50，无法兑换', 'warning');
      return;
    }

    // 兑换：消耗50贡献，获得随机物品
    this.state.sect.contribution -= 50;
    const items = ['heal_pill', 'spirit_herb', 'iron_ore'];
    const itemId = items[Math.floor(Math.random() * items.length)];
    const count = Math.floor(Math.random() * 3) + 1;

    this.systems.inventory.addItem(itemId, count);
    this.addLog(`消耗50贡献，兑换获得${itemId} x${count}`, 'success');
    this.showSectPage();
  }

  // 添加日志
  addLog(text, type = '') {
    this.state.logs.push({ text, type });
    if (this.state.logs.length > 50) {
      this.state.logs.shift();
    }
  }

  // 显示悬浮弹窗提示
  showToast(message, type = 'success', duration = 2000) {
    // 移除已有的toast
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;

    // 添加样式
    toast.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: bold;
      z-index: 9999;
      animation: toastIn 0.3s ease forwards;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 80%;
      text-align: center;
    `;

    // 根据类型设置颜色
    switch (type) {
      case 'success':
        toast.style.background = 'linear-gradient(135deg, #4ad06a, #2ecc71)';
        toast.style.color = '#fff';
        break;
      case 'warning':
        toast.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
        toast.style.color = '#fff';
        break;
      case 'error':
        toast.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        toast.style.color = '#fff';
        break;
      case 'highlight':
        toast.style.background = 'linear-gradient(135deg, #ffd700, #f39c12)';
        toast.style.color = '#000';
        break;
      default:
        toast.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        toast.style.color = '#fff';
    }

    document.body.appendChild(toast);

    // 自动消失
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // 检查成就
  checkAchievements() {
    const newAchievements = this.systems.achievement.check();
    newAchievements.forEach(a => {
      this.addLog(`成就解锁：${a.name}`, 'highlight');
      if (a.reward) {
        if (a.reward.exp) this.state.player.exp += a.reward.exp;
        if (a.reward.stones) this.state.player.spiritStones += a.reward.stones;
      }
    });
  }

  // === 秘境系统UI ===

  // 显示秘境列表
  showDungeonList() {
    const dungeons = this.systems.dungeon.getAvailableDungeons();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>秘境副本</h3>
          ${dungeons.map(d => `
            <div class="inv-item" style="text-align:left;padding:10px;margin-bottom:6px;${d.available ? 'cursor:pointer' : 'opacity:0.5'}" ${d.available ? `onclick="game.enterDungeon('${d.id}')"` : ''}>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="color:#ffd700;font-weight:bold">${d.name}</span>
                <span style="font-size:10px;color:${d.available ? '#4ad06a' : '#aaa'}">${d.status}</span>
              </div>
              <div style="font-size:11px;color:#aaa;margin-top:4px">${d.desc}</div>
              <div style="font-size:10px;color:#666;margin-top:2px">
                层数:${d.layers} | 入口:${d.entryName || d.entry} | 推荐:${window.gameData?.REALMS?.[d.minRealmIdx]?.name || '?'}~${window.gameData?.REALMS?.[d.maxRealmIdx]?.name || '?'}
                ${d.cd > 0 ? ` | CD:${d.cd}年` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-heal" onclick="game.showPage('explore')" style="width:100%">返回探索</button>
      </div>
    `;
  }

  // 进入秘境
  enterDungeon(dungeonId) {
    const result = this.systems.dungeon.enterDungeon(dungeonId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showDungeonExplore();
    } else {
      this.addLog(result.text, 'warning');
    }
  }

  // 显示秘境探索界面
  showDungeonExplore() {
    const status = this.systems.dungeon.getStatus();
    if (!status) {
      this.showDungeonList();
      return;
    }

    const dungeon = this.systems.dungeon.dungeons.find(d => d.id === status.id);
    const layer = dungeon?.layersData?.[status.currentLayer];

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card" style="border-color:rgba(155,89,182,0.4)">
          <h3 style="color:#9b59b6">⚔️ ${status.dungeonName}</h3>
          <div style="color:#ffd700;font-size:14px;margin-bottom:8px">第${status.currentLayer + 1}层：${status.layerName}</div>
          <div style="font-size:12px;color:#aaa">
            探索次数：${status.explored}/${status.maxExplore}
            ${status.hasBoss ? `<br><span style="color:#e74c3c">BOSS：${status.bossName}</span>` : '<br><span style="color:#4ad06a">本层BOSS已击败</span>'}
          </div>
        </div>
        <div class="card">
          <h3>操作</h3>
          <div class="grid2">
            <button class="btn btn-explore" onclick="game.dungeonExplore()" ${status.explored >= status.maxExplore ? 'disabled' : ''}>
              探索 (${status.maxExplore - status.explored}次)
            </button>
            ${status.hasBoss ? `
              <button class="btn btn-combat" onclick="game.dungeonChallengeBoss()">⚔️ 挑战BOSS</button>
            ` : `
              <button class="btn btn-primary" onclick="game.dungeonNextLayer()" ${status.currentLayer >= status.totalLayers - 1 ? 'disabled' : ''}>
                下一层
              </button>
            `}
          </div>
          <button class="btn btn-heal" onclick="game.dungeonLeave()" style="width:100%;margin-top:8px">离开秘境</button>
        </div>
        <div class="card">
          <h3>日志</h3>
          ${this.renderer.renderLogs()}
        </div>
      </div>
    `;
  }

  // 秘境探索
  dungeonExplore() {
    const result = this.systems.dungeon.exploreLayer();
    if (!result.success) {
      this.addLog(result.text, 'warning');
      this.showDungeonExplore();
      return;
    }

    switch (result.type) {
      case 'event':
        this.addLog(result.text, '');
        if (result.reward) {
          this.handleReward(result.reward);
        }
        break;
      case 'combat':
        this.addLog(result.text, 'warning');
        this.startCombat(result.enemyType);
        return; // 战斗后不刷新，由战斗系统处理
      case 'nothing':
        this.addLog(result.text, '');
        break;
    }

    this.addLog(`剩余探索次数：${result.remaining}`, '');
    this.showDungeonExplore();
  }

  // 秘境挑战BOSS
  dungeonChallengeBoss() {
    const result = this.systems.dungeon.challengeBoss();
    if (result.success) {
      this.addLog(result.text, 'warning');
      this.startCombat(result.enemyType);
    } else {
      this.addLog(result.text, 'warning');
    }
  }

  // 秘境下一层
  dungeonNextLayer() {
    const result = this.systems.dungeon.nextLayer();
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
      if (result.needBoss) {
        this.addLog(`需要先击败BOSS：${result.bossName}`, 'warning');
      }
    }
    this.showDungeonExplore();
  }

  // 离开秘境
  dungeonLeave() {
    const result = this.systems.dungeon.leaveDungeon();
    if (result.success) {
      this.addLog(result.text, result.completed ? 'success' : '');
    }
    this.render();
  }

  // === 交易系统UI ===

  // 显示交易页面
  showTrade() {
    const location = this.state.currentLocation;
    const shops = this.systems.trade.getShopsForLocation(location);
    const allLocations = Object.values(window.gameData?.LOCATIONS || {}).flat();
    const loc = allLocations.find(l => l.id === location);
    const locName = loc?.name || location;

    const bmCheck = this.systems.trade.hasBlackMarketAccess();
    const auctionCheck = this.systems.trade.canAttendAuction();

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>  交易 · ${locName}</h3>
          <button class="btn btn-heal" onclick="game.showPage('explore')" style="width:100%">← 返回探索</button>
          ${shops.length === 0 ? '<div class="empty">此处没有商店</div>' : `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
              ${shops.map(s => `<div class="inv-item" style="flex:1;min-width:80px;cursor:pointer" onclick="game.showShopDetail('${Object.keys(this.systems.trade.shops).find(k => this.systems.trade.shops[k] === s) || ''}')">${s.type === 'pill' ? ' ' : s.type === 'artifact' ? '⚔️' : s.type === 'talisman' ? ' ' : s.type === 'skill' ? ' ' : s.type === 'rare' ? '✨' : ' '} ${s.name.split('·')[1]}</div>`).join('')}
            </div>
          `}
        </div>
        <div class="card">
          <h3>拍卖会</h3>
          ${auctionCheck.canAttend ?
            `<button class="btn btn-skill" onclick="game.attendAuction()" style="width:100%">参加拍卖会（入场费1000灵石）</button>` :
            `<div style="font-size:12px;color:#aaa">下次拍卖会还有${auctionCheck.remaining}天</div>`
          }
        </div>
        <div class="card">
          <h3>黑市</h3>
          ${bmCheck ?
            `<button class="btn btn-explore" onclick="game.enterBlackMarket()" style="width:100%">进入黑市</button>` :
            `<button class="btn btn-heal" onclick="game.discoverBlackMarket()" style="width:100%">尝试寻找黑市入口</button>`
          }
        </div>
        <div class="card">
          <h3>背包出售</h3>
          <button class="btn btn-primary" onclick="game.showSellList()" style="width:100%">查看可出售物品</button>
        </div>
      </div>
    `;
  }

  // 显示商店详情
  showShopDetail(shopId) {
    const shop = this.systems.trade.shops[shopId];
    if (!shop) return;

    const items = this.systems.trade.getShopItems(shopId);
    const currency = shop.currency === 'spirit_crystal' ? '灵晶' : shop.currency === 'immortal_stone' ? '仙灵石' : '灵石';

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>${shop.name}</h3>
          <div style="font-size:12px;color:#aaa;margin-bottom:8px">货币: ${currency} | 持有: ${shop.currency === 'spirit_crystal' ? (this.state.player.spiritCrystals || 0) : shop.currency === 'immortal_stone' ? (this.state.player.immortalStones || 0) : this.state.player.spiritStones}</div>
          ${items.map(item => `
            <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px;cursor:pointer" onclick="game.buyFromShop('${shopId}', '${item.id}')">
              <div style="display:flex;justify-content:space-between">
                <span style="color:#ffd700;font-size:12px">${item.name}</span>
                <span style="font-size:11px;color:#f39c12">${item.price} ${currency}</span>
              </div>
              ${item.limit ? `<div style="font-size:10px;color:#aaa">限购${item.limit}</div>` : ''}
            </div>
          `).join('')}
        </div>
        <button class="btn btn-heal" onclick="game.showTrade()" style="width:100%">返回交易</button>
      </div>
    `;
  }

  // 购买物品
  buyFromShop(shopId, itemId) {
    const result = this.systems.trade.buyItem(shopId, itemId, 1);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    // 刷新商店页面
    this.showShopDetail(shopId);
  }

  // 显示出售列表
  showSellList() {
    const inventory = this.state.inventory.filter(i => i.count > 0);
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>出售物品</h3>
          ${inventory.length === 0 ? '<div class="empty">背包空空如也</div>' :
            inventory.map(item => {
              const { ITEMS } = window.gameData;
              const itemData = [...(ITEMS.pills || []), ...(ITEMS.materials || []), ...(ITEMS.talismans || []), ...(ITEMS.artifacts || [])].find(i => i.id === item.id);
              const sellPrice = Math.floor((itemData?.sellPrice || itemData?.cost || 10) * 0.4);
              return `
                <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px;cursor:pointer" onclick="game.sellItemFromInv('${item.id}')">
                  <div style="display:flex;justify-content:space-between">
                    <span style="font-size:12px">${item.name || item.id} x${item.count}</span>
                    <span style="font-size:11px;color:#4ad06a">${sellPrice} 灵石/个</span>
                  </div>
                </div>
              `;
            }).join('')
          }
        </div>
        <button class="btn btn-heal" onclick="game.showTrade()" style="width:100%">返回交易</button>
      </div>
    `;
  }

  // 出售物品
  sellItemFromInv(itemId) {
    const result = this.systems.trade.sellItem(itemId, 1);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.showSellList();
  }

  // 参加拍卖会
  attendAuction() {
    const result = this.systems.trade.attendAuction();
    if (!result.success) {
      this.addLog(result.text, 'warning');
      this.showTrade();
      return;
    }
    this.addLog(result.text, 'success');

    // 显示拍卖界面
    const items = result.items;
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>  拍卖会</h3>
          <div style="font-size:12px;color:#aaa;margin-bottom:8px">当前灵石：${this.state.player.spiritStones}</div>
          ${items.length === 0 ? '<div class="empty">没有拍品</div>' :
            items.map((item, i) => `
              <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px">
                <div style="color:#ffd700;font-size:12px">${item.name}</div>
                <div style="font-size:11px;color:#aaa">当前价：${item.currentPrice}灵石 | 出价次数：${item.bidCount}</div>
                <button class="btn btn-skill" style="margin-top:4px;padding:6px;font-size:11px" onclick="game.bidItem(${i})">出价</button>
              </div>
            `).join('')
          }
        </div>
        <button class="btn btn-heal" onclick="game.showTrade()" style="width:100%">返回交易</button>
      </div>
    `;

    this.currentAuctionItems = items;
  }

  // 竞拍
  bidItem(index) {
    if (!this.currentAuctionItems || !this.currentAuctionItems[index]) return;
    const item = this.currentAuctionItems[index];
    const bidPrice = item.currentPrice + 100; // 加价100
    const result = this.systems.trade.bid(item, bidPrice);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    // 刷新拍卖页面
    this.attendAuction();
  }

  // 发现黑市
  discoverBlackMarket() {
    const result = this.systems.trade.discoverBlackMarket();
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.showTrade();
  }

  // 进入黑市
  enterBlackMarket() {
    const result = this.systems.trade.enterBlackMarket();
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showTrade();
    } else {
      this.addLog(result.text, 'warning');
      this.showTrade();
    }
  }

  // === 日常任务系统UI ===

  // 显示日常任务列表
  showDailyQuests() {
    const status = this.systems.daily.getStatus();
    const quests = this.systems.daily.getAvailableQuests();
    const active = status.activeQuests;
    const location = this.state.currentLocation;
    const allLocations = Object.values(window.gameData?.LOCATIONS || {}).flat();
    const loc = allLocations.find(l => l.id === location);
    const locName = loc?.name || location;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>  日常任务 · ${locName}</h3>
          <button class="btn btn-heal" onclick="game.showPage('explore')" style="width:100%">← 返回探索</button>
          <div style="font-size:12px;color:#aaa;margin-bottom:8px;margin-top:8px">
            每日可完成：${status.dailyCompleted}/${status.maxDailyCompleted}
          </div>
        </div>

        ${active.length > 0 ? `
          <div class="card">
            <h3 style="color:#4caf50">进行中</h3>
            ${active.map(q => `
              <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#ffd700;font-size:12px">${q.name}</span>
                  <span style="font-size:10px;color:#4caf50">${Math.min(q.currentCount, q.targetCount || 1)}/${q.targetCount || 1}</span>
                </div>
                <div style="font-size:11px;color:#aaa">${q.description}</div>
                <div style="font-size:10px;color:#666;margin-top:2px">奖励：${this.formatQuestReward(q.rewards)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="card">
          <h3>可接取任务</h3>
          ${quests.length === 0 ? '<div class="empty">暂无可用任务</div>' :
            quests.map(q => `
              <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px;cursor:pointer" onclick="game.showQuestDetail('${q.id}')">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#ffd700;font-size:12px">${q.name}</span>
                  <span style="font-size:10px;color:#4caf50">点击查看</span>
                </div>
                <div style="font-size:11px;color:#aaa">${q.description}</div>
                <div style="font-size:10px;color:#666;margin-top:2px">奖励：${this.formatQuestReward(q.rewards)}</div>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  }

  // 格式化任务奖励
  formatQuestReward(rewards) {
    const parts = [];
    if (rewards.stone) parts.push(`${rewards.stone}灵石`);
    if (rewards.crystal) parts.push(`${rewards.crystal}灵晶`);
    if (rewards.immortal_stone) parts.push(`${rewards.immortal_stone}仙灵石`);
    if (rewards.exp) parts.push(`${rewards.exp}修为`);
    if (rewards.fame) parts.push(`${rewards.fame}名望`);
    if (rewards.contribution) parts.push(`${rewards.contribution}贡献`);
    if (rewards.items) parts.push(rewards.items.map(i => `${i.id}x${i.count}`).join('、'));
    return parts.join(' + ') || '无';
  }

  // 显示任务详情
  showQuestDetail(questId) {
    const quests = this.systems.daily.getAvailableQuests();
    const quest = quests.find(q => q.id === questId);

    if (!quest) {
      this.showToast('任务不存在', 'warning');
      return;
    }

    // 获取任务类型描述
    let targetType = '';
    switch (quest.target) {
      case 'kill': targetType = '击杀'; break;
      case 'gather': targetType = '采集'; break;
      case 'travel': targetType = '护送/旅行'; break;
      case 'escort': targetType = '护送'; break;
      case 'scout': targetType = '侦察'; break;
      case 'patrol': targetType = '巡逻'; break;
      default: targetType = '完成';
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <button class="btn btn-heal" onclick="game.showDailyQuests()" style="width:100%;margin-bottom:12px">← 返回任务列表</button>

          <div style="text-align:center;margin-bottom:12px">
            <div style="font-size:24px;margin-bottom:4px"> </div>
            <div style="font-size:20px;color:#ffd700;margin-bottom:4px">${quest.name}</div>
            <div style="font-size:12px;color:#aaa">日常任务</div>
          </div>

          <div style="padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#4fc3f7;margin-bottom:6px">任务描述</div>
            <div style="font-size:12px;color:#ccc;line-height:1.5">${quest.description}</div>
          </div>

          <div style="padding:10px;background:rgba(52,152,219,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#3498db;margin-bottom:6px">任务目标</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
              <div><span style="color:#aaa">类型:</span> <span style="color:#fff">${targetType}</span></div>
              <div><span style="color:#aaa">目标数量:</span> <span style="color:#fff">${quest.targetCount || 1}</span></div>
              ${quest.targetId ? `<div><span style="color:#aaa">目标:</span> <span style="color:#fff">${quest.targetId}</span></div>` : ''}
              ${quest.targetLocation ? `<div><span style="color:#aaa">目的地:</span> <span style="color:#fff">${quest.targetLocation}</span></div>` : ''}
            </div>
          </div>

          <div style="padding:10px;background:rgba(241,196,15,0.1);border-radius:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#f1c40f;margin-bottom:6px">任务奖励</div>
            <div style="font-size:12px;color:#fff;line-height:1.8">
              ${quest.rewards.stone ? `<div>  ${quest.rewards.stone} 灵石</div>` : ''}
              ${quest.rewards.crystal ? `<div>  ${quest.rewards.crystal} 灵晶</div>` : ''}
              ${quest.rewards.immortal_stone ? `<div>✨ ${quest.rewards.immortal_stone} 仙灵石</div>` : ''}
              ${quest.rewards.exp ? `<div>  ${quest.rewards.exp} 修为</div>` : ''}
              ${quest.rewards.fame ? `<div>  ${quest.rewards.fame} 名望</div>` : ''}
              ${quest.rewards.contribution ? `<div>  ${quest.rewards.contribution} 宗门贡献</div>` : ''}
              ${quest.rewards.items ? quest.rewards.items.map(i => `<div>  ${i.id} x${i.count}</div>`).join('') : ''}
            </div>
          </div>

          <div style="padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:12px">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
              <div><span style="color:#aaa">推荐境界:</span> <span style="color:#fff">${quest.minRealm || 0}~${quest.maxRealm || 9}</span></div>
              <div><span style="color:#aaa">每日限制:</span> <span style="color:#fff">${this.systems.daily.maxDailyCompleted}个</span></div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-primary" onclick="game.acceptDailyQuest('${quest.id}')" style="width:100%">接取任务</button>
            <button class="btn btn-heal" onclick="game.showDailyQuests()" style="width:100%">返回任务列表</button>
          </div>
        </div>
      </div>
    `;
  }

  // 接受日常任务
  acceptDailyQuest(questId) {
    const result = this.systems.daily.acceptQuest(questId);
    if (result.success) {
      this.showToast(`接取任务: ${result.text}`, 'success');
    } else {
      this.showToast(result.text, 'warning');
    }
    this.showDailyQuests();
  }

  // === 异火/丹炉系统UI ===

  // 显示异火/丹炉管理界面
  showForge() {
    const forgeInfo = this.systems.forge.getEquippedInfo();

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <h3>  异火/丹炉</h3>
          <button class="btn btn-heal" onclick="game.showPage('craft')" style="width:100%">← 返回制作</button>
        </div>

        <div class="card">
          <h3 style="color:#e74c3c">当前异火</h3>
          ${forgeInfo.fire ? `
            <div style="color:#ffd700;font-size:13px">${forgeInfo.fire.name} ${forgeInfo.fire.grade}</div>
            <div style="font-size:11px;color:#aaa">${forgeInfo.fire.desc}</div>
            <button class="btn btn-heal" onclick="game.unequipFire()" style="margin-top:8px;width:100%">卸下异火</button>
          ` : '<div class="empty">未装备异火</div>'}
        </div>

        <div class="card">
          <h3 style="color:#f39c12">当前丹炉</h3>
          ${forgeInfo.furnace ? `
            <div style="color:#ffd700;font-size:13px">${forgeInfo.furnace.name} ${forgeInfo.furnace.grade}</div>
            <div style="font-size:11px;color:#aaa">${forgeInfo.furnace.desc}</div>
          ` : '<div class="empty">未装备丹炉</div>'}
        </div>

        <div class="card">
          <h3>拥有的异火</h3>
          ${forgeInfo.ownedFires.length === 0 ? '<div class="empty">暂无异火</div>' :
            forgeInfo.ownedFires.map(fireId => {
              const fire = this.systems.forge.strangeFires.find(f => f.id === fireId);
              return fire ? `
                <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px;cursor:pointer" onclick="game.equipFire('${fire.id}')">
                  <div style="color:#ffd700;font-size:12px">${fire.name} ${fire.grade}</div>
                  <div style="font-size:10px;color:#aaa">${fire.desc}</div>
                </div>
              ` : '';
            }).join('')
          }
        </div>

        <div class="card">
          <h3>拥有的丹炉</h3>
          ${forgeInfo.ownedFurnaces.length === 0 ? '<div class="empty">暂无丹炉</div>' :
            forgeInfo.ownedFurnaces.map(furnaceId => {
              const furnace = this.systems.forge.furnaces.find(f => f.id === furnaceId);
              return furnace ? `
                <div class="inv-item" style="text-align:left;padding:8px;margin-bottom:4px;cursor:pointer" onclick="game.equipFurnace('${furnace.id}')">
                  <div style="color:#ffd700;font-size:12px">${furnace.name} ${furnace.grade}</div>
                  <div style="font-size:10px;color:#aaa">${furnace.desc}</div>
                </div>
              ` : '';
            }).join('')
          }
        </div>
      </div>
    `;
  }

  // 装备异火
  equipFire(fireId) {
    const result = this.systems.forge.equipFire(fireId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.showForge();
  }

  // 卸下异火
  unequipFire() {
    const result = this.systems.forge.unequipFire();
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.showForge();
  }

  // 装备丹炉
  equipFurnace(furnaceId) {
    const result = this.systems.forge.equipFurnace(furnaceId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.showForge();
  }

  // 保存游戏
  saveGame() {
    const result = this.systems.save.save();
    if (result.success) {
      this.addLog('游戏已保存', 'success');
    }
  }

  // 加载游戏
  loadGame() {
    const result = this.systems.save.load();
    if (result.success) {
      this.addLog('存档已加载', 'success');
    }
  }

  // 重置游戏
  resetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
      this.systems.save.deleteSave('auto');
      this.state = this.getDefaultState();
      this.init();
    }
  }

  // 炼体修炼
  trainBody(days) {
    const gain = this.systems.body.train(days);
    this.addLog(`炼体${days}天，炼体值+${gain}`, 'success');
    this.showToast(`炼体${days}天完成，炼体值+${gain}`, 'success');
    // 使用时间系统8步结算
    const timeResults = this.systems.time.advanceTime(days);
    timeResults.forEach(r => {
      if (r && r.message) this.addLog(r.message, r.type === 'lifespan_warning' ? 'warning' : '');
    });
    this.checkAchievements();
    this.checkDeath();
    // 留在修炼界面
    this.showPage('cultivation');
  }

  // 炼体突破
  bodyBreakthrough() {
    const result = this.systems.body.breakthrough();
    if (result.success) {
      this.addLog(`炼体突破成功！晋升为${result.newRealm}`, 'highlight');
      this.showToast(`炼体突破！晋升为${result.newRealm}`, 'success');
    } else {
      this.addLog(result.reason, 'warning');
      this.showToast(result.reason, 'warning');
    }
    this.showPage('cultivation');
  }

  // 神识修炼（4种方式）
  trainSense(methodId) {
    const result = this.systems.sense.train(methodId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
      // 如果消耗了天数，使用时间系统8步结算
      if (result.days > 0) {
        const timeResults = this.systems.time.advanceTime(result.days);
        timeResults.forEach(r => {
          if (r && r.message) this.addLog(r.message, r.type === 'lifespan_warning' ? 'warning' : '');
        });
      }
      // 如果有风险结果，显示
      if (result.risk) {
        this.addLog(result.risk.text, 'warning');
      }
    } else {
      this.addLog(result.text, 'warning');
    }
    this.checkDeath();
    this.checkAchievements();
    // 留在修炼界面
    this.showPage('cultivation');
  }

  // 制符
  craftTalisman(recipeId) {
    const result = this.systems.talisman.craft(recipeId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.checkAchievements();
    this.render();
  }

  // 法宝装备
  equipArtifact(artifactId, slot) {
    const result = this.systems.artifact.equip(artifactId, slot);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
      this.showToast(result.text, 'warning');
    }
    this.showEquipment();
  }

  // 法宝卸下
  unequipArtifact(artifactId) {
    const result = this.systems.artifact.unequip(artifactId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
      this.showToast(result.text, 'warning');
    }
    this.showEquipment();
  }

  // 绑定本命法宝
  bindMainArtifact(artifactId) {
    const result = this.systems.artifact.bindMainArtifact(artifactId);
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
      this.showToast(result.text, 'warning');
    }
    this.showEquipment();
  }

  // 温养本命法宝
  nurtureMainArtifact() {
    const result = this.systems.artifact.nurtureMainArtifact();
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
      this.showToast(result.text, 'warning');
    }
    this.showEquipment();
  }

  // 突破本命法宝
  breakthroughMainArtifact() {
    const result = this.systems.artifact.breakthroughMainArtifact();
    if (result.success) {
      this.addLog(result.text, 'success');
      this.showToast(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
      this.showToast(result.text, 'warning');
    }
    this.showEquipment();
  }

  // 更换本命法宝确认
  changeMainArtifactConfirm() {
    if (confirm('更换本命法宝将损失30%神识和10年寿元，确定更换？')) {
      const newArtifactId = prompt('请输入要更换为本命法宝的法宝ID：');
      if (newArtifactId) {
        const result = this.systems.artifact.changeMainArtifact(newArtifactId);
        if (result.success) {
          this.addLog(result.text, 'success');
          this.showToast(result.text, 'success');
        } else {
          this.addLog(result.text, 'warning');
          this.showToast(result.text, 'warning');
        }
        this.showEquipment();
      }
    }
  }

  // 显示装备栏页面
  showEquipment() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game">
        ${this.renderer.renderStatusBar()}
        <div class="card">
          <button class="btn btn-heal" onclick="game.showPage('more')" style="width:100%">← 返回更多</button>
        </div>
        ${this.renderer.renderEquipmentPanel()}
      </div>
    `;
  }

  // 法宝融合
  fuseArtifacts(id1, id2) {
    const result = this.systems.artifact.fuse(id1, id2);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 法宝献祭
  sacrificeArtifact(artifactId) {
    const result = this.systems.artifact.sacrifice(artifactId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 法宝温养
  nurtureArtifact(artifactId) {
    const result = this.systems.artifact.nurture(artifactId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 捕捉灵兽
  catchBeast(beastId) {
    const result = this.systems.beast.catch(beastId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.checkAchievements();
    this.render();
  }

  // 灵兽出战
  setBeastActive(beastId, active) {
    const result = this.systems.beast.setActive(beastId, active);
    if (result.success) {
      this.addLog(result.text, 'success');
    }
    this.render();
  }

  // 灵兽喂食
  feedBeast(beastId, itemId) {
    const result = this.systems.beast.feed(beastId, itemId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 灵兽训练
  trainBeast(beastId, days) {
    const result = this.systems.beast.train(beastId, days);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 灵兽繁殖
  breedBeast(beastId) {
    const result = this.systems.beast.breed(beastId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 灵兽疗伤
  healBeast(beastId) {
    const result = this.systems.beast.heal(beastId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 制作傀儡
  craftPuppet(gradeIndex) {
    const result = this.systems.puppet.craft(gradeIndex);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.checkAchievements();
    this.render();
  }

  // 傀儡部署
  deployPuppet(puppetId, task) {
    const result = this.systems.puppet.deploy(puppetId, task);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 傀儡收回
  recallPuppet(puppetId) {
    const result = this.systems.puppet.recall(puppetId);
    if (result.success) {
      this.addLog(result.text, 'success');
    }
    this.render();
  }

  // 傀儡灌注
  chargePuppet(puppetId) {
    const result = this.systems.puppet.charge(puppetId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 掌天瓶凝聚绿液
  condenseGreenLiquid() {
    const result = this.systems.bottle.condense();
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 掌天瓶使用绿液（10种用途）
  useGreenLiquid(usageId, options = {}) {
    const result = this.systems.bottle.useGreenLiquid(usageId, options);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.checkAchievements();
    this.render();
  }

  // 掌天瓶种植
  plantField(fieldIndex, herbId) {
    const result = this.systems.bottle.plant(fieldIndex, herbId);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 掌天瓶收获
  harvestField(fieldIndex) {
    const result = this.systems.bottle.harvest(fieldIndex);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }

  // 器灵互动
  interactSpiritMaid(action) {
    const result = this.systems.bottle.interactWithSpiritMaid(action);
    if (result.success) {
      this.addLog(result.text, 'success');
    } else {
      this.addLog(result.text, 'warning');
    }
    this.render();
  }
}

// 启动游戏
const game = new Game();
window.game = game;
