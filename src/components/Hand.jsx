import React from 'react';
import Card from '@/components/Card';
import { LINES, LINE_SIZES } from '@/utils/constants';

const Hand = ({ hand, onCardMove, isActive }) => {
  const renderLine = (line, cards) => {
    const maxCards = LINE_SIZES[line];
    const emptySlots = maxCards - cards.length;

    return (
      <div
        className={`hand-line ${line}`}
        style={{
          display: 'flex',
          gap: '4px',
          padding: '10px',
          backgroundColor: '#004400',
          borderRadius: '5px',
          minHeight: '110px'
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={`${card.rank}${card.suit}`}
            card={card}
            line={line}
            index={index}
            onCardMove={onCardMove}
            isPlayable={isActive}
          />
        ))}
        {[...Array(emptySlots)].map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              width: '70px',
              height: '100px',
              border: '1px dashed #666',
              borderRadius: '5px',
              margin: '2px'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="hand-container">
      <div className="hand-label">Top</div>
      {renderLine(LINES.TOP, hand[LINES.TOP])}
      <div className="hand-label">Middle</div>
      {renderLine(LINES.MIDDLE, hand[LINES.MIDDLE])}
      <div className="hand-label">Bottom</div>
      {renderLine(LINES.BOTTOM, hand[LINES.BOTTOM])}
    </div>
  );
};

export default Hand;
