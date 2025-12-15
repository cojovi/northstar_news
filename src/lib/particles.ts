export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
  scale: number;
}

export function createParticle(x: number, y: number, emoji: string): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 3;

  return {
    id: Math.random().toString(36),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    life: 1,
    maxLife: 60,
    emoji,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    scale: 0.8 + Math.random() * 0.4
  };
}

export function updateParticle(particle: Particle): Particle {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vy: particle.vy + 0.3,
    rotation: particle.rotation + particle.rotationSpeed,
    life: particle.life - 1/particle.maxLife,
  };
}
