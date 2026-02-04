import { ItemType, Skill } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const HOOK_ORIGIN_X = CANVAS_WIDTH / 2;
export const HOOK_ORIGIN_Y = 50;

export const BASE_CONFIG = {
  hookSpeed: 8,
  strengthMultiplier: 1,
  goldMultiplier: 1,
  timeLimit: 60,
  luck: 1
};

export const SKILLS: Skill[] = [
  {
    id: 'titan_glove',
    name: 'Titan Glove',
    description: 'Pull items 50% faster.',
    icon: '🥊',
    apply: (cfg) => ({ ...cfg, strengthMultiplier: cfg.strengthMultiplier + 0.5 })
  },
  {
    id: 'midas_touch',
    name: 'Midas Touch',
    description: 'All gold is worth 25% more.',
    icon: '✨',
    apply: (cfg) => ({ ...cfg, goldMultiplier: cfg.goldMultiplier + 0.25 })
  },
  {
    id: 'chronos_dial',
    name: 'Chronos Dial',
    description: '+15 Seconds to every level.',
    icon: '⏳',
    apply: (cfg) => ({ ...cfg, timeLimit: cfg.timeLimit + 15 })
  },
  {
    id: 'lucky_clover',
    name: 'Lucky Clover',
    description: 'Better chance for diamonds and special stones.',
    icon: '🍀',
    apply: (cfg) => ({ ...cfg, luck: cfg.luck + 0.5 })
  },
  {
    id: 'laser_sight',
    name: 'Laser Sight',
    description: 'Hook moves 20% faster when shooting.',
    icon: '🎯',
    apply: (cfg) => ({ ...cfg, hookSpeed: cfg.hookSpeed * 1.2 })
  }
];

export const ITEM_DEFINITIONS: Record<ItemType, { radius: number; baseValue: number; weight: number; color: string }> = {
  [ItemType.GOLD_SMALL]: { radius: 15, baseValue: 50, weight: 2, color: '#FFD700' },
  [ItemType.GOLD_MEDIUM]: { radius: 25, baseValue: 100, weight: 5, color: '#FFD700' },
  [ItemType.GOLD_LARGE]: { radius: 40, baseValue: 500, weight: 15, color: '#FFD700' },
  [ItemType.ROCK]: { radius: 30, baseValue: 11, weight: 20, color: '#718096' },
  [ItemType.DIAMOND]: { radius: 12, baseValue: 600, weight: 1, color: '#63B3ED' },
  [ItemType.BOMB]: { radius: 20, baseValue: 1, weight: 1, color: '#E53E3E' },
  [ItemType.RAINBOW]: { radius: 22, baseValue: 50, weight: 3, color: 'url(#rainbow)' }, // Special handling in render
  [ItemType.MYSTERY]: { radius: 25, baseValue: 0, weight: 5, color: '#9F7AEA' },
};
