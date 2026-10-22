/**
 * Pista original de teste do Marco M1.
 * Formato declarativo (LEVEL-005, LEVEL-006).
 * Projetada com retas e curvas suaves para demonstrar a aceleração ao raspar na parede (wall boost).
 */

export const PROTOTYPE_TRACK = {
  id: 'track-01-proto',
  name: 'Circuito Alfa',
  description: 'Aprenda a deslizar pelas paredes para ganhar velocidade e alcançar o portal.',
  author: 'Neon Racer Dev',
  targetTime: 14.5, // Segundos para bater (tempo de referência)

  // Ponto de partida
  spawn: {
    x: 100,
    y: 300,
    angle: 0 // Apontando para a direita (+X)
  },

  // Linha de chegada perpendicular ao corredor final
  finishLine: {
    a: { x: 2102, y: 428 },
    b: { x: 2200, y: 550 }
  },

  // Paredes da pista (conjunto de segmentos)
  walls: [
    // Parede Superior
    { a: { x: 50, y: 220 }, b: { x: 700, y: 220 } },
    { a: { x: 700, y: 220 }, b: { x: 1100, y: 350 } },
    { a: { x: 1100, y: 350 }, b: { x: 1400, y: 650 } },
    { a: { x: 1400, y: 650 }, b: { x: 1700, y: 750 } },
    { a: { x: 1700, y: 750 }, b: { x: 2102, y: 428 } },

    // Parede Inferior
    { a: { x: 50, y: 380 }, b: { x: 650, y: 380 } },
    { a: { x: 650, y: 380 }, b: { x: 1000, y: 500 } },
    { a: { x: 1000, y: 500 }, b: { x: 1250, y: 780 } },
    { a: { x: 1250, y: 780 }, b: { x: 1650, y: 900 } },
    { a: { x: 1650, y: 900 }, b: { x: 2200, y: 550 } },

    // Fechamento traseiro da largada
    { a: { x: 50, y: 220 }, b: { x: 50, y: 380 } }
  ]
};
