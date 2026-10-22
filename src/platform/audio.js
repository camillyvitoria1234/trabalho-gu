/**
 * Motor de áudio procedural 100% autoral usando Web Audio API.
 * Sem assets externos, sem cópia de trilhas ou SFX de referência.
 *
 * Satisfaz: AUDIO-001, AUDIO-003, AUDIO-004, AUDIO-005, AUDIO-006,
 *           AUDIO-007, AUDIO-008.
 */

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const MAX_SIMULTANEOUS_SFX = 8;

// Frequências base para synth (escala menor neon — lá menor pentatônica)
const SYNTH_NOTES = [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63];

// ─────────────────────────────────────────────
// AudioManager
// ─────────────────────────────────────────────

export class AudioManager {
  constructor(options = {}) {
    /** @type {AudioContext|null} */
    this.ctx = null;
    this.unlocked = false;
    this.muted = typeof options.mute === 'boolean' ? options.mute : false;

    // Volumes normalizados 0..1 (AUDIO-004)
    this.masterVolume = typeof options.volume === 'number' ? Math.max(0, Math.min(1, options.volume)) : 0.6;
    this.musicVolume = typeof options.musicVolume === 'number' ? Math.max(0, Math.min(1, options.musicVolume)) : 0.35;
    this.sfxVolume = typeof options.sfxVolume === 'number' ? Math.max(0, Math.min(1, options.sfxVolume)) : 0.5;

    // Gain nodes (criados após unlock)
    /** @type {GainNode|null} */
    this.masterGain = null;
    /** @type {GainNode|null} */
    this.musicGain = null;
    /** @type {GainNode|null} */
    this.sfxGain = null;

    // Motor contínuo (AUDIO-008)
    /** @type {OscillatorNode|null} */
    this.engineOsc = null;
    /** @type {GainNode|null} */
    this.engineGain = null;
    this.engineBaseFreq = 80;
    this.engineTargetFreq = 80;

    // Synth/música procedural (AUDIO-001)
    this.synthPlaying = false;
    this.synthTimerId = null;
    this.synthOscillators = [];

    // Controle de vozes simultâneas (AUDIO-007)
    /** @type {Set<OscillatorNode>} */
    this.activeSfxVoices = new Set();

    // Estado de pausa
    this.wasPausedByVisibility = false;
  }

  // ─────────────────────────────────────────
  // Inicialização e unlock (AUDIO-005)
  // ─────────────────────────────────────────

