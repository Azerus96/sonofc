import { CARDS, LINE_SIZES } from './constants';

export const createDeck = () => {
  const deck = [];
  for (const suit of CARDS.SUITS) {
    for (const rank of CARDS.RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
};

export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const compareCards = (card1, card2) => {
  const rank1 = CARDS.RANKS.indexOf(card1.rank);
  const rank2 = CARDS.RANKS.indexOf(card2.rank);
  if (rank1 !== rank2) return rank1 - rank2;
  return CARDS.SUITS.indexOf(card1.suit) - CARDS.SUITS.indexOf(card2.suit);
};

export const generateCardId = (card) => {
  return `${card.rank}${card.suit}`;
};

export const createSVGCard = (card) => {
  const isRed = card.suit === 'h' || card.suit === 'd';
  const suitSymbols = {
    'h': '♥',
    'd': '♦',
    'c': '♣',
    's': '♠'
  };

  return `
    <svg width="70" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="68" height="98" x="1" y="1" fill="white" stroke="#ccc" stroke-width="1" rx="5" />
      <text x="5" y="20" fill="${isRed ? '#ff0000' : '#000000'}" font-size="16">${card.rank}</text>
      <text x="5" y="40" fill="${isRed ? '#ff0000' : '#000000'}" font-size="20">${suitSymbols[card.suit]}</text>
    </svg>
  `;
};

export const isValidCardMove = (card, sourceLine, targetLine, currentHand) => {
  if (!card || !sourceLine || !targetLine || !currentHand) return false;
  
  const sourceCards = currentHand[sourceLine];
  const targetCards = currentHand[targetLine];
  
  if (targetCards.length >= LINE_SIZES[targetLine]) return false;
  
  return true;
};

export const getCardRank = (card) => {
  return CARDS.RANKS.indexOf(card.rank);
};

export const getCardSuit = (card) => {
  return CARDS.SUITS.indexOf(card.suit);
};

export default {
  createDeck,
  shuffleDeck,
  compareCards,
  generateCardId,
  createSVGCard,
  isValidCardMove,
  getCardRank,
  getCardSuit
};
