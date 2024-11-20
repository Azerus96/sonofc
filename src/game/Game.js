import { GAME_STATES, INITIAL_CARDS, CARDS_PER_STREET, LINES, TOTAL_STREETS } from '@/utils/constants';
import { createDeck, shuffleDeck } from '@/utils/cards';
import { compareHands, calculateRoyalties } from '@/utils/scoring';
import Player from '@/game/Player';
import MCCFRAgent from '@/ai/mccfr/agent';

class Game {
  constructor(playerCount = 2) {
    this.state = GAME_STATES.WAITING;
    this.players = [];
    this.currentPlayerIndex = 0;
    this.deck = [];
    this.street = 0;
    this.dealerIndex = 0;
    this.aiAgents = [];
    
    // Инициализация игроков
    this.addHumanPlayer("Player");
    for (let i = 1; i < playerCount; i++) {
      this.addAIPlayer(`AI ${i}`);
    }
  }

  addHumanPlayer(name) {
    const player = new Player(this.players.length, name, false);
    this.players.push(player);
  }

  addAIPlayer(name) {
    const player = new Player(this.players.length, name, true);
    const agent = new MCCFRAgent(this.players.length);
    this.aiAgents.push(agent);
    this.players.push(player);
  }

  async start() {
    if (this.players.length < 2) return false;
    
    // Загрузка сохраненного прогресса для всех AI агентов
    await Promise.all(this.aiAgents.map(agent => agent.loadProgress()));
    
    this.state = GAME_STATES.DEALING;
    this.deck = shuffleDeck(createDeck());
    this.street = 0;
    this.players.forEach(player => player.resetHand());
    
    this.dealInitialCards();
    return true;
  }

  dealInitialCards() {
    for (let i = 0; i < INITIAL_CARDS; i++) {
      this.players.forEach(player => {
        const card = this.deck.pop();
        if (card) {
          if (player.isAI) {
            const agent = this.aiAgents[player.id];
            const line = agent.getOptimalLine(player.hand, card);
            player.addCard(card, line);
          } else {
            player.currentStreetCards = player.currentStreetCards || [];
            player.currentStreetCards.push(card);
          }
        }
      });
    }
    this.state = GAME_STATES.PLAYING;
  }

  dealStreetCards() {
    if (this.street >= TOTAL_STREETS) return false;
    
    this.players.forEach(player => {
      const cards = [];
      for (let i = 0; i < CARDS_PER_STREET; i++) {
        const card = this.deck.pop();
        if (card) cards.push(card);
      }
      
      if (player.isAI) {
        const agent = this.aiAgents[player.id];
        const move = agent.getMove(player.hand, cards);
        this.executeAIMove(player, move, cards);
      } else {
        player.currentStreetCards = cards;
      }
    });
    
    this.street++;
    return true;
  }

  executeAIMove(player, move, cards) {
    move.placements.forEach(placement => {
      player.addCard(cards[placement.cardIndex], placement.line);
    });
    player.discardCard(cards[move.discardIndex]);
  }

  makeMove(playerId, cardId, line) {
    const player = this.players[playerId];
    if (!player || player.isAI) return false;
    
    const cardIndex = player.currentStreetCards.findIndex(
      card => `${card.rank}${card.suit}` === cardId
    );
    
    if (cardIndex === -1) return false;
    
    const success = player.addCard(player.currentStreetCards[cardIndex], line);
    if (success) {
      player.currentStreetCards.splice(cardIndex, 1);
    }
    
    return success;
  }

  async endGame() {
    const scores = this.calculateScores();
    
    // Обучение и сохранение прогресса AI
    await Promise.all(this.aiAgents.map(async (agent, index) => {
      const gameState = {
        hands: this.players.map(p => p.hand),
        scores: scores
      };
      await agent.learn(gameState);
      await agent.saveProgress();
    }));
    
    this.state = GAME_STATES.SCORING;
    return scores;
  }

  calculateScores() {
    const scores = new Array(this.players.length).fill(0);
    
    // Попарное сравнение рук
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const points = compareHands(
          this.players[i].hand,
          this.players[j].hand
        );
        scores[i] += points;
        scores[j] -= points;
      }
    }
    
    // Добавление роялти
    this.players.forEach((player, index) => {
      if (player.hasValidHand()) {
        scores[index] += calculateRoyalties(player.hand);
      }
    });
    
    return scores;
  }

  isGameOver() {
    return this.street >= TOTAL_STREETS && this.areAllPlayersReady();
  }

  areAllPlayersReady() {
    return this.players.every(player => 
      player.isHandComplete() || player.currentStreetCards === null
    );
  }
}

export default Game;
