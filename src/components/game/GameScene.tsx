import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface Target {
  id: string;
  position: THREE.Vector3;
  scale: number;
  color: string;
  points: number;
  speed: number;
  direction: THREE.Vector3;
  isHit: boolean;
}

interface Explosion {
  id: string;
  position: THREE.Vector3;
  color: string;
  createdAt: number;
}

interface GameSceneProps {
  aimPosition: { x: number; y: number } | null;
  isShooting: boolean;
  isGunGesture: boolean;
  onHit: (points: number) => void;
  onMiss: () => void;
  gameStarted: boolean;
}

const TARGET_COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'];

function TargetMesh({ 
  target, 
  onHit 
}: { 
  target: Target; 
  onHit: (id: string, points: number, position: THREE.Vector3, color: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && !target.isHit) {
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.y += delta * 3;
      
      // Floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + parseFloat(target.id.split('-')[1]) * 0.001) * delta * 0.5;
      
      // Move target
      meshRef.current.position.x += target.direction.x * target.speed * delta;
      meshRef.current.position.y += target.direction.y * target.speed * delta;
      
      // Bounce off walls
      if (Math.abs(meshRef.current.position.x) > 6) {
        target.direction.x *= -1;
        meshRef.current.position.x = Math.sign(meshRef.current.position.x) * 6;
      }
      if (Math.abs(meshRef.current.position.y) > 3) {
        target.direction.y *= -1;
        meshRef.current.position.y = Math.sign(meshRef.current.position.y) * 3;
      }

      // Update glow position
      if (glowRef.current) {
        glowRef.current.position.copy(meshRef.current.position);
        glowRef.current.rotation.copy(meshRef.current.rotation);
      }
    }
  });

  if (target.isHit) return null;

  return (
    <group>
      {/* Glow sphere behind */}
      <mesh ref={glowRef} position={target.position.toArray()} scale={target.scale * 2}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={target.color}
          transparent
          opacity={hovered ? 0.4 : 0.2}
        />
      </mesh>
      
      {/* Main target */}
      <mesh
        ref={meshRef}
        position={target.position.toArray()}
        scale={target.scale}
        onClick={(e) => {
          e.stopPropagation();
          onHit(target.id, target.points, target.position, target.color);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={target.color}
          emissive={target.color}
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}

function ExplosionMesh({ explosion }: { explosion: Explosion }) {
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(1);
  const particles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      size: 0.1 + Math.random() * 0.2,
    }));
  }, []);

  useFrame(() => {
    const elapsed = (Date.now() - explosion.createdAt) / 1000;
    const scale = 1 + elapsed * 4;
    const newOpacity = Math.max(0, 1 - elapsed * 3);
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
    setOpacity(newOpacity);
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef} position={explosion.position.toArray()}>
      {/* Central flash */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color={explosion.color}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Particles */}
      {particles.map((p, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(p.angle) * p.speed * 2,
            Math.sin(p.angle) * p.speed * 2,
            (Math.random() - 0.5) * 0.5,
          ]}
        >
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial
            color={explosion.color}
            transparent
            opacity={opacity * 0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function Crosshair({ aimPosition, isShooting }: { aimPosition: { x: number; y: number } | null; isShooting: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(() => {
    if (groupRef.current && aimPosition) {
      const x = (aimPosition.x - 0.5) * viewport.width;
      const y = -(aimPosition.y - 0.5) * viewport.height;
      groupRef.current.position.set(x, y, 5);
      groupRef.current.rotation.z += 0.02;
    }
  });

  if (!aimPosition) return null;

  return (
    <group ref={groupRef}>
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[0.35, 0.4, 32]} />
        <meshBasicMaterial color={isShooting ? "#ff0000" : "#00ffff"} transparent opacity={0.9} />
      </mesh>
      {/* Inner ring */}
      <mesh>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.9} />
      </mesh>
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color={isShooting ? "#ffff00" : "#ffffff"} />
      </mesh>
      {/* Crosshair lines */}
      {[0, 90, 180, 270].map((angle) => (
        <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]} position={[0.5, 0, 0]}>
          <planeGeometry args={[0.25, 0.03]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function ShootingRay({
  aimPosition,
  isShooting,
  targets,
  onHit,
  onMiss,
  addExplosion,
}: {
  aimPosition: { x: number; y: number } | null;
  isShooting: boolean;
  targets: Target[];
  onHit: (id: string, points: number, position: THREE.Vector3, color: string) => void;
  onMiss: () => void;
  addExplosion: (explosion: Explosion) => void;
}) {
  const { camera, viewport } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const lastShot = useRef(0);

  useFrame(() => {
    if (isShooting && aimPosition && Date.now() - lastShot.current > 200) {
      lastShot.current = Date.now();

      // Convert aim position to normalized device coordinates
      const mouse = new THREE.Vector2(
        (aimPosition.x - 0.5) * 2,
        -(aimPosition.y - 0.5) * 2
      );
      
      raycaster.setFromCamera(mouse, camera);
      
      // Check intersection with targets
      let hitSomething = false;
      for (const target of targets) {
        if (target.isHit) continue;
        
        const distance = raycaster.ray.distanceToPoint(target.position);
        const hitRadius = target.scale * 1.5; // Generous hit radius
        
        if (distance < hitRadius) {
          onHit(target.id, target.points, target.position, target.color);
          addExplosion({
            id: `explosion-${Date.now()}`,
            position: target.position.clone(),
            color: target.color,
            createdAt: Date.now(),
          });
          hitSomething = true;
          break;
        }
      }
      
      if (!hitSomething) {
        onMiss();
      }
    }
  });

  return null;
}

function GameContent({
  aimPosition,
  isShooting,
  isGunGesture,
  onHit,
  onMiss,
  gameStarted,
}: GameSceneProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  // Spawn targets
  useEffect(() => {
    if (!gameStarted) {
      setTargets([]);
      return;
    }

    const spawnTarget = () => {
      const newTarget: Target = {
        id: `target-${Date.now()}-${Math.random()}`,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5,
          -3 - Math.random() * 3,
        ),
        scale: 0.6 + Math.random() * 0.4, // Bigger targets
        color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
        points: Math.floor(Math.random() * 50) + 10,
        speed: 0.5 + Math.random() * 1, // Slower targets
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          0,
        ),
        isHit: false,
      };
      setTargets((prev) => [...prev.slice(-12), newTarget]);
    };

    // Initial targets
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnTarget(), i * 200);
    }
    
    const interval = setInterval(spawnTarget, 2000);
    return () => clearInterval(interval);
  }, [gameStarted]);

  // Clean up explosions
  useEffect(() => {
    const cleanup = setInterval(() => {
      setExplosions((prev) => prev.filter((e) => Date.now() - e.createdAt < 500));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  const handleHit = (id: string, points: number, position: THREE.Vector3, color: string) => {
    setTargets((prev) => prev.map(t => t.id === id ? { ...t, isHit: true } : t));
    onHit(points);
  };

  const addExplosion = (explosion: Explosion) => {
    setExplosions((prev) => [...prev, explosion]);
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, 5]} intensity={0.8} color="#ff00ff" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
      
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {gameStarted && <Crosshair aimPosition={aimPosition} isShooting={isShooting} />}

      {targets.map((target) => (
        <TargetMesh
          key={target.id}
          target={target}
          onHit={handleHit}
        />
      ))}

      {explosions.map((explosion) => (
        <ExplosionMesh key={explosion.id} explosion={explosion} />
      ))}

      {gameStarted && (
        <ShootingRay
          aimPosition={aimPosition}
          isShooting={isShooting}
          targets={targets}
          onHit={handleHit}
          onMiss={onMiss}
          addExplosion={addExplosion}
        />
      )}
    </>
  );
}

export function GameScene(props: GameSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: 'transparent' }}
    >
      <GameContent {...props} />
    </Canvas>
  );
}
