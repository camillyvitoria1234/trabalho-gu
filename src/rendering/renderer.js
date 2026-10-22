/**
 * Renderizador Canvas 2D Neon de alta performance com trilhas digitais e partículas.
 * Satisfaz: VIS-001, VIS-002, VIS-003, VIS-004, VIS-005, VIS-008, VIS-009, RESP-001, RESP-002.
 */

export class NeonRenderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.visual = config.visual;

    this.dpr = 1;
    this.cssWidth = 0;
    this.cssHeight = 0;

    // Sistema de partículas limitadas por orçamento (VIS-005)
    this.particles = [];
    this.maxParticles = this.visual.maxParticles || 120;

    this.showDebug = false;
  }

  resize() {
    // Limita o DPR a no máximo 2 para preservar desempenho em telas móveis densas (RESP-002)
    const rawDpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.dpr = Math.min(rawDpr, 2);

    this.cssWidth = this.canvas.clientWidth || window.innerWidth || 800;
    this.cssHeight = this.canvas.clientHeight || window.innerHeight || 600;

    this.canvas.width = Math.floor(this.cssWidth * this.dpr);
    this.canvas.height = Math.floor(this.cssHeight * this.dpr);
  }

  addSpark(x, y, vx, vy, color, life = 0.4) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x,
      y,
      vx,
      vy,
      color,
      maxLife: life,
      life
    });
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
    }
  }

  render(camera, track, physicsEngine, dt, ghostState = null, missionState = null) {
    const ctx = this.ctx;
    const ship = physicsEngine.ship;
    const stats = physicsEngine.stats;

    this.updateParticles(dt);

    // Efeito de partículas ao raspar na parede com boost
    if (ship.isWallBoosting) {
      const angleOpposite = ship.angle + Math.PI + (Math.random() - 0.5) * 0.8;
      const sparkSpeed = 100 + Math.random() * 200;
      this.addSpark(
        ship.x - Math.cos(ship.angle) * ship.radius,
        ship.y - Math.sin(ship.angle) * ship.radius,
        Math.cos(angleOpposite) * sparkSpeed,
        Math.sin(angleOpposite) * sparkSpeed,
        this.visual.boostParticleColor || '#39ff14',
        0.35
      );
    }

    // Reset de transformação e escala do DPR
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Limpeza de fundo
    ctx.fillStyle = this.visual.bgColor || '#080811';
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    // Salvar contexto antes da câmera
    ctx.save();
    camera.applyTransform(ctx, this.cssWidth, this.cssHeight);

    // 1. Grade de fundo sutil no espaço de mundo
    this.drawGrid(ctx, camera);

    // 1.5 Zonas interativas (turbo, vento, vácuo) e Checkpoints (MECH-009, VIS-009)
    if (track && track.zones) {
      this.drawZones(ctx, track.zones);
    }
    if (track && track.checkpoints) {
      this.drawCheckpoints(ctx, track.checkpoints);
    }

    // 1.8 Chaves, portas e colecionáveis (MECH-013, MECH-015, M4-02)
    if (track && track.doors) {
      this.drawDoors(ctx, track.doors, missionState?.openDoors);
    }
    if (track && track.keys) {
      this.drawKeys(ctx, track.keys, missionState?.collectedKeys);
    }
    if (track && track.collectibles) {
      this.drawCollectibles(ctx, track.collectibles, missionState?.collectedItems);
    }

    // 2. Linha de chegada
    if (track && track.finishLine) {
      this.drawFinishLine(ctx, track.finishLine);
    }

    // 3. Paredes da pista com glow neon
    if (track && track.walls) {
      this.drawWalls(ctx, track.walls);
    }

    // 4. Partículas
    this.drawParticles(ctx);

    // 4.5 Corredor-Fantasma / Ghost benchmark (RACE-004, RACE-012, M3-04)
    if (ghostState && ghostState.active) {
      this.drawGhost(ctx, ghostState);
    }

    // 5. Rastro luminoso da nave (trail - VIS-003)
    this.drawShipTrail(ctx, ship.trail, stats.speed);

    // 6. Nave do jogador
    this.drawShip(ctx, ship);

    // 7. Debug overlay (se ativado - PHYS-015)
    if (this.showDebug) {
      this.drawDebug(ctx, ship, stats);
    }

    ctx.restore();
  }

  drawGrid(ctx, camera) {
    const gridSize = 100;
    const startX = Math.floor((camera.x - this.cssWidth) / gridSize) * gridSize;
    const endX = Math.ceil((camera.x + this.cssWidth) / gridSize) * gridSize;
    const startY = Math.floor((camera.y - this.cssHeight) / gridSize) * gridSize;
    const endY = Math.ceil((camera.y + this.cssHeight) / gridSize) * gridSize;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
  }

  drawWalls(ctx, walls) {
    ctx.save();
    ctx.strokeStyle = this.visual.wallColor || '#ff0077';
    ctx.shadowColor = this.visual.wallGlowColor || 'rgba(255, 0, 119, 0.5)';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      ctx.moveTo(w.a.x, w.a.y);
      ctx.lineTo(w.b.x, w.b.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawFinishLine(ctx, line) {
    ctx.save();
    ctx.strokeStyle = this.visual.finishLineColor || '#ffff00';
    ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);

    ctx.beginPath();
    ctx.moveTo(line.a.x, line.a.y);
    ctx.lineTo(line.b.x, line.b.y);
    ctx.stroke();
    ctx.restore();
  }

  drawZones(ctx, zones) {
    if (!Array.isArray(zones)) return;

    for (const zone of zones) {
      const b = zone.bounds;
      if (!b) continue;

      ctx.save();
      if (zone.type === 'turbo') {
        // Zona Turbo: verde limão com setas direcionais (MECH-003, MECH-009)
        ctx.fillStyle = 'rgba(57, 255, 20, 0.12)';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = '#39ff14';
        ctx.shadowColor = 'rgba(57, 255, 20, 0.6)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        // Chevrons direcionais
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.5)';
        ctx.lineWidth = 3;
        const spacing = 50;
        const count = Math.floor(b.width / spacing);
        const midY = b.y + b.height / 2;
        const chevH = Math.min(24, b.height * 0.3);

        ctx.beginPath();
        for (let i = 1; i <= count; i++) {
          const cx = b.x + i * spacing;
          ctx.moveTo(cx - 10, midY - chevH);
          ctx.lineTo(cx + 6, midY);
          ctx.lineTo(cx - 10, midY + chevH);
        }
        ctx.stroke();

        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('TURBO', b.x + 8, b.y + 16);
      } else if (zone.type === 'wind') {
        // Zona de Vento: ciano com fluxo direcional ascendente (MECH-002, MECH-009)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = '#00d4ff';
        ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(b.x, b.y, b.width, b.height);
        ctx.setLineDash([]);

        // Linhas de fluxo de vento
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 2;
        const cols = Math.floor(b.width / 40);
        ctx.beginPath();
        for (let c = 1; c <= cols; c++) {
          const colX = b.x + c * 40;
          ctx.moveTo(colX, b.y + b.height - 15);
          ctx.lineTo(colX, b.y + 20);
          ctx.lineTo(colX - 4, b.y + 28);
          ctx.moveTo(colX, b.y + 20);
          ctx.lineTo(colX + 4, b.y + 28);
        }
        ctx.stroke();

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('VENTO ASCENDENTE', b.x + 8, b.y + 16);
      } else if (zone.type === 'zeroThrust') {
        // Zona de Vácuo / Sem Propulsão: roxo neon com padrão de alerta (MECH-004, MECH-009)
        ctx.fillStyle = 'rgba(160, 32, 240, 0.12)';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = '#b026ff';
        ctx.shadowColor = 'rgba(176, 38, 255, 0.6)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = 'rgba(176, 38, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = b.x; x < b.x + b.width + b.height; x += 30) {
          ctx.moveTo(x, b.y);
          ctx.lineTo(x - b.height, b.y + b.height);
        }
        ctx.stroke();

        ctx.fillStyle = '#b026ff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('VÁCUO (INÉRCIA PURA)', b.x + 8, b.y + 16);
      }
      ctx.restore();
    }
  }

  drawCheckpoints(ctx, checkpoints) {
    if (!Array.isArray(checkpoints)) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);

    for (const cp of checkpoints) {
      ctx.beginPath();
      ctx.moveTo(cp.a.x, cp.a.y);
      ctx.lineTo(cp.b.x, cp.b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDoors(ctx, doors, openDoorsSet = new Set()) {
    if (!Array.isArray(doors)) return;

    const time = performance.now() / 1000;
    ctx.save();

    for (const door of doors) {
      const isOpen = openDoorsSet && openDoorsSet.has(door.id);
      const w = door.wall;
      if (!w || !w.a || !w.b) continue;

      if (isOpen) {
        // Porta aberta: feixe dissipado translúcido
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(w.a.x, w.a.y);
        ctx.lineTo(w.b.x, w.b.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Porta fechada: Barreira laser energizada vibrante (MECH-013)
        const pulse = 0.7 + Math.sin(time * 8) * 0.3;
        const color = door.color || '#ff0055';

        ctx.shadowColor = color;
        ctx.shadowBlur = 14 * pulse;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(w.a.x, w.a.y);
        ctx.lineTo(w.b.x, w.b.y);
        ctx.stroke();

        // Linha de alta intensidade interna
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w.a.x, w.a.y);
        ctx.lineTo(w.b.x, w.b.y);
        ctx.stroke();

        // Terminais emissores nos extremos
        for (const pt of [w.a, w.b]) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  drawKeys(ctx, keys, collectedKeysSet = new Set()) {
    if (!Array.isArray(keys)) return;

    const time = performance.now() / 1000;
    ctx.save();

    for (const key of keys) {
      if (collectedKeysSet && collectedKeysSet.has(key.id)) continue;

      const color = key.color || '#00ffcc';
      const r = key.radius || 16;
      const angle = time * 2.5;

      ctx.save();
      ctx.translate(key.x, key.y);

      // Brilho pulsante
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(0, 30, 40, 0.4)';

      // Prisma losango giratório
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.75, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.75, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Núcleo brilhante
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  drawCollectibles(ctx, collectibles, collectedItemsSet = new Set()) {
    if (!Array.isArray(collectibles)) return;

    const time = performance.now() / 1000;
    ctx.save();

    for (const item of collectibles) {
      const isCollected = collectedItemsSet && collectedItemsSet.has(item.id);
      if (isCollected) continue;

      const r = item.radius || 15;
      const floatY = Math.sin(time * 3 + item.x) * 4;
      const angle = time * 1.5;

      ctx.save();
      ctx.translate(item.x, item.y + floatY);

      // Brilho dourado/neon
      const color = item.color || '#ffea00';
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(40, 35, 0, 0.45)';

      // Octaedro giratório de fragmento de dados
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.rect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
      ctx.fill();
      ctx.stroke();

      // Bit interno
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  drawShipTrail(ctx, trail, speed) {
    if (!trail || trail.length < 2) return;

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    for (let i = 1; i < trail.length; i++) {
      const alpha = (i / trail.length) * 0.45;
      ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawShip(ctx, ship) {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    const color = ship.isWallBoosting ? (this.visual.boostParticleColor || '#39ff14') : (this.visual.shipColor || '#00ffff');
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = ship.isWallBoosting ? 18 : 10;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#080811';

    // Nave triangular minimalista neon (frente apontando para +X)
    const len = ship.radius * 1.5;
    const width = ship.radius * 1.0;

    ctx.beginPath();
    ctx.moveTo(len, 0);                 // Ponta dianteira
    ctx.lineTo(-len * 0.7, width);       // Asa direita
    ctx.lineTo(-len * 0.35, 0);          // Reentrância traseira
    ctx.lineTo(-len * 0.7, -width);      // Asa esquerda
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Pequeno propulsor luminoso interno
    ctx.fillStyle = ship.isWallBoosting ? '#ffffff' : color;
    ctx.beginPath();
    ctx.arc(-len * 0.2, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawGhost(ctx, ghost) {
    if (!ghost || !ghost.active) return;

    ctx.save();
    ctx.translate(ghost.x, ghost.y);
    ctx.rotate(ghost.angle);

    // Efeito etéreo/fantasma translúcido neon (RACE-004, RACE-012)
    const ghostColor = this.visual.ghostColor || 'rgba(0, 240, 255, 0.45)';
    const radius = 12; // raio padrão da nave
    const len = radius * 1.5;
    const width = radius * 1.0;

    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
    ctx.strokeStyle = ghostColor;
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(0, 30, 45, 0.25)';

    // Silhueta da nave fantasma
    ctx.beginPath();
    ctx.moveTo(len, 0);                 // Ponta dianteira
    ctx.lineTo(-len * 0.7, width);       // Asa direita
    ctx.lineTo(-len * 0.35, 0);          // Reentrância traseira
    ctx.lineTo(-len * 0.7, -width);      // Asa esquerda
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Pequeno propulsor etéreo interno
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(-len * 0.2, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawDebug(ctx, ship, stats) {
    ctx.save();
    // Círculo de colisão da nave
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Vetor de velocidade
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.9)';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(ship.x + ship.vx * 0.15, ship.y + ship.vy * 0.15);
    ctx.stroke();
    ctx.restore();
  }
}
