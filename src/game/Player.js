class Player {
  constructor(id, name, isAI = false) {
    this.id = id;
    this.name = name;
    this.isAI = isAI;
    this.hand = {
      [LINES.TOP]: [],
      [LINES.MIDDLE]: [],
      [LINES.BOTTOM]: []
    };
    this.discardedCards = [];
    this.points = 0;
    this.ready = false;
    this.timeBank = 60; // секунды
  }

  resetHand() {
    this.hand = {
      [LINES.TOP]: [],
      [LINES.MIDDLE]: [],
      [LINES.BOTTOM]: []
    };
    this.discardedCards = [];
    this.ready = false;
  }

  addCard(card, line) {
    if (this.hand[line].length < LINE_SIZES[line]) {
      this.hand[line].push(card);
      return true;
    }
    return false;
  }

  removeCard(cardId, line) {
    const index = this.hand[line].findIndex(card => 
      generateCardId(card) === cardId
    );
    if (index !== -1) {
      return this.hand[line].splice(index, 1)[0];
    }
    return null;
  }

  discardCard(card) {
    this.discardedCards.push(card);
  }

  hasValidHand() {
    return !isDeadHand(this.hand);
  }

  isHandComplete() {
    return (
      this.hand[LINES.TOP].length === LINE_SIZES[LINES.TOP] &&
      this.hand[LINES.MIDDLE].length === LINE_SIZES[LINES.MIDDLE] &&
      this.hand[LINES.BOTTOM].length === LINE_SIZES[LINES.BOTTOM]
    );
  }
}

export default Player;
