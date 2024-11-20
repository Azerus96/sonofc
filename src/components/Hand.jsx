import React from 'react';
import Card from './Card';
import { LINES, LINE_SIZES } from '../utils/constants';

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
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '5px',
          minHeight: '110px',
          position: 'relative'
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
            className="empty-slot"
            style={{
              width: '70px',
              height: '100px',
              border: '1px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              margin: '2px'
            }}
          />
        ))}
        <div className="line-label">
          {line.charAt(0).toUpperCase() + line.slice(1)}
        </div>
      </div>
    );
  };

  return (
    <div className="hand-container">
      {renderLine(LINES.TOP, hand[LINES.TOP])}
      {renderLine(LINES.MIDDLE, hand[LINES.MIDDLE])}
      {renderLine(LINES.BOTTOM, hand[LINES.BOTTOM])}

      <style jsx>{`
        .hand-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .hand-line {
          position: relative;
          transition: background-color 0.3s;
        }

        .hand-line:hover {
          background-color: rgba(0, 0, 0, 0.4);
        }

        .line-label {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: bold;
        }

        .empty-slot {
          transition: all 0.3s;
        }

        .empty-slot:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Hand;
