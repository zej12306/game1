/**
 * save.js — ㉒存档系统
 * localStorage，4档位（0=自动，1~3=手动），保存/恢复全部游戏状态。
 *
 * 覆盖：角色/背包/功法/灵兽/傀儡/好感度/探索度/掌天瓶/时间/剧情flag
 * 导出：Save 类
 */

/* ================================================================
 *  一、常量
 * ================================================================ */

const STORAGE_PREFIX = 'xiuxian_save_';
const INDEX_KEY = 'xiuxian_save_index';
const SAVE_VERSION = 1;
const SLOT_COUNT = 4;          // 0=自动, 1-3=手动
const AUTO_SLOT = 0;
const MANUAL_SLOTS = [1, 2, 3];

/** 存档元信息字段（用于列表展示，不包含完整游戏数据） */
const META_FIELDS = ['version', 'timestamp', 'playTime', 'playerName', 'playerRealm', 'playerTitle', 'saveLabel'];


/* ================================================================
 *  二、Save 类
 * ================================================================ */

class Save {

  /**
   * 检查浏览器是否支持 localStorage
   * @returns {boolean}
   */
  static isSupported() {
    try {
      const key = '__xiuxian_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ═════════════════════════════════════════
  //  写入
  // ═════════════════════════════════════════

  /**
   * 保存游戏到指定档位
   *
   * @param {number} slot        - 档位 0~3（0=自动，1~3=手动）
   * @param {object} gameState   - 完整游戏状态对象
   * @param {object} [meta]      - 额外元信息
   * @param {string} [meta.label] - 手动存档标签
   * @returns {{ success: boolean, msg: string }}
   */
  static save(slot, gameState, meta = {}) {
    if (!Save.isSupported()) {
      return { success: false, msg: '浏览器不支持 localStorage' };
    }
    if (slot < 0 || slot >= SLOT_COUNT) {
      return { success: false, msg: `无效档位: ${slot}（有效范围 0~${SLOT_COUNT - 1}）` };
    }

    const now = Date.now();
    const player = gameState.player || {};

    const saveData = {
      version:   SAVE_VERSION,
      timestamp: now,
      slot:      slot,
      playTime:  (gameState.playTime || 0) + (meta.elapsed || 0), // 累计游戏时间（秒）
      playerName:   player.name || '无名修士',
      playerRealm:  player.realm || player.fullTitle || '未知',
      playerTitle:  player.fullTitle || '',
      saveLabel:    meta.label || (slot === AUTO_SLOT ? '自动存档' : `存档 ${slot}`),
      state: gameState,
    };

    try {
      const json = JSON.stringify(saveData);
      const key = STORAGE_PREFIX + slot;
      localStorage.setItem(key, json);
      Save._updateIndex(slot, saveData);
      return { success: true, msg: `已保存到档位 ${slot}（${saveData.saveLabel}）` };
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        return { success: false, msg: '存储空间不足，请清理旧存档' };
      }
      return { success: false, msg: `保存失败: ${e.message}` };
    }
  }

  /**
   * 自动存档（快捷方法，写入档位0）
   * @param {object} gameState
   * @param {object} [meta]
   */
  static autoSave(gameState, meta = {}) {
    return Save.save(AUTO_SLOT, gameState, { ...meta, label: '自动存档' });
  }

  // ═════════════════════════════════════════
  //  读取
  // ═════════════════════════════════════════

  /**
   * 从指定档位读取存档
   * @param {number} slot - 档位 0~3
   * @returns {{ success: boolean, data: object|null, msg: string }}
   */
  static load(slot) {
    if (!Save.isSupported()) {
      return { success: false, data: null, msg: '浏览器不支持 localStorage' };
    }
    if (slot < 0 || slot >= SLOT_COUNT) {
      return { success: false, data: null, msg: `无效档位: ${slot}` };
    }

    const key = STORAGE_PREFIX + slot;
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { success: false, data: null, msg: `档位 ${slot} 为空` };
    }

    try {
      const data = JSON.parse(raw);
      if (!data.version) {
        return { success: false, data: null, msg: '存档格式无效' };
      }
      // 版本迁移预留入口
      if (data.version < SAVE_VERSION) {
        data.state = Save._migrate(data);
      }
      return { success: true, data, msg: `已读取档位 ${slot}` };
    } catch (e) {
      return { success: false, data: null, msg: `存档数据损坏: ${e.message}` };
    }
  }

