/**
 * Testes unitários para Câmera 2D e responsividade de viewport (src/gameplay/camera.js).
 * Satisfaz: CAM-001, CAM-002, CAM-003, RESP-001, RESP-002, RESP-003, M3-07.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Camera2D } from '../src/gameplay/camera.js';

describe('Camera2D & Multi-Resolution Responsiveness (Marco M3, RESP-001..003, M3-07)', () => {
  it('initializes and resets correctly without jumping', () => {
    const camera = new Camera2D();
    assert.equal(camera.initialized, false);

    camera.reset(500, 300);
    assert.equal(camera.initialized, true);
    assert.equal(camera.x, 500);
    assert.equal(camera.y, 300);
  });

  it('follows ship position with look-ahead and lerp smoothing', () => {
    const camera = new Camera2D({ camera: { lerp: 0.1, leadFactor: 0.25, zoom: 1.0 } });
    camera.reset(0, 0);

    const ship = { x: 100, y: 50, vx: 200, vy: 0 };
    // Com vx = 200 e leadFactor = 0.25, o alvo look-ahead é x = 100 + 50 = 150
    camera.update(ship, 1920, 1080, 1 / 60);

    // Deve mover na direção do alvo suavemente via lerp
    assert.ok(camera.x > 0);
    assert.ok(camera.x <= 150);
    assert.ok(camera.y > 0);
  });

  it('adapts zoom appropriately across standard responsive viewports (M3-07)', () => {
    const camera = new Camera2D({ camera: { lerp: 0.1, leadFactor: 0.25, zoom: 1.0 } });
    camera.reset(0, 0);
    const ship = { x: 0, y: 0, vx: 0, vy: 0 };

    // 1. Mobile Retrato (iPhone 390×844)
    camera.update(ship, 390, 844, 1 / 60);
    assert.ok(camera.zoom <= 1.0);
    assert.ok(camera.zoom >= 0.65, 'Zoom não deve ficar menor que o piso de 0.65');
    assert.equal(Math.round(camera.zoom * 100) / 100, 0.65);

    // 2. Mobile Paisagem (iPhone 844×390)
    camera.update(ship, 844, 390, 1 / 60);
    assert.ok(camera.zoom <= 1.0);
    assert.ok(camera.zoom >= 0.65);

    // 3. Tablet (iPad 768×1024)
    camera.update(ship, 768, 1024, 1 / 60);
    assert.equal(camera.zoom, 1.0, 'Dimensão mínima >= 600px usa zoom nominal 1.0');

    // 4. Desktop Full HD (1920×1080)
    camera.update(ship, 1920, 1080, 1 / 60);
    assert.equal(camera.zoom, 1.0);

    // 5. Desktop Ultrawide (3440×1440)
    camera.update(ship, 3440, 1440, 1 / 60);
    assert.equal(camera.zoom, 1.0);
  });

  it('applies transform matrix to canvas context correctly without distorting world coordinates', () => {
    const camera = new Camera2D({ camera: { zoom: 1.0 } });
    camera.reset(400, 250);

    const callLog = [];
    const mockCtx = {
      translate(dx, dy) {
        callLog.push({ method: 'translate', dx, dy });
      },
      scale(sx, sy) {
        callLog.push({ method: 'scale', sx, sy });
      }
    };

    camera.applyTransform(mockCtx, 800, 600);

    assert.equal(callLog.length, 3);
    // 1: Translada para o centro da tela
    assert.deepEqual(callLog[0], { method: 'translate', dx: 400, dy: 300 });
    // 2: Aplica escala
    assert.deepEqual(callLog[1], { method: 'scale', sx: 1.0, sy: 1.0 });
    // 3: Translada pela posição inversa da câmera
    assert.deepEqual(callLog[2], { method: 'translate', dx: -400, dy: -250 });
  });
});
