import { motion } from 'framer-motion';
import { Hand, Target, Crosshair, Trophy } from 'lucide-react';
import { CameraToggle } from './CameraToggle';

interface ScoreEntry {
  score: number;
  date: string;
  accuracy: number;
}

interface StartScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
  isGunGesture: boolean;
  scoreHistory: ScoreEntry[];
  cameraEnabled: boolean;
  onCameraToggle: () => void;
}

export function StartScreen({ onStart, isLoading, error, isGunGesture, scoreHistory, cameraEnabled, onCameraToggle }: StartScreenProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-3xl px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-black text-glow-cyan text-primary mb-2">
            AR SHOOTING
          </h1>
          <h2 className="text-4xl md:text-6xl font-display font-black text-secondary text-glow-magenta mb-4">
            GAME
          </h2>
          <p className="text-xl text-muted-foreground font-body mb-8">
            HAND TRACKING EXPERIENCE
          </p>
        </motion.div>

        {/* Camera Toggle */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CameraToggle cameraEnabled={cameraEnabled} onToggle={onCameraToggle} />
        </motion.div>

        {/* Loading/Error State */}
        {cameraEnabled && isLoading && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-center gap-3 text-primary">
              <motion.div
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <span className="font-body">Initializing hand tracking...</span>
            </div>
          </motion.div>
        )}

        {cameraEnabled && error && (
          <motion.div
            className="mb-8 p-4 cyber-border bg-destructive/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-destructive font-body">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Don't worry! You can still play with mouse clicks.</p>
          </motion.div>
        )}

        {!cameraEnabled && (
          <motion.div
            className="mb-8 p-4 cyber-border bg-muted/30 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-muted-foreground font-body">📱 Camera disabled - Click targets to shoot!</p>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          className="space-y-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="cyber-border bg-card/50 p-4 rounded-lg">
              <Hand className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-display font-bold text-primary mb-1">MAKE GUN</h3>
              <p className="text-sm text-muted-foreground">
                Index finger out, others curled
              </p>
            </div>
            <div className="cyber-border bg-card/50 p-4 rounded-lg">
              <Crosshair className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-display font-bold text-secondary mb-1">AIM</h3>
              <p className="text-sm text-muted-foreground">
                Point to aim or use mouse
              </p>
            </div>
            <div className="cyber-border bg-card/50 p-4 rounded-lg">
              <Target className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-display font-bold text-accent mb-1">SHOOT</h3>
              <p className="text-sm text-muted-foreground">
                Pull thumb or click targets
              </p>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onStart}
            className="
              relative px-12 py-4 font-display font-bold text-xl uppercase tracking-widest
              transition-all duration-300 rounded-lg overflow-hidden
              bg-primary text-primary-foreground box-glow-cyan cursor-pointer hover:scale-105
            "
          >
            <span className="relative z-10">CLICK TO START</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ opacity: 0.3 }}
            />
          </button>

          {isGunGesture && (
            <motion.p
              className="mt-4 text-sm text-neon-green"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ Hand detected! You can also use gestures to shoot.
            </motion.p>
          )}
        </motion.div>

        {/* Score History */}
        {scoreHistory.length > 0 && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="cyber-border bg-card/50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-neon-yellow" />
                <h3 className="font-display font-bold text-neon-yellow">SCORE HISTORY</h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scoreHistory.slice(0, 5).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 rounded ${
                      index === 0 ? 'bg-neon-yellow/10 border border-neon-yellow/30' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-bold ${
                        index === 0 ? 'text-neon-yellow' : 'text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="font-display font-bold text-foreground">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {entry.accuracy.toFixed(0)}% acc
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {entry.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
