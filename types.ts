export enum GameState {
  MENU = 'MENU',
  SKILL_SELECT = 'SKILL_SELECT',
  PLAYING = 'PLAYING',
  EVENT_PROCESSING = 'EVENT_PROCESSING', // For Gemini calls
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER'
}

export enum ItemType {
  GOLD_SMALL = 'GOLD_SMALL',
  GOLD_MEDIUM = 'GOLD_MEDIUM',
  GOLD_LARGE = 'GOLD_LARGE',
  ROCK = 'ROCK',
  DIAMOND = 'DIAMOND',
  BOMB = 'BOMB',
  RAINBOW = 'RAINBOW',
  MYSTERY = 'MYSTERY'
}

export interface Item {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  radius: number;
  value: number;
  weight: number; // Affects pull speed. Higher is slower.
  caught: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: (config: GameConfig) => GameConfig;
}

export interface GameConfig {
  hookSpeed: number;
  strengthMultiplier: number; // 1 = normal, >1 = pulls heavy items faster
  goldMultiplier: number;
  timeLimit: number;
  luck: number; // Increases chance of good items
}

export interface GeminiEventResult {
  message: string;
  effectType: 'GOLD' | 'TIME' | 'STRENGTH_BUFF' | 'NOTHING';
  value: number;
}
