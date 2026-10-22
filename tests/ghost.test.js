/**
 * Testes unitários para o sistema de fantasmas e replay (src/gameplay/ghost.js).
 * Satisfaz: RACE-004, RACE-012, M3-04.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GhostRecorder, GhostPlayer, validateGhostData, GHOST_DATA_VERSION } from '../src/gameplay/ghost.js';

describe('Ghost System & Replay Benchmark (Marco M3)', () => {
  it('records trajectory points at specified sample intervals', () => {
    const recorder = new GhostRecorder(0.05);
    recorder.start('track-01-proto', 100, 200, 0);

    // Passo menor que o intervalo de amostragem: não deve gravar novo snapshot
    recorder.record(0.02, 110, 200, 0.1);
    assert.equal(recorder.points.length, 1);

    // Próximo passo atinge 0.05s: grava snapshot
    recorder.record(0.035, 120, 200, 0.2);
    assert.equal(recorder.points.length, 2);
    assert.equal(recorder.points[1].x, 120);

    // Finaliza a gravação aos 0.1s
    const ghostData = recorder.finish(0.1, 150, 200, 0.5);
    assert.ok(ghostData);
    assert.equal(ghostData.version, GHOST_DATA_VERSION);
    assert.equal(ghostData.trackId, 'track-01-proto');
    assert.equal(ghostData.duration, 0.1);
    assert.ok(ghostData.points.length >= 3);
  });

  it('interpolates positions and angles smoothly during playback', () => {
    const sampleData = {
      version: 1,
      trackId: 'track-01-proto',
      duration: 1.0,
      sampleInterval: 0.5,
      points: [
        { t: 0.0, x: 0, y: 0, a: 0 },
        { t: 0.5, x: 100, y: 50, a: 1.0 },
        { t: 1.0, x: 200, y: 100, a: 2.0 }
      ]
    };

    const player = new GhostPlayer(sampleData);
    assert.equal(player.state.active, true);

    // Posição no tempo 0
    player.update(0);
    assert.equal(player.state.x, 0);
    assert.equal(player.state.y, 0);

    // Meio do primeiro intervalo (t = 0.25) -> interpola linearmente para (50, 25)
    player.update(0.25);
    assert.equal(player.state.x, 50);
    assert.equal(player.state.y, 25);
    assert.ok(Math.abs(player.state.angle - 0.5) < 0.001);

    // No término (t = 1.0)
    player.update(1.0);
    assert.equal(player.state.x, 200);
    assert.equal(player.state.y, 100);
    assert.equal(player.state.finished, true);

    // Após o término (t = 1.5) -> mantém a posição final
    player.update(1.5);
    assert.equal(player.state.x, 200);
    assert.equal(player.state.y, 100);
    assert.equal(player.state.finished, true);
  });

  it('handles angular interpolation wrapping cleanly across PI boundaries', () => {
    const sampleData = {
      version: 1,
      trackId: 'track-01-proto',
      duration: 1.0,
      points: [
        { t: 0.0, x: 0, y: 0, a: 3.0 }, // ~171 graus
        { t: 1.0, x: 10, y: 10, a: -3.0 } // ~ -171 graus (distância curta de ~18 graus através da fronteira)
      ]
    };

    const player = new GhostPlayer(sampleData);
    player.update(0.5);

    // Ao invés de girar 342 graus no sentido longo, deve interpolar pelo caminho mais curto
    assert.ok(Math.abs(player.state.angle) > 2.5);
  });

  it('validates ghost data format and detects corrupted inputs', () => {
    const valid = {
      version: 1,
      trackId: 'track-01-proto',
      duration: 5.2,
      points: [{ t: 0, x: 1, y: 2, a: 0 }]
    };
    assert.equal(validateGhostData(valid).valid, true);

    const missingTrack = { duration: 5.2, points: [{ t: 0, x: 1, y: 2, a: 0 }] };
    assert.equal(validateGhostData(missingTrack).valid, false);

    const emptyPoints = { trackId: 't1', duration: 5.2, points: [] };
    assert.equal(validateGhostData(emptyPoints).valid, false);

    const badDuration = { trackId: 't1', duration: -1, points: [{ t: 0, x: 1, y: 2, a: 0 }] };
    assert.equal(validateGhostData(badDuration).valid, false);
  });

  it('supports cancellation and reset without throwing', () => {
    const recorder = new GhostRecorder();
    recorder.start('t1', 0, 0, 0);
    recorder.record(0.1, 10, 10, 0);
    recorder.cancel();
    assert.equal(recorder.isRecording, false);
    assert.equal(recorder.points.length, 0);

    const player = new GhostPlayer(null);
    assert.equal(player.state.active, false);
    player.update(5.0);
    assert.equal(player.state.active, false);
  });
});