  /**
   * 获取存档的游戏状态（不含元信息）
   * @param {number} slot
   * @returns {object|null}
   */
  static getState(slot) {
    const result = Save.load(slot);
    return result.success ? result.data.state : null;
  }

  // ═════════════════════════════════════════
  //  删除
  // ═════════════════════════════════════════

  /**
   * 删除指定档位
   * @param {number} slot
   * @returns {{ success: boolean, msg: string }}
   */
  static delete(slot) {
    if (slot < 0 || slot >= SLOT_COUNT) {
      return { success: false, msg: `无效档位: ${slot}` };
    }
    const key = STORAGE_PREFIX + slot;
    localStorage.removeItem(key);
    Save._removeFromIndex(slot);
    return { success: true, msg: `已删除档位 ${slot}` };
  }

  /**
   * 清空全部存档
   * @returns {{ success: boolean, msg: string, deleted: number }}
   */
  static deleteAll() {
    let count = 0;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const key = STORAGE_PREFIX + i;
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        count++;
      }
    }
    localStorage.removeItem(INDEX_KEY);
    return { success: true, msg: `已清空 ${count} 个存档`, deleted: count };
  }

  // ═════════════════════════════════════════
  //  列表 / 查询
  // ═════════════════════════════════════════

  /**
   * 检查档位是否有存档
   * @param {number} slot
   * @returns {boolean}
   */
  static hasSave(slot) {
    if (slot < 0 || slot >= SLOT_COUNT) return false;
    return localStorage.getItem(STORAGE_PREFIX + slot) !== null;
  }

  /**
   * 获取存档元信息（不加载完整数据）
   * @param {number} slot
   * @returns {object|null}
   */
  static getMeta(slot) {
    const key = STORAGE_PREFIX + slot;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const meta = {};
      for (const f of META_FIELDS) {
        meta[f] = data[f];
      }
      meta.slot = slot;
      meta.sizeKB = Math.round(raw.length / 1024 * 10) / 10;
      return meta;
    } catch (e) {
      return null;
    }
  }

  /**
   * 列出所有存档的元信息
   * @returns {object[]}
   */
  static list() {
    const result = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const meta = Save.getMeta(i);
      if (meta) result.push(meta);
    }
    return result;
  }

  /**
   * 获取所有档位状态一览（含空位）
   * @returns {object[]}
   */
  static listAll() {
    const result = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const meta = Save.getMeta(i);
      result.push({
        slot:    i,
        type:    i === AUTO_SLOT ? '自动' : '手动',
        isEmpty: !meta,
        meta:    meta || null,
      });
    }
    return result;
  }

  /**
   * 找最近存档（用于"继续游戏"）
   * @returns {{ slot: number, meta: object }|null}
   */
  static getLatest() {
    const list = Save.list();
    if (list.length === 0) return null;
    list.sort((a, b) => b.timestamp - a.timestamp);
    return { slot: list[0].slot, meta: list[0] };
  }

  /**
   * 获取存档占用的总存储空间（KB）
   * @returns {number}
   */
  static getTotalSize() {
    let total = 0;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const raw = localStorage.getItem(STORAGE_PREFIX + i);
      if (raw) total += raw.length;
    }
    const idx = localStorage.getItem(INDEX_KEY);
    if (idx) total += idx.length;
    return Math.round(total / 1024 * 10) / 10;
  }

  // ═════════════════════════════════════════
  //  导入 / 导出
  // ═════════════════════════════════════════

  /**
   * 导出指定档位为 JSON 字符串（用于备份/迁移）
   * @param {number} slot
   * @returns {string|null}
   */
  static exportSlot(slot) {
    const raw = localStorage.getItem(STORAGE_PREFIX + slot);
    return raw || null;
  }

  /**
   * 从 JSON 字符串导入到指定档位
   * @param {number} slot
   * @param {string} json
   * @returns {{ success: boolean, msg: string }}
   */
  static importSlot(slot, json) {
    if (slot < 0 || slot >= SLOT_COUNT) {
      return { success: false, msg: `无效档位: ${slot}` };
    }
    try {
      const data = JSON.parse(json);
      if (!data.version || !data.state) {
        return { success: false, msg: '存档格式无效' };
      }
      data.slot = slot;
      data.timestamp = Date.now();  // 导入时间更新
      localStorage.setItem(STORAGE_PREFIX + slot, JSON.stringify(data));
      Save._updateIndex(slot, data);
      return { success: true, msg: `已导入到档位 ${slot}` };
    } catch (e) {
      return { success: false, msg: `导入失败: ${e.message}` };
    }
  }

  /**
   * 导出全部存档为 JSON（完整备份）
   * @returns {string}
   */
  static exportAll() {
    const backup = { version: SAVE_VERSION, exportedAt: Date.now(), slots: {} };
    for (let i = 0; i < SLOT_COUNT; i++) {
      const raw = localStorage.getItem(STORAGE_PREFIX + i);
      if (raw) backup.slots[i] = JSON.parse(raw);
    }
    return JSON.stringify(backup);
  }

  /**
   * 从完整备份恢复全部存档
   * @param {string} json
   * @returns {{ success: boolean, msg: string, restored: number }}
   */
  static importAll(json) {
    try {
      const backup = JSON.parse(json);
      if (!backup.slots) return { success: false, msg: '备份格式无效', restored: 0 };
      let count = 0;
      for (const [slot, data] of Object.entries(backup.slots)) {
        const s = parseInt(slot);
        if (s >= 0 && s < SLOT_COUNT) {
          localStorage.setItem(STORAGE_PREFIX + s, JSON.stringify(data));
          Save._updateIndex(s, data);
          count++;
        }
      }
      return { success: true, msg: `已恢复 ${count} 个存档`, restored: count };
    } catch (e) {
      return { success: false, msg: `恢复失败: ${e.message}`, restored: 0 };
    }
  }

  // ═════════════════════════════════════════
  //  内部方法
  // ═════════════════════════════════════════

  /**
   * 更新存档索引（轻量元信息表，加速列表查询）
   * @private
   */
  static _updateIndex(slot, saveData) {
    let index = {};
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      if (raw) index = JSON.parse(raw);
    } catch (e) { /* 索引损坏则重建 */ }
    index[String(slot)] = {
      timestamp:   saveData.timestamp,
      playerName:  saveData.playerName,
      playerRealm: saveData.playerRealm,
      playTime:    saveData.playTime,
      saveLabel:   saveData.saveLabel,
    };
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  }

  /**
   * 从索引中移除指定档位
   * @private
   */
  static _removeFromIndex(slot) {
    let index = {};
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      if (raw) index = JSON.parse(raw);
    } catch (e) { return; }
    delete index[String(slot)];
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  }

  /**
   * 存档版本迁移（预留）
   * @private
   * @param {object} oldData
   * @returns {object} 迁移后的 state
   */
  static _migrate(oldData) {
    // 当前版本为 1，无迁移逻辑
    // 未来版本升级时在此处处理字段映射
    // 例：v1→v2: state.bottle → state.bottleState
    return oldData.state;
  }
}


