updateRegrets(gameState, regrets) {
    const key = this.getKey(gameState);
    const existingRegrets = this.regretSum.get(key) || new Array(gameState.numActions).fill(0);
    
    for (let i = 0; i < gameState.numActions; i++) {
      existingRegrets[i] += regrets[i];
    }
    
    this.regretSum.set(key, existingRegrets);
  }

  getAverageStrategy(gameState) {
    const key = this.getKey(gameState);
    const strategySum = this.strategySum.get(key) || new Array(gameState.numActions).fill(0);
    const avgStrategy = new Array(gameState.numActions).fill(0);
    let normalizingSum = 0;

    for (let i = 0; i < gameState.numActions; i++) {
      normalizingSum += strategySum[i];
    }

    if (normalizingSum > 0) {
      for (let i = 0; i < gameState.numActions; i++) {
        avgStrategy[i] = strategySum[i] / normalizingSum;
      }
    } else {
      // Равномерное распределение, если нет накопленной стратегии
      const probability = 1.0 / gameState.numActions;
      for (let i = 0; i < gameState.numActions; i++) {
        avgStrategy[i] = probability;
      }
    }

    return avgStrategy;
  }

  save() {
    return {
      regretSum: Array.from(this.regretSum.entries()),
      strategySum: Array.from(this.strategySum.entries())
    };
  }

  load(data) {
    this.regretSum = new Map(data.regretSum);
    this.strategySum = new Map(data.strategySum);
  }
}

export default Strategy;
