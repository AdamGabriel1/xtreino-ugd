import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const SPHERE_RADIUS = 250;
const MAX_PARTICLES = 120;

export function MouseTrailGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef(0);
  const sphereCenterRef = useRef({ x: 0, y: 0 });

  // Atualiza dimensões do canvas e centro da esfera
  useEffect(() => {
    const updateDimensions = () => {
      sphereCenterRef.current = { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      };
      
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Loop de animação
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = sphereCenterRef.current.x - p.x;
        const dy = sphereCenterRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearSphere = dist < SPHERE_RADIUS;

        // Física: partículas verdes são atraídas pela esfera
        if (isNearSphere && p.color === '#10b981') {
          p.vx += (dx / dist) * 0.6;
          p.vy += (dy / dist) * 0.6;
        } else {
          p.vy += 0.12; // Gravidade
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // Fricção
        p.vy *= 0.96;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Renderização com glow
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        if (p.color === '#10b981') {
          ctx.shadowBlur = p.size * 6;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
        } else {
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        }
        
        ctx.fill();
        ctx.restore();
      }
      
      animId = requestAnimationFrame(animate);
    };
    
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handlers de input (mouse e touch)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - sphereCenterRef.current.x;
      const dy = e.clientY - sphereCenterRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isNearSphere = dist < SPHERE_RADIUS;
      const spawnRate = isNearSphere ? 20 : 40;

      if (now - lastSpawnRef.current <= spawnRate) return;
      lastSpawnRef.current = now;

      const angle = Math.random() * Math.PI * 2;
      const isGreen = Math.random() > 0.3 || isNearSphere;

      particlesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * (isNearSphere ? 0.3 : 0.8),
        vy: Math.sin(angle) * (isNearSphere ? 0.3 : 0.8) + (isNearSphere ? -1 : 0.5),
        life: 1,
        maxLife: isNearSphere ? 50 + Math.random() * 20 : 30 + Math.random() * 20,
        size: isNearSphere ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
        color: isGreen ? '#10b981' : '#ffffff',
      });

      // Partícula extra quando perto da esfera
      if (isNearSphere) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 1,
          maxLife: 40 + Math.random() * 20,
          size: 2 + Math.random() * 2,
          color: '#10b981',
        });
      }

      // Limitar partículas
      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      
      if (now - lastSpawnRef.current <= 50) return;
      lastSpawnRef.current = now;

      const angle = Math.random() * Math.PI * 2;
      particlesRef.current.push({
        x: touch.clientX,
        y: touch.clientY,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5 + 0.5,
        life: 1,
        maxLife: 30 + Math.random() * 20,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#10b981' : '#ffffff',
      });
      
      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
}