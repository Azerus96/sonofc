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

  async saveProgress() {
    try {
      const progress = this.strategy.save();
      const response = await fetch(`/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: this.playerId,
          progress: progress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async loadProgress() {
    try {
      const response = await fetch(`/api/progress/${this.playerId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          this.strategy.load(data.progress);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  getMove(hand, availableCards) {
    const gameState = this.getGameState(hand, availableCards);
    const strategy = this.strategy.getStrategy(gameState);
    const actions = this.getPossibleActions(hand, availableCards);

    // Исследование vs использование
    if (Math.random() < this.explorationRate) {
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

    for (let i = 0; i < availableCards.length; i++) {
      for (let j = 0; j < availableCards.length; j++) {
        if (i === j) continue;

        for (const line1 of lines) {
          if (hand[line1].length >= LINE_SIZES[line1]) continue;

          for (const line2 of lines) {
            if (line2 === line1 && hand[line2].length + 1 >= LINE_SIZES[line2]) continue;
            if (line2 !== line1 && hand[line2].length >= LINE_SIZES[line2]) continue;

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
    await this.saveProgress();
  }

  async cfr(gameState, reachProbability, oppReachProbability) {
    const strategy = this.strategy.getStrategy(gameState);
    const actions = this.getPossibleActions(gameState.hand, gameState.availableCards);
    const utilities = new Array(actions.length).fill(0);
    let nodeUtility = 0;

    for (let i = 0; i < actions.length; i++) {
      const newGameState = this.applyAction(gameState, actions[i]);
      utilities[i] = this.evaluateState(newGameState);
      nodeUtility += strategy[i] * utilities[i];
    }

    const regrets = utilities.map(u => u - nodeUtility);
    this.strategy.updateRegrets(gameState, regrets.map(r => r * oppReachProbability));

    return nodeUtility;
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
      [LINES.TOP]: 1.5,
      [LINES.MIDDLE]: 1.0,
      [LINES.BOTTOM]: 0.8
    }[line];
  }
}

export default MCCFRAgent;
