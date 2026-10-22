/**
 * Sistema de Corredor-Fantasma (Ghost Racer) e Replay Pessoal.
 * Satisfaz: RACE-004, RACE-012, M3-04.
 *
 * Características:
 * - Gravação periódica de alta performance (20Hz / 0.05s) sem alocação desnecessária por frame.
 * - Interpolação suave em reprodução com menor arco angular.
 * - Não interfere na física ou colisão da nave do jogador (RACE-012).
 * - Formato compacto e versionado com validação defensiva.
 */

import { lerp, normalizeAngle } from '../core/math.js';

export const GHOST_DATA_VERSION = 1;
export const DEFAULT_SAMPLE_INTERVAL = 0.05; // 20 amostras por segundo

/**
 * Valida os dados de telemetria de um fantasma.
 * @param {object} data
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateGhostData(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Dados de ghost inválidos ou nulos'] };
  }

  if (typeof data.trackId !== 'string' || !data.trackId) {
    errors.push('Campo trackId ausente ou inválido');
  }

  if (typeof data.duration !== 'number' || data.duration <= 0) {
    errors.push('Campo duration deve ser um número positivo');
  }

  if (!Array.isArray(data.points) || data.points.length === 0) {
    errors.push('Array points vazio ou ausente');
  } else {
    const first = data.points[0];
    if (typeof first.t !== 'number' || typeof first.x !== 'number' || typeof first.y !== 'number' || typeof first.a !== 'number') {
      errors.push('Estrutura de snapshot inválida (deve conter {t, x, y, a})');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Grava a telemetria do jogador durante uma corrida.
 */
export class GhostRecorder {
  constructor(sampleInterval = DEFAULT_SAMPLE_INTERVAL) {
    this.sampleInterval = sampleInterval;
    this.trackId = null;
    this.elapsedTime = 0;
    this.lastSampleTime = -Infinity;
    this.points = [];
    this.isRecording = false;
  }

  /**
   * Inicia ou reinicia uma gravação para a fase indicada.
   * @param {string} trackId
   * @param {number} startX
   * @param {number} startY
   * @param {number} startAngle
   */
  start(trackId, startX = 0, startY = 0, startAngle = 0) {
    this.trackId = trackId;
    this.elapsedTime = 0;
    this.lastSampleTime = 0;
    this.points = [{ t: 0, x: startX, y: startY, a: startAngle }];
    this.isRecording = true;
  }

  /**
   * Registra um frame de simulação.
   * @param {number} dt - Delta time do passo de física
   * @param {number} x
   * @param {number} y
   * @param {number} angle
   */
  record(dt, x, y, angle) {
    if (!this.isRecording) return;

    this.elapsedTime += dt;

    if (this.elapsedTime - this.lastSampleTime >= this.sampleInterval) {
      this.points.push({
        t: Math.round(this.elapsedTime * 1000) / 1000,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        a: Math.round(angle * 1000) / 1000
      });
      this.lastSampleTime = this.elapsedTime;
    }
  }

  /**
   * Finaliza a gravação inserindo o ponto exato da chegada.
   * @param {number} finalTime
   * @param {number} x
   * @param {number} y
   * @param {number} angle
   * @returns {object|null} Dados do ghost gravado
   */
  finish(finalTime, x, y, angle) {
    if (!this.isRecording) return null;

    this.isRecording = false;
    const duration = Math.max(finalTime, this.elapsedTime);

    // Garante snapshot no momento exato do término
    this.points.push({
      t: Math.round(duration * 1000) / 1000,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      a: Math.round(angle * 1000) / 1000
    });

    return {
      version: GHOST_DATA_VERSION,
      trackId: this.trackId,
      duration: Math.round(duration * 1000) / 1000,
      sampleInterval: this.sampleInterval,
      points: this.points
    };
  }

  cancel() {
    this.isRecording = false;
    this.points = [];
  }
}

/**
 * Reproduz a trajetória gravada de forma desacoplada e interpolada.
 */
export class GhostPlayer {
  constructor(ghostData = null) {
    this.ghostData = null;
    this.currentIndex = 0;
    this.state = {
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      finished: false
    };

    if (ghostData) {
      this.load(ghostData);
    }
  }

  load(ghostData) {
    const val = validateGhostData(ghostData);
    if (!val.valid) {
      this.ghostData = null;
      this.state.active = false;
      return false;
    }

    this.ghostData = ghostData;
    this.reset();
    return true;
  }

  reset() {
    this.currentIndex = 0;
    if (this.ghostData && this.ghostData.points.length > 0) {
      const p0 = this.ghostData.points[0];
      this.state.active = true;
      this.state.x = p0.x;
      this.state.y = p0.y;
      this.state.angle = p0.a;
      this.state.finished = false;
    } else {
      this.state.active = false;
    }
  }

  /**
   * Atualiza a posição do fantasma para o timestamp atual da corrida.
   * Utiliza cursor incremental e interpolação linear suave.
   *
   * @param {number} currentTime
   * @returns {object} Estado atual do fantasma { active, x, y, angle, finished }
   */
  update(currentTime) {
    if (!this.ghostData || !this.state.active) {
      return this.state;
    }

    const points = this.ghostData.points;
    const len = points.length;

    if (currentTime <= 0 || len === 1) {
      this.state.x = points[0].x;
      this.state.y = points[0].y;
      this.state.angle = points[0].a;
      this.state.finished = false;
      return this.state;
    }

    if (currentTime >= this.ghostData.duration) {
      const last = points[len - 1];
      this.state.x = last.x;
      this.state.y = last.y;
      this.state.angle = last.a;
      this.state.finished = true;
      return this.state;
    }

    // Avança o cursor para encontrar o segmento [pA, pB]
    while (this.currentIndex < len - 2 && points[this.currentIndex + 1].t < currentTime) {
      this.currentIndex++;
    }
    while (this.currentIndex > 0 && points[this.currentIndex].t > currentTime) {
      this.currentIndex--;
    }

    const pA = points[this.currentIndex];
    const pB = points[this.currentIndex + 1] || pA;

    const segmentDuration = pB.t - pA.t;
    let factor = 0;
    if (segmentDuration > 0.0001) {
      factor = Math.max(0, Math.min(1, (currentTime - pA.t) / segmentDuration));
    }

    // Interpolação linear da posição
    this.state.x = lerp(pA.x, pB.x, factor);
    this.state.y = lerp(pA.y, pB.y, factor);

    // Interpolação angular suave pelo menor arco
    let diff = pB.a - pA.a;
    diff = normalizeAngle(diff);
    this.state.angle = pA.a + diff * factor;
    this.state.finished = false;

    return this.state;
  }
}
