// 渲染器
export class Renderer {
  constructor(gameState) {
    this.gameState = gameState;
  }

  // 渲染状态栏
  renderStatusBar() {
    const player = this.gameState.player;
    const realms = window.gameData?.REALMS || [];
    const currentRealm = realms[player.realmIdx] || { name: '凡人', maxExp: 120 };
    const time = window.game?.systems?.time?.getTimeInfo() || {};
    const weatherIcons = { '晴': '☀️', '阴': '☁️', '雨': ' ', '雷雨': '⛈️', '雪': '❄️', '暴雪': ' ️', '潮汐': ' ' };

    return `
      <div class="status-bar">
        <div class="player-info">
          <span class="name">${player.name}</span>
          <span class="gender">${player.gender === '男' ? '♂' : '♀'}</span>
          <span class="age">${player.age.toFixed(1)}岁</span>
        </div>
        <div class="realm-info">
          <span class="realm">${currentRealm.name}</span>
          <span class="exp">修为 ${this.formatNumber(player.exp)}/${this.formatNumber(currentRealm.maxExp)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-top:4px">
          <span>${time.year || 1}年${time.month || 1}月${time.day || 1}天 ${time.season || '春'}</span>
          <span>${weatherIcons[time.weather || '晴'] || '☀️'}${time.weather || '晴'}</span>
          <span>灵石:${this.formatNumber(player.spiritStones)}</span>
          <span>${window.game?.systems?.weight?.getWeightStatusText() || '负重：0/10'}</span>
        </div>
      </div>
    `;
  }

