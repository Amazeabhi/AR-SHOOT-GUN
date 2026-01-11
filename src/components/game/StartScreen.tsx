import { motion } from 'framer-motion';
import { Hand, Target, Crosshair } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
  isGunGesture: boolean;
}

export function StartScreen({ onStart, isLoading, error, isGunGesture }: StartScreenProps) {
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
        className="relative z-10 text-center max-w-2xl px-8"
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
          <h1 className="text-6xl md:text-8xl font-display font-black text-glow-cyan text-primary mb-4">
            HAND
            <span className="text-secondary text-glow-magenta"> BLASTER</span>
          </h1>
          <p className="text-xl text-muted-foreground font-body mb-8">
            AR SHOOTING EXPERIENCE
          </p>
        </motion.div>

        {/* Loading/Error State */}
        {isLoading && (
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

        {error && (
          <motion.div
            className="mb-8 p-4 cyber-border bg-destructive/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-destructive font-body">{error}</p>
          </motion.div>
        )}

        {/* Instructions */}
        {!isLoading && !error && (
          <motion.div
            className="space-y-6 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="cyber-border bg-card/50 p-4 rounded-lg">
                <Hand className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-display font-bold text-primary mb-1">MAKE GUN</h3>
                <p className="text-sm text-muted-foreground">
                  Form a gun with your hand - index out, others curled
                </p>
              </div>
              <div className="cyber-border bg-card/50 p-4 rounded-lg">
                <Crosshair className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-display font-bold text-secondary mb-1">AIM</h3>
                <p className="text-sm text-muted-foreground">
                  Point with your index finger to aim at targets
                </p>
              </div>
              <div className="cyber-border bg-card/50 p-4 rounded-lg">
                <Target className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-display font-bold text-accent mb-1">SHOOT</h3>
                <p className="text-sm text-muted-foreground">
                  Pull your thumb towards your hand to fire
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={onStart}
              className={`
                relative px-12 py-4 font-display font-bold text-xl uppercase tracking-widest
                transition-all duration-300 rounded-lg overflow-hidden
                ${isGunGesture 
                  ? 'bg-primary text-primary-foreground box-glow-cyan cursor-pointer hover:scale-105' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
              disabled={!isGunGesture}
            >
              <span className="relative z-10">
                {isGunGesture ? 'START GAME' : 'SHOW GUN GESTURE TO START'}
              </span>
              {isGunGesture && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ opacity: 0.3 }}
                />
              )}
            </button>

            <motion.p
              className="mt-4 text-sm text-muted-foreground"
              animate={{ opacity: isGunGesture ? 0 : [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              👆 Point your index finger at the camera with a gun gesture
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
