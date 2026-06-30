/**
 * main.js — 凡人修仙传·模拟器 主控
 *
 * 职责：
 *   ① 全局 GameState — 所有模块实例与运行状态
 *   ② EventBus (Pub/Sub) — 模块间松耦合通信
 *   ③ 8 步每日结算 (dailySettlement) — GDD §⑭ 核心循环
 *   ④ UI 动作分发 (onAction) — 桥接 UI 类与游戏逻辑
 *   ⑤ 模块初始化与串联
 */

/* ================================================================
 *  一、EventBus（发布/订阅）
 * ================================================================ */

class EventBus {
  constructor() {
    /** @type {Map<string, Array<{fn:Function, once:boolean}>>} */
    this._map = new Map();
  }

  on(event, fn, opts = {}) {
    if (!this._map.has(event)) this._map.set(event, []);
    this._map.get(event).push({ fn, once: !!opts.once });
    return () => this.off(event, fn);
  }

  once(event, fn) { return this.on(event, fn, { once: true }); }

  off(event, fn) {
    const arr = this._map.get(event);
    if (!arr) return;
    const idx = arr.findIndex(e => e.fn === fn);
    if (idx !== -1) arr.splice(idx, 1);
    if (arr.length === 0) this._map.delete(event);
  }

  emit(event, data) {
    const arr = this._map.get(event);
    if (!arr) return;
    const snapshot = [...arr];
    for (const entry of snapshot) {
      try { entry.fn(data); } catch (e) { console.error(`[EventBus] ${event}:`, e); }
      if (entry.once) this.off(event, entry.fn);
    }
  }

  clear() { this._map.clear(); }
}


/* ================================================================
 *  二、GameState — 全局状态容器
 * ================================================================ */

const GameState = {
  version: '1.0.0',

  /* 模块实例 */
  player:       null,
  world:        null,
  cultivation:  null,
  skillsMgr:    null,
  equipment:    null,
  inventory:    null,
  crafting:     null,
  exploration:  null,
  companions:   null,
  bottle:       null,
  eventsMgr:    null,
  battle:       null,

  /* 运行时 */
  gameDay:        0,
  playTime:       0,
  phase:          'init',   // init | playing | battle | event | gameover
  pendingDays:    0,
  settlementBusy: false,
  activeBuffs:    [],
  activeDebuffs:  [],
  plotFlags:      {},
  bus:            new EventBus(),
  ui:             null,      // UI 实例
};


/* ================================================================
 *  三、8 步每日结算
 * ================================================================ */