/* ================================================================
 *  三、辅助：构建存档用的状态快照
 * ================================================================ */

/**
 * 从各模块实例中收集完整游戏状态快照。
 * 调用时机：存档前由 Game 层调用此函数收集数据，再传给 Save.save()。
 *
 * @param {object} ctx - 上下文对象，包含以下字段（按需传入，null 则跳过）：
 * @param {import('./player.js').Player}       [ctx.player]      - 角色实例
 * @param {object}                             [ctx.inventory]   - 背包数据 { items, gold, ... }
 * @param {import('./skills.js').Skills|null}  [ctx.skills]      - 功法系统（仅运行时状态）
 * @param {object}                             [ctx.skillsState] - 功法运行时状态 { equipped, learned, levels }
 * @param {import('./companions.js').Companions} [ctx.companions] - 灵兽/傀儡/好感度
 * @param {import('./exploration.js').Exploration} [ctx.exploration] - 探索系统
 * @param {import('./bottle.js').Bottle}        [ctx.bottle]      - 掌天瓶
 * @param {import('./world.js').World}          [ctx.world]       - 时间/地图
 * @param {object}                             [ctx.equipment]   - 装备状态
 * @param {object}                             [ctx.crafting]    - 炼丹/制符状态
 * @param {object}                             [ctx.plotFlags]   - 剧情flag { key: value }
 * @param {number}                             [ctx.playTime]    - 累计游戏时间（秒）
 * @returns {object} gameState 快照对象
 */
