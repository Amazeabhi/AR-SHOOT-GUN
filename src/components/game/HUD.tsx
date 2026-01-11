import { motion, AnimatePresence } from 'framer-motion';

interface HUDProps {
  score: number;
  combo: number;
  accuracy: number;
  isGunGesture: boolean;
  gameStarted: boolean;
  timeLeft: number;
  highScore: number;
}

export function HUD({
  score,
  combo,
  accuracy,
  isGunGesture,
  gameStarted,
  timeLeft,
  highScore,
}: HUDProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-30" />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
        {/* Score */}
        <motion.div
          className="cyber-border bg-background/80 backdrop-blur-sm px-6 py-4 rounded-lg"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Score</p>
          <motion.p
            className="text-4xl font-display font-bold text-glow-cyan text-primary"
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {score.toLocaleString()}
          </motion.p>
        </motion.div>

        {/* Timer */}
        {gameStarted && (
          <motion.div
            className="cyber-border bg-background/80 backdrop-blur-sm px-6 py-4 rounded-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 text-center">Time</p>
            <p className={`text-4xl font-display font-bold text-center ${
              timeLeft <= 10 ? 'text-destructive animate-pulse-neon' : 'text-primary text-glow-cyan'
            }`}>
              {formatTime(timeLeft)}
            </p>
          </motion.div>
        )}

        {/* Combo & Accuracy */}
        <motion.div
          className="cyber-border bg-background/80 backdrop-blur-sm px-6 py-4 rounded-lg text-right"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Combo</p>
              <motion.p
                className="text-2xl font-display font-bold text-secondary text-glow-magenta"
                key={combo}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                x{combo}
              </motion.p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Accuracy</p>
              <p className="text-2xl font-display font-bold text-accent">
                {accuracy.toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
        {/* Hand Status */}
        <motion.div
          className="cyber-border bg-background/80 backdrop-blur-sm px-4 py-3 rounded-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isGunGesture ? 'bg-neon-green animate-pulse-neon' : 'bg-muted'
            }`} />
            <span className="text-sm font-body uppercase tracking-wide">
              {isGunGesture ? 'LOCKED ON' : 'MAKE GUN GESTURE'}
            </span>
          </div>
        </motion.div>

        {/* High Score */}
        <motion.div
          className="cyber-border bg-background/80 backdrop-blur-sm px-4 py-3 rounded-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">High Score</p>
          <p className="text-xl font-display font-bold text-neon-yellow">
            {highScore.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Combo popup */}
      <AnimatePresence>
        {combo > 1 && combo % 5 === 0 && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-6xl font-display font-black text-glow-magenta text-secondary">
              {combo}x COMBO!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
