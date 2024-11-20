import { CARDS, ROYALTIES, LINES } from '@/utils/constants';

const getHandRank = (cards) => {
  const ranks = cards.map(card => card.rank);
  const suits = cards.map(card => card.suit);
  
  // Проверка на флеш
  const isFlush = suits.every(suit => suit === suits[0]);
  
  // Сортировка рангов для проверки стрита
  const rankIndices = ranks.map(rank => CARDS.RANKS.indexOf(rank)).sort((a, b) => a - b);
  const isStrait = rankIndices.every((rank, i) => 
    i === 0 || rankIndices[i - 1] + 1 === rank
  );

  // Подсчет повторений рангов
  const rankCounts = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
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

const calculateRoyalties = (hand) => {
  let total = 0;
  
  // Подсчет для верхней линии
  const topHand = hand[LINES.TOP];
  const topRank = getHandRank(topHand);
  if (topRank === 'THREE_OF_A_KIND') {
    const rank = topHand[0].rank;
    total += ROYALTIES.TOP.THREE_OF_A_KIND[rank];
  } else if (topRank === 'PAIR') {
    const pairRank = Object.entries(rankCounts).find(([_, count]) => count === 2)[0];
    if (ROYALTIES.TOP.PAIR[pairRank]) {
      total += ROYALTIES.TOP.PAIR[pairRank];
    }
  }

  // Подсчет для средней линии
  const middleHand = hand[LINES.MIDDLE];
  const middleRank = getHandRank(middleHand);
  if (ROYALTIES.MIDDLE[middleRank]) {
    total += ROYALTIES.MIDDLE[middleRank];
  }

  // Подсчет для нижней линии
  const bottomHand = hand[LINES.BOTTOM];
  const bottomRank = getHandRank(bottomHand);
  if (ROYALTIES.BOTTOM[bottomRank]) {
    total += ROYALTIES.BOTTOM[bottomRank];
  }

  return total;
};

const compareHands = (hand1, hand2) => {
  if (isDeadHand(hand1)) return -1;
  if (isDeadHand(hand2)) return 1;
  
  let points = 0;
  
  // Сравнение каждой линии
  Object.values(LINES).forEach(line => {
    const result = compareLines(hand1[line], hand2[line]);
    points += result;
  });
  
  // Бонус за выигрыш всех линий
  if (Math.abs(points) === 3) {
    points = points > 0 ? points + 3 : points - 3;
  }
  
  return points;
};

const isDeadHand = (hand) => {
  const topRank = getHandStrength(hand[LINES.TOP]);
  const middleRank = getHandStrength(hand[LINES.MIDDLE]);
  const bottomRank = getHandStrength(hand[LINES.BOTTOM]);
  
  return topRank > middleRank || middleRank > bottomRank;
};

export {
  getHandRank,
  calculateRoyalties,
  compareHands,
  isDeadHand
};
