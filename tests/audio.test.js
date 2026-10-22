/**
 * Testes unitários para AudioManager (src/platform/audio.js).
 * Valida a API pública sem depender de Web Audio API real
 * (não disponível no Node.js).
 *
 * Satisfaz: AUDIO-004, AUDIO-005, AUDIO-007.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../src/platform/audio.js';

describe('AudioManager (API e estado sem AudioContext)', () => {
  it('initializes with correct defaults', () => {
    const audio = new AudioManager();
    assert.equal(audio.unlocked, false);
    assert.equal(audio.muted, false);
    assert.equal(audio.ctx, null);
    assert.equal(audio.isReady(), false);
    assert.equal(audio.masterVolume, 0.6);
    assert.equal(audio.musicVolume, 0.35);
    assert.equal(audio.sfxVolume, 0.5);
    assert.equal(audio.synthPlaying, false);
    assert.equal(audio.activeSfxVoices.size, 0);
  });

  it('unlock returns false when Web Audio API is unavailable', () => {
    const audio = new AudioManager();
    // No Node.js, window.AudioContext não existe
    const result = audio.unlock();
    assert.equal(result, false);
    assert.equal(audio.isReady(), false);
  });

  it('playSfx does not throw when audio is not ready', () => {
    const audio = new AudioManager();
    // Todas as chamadas de SFX devem falhar graciosamente
    assert.doesNotThrow(() => audio.playSfx('wallScrape'));
    assert.doesNotThrow(() => audio.playSfx('wallHit'));
    assert.doesNotThrow(() => audio.playSfx('boost'));
    assert.doesNotThrow(() => audio.playSfx('finish'));
    assert.doesNotThrow(() => audio.playSfx('fail'));
    assert.doesNotThrow(() => audio.playSfx('uiClick'));
    assert.doesNotThrow(() => audio.playSfx('uiHover'));
    assert.doesNotThrow(() => audio.playSfx('lap'));
    assert.doesNotThrow(() => audio.playSfx('countdown'));
    assert.doesNotThrow(() => audio.playSfx('unknown_type'));
  });

  it('engine methods do not throw when audio is not ready', () => {
    const audio = new AudioManager();
    assert.doesNotThrow(() => audio.startEngine());
    assert.doesNotThrow(() => audio.stopEngine());
    assert.doesNotThrow(() => audio.updateEngine(500, 750, true));
  });

  it('music methods do not throw when audio is not ready', () => {
    const audio = new AudioManager();
    assert.doesNotThrow(() => audio.startMusic());
    assert.doesNotThrow(() => audio.stopMusic());
    assert.equal(audio.synthPlaying, false); // Não deve iniciar sem contexto
  });

  it('suspend/resume do not throw when audio is not ready', () => {
    const audio = new AudioManager();
    assert.doesNotThrow(() => audio.suspend());
    assert.doesNotThrow(() => audio.resume());
  });

  it('volume setters clamp values between 0 and 1', () => {
    const audio = new AudioManager();
    audio.setMasterVolume(-0.5);
    assert.equal(audio.masterVolume, 0);
    audio.setMasterVolume(1.5);
    assert.equal(audio.masterVolume, 1);
    audio.setMasterVolume(0.7);
    assert.equal(audio.masterVolume, 0.7);

    audio.setMusicVolume(-1);
    assert.equal(audio.musicVolume, 0);
    audio.setMusicVolume(2);
    assert.equal(audio.musicVolume, 1);

    audio.setSfxVolume(-0.1);
    assert.equal(audio.sfxVolume, 0);
    audio.setSfxVolume(1.1);
    assert.equal(audio.sfxVolume, 1);
  });

  it('toggleMute toggles muted state correctly', () => {
    const audio = new AudioManager();
    assert.equal(audio.muted, false);
    const result1 = audio.toggleMute();
    assert.equal(result1, true);
    assert.equal(audio.muted, true);
    const result2 = audio.toggleMute();
    assert.equal(result2, false);
    assert.equal(audio.muted, false);
  });

  it('accepts custom initial options from storage settings', () => {
    const audio = new AudioManager({
      mute: true,
      volume: 0.9,
      musicVolume: 0.2,
      sfxVolume: 0.8
    });
    assert.equal(audio.muted, true);
    assert.equal(audio.masterVolume, 0.9);
    assert.equal(audio.musicVolume, 0.2);
    assert.equal(audio.sfxVolume, 0.8);
  });

  it('dispose cleans up gracefully when not initialized', () => {
    const audio = new AudioManager();
    assert.doesNotThrow(() => audio.dispose());
    assert.equal(audio.unlocked, false);
    assert.equal(audio.ctx, null);
  });
});
