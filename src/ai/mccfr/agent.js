import { isValidMove, getLineStrength } from '@/game/Rules';
import Strategy from '@/ai/mccfr/strategy';
import { LINES, LINE_SIZES } from '@/utils/constants';
import { getHandRank } from '@/utils/scoring';

class MCCFRAgent {
  constructor(playerId) {
    this.playerId = playerId;
    this.strategy = new Strategy();
    this.iterations = 1000;
    this.learningRate = 0.1;
    this.explorationRate = 0.1;
  }

  async loadProgress() {
    try {
      const response = await fetch(`/progress/ai-progress-${this.playerId}.json`);
      if (response.ok) {
        const progress = await response.json();
        this.strategy.load(progress);
      }
    } catch (error) {
      console.log('No previous progress found, starting fresh');
    }
  }

  async saveProgress() {
    try {
      const progress = this.strategy.save();
      const response = await fetch(`/progress/ai-progress-${this.playerId}.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progress)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  getMove(hand, availableCards) {
    const gameState = this.getGameState(hand, availableCards);
    const strategy = this.strategy.getStrategy(gameState);
    const actions = this.getPossibleActions(hand, availableCards);

    // Исследование vs использование
    if (Math.random() < this.explorationRate) {
      // Случайный ход для исследования
      return actions[Math.floor(Math.random() * actions.length)];
    }

    // Выбор действия на основе стратегии
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < strategy.length; i++) {
      cumulativeProbability += strategy[i];
      if (randomValue < cumulativeProbability) {
        return actions[i];
      }
    }

    return actions[actions.length - 1];
  }

  getGameState(hand, availableCards) {
    return {
      hand: JSON.parse(JSON.stringify(hand)),
      availableCards: availableCards.map(card => ({ ...card })),
      numActions: this.getPossibleActions(hand, availableCards).length
    };
  }

  getPossibleActions(hand, availableCards) {
    const actions = [];
    const lines = Object.values(LINES);

    // Генерация всех возможных размещений двух карт
    for (let i = 0; i < availableCards.length; i++) {
      for (let j = 0; j < availableCards.length; j++) {
        if (i === j) continue;

        for (const line1 of lines) {
          if (hand[line1].length >= LINE_SIZES[line1]) continue;

          for (const line2 of lines) {
            if (line2 === line1 && hand[line2].length + 1 >= LINE_SIZES[line2]) continue;
            if (line2 !== line1 && hand[line2].length >= LINE_SIZES[line2]) continue;

            // Проверка валидности размещения
            const tempHand = JSON.parse(JSON.stringify(hand));
            tempHand[line1].push(availableCards[i]);
            tempHand[line2].push(availableCards[j]);
            
            if (this.isValidPlacement(tempHand)) {
              actions.push({
                placements: [
                  { cardIndex: i, line: line1 },
                  { cardIndex: j, line: line2 }
                ],
                discardIndex: 3 - (i + j)
              });
            }
          }
        }
      }
    }

    return actions;
  }

  isValidPlacement(hand) {
    // Проверка правила "верхняя линия не может быть сильнее средней, средняя не может быть сильнее нижней"
    const topStrength = this.evaluateLineStrength(hand[LINES.TOP]);
    const middleStrength = this.evaluateLineStrength(hand[LINES.MIDDLE]);
    const bottomStrength = this.evaluateLineStrength(hand[LINES.BOTTOM]);

    return topStrength <= middleStrength && middleStrength <= bottomStrength;
  }

  evaluateLineStrength(cards) {
    if (cards.length === 0) return 0;
    const rank = getHandRank(cards);
    return this.getHandValue(rank);
  }

  getHandValue(rank) {
    const values = {
      'ROYAL_FLUSH': 10,
      'STRAIGHT_FLUSH': 9,
      'FOUR_OF_A_KIND': 8,
      'FULL_HOUSE': 7,
      'FLUSH': 6,
      'STRAIGHT': 5,
      'THREE_OF_A_KIND': 4,
      'TWO_PAIR': 3,
      'PAIR': 2,
      'HIGH_CARD': 1
    };
    return values[rank] || 0;
  }

  async learn(gameState) {
    for (let i = 0; i < this.iterations; i++) {
      await this.cfr(gameState, 1, 1);
    }
  }

  async cfr(gameState, reachProbability, oppReachProbability) {
    const strategy = this.strategy.getStrategy(gameState);
    const actions = this.getPossibleActions(gameState.hand, gameState.availableCards);
    const utilities = new Array(actions.length).fill(0);
    let nodeUtility = 0;

    // Вычисление полезности для каждого действия
    for (let i = 0; i < actions.length; i++) {
      const newGameState = this.applyAction(gameState, actions[i]);
      utilities[i] = this.evaluateState(newGameState);
      nodeUtility += strategy[i] * utilities[i];
    }

    // Обновление сожалений
    const regrets = utilities.map(u => u - nodeUtility);
    this.strategy.updateRegrets(gameState, regrets.map(r => r * oppReachProbability));

    return nodeUtility;
  }

  applyAction(gameState, action) {
    const newGameState = JSON.parse(JSON.stringify(gameState));
    action.placements.forEach(placement => {
      newGameState.hand[placement.line].push(
        newGameState.availableCards[placement.cardIndex]
      );
    });
    return newGameState;
  }

  evaluateState(gameState) {
    let score = 0;
    Object.entries(gameState.hand).forEach(([line, cards]) => {
      const rank = getHandRank(cards);
      score += this.getHandValue(rank) * this.getLineMultiplier(line);
    });
    return score;
  }

  getLineMultiplier(line) {
    return {
      [LINES.TOP]: 1.5,    // Больший вес для верхней линии
      [LINES.MIDDLE]: 1.0,  // Стандартный вес для средней
      [LINES.BOTTOM]: 0.8   // Меньший вес для нижней
    }[line];
  }
}

export default MCCFRAgent;
