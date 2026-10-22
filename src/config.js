// Configurações centralizadas do jogo (PHYS-012)
export const CONFIG = {
  physics: {
    dt: 1 / 60,                // Passo fixo de 60Hz (PHYS-010)
    maxFrameTime: 0.1,         // Limite máximo de catch-up (100ms) contra delta spikes (RESP-010)
    substeps: 4,               // Subpassos de colisão para evitar atravessar em alta velocidade (PHYS-009)
    turnRate: Math.PI * 1.8,   // Velocidade de giro angular rad/s (PHYS-004)
    thrust: 480,               // Força de propulsão automática da nave px/s² (PHYS-002, CTRL-003)
    drag: 0.38,                // Arrasto linear / atrito aerodinâmico (PHYS-003)
    maxSpeed: 750,             // Velocidade máxima de cruzeiro normal
    maxBoostSpeed: 1100,       // Velocidade máxima permitida durante wall boost
    shipRadius: 10,            // Raio de colisão da nave
    restitution: 0.25,         // Coeficiente de restituição no impacto frontal
    frontalSpeedPenalty: 0.65, // Redução de velocidade em batida frontal (PHYS-007)
    frontalDotThreshold: 0.45, // Limiar para classificar colisão como frontal vs tangencial
    wallThrustForce: 750,      // Impulso de aceleração tangencial na parede (PHYS-005, PHYS-008)
    wallPushForce: 85,         // Força suave de afastamento da parede
    wallMinSpeedForBoost: 60,  // Velocidade mínima tangencial para ativar boost (antiexploit)
  },
  camera: {
    lerp: 0.1,                 // Suavização do movimento da câmera (CAM-001)
    leadFactor: 0.25,          // Antecipação visual na direção da velocidade (CAM-003)
    zoom: 1.0,
  },
  visual: {
    shipColor: '#00ffff',
    shipTrailColor: 'rgba(0, 255, 255, 0.4)',
    wallColor: '#ff0077',
    wallGlowColor: 'rgba(255, 0, 119, 0.35)',
    boostParticleColor: '#39ff14',
    finishLineColor: '#ffff00',
    bgColor: '#080811',
    maxParticles: 120,
    maxTrailPoints: 40,
  }
};
