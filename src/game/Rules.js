import { LINES, LINE_SIZES } from '@/utils/constants';
import { getHandRank } from '@/utils/scoring';

export const isValidMove = (hand, card, line) => {
  // Проверка на переполнение линии
  if (hand[line].length >= LINE_SIZES[line]) {
    return false;
  }

  // Создаем временную копию руки с новой картой
  const tempHand = {
    ...hand,
    [line]: [...hand[line], card]
  };

  return isValidHand(tempHand);
};

export const isValidHand = (hand) => {
  // Проверка размеров линий
  for (const line of Object.values(LINES)) {
    if (hand[line].length > LINE_SIZES[line]) {
      return false;
    }
  }

  // Если линии неполные, считаем руку валидной
  if (!isHandComplete(hand)) {
    return true;
  }

  // Проверка правила "верхняя линия не может быть сильнее средней, средняя не может быть сильнее нижней"
  const topStrength = getLineStrength(hand[LINES.TOP]);
  const middleStrength = getLineStrength(hand[LINES.MIDDLE]);
  const bottomStrength = getLineStrength(hand[LINES.BOTTOM]);

  return topStrength <= middleStrength && middleStrength <= bottomStrength;
};

export const isHandComplete = (hand) => {
  return Object.entries(hand).every(([line, cards]) => 
    cards.length === LINE_SIZES[line]
  );
};

export const getLineStrength = (cards) => {
  if (cards.length === 0) return 0;
  const rank = getHandRank(cards);
  return getHandValue(rank);
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

export const canActivateFantasy = (hand) => {
  if (!isHandComplete(hand) || !isValidHand(hand)) {
    return false;
  }

  const topLine = hand[LINES.TOP];
  const rank = getHandRank(topLine);
  
  // Проверка на пару дам или выше в верхней линии
  if (rank === 'PAIR') {
    const pairRank = topLine.find(card => 
      topLine.filter(c => c.rank === card.rank).length === 2
    ).rank;
    return ['Q', 'K', 'A'].includes(pairRank);
  }
  
  // Или любой сет в верхней линии
  return rank === 'THREE_OF_A_KIND';
};

export const getFantasyCardCount = (hand) => {
  if (!canActivateFantasy(hand)) return 0;

  const topLine = hand[LINES.TOP];
  const rank = getHandRank(topLine);

  if (rank === 'THREE_OF_A_KIND') return 17;

  const pairRank = topLine.find(card => 
    topLine.filter(c => c.rank === card.rank).length === 2
  ).rank;

  switch (pairRank) {
    case 'Q': return 14;
    case 'K': return 15;
    case 'A': return 16;
    default: return 0;
  }
};

export const isValidFantasyHand = (hand, cards) => {
  // Проверка количества карт для фантазии
  const requiredCards = getFantasyCardCount(hand);
  if (cards.length !== requiredCards - 1) return false; // -1 потому что одна карта идёт в сброс

  // Создаем временную копию руки с новыми картами
  const tempHand = JSON.parse(JSON.stringify(hand));
  cards.forEach(card => {
    // Находим подходящую линию для карты
    for (const line of Object.values(LINES)) {
      if (tempHand[line].length < LINE_SIZES[line]) {
        tempHand[line].push(card);
        break;
      }
    }
  });

  return isValidHand(tempHand);
};

export default {
  isValidMove,
  isValidHand,
  isHandComplete,
  getLineStrength,
  getHandValue,
  canActivateFantasy,
  getFantasyCardCount,
  isValidFantasyHand
};
