import { motion } from 'framer-motion';
import { Camera, CameraOff } from 'lucide-react';

interface CameraToggleProps {
  cameraEnabled: boolean;
  onToggle: () => void;
}

export function CameraToggle({ cameraEnabled, onToggle }: CameraToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg
        cyber-border backdrop-blur-sm transition-colors duration-300
        ${cameraEnabled 
          ? 'bg-neon-green/20 text-neon-green border-neon-green/50' 
          : 'bg-muted/50 text-muted-foreground hover:bg-muted/70'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {cameraEnabled ? (
        <Camera className="w-5 h-5" />
      ) : (
        <CameraOff className="w-5 h-5" />
      )}
      <span className="text-sm font-display uppercase tracking-wide">
        {cameraEnabled ? 'Camera ON' : 'Camera OFF'}
      </span>
    </motion.button>
  );
}
