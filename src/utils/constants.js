export const CARDS = {
  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
  SUITS: ['h', 'd', 'c', 's']
};

export const LINES = {
  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom'
};

export const LINE_SIZES = {
  [LINES.TOP]: 3,
  [LINES.MIDDLE]: 5,
  [LINES.BOTTOM]: 5
};

export const ROYALTIES = {
  BOTTOM: {
    STRAIGHT: 2,
    FLUSH: 4,
    FULL_HOUSE: 6,
    FOUR_OF_A_KIND: 10,
    STRAIGHT_FLUSH: 15,
    ROYAL_FLUSH: 25
  },
  MIDDLE: {
    THREE_OF_A_KIND: 2,
    STRAIGHT: 4,
    FLUSH: 8,
    FULL_HOUSE: 12,
    FOUR_OF_A_KIND: 20,
    STRAIGHT_FLUSH: 30,
    ROYAL_FLUSH: 50
  },
  TOP: {
    PAIR: {
      'Q': 1, 'K': 2, 'A': 3
    },
    THREE_OF_A_KIND: {
      '2': 10, '3': 11, '4': 12, '5': 13, '6': 14,
      '7': 15, '8': 16, '9': 17, 'T': 18, 'J': 19,
      'Q': 20, 'K': 21, 'A': 22
    }
  }
};

export const GAME_STATES = {
  WAITING: 'waiting',
  DEALING: 'dealing',
  PLAYING: 'playing',
  SCORING: 'scoring',
  FANTASY: 'fantasy'
};

export const INITIAL_CARDS = 5;
export const CARDS_PER_STREET = 3;
export const TOTAL_STREETS = 5;
export const MAX_PLAYERS = 3;
export const FANTASY_MIN_PAIR = 'Q';
