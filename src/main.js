/**
 * Loop principal, máquina de estados, persistência e gerenciamento de fases.
 * Marco M2: Suporte a 5 fases, circuitos com voltas, contra o relógio, atalhos,
 *           seleção de fases e persistência versionada de recordes.
 *
 * Satisfaz: CORE-001, CORE-002, CORE-003, CORE-005, CORE-006, CORE-007,
 *           LEVEL-001, LEVEL-002, LEVEL-003, LEVEL-005, LEVEL-006, LEVEL-008, LEVEL-009,
 *           RACE-001, RACE-002, RACE-003, RACE-006, RACE-010, RACE-011,
 *           UI-001, UI-002, UI-003, UI-004, SAVE-001 a SAVE-007, RESP-001, RESP-010.
 */

import { CONFIG } from './config.js';
import { InputManager } from './core/input.js';
import { PhysicsEngine } from './physics/engine.js';
import { Camera2D } from './gameplay/camera.js';
import { NeonRenderer } from './rendering/renderer.js';
import { TRACKS, getTrackById, getNextTrackId } from './levels/tracks.js';
import { StorageManager } from './platform/storage.js';
import { checkSegmentIntersection } from './physics/collision.js';
import { AudioManager } from './platform/audio.js';
import { getDialogueForTrack } from './gameplay/story.js';
import { GhostRecorder, GhostPlayer } from './gameplay/ghost.js';

export const GameState = {
  MENU: 'MENU',
  LEVEL_SELECT: 'LEVEL_SELECT',
  DIALOGUE: 'DIALOGUE',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  FAILED: 'FAILED'
};

