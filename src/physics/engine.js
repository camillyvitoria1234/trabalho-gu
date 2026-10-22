/**
 * Motor de física 2D de passo fixo para a nave.
 * Satisfaz: PHYS-001, PHYS-002, PHYS-003, PHYS-004, PHYS-009, PHYS-010, PHYS-015.
 */

import { normalizeAngle } from '../core/math.js';
import { resolveWallCollisions } from './collision.js';

export class PhysicsEngine {
  constructor(config) {
    this.config = config.physics;
    this.visualConfig = config.visual || {};

    // Criação da nave com estado inicial
    this.ship = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      radius: this.config.shipRadius || 10,
      isWallBoosting: false,
      inTurbo: false,
      inZeroThrust: false,
      inWind: false,
      lastCollisionType: 'none',
      trail: []
    };

    // Estatísticas e telemetria para debug (PHYS-015)
    this.stats = {
      speed: 0,
      boostActive: false,
      inTurbo: false,
      inZeroThrust: false,
      inWind: false,
      gravity: 0,
      activeZones: [],
      contactsCount: 0,
      collisionType: 'none'
    };
  }

  /**
   * Reseta a nave para a posição e ângulo de spawn.
   */
  resetShip(x = 0, y = 0, angle = 0) {
    this.ship.x = x;
    this.ship.y = y;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.ship.angle = angle;
    this.ship.isWallBoosting = false;
    this.ship.inTurbo = false;
    this.ship.inZeroThrust = false;
    this.ship.inWind = false;
    this.ship.lastCollisionType = 'none';
    this.ship.trail = [];
  }

  /**
   * Verifica se um ponto (x, y) está dentro dos limites da zona.
   * @param {number} x
   * @param {number} y
   * @param {object} zone
   * @returns {boolean}
   */
  _isPointInZone(x, y, zone) {
    if (!zone || !zone.bounds) return false;
    const b = zone.bounds;
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
  }

  /**
   * Executa um passo fixo da simulação física.
   *
   * @param {number} dt - Passo de tempo (ex: 1/60s)
   * @param {number} turnInput - Intenção de curva (-1 = esq, +1 = dir, 0 = neutro)
   * @param {Array} walls - Segmentos de parede da pista atual
   * @param {object} trackOptions - Opções da pista (gravity, zones)
   */
  step(dt, turnInput, walls = [], trackOptions = {}) {
    const opts = trackOptions || {};
    const ship = this.ship;
    const cfg = this.config;

    // 0. Processamento de Zonas Interativas e Gravidade (MECH-001, MECH-002, MECH-003, MECH-004, MECH-010)
    const gravity = typeof opts.gravity === 'number'
      ? opts.gravity
      : (typeof opts.gravity === 'object' && opts.gravity !== null ? (opts.gravity.y || 0) : 0);

    const zones = Array.isArray(opts.zones) ? opts.zones : [];
    const activeZoneTypes = new Set();
    let inZeroThrust = false;
    let inTurbo = false;
    let windForceX = 0;
    let windForceY = 0;
    let turboForce = 0;
    let turboDir = null;

    // Resolução de zonas (MECH-010: sem empilhamento indevido)
    for (const zone of zones) {
      if (this._isPointInZone(ship.x, ship.y, zone)) {
        activeZoneTypes.add(zone.type);

        if (zone.type === 'zeroThrust') {
          inZeroThrust = true;
        } else if (zone.type === 'wind' && zone.force) {
          windForceX += zone.force.x || 0;
          windForceY += zone.force.y || 0;
        } else if (zone.type === 'turbo') {
          inTurbo = true;
          const f = typeof zone.force === 'number' ? zone.force : 700;
          if (f > turboForce) {
            turboForce = f;
            turboDir = zone.direction || null;
          }
        }
      }
    }

    ship.inZeroThrust = inZeroThrust;
    ship.inTurbo = inTurbo;
    ship.inWind = (windForceX !== 0 || windForceY !== 0);

    // 1. Rotação suave (PHYS-004)
    ship.angle += turnInput * cfg.turnRate * dt;
    ship.angle = normalizeAngle(ship.angle);

    // 2. Propulsão automática contínua na direção da nave (PHYS-002, CTRL-003)
    // Se estiver em zona de vácuo / sem propulsão (MECH-004), o motor não gera empuxo
    if (!inZeroThrust) {
      const fwdX = Math.cos(ship.angle);
      const fwdY = Math.sin(ship.angle);
      ship.vx += fwdX * cfg.thrust * dt;
      ship.vy += fwdY * cfg.thrust * dt;
    }

    // 2.1 Gravidade vertical para baixo (MECH-001)
    if (gravity !== 0) {
      ship.vy += gravity * dt;
    }

    // 2.2 Força de vento ambiental (MECH-002)
    if (windForceX !== 0 || windForceY !== 0) {
      ship.vx += windForceX * dt;
      ship.vy += windForceY * dt;
    }

    // 2.3 Força de aceleração turbo (MECH-003)
    if (inTurbo && turboForce > 0) {
      if (turboDir) {
        ship.vx += turboDir.x * turboForce * dt;
        ship.vy += turboDir.y * turboForce * dt;
      } else {
        const fwdX = Math.cos(ship.angle);
        const fwdY = Math.sin(ship.angle);
        ship.vx += fwdX * turboForce * dt;
        ship.vy += fwdY * turboForce * dt;
      }
    }

    // 3. Arrasto aerodinâmico / atrito linear (PHYS-003)
    const dragFactor = Math.max(0, 1 - cfg.drag * dt);
    ship.vx *= dragFactor;
    ship.vy *= dragFactor;

    // 4. Limite de velocidade de cruzeiro normal vs boost/turbo
    let speed = Math.hypot(ship.vx, ship.vy);
    const maxSpeed = (ship.isWallBoosting || inTurbo) ? cfg.maxBoostSpeed : cfg.maxSpeed;
    if (speed > maxSpeed && speed > 1e-4) {
      const scale = maxSpeed / speed;
      ship.vx *= scale;
      ship.vy *= scale;
      speed = maxSpeed;
    }

    // 5. Integração de posição com subpassos de colisão (PHYS-009)
    const substeps = cfg.substeps || 4;
    const subDt = dt / substeps;
    let anyBoostInStep = false;
    let finalCollisionType = 'none';
    let totalContacts = 0;

    for (let s = 0; s < substeps; s++) {
      // Avanço de posição
      ship.x += ship.vx * subDt;
      ship.y += ship.vy * subDt;

      // Resolução de contato com paredes
      if (walls.length > 0) {
        const colResult = resolveWallCollisions(ship, walls, cfg, subDt);
        if (ship.isWallBoosting) anyBoostInStep = true;
        if (colResult.collisionType !== 'none') {
          finalCollisionType = colResult.collisionType;
        }
        totalContacts += colResult.contacts.length;
      }
    }

    ship.isWallBoosting = anyBoostInStep;
    ship.lastCollisionType = finalCollisionType;

    // 6. Atualiza histórico do rastro luminoso (trail)
    const maxTrailPoints = this.visualConfig.maxTrailPoints || 40;
    ship.trail.push({ x: ship.x, y: ship.y });
    if (ship.trail.length > maxTrailPoints) {
      ship.trail.shift();
    }

    // 7. Atualiza telemetria
    this.stats.speed = Math.hypot(ship.vx, ship.vy);
    this.stats.boostActive = ship.isWallBoosting;
    this.stats.inTurbo = inTurbo;
    this.stats.inZeroThrust = inZeroThrust;
    this.stats.inWind = ship.inWind;
    this.stats.gravity = gravity;
    this.stats.activeZones = Array.from(activeZoneTypes);
    this.stats.collisionType = finalCollisionType;
    this.stats.contactsCount = totalContacts;
  }
}