function dailySettlement(days) {
  if (GameState.settlementBusy) {
    GameState.pendingDays += days;
    return { report: null, merged: true };
  }

  let remaining = days + GameState.pendingDays;
  GameState.pendingDays = 0;
  if (remaining <= 0) return { report: null, events: [] };

  GameState.settlementBusy = true;
  const events = [];
  const player = GameState.player;
  const world  = GameState.world;

  try {
    // ① 天数推进 + 寿元 + 季节 + 天气
    const worldReport = world ? world.advanceTime(remaining) : null;
    if (worldReport) {
      remaining = worldReport.daysPassed || remaining;
      GameState.gameDay += remaining;
      GameState.bus.emit('day:advanced', { days: remaining, gameDay: GameState.gameDay });
      if (worldReport.seasonChanged) {
        events.push(`季节变为 ${world.season}`);
        GameState.bus.emit('season:changed', { season: world.season });
      }
      if (worldReport.weatherChanged) {
        events.push(`天气变为 ${world.weather}`);
        GameState.bus.emit('weather:changed', { weather: world.weather });
      }
      if (worldReport.events && worldReport.events.length) {
        for (const ev of worldReport.events) {
          events.push(`⚡ ${ev.name || ev}`);
          GameState.bus.emit('special:date', ev);
        }
      }
      if (worldReport.deathWarning) {
        events.push(`⚠️ ${worldReport.deathWarning}`);
        GameState.bus.emit('lifespan:danger', { warning: worldReport.deathWarning });
      }
    } else {
      GameState.gameDay += remaining;
      GameState.bus.emit('day:advanced', { days: remaining, gameDay: GameState.gameDay });
    }

    // ② 寿元 (world.advanceTime 已处理)
    GameState.bus.emit('lifespan:changed', { lifespan: player ? player.lifespan : 0 });

    // ③ 灵力恢复
    if (player && player.mpMax) {
      const mpRegen = Math.floor((player.mpMax * 0.05) * remaining);
      player.mpMax = Math.min(player.mpMax + mpRegen, player.realMpMax || player.mpMax);
    }

    // ④ 丹毒消退
    if (GameState.crafting && player) {
      const detox = typeof GameState.crafting.naturalDetox === 'function'
        ? GameState.crafting.naturalDetox(remaining, player.realm || '凡人')
        : remaining;
      GameState.bus.emit('toxicity:decay', { amount: detox });
    }

    // ⑤ 限时效果
    GameState.activeBuffs = GameState.activeBuffs.filter(b => {
      b.remainingDays = (b.remainingDays || 0) - remaining;
      return b.remainingDays > 0;
    });
    GameState.activeDebuffs = GameState.activeDebuffs.filter(d => {
      d.remainingDays = (d.remainingDays || 0) - remaining;
      return d.remainingDays > 0;
    });

    // ⑥~⑦ 已由 world.advanceTime 处理

    // ⑧ 濒死在 worldReport.deathWarning 中

    // 模块 tick
    if (GameState.companions && typeof GameState.companions.tick === 'function') {
      try { GameState.companions.tick(remaining, { spiritStones: player ? player.spiritStones : 0 }); }
      catch(e) { console.warn('[Tick] companions:', e); }
    }
    if (GameState.bottle && typeof GameState.bottle.tick === 'function') {
      try {
        const r = GameState.bottle.tick(remaining, player ? player.realm : '凡人');
        if (r) {
          if (r.messages) events.push(...r.messages);
          if (r.event) GameState.bus.emit('bottle:event', r.event);
        }
      } catch(e) { console.warn('[Tick] bottle:', e); }
    }
    if (GameState.cultivation && typeof GameState.cultivation.tick === 'function') {
      try { GameState.cultivation.tick(remaining); } catch(e) { console.warn('[Tick] cultivation:', e); }
    }

  } finally {
    GameState.settlementBusy = false;
  }

  // 日志输出
  for (const ev of events) {
    GameState.bus.emit('log:add', { msg: ev, type: 'white' });
  }
  GameState.bus.emit('settlement:done', {
    days: remaining, gameDay: GameState.gameDay, events,
  });

  return {
    report: { daysPassed: remaining, gameDay: GameState.gameDay },
    events,
  };
}


/* ================================================================
 *  四、UI 动作分发器
 * ================================================================ */

