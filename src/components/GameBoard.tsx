import React from 'react';
import { motion } from 'framer-motion';

export const GameBoard: React.FC<{
  board: (string | null)[][];
  onColumnClick: (col: number) => void;
  winPositions?: [number, number][] | null;
  disabled?: boolean;
}> = ({
  board,
  onColumnClick,
  winPositions,
  disabled = false,
}) => {
  const ROWS = 6;
  const COLS = 7;

  const safeBoard =
    Array.isArray(board) && Array.isArray(board[0])
      ? board
      : Array.from({ length: ROWS }, () =>
          Array(COLS).fill(null)
        );


  const isWinningPosition = (row: number, col: number): boolean => {
    return (winPositions ?? []).some(
      ([r, c]) => r === row && c === col
    );
  };

  return (
    <div className="flex justify-center p-4">
      <motion.div
        className="bg-blue-700 p-4 rounded-xl grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        }}
      >
   
        {Array.from({ length: COLS }).map((_, col) => (
          <button
            key={`drop-${col}`}
            onClick={() => !disabled && onColumnClick(col)}
            disabled={disabled}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
            aria-label={`Soltar peça na coluna ${col}`}
          >
            ▼
          </button>
        ))}

    
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const value = safeBoard[r][c];
            const isWinPos = isWinningPosition(r, c);

            return (
              <motion.div
                key={`cell-${r}-${c}`}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  value === 'red' || value === 'P1'
                    ? 'bg-red-500 shadow-lg'
                    : value === 'yellow' || value === 'P2'
                    ? 'bg-yellow-400 shadow-lg'
                    : 'bg-gray-900'
                } ${
                  isWinPos ? 'ring-4 ring-yellow-300 scale-110' : ''
                }`}
                animate={
                  isWinPos
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{
                  repeat: isWinPos ? Infinity : 0,
                  duration: 0.6,
                }}
              >
                {value === 'red' || value === 'P1' ? '🔴' : ''}
                {value === 'yellow' || value === 'P2' ? '🟡' : ''}
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};