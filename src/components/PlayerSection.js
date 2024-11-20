import React from 'react';
import Hand from '@/components/Hand';
import { calculateRoyalties } from '@/utils/scoring';

const PlayerSection = ({ player, onCardMove, isActive, score }) => {
  const royalties = calculateRoyalties(player.hand);

  return (
    <div className="player-section">
      <div className="player-info">
        <h3>{player.name} {player.isAI ? '(AI)' : ''}</h3>
        <div className="stats">
          <span>Score: {score || 0}</span>
          <span>Royalties: {royalties}</span>
        </div>
      </div>

      <Hand
        hand={player.hand}
        onCardMove={onCardMove}
        isActive={isActive && !player.isAI}
      />

      <style jsx>{`
        .player-section {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
        }

        .player-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .stats {
          display: flex;
          gap: 20px;
        }

        h3 {
          margin: 0;
          color: white;
        }

        span {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default PlayerSection;