function dispatchAction(action, payload) {
  const GS = GameState;
  const p   = GS.player;
  const ui  = GS.ui;

  try {
    switch (action) {

      // ── 修炼 ──
      case 'cultivate':
      case 'cultivateSit':
        _doCultivate('打坐', 3);
        break;
      case 'cultivateSeclusion':
        _doCultivate('闭关', 7);
        break;
      case 'cultivateCycle':
        _doCultivate('周天', 1);
        break;

      // ── 突破 ──
      case 'breakthroughSub':
        _doBreakthroughSub();
        break;
      case 'breakthroughRealm':
        _doBreakthroughRealm(payload);
        break;
      case 'breakthrough':
        if (p && p.subStageIndex < 3) _doBreakthroughSub();
        else _doBreakthroughRealm(payload);
        break;

      // ── 神识 / 炼体 ──
      case 'divineSense':
        if (GS.cultivation && GS.cultivation.divineSense) {
          const dsr = GS.cultivation.divineSense.perform ? GS.cultivation.divineSense.perform() : null;
          if (dsr) {
            GameState.bus.emit('log:add', { msg: `神识淬炼：${dsr.msg || '完成'}`, type: 'blue' });
            const days = dsr.daysCost || 1;
            if (days) dailySettlement(days);
          }
        }
        break;
      case 'bodyRefine':
        if (GS.cultivation && GS.cultivation.bodyRefine) {
          const brr = GS.cultivation.bodyRefine.perform ? GS.cultivation.bodyRefine.perform() : null;
          if (brr) {
            GameState.bus.emit('log:add', { msg: `炼体：${brr.msg || '完成'}`, type: 'green' });
            const days = brr.daysCost || 1;
            if (days) dailySettlement(days);
          }
        }
        break;

      // ── 探索 ──
      case 'explore':
        if (GS.exploration && p && GS.world) {
          const region = GS.world.currentRegion ? GS.world.currentRegion() : null;
          const result = GS.exploration.exploreNode
            ? GS.exploration.exploreNode()
            : { success: false, reason: '探索功能不可用' };
          if (result.success) {
            GameState.bus.emit('log:add', { msg: `探索：${result.event || '无'}`, type: 'gold' });
            dailySettlement(1);
          } else {
            GameState.bus.emit('log:add', { msg: result.reason, type: 'red' });
          }
        }
        break;
      case 'travel':
        if (payload && payload.node && GS.world && GS.world.travelTo) {
          const tr = GS.world.travelTo(payload.node, p);
          if (tr && tr.success) {
            GameState.bus.emit('log:add', { msg: `前往 ${payload.node.name}`, type: 'white' });
            if (tr.days) dailySettlement(tr.days);
          } else {
            GameState.bus.emit('log:add', { msg: (tr && tr.reason) || '无法前往', type: 'red' });
          }
        }
        break;

      // ── 秘境 ──
      case 'dungeon':
        if (GS.exploration && GS.exploration.enterSecretRealm) {
          const dungeon = payload && payload.dungeon;
          if (dungeon) {
            const er = GS.exploration.enterSecretRealm(dungeon.key || dungeon, p, GS.gameDay);
            GameState.bus.emit('log:add',
              { msg: er.success ? `进入秘境：${dungeon.name || dungeon}` : er.reason, type: er.success ? 'gold' : 'red' });
          }
        }
        break;

      // ── 战斗 ──
      case 'battle':
        // 随机遭遇战斗
        GameState.bus.emit('log:add', { msg: '暂无可用敌人', type: 'red' });
        break;
      case 'battleAction':
        _handleBattleAction(payload);
        break;

      // ── 炼丹 / 制符 ──
      case 'alchemy':
      case 'openAlchemy':
        GameState.bus.emit('log:add', { msg: '炼丹界面开发中', type: 'white' });
        break;
      case 'openTalisman':
        GameState.bus.emit('log:add', { msg: '制符界面开发中', type: 'white' });
        break;

      // ── 法宝 ──
      case 'craftArtifact':
        GameState.bus.emit('log:add', { msg: '法宝炼制界面开发中', type: 'white' });
        break;

      // ── 背包 ──
      case 'useItem':
        if (payload && payload.item) {
          GameState.bus.emit('log:add', { msg: `使用了 ${payload.item.name}`, type: 'white' });
        }
        break;

      // ── NPC ──
      case 'npcInteract':
        if (payload && payload.npc) {
          GameState.bus.emit('log:add', { msg: `与 ${payload.npc.name} 交谈`, type: 'white' });
        }
        break;

      // ── 交易 ──
      case 'openShop':
        GameState.bus.emit('log:add', { msg: '商店界面开发中', type: 'white' });
        break;
      case 'openAuction':
        GameState.bus.emit('log:add', { msg: '拍卖会界面开发中', type: 'white' });
        break;

      // ── 掌天瓶 ──
      case 'bottleCondense':
      case 'bottle':
        if (GS.bottle && typeof GS.bottle.condense === 'function') {
          const cr = GS.bottle.condense();
          if (cr) GameState.bus.emit('log:add', { msg: cr.msg || '凝聚绿液', type: 'green' });
        }
        break;
      case 'bottleSpeedup':
        if (GS.bottle && typeof GS.bottle.speedUp === 'function') {
          const sr = GS.bottle.speedUp();
          if (sr) GameState.bus.emit('log:add', { msg: sr.msg || '催熟灵植', type: 'green' });
        }
        break;
      case 'bottleExpand':
        GameState.bus.emit('log:add', { msg: '灵田扩块功能开发中', type: 'white' });
        break;
      case 'bottleHarvest':
        if (payload && payload.plot) {
          GameState.bus.emit('log:add', { msg: `收获了 ${payload.plot.name || '灵植'}`, type: 'green' });
        }
        break;

      // ── 存档 ──
      case 'save':
      case 'saveGame':
        {
          const slot = (payload && payload.slot) || 0;
          const state = _collectState();
          const r = window.Save.save(slot, state);
          GameState.bus.emit('log:add', { msg: r.msg, type: r.success ? 'green' : 'red' });
        }
        break;
      case 'loadGame':
        {
          const slot = (payload && payload.slot) || 0;
          const state = window.Save.getState(slot);
          if (state) {
            _restoreState(state);
            GameState.bus.emit('log:add', { msg: `已读取存档位 ${slot}`, type: 'green' });
          } else {
            GameState.bus.emit('log:add', { msg: '存档为空', type: 'red' });
          }
        }
        break;

      // ── 重置 ──
      case 'resetGame':
        if (confirm('确定要重置全部数据？')) {
          window.Save.deleteAll();
          location.reload();
        }
        break;

      // ── 寿元提醒 ──
      case 'lifespan':
        break;

      // ── 创建角色 ──
      case 'createCharacter':
        _createCharacterWithUI(payload);
        break;

      // ── 未知 ──
      default:
        console.log('[Main] 未处理action:', action, payload);
    }
  } catch (e) {
    console.error('[Main] dispatchAction 异常:', action, e);
    GameState.bus.emit('log:add', { msg: `操作失败：${e.message}`, type: 'red' });
  }

  // 操作后刷新 UI
  if (ui && typeof ui.refresh === 'function') {
    ui.refresh();
  }
}

