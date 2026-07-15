import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function HolographicSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0.1);
      },
      { threshold: [0, 0.1, 1] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        frameloop={isVisible ? 'always' : 'never'}
      >
        <SceneContent isActive={isVisible} />
        <color attach="background" args={['#0a0a0f']} />
      </Canvas>
    </div>
  );
}

// ============================================================================
// SCENE CONTENT (Orquestra todos os elementos 3D)
// ============================================================================

function SceneContent({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const count = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (!isActive || !groupRef.current) return;
    
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    mouseRef.current.x = (state.pointer.x * viewport.width) / 2;
    mouseRef.current.y = (state.pointer.y * viewport.height) / 2;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouseRef.current.y * 0.1,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      <CoreSphere isActive={isActive} />
      <OrbitalRings isActive={isActive} />
      <ParticleField positions={positions} texture={particleTexture} isActive={isActive} />
    </group>
  );
}

// ============================================================================
// CORE SPHERE (Esfera holográfica com shader customizado)
// ============================================================================

function CoreSphere({ isActive }: { isActive: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#10b981") },
      uColor2: { value: new THREE.Color("#06b6d4") },
      uColor3: { value: new THREE.Color("#8b5cf6") },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        float distortion = sin(position.x * 3.0 + uTime) * sin(position.y * 3.0 + uTime * 0.8) * 0.15;
        vec3 newPos = position + normal * distortion;
        vPosition = (modelViewMatrix * vec4(newPos, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDirection = normalize(-vPosition);
        float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);
        float gradient = sin(vPosition.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
        vec3 color = mix(uColor1, uColor2, gradient);
        color = mix(color, uColor3, fresnel);
        float alpha = 0.5 + fresnel * 0.9;
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (!isActive || !materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere args={[1.8, 64, 64]}>
        <shaderMaterial 
          ref={materialRef} 
          attach="material" 
          {...shaderData} 
          transparent={true} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </Sphere>
    </Float>
  );
}

// ============================================================================
// ORBITAL RINGS (Anéis orbitais animados)
// ============================================================================

function OrbitalRings({ isActive }: { isActive: boolean }) {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!isActive) return;
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2.5;
      ring1Ref.current.rotation.z = t * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 1.5;
      ring2Ref.current.rotation.z = -t * 0.2;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.8, 0.005, 16, 100]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.2, 0.005, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

// ============================================================================
// PARTICLE FIELD (Campo de partículas)
// ============================================================================

function ParticleField({ 
  positions, 
  texture, 
  isActive 
}: { 
  positions: Float32Array; 
  texture: THREE.Texture; 
  isActive: boolean;
}) {
  const ref = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (!isActive || !ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#10b981" 
        sizeAttenuation 
        transparent 
        opacity={0.6} 
        depthWrite={false}
        map={texture}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}