import React from 'react';

const GameStatus = ({ gameState, scores, currentPlayer }) => {
  return (
    <div className="game-status">
      <div className="status-content">
        {gameState === 'PLAYING' && (
          <div className="current-player">
            Current Player: {currentPlayer.name}
          </div>
        )}
        {Object.entries(scores).length > 0 && (
          <div className="scores">
            <h4>Scores:</h4>
            {Object.entries(scores).map(([playerId, score]) => (
              <div key={playerId} className="score-entry">
                <span className="player-name">Player {parseInt(playerId) + 1}:</span>
                <span className="score-value">{score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .game-status {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
          color: white;
        }

        .status-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .current-player {
          font-size: 18px;
          font-weight: bold;
          color: #ffff00;
        }

        .scores {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        h4 {
          margin: 0 0 10px 0;
          color: #ffffff;
        }

        .score-entry {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .player-name {
          font-weight: bold;
        }

        .score-value {
          color: #ffff00;
        }
      `}</style>
    </div>
  );
};

export default GameStatus;
