import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HOOK_ORIGIN_X, HOOK_ORIGIN_Y, ITEM_DEFINITIONS } from '../constants';
import { Item, ItemType, GameState, GameConfig } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  items: Item[];
  config: GameConfig;
  onUpdateItems: (items: Item[]) => void;
  onItemCaught: (item: Item) => void;
  onTimeUpdate: (timeLeft: number) => void;
  onGameOver: () => void;
  onLevelComplete: () => void;
  timeLimit: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  items,
  config,
  onUpdateItems,
  onItemCaught,
  onTimeUpdate,
  onGameOver,
  onLevelComplete,
  timeLimit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mutable game state logic to avoid React render loop lag
  const hookRef = useRef({
    angle: 0,
    angleSpeed: 0.8,
    angleDirection: 1, // 1 or -1
    length: 50,
    state: 'IDLE' as 'IDLE' | 'SHOOTING' | 'RETRACTING',
    targetItem: null as Item | null,
    x: HOOK_ORIGIN_X,
    y: HOOK_ORIGIN_Y
  });

  const timeRef = useRef(timeLimit);
  const animationFrameRef = useRef<number>();

  // Reset time when level starts
  useEffect(() => {
    timeRef.current = timeLimit;
  }, [timeLimit]);

  // Main Game Loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Screen
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Sky/Dirt separation
    ctx.fillStyle = '#1A202C'; // Dark sky
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
    ctx.fillStyle = '#2D3748'; // Dirt
    ctx.fillRect(0, 100, CANVAS_WIDTH, CANVAS_HEIGHT - 100);

    // --- Update Hook Physics ---
    const hook = hookRef.current;

    if (gameState === GameState.PLAYING) {
        if (hook.state === 'IDLE') {
        hook.angle += hook.angleSpeed * hook.angleDirection;
        if (hook.angle > 70) hook.angleDirection = -1;
        if (hook.angle < -70) hook.angleDirection = 1;
        hook.length = 50; // Base length
        } else if (hook.state === 'SHOOTING') {
        hook.length += config.hookSpeed;
        
        // Wall boundaries
        const rad = (hook.angle * Math.PI) / 180;
        const tipX = HOOK_ORIGIN_X + hook.length * Math.sin(rad);
        const tipY = HOOK_ORIGIN_Y + hook.length * Math.cos(rad);

        if (tipX < 0 || tipX > CANVAS_WIDTH || tipY > CANVAS_HEIGHT) {
            hook.state = 'RETRACTING';
        }
        } else if (hook.state === 'RETRACTING') {
        let retractSpeed = config.hookSpeed * 1.5; // Base retraction is fast if empty
        
        if (hook.targetItem) {
            // Formula: Speed / Weight * Strength
            const weight = Math.max(1, hook.targetItem.weight); // Prevent div by 0
            retractSpeed = (config.hookSpeed * 2) / weight * config.strengthMultiplier;
        }
        
        hook.length -= retractSpeed;
        if (hook.length <= 50) {
            hook.length = 50;
            hook.state = 'IDLE';
            if (hook.targetItem) {
                onItemCaught(hook.targetItem);
                hook.targetItem = null;
            }
        }
        }

        // Update Time
        if (timeRef.current > 0) {
            timeRef.current -= 1/60;
            if (timeRef.current < 0) timeRef.current = 0;
            onTimeUpdate(timeRef.current);
        } else if (timeRef.current <= 0 && hook.state === 'IDLE') {
            onLevelComplete(); // Or game over depending on score, handled by parent
        }
    }

    // --- Draw Hook ---
    const rad = (hook.angle * Math.PI) / 180;
    const endX = HOOK_ORIGIN_X + hook.length * Math.sin(rad);
    const endY = HOOK_ORIGIN_Y + hook.length * Math.cos(rad);

    ctx.beginPath();
    ctx.moveTo(HOOK_ORIGIN_X, HOOK_ORIGIN_Y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#CBD5E0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Hook Head
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(-rad);
    ctx.fillStyle = '#A0AEC0';
    // Simple hook shape
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    // Prongs
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(0, 5);
    ctx.lineTo(5, -5);
    ctx.strokeStyle = hook.targetItem ? '#F6E05E' : '#A0AEC0'; // Glows yellow if holding item
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();


    // --- Draw Items ---
    items.forEach(item => {
        if (item.caught && hook.targetItem?.id !== item.id) return; // Don't draw caught items unless on hook

        let drawX = item.x;
        let drawY = item.y;

        // If item is being carried, it follows hook tip
        if (hook.targetItem?.id === item.id) {
            drawX = endX;
            drawY = endY + item.radius; // Hang slightly below hook
        }

        const def = ITEM_DEFINITIONS[item.type];
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, item.radius, 0, Math.PI * 2);
        
        if (item.type === ItemType.RAINBOW) {
            // Gradient for rainbow
            const gradient = ctx.createLinearGradient(drawX - item.radius, drawY - item.radius, drawX + item.radius, drawY + item.radius);
            gradient.addColorStop(0, "red");
            gradient.addColorStop(0.2, "orange");
            gradient.addColorStop(0.4, "yellow");
            gradient.addColorStop(0.6, "green");
            gradient.addColorStop(0.8, "blue");
            gradient.addColorStop(1, "violet");
            ctx.fillStyle = gradient;
        } else if (item.type === ItemType.MYSTERY) {
             ctx.fillStyle = def.color;
             // Add a Question mark
        } else {
            ctx.fillStyle = def.color;
        }
        
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Details
        if (item.type === ItemType.MYSTERY) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Fredoka';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', drawX, drawY);
        }
        if (item.type === ItemType.BOMB) {
             ctx.fillStyle = 'black';
             ctx.font = 'bold 12px Fredoka';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText('TNT', drawX, drawY);
        }
    });

    // --- Collision Detection ---
    if (gameState === GameState.PLAYING && hook.state === 'SHOOTING' && !hook.targetItem) {
        // Simple circle collision
        for (const item of items) {
            if (item.caught) continue;

            const dx = endX - item.x;
            const dy = endY - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < item.radius + 5) { // +5 for hook size
                // HIT!
                hook.state = 'RETRACTING';
                hook.targetItem = item;
                
                // Mark item as caught in parent state immediately so it doesn't get hit again? 
                // Actually we just handle it visually here until it reaches top.
                // But for the logic, we should probably set a local flag or similar. 
                // For this simple loop, we just attach it to hook.targetItem.
                break;
            }
        }
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

  }, [gameState, items, config, onItemCaught, onTimeUpdate, onLevelComplete]);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowDown') {
            if (gameState === GameState.PLAYING && hookRef.current.state === 'IDLE') {
                hookRef.current.state = 'SHOOTING';
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch support
  const handleTouch = () => {
      if (gameState === GameState.PLAYING && hookRef.current.state === 'IDLE') {
        hookRef.current.state = 'SHOOTING';
      }
  }

  // Start Loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [gameLoop]);

  return (
    <div className="relative mx-auto border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-[#2D3748] w-[800px] h-[600px]">
        <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="block"
            onClick={handleTouch}
        />
        
        {/* Miner Sprite (Static for now, just visual representation) */}
        <div className="absolute top-[30px] left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="text-4xl">👷</div>
        </div>
    </div>
  );
};

export default GameCanvas;