/* ── 修炼辅助 ── */
function _doCultivate(method, baseDays) {
  const GS = GameState;
  const p = GS.player;
  const cult = GS.cultivation;

  if (!p || !cult) return;

  const realm = p.realm || '凡人';
  let days = baseDays;
  let gained = 0;

  if (typeof cult.calcCultivationGain === 'function') {
    const mp = p.mpMax || 0;
    const rootType = p.rootType;
    const result = cult.calcCultivationGain(realm, method, baseDays,
      { mp, spiritRoot: rootType });
    days = result.actualDays || baseDays;
    gained = result.cultivationGain || 0;
  } else {
    // 简易兜底
    gained = baseDays * 10 * (p.cultivateMul || 1);
  }

  if (p.cultivate) p.cultivate(gained);
  GameState.bus.emit('log:add',
    { msg: `${method} ${days}天，修为+${gained > 1e4 ? (gained/1e4).toFixed(1)+'万' : Math.floor(gained)}`, type: 'blue' });

  if (days > 0) dailySettlement(days);
}

/* ── 突破辅助 ── */
function _doBreakthroughSub() {
  const p = GameState.player;
  if (!p || typeof p.breakthroughSubStage !== 'function') return;
  const result = p.breakthroughSubStage();
  GameState.bus.emit('log:add',
    { msg: result.success ? `突破成功！→ ${p.fullTitle}` : `突破失败：${result.reason}`, type: result.success ? 'gold' : 'red' });
  if (result.success) GameState.bus.emit('player:updated', {});
}

function _doBreakthroughRealm(payload) {
  const p = GameState.player;
  if (!p || typeof p.breakthroughRealm !== 'function') return;
  const opts = payload || {};
  const result = p.breakthroughRealm({
    hasPill: opts.hasPill || false,
    manualBonus: opts.manualBonus || 0,
    spBonus: opts.spBonus || 0,
  });
  GameState.bus.emit('log:add',
    { msg: result.msg || (result.success ? '突破成功！' : '突破失败'), type: result.success ? 'gold' : 'red' });
  if (result.success) {
    GameState.bus.emit('realm:changed', { newRealm: p.fullTitle });
    GameState.bus.emit('player:updated', {});
  }
}

/* ── 战斗辅助 ── */
function _handleBattleAction(payload) {
  // 占位
  GameState.bus.emit('log:add', { msg: `战斗指令：${JSON.stringify(payload)}`, type: 'white' });
}

/* ── 创建角色 ── */
function _createCharacterWithUI(info) {
  if (!info) return;
  const p = GameState.player;
  if (!p) return;
  p.name = info.name || '韩立';
  if (info.gender) p.gender = info.gender;
  GameState.bus.emit('player:updated', {});
  GameState.bus.emit('log:add', { msg: `${p.name} 踏上修仙之路`, type: 'gold' });
}

/* ── 状态收集 ── */
function _collectState() {
  return window.collectGameState({
    player:      GameState.player,
    inventory:   GameState.inventory,
    skillsState: GameState.skillsMgr,
    equipment:   GameState.equipment,
    crafting:    GameState.crafting,
    companions:  GameState.companions,
    exploration: GameState.exploration,
    bottle:      GameState.bottle,
    world:       GameState.world,
    playTime:    GameState.playTime,
    plotFlags:   GameState.plotFlags,
  });
}

