/**
 * Resolvedor de colisão e resposta para naves e paredes (segmentos de reta).
 * Satisfaz: PHYS-005, PHYS-006, PHYS-007, PHYS-008, PHYS-009, PHYS-014.
 */

import { closestPointOnSegment, clamp } from '../core/math.js';

/**
 * Resolve a colisão de uma partícula circular (a nave) contra uma lista de segmentos de parede.
 *
 * @param {Object} ship - Objeto da nave {x, y, vx, vy, angle, radius, isWallBoosting, lastCollisionType}
 * @param {Array<{a: {x: number, y: number}, b: {x: number, y: number}}>} walls - Segmentos de parede
 * @param {Object} config - Parâmetros de física de CONFIG.physics
 * @param {number} subDt - Intervalo de tempo deste subpasso
 * @returns {{hasCollision: boolean, collisionType: 'none' | 'frontal' | 'scrape', contacts: Array}}
 */
export function resolveWallCollisions(ship, walls, config, subDt) {
  let hasCollision = false;
  let dominantType = 'none';
  const contacts = [];
  ship.isWallBoosting = false;

  for (let i = 0; i < walls.length; i++) {
    const wall = walls[i];
    const { closest, distSq, tangent, normal: leftNormal } = closestPointOnSegment(ship, wall.a, wall.b);
    const radius = ship.radius;
    const radiusSq = radius * radius;

    if (distSq < radiusSq) {
      hasCollision = true;
      const dist = Math.sqrt(distSq);

      // Calcular vetor normal da parede em direção ao centro da nave
      let nx = 0;
      let ny = 0;
      if (dist > 1e-4) {
        nx = (ship.x - closest.x) / dist;
        ny = (ship.y - closest.y) / dist;
      } else {
        // Se o centro coincidir exatamente com a parede, usa a normal padrão do segmento
        nx = leftNormal.x;
        ny = leftNormal.y;
      }

      // Penetração e correção de posição (PHYS-006)
      const penetration = radius - dist;
      ship.x += nx * penetration;
      ship.y += ny * penetration;

      // Velocidade projetada na normal
      const vDotNormal = ship.vx * nx + ship.vy * ny;

      // Decompõe a velocidade em componentes normal e tangencial
      const vNormX = nx * vDotNormal;
      const vNormY = ny * vDotNormal;
      let vTanX = ship.vx - vNormX;
      let vTanY = ship.vy - vNormY;
      const tanSpeed = Math.hypot(vTanX, vTanY);

      // Orientação frontal da nave
      const fwdX = Math.cos(ship.angle);
      const fwdY = Math.sin(ship.angle);

      // frontalDot: quanto mais a nave estiver apontando CONTRA a normal da parede, mais frontal é
      // Se a nave bate de frente na parede, fwd aponta no sentido oposto de n (ou seja, fwd · n < 0)
      const frontalDot = -(fwdX * nx + fwdY * ny);

      contacts.push({
        closest,
        normal: { x: nx, y: ny },
        penetration,
        frontalDot,
        tanSpeed
      });

      if (frontalDot > config.frontalDotThreshold) {
        // Colisão frontal (PHYS-007):
        // Penalidade severa de velocidade e reflexão com baixa restituição
        const restitution = config.restitution || 0.2;
        const penalty = config.frontalSpeedPenalty || 0.6;

        vTanX *= (1 - penalty);
        vTanY *= (1 - penalty);

        if (vDotNormal < 0) {
          ship.vx = vTanX - vNormX * restitution;
          ship.vy = vTanY - vNormY * restitution;
        } else {
          ship.vx = vTanX;
          ship.vy = vTanY;
        }

        dominantType = 'frontal';
        ship.isWallBoosting = false;
      } else {
        // Contato raspando / tangencial (PHYS-005, PHYS-008):
        dominantType = (dominantType === 'frontal') ? 'frontal' : 'scrape';

        if (vDotNormal < 0) {
          // Cancela velocidade perpendicular contra a parede
          ship.vx = vTanX;
          ship.vy = vTanY;
        }

        // Se a velocidade tangencial exceder o mínimo para boost (antiexploit):
        if (tanSpeed >= config.wallMinSpeedForBoost) {
          const tanDirX = vTanX / tanSpeed;
          const tanDirY = vTanY / tanSpeed;

          // Wall Thrust: aceleração na direção tangencial
          const boostImpulse = config.wallThrustForce * subDt;
          ship.vx += tanDirX * boostImpulse;
          ship.vy += tanDirY * boostImpulse;

          // Força suave de afastamento da parede (wall push)
          const pushImpulse = (config.wallPushForce || 60) * subDt;
          ship.vx += nx * pushImpulse;
          ship.vy += ny * pushImpulse;

          ship.isWallBoosting = true;

          // Orientar suavemente a nave para longe da parede (torque de afastamento suave)
          // se ela estiver virada em direção à parede
          const dotToWall = fwdX * (-nx) + fwdY * (-ny);
          if (dotToWall > 0.1) {
            // Rotaciona ligeiramente em direção à tangente
            const cross = fwdX * tanDirY - fwdY * tanDirX;
            ship.angle += cross * 1.5 * subDt;
          }
        }
      }
    }
  }

  ship.lastCollisionType = dominantType;
  return { hasCollision, collisionType: dominantType, contacts };
}

/**
 * Verifica se a linha de deslocamento da nave (ou seu círculo) intersecta um segmento de trigger (ex: linha de chegada).
 *
 * @param {{x: number, y: number}} prevPos - Posição anterior da nave
 * @param {{x: number, y: number}} currPos - Posição atual da nave
 * @param {{x: number, y: number}} a - Ponto inicial do gatilho
 * @param {{x: number, y: number}} b - Ponto final do gatilho
 * @returns {boolean}
 */
export function checkSegmentIntersection(prevPos, currPos, a, b) {
  // Teste de intersecção de dois segmentos de reta (prevPos->currPos e a->b)
  const d1x = currPos.x - prevPos.x;
  const d1y = currPos.y - prevPos.y;
  const d2x = b.x - a.x;
  const d2y = b.y - a.y;

  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-6) return false;

  const dx = a.x - prevPos.x;
  const dy = a.y - prevPos.y;

  const t = (dx * d2y - dy * d2x) / cross;
  const u = (dx * d1y - dy * d1x) / cross;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
