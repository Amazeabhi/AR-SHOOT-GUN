import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

interface HandData {
  indexTip: { x: number; y: number; z: number } | null;
  thumbTip: { x: number; y: number; z: number } | null;
  indexBase: { x: number; y: number; z: number } | null;
  thumbBase: { x: number; y: number; z: number } | null;
  isGunGesture: boolean;
  isShooting: boolean;
  aimPosition: { x: number; y: number } | null;
}

export const useHandTracking = (enabled: boolean = true) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [handData, setHandData] = useState<HandData>({
    indexTip: null,
    thumbTip: null,
    indexBase: null,
    thumbBase: null,
    isGunGesture: false,
    isShooting: false,
    aimPosition: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousThumbDistance = useRef<number>(0);
  const shootCooldown = useRef<boolean>(false);
  const isInitialized = useRef<boolean>(false);

  const onResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Landmark indices for MediaPipe Hands
      const indexTip = landmarks[8];  // Index finger tip
      const thumbTip = landmarks[4];  // Thumb tip
      const indexBase = landmarks[5]; // Index finger MCP
      const thumbBase = landmarks[2]; // Thumb CMC
      const indexPIP = landmarks[6];  // Index finger PIP
      const middleTip = landmarks[12]; // Middle finger tip
      const ringTip = landmarks[16];   // Ring finger tip
      const pinkyTip = landmarks[20];  // Pinky tip
      const wrist = landmarks[0];      // Wrist

      // Calculate if index finger is extended (pointing)
      const indexExtended = indexTip.y < indexPIP.y;
      
      // Calculate if other fingers are curled
      const middleCurled = middleTip.y > landmarks[10].y;
      const ringCurled = ringTip.y > landmarks[14].y;
      const pinkyCurled = pinkyTip.y > landmarks[18].y;

      // Gun gesture: index extended, other fingers curled
      const isGunGesture = indexExtended && middleCurled && ringCurled && pinkyCurled;

      // Calculate thumb to index base distance for shooting detection
      const thumbToIndexDistance = Math.sqrt(
        Math.pow(thumbTip.x - indexBase.x, 2) +
        Math.pow(thumbTip.y - indexBase.y, 2)
      );

      // Detect shooting: thumb moves towards index (pulling trigger)
      let isShooting = false;
      if (isGunGesture && !shootCooldown.current) {
        const thumbDistanceChange = previousThumbDistance.current - thumbToIndexDistance;
        if (thumbDistanceChange > 0.02 && thumbToIndexDistance < 0.08) {
          isShooting = true;
          shootCooldown.current = true;
          setTimeout(() => {
            shootCooldown.current = false;
          }, 300);
        }
      }
      previousThumbDistance.current = thumbToIndexDistance;

      // Calculate aim position (normalized screen coordinates)
      // Mirror the x coordinate for natural aiming
      const aimX = 1 - indexTip.x;
      const aimY = indexTip.y;

      setHandData({
        indexTip: { x: indexTip.x, y: indexTip.y, z: indexTip.z },
        thumbTip: { x: thumbTip.x, y: thumbTip.y, z: thumbTip.z },
        indexBase: { x: indexBase.x, y: indexBase.y, z: indexBase.z },
        thumbBase: { x: thumbBase.x, y: thumbBase.y, z: thumbBase.z },
        isGunGesture,
        isShooting,
        aimPosition: { x: aimX, y: aimY },
      });
    } else {
      setHandData(prev => ({
        ...prev,
        indexTip: null,
        thumbTip: null,
        isGunGesture: false,
        isShooting: false,
        aimPosition: null,
      }));
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoRef.current.remove();
      videoRef.current = null;
    }
    handsRef.current = null;
    cameraRef.current = null;
    isInitialized.current = false;
    setHandData({
      indexTip: null,
      thumbTip: null,
      indexBase: null,
      thumbBase: null,
      isGunGesture: false,
      isShooting: false,
      aimPosition: null,
    });
  }, []);

  const initializeHandTracking = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      const video = document.createElement('video');
      video.style.display = 'none';
      document.body.appendChild(video);
      videoRef.current = video;

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });
      handsRef.current = hands;

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);

      const camera = new Camera(video, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: video });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current = camera;

      await camera.start();
      isInitialized.current = true;
      setIsLoading(false);
    } catch (err) {
      console.error('Hand tracking error:', err);
      setError('Failed to initialize camera. Please allow camera access.');
      setIsLoading(false);
    }
  }, [onResults]);

  useEffect(() => {
    if (enabled) {
      initializeHandTracking();
    } else {
      stopCamera();
      setIsLoading(false);
    }

    return () => {
      stopCamera();
    };
  }, [enabled, initializeHandTracking, stopCamera]);

  return { handData, isLoading, error };
};
