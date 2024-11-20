import { CARDS, LINES, ROYALTIES } from './constants';

export const getHandRank = (cards) => {
  if (!cards || cards.length === 0) return 'HIGH_CARD';

  const ranks = cards.map(card => card.rank);
  const suits = cards.map(card => card.suit);
  
  // Подсчет повторений рангов
  const rankCounts = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const isFlush = suits.every(suit => suit === suits[0]);
  
  // Проверка на стрит
  const rankIndices = ranks.map(rank => CARDS.RANKS.indexOf(rank)).sort((a, b) => a - b);
  const isStrait = rankIndices.every((rank, i) => 
    i === 0 || rankIndices[i - 1] + 1 === rank
  );

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  // Определение комбинации
  if (isFlush && isStrait) {
    if (ranks.includes('A') && ranks.includes('K')) return 'ROYAL_FLUSH';
    return 'STRAIGHT_FLUSH';
  }
  if (counts[0] === 4) return 'FOUR_OF_A_KIND';
  if (counts[0] === 3 && counts[1] === 2) return 'FULL_HOUSE';
  if (isFlush) return 'FLUSH';
  if (isStrait) return 'STRAIGHT';
  if (counts[0] === 3) return 'THREE_OF_A_KIND';
  if (counts[0] === 2 && counts[1] === 2) return 'TWO_PAIR';
  if (counts[0] === 2) return 'PAIR';
  return 'HIGH_CARD';
};

export const compareLines = (line1, line2) => {
  const rank1 = getHandRank(line1);
  const rank2 = getHandRank(line2);
  
  const value1 = getHandValue(rank1);
  const value2 = getHandValue(rank2);
  
  if (value1 !== value2) return value1 - value2;
  
// Если комбинации равны, сравниваем по старшей карте
  return compareHighCards(line1, line2);
};

const compareHighCards = (line1, line2) => {
  const ranks1 = line1.map(card => CARDS.RANKS.indexOf(card.rank)).sort((a, b) => b - a);
  const ranks2 = line2.map(card => CARDS.RANKS.indexOf(card.rank)).sort((a, b) => b - a);
  
  for (let i = 0; i < Math.min(ranks1.length, ranks2.length); i++) {
    if (ranks1[i] !== ranks2[i]) {
      return ranks1[i] - ranks2[i];
    }
  }
  return 0;
};

export const getHandValue = (rank) => {
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
};

export const calculateRoyalties = (hand) => {
  let total = 0;
  
  // Подсчет для верхней линии
  const topHand = hand[LINES.TOP];
  const topRank = getHandRank(topHand);
  if (topRank === 'THREE_OF_A_KIND') {
    const rank = topHand[0].rank;
    total += ROYALTIES.TOP.THREE_OF_A_KIND[rank] || 0;
  } else if (topRank === 'PAIR') {
    const pairRank = Object.entries(getRankCounts(topHand))
      .find(([_, count]) => count === 2)[0];
    total += ROYALTIES.TOP.PAIR[pairRank] || 0;
  }

  // Подсчет для средней линии
  const middleHand = hand[LINES.MIDDLE];
  const middleRank = getHandRank(middleHand);
  total += ROYALTIES.MIDDLE[middleRank] || 0;

  // Подсчет для нижней линии
  const bottomHand = hand[LINES.BOTTOM];
  const bottomRank = getHandRank(bottomHand);
  total += ROYALTIES.BOTTOM[bottomRank] || 0;

  return total;
};

const getRankCounts = (cards) => {
  const counts = {};
  cards.forEach(card => {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  });
  return counts;
};

export const compareHands = (hand1, hand2) => {
  if (isDeadHand(hand1)) return -1;
  if (isDeadHand(hand2)) return 1;
  
  let points = 0;
  
  // Сравнение каждой линии
  Object.values(LINES).forEach(line => {
    const result = compareLines(hand1[line], hand2[line]);
    points += Math.sign(result);
  });
  
  // Бонус за выигрыш всех линий
  if (Math.abs(points) === 3) {
    points = points > 0 ? points + 3 : points - 3;
  }
  
  return points;
};

export const isDeadHand = (hand) => {
  const topStrength = getHandStrength(hand[LINES.TOP]);
  const middleStrength = getHandStrength(hand[LINES.MIDDLE]);
  const bottomStrength = getHandStrength(hand[LINES.BOTTOM]);
  
  return topStrength > middleStrength || middleStrength > bottomStrength;
};

export const getHandStrength = (cards) => {
  if (!cards || cards.length === 0) return 0;
  const rank = getHandRank(cards);
  return getHandValue(rank);
};

export const canActivateFantasy = (hand) => {
  if (isDeadHand(hand)) return false;
  
  const topHand = hand[LINES.TOP];
  const rank = getHandRank(topHand);
  
  if (rank === 'PAIR') {
    const pairRank = Object.entries(getRankCounts(topHand))
      .find(([_, count]) => count === 2)[0];
    return ['Q', 'K', 'A'].includes(pairRank);
  }
  
  return rank === 'THREE_OF_A_KIND';
};

export default {
  getHandRank,
  compareLines,
  getHandValue,
  calculateRoyalties,
  compareHands,
  isDeadHand,
  getHandStrength,
  canActivateFantasy
};