  // 渲染属性面板（全面详细版）
  renderStatsPanel() {
    const player = this.gameState.player;
    const realms = window.gameData?.REALMS || [];
    const currentRealm = realms[player.realmIdx] || { name: '凡人', hp: 100, mp: 50, atk: 10, def: 5, spd: 10, sense: 10, lifespan: 100 };
    const combat = window.game?.systems?.combat;
    const currentSkill = this.gameState.skills?.combat?.length > 0 ? 
      window.gameData?.SKILLS?.find(s => s.id === this.gameState.skills.combat[0]?.id) : null;

    return `
      <div class="stats-panel">
        <div class="stats-grid">
          <div class="stat-row">
            <span class="label">  气血</span>
            <div class="bar">
              <div class="fill fill-hp" style="width:${(player.hp / player.maxHp * 100)}%"></div>
              <span class="bar-text">${this.formatNumber(player.hp)}/${this.formatNumber(player.maxHp)}</span>
            </div>
          </div>
          <div class="stat-row">
            <span class="label">  灵力</span>
            <div class="bar">
              <div class="fill fill-mp" style="width:${(player.mp / player.maxMp * 100)}%"></div>
              <span class="bar-text">${this.formatNumber(player.mp)}/${this.formatNumber(player.maxMp)}</span>
            </div>
          </div>
          <div class="stat-row">
            <span class="label">  修为</span>
            <div class="bar">
              <div class="fill fill-exp" style="width:${Math.min(player.exp / ((currentRealm.maxExp || 120) * 2) * 100, 100)}%"></div>
              <span class="bar-text">${this.formatNumber(player.exp)}/${this.formatNumber(currentRealm.maxExp)}</span>
            </div>
          </div>
          <div class="stat-row">
            <span class="label">  神识</span>
            <div class="bar">
              <div class="fill fill-sense" style="width:${Math.min(player.sense / (currentRealm.sense * 10 || 100) * 100, 100)}%"></div>
              <span class="bar-text">${player.sense}</span>
            </div>
          </div>
        </div>

        <div class="stats-details">
          <div class="stats-section">
            <div class="stats-section-title">⚔️ 战斗属性</div>
            <div class="stats-row-grid">
              <div class="stats-item"><span class="stats-label">攻击</span><span class="stats-value">${this.formatNumber(player.atk || currentRealm.atk)}</span></div>
              <div class="stats-item"><span class="stats-label">防御</span><span class="stats-value">${this.formatNumber(player.def || currentRealm.def)}</span></div>
              <div class="stats-item"><span class="stats-label">速度</span><span class="stats-value">${this.formatNumber(player.spd || currentRealm.spd)}</span></div>
              <div class="stats-item"><span class="stats-label">暴击</span><span class="stats-value">${player.crit || 5}%</span></div>
            </div>
          </div>

          <div class="stats-section">
            <div class="stats-section-title">  修炼属性</div>
            <div class="stats-row-grid">
              <div class="stats-item"><span class="stats-label">悟性</span><span class="stats-value">${player.comprehension || 20}</span></div>
              <div class="stats-item"><span class="stats-label">机缘</span><span class="stats-value">${player.fortune || 20}</span></div>
              <div class="stats-item"><span class="stats-label">寿元</span><span class="stats-value">${player.age?.toFixed(1) || 18}/${player.lifespan || currentRealm.lifespan}</span></div>
              <div class="stats-item"><span class="stats-label">声望</span><span class="stats-value">${player.fame || 0}</span></div>
            </div>
          </div>

          <div class="stats-section">
            <div class="stats-section-title">  当前功法</div>
            <div style="font-size:11px;color:#aaa">
              ${currentSkill ? `${currentSkill.name} Lv${currentSkill.level || 1} (${currentSkill.element || '无'})` : '未装备功法'}
            </div>
          </div>

          <div class="stats-section">
            <div class="stats-section-title">  战斗统计</div>
            <div class="stats-row-grid">
              <div class="stats-item"><span class="stats-label">战斗</span><span class="stats-value">${this.gameState.stats?.combats || 0}次</span></div>
              <div class="stats-item"><span class="stats-label">胜利</span><span class="stats-value">${this.gameState.stats?.victories || 0}次</span></div>
              <div class="stats-item"><span class="stats-label">探索</span><span class="stats-value">${this.gameState.stats?.explorations || 0}次</span></div>
              <div class="stats-item"><span class="stats-label">炼丹</span><span class="stats-value">${this.gameState.stats?.pillsRefined || 0}次</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染灵根面板
  renderRootPanel() {
    const root = this.gameState.player.root;

    return `
      <div class="root-panel">
        <h3>灵根</h3>
        <div class="root-type">${root.type.name} (${root.mainElement})</div>
        <div class="root-elements">
          ${Object.entries(root.elements).map(([el, val]) => `<span class="element">${el}:${val}%</span>`).join('')}
        </div>
      </div>
    `;
  }

  // 渲染背包
  renderInventory(filter = 'all') {
    const inventory = this.gameState.inventory || [];

    if (inventory.length === 0) {
      return '<div class="empty">背包空空如也</div>';
    }

    // 分类筛选
    const filteredInventory = filter === 'all' ? inventory :
      inventory.filter(item => {
        switch (filter) {
          case 'material': return item.type === 'material';
          case 'pill': return item.type === 'pill';
          case 'artifact': return item.type === 'artifact';
          case 'skill': return item.type === 'skill';
          case 'talisman': return item.type === 'talisman';
          case 'special': return item.type === 'special' || item.type === 'quest';
          default: return true;
        }
      });

    // 分类按钮
    const categories = [
      { id: 'all', name: '全部' },
      { id: 'material', name: '材料' },
      { id: 'pill', name: '丹药' },
      { id: 'artifact', name: '法宝' },
      { id: 'skill', name: '功法' },
      { id: 'talisman', name: '符箓' },
      { id: 'special', name: '特殊' }
    ];

    let html = `
      <div class="inventory-categories">
        ${categories.map(cat => `
          <button class="btn ${filter === cat.id ? 'btn-primary' : 'btn-heal'}" 
                  onclick="game.filterInventory('${cat.id}')" 
                  style="font-size:11px;padding:5px 10px">
            ${cat.name}
          </button>
        `).join('')}
      </div>
      <div class="inventory-grid">
    `;

    if (filteredInventory.length === 0) {
      html += '<div class="empty">该分类下没有物品</div>';
    } else {
      html += filteredInventory.map(item => {
        const weight = window.game?.systems?.weight?.getItemWeight(item.id) || 0;
        const totalWeight = weight * item.count;
        return `
          <div class="inv-item" onclick="game.showItemDetail('${item.id}')" style="cursor:pointer">
            <div class="icon">${item.icon || ' '}</div>
            <div class="name">${item.name}</div>
            <div class="count">x${item.count}</div>
            <div class="weight" style="font-size:8px;color:#666">${totalWeight.toFixed(2)}</div>
          </div>
        `;
      }).join('');
    }

    html += '</div>';
    return html;
  }

  // 渲染功法列表
  renderSkills() {
    const skills = this.gameState.skills || {};
    const { SKILLS } = window.gameData || {};

    let html = '<div class="skill-list">';

    // 主修功法区域
    html += '<div class="skill-section"><div class="skill-section-title">  主修功法</div>';
    if (skills.main) {
      html += `
        <div class="skill-item main" onclick="game.showSkillDetail('${skills.main.id}', 'main')" style="cursor:pointer">
          <div class="skill-name">${skills.main.name} <span class="grade">${skills.main.grade}</span></div>
          <div class="skill-desc">${skills.main.desc}</div>
          <div class="skill-type">主修功法 · Lv.${skills.main.level || 1} · 点击查看详情</div>
        </div>
      `;
    } else {
      html += '<div class="empty">未装备主修功法</div>';
    }
    html += '</div>';

    // 辅修功法区域
    html += '<div class="skill-section"><div class="skill-section-title">  辅修功法</div>';
    if (skills.sub && skills.sub.length > 0) {
      skills.sub.forEach(skill => {
        html += `
          <div class="skill-item sub" onclick="game.showSkillDetail('${skill.id}', 'sub')" style="cursor:pointer">
            <div class="skill-name">${skill.name} <span class="grade">${skill.grade}</span></div>
            <div class="skill-desc">${skill.desc}</div>
            <div class="skill-type">辅修功法 · Lv.${skill.level || 1} · 点击查看详情</div>
          </div>
        `;
      });
    } else {
      html += '<div class="empty">未学习辅修功法（探索或NPC赠予获得）</div>';
    }
    html += '</div>';

    // 战斗技能区域
    html += '<div class="skill-section"><div class="skill-section-title">⚔️ 战斗技能</div>';
    if (skills.combat && skills.combat.length > 0) {
      skills.combat.forEach(skill => {
        html += `
          <div class="skill-item combat" onclick="game.showSkillDetail('${skill.id}', 'combat')" style="cursor:pointer">
            <div class="skill-name">${skill.name} <span class="grade">${skill.grade}</span></div>
            <div class="skill-desc">${skill.desc}</div>
            <div class="skill-type">战斗技能 · Lv.${skill.level || 1} · 伤害x${skill.damage || 1.0} · 点击查看详情</div>
          </div>
        `;
      });
    } else {
      html += '<div class="empty">未学习战斗技能（探索或秘境获得）</div>';
    }
    html += '</div>';

    // 功法统计
    const mainCount = skills.main ? 1 : 0;
    const subCount = skills.sub ? skills.sub.length : 0;
    const combatCount = skills.combat ? skills.combat.length : 0;
    html += `
      <div class="skill-stats">
        <span>已学功法：主修${mainCount} · 辅修${subCount} · 战斗${combatCount}</span>
      </div>
    `;

    html += '</div>';
    return html;
  }

  // 渲染日志（最新的在上面）
  renderLogs() {
    const logs = this.gameState.logs || [];
    const recentLogs = logs.slice(-10).reverse();

    return `
      <div class="log-list">
        ${recentLogs.map(log => `<div class="log-item ${log.type || ''}">${log.text}</div>`).join('')}
      </div>
    `;
  }

  // 渲染探索区域（地图层）
  renderLocations() {
    const { LOCATIONS } = window.gameData || {};
    const currentRegion = this.gameState.currentRegion || 'renjie';
    const locations = LOCATIONS?.[currentRegion] || [];
    const currentLocation = this.gameState.currentLocation;

    // 如果已选择地点，显示地点详情
    if (currentLocation) {
      return this.renderLocationDetail(currentLocation);
    }

    // 区域名称映射
    const regionNames = {
      'renjie': '人界·天南大陆',
      'luanxing': '人界·乱星海',
      'dajin': '人界·大晋帝国',
      'lingjie': '灵界',
      'xianjie': '仙界'
    };

    // 否则显示地图列表
    // 区域解锁条件
    const regionUnlockConditions = {
      'renjie': { realm: '凡人~化神', requiredIdx: 0, unlocked: true },
      'luanxing': { realm: '金丹', requiredIdx: 3, unlocked: this.gameState.player?.realmIdx >= 3 },
      'dajin': { realm: '元婴', requiredIdx: 4, unlocked: this.gameState.player?.realmIdx >= 4 },
      'lingjie': { realm: '炼虚(飞升)', requiredIdx: 6, unlocked: this.gameState.player?.realmIdx >= 6 },
      'xianjie': { realm: '真仙(飞升)', requiredIdx: 10, unlocked: this.gameState.player?.realmIdx >= 10 }
    };

    // 获取当前玩家境界索引
    const playerRealmIdx = this.gameState.player?.realmIdx || 0;

    return `
      <div class="region-selector">
        ${Object.entries(LOCATIONS).map(([region, locs]) => {
          const condition = regionUnlockConditions[region];
          const isUnlocked = condition?.unlocked ?? true;
          const isLocked = !isUnlocked && region !== 'renjie';

          return `
            <div class="region-btn ${currentRegion === region ? 'active' : ''} ${isLocked ? 'locked' : ''}"
                 onclick="${isLocked ? `game.showToast('需要${condition.realm}才能解锁该区域', 'warning')` : `game.selectRegion('${region}')`}"
                 style="${isLocked ? 'opacity:0.5;cursor:not-allowed' : ''}">
              ${regionNames[region] || region}
              ${isLocked ? `<span style="font-size:10px;color:#ff6b6b"> (需${condition.realm})</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      <div class="location-list">
        ${locations.map(loc => {
          const isCurrent = this.gameState.playerLocation === loc.id;
          const hasShop = loc.events?.includes('shop');
          const hasNpc = loc.events?.includes('npc');
          const hasSect = loc.events?.includes('sect');
          
          return `
            <div class="location-item" onclick="game.enterLocation('${loc.id}')" style="cursor:pointer">
              <div class="loc-info">
                <div class="loc-name">
                  ${loc.name}
                  ${isCurrent ? '<span style="color:#4caf50;font-size:10px"> [当前位置]</span>' : ''}
                </div>
                <div class="loc-desc">${loc.desc}</div>
                <div style="font-size:10px;color:#888;margin-top:4px">
                  ${hasShop ? '  ' : ''}
                  ${hasNpc ? ' ' : ''}
                  ${hasSect ? ' ' : ''}
                  ${loc.events?.includes('secret') ? ' ' : ''}
                  ${loc.events?.includes('combat') ? '⚔️' : ''}
                </div>
              </div>
              <div style="text-align:right">
                <div class="loc-recommended">${loc.recommended}</div>
                <div style="font-size:10px;color:#666">距离:${loc.distance}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 渲染地点详情（地点层）
  renderLocationDetail(locationId) {
    const { LOCATIONS, NPCS } = window.gameData || {};
    const currentRegion = this.gameState.currentRegion || 'renjie';
    const locations = LOCATIONS?.[currentRegion] || [];
    const location = locations.find(l => l.id === locationId);
    
    if (!location) return '<div class="empty">地点不存在</div>';

    // 获取该地点的NPC
    const locationNpcs = NPCS?.filter(n => n.location === locationId) || [];
    
    // 获取该地点的商店（从交易系统）
    const shops = window.game?.systems?.trade?.getShopsForLocation?.(locationId) || [];

    return `
      <div class="location-detail">
        <div class="location-header">
          <button class="btn btn-heal" onclick="game.exitLocation()" style="margin-bottom:8px">← 返回地图</button>
          <h3 style="color:#ffd700;margin-bottom:4px">${location.name}</h3>
          <div style="font-size:12px;color:#aaa;margin-bottom:8px">${location.desc}</div>
          <div style="font-size:11px;color:#666">
            推荐境界：${location.recommended} | 距离：${location.distance}
          </div>
        </div>

        <div class="location-actions">
          <div class="location-action-card" onclick="game.explore('${locationId}')">
            <div class="location-action-icon"> </div>
            <div class="location-action-title">探索</div>
            <div class="location-action-desc">寻找宝物、遭遇妖兽</div>
          </div>

          ${shops.length > 0 ? `
            <div class="location-action-card" onclick="game.showTrade()">
              <div class="location-action-icon"> </div>
              <div class="location-action-title">商铺</div>
              <div class="location-action-desc">${shops.length}家商店</div>
            </div>
          ` : ''}

          ${location.events?.includes('sect') ? `
            <div class="location-action-card" onclick="game.showSectPage()">
              <div class="location-action-icon"> </div>
              <div class="location-action-title">宗门</div>
              <div class="location-action-desc">加入或查看宗门</div>
            </div>
          ` : ''}

          ${location.events?.includes('secret') ? `
            <div class="location-action-card" onclick="game.showDungeonList()">
              <div class="location-action-icon"> </div>
              <div class="location-action-title">秘境</div>
              <div class="location-action-desc">挑战秘境副本</div>
            </div>
          ` : ''}

          ${location.events?.includes('quest') ? `
            <div class="location-action-card" onclick="game.showDailyQuests()">
              <div class="location-action-icon"> </div>
              <div class="location-action-title">任务</div>
              <div class="location-action-desc">日常任务</div>
            </div>
          ` : ''}
        </div>

        ${locationNpcs.length > 0 ? `
          <div class="location-npcs">
            <h4 style="color:#ffd700;margin-bottom:8px">驻留NPC</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${locationNpcs.map(npc => `
                <div class="npc-mini-card" onclick="game.selectNpcFromLocation('${npc.id}')">
                  <div style="font-size:12px;color:#ffd700">${npc.name}</div>
                  <div style="font-size:10px;color:#aaa">${npc.realm}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="location-log">
          <h4 style="color:#ffd700;margin-bottom:8px">探索日志</h4>
          ${this.renderLogs()}
        </div>
      </div>
    `;
  }

  // 渲染NPC列表
  renderNpcs() {
    const { NPCS, LOCATIONS } = window.gameData || {};
    const currentRegion = this.gameState.currentRegion || 'renjie';
    const selectedNpcId = this.gameState.selectedNpcId || null;
    const playerLocation = this.gameState.playerLocation || 'qingyun';

    // 按地区分组NPC
    const regions = {
      renjie: { name: '人界', locations: ['qingyun', 'huangfeng', 'tianxing', 'modao', 'guzhan'] },
      lingjie: { name: '灵界', locations: ['dajin_city', 'haizu', 'tianyuan', 'mihai', 'leiming'] },
      xianjie: { name: '仙界', locations: ['tianting', 'lunhui', 'jiange', 'dansheng', 'guangling'] },
      yuanchu: { name: '源初', locations: ['yuanchu'] }
    };

    // 获取当前地区的NPC
    const regionNpcs = NPCS.filter(npc => {
      const region = regions[currentRegion];
      return region && region.locations.includes(npc.location);
    });

    // 获取选中的NPC详情
    const selectedNpc = selectedNpcId ? NPCS.find(n => n.id === selectedNpcId) : null;
    const selectedNpcFame = selectedNpc ? (this.gameState.npcs?.find(n => n.id === selectedNpcId)?.fame || 0) : 0;

    // 获取NPC的好感度等级对话
    let dialogueLevel = 0;
    if (selectedNpc) {
      for (const level of Object.keys(selectedNpc.dialogues || {}).map(Number).sort((a, b) => a - b)) {
        if (selectedNpcFame >= level) {
          dialogueLevel = level;
        }
      }
    }

    return `
      <div class="npc-container">
        <!-- NPC列表 -->
        <div class="npc-list">
          ${regionNpcs.length === 0 ? `
            <div class="npc-empty">该地区暂无NPC</div>
          ` : regionNpcs.map(npc => {
            const fame = this.gameState.npcs?.find(n => n.id === npc.id)?.fame || 0;
            const famePercent = Math.min(fame, 100);
            // 获取地点名称，如果找不到则使用地点ID的中文映射
            let locationName = '';
            for (const [region, locations] of Object.entries(LOCATIONS)) {
              const loc = locations?.find(l => l.id === npc.location);
              if (loc) {
                locationName = loc.name;
                break;
              }
            }
            // 如果还是找不到，使用默认映射
            if (!locationName) {
              const locationMap = {
                'qingyun': '青云山', 'huangfeng': '黄枫谷', 'tianxing': '天星城',
                'modao': '魔岛', 'guzhan': '大晋古战场', 'dajin_city': '大晋皇都',
                'haizu': '海族海域', 'tiancheng': '天南城', 'heifeng': '黑风林',
                'feitai': '飞升台', 'tianyuan': '天渊城', 'wanyao': '万妖山脉',
                'feitian_pool': '飞升池', 'tianting': '天庭城', 'jiange': '剑仙阁',
                'dansheng': '丹圣谷', 'yuanchu': '源初秘境', 'lunhui': '轮回殿'
              };
              locationName = locationMap[npc.location] || npc.location;
            }
            const isAtLocation = playerLocation === npc.location;

            return `
              <div class="npc-item ${selectedNpcId === npc.id ? 'selected' : ''}"
                   onclick="game.selectNpc('${npc.id}')">
                <div class="npc-avatar">
                  ${npc.type === 'merchant' ? ' ' : npc.type === 'enemy' ? ' ' : npc.type === 'elder' ? ' ' : ' '}
                </div>
                <div class="npc-info">
                  <div class="npc-name">${npc.name}</div>
                  <div class="npc-location">${locationName} ${isAtLocation ? '<span style="color:#2ecc71">[当前位置]</span>' : ''}</div>
                  <div class="npc-fame-bar">
                    <div class="npc-fame-fill" style="width:${famePercent}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 右侧：NPC详情 -->
        <div class="npc-detail">
          ${selectedNpc ? `
            <div class="npc-detail-header">
              <div class="npc-detail-avatar">
                ${selectedNpc.type === 'merchant' ? ' ' : selectedNpc.type === 'enemy' ? ' ' : selectedNpc.type === 'elder' ? ' ' : ' '}
              </div>
              <div class="npc-detail-info">
                <div class="npc-detail-name">${selectedNpc.name}</div>
                <div class="npc-detail-realm">${selectedNpc.realm} · ${selectedNpc.type === 'merchant' ? '商人' : selectedNpc.type === 'enemy' ? '敌人' : selectedNpc.type === 'elder' ? '长老' : '道友'}</div>
                <div class="npc-detail-fame">
                  <div class="npc-detail-fame-label">好感</div>
                  <div class="npc-detail-fame-bar">
                    <div class="npc-detail-fame-fill" style="width:${Math.min(selectedNpcFame, 100)}%"></div>
                  </div>
                  <div class="npc-detail-fame-value">${selectedNpcFame}</div>
                </div>
                ${playerLocation !== selectedNpc.location ? `
                  <div style="font-size:11px;color:#e74c3c;margin-top:8px;padding:6px;background:rgba(231,76,60,0.1);border-radius:6px">
                    ⚠️ ${selectedNpc.name}不在当前位置，需要前往其所在地才能交互
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- 交互按钮 -->
            <div class="npc-actions">
              <button class="npc-action-btn" onclick="game.talkToNpc('${selectedNpc.id}')" ${playerLocation !== selectedNpc.location ? 'disabled style="opacity:0.5"' : ''}>
                <span class="npc-action-icon"> </span>
                <span>对话</span>
              </button>
              <button class="npc-action-btn" onclick="game.giveGiftToNpc('${selectedNpc.id}')" ${playerLocation !== selectedNpc.location ? 'disabled style="opacity:0.5"' : ''}>
                <span class="npc-action-icon"> </span>
                <span>送礼</span>
              </button>
              ${selectedNpc.quests && selectedNpc.quests.length > 0 ? `
                <button class="npc-action-btn" onclick="game.acceptNpcQuest('${selectedNpc.id}')">
                  <span class="npc-action-icon"> </span>
                  <span>接取任务</span>
                </button>
              ` : ''}
              ${selectedNpc.type === 'merchant' ? `
                <button class="npc-action-btn" onclick="game.tradeWithNpc('${selectedNpc.id}')">
                  <span class="npc-action-icon"> </span>
                  <span>交易</span>
                </button>
              ` : ''}
              <button class="npc-action-btn" onclick="game.goToNpcLocation('${selectedNpc.location}')" style="background:rgba(76,175,80,0.2)">
                <span class="npc-action-icon"> </span>
                <span>前往所在地</span>
              </button>
            </div>

            <!-- 对话历史 -->
            <div class="npc-dialogue-history">
              <div style="font-size:12px;color:#ffd700;margin-bottom:8px">对话记录</div>
              ${selectedNpc.dialogues && selectedNpc.dialogues[dialogueLevel] ? `
                ${selectedNpc.dialogues[dialogueLevel].map(dialogue => `
                  <div class="npc-dialogue-item">
                    <div class="npc-dialogue-speaker">${selectedNpc.name}</div>
                    <div class="npc-dialogue-text">${dialogue}</div>
                  </div>
                `).join('')}
              ` : `
                <div class="npc-dialogue-item">
                  <div class="npc-dialogue-text">无话可说</div>
                </div>
              `}
            </div>

            <!-- 任务列表 -->
            ${selectedNpc.quests && selectedNpc.quests.length > 0 ? `
              <div style="padding:12px;background:rgba(0,0,0,0.2);border-radius:10px;border:1px solid rgba(255,255,255,0.1)">
                <div style="font-size:12px;color:#ffd700;margin-bottom:8px">可用任务</div>
                ${selectedNpc.quests.map(questId => {
                  const quest = window.gameData?.QUESTS?.[questId];
                  if (!quest) return '';
                  return `
                    <div class="npc-quest-item">
                      <div class="npc-quest-name">${quest.name}</div>
                      <div class="npc-quest-desc">${quest.description}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          ` : `
            <div class="npc-empty">选择一个NPC查看详情</div>
          `}
        </div>
      </div>
    `;
  }

  // 渲染战斗界面
  renderCombat(enemy) {
    const player = this.gameState.player;
    const combat = window.game?.systems?.combat;
    const turn = combat?.turn || 0;
    const shieldHp = combat?.shieldHp || 0;

    return `
      <div class="combat-panel">
        <div class="card">
          <h3>第${turn}回合</h3>
          <div class="enemy-info">
            <div class="enemy-name">${enemy.name} ${enemy.element ? `[${enemy.element}]` : ''}</div>
            <div class="enemy-hp">
              <div class="bar">
                <div class="fill fill-hp" style="width:${Math.max(0, (enemy.hp / (enemy.maxHp || enemy.hp) * 100))}%"></div>
                <span class="bar-text">${Math.max(0, enemy.hp)}/${enemy.maxHp || enemy.hp}</span>
              </div>
            </div>
            ${enemy.debuffs && enemy.debuffs.length > 0 ? `
              <div style="margin-top:4px">
                ${enemy.debuffs.map(d => `<span style="background:rgba(231,76,60,0.3);padding:2px 6px;border-radius:4px;font-size:10px;margin-right:4px">${d.name} ${d.remainingTurns}回</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="card">
          <h3>你的状态</h3>
          <div class="stat-row">
            <span class="label">气血</span>
            <div class="bar">
              <div class="fill fill-hp" style="width:${Math.max(0, (player.hp / player.maxHp * 100))}%"></div>
              <span class="bar-text">${Math.max(0, player.hp)}/${player.maxHp}</span>
            </div>
          </div>
          <div class="stat-row">
            <span class="label">灵力</span>
            <div class="bar">
              <div class="fill fill-mp" style="width:${(player.mp / player.maxMp * 100)}%"></div>
              <span class="bar-text">${player.mp}/${player.maxMp}</span>
            </div>
          </div>
          ${shieldHp > 0 ? `<div style="color:#4fc3f7;font-size:11px">护盾: ${shieldHp}</div>` : ''}
        </div>
        <div class="combat-log card" style="max-height:120px;overflow-y:auto">
          ${(this.gameState.combatLog || combat?.log || []).slice(-6).map(log => `<div class="log-item" style="font-size:11px">${log}</div>`).join('') || ''}
        </div>
        <div class="card">
          <div class="grid3">
            <button onclick="game.combat('attack')" class="btn btn-combat">⚔️ 攻击</button>
            <button onclick="game.combat('skill')" class="btn btn-skill">✨ 技能</button>
            <button onclick="game.combat('defend')" class="btn btn-primary"> ️ 防御</button>
          </div>
          <div class="grid3" style="margin-top:6px">
            <button onclick="game.combat('talisman')" class="btn btn-explore">  符箓</button>
            <button onclick="game.combat('escape')" class="btn btn-heal">  逃跑</button>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染炼体面板
  renderBodyPanel() {
    const body = this.gameState.player.body || { realmIdx: 0, level: 1, exp: 0 };
    const bodyRealms = [
      { name: '铜皮', maxLevel: 10 },
      { name: '铁骨', maxLevel: 10 },
      { name: '银髓', maxLevel: 10 },
      { name: '金身', maxLevel: 10 },
      { name: '玉骨', maxLevel: 10 },
      { name: '圣体', maxLevel: 10 },
      { name: '梵圣真身', maxLevel: 10 }
    ];
    const realm = bodyRealms[body.realmIdx] || bodyRealms[0];

    return `
      <div class="card">
        <h3>炼体</h3>
        <div class="body-info">
          <div class="body-realm">${realm.name} Lv${body.level}/${realm.maxLevel}</div>
          <div class="body-exp">炼体值: ${body.exp}</div>
        </div>
        <div class="grid2">
          <button class="btn btn-primary" onclick="game.trainBody(3)">修炼3天</button>
          <button class="btn btn-primary" onclick="game.trainBody(7)">修炼7天</button>
          <button class="btn btn-skill" onclick="game.bodyBreakthrough()">突破</button>
        </div>
      </div>
    `;
  }

  // 渲染神识面板（4种修炼方式）
  renderSensePanel() {
    const sense = this.gameState.player.sense;
    const methods = window.game?.systems?.sense?.getAllMethodsStatus() || [];

    return `
      <div class="card">
        <h3> 神识修炼</h3>
        <div class="sense-info">
          <div class="sense-value">当前神识: ${sense}</div>
        </div>
        <div class="sense-methods">
          ${methods.map(method => `
            <div class="sense-method ${method.available ? '' : 'disabled'}">
              <div class="method-header">
                <span class="method-icon">${method.icon}</span>
                <span class="method-name">${method.name}</span>
              </div>
              <div class="method-info">
                <div class="method-cost">消耗: ${method.days > 0 ? method.days + '天' : '凝神丹×1'}</div>
                <div class="method-reward">收益: 神识+${method.minGain}~${method.maxGain}</div>
                <div class="method-risk">风险: ${method.risk}</div>
                ${method.onCooldown ? `<div class="method-cooldown">冷却: 剩余${method.cooldownRemaining}天</div>` : ''}
                ${method.requirementText ? `<div class="method-requirement">${method.requirementText}</div>` : ''}
              </div>
              <button class="btn btn-primary" onclick="game.trainSense('${method.id}')" ${method.available ? '' : 'disabled'}>
                ${method.available ? '开始修炼' : '不可用'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染制符面板
  renderTalismanPanel() {
    const talismanLevel = this.gameState.talismanLevel || 1;
    const talismanExp = this.gameState.talismanExp || 0;

    return `
      <div class="card">
        <h3>制符</h3>
        <div class="talisman-info">
          <div class="talisman-level">制符等级: ${talismanLevel}</div>
          <div class="talisman-exp">经验: ${talismanExp}</div>
        </div>
        <div class="talisman-recipes">
          <div class="recipe-item" onclick="game.craftTalisman('fire_talisman')">
            <span class="recipe-name">火球符</span>
            <span class="recipe-cost">灵草x1 + 火灵石x1</span>
          </div>
          <div class="recipe-item" onclick="game.craftTalisman('ice_talisman')">
            <span class="recipe-name">冰锥符</span>
            <span class="recipe-cost">灵草x1 + 寒玉x1</span>
          </div>
          <div class="recipe-item" onclick="game.craftTalisman('shield_talisman')">
            <span class="recipe-name">护身符</span>
            <span class="recipe-cost">灵草x2</span>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染法宝面板
  renderArtifactPanel() {
    const artifacts = this.gameState.artifacts || [];

    return `
      <div class="card">
        <h3>法宝</h3>
        <div class="artifact-list">
          ${artifacts.length === 0 ? '<div class="empty">暂无法宝</div>' :
            artifacts.map(a => `
              <div class="artifact-item">
                <div class="artifact-name">${a.name} (${a.grade})</div>
                <div class="artifact-stats">攻:${a.atk} 防:${a.def}</div>
                <div class="artifact-actions">
                  <button onclick="game.equipArtifact('${a.id}', 'attack')" class="btn btn-primary">装备</button>
                  <button onclick="game.nurtureArtifact('${a.id}')" class="btn btn-skill">温养</button>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染装备栏面板
  renderEquipmentPanel() {
    const slots = this.gameState.artifactSlots || {
      attack: [null, null],
      defense: [null],
      assist: [null, null],
      fly: [null],
      space: [null]
    };

    const slotNames = {
      attack: '攻击栏',
      defense: '防御栏',
      assist: '辅助栏',
      fly: '飞行栏',
      space: '空间栏'
    };

    const slotIcons = {
      attack: '⚔️',
      defense: '🛡️',
      assist: '✨',
      fly: ' ',
      space: ' '
    };

    const artifacts = this.gameState.artifacts || [];
    const mainArtifact = this.gameState.mainArtifact ? artifacts.find(a => a.id === this.gameState.mainArtifact) : null;

    // 获取装备的法宝信息
    const getArtifactInfo = (id) => {
      if (!id) return null;
      return artifacts.find(a => a.id === id) || null;
    };

    // 计算总属性加成
    let totalAtk = 0, totalDef = 0, totalSpeed = 0;
    Object.values(slots).flat().forEach(id => {
      const a = getArtifactInfo(id);
      if (a) {
        totalAtk += a.atk || 0;
        totalDef += a.def || 0;
        totalSpeed += a.speed || 0;
      }
    });

    return `
      ${mainArtifact ? `
        <div class="card" style="border-color:rgba(255,215,0,0.4)">
          <h3 style="color:#ffd700">本命法宝</h3>
          <div style="text-align:center;padding:10px;background:rgba(255,215,0,0.1);border-radius:8px;margin-bottom:8px">
            <div style="font-size:16px;color:#ffd700;font-weight:bold">${mainArtifact.name}</div>
            <div style="font-size:12px;color:#aaa">${mainArtifact.grade} · 攻:${mainArtifact.atk || 0} 防:${mainArtifact.def || 0}</div>
            <div style="margin-top:8px">
              <div style="font-size:11px;color:#aaa;margin-bottom:4px">成长度: ${mainArtifact.growth || 0}%</div>
              <div style="height:6px;background:rgba(0,0,0,0.3);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${mainArtifact.growth || 0}%;background:linear-gradient(90deg,#ffd700,#f39c12);transition:width 0.3s"></div>
              </div>
            </div>
            <div style="margin-top:6px">
              <div style="font-size:11px;color:#aaa;margin-bottom:4px">熟练度: ${mainArtifact.mastery || 0}/100</div>
              <div style="height:6px;background:rgba(0,0,0,0.3);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${mainArtifact.mastery || 0}%;background:linear-gradient(90deg,#4fc3f7,#2196f3);transition:width 0.3s"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-skill" onclick="game.nurtureMainArtifact()" style="flex:1">温养</button>
            <button class="btn btn-heal" onclick="game.breakthroughMainArtifact()" style="flex:1">突破</button>
            <button class="btn btn-combat" onclick="game.changeMainArtifactConfirm()" style="flex:1">更换</button>
          </div>
        </div>
      ` : `
        <div class="card">
          <h3>本命法宝</h3>
          <div class="empty">未绑定本命法宝</div>
          <div style="font-size:11px;color:#aaa;margin-top:8px">选择一件法宝绑定为本命，可随温养成长</div>
        </div>
      `}

      <div class="card">
        <h3>装备栏</h3>
        <div style="font-size:11px;color:#aaa;margin-bottom:8px">
          攻击+${totalAtk} | 防御+${totalDef} | 速度+${totalSpeed}
        </div>
        <div class="equipment-slots">
          ${Object.entries(slots).map(([slot, artifactIds]) => `
            <div class="equipment-slot-group">
              <div class="equipment-slot-title">${slotIcons[slot]} ${slotNames[slot]}</div>
              <div class="equipment-slot-items">
                ${artifactIds.map((id, idx) => {
                  const artifact = getArtifactInfo(id);
                  if (artifact) {
                    return `
                      <div class="equipment-slot filled" onclick="game.unequipArtifact('${id}')">
                        <div class="equipment-slot-name">${artifact.name}</div>
                        <div class="equipment-slot-grade">${artifact.grade}</div>
                        <div class="equipment-slot-stats">攻:${artifact.atk || 0} 防:${artifact.def || 0}</div>
                        <div class="equipment-slot-hint">点击卸下</div>
                      </div>
                    `;
                  } else {
                    return `
                      <div class="equipment-slot empty">
                        <div class="equipment-slot-empty">空</div>
                      </div>
                    `;
                  }
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h3>可装备法宝</h3>
        <div class="artifact-list">
          ${artifacts.filter(a => !a.equipped && !a.isMainArtifact).length === 0 ? '<div class="empty">没有可装备的法宝</div>' :
            artifacts.filter(a => !a.equipped && !a.isMainArtifact).map(a => `
              <div class="artifact-item">
                <div class="artifact-name">${a.name} (${a.grade})</div>
                <div class="artifact-stats">攻:${a.atk || 0} 防:${a.def || 0} ${a.speed ? '速:' + a.speed : ''}</div>
                <div class="artifact-actions">
                  ${!this.gameState.mainArtifact ? `<button onclick="game.bindMainArtifact('${a.id}')" class="btn btn-skill">绑定本命</button>` : ''}
                  ${a.type === 'attack' ? `<button onclick="game.equipArtifact('${a.id}', 'attack')" class="btn btn-primary">攻击栏</button>` : ''}
                  ${a.type === 'defense' ? `<button onclick="game.equipArtifact('${a.id}', 'defense')" class="btn btn-primary">防御栏</button>` : ''}
                  ${a.type === 'assist' ? `<button onclick="game.equipArtifact('${a.id}', 'assist')" class="btn btn-primary">辅助栏</button>` : ''}
                  ${a.type === 'fly' ? `<button onclick="game.equipArtifact('${a.id}', 'fly')" class="btn btn-primary">飞行栏</button>` : ''}
                  ${a.type === 'space' ? `<button onclick="game.equipArtifact('${a.id}', 'space')" class="btn btn-primary">空间栏</button>` : ''}
                  ${!['attack', 'defense', 'assist', 'fly', 'space'].includes(a.type) ? `<button onclick="game.equipArtifact('${a.id}', 'attack')" class="btn btn-primary">装备</button>` : ''}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染灵兽面板
  renderBeastPanel() {
    const beasts = this.gameState.beasts || [];

    return `
      <div class="card">
        <h3>灵兽</h3>
        <div class="beast-list">
          ${beasts.length === 0 ? '<div class="empty">暂无灵兽</div>' :
            beasts.map(b => `
              <div class="beast-item">
                <div class="beast-name">${b.name} (${b.type})</div>
                <div class="beast-stats">HP:${b.hp}/${b.maxHp} 攻:${b.atk} 忠:${b.loyalty}</div>
                <div class="beast-actions">
                  <button onclick="game.setBeastActive('${b.id}', ${!b.active})" class="btn btn-primary">
                    ${b.active ? '收回' : '出战'}
                  </button>
                  <button onclick="game.feedBeast('${b.id}', 'herb')" class="btn btn-heal">喂食</button>
                  <button onclick="game.trainBeast('${b.id}', 3)" class="btn btn-skill">训练</button>
                  ${b.type === 'swarm' ? `<button onclick="game.breedBeast('${b.id}')" class="btn btn-explore">繁殖</button>` : ''}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染傀儡面板
  renderPuppetPanel() {
    const puppets = this.gameState.puppets || [];

    return `
      <div class="card">
        <h3>傀儡</h3>
        <div class="puppet-list">
          ${puppets.length === 0 ? '<div class="empty">暂无傀儡</div>' :
            puppets.map(p => `
              <div class="puppet-item">
                <div class="puppet-name">${p.name}</div>
                <div class="puppet-stats">HP:${p.hp}/${p.maxHp} 攻:${p.atk} 能量:${p.energy}/${p.maxEnergy}</div>
                <div class="puppet-actions">
                  <button onclick="game.deployPuppet('${p.id}', 'mine')" class="btn btn-primary">采矿</button>
                  <button onclick="game.deployPuppet('${p.id}', 'gather')" class="btn btn-skill">采集</button>
                  <button onclick="game.chargePuppet('${p.id}')" class="btn btn-heal">灌注</button>
                  ${p.deployed ? `<button onclick="game.recallPuppet('${p.id}')" class="btn btn-explore">收回</button>` : ''}
                </div>
              </div>
            `).join('')}
        </div>
        <div class="grid2">
          <button onclick="game.craftPuppet(0)" class="btn btn-primary">制作初级傀儡</button>
          <button onclick="game.craftPuppet(1)" class="btn btn-skill">制作中级傀儡</button>
        </div>
      </div>
    `;
  }

  // 渲染掌天瓶面板
  renderBottlePanel() {
    const bottle = this.gameState.bottle;

    if (!bottle || !bottle.obtained) {
      return `
        <div class="card">
          <h3>掌天瓶</h3>
          <div class="bottle-locked">未获得掌天瓶</div>
        </div>
      `;
    }

    return `
      <div class="card">
        <h3>  掌天瓶</h3>
        <div class="bottle-info">
          <div class="bottle-liquid">绿液: ${bottle.greenLiquid}/${bottle.maxGreenLiquid}</div>
          <div class="bottle-fields">灵田: ${bottle.spiritFieldSlots}块</div>
          <div class="bottle-maid">器灵好感: ${bottle.spiritMaidFavor}</div>
        </div>
        <div class="bottle-actions">
          <button onclick="game.condenseGreenLiquid()" class="btn btn-primary" style="width:100%">凝聚绿液</button>
        </div>
        <div class="bottle-usages">
          <h4>绿液用途（10种）</h4>
          <div class="grid2">
            <button onclick="game.useGreenLiquid('ripen_herb')" class="btn btn-primary">  催熟灵草(1滴)</button>
            <button onclick="game.useGreenLiquid('ripen_fruit')" class="btn btn-primary">  催熟灵果树(5滴)</button>
            <button onclick="game.useGreenLiquid('irrigate')" class="btn btn-primary">  灌溉灵田(1滴)</button>
            <button onclick="game.useGreenLiquid('alchemy_aid')" class="btn btn-primary">  炼丹辅料(1滴)</button>
            <button onclick="game.useGreenLiquid('artifact_enhance')" class="btn btn-primary">⚔️ 涂抹法宝(3滴)</button>
            <button onclick="game.useGreenLiquid('heal')" class="btn btn-heal">❤️ 疗伤(1滴)</button>
            <button onclick="game.useGreenLiquid('mp')" class="btn btn-skill">  灵力速充(1滴)</button>
            <button onclick="game.useGreenLiquid('beast_feed')" class="btn btn-primary">  灵兽喂养(1滴)</button>
            <button onclick="game.useGreenLiquid('cultivate')" class="btn btn-primary">  口服修炼(1滴)</button>
            <button onclick="game.useGreenLiquid('breakthrough')" class="btn btn-explore">⚡ 提升突破率(3滴)</button>
          </div>
        </div>
        <div class="bottle-fields-list">
          <h4>灵田</h4>
          ${bottle.spiritFields.map((field, i) => `
            <div class="field-item">
              ${field ? `种植中 - ${field.herbId}` : '空闲'}
              ${field ? `<button onclick="game.harvestField(${i})" class="btn btn-primary">收获</button>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="grid2">
          <button onclick="game.interactSpiritMaid('chat')" class="btn btn-skill">与器灵聊天</button>
          <button onclick="game.interactSpiritMaid('feed')" class="btn btn-heal">喂食魂晶</button>
        </div>
      </div>
    `;
  }

  // 格式化数字
  formatNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toString();
  }

  // 渲染成就面板（33个成就）
  renderAchievementPanel() {
    const achievements = window.game?.systems?.achievement?.getList() || [];
    const progress = window.game?.systems?.achievement?.getProgress() || { total: 33, unlocked: 0, percentage: 0 };
    const categoryStats = window.game?.systems?.achievement?.getCategoryStats() || {};

    return `
      <div class="card">
        <h3>  成就系统</h3>
        <div class="achievement-progress">
          <div class="progress-text">进度: ${progress.unlocked}/${progress.total} (${progress.percentage}%)</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${progress.percentage}%"></div>
          </div>
        </div>
        <div class="achievement-categories">
          ${Object.entries(categoryStats).map(([key, cat]) => `
            <div class="category-stat">
              <span class="category-name">${cat.name}</span>
              <span class="category-count">${cat.unlocked}/${cat.total}</span>
            </div>
          `).join('')}
        </div>
        <div class="achievement-list">
          ${achievements.map(a => `
            <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}">
              <div class="achievement-icon">${a.unlocked ? '✅' : '🔒'}</div>
              <div class="achievement-info">
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-desc">${a.desc}</div>
                ${a.unlocked ? `<div class="achievement-reward">奖励: ${a.reward?.exp ? `修为+${a.reward.exp}` : ''} ${a.reward?.stones ? `灵石+${a.reward.stones}` : ''}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
