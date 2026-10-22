import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StorageManager, CURRENT_SAVE_VERSION, CURRENT_PHYSICS_VERSION } from '../src/platform/storage.js';

describe('StorageManager', () => {
  it('initializes with default save structure in memory fallback', () => {
    const storage = new StorageManager();
    const data = storage.data;

    assert.equal(data.version, CURRENT_SAVE_VERSION);
    assert.equal(data.physicsVersion, CURRENT_PHYSICS_VERSION);
    assert.ok(Array.isArray(data.unlockedLevels));
    assert.ok(data.unlockedLevels.includes('track-01-proto'));
    assert.deepEqual(data.records, {});
  });

  it('records best time correctly and detects new bests', () => {
    const storage = new StorageManager();

    // Primeira conclusão da fase: 15.4 segundos
    const res1 = storage.recordTime('track-01-proto', 15.4);
    assert.equal(res1.isNewBest, true);
    assert.equal(res1.bestTime, 15.4);
    assert.equal(storage.getBestTime('track-01-proto'), 15.4);

    // Segunda conclusão pior: 16.0 segundos
    const res2 = storage.recordTime('track-01-proto', 16.0);
    assert.equal(res2.isNewBest, false);
    assert.equal(res2.bestTime, 15.4);
    assert.equal(storage.getBestTime('track-01-proto'), 15.4);

    // Terceira conclusão melhor: 13.8 segundos
    const res3 = storage.recordTime('track-01-proto', 13.8);
    assert.equal(res3.isNewBest, true);
    assert.equal(res3.bestTime, 13.8);
    assert.equal(storage.getBestTime('track-01-proto'), 13.8);
  });

  it('handles level unlocking', () => {
    const storage = new StorageManager();

    assert.equal(storage.isLevelUnlocked('track-02-drift'), false);
    const unlocked = storage.unlockLevel('track-02-drift');
    assert.equal(unlocked, true);
    assert.equal(storage.isLevelUnlocked('track-02-drift'), true);

    // Tentar desbloquear novamente não duplica
    const unlockedAgain = storage.unlockLevel('track-02-drift');
    assert.equal(unlockedAgain, false);
  });

  it('handles custom storage backend and corrupted data gracefully', () => {
    const mockStore = {
      _data: {},
      getItem(key) {
        return this._data[key] || null;
      },
      setItem(key, val) {
        this._data[key] = val;
      },
      removeItem(key) {
        delete this._data[key];
      }
    };

    // Injeta JSON corrompido
    mockStore.setItem('test_save', '{ corrupt json ...');
    const storage = new StorageManager({ storageKey: 'test_save', storage: mockStore });

    // Deve recuperar com defaults sem estourar exceção
    assert.equal(storage.data.version, CURRENT_SAVE_VERSION);
    assert.ok(storage.isLevelUnlocked('track-01-proto'));

    // Agora salva dados válidos
    storage.unlockLevel('track-03-loop');
    assert.equal(storage.isLevelUnlocked('track-03-loop'), true);

    // Carrega uma nova instância com o mesmo backend para testar persistência
    const storage2 = new StorageManager({ storageKey: 'test_save', storage: mockStore });
    assert.equal(storage2.isLevelUnlocked('track-03-loop'), true);
  });

  it('manages settings and audio volume persistence cleanly', () => {
    const storage = new StorageManager();
    const settings = storage.getSettings();
    assert.equal(typeof settings.volume, 'number');
    assert.equal(typeof settings.musicVolume, 'number');
    assert.equal(typeof settings.sfxVolume, 'number');
    assert.equal(typeof settings.mute, 'boolean');

    storage.updateSettings({ mute: true, volume: 0.9, musicVolume: 0.2 });
    const updated = storage.getSettings();
    assert.equal(updated.mute, true);
    assert.equal(updated.volume, 0.9);
    assert.equal(updated.musicVolume, 0.2);
  });

  it('tracks seen dialogues accurately without duplicates', () => {
    const storage = new StorageManager();
    assert.equal(storage.isDialogueSeen('intro-01'), false);

    const marked1 = storage.markDialogueSeen('intro-01');
    assert.equal(marked1, true);
    assert.equal(storage.isDialogueSeen('intro-01'), true);

    const marked2 = storage.markDialogueSeen('intro-01');
    assert.equal(marked2, false);
    assert.equal(storage.isDialogueSeen('intro-01'), true);
  });

  it('persists and retrieves ghost replay telemetry along with best time', () => {
    const storage = new StorageManager();
    assert.equal(storage.getGhost('track-01-proto'), null);

    const ghostMock = {
      version: 1,
      trackId: 'track-01-proto',
      duration: 12.4,
      points: [{ t: 0, x: 10, y: 20, a: 0 }]
    };

    // Salva recorde acompanhado da telemetria do ghost
    const res = storage.recordTime('track-01-proto', 12.4, ghostMock);
    assert.equal(res.isNewBest, true);

    const savedGhost = storage.getGhost('track-01-proto');
    assert.ok(savedGhost);
    assert.equal(savedGhost.duration, 12.4);
    assert.equal(savedGhost.points.length, 1);

    // Salva diretamente via saveGhost
    storage.saveGhost('track-02-arc', ghostMock);
    assert.ok(storage.getGhost('track-02-arc'));
  });

  it('resets data cleanly', () => {
    const storage = new StorageManager();
    storage.unlockLevel('track-99');
    storage.recordTime('track-01-proto', 10.0);
    storage.markDialogueSeen('intro-01');

    storage.reset();
    assert.equal(storage.isLevelUnlocked('track-99'), false);
    assert.equal(storage.getBestTime('track-01-proto'), null);
    assert.equal(storage.getGhost('track-01-proto'), null);
    assert.equal(storage.isDialogueSeen('intro-01'), false);
    assert.equal(storage.isLevelUnlocked('track-01-proto'), true);
  });

  it('guarantees complete state persistence and restoration across page reloads (M3-06, SAVE-001, SAVE-006)', () => {
    const mockStorageBackend = {
      _store: {},
      getItem(k) { return this._store[k] || null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; }
    };

    // Sessão 1: jogador avança na campanha, bate recorde, muda configurações e assiste diálogo
    const session1 = new StorageManager({ storageKey: 'save_reload_test', storage: mockStorageBackend });
    session1.unlockLevel('track-02-drift');
    session1.unlockLevel('track-06-gravity');
    session1.recordTime('track-01-proto', 14.25, {
      version: 1,
      trackId: 'track-01-proto',
      duration: 14.25,
      points: [{ t: 0, x: 100, y: 200, a: 0 }, { t: 14.25, x: 2200, y: 550, a: 0 }]
    });
    session1.markDialogueSeen('intro-proto');
    session1.updateSettings({ volume: 0.85, musicVolume: 0.40, showGhost: false });

    // Sessão 2: Simula recarregamento completo da página criando nova instância com o mesmo backend
    const session2 = new StorageManager({ storageKey: 'save_reload_test', storage: mockStorageBackend });

    // Verifica que todo o progresso permanece íntegro após o recarregamento
    assert.equal(session2.isLevelUnlocked('track-02-drift'), true);
    assert.equal(session2.isLevelUnlocked('track-06-gravity'), true);
    assert.equal(session2.getBestTime('track-01-proto'), 14.25);
    const restoredGhost = session2.getGhost('track-01-proto');
    assert.ok(restoredGhost);
    assert.equal(restoredGhost.duration, 14.25);
    assert.equal(restoredGhost.points.length, 2);
    assert.equal(session2.isDialogueSeen('intro-proto'), true);
    const restoredSettings = session2.getSettings();
    assert.equal(restoredSettings.volume, 0.85);
    assert.equal(restoredSettings.musicVolume, 0.40);
    assert.equal(restoredSettings.showGhost, false);
  });

  it('migrates legacy save formats (version 0 / missing fields) without losing existing records (SAVE-002, SAVE-007)', () => {
    const mockStorageBackend = {
      _store: {
        'legacy_save': JSON.stringify({
          version: 0,
          unlockedLevels: ['track-01-proto', 'track-02-drift'],
          records: {
            'track-01-proto': { bestTime: 18.5, achievedAt: 1600000000000 }
          }
          // Campos omitidos intencionalmente: physicsVersion, ghosts, seenDialogues, settings
        })
      },
      getItem(k) { return this._store[k] || null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; }
    };

    const storage = new StorageManager({ storageKey: 'legacy_save', storage: mockStorageBackend });

    // Deve migrar schema mantendo os dados existentes
    assert.equal(storage.data.version, CURRENT_SAVE_VERSION);
    assert.equal(storage.data.physicsVersion, CURRENT_PHYSICS_VERSION);
    assert.equal(storage.isLevelUnlocked('track-01-proto'), true);
    assert.equal(storage.isLevelUnlocked('track-02-drift'), true);
    assert.equal(storage.getBestTime('track-01-proto'), 18.5);

    // Campos ausentes foram preenchidos com padrões seguros
    assert.deepEqual(storage.data.ghosts, {});
    assert.deepEqual(storage.data.seenDialogues, []);
    assert.equal(typeof storage.data.settings.volume, 'number');
    assert.equal(storage.data.settings.showGhost, true);
  });

  it('exports and imports save data cleanly with full round-trip validation (SAVE-008)', () => {
    const storage1 = new StorageManager();
    storage1.unlockLevel('track-07-turbo');
    storage1.recordTime('track-01-proto', 11.88);
    storage1.updateSettings({ mute: true, volume: 0.33 });

    // Exporta para string JSON
    const exportedJson = storage1.exportSave();
    assert.equal(typeof exportedJson, 'string');
    assert.ok(exportedJson.includes('track-07-turbo'));
    assert.ok(exportedJson.includes('11.88'));

    // Importa em outra instância vazia
    const storage2 = new StorageManager();
    const importRes = storage2.importSave(exportedJson);
    assert.equal(importRes.success, true);
    assert.equal(storage2.isLevelUnlocked('track-07-turbo'), true);
    assert.equal(storage2.getBestTime('track-01-proto'), 11.88);
    assert.equal(storage2.getSettings().mute, true);
    assert.equal(storage2.getSettings().volume, 0.33);

    // Tentativa de importar JSON corrompido deve falhar graciosamente
    const badImport = storage2.importSave('not json at all');
    assert.equal(badImport.success, false);
    assert.ok(badImport.error);

    // Tentativa de importar string vazia deve falhar graciosamente
    const emptyImport = storage2.importSave('');
    assert.equal(emptyImport.success, false);
  });
});
