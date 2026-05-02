import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Orb({ color1 = '#6366f1', color2 = '#8b5cf6' }) {
  const mesh = useRef();
  const wireframe = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.3;
      mesh.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    }
    if (wireframe.current) {
      wireframe.current.rotation.y = -t * 0.15;
      wireframe.current.rotation.z = t * 0.1;
    }
  });

  return (
    <>
      <mesh ref={mesh}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshPhongMaterial
          color={color1}
          emissive={color2}
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
          wireframe={false}
        />
      </mesh>
      <mesh ref={wireframe}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial color={color2} transparent opacity={0.15} wireframe />
      </mesh>
    </>
  );
}

export default function GlobeOrb({ size = 120, color1 = '#6366f1', color2 = '#8b5cf6' }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 4, 4]} intensity={2} color="#06b6d4" />
        <pointLight position={[-4, -4, -2]} intensity={1} color="#8b5cf6" />
        <Orb color1={color1} color2={color2} />
      </Canvas>
    </div>
  );
}
