import React from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';
import { LINES, LINE_SIZES } from '../utils/constants';

const Hand = ({ hand, onCardMove, isActive }) => {
  // Drop area for the hand
  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (item, monitor) => {
      if (!isActive) return;
      const targetIndex = monitor.getClientOffset()
        ? calculateTargetIndex(monitor, LINES.TOP, hand[LINES.TOP]?.length || 0) // Здесь определите, куда вы хотите перетаскивать
        : 0;
      onCardMove(item.id, item.sourceLine, LINES.TOP, targetIndex); // Указывайте целевую линию для карточки
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const calculateTargetIndex = (monitor, line, numCards) => {
    const clientOffset = monitor.getClientOffset();
    const handLineRect = document.querySelector(`.hand-line.${line}`).getBoundingClientRect();
    if (!handLineRect || !clientOffset) return 0; // Check for null or undefined
    const cardWidth = 70; // Width of a card
    const cardMargin = 4; // Margin between cards
    const cardTotalWidth = cardWidth + cardMargin;
    const relativeX = clientOffset.x - handLineRect.left;
    return Math.min(Math.max(0, Math.floor(relativeX / cardTotalWidth)), numCards);
  };

  const renderLine = (line, cards) => {
    const maxCards = LINE_SIZES[line];
    const emptySlots = maxCards - cards.length;

    return (
      <div className="hand-line-container">
        <div className="line-label">{line.charAt(0).toUpperCase() + line.slice(1)}</div>
        <div ref={drop} className={`hand-line ${line}`}>
          {cards.map((card, index) => (
            <Card
              key={`${card.rank}${card.suit}`}
              card={card}
              line={line}
              index={index}
              onCardMove={onCardMove}
              isPlayable={isActive}
              sourceLine={line}
            />
          ))}
          {[...Array(emptySlots)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="empty-slot"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="hand-container">
      {renderLine(LINES.TOP, hand[LINES.TOP] || [])}
      {renderLine(LINES.MIDDLE, hand[LINES.MIDDLE] || [])}
      {renderLine(LINES.BOTTOM, hand[LINES.BOTTOM] || [])}

      <style jsx>{`
        .hand-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hand-line-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .line-label {
          width: 60px;
          text-align: right;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }

        .hand-line {
          display: flex;
          gap: 4px;
          flex: 1;
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 5px;
          min-height: 110px;
        }

        .empty-slot {
          width: 70px;
          height: 100px;
          border: 1px dashed rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          margin: 2px;
        }
      `}</style>
    </div>
  );
};

export default Hand;
