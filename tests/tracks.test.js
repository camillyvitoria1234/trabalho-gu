import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS, getTrackById, getNextTrackId, validateTracks } from '../src/levels/tracks.js';

describe('Track Validator & Dataset (Marco M2)', () => {
  it('contains exactly 11 original tracks with diverse challenge types, keys, and collectibles (M4-01, M4-02)', () => {
    assert.equal(TRACKS.length, 11);

    const types = TRACKS.map((t) => t.type);
    assert.ok(types.includes('linear'), 'must include linear track');
    assert.ok(types.includes('circuit'), 'must include circuit track with laps');
    assert.ok(types.includes('timeAttack'), 'must include time attack track');
    assert.ok(types.includes('collect'), 'must include collect track (M4-02, MECH-015)');

    // Verifica presença de mecânicas de gravidade, vento, turbo e vácuo (MECH-001..004)
    const hasGravity = TRACKS.some((t) => t.gravity && t.gravity > 0);
    assert.ok(hasGravity, 'must have track with gravity (MECH-001)');

    const allZones = TRACKS.flatMap((t) => t.zones || []);
    assert.ok(allZones.some((z) => z.type === 'wind'), 'must have wind zones (MECH-002)');
    assert.ok(allZones.some((z) => z.type === 'turbo'), 'must have turbo zones (MECH-003)');
    assert.ok(allZones.some((z) => z.type === 'zeroThrust'), 'must have zero-thrust/vacuum zones (MECH-004)');

    // Verifica presença de chaves e portas (MECH-013)
    const hasKeys = TRACKS.some((t) => Array.isArray(t.keys) && t.keys.length > 0);
    const hasDoors = TRACKS.some((t) => Array.isArray(t.doors) && t.doors.length > 0);
    assert.ok(hasKeys, 'must have tracks with keys (MECH-013)');
    assert.ok(hasDoors, 'must have tracks with laser doors (MECH-013)');
  });

  it('validates that all 11 tracks pass data integrity validation (LEVEL-012)', () => {
    const result = validateTracks(TRACKS);
    assert.equal(result.valid, true, `Validation errors: ${result.errors.join('; ')}`);
    assert.equal(result.errors.length, 0);
  });

  it('detects corrupted or duplicate track data', () => {
    // Pista com ID duplicado
    const duplicates = [
      { id: 'dup', spawn: { x: 0, y: 0 }, finishLine: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, walls: [{ a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }, { a: { x: 2, y: 2 }, b: { x: 0, y: 0 } }] },
      { id: 'dup', spawn: { x: 0, y: 0 }, finishLine: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, walls: [{ a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }, { a: { x: 2, y: 2 }, b: { x: 0, y: 0 } }] }
    ];
    const dupRes = validateTracks(duplicates);
    assert.equal(dupRes.valid, false);
    assert.ok(dupRes.errors.some((e) => e.includes('duplicado')));

    // Pista sem paredes suficientes
    const badWalls = [
      { id: 'bad', spawn: { x: 0, y: 0 }, finishLine: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, walls: [] }
    ];
    const wallRes = validateTracks(badWalls);
    assert.equal(wallRes.valid, false);
    assert.ok(wallRes.errors.some((e) => e.includes('insuficientes')));

    // Porta com keyId inexistente
    const badDoor = [
      {
        id: 'bad-door-track',
        spawn: { x: 0, y: 0 },
        finishLine: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } },
        walls: [{ a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }, { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } }, { a: { x: 2, y: 2 }, b: { x: 0, y: 0 } }],
        keys: [{ id: 'key-1', x: 10, y: 10 }],
        doors: [{ id: 'door-1', keyId: 'key-NONEXISTENT', wall: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } } }]
      }
    ];
    const doorRes = validateTracks(badDoor);
    assert.equal(doorRes.valid, false);
    assert.ok(doorRes.errors.some((e) => e.includes('keyId inexistente')));
  });

  it('retrieves track by ID and computes next track sequentially', () => {
    const t1 = getTrackById('track-01-proto');
    assert.ok(t1);
    assert.equal(t1.id, 'track-01-proto');

    const nextId1 = getNextTrackId('track-01-proto');
    assert.equal(nextId1, 'track-02-arc');

    const lastId = TRACKS[TRACKS.length - 1].id;
    assert.equal(getNextTrackId(lastId), null);
  });

  it('validates track 1 finish line geometry and perpendicularity', () => {
    const t1 = getTrackById('track-01-proto');
    assert.ok(t1);

    // Linha de chegada conecta (2102, 428) a (2200, 550)
    assert.equal(t1.finishLine.a.x, 2102);
    assert.equal(t1.finishLine.a.y, 428);
    assert.equal(t1.finishLine.b.x, 2200);
    assert.equal(t1.finishLine.b.y, 550);

    // Parede superior final termina exatamente no ponto 'a' da linha de chegada
    const topWall = t1.walls.find((w) => w.b.x === 2102 && w.b.y === 428);
    assert.ok(topWall, 'top wall must end precisely at finish line point a');

    // Parede inferior final termina exatamente no ponto 'b' da linha de chegada
    const bottomWall = t1.walls.find((w) => w.b.x === 2200 && w.b.y === 550);
    assert.ok(bottomWall, 'bottom wall must end precisely at finish line point b');

    // Perpendicularidade: produto escalar entre o vetor do corredor e a linha de chegada deve ser próximo de 0
    const corridorDir = { x: topWall.b.x - topWall.a.x, y: topWall.b.y - topWall.a.y };
    const finishDir = { x: t1.finishLine.b.x - t1.finishLine.a.x, y: t1.finishLine.b.y - t1.finishLine.a.y };
    const dot = corridorDir.x * finishDir.x + corridorDir.y * finishDir.y;
    const len1 = Math.hypot(corridorDir.x, corridorDir.y);
    const len2 = Math.hypot(finishDir.x, finishDir.y);
    const cosAngle = Math.abs(dot) / (len1 * len2);
    assert.ok(cosAngle < 0.05, `Finish line must be perpendicular to track 1 corridor (cos angle: ${cosAngle})`);
  });

  it('validates track 2 finish line geometry and horizontal orientation', () => {
    const t2 = getTrackById('track-02-arc');
    assert.ok(t2);

    // A linha deve ser estritamente horizontal conectando a parede esquerda (1650) à direita (1900)
    assert.equal(t2.finishLine.a.y, t2.finishLine.b.y, 'track 2 finish line must be horizontal');
    assert.equal(t2.finishLine.a.x, 1650, 'left point must touch left wall at x=1650');
    assert.equal(t2.finishLine.b.x, 1900, 'right point must touch right wall at x=1900');
    assert.equal(t2.finishLine.a.y, 950, 'finish line y must match wall end at y=950');

    // Parede esquerda termina em (1650, 950)
    const leftWall = t2.walls.find((w) => w.b.x === 1650 && w.b.y === 950);
    assert.ok(leftWall, 'left wall must terminate at finish line left anchor');

    // Parede direita termina em (1900, 950)
    const rightWall = t2.walls.find((w) => w.b.x === 1900 && w.b.y === 950);
    assert.ok(rightWall, 'right wall must terminate at finish line right anchor');
  });
});
