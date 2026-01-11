import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface Target {
  id: string;
  position: [number, number, number];
  scale: number;
  color: string;
  points: number;
  speed: number;
  direction: [number, number, number];
}

interface Projectile {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
}

interface Explosion {
  id: string;
  position: [number, number, number];
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

function TargetMesh({ target, onHit }: { target: Target; onHit: (id: string, points: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hit, setHit] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && !hit) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.8;
      
      // Move target
      meshRef.current.position.x += target.direction[0] * target.speed * delta;
      meshRef.current.position.y += target.direction[1] * target.speed * delta;
      
      // Bounce off walls
      if (Math.abs(meshRef.current.position.x) > 8) {
        target.direction[0] *= -1;
      }
      if (Math.abs(meshRef.current.position.y) > 4) {
        target.direction[1] *= -1;
      }
    }
  });

  if (hit) return null;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={target.position}
        scale={target.scale}
        onClick={() => {
          setHit(true);
          onHit(target.id, target.points);
        }}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={target.color}
          emissive={target.color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function ProjectileMesh({ projectile }: { projectile: Projectile }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += projectile.direction[0] * 30 * delta;
      meshRef.current.position.y += projectile.direction[1] * 30 * delta;
      meshRef.current.position.z += projectile.direction[2] * 30 * delta;
    }
  });

  return (
    <Trail
      width={0.3}
      length={6}
      color="#00ffff"
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={projectile.position}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </Trail>
  );
}

function ExplosionMesh({ explosion }: { explosion: Explosion }) {
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(1);

  useFrame((state) => {
    const elapsed = (Date.now() - explosion.createdAt) / 1000;
    const scale = 1 + elapsed * 3;
    const newOpacity = Math.max(0, 1 - elapsed * 2);
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
    setOpacity(newOpacity);
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef} position={explosion.position}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={explosion.color}
          transparent
          opacity={opacity}
        />
      </mesh>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.5,
              Math.sin(angle) * 0.5,
              0,
            ]}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial
              color={explosion.color}
              transparent
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Crosshair({ aimPosition }: { aimPosition: { x: number; y: number } | null }) {
  const meshRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(() => {
    if (meshRef.current && aimPosition) {
      const x = (aimPosition.x - 0.5) * viewport.width;
      const y = -(aimPosition.y - 0.5) * viewport.height;
      meshRef.current.position.x = x;
      meshRef.current.position.y = y;
      meshRef.current.position.z = 0;
    }
  });

  if (!aimPosition) return null;

  return (
    <group ref={meshRef}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.15, 0.2, 4]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function RaycastHandler({
  aimPosition,
  isShooting,
  targets,
  onHit,
  onMiss,
  addProjectile,
  addExplosion,
}: {
  aimPosition: { x: number; y: number } | null;
  isShooting: boolean;
  targets: Target[];
  onHit: (id: string, points: number, position: [number, number, number], color: string) => void;
  onMiss: () => void;
  addProjectile: (projectile: Projectile) => void;
  addExplosion: (explosion: Explosion) => void;
}) {
  const { camera, viewport, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const lastShot = useRef(0);

  useFrame(() => {
    if (isShooting && aimPosition && Date.now() - lastShot.current > 250) {
      lastShot.current = Date.now();

      // Create projectile
      const x = (aimPosition.x - 0.5) * viewport.width;
      const y = -(aimPosition.y - 0.5) * viewport.height;
      
      addProjectile({
        id: `projectile-${Date.now()}`,
        position: [x, y, 5],
        direction: [0, 0, -1],
      });

      // Raycast for hit detection
      const mouse = new THREE.Vector2(
        (aimPosition.x - 0.5) * 2,
        -(aimPosition.y - 0.5) * 2
      );
      raycaster.setFromCamera(mouse, camera);

      const meshes = scene.children.filter(
        (child) => child instanceof THREE.Mesh || child instanceof THREE.Group
      );
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const hitPosition = intersects[0].point;
        
        // Find which target was hit
        for (const target of targets) {
          const distance = Math.sqrt(
            Math.pow(hitPosition.x - target.position[0], 2) +
            Math.pow(hitPosition.y - target.position[1], 2) +
            Math.pow(hitPosition.z - target.position[2], 2)
          );
          
          if (distance < target.scale * 2) {
            onHit(target.id, target.points, target.position, target.color);
            addExplosion({
              id: `explosion-${Date.now()}`,
              position: target.position,
              color: target.color,
              createdAt: Date.now(),
            });
            return;
          }
        }
      }
      onMiss();
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
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  // Spawn targets
  useEffect(() => {
    if (!gameStarted) return;

    const spawnTarget = () => {
      const newTarget: Target = {
        id: `target-${Date.now()}-${Math.random()}`,
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6,
          -5 - Math.random() * 5,
        ],
        scale: 0.5 + Math.random() * 0.5,
        color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
        points: Math.floor(Math.random() * 50) + 10,
        speed: 1 + Math.random() * 2,
        direction: [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          0,
        ],
      };
      setTargets((prev) => [...prev.slice(-15), newTarget]);
    };

    spawnTarget();
    const interval = setInterval(spawnTarget, 1500);
    return () => clearInterval(interval);
  }, [gameStarted]);

  // Clean up projectiles and explosions
  useEffect(() => {
    const cleanup = setInterval(() => {
      setProjectiles((prev) => prev.filter((p) => {
        const age = Date.now() - parseInt(p.id.split('-')[1]);
        return age < 2000;
      }));
      setExplosions((prev) => prev.filter((e) => {
        return Date.now() - e.createdAt < 500;
      }));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  const handleHit = (id: string, points: number, position: [number, number, number], color: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    onHit(points);
  };

  const handleTargetClick = (id: string, points: number) => {
    const target = targets.find((t) => t.id === id);
    if (target) {
      handleHit(id, points, target.position, target.color);
      setExplosions((prev) => [
        ...prev,
        {
          id: `explosion-${Date.now()}`,
          position: target.position,
          color: target.color,
          createdAt: Date.now(),
        },
      ]);
    }
  };

  const addProjectile = (projectile: Projectile) => {
    setProjectiles((prev) => [...prev, projectile]);
  };

  const addExplosion = (explosion: Explosion) => {
    setExplosions((prev) => [...prev, explosion]);
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <Crosshair aimPosition={aimPosition} />

      {targets.map((target) => (
        <TargetMesh
          key={target.id}
          target={target}
          onHit={handleTargetClick}
        />
      ))}

      {projectiles.map((projectile) => (
        <ProjectileMesh key={projectile.id} projectile={projectile} />
      ))}

      {explosions.map((explosion) => (
        <ExplosionMesh key={explosion.id} explosion={explosion} />
      ))}

      <RaycastHandler
        aimPosition={aimPosition}
        isShooting={isShooting}
        targets={targets}
        onHit={handleHit}
        onMiss={onMiss}
        addProjectile={addProjectile}
        addExplosion={addExplosion}
      />
    </>
  );
}

export function GameScene(props: GameSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ background: 'transparent' }}
    >
      <GameContent {...props} />
    </Canvas>
  );
}
