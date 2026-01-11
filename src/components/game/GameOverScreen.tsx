import { motion } from 'framer-motion';
import { Trophy, Target, Crosshair, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  accuracy: number;
  targetsHit: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export function GameOverScreen({
  score,
  highScore,
  accuracy,
  targetsHit,
  isNewHighScore,
  onRestart,
}: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-lg px-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {/* Game Over Title */}
        <motion.h2
          className="text-5xl md:text-7xl font-display font-black mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-destructive">GAME</span>{' '}
          <span className="text-primary text-glow-cyan">OVER</span>
        </motion.h2>

        {/* New High Score */}
        {isNewHighScore && (
          <motion.div
            className="mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-neon-yellow/20 rounded-full">
              <Trophy className="w-6 h-6 text-neon-yellow" />
              <span className="text-xl font-display font-bold text-neon-yellow">
                NEW HIGH SCORE!
              </span>
            </div>
          </motion.div>
        )}

        {/* Score */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
            Final Score
          </p>
          <p className="text-7xl font-display font-black text-primary text-glow-cyan">
            {score.toLocaleString()}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="cyber-border bg-card/50 p-4 rounded-lg">
            <Target className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-secondary">
              {targetsHit}
            </p>
            <p className="text-xs text-muted-foreground uppercase">Targets Hit</p>
          </div>
          <div className="cyber-border bg-card/50 p-4 rounded-lg">
            <Crosshair className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-accent">
              {accuracy.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground uppercase">Accuracy</p>
          </div>
          <div className="cyber-border bg-card/50 p-4 rounded-lg">
            <Trophy className="w-6 h-6 text-neon-yellow mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-neon-yellow">
              {highScore.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground uppercase">Best Score</p>
          </div>
        </motion.div>

        {/* Restart Button */}
        <motion.button
          onClick={onRestart}
          className="
            group relative px-10 py-4 font-display font-bold text-lg uppercase tracking-widest
            bg-primary text-primary-foreground rounded-lg
            box-glow-cyan hover:scale-105 transition-transform
            flex items-center justify-center gap-3 mx-auto
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          PLAY AGAIN
        </motion.button>
      </motion.div>
    </div>
  );
}