function _restoreState(state) {
  if (!state) return;
  if (state.player && window.Player.fromJSON) {
    GameState.player = window.Player.fromJSON(state.player);
  }
  if (state.world && window.World.fromJSON) {
    GameState.world = window.World.fromJSON(state.world);
  }
  if (state.companions && GameState.companions && typeof GameState.companions.deserialize === 'function') {
    GameState.companions.deserialize(JSON.stringify(state.companions));
  }
  if (state.bottle && window.Bottle.fromJSON) {
    GameState.bottle = window.Bottle.fromJSON(GameState.bottle ? null : window.DATA, state.bottle);
  }
  if (state.exploration && window.Exploration.fromJSON) {
    GameState.exploration = window.Exploration.fromJSON(state.exploration);
  }
  if (state.crafting && GameState.crafting && typeof GameState.crafting.fromJSON === 'function') {
    GameState.crafting.fromJSON(state.crafting);
  }
  if (state.inventory && GameState.inventory && typeof GameState.inventory.fromJSON === 'function') {
    GameState.inventory.fromJSON(state.inventory);
  }
  if (state.playTime) GameState.playTime = state.playTime;
  if (state.plotFlags) GameState.plotFlags = state.plotFlags;
  GameState.phase = 'playing';
  GameState.bus.emit('player:updated', {});
}


/* ================================================================
 *  五、模块初始化
 * ================================================================ */

function initGame() {
  console.log('[Main] 初始化游戏……');

  // ① 创建 Player（默认角色，UI 可通过创建角色界面覆盖）
  GameState.player = new Player('韩立');

  // ② World
  GameState.world = new World({ startYear: 1, startMonth: 1, startDay: 1 });

  // ③ Cultivation
  GameState.cultivation = new Cultivation(DATA);

  // ④ Skills
  GameState.skillsMgr = new Skills(DATA);

  // ⑤ Equipment & Inventory
  GameState.equipment = new Equipment(GameState.player);
  GameState.inventory = new Inventory(GameState.player, GameState.equipment);

  // ⑥ Crafting
  GameState.crafting = new Crafting(DATA);

  // ⑦ Exploration
  GameState.exploration = new Exploration();

  // ⑧ Companions
  GameState.companions = new Companions(DATA);

  // ⑨ Bottle
  GameState.bottle = new Bottle(DATA);

  // ⑩ Events
  GameState.eventsMgr = new Events();

  // ⑪ Battle
  GameState.battle = new Battle(DATA);

  // ═════ 连接事件 ═════
  _wireEvents();

  // ═════ 初始化 UI ═════
  const container = document.getElementById('game-container');
  const loading = document.getElementById('loading');

  GameState.ui = new UI(container, dispatchAction);
  GameState.ui.init();

  // 移除加载蒙板
  if (loading) loading.remove();

  GameState.phase = 'playing';
  GameState.ui.refresh();

  console.log('[Main] 初始化完成');
  GameState.bus.emit('log:add', { msg: '欢迎来到凡人修仙传！', type: 'gold' });
  GameState.bus.emit('log:add', {
    msg: `角色：${GameState.player.name} | 灵根：${GameState.player.rootName} | 境界：${GameState.player.fullTitle}`,
    type: 'white',
  });

  // 自动存档
  quickSaveSilent();
}

/* ── 事件总线连接 ── */
function _wireEvents() {
  const bus = GameState.bus;

  bus.on('player:updated', () => {
    if (GameState.ui) GameState.ui.refresh();
  });

  bus.on('day:advanced', (data) => {
    if (GameState.ui) {
      GameState.ui.refreshTopBar();
      GameState.ui.updateRedDots();
    }
  });

  bus.on('battle:start', (data) => {
    if (GameState.ui) GameState.ui.showBattleUI(data);
    GameState.phase = 'battle';
  });

  bus.on('battle:end', () => {
    if (GameState.ui) GameState.ui.hideBattleUI();
    GameState.phase = 'playing';
  });

  bus.on('log:add', (data) => {
    if (GameState.ui) GameState.ui.addLog(data.msg, data.type || 'white');
  });
}

/* ── 静默存档 ── */
function quickSaveSilent() {
  const state = _collectState();
  window.Save.autoSave(state);
}


/* ================================================================
 *  六、全局暴露
 * ================================================================ */

window.GameState  = GameState;
window.dailySettlement = dailySettlement;
window.initGame   = initGame;
window.dispatchAction = dispatchAction;

// 兜底：window.onload 触发 initGame（若未被其他方式调用）
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initGame, 50);
} else {
  window.addEventListener('DOMContentLoaded', () => setTimeout(initGame, 50));
}

console.log('[main.js] 主控加载完成');