  /**
   * Tenta criar o AudioContext. Deve ser chamado dentro de um handler
   * de gesto do usuário (click, pointerdown, keydown).
   * @returns {boolean} true se o contexto foi criado/desbloqueado
   */
  unlock() {
    if (this.unlocked && this.ctx) return true;

    try {
      const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AC) {
        return false;
      }

      this.ctx = new AC();

      // Criar cadeia de ganho: oscilador → sfxGain/musicGain → masterGain → destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Resume contexto se estiver suspenso (mobile policy)
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.unlocked = true;
      this._setupVisibilityHandler();
      return true;
    } catch (e) {
      console.warn('[AudioManager] Falha ao inicializar AudioContext:', e);
      return false;
    }
  }

  /**
   * Retorna true se o áudio está pronto para uso.
   */
  isReady() {
    return this.unlocked && this.ctx !== null;
  }

  // ─────────────────────────────────────────
  // Controle de volume (AUDIO-004)
  // ─────────────────────────────────────────

  setMasterVolume(v) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.masterVolume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.masterVolume,
        this.ctx.currentTime,
        0.05
      );
    }
    return this.muted;
  }

  // ─────────────────────────────────────────
  // Motor contínuo (AUDIO-008)
  // ─────────────────────────────────────────

  /**
   * Inicia o som contínuo do motor (oscilador de baixa frequência).
   */
  startEngine() {
    if (!this.isReady() || this.engineOsc) return;

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = this.engineBaseFreq;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.12;

    // Filtro passa-baixa para suavizar o sawtooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 2;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);
    this.engineOsc.start();
  }

  /**
   * Para o motor contínuo.
   */
  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
      } catch (_) { /* já parado */ }
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  /**
   * Atualiza pitch e volume do motor conforme velocidade atual (AUDIO-008).
   * @param {number} speed Velocidade atual em px/s
   * @param {number} maxSpeed Velocidade máxima configurada
   * @param {boolean} boosting Se wall boost está ativo
   */
  updateEngine(speed, maxSpeed, boosting) {
    if (!this.engineOsc || !this.ctx) return;

    const ratio = Math.min(speed / maxSpeed, 1.5);
    // Frequência sobe de 80Hz (parado) até ~240Hz (velocidade máxima)
    const targetFreq = this.engineBaseFreq + ratio * 160;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);

    // Volume sobe levemente com velocidade
    const vol = 0.08 + ratio * 0.12;
    const boostExtra = boosting ? 0.06 : 0;
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(
        Math.min(vol + boostExtra, 0.3),
        this.ctx.currentTime,
        0.08
      );
    }
  }

  // ─────────────────────────────────────────
  // SFX procedurais (AUDIO-003)
  // ─────────────────────────────────────────

  /**
   * Toca um efeito sonoro curto.
   * @param {'wallScrape'|'wallHit'|'boost'|'finish'|'fail'|'uiClick'|'uiHover'|'lap'|'countdown'} type
   */
  playSfx(type) {
    if (!this.isReady()) return;
    if (this.activeSfxVoices.size >= MAX_SIMULTANEOUS_SFX) return; // AUDIO-007

    switch (type) {
      case 'wallScrape': this._sfxWallScrape(); break;
      case 'wallHit': this._sfxWallHit(); break;
      case 'boost': this._sfxBoost(); break;
      case 'finish': this._sfxFinish(); break;
      case 'fail': this._sfxFail(); break;
      case 'uiClick': this._sfxUIClick(); break;
      case 'uiHover': this._sfxUIHover(); break;
      case 'lap': this._sfxLap(); break;
      case 'countdown': this._sfxCountdown(); break;
      default: break;
    }
  }

  /** Raspagem tangencial na parede (faíscas) */
  _sfxWallScrape() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 600 + Math.random() * 400;
    osc.frequency.linearRampToValueAtTime(200, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.15);
  }

  /** Batida frontal (choque forte) */
  _sfxWallHit() {
    const now = this.ctx.currentTime;

    // Ruído simulado com oscilador rápido
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 120;
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.18;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Distorção leve
    const distortion = this.ctx.createWaveShaper();
    distortion.curve = this._makeDistortionCurve(50);
    distortion.oversample = '2x';

    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.3);
  }

  /** Ativação do wall thrust boost (whoosh ascendente) */
  _sfxBoost() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.35);
  }

  /** Chegada / vitória */
  _sfxFinish() {
    const now = this.ctx.currentTime;

    // Arpejo ascendente de 3 notas
    const notes = [440, 554.37, 659.25]; // Lá4, Dó#5, Mi5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      this._trackVoice(osc, i * 0.12 + 0.4);
    });
  }

  /** Falha / tempo esgotado */
  _sfxFail() {
    const now = this.ctx.currentTime;

    // Tom descendente triste
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 440;
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.6);
  }

  /** Clique de botão UI */
  _sfxUIClick() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.06;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.08);
  }

  /** Hover sobre elemento UI */
  _sfxUIHover() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 660;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.03;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.06);
  }

  /** Nova volta completada */
  _sfxLap() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 523.25; // Dó5

    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.25);
  }

  /** Bip de contagem regressiva */
  _sfxCountdown() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    this._trackVoice(osc, 0.1);
  }

  // ─────────────────────────────────────────
  // Synth / música procedural (AUDIO-001)
  // ─────────────────────────────────────────

  /**
   * Inicia a trilha synth procedural autoral.
   * Gera sequências aleatórias em escala pentatônica menor com pads.
   */
  startMusic() {
    if (!this.isReady() || this.synthPlaying) return;
    this.synthPlaying = true;
    this._synthLoop();
  }

  /**
   * Para a trilha synth.
   */
  stopMusic() {
    this.synthPlaying = false;
    if (this.synthTimerId !== null) {
      clearTimeout(this.synthTimerId);
      this.synthTimerId = null;
    }
    // Fade out dos osciladores ativos
    for (const entry of this.synthOscillators) {
      try {
        if (entry.gain) {
          entry.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        }
        setTimeout(() => {
          try { entry.osc.stop(); } catch (_) { /* ok */ }
        }, 200);
      } catch (_) { /* ok */ }
    }
    this.synthOscillators = [];
  }

  /**
   * Loop interno do synth: toca uma nota pad e agenda a próxima.
   */
  _synthLoop() {
    if (!this.synthPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Pad principal: nota aleatória da escala
    const freq = SYNTH_NOTES[Math.floor(Math.random() * SYNTH_NOTES.length)];
    const duration = 1.5 + Math.random() * 2.0; // 1.5–3.5s

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Segundo oscilador detuned para shimmer
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 1.003; // detune ~5 cents

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    // Attack suave
    gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    // Sustain
    gain.gain.setValueAtTime(0.06, now + duration * 0.6);
    // Release
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Filtro para suavidade
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200 + Math.random() * 800;
    filter.Q.value = 0.7;

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);

    const entry = { osc, osc2, gain };
    this.synthOscillators.push(entry);

    // Cleanup após duração
    const cleanupDelay = (duration + 0.2) * 1000;
    setTimeout(() => {
      const idx = this.synthOscillators.indexOf(entry);
      if (idx >= 0) this.synthOscillators.splice(idx, 1);
    }, cleanupDelay);

    // Sub-bass esporádico (1 em 3 chance)
    if (Math.random() < 0.33) {
      this._synthSubBass(freq / 2, duration * 0.8);
    }

    // Agendar próxima nota (overlap parcial para atmosfera contínua)
    const nextDelay = (0.8 + Math.random() * 1.2) * 1000;
    this.synthTimerId = setTimeout(() => this._synthLoop(), nextDelay);
  }

  /**
   * Sub-bass pad para profundidade.
   */
  _synthSubBass(freq, duration) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
    gain.gain.setValueAtTime(0.04, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  // ─────────────────────────────────────────
  // Visibilidade e pausa (AUDIO-006)
  // ─────────────────────────────────────────

  _setupVisibilityHandler() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Suspender contexto para economizar recursos
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend();
          this.wasPausedByVisibility = true;
        }
      } else {
        // Retomar contexto
        if (this.ctx && this.wasPausedByVisibility) {
          this.ctx.resume();
          this.wasPausedByVisibility = false;
        }
      }
    });
  }

  /**
   * Suspende áudio (chamado pela pausa do jogo).
   */
  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  /**
   * Resume áudio (chamado ao despausar).
   */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ─────────────────────────────────────────
  // Utilidades internas
  // ─────────────────────────────────────────

  /**
   * Rastreia voz SFX e limpa após duração (AUDIO-007).
   * @param {OscillatorNode} osc
   * @param {number} duration em segundos
   */
  _trackVoice(osc, duration) {
    this.activeSfxVoices.add(osc);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);

    osc.onended = () => {
      this.activeSfxVoices.delete(osc);
    };
  }

  /**
   * Curva de distorção waveshaper.
   * @param {number} amount Intensidade 0–100
   */
  _makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Limpeza total. Chamado ao destruir a instância.
   */
  dispose() {
    this.stopMusic();
    this.stopEngine();

    for (const osc of this.activeSfxVoices) {
      try { osc.stop(); } catch (_) { /* ok */ }
    }
    this.activeSfxVoices.clear();

    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }

    this.unlocked = false;
  }
}
