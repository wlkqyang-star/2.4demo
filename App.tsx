import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import SkillSelector from './components/SkillSelector';
import UIOverlay from './components/UIOverlay';
import { GameState, Item, ItemType, GameConfig, Skill } from './types';
import { BASE_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT, ITEM_DEFINITIONS } from './constants';
import { generateMysteryEvent } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [config, setConfig] = useState<GameConfig>(BASE_CONFIG);
  const [items, setItems] = useState<Item[]>([]);
  
  const [geminiMessage, setGeminiMessage] = useState<string | null>(null);

  // --- Helpers ---

  const spawnItems = useCallback((currentLevel: number, currentLuck: number) => {
    const newItems: Item[] = [];
    // Base item count grows slightly with level
    const count = 10 + Math.min(currentLevel * 2, 20); 

    for (let i = 0; i < count; i++) {
      let type = ItemType.ROCK;
      const rand = Math.random() * 100;
      
      // Spawn Logic affected by Luck
      const diamondChance = 3 + currentLuck * 2;
      const goldLChance = 10 + currentLuck;
      const mysteryChance = 5 + currentLuck;
      const bombChance = 5;
      const rainbowChance = 1 + currentLuck;

      if (rand < diamondChance) type = ItemType.DIAMOND;
      else if (rand < diamondChance + goldLChance) type = ItemType.GOLD_LARGE;
      else if (rand < diamondChance + goldLChance + 15) type = ItemType.GOLD_MEDIUM;
      else if (rand < diamondChance + goldLChance + 15 + 20) type = ItemType.GOLD_SMALL;
      else if (rand < diamondChance + goldLChance + 35 + mysteryChance) type = ItemType.MYSTERY;
      else if (rand < 90 && rand > 90 - bombChance) type = ItemType.BOMB;
      else if (rand > 98 - rainbowChance) type = ItemType.RAINBOW;

      // Position (avoid top area where hook is)
      const x = Math.random() * (CANVAS_WIDTH - 60) + 30;
      const y = Math.random() * (CANVAS_HEIGHT - 200) + 150;

      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        x,
        y,
        radius: ITEM_DEFINITIONS[type].radius,
        value: ITEM_DEFINITIONS[type].baseValue,
        weight: ITEM_DEFINITIONS[type].weight,
        caught: false
      });
    }
    setItems(newItems);
  }, []);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTargetScore(100);
    setConfig(BASE_CONFIG);
    setGameState(GameState.SKILL_SELECT); // Start with skill selection
  };

  const startLevel = useCallback(() => {
    setTimeLeft(config.timeLimit);
    spawnItems(level, config.luck);
    setGameState(GameState.PLAYING);
  }, [config, level, spawnItems]);

  const handleSkillSelect = (skill: Skill) => {
    setConfig(prev => skill.apply(prev));
    startLevel();
  };

  const handleNextLevel = () => {
    setLevel(l => l + 1);
    setTargetScore(s => Math.floor(s * 1.5));
    setGameState(GameState.SKILL_SELECT);
  };

  const handleRestart = () => {
    startGame();
  };

  const handleGameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
  }, []);

  const handleLevelCompleteCheck = useCallback(() => {
    if (score >= targetScore) {
      setGameState(GameState.LEVEL_COMPLETE);
    } else {
      handleGameOver();
    }
  }, [score, targetScore, handleGameOver]);

  // --- Game Event Logic ---

  const handleItemCaught = async (item: Item) => {
    // 1. Remove item from board visually
    setItems(prev => prev.filter(i => i.id !== item.id));

    // 2. Apply Points
    let addedScore = item.value * config.goldMultiplier;
    
    // Special Effects
    if (item.type === ItemType.BOMB) {
      // Explode nearby items
      setItems(prev => {
        return prev.filter(other => {
          const dx = other.x - item.x;
          const dy = other.y - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Destroy items within 150px
          if (dist < 150) return false; 
          return true;
        });
      });
      // Visual feedback could be added here (shake screen, etc.)
    } else if (item.type === ItemType.RAINBOW) {
       // Summon Gem Rain (add 5 diamonds randomly falling)
       const gems: Item[] = [];
       for(let i=0; i<5; i++) {
         gems.push({
           id: `gem-rain-${Math.random()}`,
           type: ItemType.DIAMOND,
           x: Math.random() * CANVAS_WIDTH,
           y: Math.random() * (CANVAS_HEIGHT - 100) + 100,
           radius: ITEM_DEFINITIONS[ItemType.DIAMOND].radius,
           value: ITEM_DEFINITIONS[ItemType.DIAMOND].baseValue,
           weight: ITEM_DEFINITIONS[ItemType.DIAMOND].weight,
           caught: false
         });
       }
       setItems(prev => [...prev, ...gems]);
    } else if (item.type === ItemType.MYSTERY) {
       // Trigger Gemini
       setGameState(GameState.EVENT_PROCESSING);
       setGeminiMessage(null);
       
       const event = await generateMysteryEvent();
       setGeminiMessage(event.message);

       // Apply Effect
       if (event.effectType === 'GOLD') {
         setScore(s => s + event.value);
       } else if (event.effectType === 'TIME') {
         setTimeLeft(t => t + event.value);
       } else if (event.effectType === 'STRENGTH_BUFF') {
         // Temp buff for this level? Or permanent? Let's say permanent small buff
         setConfig(c => ({...c, strengthMultiplier: c.strengthMultiplier + 0.5}));
       }

       // Wait a moment for user to read
       setTimeout(() => {
          setGameState(GameState.PLAYING);
          setGeminiMessage(null);
       }, 2500);
    }

    setScore(s => s + addedScore);
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Intro Screen */}
      {gameState === GameState.MENU && (
        <div className="text-center text-white space-y-6">
          <h1 className="text-6xl font-bold text-yellow-400 drop-shadow-lg">Gemini Gold Miner</h1>
          <p className="text-xl text-slate-300 max-w-md mx-auto">
            Use your hook to mine gold and diamonds. Use skills to survive. 
            Beware the mystery stones—the spirits (AI) are watching.
          </p>
          <button 
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-[0_0_20px_rgba(72,187,120,0.5)] transition-transform hover:scale-105"
          >
            Start Mining
          </button>
        </div>
      )}

      {/* Main Game Container */}
      {(gameState !== GameState.MENU) && (
        <div className="relative">
           <GameCanvas 
             gameState={gameState}
             items={items}
             config={config}
             onUpdateItems={setItems}
             onItemCaught={handleItemCaught}
             onTimeUpdate={setTimeLeft}
             onGameOver={handleGameOver}
             onLevelComplete={handleLevelCompleteCheck}
             timeLimit={timeLeft}
           />
           
           <UIOverlay 
             score={score}
             targetScore={targetScore}
             timeLeft={timeLeft}
             level={level}
             gameState={gameState}
             geminiEventMessage={geminiMessage}
             onNextLevel={handleNextLevel}
             onRestart={handleRestart}
           />

           {gameState === GameState.SKILL_SELECT && (
             <SkillSelector level={level} onSelect={handleSkillSelect} />
           )}
        </div>
      )}
      
      <div className="mt-4 text-slate-500 text-sm">
        Controls: Press [SPACE] or [DOWN ARROW] or Tap Screen to shoot hook.
      </div>
    </div>
  );
};

export default App;