class Game {
  constructor() {
    this.state = GameState.MENU;
    this.storage = new StorageManager();

    // Inicia com a primeira fase
    this.currentTrack = TRACKS[0];

    // Elementos DOM
    this.canvas = document.getElementById('game-canvas');
    this.hudTrackTitle = document.getElementById('hud-track-title');
    this.hudGoal = document.getElementById('hud-goal');
    this.hudTime = document.getElementById('hud-time');
    this.hudSpeed = document.getElementById('hud-speed');
    this.hudDebug = document.getElementById('hud-debug');

    this.menuOverlay = document.getElementById('menu-overlay');
    this.levelSelectOverlay = document.getElementById('level-select-overlay');
    this.levelGrid = document.getElementById('level-grid');
    this.resultOverlay = document.getElementById('result-overlay');
    this.resultTitle = document.getElementById('result-title');
    this.resultTime = document.getElementById('result-time');
    this.resultRecordBadge = document.getElementById('result-record-badge');

    this.btnStart = document.getElementById('btn-start');
    this.btnLevels = document.getElementById('btn-levels');
    this.btnCloseLevels = document.getElementById('btn-close-levels');
    this.btnResetSave = document.getElementById('btn-reset-save');
    this.btnNext = document.getElementById('btn-next');
    this.btnRetry = document.getElementById('btn-retry');
    this.btnLevelsFromResult = document.getElementById('btn-levels-from-result');
    this.btnMenu = document.getElementById('btn-menu');

    // Elementos de HUD e Pausa (CORE-002, UI-002, AUDIO-004)
    this.btnHudPause = document.getElementById('btn-hud-pause');
    this.btnHudMute = document.getElementById('btn-hud-mute');
    this.btnMenuMute = document.getElementById('btn-menu-mute');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.btnResume = document.getElementById('btn-resume');
    this.btnPauseRetry = document.getElementById('btn-pause-retry');
    this.btnPauseLevels = document.getElementById('btn-pause-levels');
    this.btnPauseMenu = document.getElementById('btn-pause-menu');
    this.btnPauseMute = document.getElementById('btn-pause-mute');
    this.btnPauseGhost = document.getElementById('btn-pause-ghost');
    this.sliderMasterVol = document.getElementById('slider-master-vol');
    this.sliderMusicVol = document.getElementById('slider-music-vol');
    this.sliderSfxVol = document.getElementById('slider-sfx-vol');

    // Elementos de Narrativa / Diálogos (NARR-001, NARR-002, NARR-008)
    this.dialogueOverlay = document.getElementById('dialogue-overlay');
    this.dialogueSpeaker = document.getElementById('dialogue-speaker');
    this.dialogueText = document.getElementById('dialogue-text');
    this.btnDialogueSkip = document.getElementById('btn-dialogue-skip');
    this.btnDialogueNext = document.getElementById('btn-dialogue-next');

    this.activeDialogue = null;
    this.dialogueLineIndex = 0;
    this.dialogueOnComplete = null;

    this.touchLeft = document.getElementById('touch-left');
    this.touchRight = document.getElementById('touch-right');

    // Inicialização dos subsistemas com configurações salvas (SAVE-001, AUDIO-004)
    this.input = new InputManager({
      window: window,
      leftTouchEl: this.touchLeft,
      rightTouchEl: this.touchRight
    });

    this.physics = new PhysicsEngine(CONFIG);
    this.camera = new Camera2D(CONFIG);
    this.renderer = new NeonRenderer(this.canvas, CONFIG);
    const savedSettings = this.storage.getSettings();
    this.audio = new AudioManager(savedSettings);

    // Sistema de Fantasma e Replay Pessoal (RACE-004, RACE-012, M3-04)
    this.ghostRecorder = new GhostRecorder();
    this.ghostPlayer = new GhostPlayer();
    this.currentGhostState = null;

    // Estado da corrida
    this.elapsedTime = 0;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.prevShipPos = { x: 0, y: 0 };

    // Suporte a voltas (RACE-002, RACE-011)
    this.currentLap = 1;
    this.checkpointsPassed = new Set();

    // Suporte a missões, chaves/portas e colecionáveis (MECH-006, MECH-013, MECH-015, M4-02)
    this.collectedKeys = new Set();
    this.openDoors = new Set();
    this.collectedItems = new Set();

    // Estado para detecção de SFX de colisão (evitar tocar a cada frame)
    this._prevCollisionType = 'none';
    this._prevBoostState = false;

    this.initUI();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === GameState.PLAYING) {
        this.pause();
      }
    });

    requestAnimationFrame((t) => this.loop(t));
  }

  initUI() {
    // Desbloqueio de áudio no primeiro gesto (AUDIO-005)
    const unlockAudio = () => {
      if (!this.audio.isReady()) {
        this.audio.unlock();
        if (this.audio.isReady()) {
          this.audio.startMusic();
        }
      }
    };
    window.addEventListener('click', unlockAudio, { once: false });
    window.addEventListener('keydown', unlockAudio, { once: false });
    window.addEventListener('pointerdown', unlockAudio, { once: false });

    // Wrapper para SFX de clique em botões
    const withClick = (fn) => () => { this.audio.playSfx('uiClick'); fn(); };

    this.btnStart.addEventListener('click', withClick(() => this.startRace()));
    this.btnLevels.addEventListener('click', withClick(() => this.showLevelSelect()));
    this.btnCloseLevels.addEventListener('click', withClick(() => this.showMenu()));
    this.btnResetSave.addEventListener('click', withClick(() => this.confirmResetProgress()));

    this.btnNext.addEventListener('click', withClick(() => this.startNextLevel()));
    this.btnRetry.addEventListener('click', withClick(() => this.startRace()));
    this.btnLevelsFromResult.addEventListener('click', withClick(() => this.showLevelSelect()));
    this.btnMenu.addEventListener('click', withClick(() => this.showMenu()));

    // Controles de Pausa no HUD e Teclado (CORE-002, UI-002)
    if (this.btnHudPause) {
      this.btnHudPause.addEventListener('click', withClick(() => this.togglePause()));
    }
    if (this.btnResume) {
      this.btnResume.addEventListener('click', withClick(() => this.resume()));
    }
    if (this.btnPauseRetry) {
      this.btnPauseRetry.addEventListener('click', withClick(() => {
        this.resume();
        this.startRace();
      }));
    }
    if (this.btnPauseLevels) {
      this.btnPauseLevels.addEventListener('click', withClick(() => {
        if (this.pauseOverlay) this.pauseOverlay.classList.add('hidden');
        this.showLevelSelect();
      }));
    }
    if (this.btnPauseMenu) {
      this.btnPauseMenu.addEventListener('click', withClick(() => {
        if (this.pauseOverlay) this.pauseOverlay.classList.add('hidden');
        this.showMenu();
      }));
    }

    // Controles de Mudo e Volume (AUDIO-004)
    if (this.btnHudMute) {
      this.btnHudMute.addEventListener('click', () => this.toggleMute());
    }
    if (this.btnMenuMute) {
      this.btnMenuMute.addEventListener('click', () => this.toggleMute());
    }
    if (this.btnPauseMute) {
      this.btnPauseMute.addEventListener('click', () => this.toggleMute());
    }

    if (this.sliderMasterVol) {
      this.sliderMasterVol.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.audio.setMasterVolume(val);
        this.storage.updateSettings({ volume: this.audio.masterVolume });
      });
    }
    if (this.sliderMusicVol) {
      this.sliderMusicVol.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.audio.setMusicVolume(val);
        this.storage.updateSettings({ musicVolume: this.audio.musicVolume });
      });
    }
    if (this.sliderSfxVol) {
      this.sliderSfxVol.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.audio.setSfxVolume(val);
        this.storage.updateSettings({ sfxVolume: this.audio.sfxVolume });
      });
    }

    if (this.btnPauseGhost) {
      this.btnPauseGhost.addEventListener('click', withClick(() => {
        const curSettings = this.storage.getSettings();
        const nextGhost = !curSettings.showGhost;
        this.storage.updateSettings({ showGhost: nextGhost });
        this.updateAudioUI();
        if (!nextGhost) {
          this.ghostPlayer.reset();
          this.currentGhostState = null;
        } else if (this.state === GameState.PLAYING) {
          const savedGhost = this.storage.getGhost(this.currentTrack.id);
          if (savedGhost) {
            this.ghostPlayer.load(savedGhost);
          }
        }
      }));
    }

    // Ações de Diálogo Narrativo (NARR-008)
    if (this.btnDialogueNext) {
      this.btnDialogueNext.addEventListener('click', () => this.advanceDialogue());
    }
    if (this.btnDialogueSkip) {
      this.btnDialogueSkip.addEventListener('click', () => this.skipDialogue());
    }
    if (this.dialogueOverlay) {
      this.dialogueOverlay.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-dialogue-skip') return;
        this.advanceDialogue();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (this.state === GameState.DIALOGUE) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.advanceDialogue();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.skipDialogue();
        }
      }
    });

    // Dica de controle contextual para dispositivos móveis (RESP-007, RESP-012)
    const controlsHint = document.getElementById('controls-hint');
    if (controlsHint && ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))) {
      controlsHint.textContent = 'Toque nos lados da tela para virar · ⏸ pausa no topo';
    }

    this.updateAudioUI();
  }

  handleResize() {
    this.renderer.resize();
  }

  confirmResetProgress() {
    if (confirm('Tem certeza de que deseja resetar todo o progresso e melhores tempos?')) {
      this.storage.reset();
      this.currentTrack = TRACKS[0];
      this.renderLevelGrid();
      alert('Progresso resetado com sucesso.');
    }
  }

  showMenu() {
    this.state = GameState.MENU;
    this.ghostRecorder.cancel();
    this.ghostPlayer.reset();
    this.currentGhostState = null;
    this.menuOverlay.classList.remove('hidden');
    this.levelSelectOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.loadTrack(this.currentTrack);
    this.audio.stopEngine();
    if (this.audio.isReady() && !this.audio.synthPlaying) {
      this.audio.startMusic();
    }
  }

  showLevelSelect() {
    this.state = GameState.LEVEL_SELECT;
    this.ghostRecorder.cancel();
    this.ghostPlayer.reset();
    this.currentGhostState = null;
    this.renderLevelGrid();
    this.menuOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.levelSelectOverlay.classList.remove('hidden');
  }

  renderLevelGrid() {
    this.levelGrid.innerHTML = '';

    for (const track of TRACKS) {
      const isUnlocked = this.storage.isLevelUnlocked(track.id);
      const bestTime = this.storage.getBestTime(track.id);

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? '' : 'locked'}`;

      let typeLabel = 'Percurso Linear';
      if (track.type === 'circuit') typeLabel = `Circuito (${track.lapsRequired} voltas)`;
      if (track.type === 'timeAttack') typeLabel = `Contra o Relógio (${track.timeLimit}s)`;
      if (track.type === 'collect') typeLabel = `Coleta (${(track.collectibles || []).length} fragmentos)`;

      card.innerHTML = `
        <div class="card-title">${track.title}</div>
        <div class="card-subtitle">${typeLabel} · Meta: ${track.targetTime.toFixed(1)}s</div>
        <div class="card-record">${
          isUnlocked
            ? bestTime !== null
              ? `Melhor Tempo: ${bestTime.toFixed(2)}s`
              : 'Disponível (Não Concluído)'
            : 'Bloqueado'
        }</div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.currentTrack = track;
          this.levelSelectOverlay.classList.add('hidden');
          this.startRace();
        });
      }

      this.levelGrid.appendChild(card);
    }
  }

  loadTrack(track) {
    this.currentTrack = track;
    this.physics.resetShip(track.spawn.x, track.spawn.y, track.spawn.angle);
    this.camera.reset(track.spawn.x, track.spawn.y);

    if (this.hudTrackTitle) {
      this.hudTrackTitle.textContent = track.title;
    }
  }

  updateAudioUI() {
    const isMuted = this.audio.muted;
    const icon = isMuted ? '🔇' : '🔊';

    if (this.btnHudMute) {
      this.btnHudMute.textContent = icon;
      this.btnHudMute.title = isMuted ? 'Desmutar Áudio' : 'Mutar Áudio';
    }
    if (this.btnMenuMute) {
      this.btnMenuMute.textContent = `${icon} Áudio: ${isMuted ? 'Mudo' : 'Ativado'}`;
    }
    if (this.btnPauseMute) {
      this.btnPauseMute.textContent = isMuted ? 'Sim' : 'Não';
    }
    if (this.btnPauseGhost) {
      const showGhost = this.storage.getSettings().showGhost !== false;
      this.btnPauseGhost.textContent = showGhost ? 'Sim' : 'Não';
    }

    if (this.sliderMasterVol) {
      this.sliderMasterVol.value = Math.round(this.audio.masterVolume * 100);
    }
    if (this.sliderMusicVol) {
      this.sliderMusicVol.value = Math.round(this.audio.musicVolume * 100);
    }
    if (this.sliderSfxVol) {
      this.sliderSfxVol.value = Math.round(this.audio.sfxVolume * 100);
    }
  }

  toggleMute() {
    const isMuted = this.audio.toggleMute();
    this.storage.updateSettings({ mute: isMuted });
    this.updateAudioUI();
    return isMuted;
  }

  // ─────────────────────────────────────────
  // Sistema de Diálogos Narrativos (NARR-008)
  // ─────────────────────────────────────────

  showDialogue(dialogue, onComplete) {
    this.state = GameState.DIALOGUE;
    this.activeDialogue = dialogue;
    this.dialogueLineIndex = 0;
    this.dialogueOnComplete = onComplete;

    if (this.dialogueSpeaker) {
      this.dialogueSpeaker.textContent = dialogue.speaker || 'KRONA';
    }
    if (this.dialogueText && dialogue.lines && dialogue.lines.length > 0) {
      this.dialogueText.textContent = dialogue.lines[0];
    }
    if (this.dialogueOverlay) {
      this.dialogueOverlay.classList.remove('hidden');
    }
    this.audio.playSfx('dialogue');
  }

  advanceDialogue() {
    if (!this.activeDialogue) return;

    this.dialogueLineIndex++;
    if (this.dialogueLineIndex < this.activeDialogue.lines.length) {
      if (this.dialogueText) {
        this.dialogueText.textContent = this.activeDialogue.lines[this.dialogueLineIndex];
      }
      this.audio.playSfx('dialogue');
    } else {
      this.finishDialogue();
    }
  }

  skipDialogue() {
    this.finishDialogue();
  }

  finishDialogue() {
    if (this.activeDialogue) {
      this.storage.markDialogueSeen(this.activeDialogue.id);
    }
    if (this.dialogueOverlay) {
      this.dialogueOverlay.classList.add('hidden');
    }

    const callback = this.dialogueOnComplete;
    this.activeDialogue = null;
    this.dialogueOnComplete = null;

    if (typeof callback === 'function') {
      callback();
    }
  }

  startRace() {
    this.menuOverlay.classList.add('hidden');
    this.levelSelectOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    if (this.pauseOverlay) this.pauseOverlay.classList.add('hidden');

    this.loadTrack(this.currentTrack);

    // Checar se há diálogo de introdução não visto (NARR-003, NARR-008)
    const introDialogue = getDialogueForTrack(
      this.currentTrack.id,
      'beforeStart',
      (id) => this.storage.isDialogueSeen(id)
    );

    if (introDialogue) {
      this.showDialogue(introDialogue, () => this._startRaceGameplay());
    } else {
      this._startRaceGameplay();
    }
  }

  _startRaceGameplay() {
    this.state = GameState.PLAYING;
    this.elapsedTime = 0;
    this.currentLap = 1;
    this.checkpointsPassed.clear();
    this.collectedKeys.clear();
    this.openDoors.clear();
    this.collectedItems.clear();
    this._prevCollisionType = 'none';
    this._prevBoostState = false;
    this._prevTurboState = false;

    this.prevShipPos = { x: this.physics.ship.x, y: this.physics.ship.y };
    this.input.reset();
    this.updateHUDGoal();

    // Sistema de Fantasma (RACE-004, RACE-012, M3-04)
    this.ghostRecorder.start(
      this.currentTrack.id,
      this.physics.ship.x,
      this.physics.ship.y,
      this.physics.ship.angle
    );

    const savedGhost = this.storage.getGhost(this.currentTrack.id);
    const showGhost = this.storage.getSettings().showGhost !== false;
    if (savedGhost && showGhost) {
      this.ghostPlayer.load(savedGhost);
    } else {
      this.ghostPlayer.reset();
    }
    this.currentGhostState = null;

    // Áudio: parar música de menu, iniciar motor (AUDIO-008)
    this.audio.stopMusic();
    this.audio.startEngine();
    this.audio.resume();
  }

  startNextLevel() {
    const nextId = getNextTrackId(this.currentTrack.id);
    if (nextId) {
      const nextTrack = getTrackById(nextId);
      if (nextTrack) {
        this.currentTrack = nextTrack;
        this.startRace();
        return;
      }
    }
    this.showLevelSelect();
  }

  restartRace() {
    if (this.state === GameState.PLAYING || this.state === GameState.PAUSED || this.state === GameState.FINISHED || this.state === GameState.FAILED) {
      if (this.pauseOverlay) this.pauseOverlay.classList.add('hidden');
      this.startRace();
    }
  }

  pause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.input.reset();
      this.audio.suspend(); // AUDIO-006
      if (this.pauseOverlay) {
        this.pauseOverlay.classList.remove('hidden');
      }
      this.updateAudioUI();
    }
  }

  resume() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.lastTime = performance.now();
      if (this.pauseOverlay) {
        this.pauseOverlay.classList.add('hidden');
      }
      this.audio.resume(); // AUDIO-006
    }
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.pause();
    } else if (this.state === GameState.PAUSED) {
      this.resume();
    }
  }

  finishRace() {
    this.state = GameState.FINISHED;
    const finalTime = this.elapsedTime;

    // Finalizar gravação do ghost (RACE-004, RACE-012, M3-04)
    const ghostData = this.ghostRecorder.finish(
      finalTime,
      this.physics.ship.x,
      this.physics.ship.y,
      this.physics.ship.angle
    );

    // Persiste melhor tempo e ghost no StorageManager (SAVE-001, RACE-004, RACE-012)
    const recordResult = this.storage.recordTime(this.currentTrack.id, finalTime, ghostData);

    // Desbloqueia a próxima fase caso exista (LEVEL-004, SAVE-001)
    const nextId = getNextTrackId(this.currentTrack.id);
    let hasNext = false;
    if (nextId) {
      this.storage.unlockLevel(nextId);
      hasNext = true;
    }

    // Áudio: parar motor, tocar SFX de vitória, retomar música
    this.audio.stopEngine();
    this.audio.playSfx('finish');
    this.audio.startMusic();

    // Checar se há diálogo de conclusão de fase não visto (NARR-003, NARR-008)
    const finishDialogue = getDialogueForTrack(
      this.currentTrack.id,
      'onFinish',
      (id) => this.storage.isDialogueSeen(id)
    );

    if (finishDialogue) {
      this.showDialogue(finishDialogue, () => {
        this._showResultOverlay(finalTime, recordResult, hasNext);
      });
    } else {
      this._showResultOverlay(finalTime, recordResult, hasNext);
    }
  }

  _showResultOverlay(finalTime, recordResult, hasNext) {
    this.resultTitle.textContent = 'Chegada!';
    this.resultTitle.style.color = '#00ff88';
    this.resultTime.textContent = `${finalTime.toFixed(2)}s`;

    if (recordResult.isNewBest) {
      this.resultRecordBadge.textContent = '★ Novo Recorde Local!';
      this.resultRecordBadge.style.display = 'block';
    } else {
      const best = recordResult.bestTime;
      this.resultRecordBadge.textContent = best ? `Melhor: ${best.toFixed(2)}s` : '';
      this.resultRecordBadge.style.display = best ? 'block' : 'none';
    }

    this.btnNext.style.display = hasNext ? 'inline-block' : 'none';
    this.resultOverlay.classList.remove('hidden');
  }

  failRace(reason = 'Tempo Esgotado!') {
    this.state = GameState.FAILED;
    this.ghostRecorder.cancel();
    this.ghostPlayer.reset();
    this.currentGhostState = null;
    this.resultTitle.textContent = reason;
    this.resultTitle.style.color = '#ff3366';
    this.resultTime.textContent = `${this.elapsedTime.toFixed(2)}s`;
    this.resultRecordBadge.style.display = 'none';
    this.btnNext.style.display = 'none';
    this.resultOverlay.classList.remove('hidden');

    // Áudio: parar motor, tocar SFX de falha
    this.audio.stopEngine();
    this.audio.playSfx('fail');
    this.audio.startMusic();
  }

  getActiveWalls() {
    const track = this.currentTrack;
    if (!track.doors || track.doors.length === 0) {
      return track.walls;
    }
    const walls = [...track.walls];
    for (const door of track.doors) {
      if (!this.openDoors.has(door.id) && door.wall) {
        walls.push(door.wall);
      }
    }
    return walls;
  }

  updateHUDGoal() {
    if (!this.hudGoal) return;

    const track = this.currentTrack;
    if (track.type === 'circuit') {
      this.hudGoal.textContent = `Volta ${this.currentLap}/${track.lapsRequired}`;
    } else if (track.type === 'timeAttack') {
      const remaining = Math.max(0, track.timeLimit - this.elapsedTime);
      this.hudGoal.textContent = `${remaining.toFixed(1)}s restantes`;
    } else if (track.type === 'collect') {
      const total = (track.collectibles || []).length;
      this.hudGoal.textContent = `Fragmentos: ${this.collectedItems.size}/${total}`;
    } else if (track.keys && track.keys.length > 0 && this.collectedKeys.size < track.keys.length) {
      this.hudGoal.textContent = 'Pegue a Chave';
    } else {
      this.hudGoal.textContent = 'Chegada';
    }
  }

  loop(currentTime) {
    const rawFrameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const frameTime = Math.min(rawFrameTime, CONFIG.physics.maxFrameTime);

    // Comandos de controle globais
    if (this.input.consumeRestart()) {
      this.restartRace();
    }
    if (this.input.consumePause()) {
      this.togglePause();
    }
    if (this.input.consumeDebugToggle()) {
      this.renderer.showDebug = !this.renderer.showDebug;
      if (this.hudDebug) {
        this.hudDebug.style.display = this.renderer.showDebug ? 'block' : 'none';
      }
    }

    // Atualização física em passo fixo (PHYS-010)
    if (this.state === GameState.PLAYING) {
      this.accumulator += frameTime;
      const fixedDt = CONFIG.physics.dt;
      const track = this.currentTrack;

      while (this.accumulator >= fixedDt) {
        this.prevShipPos = { x: this.physics.ship.x, y: this.physics.ship.y };
        const activeWalls = this.getActiveWalls();

        // Integração física com gravidade, zonas ambientais e barreiras ativas (MECH-001..004, MECH-013)
        this.physics.step(fixedDt, this.input.turn, activeWalls, track);
        this.elapsedTime += fixedDt;

        // Amostragem de telemetria para o Ghost Recorder (RACE-012)
        this.ghostRecorder.record(
          fixedDt,
          this.physics.ship.x,
          this.physics.ship.y,
          this.physics.ship.angle
        );

        // Coleta de Chaves e Abertura de Portas Laser (MECH-013, M4-02)
        if (track.keys) {
          const ship = this.physics.ship;
          for (const key of track.keys) {
            if (!this.collectedKeys.has(key.id)) {
              const dist = Math.hypot(ship.x - key.x, ship.y - key.y);
              if (dist < ship.radius + (key.radius || 18)) {
                this.collectedKeys.add(key.id);
                this.audio.playSfx('boost');
                if (track.doors) {
                  for (const door of track.doors) {
                    if (door.keyId === key.id) {
                      this.openDoors.add(door.id);
                    }
                  }
                }
                this.renderer.addSpark(key.x, key.y, 0, -120, key.color || '#00ffcc', 0.6);
              }
            }
          }
        }

        // Coleta de Fragmentos de Dados (MECH-015, NARR-006, M4-02)
        if (track.collectibles) {
          const ship = this.physics.ship;
          for (const item of track.collectibles) {
            if (!this.collectedItems.has(item.id)) {
              const dist = Math.hypot(ship.x - item.x, ship.y - item.y);
              if (dist < ship.radius + (item.radius || 16)) {
                this.collectedItems.add(item.id);
                this.audio.playSfx('boost');
                this.storage.saveCollectedItem(track.id, item.id);
                this.renderer.addSpark(item.x, item.y, 0, -120, item.color || '#ffea00', 0.5);
              }
            }
          }
        }

        // Limite de tempo no modo Time Attack (LEVEL-003, RACE-003)
        if (track.type === 'timeAttack' && this.elapsedTime >= track.timeLimit) {
          this.failRace('Tempo Esgotado!');
          this.accumulator = 0;
          break;
        }

        // Checagem de Checkpoints intermediários em circuitos (RACE-011)
        if (track.type === 'circuit' && track.checkpoints) {
          for (const cp of track.checkpoints) {
            const hitCp = checkSegmentIntersection(
              this.prevShipPos,
              this.physics.ship,
              cp.a,
              cp.b
            );
            if (hitCp) {
              this.checkpointsPassed.add(cp.id);
            }
          }
        }

        // Checagem de Linha de Chegada / Volta
        if (track.finishLine) {
          const crossed = checkSegmentIntersection(
            this.prevShipPos,
            this.physics.ship,
            track.finishLine.a,
            track.finishLine.b
          );

          if (crossed) {
            if (track.type === 'circuit') {
              // Exige ter passado pelos checkpoints do circuito antes de validar volta
              const requiredCheckpoints = (track.checkpoints || []).length;
              if (this.checkpointsPassed.size >= requiredCheckpoints) {
                if (this.currentLap >= track.lapsRequired) {
                  this.finishRace();
                  this.accumulator = 0;
                  break;
                } else {
                  this.currentLap += 1;
                  this.checkpointsPassed.clear();
                  this.audio.playSfx('lap');
                }
              }
            } else if (track.type === 'collect' && track.requireAllCollectibles) {
              const requiredItems = (track.collectibles || []).length;
              if (this.collectedItems.size >= requiredItems) {
                this.finishRace();
                this.accumulator = 0;
                break;
              }
            } else {
              // Percurso linear ou contra o relógio: vitória imediata
              this.finishRace();
              this.accumulator = 0;
              break;
            }
          }
        }

        this.accumulator -= fixedDt;
      }

      // Detecção de transição de colisão para SFX (AUDIO-003)
      const curCollision = this.physics.stats.collisionType;
      const curBoost = this.physics.stats.boostActive;
      const curTurbo = this.physics.stats.inTurbo;

      if (curCollision !== this._prevCollisionType) {
        if (curCollision === 'frontal') {
          this.audio.playSfx('wallHit');
        } else if (curCollision === 'tangential') {
          this.audio.playSfx('wallScrape');
        }
      }
      if (curBoost && !this._prevBoostState) {
        this.audio.playSfx('boost');
      }
      if (curTurbo && !this._prevTurboState) {
        this.audio.playSfx('boost');
      }
      this._prevCollisionType = curCollision;
      this._prevBoostState = curBoost;
      this._prevTurboState = curTurbo;

      // Atualizar pitch do motor (AUDIO-008)
      this.audio.updateEngine(
        this.physics.stats.speed,
        CONFIG.physics.maxSpeed,
        curBoost || curTurbo
      );

      this.updateHUDGoal();
    }

    // Atualização da posição interpolada do fantasma (RACE-004, RACE-012)
    if (this.state === GameState.PLAYING) {
      this.currentGhostState = this.ghostPlayer.update(this.elapsedTime);
    } else {
      this.currentGhostState = null;
    }

    // Atualização da câmera e do renderizador
    this.camera.update(
      this.physics.ship,
      this.renderer.cssWidth,
      this.renderer.cssHeight,
      frameTime
    );

    this.renderer.render(
      this.camera,
      this.currentTrack,
      this.physics,
      frameTime,
      this.currentGhostState,
      {
        openDoors: this.openDoors,
        collectedKeys: this.collectedKeys,
        collectedItems: this.collectedItems
      }
    );

    // Atualização da HUD
    if (this.hudTime) {
      this.hudTime.textContent = this.elapsedTime.toFixed(2);
    }
    if (this.hudSpeed) {
      this.hudSpeed.textContent = Math.round(this.physics.stats.speed);
    }
    if (this.hudDebug && this.renderer.showDebug) {
      const stats = this.physics.stats;
      const ship = this.physics.ship;
      this.hudDebug.textContent = `FPS: ${Math.round(1 / (rawFrameTime || 0.016))}
Fase: ${this.currentTrack.id} (${this.currentTrack.type})
Pos: X ${ship.x.toFixed(1)} | Y ${ship.y.toFixed(1)}
Vel: ${stats.speed.toFixed(1)} px/s
Boost Parede: ${stats.boostActive ? 'SIM' : 'NÃO'}
Turbo: ${stats.inTurbo ? 'SIM' : 'NÃO'}
Vácuo: ${stats.inZeroThrust ? 'SIM' : 'NÃO'}
Gravidade: ${stats.gravity || 0} px/s²
Zonas: ${stats.activeZones.length > 0 ? stats.activeZones.join(', ') : 'NENHUMA'}
Colisão: ${stats.collisionType}
Partículas: ${this.renderer.particles.length}`;
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

if (typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!window.game) {
      window.game = new Game();
    }
  }
}
