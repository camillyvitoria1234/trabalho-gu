import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { PhysicsEngine } from '../src/physics/engine.js';
import { resolveWallCollisions, checkSegmentIntersection } from '../src/physics/collision.js';

describe('PhysicsEngine and Wall Collision', () => {
  it('accelerates forward and applies drag over time', () => {
    const engine = new PhysicsEngine(CONFIG);
    engine.resetShip(0, 0, 0); // Ângulo 0 = apontando para +X

    // Passo inicial de 1/60s sem virar (turn = 0)
    engine.step(1 / 60, 0, []);

    // A nave deve ter se movido para a direita (+X)
    assert.ok(engine.ship.vx > 0, 'vx should be positive after thrust');
    assert.equal(engine.ship.vy, 0, 'vy should remain 0 when heading +X');
    assert.ok(engine.ship.x > 0, 'x position should have increased');

    // Executa mais 30 passos
    for (let i = 0; i < 30; i++) {
      engine.step(1 / 60, 0, []);
    }
    const speedAfter30 = engine.stats.speed;
    assert.ok(speedAfter30 > 100, 'speed should build up gradually with inertia');
    assert.ok(speedAfter30 <= CONFIG.physics.maxSpeed, 'speed should not exceed maxSpeed without boost');
  });

  it('rotates ship when turn input is provided', () => {
    const engine = new PhysicsEngine(CONFIG);
    engine.resetShip(0, 0, 0);

    // Vira para a direita (+1) por 10 passos (1/6 de segundo)
    const dt = 1 / 60;
    for (let i = 0; i < 10; i++) {
      engine.step(dt, 1, []);
    }

    assert.ok(engine.ship.angle > 0, 'angle should increase when turning right');
  });

  it('penalizes speed on frontal wall collision', () => {
    const engine = new PhysicsEngine(CONFIG);
    // Parede vertical em X = 100, de Y = -200 a Y = 200
    const walls = [{ a: { x: 100, y: -200 }, b: { x: 100, y: 200 } }];

    // Nave apontando diretamente para a parede (+X) com alta velocidade
    engine.resetShip(90, 0, 0);
    engine.ship.vx = 400;
    engine.ship.vy = 0;

    engine.step(1 / 60, 0, walls);

    // Não deve atravessar a parede (X deve ser <= 100 - raio)
    assert.ok(engine.ship.x <= 100, 'ship must not penetrate through the wall');
    // Deve ser classificada como colisão frontal
    assert.equal(engine.ship.lastCollisionType, 'frontal');
    // Não deve ativar wall boost
    assert.equal(engine.ship.isWallBoosting, false);
    // Velocidade deve ser bastante reduzida
    assert.ok(engine.stats.speed < 400, 'speed should be penalized on frontal impact');
  });

  it('activates wall thrust boost on tangential scraping', () => {
    const engine = new PhysicsEngine(CONFIG);
    // Parede horizontal em Y = 10, de X = 0 a X = 500
    const walls = [{ a: { x: 0, y: 10 }, b: { x: 500, y: 10 } }];

    // Nave posicionada raspando a parede (Y = 0 com raio 10 toca a parede em Y = 10)
    // Ângulo quase paralelo (5 graus = ~0.087 rad)
    engine.resetShip(50, 0.5, 0.05);
    engine.ship.vx = 300;
    engine.ship.vy = 5;

    const initialSpeed = Math.hypot(engine.ship.vx, engine.ship.vy);
    engine.step(1 / 60, 0, walls);

    // Deve detectar raspagem e ativar boost
    assert.equal(engine.ship.lastCollisionType, 'scrape');
    assert.equal(engine.ship.isWallBoosting, true);
    // Velocidade deve ter aumentado devido ao wall thrust
    const finalSpeed = Math.hypot(engine.ship.vx, engine.ship.vy);
    assert.ok(finalSpeed > initialSpeed, 'tangential scraping should accelerate the ship via wall thrust');
  });

  it('prevents tunneling in high speeds through substeps', () => {
    const engine = new PhysicsEngine(CONFIG);
    // Parede vertical fina em X = 50
    const walls = [{ a: { x: 50, y: -100 }, b: { x: 50, y: 100 } }];

    // Nave se movendo a 1000 px/s em direção à parede, partindo de X = 40
    engine.resetShip(40, 0, 0);
    engine.ship.vx = 1000;
    engine.ship.vy = 0;

    engine.step(1 / 60, 0, walls);

    // Com substeps = 4, a nave não deve ter passado de X = 50
    assert.ok(engine.ship.x <= 50, 'ship must not tunnel through wall at high speed');
  });

  it('detects normal finish line crossing for track 1', () => {
    // Finish line da Fase 1: (2102, 428) a (2200, 550)
    const finishLine = { a: { x: 2102, y: 428 }, b: { x: 2200, y: 550 } };

    // Nave subindo o corredor final de (2050, 520) até (2160, 470)
    const prevPos = { x: 2050, y: 520 };
    const currPos = { x: 2160, y: 470 };

    const crossed = checkSegmentIntersection(prevPos, currPos, finishLine.a, finishLine.b);
    assert.equal(crossed, true, 'ship moving through track 1 final corridor must cross finish line');
  });

  it('detects normal finish line crossing for track 2', () => {
    // Finish line da Fase 2: (1650, 950) a (1900, 950)
    const finishLine = { a: { x: 1650, y: 950 }, b: { x: 1900, y: 950 } };

    // Nave descendo o corredor vertical de (1775, 920) até (1775, 970)
    const prevPos = { x: 1775, y: 920 };
    const currPos = { x: 1775, y: 970 };

    const crossed = checkSegmentIntersection(prevPos, currPos, finishLine.a, finishLine.b);
    assert.equal(crossed, true, 'ship descending track 2 final corridor must cross horizontal finish line');
  });

  it('applies environmental gravity pulling ship downward (MECH-001)', () => {
    const engine = new PhysicsEngine(CONFIG);
    // Nave parada apontando horizontalmente (angle = 0)
    engine.resetShip(100, 100, 0);
    engine.ship.vx = 0;
    engine.ship.vy = 0;

    // Step com gravidade de 400 px/s²
    engine.step(1 / 60, 0, [], { gravity: 400 });

    assert.ok(engine.ship.vy > 0, 'ship vy must become positive due to downward gravity');
    assert.equal(engine.stats.gravity, 400);
  });

  it('applies wind zone force when inside bounds and stops when outside (MECH-002, MECH-010)', () => {
    const engine = new PhysicsEngine(CONFIG);
    const windZone = {
      id: 'w1',
      type: 'wind',
      bounds: { x: 50, y: 50, width: 100, height: 100 },
      force: { x: 0, y: -500 } // Vento ascendente
    };

    // Nave dentro da zona de vento
    engine.resetShip(80, 80, 0);
    engine.ship.vx = 0;
    engine.ship.vy = 0;

    engine.step(1 / 60, 0, [], { zones: [windZone] });
    assert.ok(engine.ship.vy < 0, 'ship vy must become negative due to upward wind');
    assert.equal(engine.stats.inWind, true);
    assert.ok(engine.stats.activeZones.includes('wind'));

    // Nave fora da zona de vento
    engine.resetShip(200, 200, 0);
    engine.step(1 / 60, 0, [], { zones: [windZone] });
    assert.equal(engine.stats.inWind, false);
    assert.ok(!engine.stats.activeZones.includes('wind'));
  });

  it('accelerates ship in turbo zone and allows exceeding normal max speed (MECH-003)', () => {
    const engine = new PhysicsEngine(CONFIG);
    const turboZone = {
      id: 'tb1',
      type: 'turbo',
      bounds: { x: 0, y: 0, width: 200, height: 200 },
      force: 800
    };

    engine.resetShip(50, 50, 0);
    // Define velocidade já no limite normal de cruzeiro
    engine.ship.vx = CONFIG.physics.maxSpeed;
    engine.ship.vy = 0;

    engine.step(1 / 60, 0, [], { zones: [turboZone] });
    assert.equal(engine.ship.inTurbo, true);
    assert.equal(engine.stats.inTurbo, true);
    // Em turbo, a velocidade pode ultrapassar o limite normal de cruzeiro (até maxBoostSpeed)
    assert.ok(engine.stats.speed >= CONFIG.physics.maxSpeed);
    assert.ok(engine.stats.speed <= CONFIG.physics.maxBoostSpeed);
  });

  it('disables engine acceleration in zero-thrust zone while preserving inertia (MECH-004)', () => {
    const engine = new PhysicsEngine(CONFIG);
    const vacuumZone = {
      id: 'zt1',
      type: 'zeroThrust',
      bounds: { x: 0, y: 0, width: 200, height: 200 }
    };

    // Nave em repouso dentro da zona de vácuo
    engine.resetShip(50, 50, 0);
    engine.ship.vx = 0;
    engine.ship.vy = 0;

    engine.step(1 / 60, 0, [], { zones: [vacuumZone] });
    // Sem propulsão, a nave continua parada (vx = 0, vy = 0)
    assert.equal(engine.ship.inZeroThrust, true);
    assert.equal(engine.ship.vx, 0);
    assert.equal(engine.ship.vy, 0);

    // Agora com velocidade inicial (inércia pura): deve manter velocidade sofrendo apenas arrasto linear
    engine.ship.vx = 300;
    engine.step(1 / 60, 0, [], { zones: [vacuumZone] });
    // Sem propulsão adicionando força, a velocidade diminui suavemente apenas pelo arrasto
    assert.ok(engine.ship.vx < 300, 'ship only experiences drag without engine thrust');
    assert.ok(engine.ship.vx > 250, 'ship preserves momentum through inertia');
  });

  it('handles overlapping zones cleanly without force duplication (MECH-010)', () => {
    const engine = new PhysicsEngine(CONFIG);
    const turbo1 = { id: 't1', type: 'turbo', bounds: { x: 0, y: 0, width: 100, height: 100 }, force: 700 };
    const turbo2 = { id: 't2', type: 'turbo', bounds: { x: 50, y: 50, width: 100, height: 100 }, force: 700 };

    engine.resetShip(60, 60, 0);
    engine.step(1 / 60, 0, [], { zones: [turbo1, turbo2] });

    // activeZones deve conter apenas uma entrada do tipo 'turbo'
    assert.equal(engine.stats.activeZones.filter((z) => z === 'turbo').length, 1);
  });
});

