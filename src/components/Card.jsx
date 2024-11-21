import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { generateCardId } from '../utils/cards';

const Card = ({ card, line, index, onCardMove, isPlayable = true }) => {
  const cardId = generateCardId(card);

  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { 
      id: cardId, 
      sourceLine: line, 
      sourceIndex: index 
    },
    canDrag: () => isPlayable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => {
      console.log("Dropped card:", item, "into line:", line);
      if (item.id !== cardId) {
        console.log(`Moving card from line ${item.sourceLine} to ${line}`);
        onCardMove(item.id, item.sourceLine, line, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getSuitColor = (suit) => {
    return suit === 'h' || suit === 'd' ? '#ff0000' : '#000000';
  };

  const getSuitSymbol = (suit) => {
    const symbols = {
      'h': '♥',
      'd': '♦',
      'c': '♣',
      's': '♠'
    };
    return symbols[suit];
  };

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`card ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''} ${!isPlayable ? 'disabled' : ''}`}
    >
      <div className="card-content">
        <div className="card-corner top-left">
          <div className="card-rank">{card.rank}</div>
          <div className="card-suit">{getSuitSymbol(card.suit)}</div>
        </div>
        <div className="card-corner bottom-right">
          <div className="card-rank">{card.rank}</div>
          <div className="card-suit">{getSuitSymbol(card.suit)}</div>
        </div>
      </div>

      <style jsx>{`
        .card {
          width: 70px;
          height: 100px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 5px;
          position: relative;
          user-select: none;
          cursor: ${isPlayable ? 'move' : 'default'};
          transition: all 0.2s ease;
        }

        .card.dragging {
          opacity: 0.5;
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .card.drop-target {
          background-color: rgba(0,255,0,0.1);
        }

        .card.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .card-content {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .card-corner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 5px;
          color: ${getSuitColor(card.suit)};
        }

        .top-left {
          top: 0;
          left: 0;
        }

        .bottom-right {
          bottom: 0;
          right: 0;
          transform: rotate(180deg);
        }

        .card-rank {
          font-size: 16px;
          font-weight: bold;
        }

        .card-suit {
          font-size: 20px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default Card;
