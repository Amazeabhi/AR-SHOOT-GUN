import { useState, useEffect, useCallback } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { GameScene } from './GameScene';
import { HUD } from './HUD';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';
import { CameraToggle } from './CameraToggle';

const GAME_DURATION = 60; // seconds

interface ScoreEntry {
  score: number;
  date: string;
  accuracy: number;
}

export function ARGame() {
  const [cameraEnabled, setCameraEnabled] = useState(() => {
    const saved = localStorage.getItem('ar-camera-enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const { handData, isLoading, error } = useHandTracking(cameraEnabled);
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
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>(() => {
    const saved = localStorage.getItem('handblaster-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [lastHitTime, setLastHitTime] = useState(0);

  const accuracy = shots > 0 ? (hits / shots) * 100 : 100;

  const toggleCamera = useCallback(() => {
    setCameraEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('ar-camera-enabled', String(newValue));
      return newValue;
    });
  }, []);

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

  // Save score when game ends
  useEffect(() => {
    if (gameState === 'gameover' && score > 0) {
      // Check for new high score
      if (score > highScore) {
        setHighScore(score);
        setIsNewHighScore(true);
        localStorage.setItem('handblaster-highscore', score.toString());
      }

      // Add to history
      const newEntry: ScoreEntry = {
        score,
        accuracy: shots > 0 ? (hits / shots) * 100 : 0,
        date: new Date().toLocaleDateString(),
      };
      
      const newHistory = [newEntry, ...scoreHistory]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10
      
      setScoreHistory(newHistory);
      localStorage.setItem('handblaster-history', JSON.stringify(newHistory));
    }
  }, [gameState]);

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
    const now = Date.now();
    setHits((prev) => prev + 1);
    setShots((prev) => prev + 1);
    setCombo((prev) => prev + 1);
    setLastHitTime(now);
    setScore((prev) => {
      const comboMultiplier = Math.min(combo + 1, 10);
      return prev + points * comboMultiplier;
    });
  }, [combo]);

  const handleMiss = useCallback(() => {
    setShots((prev) => prev + 1);
    setCombo(0);
  }, []);

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

      {/* Hit feedback */}
      {Date.now() - lastHitTime < 200 && gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none border-4 border-neon-green animate-pulse opacity-50" />
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <StartScreen
          onStart={startGame}
          isLoading={isLoading}
          error={error}
          isGunGesture={handData.isGunGesture}
          scoreHistory={scoreHistory}
          cameraEnabled={cameraEnabled}
          onCameraToggle={toggleCamera}
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
      {handData.isShooting && gameState === 'playing' && handData.aimPosition && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: `${handData.aimPosition.x * 100}%`,
            top: `${handData.aimPosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-24 h-24 rounded-full bg-primary/50 animate-ping" />
        </div>
      )}

      {/* Instructions overlay when playing */}
      {gameState === 'playing' && !handData.isGunGesture && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 cyber-border bg-background/90 px-6 py-3 rounded-lg animate-pulse">
          <p className="text-sm text-center text-muted-foreground">
            👆 Point your index finger to aim • Pull thumb to shoot • Or just click targets!
          </p>
        </div>
      )}
    </div>
  );
}
