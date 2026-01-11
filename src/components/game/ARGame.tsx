import { useState, useEffect, useCallback } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { GameScene } from './GameScene';
import { HUD } from './HUD';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';

const GAME_DURATION = 60; // seconds

export function ARGame() {
  const { handData, isLoading, error } = useHandTracking();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('handblaster-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const accuracy = shots > 0 ? (hits / shots) * 100 : 100;

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Check for new high score
  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      setHighScore(score);
      setIsNewHighScore(true);
      localStorage.setItem('handblaster-highscore', score.toString());
    }
  }, [gameState, score, highScore]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setShots(0);
    setHits(0);
    setTimeLeft(GAME_DURATION);
    setIsNewHighScore(false);
  }, []);

  const handleHit = useCallback((points: number) => {
    setHits((prev) => prev + 1);
    setCombo((prev) => prev + 1);
    setScore((prev) => {
      const comboMultiplier = Math.min(combo + 1, 10);
      return prev + points * comboMultiplier;
    });
  }, [combo]);

  const handleMiss = useCallback(() => {
    setShots((prev) => prev + 1);
    setCombo(0);
  }, []);

  // Track shots when shooting
  useEffect(() => {
    if (handData.isShooting && gameState === 'playing') {
      setShots((prev) => prev + 1);
    }
  }, [handData.isShooting, gameState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Game Scene */}
      <div className="absolute inset-0">
        <GameScene
          aimPosition={handData.aimPosition}
          isShooting={handData.isShooting}
          isGunGesture={handData.isGunGesture}
          onHit={handleHit}
          onMiss={handleMiss}
          gameStarted={gameState === 'playing'}
        />
      </div>

      {/* HUD */}
      {gameState === 'playing' && (
        <HUD
          score={score}
          combo={combo}
          accuracy={accuracy}
          isGunGesture={handData.isGunGesture}
          gameStarted={gameState === 'playing'}
          timeLeft={timeLeft}
          highScore={highScore}
        />
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <StartScreen
          onStart={startGame}
          isLoading={isLoading}
          error={error}
          isGunGesture={handData.isGunGesture}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          accuracy={accuracy}
          targetsHit={hits}
          isNewHighScore={isNewHighScore}
          onRestart={startGame}
        />
      )}

      {/* Muzzle flash effect */}
      {handData.isShooting && gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-32 h-32 rounded-full animate-ping"
            style={{
              left: `${(handData.aimPosition?.x ?? 0.5) * 100}%`,
              top: `${(handData.aimPosition?.y ?? 0.5) * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
