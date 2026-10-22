/**
 * Testes unitários para Missões, Chaves/Portas e Colecionáveis (MECH-006, MECH-013, MECH-015, M4-02).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PhysicsEngine } from '../src/physics/engine.js';
import { CONFIG } from '../src/config.js';
import { checkSegmentIntersection } from '../src/physics/collision.js';

describe('Mission Mechanics, Keys, Doors and Collectibles (Marco M4, MECH-006, MECH-013, MECH-015)', () => {
  it('closed laser doors function as solid colliders blocking passage', () => {
    const physics = new PhysicsEngine(CONFIG);
    // Posiciona a nave a 10px da porta laser vertical em x=500
    physics.resetShip(485, 300, 0);
    physics.ship.vx = 400; // alta velocidade em direção à porta

    const door = {
      id: 'door-1',
      keyId: 'key-1',
      wall: { a: { x: 500, y: 100 }, b: { x: 500, y: 500 } }
    };
    const activeWalls = [door.wall];

    // Executa passo de física contra a porta fechada
    physics.step(1 / 60, 0, activeWalls, null);

    // Deve sofrer colisão frontal com penalidade de velocidade e não atravessar x=500
    assert.equal(physics.stats.collisionType, 'frontal');
    assert.ok(physics.ship.x < 500, `Ship x (${physics.ship.x}) deve permanecer antes da porta (500)`);
    assert.ok(physics.stats.speed < 400, 'Velocidade deve ser reduzida no impacto com a porta fechada');
  });

  it('collecting a key removes door from active colliders allowing free passage', () => {
    const openDoors = new Set();
    const collectedKeys = new Set();

    const track = {
      keys: [{ id: 'key-alpha', x: 200, y: 300, radius: 18 }],
      doors: [{ id: 'door-alpha', keyId: 'key-alpha', wall: { a: { x: 500, y: 100 }, b: { x: 500, y: 500 } } }],
      walls: [{ a: { x: 0, y: 0 }, b: { x: 1000, y: 0 } }]
    };

    function getActiveWalls() {
      const walls = [...track.walls];
      for (const d of track.doors) {
        if (!openDoors.has(d.id)) {
          walls.push(d.wall);
        }
      }
      return walls;
    }

    // Antes da chave: porta está ativa
    assert.equal(getActiveWalls().length, 2);

    // Simula coleta da chave pelo jogador
    const shipPos = { x: 205, y: 300, radius: 10 };
    const key = track.keys[0];
    const dist = Math.hypot(shipPos.x - key.x, shipPos.y - key.y);

    if (dist < shipPos.radius + key.radius) {
      collectedKeys.add(key.id);
      for (const d of track.doors) {
        if (d.keyId === key.id) {
          openDoors.add(d.id);
        }
      }
    }

    assert.equal(collectedKeys.has('key-alpha'), true);
    assert.equal(openDoors.has('door-alpha'), true);

    // Após a chave: porta foi desativada dos colisores
    const wallsAfter = getActiveWalls();
    assert.equal(wallsAfter.length, 1);
    assert.equal(wallsAfter[0], track.walls[0]);
  });

  it('validates collection requirement for collect-type tracks (MECH-015, M4-02)', () => {
    const track = {
      type: 'collect',
      requireAllCollectibles: true,
      collectibles: [
        { id: 'frag-1', x: 200, y: 200, radius: 15 },
        { id: 'frag-2', x: 400, y: 200, radius: 15 },
        { id: 'frag-3', x: 600, y: 200, radius: 15 }
      ],
      finishLine: { a: { x: 800, y: 100 }, b: { x: 800, y: 300 } }
    };

    const collected = new Set(['frag-1', 'frag-2']);
    const prevShip = { x: 790, y: 200 };
    const curShip = { x: 810, y: 200 };

    const crossed = checkSegmentIntersection(prevShip, curShip, track.finishLine.a, track.finishLine.b);
    assert.equal(crossed, true);

    // Faltando 1 fragmento: não deve permitir vitória
    const canFinishIncomplete = collected.size >= track.collectibles.length;
    assert.equal(canFinishIncomplete, false);

    // Com todos os fragmentos: vitória permitida
    collected.add('frag-3');
    const canFinishComplete = collected.size >= track.collectibles.length;
    assert.equal(canFinishComplete, true);
  });
});
