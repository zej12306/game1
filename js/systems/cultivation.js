// 修炼系统
export class CultivationSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  // 获取修炼速度
  getCultivationSpeed() {
    const player = this.gameState.player;
    const baseSpeed = 1.0;
    const rootMultiplier = player.root.type.mult;
    const comprehensionBonus = 1 + player.comprehension * 0.005;
    const skillBonus = this.getSkillBonus();
    const locationBonus = this.getLocationBonus();

    return baseSpeed * rootMultiplier * comprehensionBonus * skillBonus * locationBonus;
  }

  // 获取功法加成
  getSkillBonus() {
    const mainSkill = this.gameState.skills.main;
    if (!mainSkill) return 1.0;

    const skillData = window.gameData?.SKILLS?.main?.find(s => s.id === mainSkill.id);
    return skillData ? skillData.cultivationBonus : 1.0;
  }

  // 获取地点加成
  getLocationBonus() {
    const location = this.gameState.currentLocation;
    if (!location) return 1.0;

    // 灵气浓郁的地方加成更高
    const bonuses = {
      'qingyun': 1.0,
      'heifeng': 1.1,
      'tiancheng': 1.2,
      'huangfeng': 1.3,
      'xuejin': 1.5,
      'tianjin': 1.8,
      'tianxing': 2.0,
      'dajin_city': 2.5,
      'feitai': 3.0,
      'tianyuan': 4.0,
      'feitian_pool': 5.0,
      'tianting': 6.0
    };

    return bonuses[location] || 1.0;
  }

  // 打坐修炼（时间推进由TimeSystem处理）
  meditate(days) {
    const speed = this.getCultivationSpeed();
    let expGain = Math.floor(speed * days * 10);

    // 重伤debuff检查（修炼速度-50%）
    const injuredBuff = this.gameState.player.buffs?.find(b => b.type === 'injured');
    if (injuredBuff) {
      expGain = Math.floor(expGain * (1 + injuredBuff.value));
    }

    // 转修期检查（GDD: 切换功法需要10天转修期，修炼速度-50%）
    const transmuteBuff = this.gameState.player.buffs?.find(b => b.type === 'transmute');
    if (transmuteBuff) {
      expGain = Math.floor(expGain * 0.5);
    }

    this.gameState.player.exp += expGain;

    // 灵力消耗（GDD: 打坐每秒消耗灵力）
    const mpCost = Math.floor(this.gameState.player.maxMp * 0.02 * days);
    this.gameState.player.mp = Math.max(0, this.gameState.player.mp - mpCost);

    return expGain;
  }

  // 闭关修炼（1.17倍加成）
  retreat(days) {
    const baseExp = this.meditate(days);
    const bonusExp = Math.floor(baseExp * 0.17);
    this.gameState.player.exp += bonusExp;

    return baseExp + bonusExp;
  }

  // 神识修炼
  trainSense(days) {
    const senseGain = Math.floor(days * 2 * (1 + this.gameState.player.comprehension * 0.01));
    this.gameState.player.sense += senseGain;
    this.gameState.gameTime.day += days;
    this.gameState.gameTime.totalDays += days;
    this.gameState.player.age += days / 360;

    return senseGain;
  }

  // 炼体修炼
  trainBody(days) {
    const bodyGain = Math.floor(days * 3 * (1 + this.gameState.player.fortune * 0.01));
    this.gameState.player.bodyExp = (this.gameState.player.bodyExp || 0) + bodyGain;
    this.gameState.gameTime.day += days;
    this.gameState.gameTime.totalDays += days;
    this.gameState.player.age += days / 360;

    return bodyGain;
  }
}
