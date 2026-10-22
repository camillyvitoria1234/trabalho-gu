/**
 * Câmera 2D com suavização (lerp) e antecipação de velocidade (look-ahead).
 * Satisfaz: CAM-001, CAM-002, CAM-003, RESP-002, RESP-003.
 */

import { lerp } from '../core/math.js';

export class Camera2D {
  constructor(config = {}) {
    this.config = config.camera || { lerp: 0.1, leadFactor: 0.25, zoom: 1.0 };

    this.x = 0;
    this.y = 0;
    this.zoom = this.config.zoom || 1.0;
    this.initialized = false;
  }

  reset(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.initialized = true;
  }

  /**
   * Atualiza o foco da câmera em direção à nave com antecipação (look-ahead).
   *
   * @param {Object} ship - Nave com {x, y, vx, vy}
   * @param {number} width - Largura da viewport em CSS pixels
   * @param {number} height - Altura da viewport em CSS pixels
   * @param {number} dt - Intervalo de tempo
   */
  update(ship, width, height, dt) {
    if (!this.initialized) {
      this.reset(ship.x, ship.y);
      return;
    }

    // Adaptação de zoom responsiva: garante campo de visão seguro em telas móveis/retrato (RESP-001, RESP-009)
    const minDim = Math.min(width, height);
    const baseZoom = this.config.zoom || 1.0;
    if (minDim > 0 && minDim < 600) {
      this.zoom = Math.max(0.65, baseZoom * (minDim / 600));
    } else {
      this.zoom = baseZoom;
    }

    const leadFactor = this.config.leadFactor || 0.25;
    const targetX = ship.x + ship.vx * leadFactor;
    const targetY = ship.y + ship.vy * leadFactor;

    // Fator de suavização independente de framerate
    const lerpRate = this.config.lerp || 0.1;
    const factor = 1 - Math.pow(1 - lerpRate, dt * 60);

    this.x = lerp(this.x, targetX, factor);
    this.y = lerp(this.y, targetY, factor);
  }

  /**
   * Aplica a translação e escala da câmera ao contexto 2D do Canvas.
   */
  applyTransform(ctx, width, height) {
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }
}
