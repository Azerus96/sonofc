import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { generateCardId } from '@/utils/cards';

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
      if (item.id !== cardId) {
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
      className={`card ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isPlayable ? 'move' : 'default',
        position: 'relative',
        width: '70px',
        height: '100px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '5px',
        display: 'inline-flex',
        flexDirection: 'column',
        padding: '5px',
        margin: '2px',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          color: getSuitColor(card.suit),
          fontSize: '16px',
          position: 'absolute',
          top: '5px',
          left: '5px'
        }}
      >
        {card.rank}
      </div>
      <div
        style={{
          color: getSuitColor(card.suit),
          fontSize: '24px',
          position: 'absolute',
          top: '25px',
          left: '5px'
        }}
      >
        {getSuitSymbol(card.suit)}
      </div>
      <div
        style={{
          color: getSuitColor(card.suit),
          fontSize: '16px',
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          transform: 'rotate(180deg)'
        }}
      >
        {card.rank}
      </div>
    </div>
  );
};

export default Card;
