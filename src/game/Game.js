import { isValidMove, isValidHand, canActivateFantasy } from '@/game/Rules';
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
    console.log("Game initialized with players:", this.players);
  }

  addHumanPlayer(name) {
    const player = new Player(this.players.length, name, false);
    this.players.push(player);
    console.log(`Added human player: ${name}`);
  }

  addAIPlayer(name) {
    const player = new Player(this.players.length, name, true);
    const agent = new MCCFRAgent(this.players.length);
    this.aiAgents.push(agent);
    this.players.push(player);
    console.log(`Added AI player: ${name}`);
  }

  async start() {
    console.log("Starting game...");
    if (this.players.length < 2) {
      console.error("Not enough players to start the game.");
      return false;
    }

    // Загрузка сохранённого прогресса для всех AI агентов
    console.log("Loading AI progress...");
    await Promise.all(this.aiAgents.map(agent => agent.loadProgress()));

    this.state = GAME_STATES.DEALING;
    console.log("Game state set to DEALING");

    // Создание и перемешивание колоды
    this.deck = shuffleDeck(createDeck());
    console.log("Deck created and shuffled:", this.deck);

    if (this.deck.length === 0) {
      console.error("Deck is empty after creation!");
      return false;
    }

    this.street = 0;
    this.players.forEach(player => player.resetHand());
    console.log("All players' hands have been reset.");

    // Раздача начальных карт
    this.dealInitialCards();

    // Проверка состояния после раздачи
    console.log("Game state after dealing initial cards:", this.state);
    console.log("Players' hands after dealing:");
    this.players.forEach(player => {
      console.log(`Player ${player.name} hand:`, player.hand);
    });

    return true;
  }

  dealInitialCards() {
    console.log("Dealing initial cards...");
    for (let i = 0; i < INITIAL_CARDS; i++) {
      this.players.forEach(player => {
        const card = this.deck.pop();
        if (card) {
          if (player.isAI) {
            const agent = this.aiAgents[player.id];
            try {
              const line = agent.getOptimalLine(player.hand, card);
              const success = player.addCard(card, line);
              console.log(`AI ${player.name} added card ${card.rank}${card.suit} to ${line}: ${success}`);
            } catch (error) {
              console.error(`Error in AI ${player.name} logic:`, error);
            }
          } else {
            player.currentStreetCards = player.currentStreetCards || [];
            player.currentStreetCards.push(card);
            console.log(`Player ${player.name} received card ${card.rank}${card.suit}`);
          }
        } else {
          console.error("Deck is empty! Cannot deal more cards.");
        }
      });
    }

    // Проверяем, что карты действительно раздались
    this.players.forEach(player => {
      console.log(`Player ${player.name} hand after initial deal:`, player.hand);
    });

    // Устанавливаем состояние игры на PLAYING
    this.state = GAME_STATES.PLAYING;
    console.log("Game state set to PLAYING");
  }

  makeMove(playerId, cardId, targetLine) {
    console.log(`Player ID: ${playerId} is trying to move card ${cardId} to line ${targetLine}`);
    
    const player = this.players[playerId];
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      console.error(`Card with ID ${cardId} not found in player ${player.name}'s hand.`);
      return false;
    }

    const cardToMove = player.hand.splice(cardIndex, 1)[0];
    console.log(`Moving card:`, cardToMove);
    
    // Добавляем карту на целевую линию
    player.currentStreetCards.push({ card: cardToMove, line: targetLine });
    console.log(`Card ${cardToMove.rank}${cardToMove.suit} moved to line ${targetLine} by ${player.name}`);
    return true;
  }

  dealStreetCards() {
    if (this.street >= TOTAL_STREETS) {
      console.log("All streets have been dealt. No more cards to deal.");
      return false;
    }

    console.log(`Dealing street cards for street ${this.street + 1}...`);
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
    console.log(`Street ${this.street} dealt. Remaining cards in deck: ${this.deck.length}`);
    return true;
  }

  executeAIMove(player, move, cards) {
    console.log(`Executing AI move for player ${player.name}...`);
    try {
      move.placements.forEach(placement => {
        const success = player.addCard(cards[placement.cardIndex], placement.line);
        console.log(`AI placed card ${cards[placement.cardIndex].rank}${cards[placement.cardIndex].suit} on ${placement.line}: ${success}`);
      });
      player.discardCard(cards[move.discardIndex]);
      console.log(`AI discarded card ${cards[move.discardIndex].rank}${cards[move.discardIndex].suit}`);
    } catch (error) {
      console.error(`Error executing AI move for player ${player.name}:`, error);
    }
  }

  async endGame() {
    console.log("Ending game...");
    const scores = this.calculateScores();

    console.log("Saving AI progress...");
    await Promise.all(this.aiAgents.map(async (agent, index) => {
      const gameState = {
        hands: this.players.map(p => p.hand),
        scores: scores
      };
      await agent.learn(gameState);
      await agent.saveProgress();
    }));

    this.state = GAME_STATES.SCORING;
    console.log("Game state set to SCORING. Final scores:", scores);
    return scores;
  }

  calculateScores() {
    const scores = new Array(this.players.length).fill(0);

    console.log("Calculating scores...");
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

    this.players.forEach((player, index) => {
      if (player.hasValidHand()) {
        scores[index] += calculateRoyalties(player.hand);
      }
    });

    console.log("Scores calculated:", scores);
    return scores;
  }

  isGameOver() {
    const isOver = this.street >= TOTAL_STREETS && this.areAllPlayersReady();
    console.log("Checking if game is over:", isOver);
    return isOver;
  }

  areAllPlayersReady() {
    const allReady = this.players.every(player =>
      player.isHandComplete() || player.currentStreetCards === null
    );
    console.log("Are all players ready?", allReady);
    return allReady;
  }
}

export default Game;
