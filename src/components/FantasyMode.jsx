import React from 'react';
import Card from './Card';

const FantasyMode = ({ cards, onCardSelect, isActive }) => {
  return (
    <div className="fantasy-mode">
      <div className="fantasy-header">
        <h3>Fantasy Mode</h3>
        <p>Select cards to place (13 cards total)</p>
      </div>

      <div className="fantasy-cards">
        {cards.map((card, index) => (
          <Card
            key={`fantasy-${card.rank}${card.suit}`}
            card={card}
            isPlayable={isActive}
            onCardMove={(cardId) => onCardSelect(cardId, index)}
          />
        ))}
      </div>

      <style jsx>{`
        .fantasy-mode {
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }

        .fantasy-header {
          text-align: center;
          margin-bottom: 15px;
          color: white;
        }

        h3 {
          margin: 0 0 10px 0;
          color: #ffff00;
        }

        p {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .fantasy-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
};

export default FantasyMode;