function collectGameState(ctx = {}) {
  const state = {
    playTime:   ctx.playTime || 0,
    plotFlags:  ctx.plotFlags ? { ...ctx.plotFlags } : {},
    savedAt:    Date.now(),
  };

  // ── 角色 ──
  if (ctx.player) {
    if (typeof ctx.player.toJSON === 'function') {
      state.player = ctx.player.toJSON();
    } else {
      state.player = { ...ctx.player };
    }
  }

  // ── 背包 ──
  if (ctx.inventory) {
    state.inventory = typeof ctx.inventory.toJSON === 'function'
      ? ctx.inventory.toJSON()
      : JSON.parse(JSON.stringify(ctx.inventory));
  }

  // ── 功法运行时状态 ──
  if (ctx.skillsState) {
    state.skills = ctx.skillsState;
  } else if (ctx.skills && typeof ctx.skills.toJSON === 'function') {
    state.skills = ctx.skills.toJSON();
  }

  // ── 灵兽/傀儡/好感度 ──
  if (ctx.companions) {
    state.companions = typeof ctx.companions.getState === 'function'
      ? ctx.companions.getState()
      : (ctx.companions.toJSON ? ctx.companions.toJSON() : { ...ctx.companions });
  }

  // ── 探索度 ──
  if (ctx.exploration) {
    state.exploration = typeof ctx.exploration.toJSON === 'function'
      ? ctx.exploration.toJSON()
      : { ...ctx.exploration };
  }

  // ── 掌天瓶 ──
  if (ctx.bottle) {
    state.bottle = typeof ctx.bottle.toJSON === 'function'
      ? ctx.bottle.toJSON()
      : { ...ctx.bottle };
  }

  // ── 时间/地图 ──
  if (ctx.world) {
    state.world = typeof ctx.world.toJSON === 'function'
      ? ctx.world.toJSON()
      : { ...ctx.world };
  }

  // ── 装备 ──
  if (ctx.equipment) {
    state.equipment = typeof ctx.equipment.toJSON === 'function'
      ? ctx.equipment.toJSON()
      : JSON.parse(JSON.stringify(ctx.equipment));
  }

  // ── 炼丹/制符 ──
  if (ctx.crafting) {
    state.crafting = typeof ctx.crafting.toJSON === 'function'
      ? ctx.crafting.toJSON()
      : JSON.parse(JSON.stringify(ctx.crafting));
  }

  return state;
}


/* ================================================================
 *  四、导出
 * ================================================================ */

// 浏览器全局暴露
if (typeof window !== 'undefined') {
  window.Save = Save;
  window.collectGameState = collectGameState;
}
