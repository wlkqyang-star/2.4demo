import React from 'react';
import { GameState } from '../types';

interface UIOverlayProps {
  score: number;
  targetScore: number;
  timeLeft: number;
  level: number;
  gameState: GameState;
  geminiEventMessage: string | null;
  onNextLevel: () => void;
  onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  score, 
  targetScore, 
  timeLeft, 
  level, 
  gameState, 
  geminiEventMessage,
  onNextLevel,
  onRestart
}) => {
  return (
    <div className="absolute top-0 w-full h-full pointer-events-none flex flex-col justify-between p-4 max-w-[800px] left-1/2 -translate-x-1/2">
      {/* Top Bar */}
      <div className="flex justify-between items-start text-white font-bold text-shadow-md">
        <div className="bg-slate-800/80 p-3 rounded-lg border-2 border-slate-600">
          <div className="text-yellow-400 text-lg">SCORE</div>
          <div className="text-2xl">{Math.floor(score)}</div>
        </div>
        
        <div className="bg-slate-800/80 p-3 rounded-lg border-2 border-slate-600">
           <div className="text-green-400 text-lg">TARGET</div>
           <div className="text-2xl">{targetScore}</div>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border-2 border-slate-600 min-w-[100px] text-right">
           <div className="text-blue-400 text-lg">TIME</div>
           <div className={`text-2xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>
             {Math.ceil(timeLeft)}
           </div>
        </div>
      </div>

      {/* Center Messages */}
      <div className="flex-1 flex items-center justify-center pointer-events-auto">
        
        {gameState === GameState.LEVEL_COMPLETE && (
           <div className="bg-green-600 text-white p-8 rounded-2xl shadow-2xl text-center border-4 border-green-400 animate-bounce-in">
             <h2 className="text-4xl font-bold mb-4">Level Complete!</h2>
             <p className="text-xl mb-6">Score: {Math.floor(score)} / {targetScore}</p>
             <button 
               onClick={onNextLevel}
               className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transform hover:scale-105 transition-all text-xl shadow-lg"
             >
               Next Level
             </button>
           </div>
        )}

        {gameState === GameState.GAME_OVER && (
           <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl text-center border-4 border-red-400">
             <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
             <p className="text-xl mb-6">You didn't reach the target score.</p>
             <p className="text-2xl font-bold mb-6">Final Score: {Math.floor(score)}</p>
             <button 
               onClick={onRestart}
               className="bg-white text-red-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all text-xl shadow-lg"
             >
               Try Again
             </button>
           </div>
        )}

        {gameState === GameState.EVENT_PROCESSING && (
           <div className="bg-purple-900/90 text-white p-8 rounded-2xl shadow-2xl text-center border-4 border-purple-500 backdrop-blur-sm max-w-md">
             <h2 className="text-2xl font-bold mb-4 text-purple-200">✨ Mystery Stone ✨</h2>
             {geminiEventMessage ? (
                <div className="animate-fade-in">
                   <p className="text-xl italic mb-4">"{geminiEventMessage}"</p>
                   <div className="text-sm text-purple-300">Resuming...</div>
                </div>
             ) : (
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Consulting the spirits...</p>
                </div>
             )}
           </div>
        )}
      </div>

      {/* Level Indicator */}
      <div className="text-center">
          <span className="bg-slate-900/50 text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest">LEVEL {level}</span>
      </div>
    </div>
  );
};

export default UIOverlay;